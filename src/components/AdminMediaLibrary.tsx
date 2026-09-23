import React, { useState, useMemo, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { MediaItem, MediaUsage } from '../types';
import { uploadFileToR2, calculateMediaUsage } from '../services/r2MediaService';
import {
  Cloud,
  Upload,
  Search,
  Filter,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Edit2,
  Save,
  X,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Plus,
  Eye,
  Layers,
  Sparkles,
  Link2,
} from 'lucide-react';

export const AdminMediaLibrary: React.FC = () => {
  const {
    mediaItems,
    addMediaItem,
    deleteMediaItem,
    updateBook,
    books,
    authors,
    blogs,
    settings,
    updateSettings,
  } = useStore();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeFormat, setActiveFormat] = useState<string>('all');

  // Selected Item for Inspector Drawer / Modal
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAltText, setEditAltText] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editFolder, setEditFolder] = useState<MediaItem['folder']>('Books');

  // Upload Queue State (Multi-file upload with individual progress)
  interface UploadQueueItem {
    id: string;
    file: File;
    name: string;
    sizeFormatted: string;
    progress: number;
    status: 'queued' | 'uploading' | 'completed' | 'error';
    errorMsg?: string;
    resultUrl?: string;
  }
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Safe Deletion Confirmation Modal
  const [deleteConfirmationItem, setDeleteConfirmationItem] = useState<{
    item: MediaItem;
    usages: MediaUsage[];
  } | null>(null);

  // File Inputs
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Calculate usages for selected item
  const currentUsages = useMemo(() => {
    if (!selectedItem) return [];
    return calculateMediaUsage(selectedItem.url, selectedItem.id, {
      books,
      authors,
      blogs,
      settings,
    });
  }, [selectedItem, books, authors, blogs, settings]);

  // Open Inspector
  const handleSelectAsset = (item: MediaItem) => {
    setSelectedItem(item);
    setEditName(item.name);
    setEditAltText(item.altText || '');
    setEditCaption(item.caption || '');
    setEditFolder(item.folder || 'Books');
    setIsEditingMetadata(false);
  };

  // Copy Public URL
  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Multi-file Upload Handler
  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newQueueItems: UploadQueueItem[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      name: file.name,
      sizeFormatted: `${(file.size / 1024).toFixed(1)} KB`,
      progress: 0,
      status: 'queued',
    }));

    setUploadQueue((prev) => [...newQueueItems, ...prev]);

    // Process files sequentially or in parallel batches
    for (const queueItem of newQueueItems) {
      setUploadQueue((prev) =>
        prev.map((q) => (q.id === queueItem.id ? { ...q, status: 'uploading', progress: 20 } : q))
      );

      const targetFolder =
        activeCategory !== 'all' && ['books', 'authors', 'homepage', 'logos', 'resources'].includes(activeCategory)
          ? (activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1) as MediaItem['folder'])
          : 'Books';

      try {
        const mediaItem = await uploadFileToR2(queueItem.file, {
          folder: targetFolder.toLowerCase(),
          onProgress: (p) => {
            setUploadQueue((prev) =>
              prev.map((q) => (q.id === queueItem.id ? { ...q, progress: Math.max(20, p) } : q))
            );
          },
        });

        addMediaItem(mediaItem);
        setUploadQueue((prev) =>
          prev.map((q) =>
            q.id === queueItem.id
              ? { ...q, status: 'completed', progress: 100, resultUrl: mediaItem.url }
              : q
          )
        );
      } catch (err: any) {
        setUploadQueue((prev) =>
          prev.map((q) =>
            q.id === queueItem.id
              ? { ...q, status: 'error', progress: 0, errorMsg: err?.message || 'Upload failed' }
              : q
          )
        );
      }
    }
  };

  // Replace Asset Handler
  const handleReplaceFile = async (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedItem) return;
    const file = files[0];

    try {
      const newMedia = await uploadFileToR2(file, {
        folder: (selectedItem.folder || 'books').toLowerCase(),
      });

      const oldUrl = selectedItem.url;
      const newUrl = newMedia.url;

      // Update all references in store:
      // 1. Books
      books.forEach((b) => {
        let updated = false;
        const bookCopy = { ...b };
        if (bookCopy.coverImage === oldUrl) {
          bookCopy.coverImage = newUrl;
          updated = true;
        }
        if (bookCopy.backCoverImage === oldUrl) {
          bookCopy.backCoverImage = newUrl;
          updated = true;
        }
        if (bookCopy.spineImage === oldUrl) {
          bookCopy.spineImage = newUrl;
          updated = true;
        }
        if (bookCopy.galleryImages?.includes(oldUrl)) {
          bookCopy.galleryImages = bookCopy.galleryImages.map((g) => (g === oldUrl ? newUrl : g));
          updated = true;
        }
        if (updated) {
          updateBook(bookCopy);
        }
      });

      // 2. Settings / Logos
      if (settings.logoUrl === oldUrl) {
        updateSettings({ logoUrl: newUrl });
      }

      // 3. Add new media item & delete old one
      addMediaItem({
        ...newMedia,
        name: editName || newMedia.name,
        altText: editAltText,
        caption: editCaption,
        folder: selectedItem.folder,
      });
      deleteMediaItem(selectedItem.id);

      setSelectedItem(newMedia);
    } catch (err: any) {
      console.error('Replace file error:', err);
    }
  };

  // Safe Delete Trigger
  const handleInitiateDelete = (item: MediaItem) => {
    const usages = calculateMediaUsage(item.url, item.id, {
      books,
      authors,
      blogs,
      settings,
    });
    setDeleteConfirmationItem({ item, usages });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmationItem) return;
    deleteMediaItem(deleteConfirmationItem.item.id);
    if (selectedItem?.id === deleteConfirmationItem.item.id) {
      setSelectedItem(null);
    }
    setDeleteConfirmationItem(null);
  };

  // Filtered Media
  const filteredMedia = useMemo(() => {
    return (mediaItems || []).filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name?.toLowerCase().includes(q);
        const matchAlt = item.altText?.toLowerCase().includes(q);
        const matchCaption = item.caption?.toLowerCase().includes(q);
        const matchFolder = item.folder?.toLowerCase().includes(q);
        const matchUrl = item.url?.toLowerCase().includes(q);
        if (!matchName && !matchAlt && !matchCaption && !matchFolder && !matchUrl) {
          return false;
        }
      }

      // Category filter
      if (activeCategory !== 'all') {
        const cat = (item.category || item.folder || '').toLowerCase();
        if (cat !== activeCategory.toLowerCase()) {
          return false;
        }
      }

      // Format filter
      if (activeFormat !== 'all') {
        const urlOrMime = (item.mimeType || item.url || '').toLowerCase();
        if (activeFormat === 'png' && !urlOrMime.includes('png')) return false;
        if (activeFormat === 'jpg' && !urlOrMime.includes('jpg') && !urlOrMime.includes('jpeg')) return false;
        if (activeFormat === 'webp' && !urlOrMime.includes('webp')) return false;
        if (activeFormat === 'svg' && !urlOrMime.includes('svg')) return false;
        if (activeFormat === 'pdf' && !urlOrMime.includes('pdf')) return false;
      }

      return true;
    });
  }, [mediaItems, searchQuery, activeCategory, activeFormat]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1">
            <Cloud className="w-4 h-4" />
            <span>Cloudflare R2 Digital Asset Manager</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#0B192C]">
            Media Assets Library ({(mediaItems || []).length} items)
          </h2>
          <p className="text-xs text-stone-500">
            High-performance Cloudflare R2 object storage repository for high-res book covers, author portraits, brand logos, blog art, and PDFs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={multiFileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif,application/pdf"
            className="hidden"
            onChange={(e) => handleUploadFiles(e.target.files)}
          />
          <button
            onClick={() => multiFileInputRef.current?.click()}
            className="px-4 py-2.5 bg-[#0B192C] text-[#C5A059] hover:bg-[#152A4A] rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Upload className="w-4 h-4" />
            <span>Upload to Cloudflare R2</span>
          </button>
        </div>
      </div>

      {/* Multi-file Drag & Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleUploadFiles(e.dataTransfer.files);
        }}
        onClick={() => multiFileInputRef.current?.click()}
        className={`p-6 border-2 border-dashed rounded-3xl cursor-pointer transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isDragging
            ? 'border-[#C5A059] bg-[#C5A059]/10 shadow-lg scale-[1.005]'
            : 'border-stone-300 hover:border-[#C5A059] bg-[#FAF7F2]/80 hover:bg-[#FAF7F2]'
        }`}
      >
        <div className="flex items-center gap-4 text-left">
          <div className="w-14 h-14 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-center text-[#C5A059] shrink-0">
            <Upload className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#0B192C]">
              Drop files here or click to browse (Multi-file upload supported)
            </h4>
            <p className="text-xs text-stone-500 mt-0.5">
              Files are sanitized, compressed, and directly uploaded to Cloudflare R2 bucket. Supports PNG, JPG, WebP, SVG, and PDF.
            </p>
          </div>
        </div>
        <span className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-700 shadow-xs shrink-0">
          Browse Computer
        </span>
      </div>

      {/* Active Upload Queue Progress Cards */}
      {uploadQueue.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-stone-800 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Upload Queue ({uploadQueue.filter((q) => q.status === 'completed').length}/{uploadQueue.length} Finished)</span>
            </span>
            <button
              onClick={() => setUploadQueue([])}
              className="text-[11px] text-stone-400 hover:text-stone-700 font-semibold cursor-pointer"
            >
              Clear Completed
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {uploadQueue.map((q) => (
              <div
                key={q.id}
                className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-2 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="truncate flex-1">
                    <p className="font-bold text-stone-900 truncate" title={q.name}>
                      {q.name}
                    </p>
                    <p className="text-[10px] text-stone-400 font-mono">{q.sizeFormatted}</p>
                  </div>
                  {q.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  {q.status === 'uploading' && <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />}
                  {q.status === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
                </div>

                <div className="space-y-1">
                  <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        q.status === 'completed' ? 'bg-emerald-500' : q.status === 'error' ? 'bg-rose-500' : 'bg-[#0B192C]'
                      }`}
                      style={{ width: `${q.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                    <span>
                      {q.status === 'completed'
                        ? 'Uploaded to Cloudflare R2'
                        : q.status === 'uploading'
                        ? 'Uploading...'
                        : q.status === 'error'
                        ? q.errorMsg || 'Failed'
                        : 'Queued'}
                    </span>
                    <span>{q.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search, Categories, and Format Filters */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search assets by filename, alt text, caption, or folder..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B192C]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Format Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            {['all', 'webp', 'png', 'jpg', 'svg', 'pdf'].map((fmt) => (
              <button
                key={fmt}
                onClick={() => setActiveFormat(fmt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-colors cursor-pointer ${
                  activeFormat === fmt
                    ? 'bg-[#0B192C] text-[#FAF7F2]'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 border-t border-stone-100 pt-3 overflow-x-auto">
          {[
            { id: 'all', label: 'All Media Assets' },
            { id: 'books', label: 'Book Covers & Spreads' },
            { id: 'authors', label: 'Author Portraits' },
            { id: 'homepage', label: 'Homepage Banners' },
            { id: 'logos', label: 'Brand & Emblems' },
            { id: 'resources', label: 'Resources & PDF Documents' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#0B192C] text-[#C5A059] shadow-xs'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid View */}
      {filteredMedia.length === 0 ? (
        <div className="p-12 text-center bg-stone-50 rounded-3xl border border-stone-200 space-y-3">
          <ImageIcon className="w-12 h-12 mx-auto text-stone-300" />
          <h4 className="text-sm font-bold text-stone-700">No media assets match your filter criteria</h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try resetting your search query or upload new images to the Cloudflare R2 bucket.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
              setActiveFormat('all');
            }}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-xl"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => {
            const isR2 = item.isR2 || item.url.includes('r2.dev') || item.url.includes('cloudflarestorage') || item.url.startsWith('https://media.');
            const isSelected = selectedItem?.id === item.id;

            return (
              <div
                key={item.id}
                onClick={() => handleSelectAsset(item)}
                className={`p-3 rounded-2xl bg-white border cursor-pointer group transition-all flex flex-col justify-between space-y-2.5 ${
                  isSelected
                    ? 'border-[#0B192C] ring-2 ring-[#0B192C] shadow-lg'
                    : 'border-stone-200 hover:border-[#C5A059] hover:shadow-md'
                }`}
              >
                {/* Thumbnail */}
                <div className="h-36 w-full rounded-xl overflow-hidden bg-stone-100 relative flex items-center justify-center border border-stone-100">
                  <img
                    src={item.url}
                    alt={item.altText || item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLElement).style.opacity = '0.3';
                    }}
                  />
                  {/* Folder Tag */}
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold rounded-md uppercase font-mono">
                    {item.folder || item.category || 'Books'}
                  </span>

                  {/* Cloudflare R2 Badge */}
                  {isR2 && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-amber-500/90 text-[#0B192C] text-[8px] font-bold rounded-md font-mono flex items-center gap-0.5 shadow-xs">
                      <Cloud className="w-2.5 h-2.5" />
                      <span>R2</span>
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <p className="text-xs font-bold text-stone-900 truncate" title={item.name}>
                    {item.name}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono">
                    <span>{item.dimensions || '800x1200'}</span>
                    <span>{item.size || '340 KB'}</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyUrl(item.url, item.id);
                    }}
                    className="text-[#C5A059] hover:text-[#B08C45] font-bold flex items-center gap-1 cursor-pointer text-[11px]"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInitiateDelete(item);
                    }}
                    className="text-stone-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 cursor-pointer"
                    title="Delete Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Asset Inspector Side Drawer / Modal (When selectedItem is open) */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-end animate-in fade-in">
          <div className="w-full max-w-xl h-full bg-white shadow-2xl overflow-y-auto p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-[#C5A059]" />
                  <h3 className="font-serif text-lg font-bold text-[#0B192C]">
                    Asset Inspector & Usage Details
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Large Image Preview Card */}
              <div className="w-full h-64 rounded-2xl bg-stone-100 border border-stone-200 overflow-hidden relative flex items-center justify-center">
                <img
                  src={selectedItem.url}
                  alt={selectedItem.altText || selectedItem.name}
                  className="w-full h-full object-contain p-2"
                />
                <a
                  href={selectedItem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/70 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md backdrop-blur-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open Full Res</span>
                </a>
              </div>

              {/* URL & Copy Row */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  Public Cloudflare R2 CDN URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={selectedItem.url}
                    className="flex-1 p-2 bg-white border border-stone-200 rounded-xl text-xs font-mono text-stone-700 truncate"
                  />
                  <button
                    onClick={() => handleCopyUrl(selectedItem.url, selectedItem.id)}
                    className="px-3.5 py-2 bg-[#0B192C] text-[#C5A059] text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0"
                  >
                    {copiedId === selectedItem.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === selectedItem.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Metadata Attributes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Folder</span>
                  <span className="font-bold text-stone-800">{selectedItem.folder || 'Books'}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Dimensions</span>
                  <span className="font-mono font-bold text-stone-800">{selectedItem.dimensions || '800x1200'}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Size</span>
                  <span className="font-mono font-bold text-stone-800">{selectedItem.size || '340 KB'}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Storage</span>
                  <span className="font-mono font-bold text-emerald-700">Cloudflare R2</span>
                </div>
              </div>

              {/* Live Media Usage List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0B192C] flex items-center gap-1.5">
                    <Link2 className="w-4 h-4 text-[#C5A059]" />
                    <span>Used Across Storefront ({currentUsages.length} locations)</span>
                  </span>
                </div>

                {currentUsages.length === 0 ? (
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-500">
                    Not currently linked to any published book, blog, or branding setting. Safe to delete or keep as archive.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {currentUsages.map((u, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-[#FAF7F2] rounded-xl border border-stone-200 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-[#0B192C]">{u.title}</span>
                          <span className="text-[11px] text-stone-500 ml-2 font-mono">({u.field})</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-white border border-stone-200 rounded uppercase font-mono text-stone-700">
                          {u.type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Editable Alt Text & Caption Form */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800">Accessibility & SEO Metadata</span>
                </div>

                <div>
                  <label className="block text-stone-600 font-bold mb-1">Display Title / Filename</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-bold mb-1">Alt Text (Screen Readers & SEO)</label>
                  <input
                    type="text"
                    placeholder="e.g. Front cover book of Sandeep Sahni showing gold insignia"
                    value={editAltText}
                    onChange={(e) => setEditAltText(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-bold mb-1">Caption</label>
                  <input
                    type="text"
                    placeholder="Optional public descriptive caption"
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-xl font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="pt-4 border-t border-stone-200 space-y-2">
              <input
                ref={replaceFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleReplaceFile(e.target.files)}
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => replaceFileInputRef.current?.click()}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Replace Image with New Version</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleInitiateDelete(selectedItem)}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Asset</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Safe Deletion Guard Warning Modal */}
      {deleteConfirmationItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-serif text-xl font-bold text-[#0B192C]">
                Delete Media Asset?
              </h3>
              <p className="text-xs text-stone-600">
                Are you sure you want to permanently delete{' '}
                <span className="font-bold text-stone-900">"{deleteConfirmationItem.item.name}"</span> from the Cloudflare R2 bucket?
              </p>
            </div>

            {/* Usage Warning if in use */}
            {deleteConfirmationItem.usages.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Warning: This image is currently in use!</span>
                </div>
                <p className="text-amber-800 text-[11px]">
                  Deleting this file will remove the visual reference in the following {deleteConfirmationItem.usages.length} storefront locations:
                </p>
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {deleteConfirmationItem.usages.map((u, i) => (
                    <div key={i} className="text-[11px] font-semibold text-amber-950 font-mono">
                      • {u.title} ({u.field})
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmationItem(null)}
                className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
