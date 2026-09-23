import React, { useState, useRef } from 'react';
import {
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  FolderOpen,
  Check,
  Cloud,
  Layers,
  Search,
  ExternalLink,
} from 'lucide-react';
import { uploadFileToR2 } from '../services/r2MediaService';
import { useStore } from '../context/StoreContext';
import { MediaItem } from '../types';

export interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onAssetCreated?: (media: MediaItem) => void;
  onUploadStateChange?: (uploading: boolean) => void;
  helperText?: string;
  categoryFolder?: 'books' | 'authors' | 'homepage' | 'logos' | 'blogs' | 'resources' | 'branding' | 'other';
  aspectRatioLabel?: string;
  required?: boolean;
  className?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  onAssetCreated,
  onUploadStateChange,
  helperText,
  categoryFolder = 'books',
  aspectRatioLabel = 'Recommended 3:4 or 1:1 portrait/cover',
  required = false,
  className = '',
}) => {
  const { mediaItems, addMediaItem } = useStore();
  const [activeMode, setActiveMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value && !value.startsWith('data:') ? value : '');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState<string>('all');
  const [librarySearch, setLibrarySearch] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const folderMap: Record<string, MediaItem['folder']> = {
    books: 'Books',
    authors: 'Authors',
    homepage: 'Homepage',
    logos: 'Logos',
    blogs: 'Blogs',
    branding: 'Branding',
    resources: 'Resources',
    other: 'Resources',
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    // MIME type safety validation
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setErrorMessage('Please upload a valid image file (PNG, JPG, WebP, AVIF, SVG).');
      return;
    }

    setErrorMessage(null);
    setIsUploading(true);
    if (onUploadStateChange) onUploadStateChange(true);
    setUploadProgress(10);

    try {
      const targetFolder = folderMap[categoryFolder] || 'Books';
      const uploadedMedia = await uploadFileToR2(file, {
        folder: targetFolder,
        altText: label,
        onProgress: (pct) => setUploadProgress(pct),
      });

      const effectiveUrl = uploadedMedia.publicUrl || uploadedMedia.url;
      onChange(effectiveUrl);

      // Register in global catalog store
      const createdItem = addMediaItem({
        name: uploadedMedia.name || file.name.replace(/\.[^/.]+$/, ''),
        url: effectiveUrl,
        publicUrl: effectiveUrl,
        fileName: uploadedMedia.fileName || file.name,
        originalFileName: file.name,
        objectKey: uploadedMedia.objectKey,
        folder: targetFolder,
        size: uploadedMedia.size,
        fileSize: uploadedMedia.size,
        dimensions: uploadedMedia.dimensions,
        width: uploadedMedia.width,
        height: uploadedMedia.height,
        mimeType: file.type,
        storageProvider: uploadedMedia.storageProvider || 'cloudflare-r2',
        altText: label,
        caption: uploadedMedia.caption || '',
      });

      if (onAssetCreated) {
        onAssetCreated(createdItem);
      }
    } catch (err: any) {
      console.error('R2 Image Upload Failed:', err);
      setErrorMessage(err.message || 'Failed to upload image to Cloudflare R2.');
    } finally {
      setIsUploading(false);
      if (onUploadStateChange) onUploadStateChange(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleUrlApply = () => {
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
  };

  const handleClear = () => {
    onChange('');
    setUrlInput('');
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Filter library items
  const filteredLibrary = (mediaItems || []).filter((item) => {
    const matchesFilter =
      libraryFilter === 'all' ||
      (item.category || item.folder || '').toLowerCase() === libraryFilter.toLowerCase();

    const matchesSearch =
      !librarySearch.trim() ||
      item.name.toLowerCase().includes(librarySearch.toLowerCase()) ||
      (item.altText && item.altText.toLowerCase().includes(librarySearch.toLowerCase())) ||
      (item.folder && item.folder.toLowerCase().includes(librarySearch.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const isCloudflareUrl = value && (value.includes('r2.cloudflarestorage.com') || value.includes('r2.dev') || value.includes('media.'));

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
          <span>{label}</span>
          {required && <span className="text-rose-500 font-mono">*</span>}
          {isCloudflareUrl && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 border border-amber-200 rounded text-[9px] font-bold text-amber-800 font-mono">
              <Cloud className="w-2.5 h-2.5 text-amber-600" />
              <span>R2 STORED</span>
            </span>
          )}
        </label>

        {/* Tab switcher: Upload / URL / Pick from Library */}
        <div className="inline-flex rounded-lg bg-stone-100 p-0.5 text-[11px] font-semibold border border-stone-200">
          <button
            type="button"
            onClick={() => setActiveMode('upload')}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
              activeMode === 'upload' ? 'bg-white text-[#0B192C] shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Upload className="w-3 h-3 text-[#C5A059]" />
            <span>Upload to R2</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('url')}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
              activeMode === 'url' ? 'bg-white text-[#0B192C] shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>Web URL</span>
          </button>
          <button
            type="button"
            onClick={() => setIsLibraryModalOpen(true)}
            className="px-2.5 py-1 rounded-md text-stone-700 hover:text-[#0B192C] transition-colors flex items-center gap-1 cursor-pointer font-bold"
            title="Browse existing media repository assets"
          >
            <FolderOpen className="w-3 h-3 text-[#C5A059]" />
            <span>R2 Media Vault ({(mediaItems || []).length})</span>
          </button>
        </div>
      </div>

      {/* Preview Card (if an image is selected) */}
      {value ? (
        <div className="relative rounded-2xl border border-stone-300 bg-stone-50 p-3 flex items-center gap-4 transition-all">
          <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-stone-200 border border-stone-300 shrink-0 flex items-center justify-center relative shadow-xs group">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            {isCloudflareUrl && (
              <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-[#0B192C]/90 text-[8px] font-bold font-mono text-[#C5A059] rounded">
                R2
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                <Check className="w-2.5 h-2.5" />
                <span>Asset Active</span>
              </span>
              <span className="text-[11px] text-stone-400 font-mono truncate max-w-xs" title={value}>
                {value.startsWith('data:') ? 'Local Base64 Optimized' : value}
              </span>
            </div>

            <p className="text-[11px] text-stone-500">
              {helperText || aspectRatioLabel}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold rounded-lg border border-stone-200 shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isUploading ? 'animate-spin' : ''}`} />
                <span>{isUploading ? 'Uploading...' : 'Replace'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsLibraryModalOpen(true)}
                className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold rounded-lg border border-stone-200 shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <FolderOpen className="w-3 h-3 text-[#C5A059]" />
                <span>Choose From Vault</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                title="Remove Asset Reference"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Upload / Input Zone when no image is selected */
        <div>
          {activeMode === 'upload' ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#C5A059] bg-[#FAF7F2]'
                  : 'border-stone-300 hover:border-[#0B192C] bg-stone-50/70 hover:bg-stone-100/70'
              } ${isUploading ? 'cursor-not-allowed opacity-90' : ''}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/avif,image/svg+xml,image/gif,application/pdf"
                className="hidden"
                disabled={isUploading}
                onChange={(e) => handleFiles(e.target.files)}
              />

              {isUploading ? (
                <div className="py-2 space-y-3 flex flex-col items-center">
                  <div className="w-8 h-8 border-3 border-[#C5A059] border-t-transparent rounded-full animate-spin"></div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-stone-800">
                      Uploading to Cloudflare R2... ({uploadProgress}%)
                    </p>
                    <div className="w-48 h-1.5 bg-stone-200 rounded-full overflow-hidden mx-auto">
                      <div
                        className="h-full bg-[#C5A059] transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 shadow-xs flex items-center justify-center text-[#C5A059]">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-800">
                      Click to Browse or Drag & Drop Image File
                    </p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      PNG, JPG, WebP, AVIF, SVG up to 10MB • {aspectRatioLabel}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://... or Cloudflare R2 Public URL"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleUrlApply();
                    }
                  }}
                  className="flex-1 p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-[#0B192C] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleUrlApply}
                  className="px-4 py-2.5 bg-[#0B192C] text-[#C5A059] text-xs font-bold rounded-xl hover:bg-[#152A4A] cursor-pointer transition-colors shadow-xs"
                >
                  Apply URL
                </button>
              </div>
              <p className="text-[11px] text-stone-400 font-mono">
                Paste direct Cloudflare R2 CDN or external image link.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input for replace action when image is already set */}
      {value && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/avif,image/svg+xml,image/gif,application/pdf"
          className="hidden"
          disabled={isUploading}
          onChange={(e) => handleFiles(e.target.files)}
        />
      )}

      {/* Error Display */}
      {errorMessage && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
          {errorMessage}
        </div>
      )}

      {/* ==================================================== */}
      {/* R2 MEDIA ASSET PICKER MODAL */}
      {/* ==================================================== */}
      {isLibraryModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsLibraryModalOpen(false)}
        >
          <div
            className="w-full max-w-3xl bg-white rounded-3xl p-6 space-y-4 border border-stone-300 shadow-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#0B192C] flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-[#C5A059]" />
                  <span>Cloudflare R2 Media Vault</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Select previously uploaded covers, portraits, logos, and high-resolution assets.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLibraryModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 font-bold p-1 text-sm cursor-pointer rounded-full hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            {/* Search and Category Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search assets by title, alt text, or folder..."
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {['all', 'books', 'authors', 'homepage', 'logos', 'blogs', 'resources'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setLibraryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize cursor-pointer transition-colors whitespace-nowrap ${
                      libraryFilter === cat
                        ? 'bg-[#0B192C] text-[#FAF7F2] shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of assets */}
            {filteredLibrary.length === 0 ? (
              <div className="py-12 text-center text-stone-400 space-y-2">
                <ImageIcon className="w-8 h-8 mx-auto text-stone-300" />
                <p className="text-xs font-bold text-stone-600">No assets match your search criteria.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
                {filteredLibrary.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onChange(item.publicUrl || item.url);
                      setIsLibraryModalOpen(false);
                    }}
                    className={`group relative rounded-2xl border p-2 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between ${
                      value === item.url || value === item.publicUrl
                        ? 'border-[#C5A059] bg-[#FAF7F2] ring-2 ring-[#C5A059]'
                        : 'border-stone-200 bg-stone-50 hover:border-stone-400 hover:bg-white'
                    }`}
                  >
                    <div className="h-28 w-full rounded-xl overflow-hidden bg-stone-200 relative mb-2 flex items-center justify-center">
                      <img
                        src={item.publicUrl || item.url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      {(value === item.url || value === item.publicUrl) && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-[#C5A059] text-white rounded-full flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold rounded uppercase font-mono">
                        {item.folder || item.category || 'Asset'}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-bold text-stone-900 truncate" title={item.name}>
                        {item.name}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono">
                        <span>{item.dimensions || '800x1200'}</span>
                        <span>{item.size || '340 KB'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-stone-200 text-xs">
              <span className="text-stone-400 font-mono">
                {filteredLibrary.length} Cloudflare R2 asset{filteredLibrary.length === 1 ? '' : 's'} available
              </span>
              <button
                type="button"
                onClick={() => setIsLibraryModalOpen(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Aliased export for MediaPicker
export const MediaPicker = ImageUploadField;
