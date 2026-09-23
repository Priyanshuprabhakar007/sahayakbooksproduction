import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Sun,
  Moon,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Sliders,
  Maximize2,
  RefreshCw,
  Eye,
  FolderOpen,
  Check,
  Layout,
  ExternalLink,
} from 'lucide-react';
import { uploadFileToR2 } from '../services/r2MediaService';
import { useStore } from '../context/StoreContext';
import { WebsiteSettings } from '../types';

interface AdminWebsiteLogoCardProps {
  settings: WebsiteSettings;
  onChange: (updated: Partial<WebsiteSettings>) => void;
  onSave?: () => void;
}

// Preset vector logos for Sahayak Associates
const LOGO_PRESETS = [
  {
    name: 'Sahayak Academic Crest (Gold SVG)',
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'><rect width='100' height='100' rx='20' fill='%230B192C'/><rect x='4' y='4' width='92' height='92' rx='16' stroke='%23C5A059' stroke-width='2'/><path d='M28 32 C38 28, 50 30, 50 40 L50 75 C50 65, 38 63, 28 67 Z' fill='%23C5A059'/><path d='M72 32 C62 28, 50 30, 50 40 L50 75 C50 65, 62 63, 72 67 Z' fill='%23C5A059' fill-opacity='0.85'/><circle cx='50' cy='32' r='4' fill='%23FAF7F2'/><path d='M50 42 L50 73' stroke='%230B192C' stroke-width='2'/></svg>",
  },
  {
    name: 'Sahayak Minimalist Monogram (Gold & Ivory)',
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120' fill='none'><circle cx='60' cy='60' r='56' stroke='%23C5A059' stroke-width='3' fill='%230B192C'/><text x='60' y='72' font-family='serif' font-size='42' font-weight='bold' fill='%23C5A059' text-anchor='middle'>S</text><path d='M40 86 Q60 96 80 86' stroke='%23C5A059' stroke-width='2' fill='none'/></svg>",
  },
  {
    name: 'Constitutional Dharma Seal (Gold)',
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'><circle cx='50' cy='50' r='45' stroke='%23C5A059' stroke-width='3'/><circle cx='50' cy='50' r='38' stroke='%23C5A059' stroke-width='1' stroke-dasharray='4 2'/><circle cx='50' cy='50' r='10' fill='%23C5A059'/><circle cx='50' cy='50' r='4' fill='%23FAF7F2'/><line x1='50' y1='12' x2='50' y2='88' stroke='%23C5A059' stroke-width='1.5'/><line x1='12' y1='50' x2='88' y2='50' stroke='%23C5A059' stroke-width='1.5'/><line x1='23' y1='23' x2='77' y2='77' stroke='%23C5A059' stroke-width='1.5'/><line x1='77' y1='23' x2='23' y2='77' stroke='%23C5A059' stroke-width='1.5'/></svg>",
  },
];

export const AdminWebsiteLogoCard: React.FC<AdminWebsiteLogoCardProps> = ({
  settings,
  onChange,
  onSave,
}) => {
  const { mediaItems, addMediaItem, showToast, updateSettings } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active logo values with fallbacks
  const currentLogo = settings.mainLogo || settings.logoUrl || settings.darkLogo || '';
  const currentHeight = settings.logoHeight ?? 40;
  const currentPadding = settings.logoPadding ?? 0;

  // Local interaction states
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [urlInput, setUrlInput] = useState(currentLogo.startsWith('data:') ? '' : currentLogo);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewMode, setPreviewMode] = useState<'dark' | 'light' | 'footer'>('dark');
  const [showCheckerboard, setShowCheckerboard] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [detectedDimensions, setDetectedDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Detect image dimensions when logo changes
  useEffect(() => {
    if (!currentLogo) {
      setDetectedDimensions(null);
      setImageError(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      setDetectedDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setImageError(null);
    };
    img.onerror = () => {
      setImageError('Failed to load image asset. Verify the URL or file format.');
      setDetectedDimensions(null);
    };
    img.src = currentLogo;
  }, [currentLogo]);

  // Handle Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processSelectedFile(files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processSelectedFile(files[0]);
    }
  };

  // Process and upload file
  const processSelectedFile = async (file: File) => {
    // Validate formats: PNG, SVG, WEBP, JPEG
    const validMimes = ['image/png', 'image/svg+xml', 'image/webp', 'image/jpeg', 'image/jpg'];
    const validExtensions = ['.png', '.svg', '.webp', '.jpg', '.jpeg'];
    const fileNameLower = file.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => fileNameLower.endsWith(ext));

    if (!validMimes.includes(file.type) && !hasValidExt) {
      setImageError('Invalid file format. Supported formats: PNG, SVG, WEBP, and JPEG.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setImageError('File size exceeds 10MB limit. Please upload an optimized vector or compressed web image.');
      return;
    }

    setImageError(null);
    setIsUploading(true);
    setUploadProgress(15);

    try {
      const uploaded = await uploadFileToR2(file, {
        folder: 'Logos',
        altText: `${settings.brandName} Website Logo`,
        onProgress: (pct) => setUploadProgress(pct),
      });

      const effectiveUrl = uploaded.publicUrl || uploaded.url;

      // Register in catalog media library
      addMediaItem({
        name: uploaded.name || file.name.replace(/\.[^/.]+$/, ''),
        url: effectiveUrl,
        publicUrl: effectiveUrl,
        fileName: uploaded.fileName || file.name,
        originalFileName: file.name,
        objectKey: uploaded.objectKey,
        folder: 'Logos',
        category: 'Branding',
        mimeType: file.type || 'image/png',
        fileSizeBytes: file.size,
        date: new Date().toISOString().split('T')[0],
        altText: `${settings.brandName} Website Logo`,
        storageProvider: uploaded.storageProvider || 'cloudflare-r2',
      });

      // Apply to settings
      onChange({
        mainLogo: effectiveUrl,
        logoUrl: effectiveUrl,
        darkLogo: effectiveUrl,
      });

      showToast('New website logo uploaded and applied successfully!');
    } catch (err: any) {
      setImageError(err.message || 'Error uploading logo file');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Apply manual URL
  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      setImageError('Please enter a valid image URL');
      return;
    }
    setImageError(null);
    onChange({
      mainLogo: urlInput.trim(),
      logoUrl: urlInput.trim(),
      darkLogo: urlInput.trim(),
    });
    showToast('Logo URL applied');
  };

  // Remove/Clear logo
  const handleClearLogo = () => {
    onChange({
      mainLogo: '',
      logoUrl: '',
      darkLogo: '',
    });
    setUrlInput('');
    showToast('Custom logo removed. Default brand typography will display.');
  };

  // Instant direct publish
  const handleDirectPublish = () => {
    updateSettings({
      mainLogo: currentLogo,
      logoUrl: currentLogo,
      darkLogo: currentLogo,
      logoHeight: currentHeight,
      logoPadding: currentPadding,
    });
    setSaveSuccessMsg(true);
    showToast('Brand logo settings saved and published live site-wide!');
    if (onSave) onSave();
    setTimeout(() => setSaveSuccessMsg(false), 3500);
  };

  return (
    <div
      id="brand-website-logo-card"
      className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden"
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0B192C] to-[#152A4A] p-5 text-[#FAF7F2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/30">
              Branding &amp; Identity
            </span>
            {currentLogo ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" />
                Custom Logo Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Default Book Crest
              </span>
            )}
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#FAF7F2] flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#C5A059]" />
            <span>Website Logo Management</span>
          </h3>
          <p className="text-xs text-stone-300 max-w-xl leading-relaxed">
            Configure your brand insignia across the desktop navigation header, mobile drawer menu, and footer.
            Supports direct drag-and-drop file upload, live URL linking, responsive sizing, and dual dark/light previews.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {currentLogo && (
            <button
              type="button"
              onClick={handleClearLogo}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-rose-500/20 text-stone-300 hover:text-rose-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset to default brand emblem"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleDirectPublish}
            className="px-4 py-2 bg-[#C5A059] text-[#0B192C] rounded-xl text-xs font-bold hover:bg-[#b08d48] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save &amp; Publish Live</span>
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Top Control Grid: Upload / URL Mode Tabs + Input controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Upload & Input Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Input Selection Tabs */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'upload'
                      ? 'bg-[#0B192C] text-[#FAF7F2]'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('url')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'url'
                      ? 'bg-[#0B192C] text-[#FAF7F2]'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Live Image URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('presets')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'presets'
                      ? 'bg-[#0B192C] text-[#FAF7F2]'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Presets</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsMediaModalOpen(true)}
                className="text-xs text-[#0B192C] hover:text-[#C5A059] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="Browse existing logos from Media Library"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Media Library</span>
              </button>
            </div>

            {/* TAB 1: Drag-and-Drop Zone */}
            {activeTab === 'upload' && (
              <div className="space-y-3">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[160px] ${
                    isDragging
                      ? 'border-[#C5A059] bg-[#C5A059]/10 ring-4 ring-[#C5A059]/20 scale-[0.99]'
                      : 'border-stone-300 hover:border-[#0B192C] bg-stone-50/70 hover:bg-stone-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.svg,.webp,.jpg,.jpeg,image/png,image/svg+xml,image/webp,image/jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-center text-[#0B192C] mb-3 group-hover:scale-105 transition-transform">
                    {isUploading ? (
                      <RefreshCw className="w-6 h-6 text-[#C5A059] animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6 text-[#0B192C]" />
                    )}
                  </div>

                  <p className="text-sm font-bold text-[#0B192C] mb-1">
                    {isDragging ? 'Drop logo file here to upload' : 'Click to browse or drag & drop file here'}
                  </p>
                  <p className="text-xs text-stone-500 max-w-sm mb-3">
                    High-resolution transparent logos render best on both light and dark backgrounds.
                  </p>

                  {/* Format Tags */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {['PNG', 'SVG', 'WEBP', 'JPEG'].map((fmt) => (
                      <span
                        key={fmt}
                        className="px-2 py-0.5 rounded-md bg-white border border-stone-200 text-[10px] font-mono font-bold text-stone-700"
                      >
                        {fmt}
                      </span>
                    ))}
                    <span className="text-[10px] text-stone-400 font-medium ml-1">Up to 10MB</span>
                  </div>

                  {isUploading && (
                    <div className="w-full max-w-xs mt-4">
                      <div className="flex justify-between text-[11px] text-stone-600 mb-1">
                        <span>Uploading &amp; optimizing asset...</span>
                        <span className="font-mono">{uploadProgress}%</span>
                      </div>
                      <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#C5A059] transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Live URL Input */}
            {activeTab === 'url' && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-stone-700">
                  Direct Image Asset URL (HTTPS or Data URL)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com/assets/logo.svg or /brand/logo.png"
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono text-stone-800 focus:outline-none focus:border-[#0B192C] focus:bg-white transition-colors"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-4 py-2 bg-[#0B192C] text-[#C5A059] rounded-xl text-xs font-bold hover:bg-[#152A4A] transition-colors shrink-0 cursor-pointer"
                  >
                    Apply URL
                  </button>
                </div>
                <p className="text-[11px] text-stone-500">
                  You can paste any hosted PNG, SVG, or WebP URL. The logo will immediately render in the real-time preview.
                </p>
              </div>
            )}

            {/* TAB 3: Curated Presets */}
            {activeTab === 'presets' && (
              <div className="space-y-2">
                <p className="text-xs text-stone-600 font-medium">
                  Choose an official Sahayak Associates academic emblem preset:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {LOGO_PRESETS.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        onChange({
                          mainLogo: preset.url,
                          logoUrl: preset.url,
                          darkLogo: preset.url,
                        });
                        showToast(`Applied preset: ${preset.name}`);
                      }}
                      className="p-3 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 hover:border-[#C5A059] cursor-pointer transition-all flex flex-col items-center text-center gap-2 group"
                    >
                      <div className="w-12 h-12 bg-[#0B192C] rounded-lg p-1.5 flex items-center justify-center border border-[#C5A059]/30 group-hover:scale-105 transition-transform">
                        <img src={preset.url} alt={preset.name} className="max-h-full max-w-full object-contain" />
                      </div>
                      <span className="text-[11px] font-bold text-stone-800 leading-tight">
                        {preset.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Display */}
            {imageError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{imageError}</span>
              </div>
            )}

            {/* DIMENSIONS & SPACING CONTROLS */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#C5A059]" />
                  <span className="text-xs font-bold text-stone-800">
                    Header Dimensions &amp; Alignment Controls
                  </span>
                </div>
                {detectedDimensions && (
                  <span className="text-[10px] font-mono text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200">
                    Source: {detectedDimensions.width} × {detectedDimensions.height}px
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Control 1: Max Height Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-stone-700 flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5 text-stone-400" />
                      <span>Max Height</span>
                    </label>
                    <div className="flex items-center gap-1 font-mono text-xs font-bold text-[#0B192C] bg-white px-2 py-0.5 rounded border border-stone-200">
                      <span>{currentHeight}</span>
                      <span className="text-stone-400 text-[10px]">px</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={24}
                    max={80}
                    step={2}
                    value={currentHeight}
                    onChange={(e) => onChange({ logoHeight: Number(e.target.value) })}
                    className="w-full accent-[#0B192C] cursor-pointer"
                  />

                  {/* Preset Height Buttons */}
                  <div className="flex gap-1.5 pt-0.5">
                    {[
                      { label: '32px', val: 32 },
                      { label: '40px', val: 40 },
                      { label: '48px', val: 48 },
                      { label: '64px', val: 64 },
                    ].map((btn) => (
                      <button
                        key={btn.val}
                        type="button"
                        onClick={() => onChange({ logoHeight: btn.val })}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                          currentHeight === btn.val
                            ? 'bg-[#0B192C] text-[#FAF7F2] border-[#0B192C]'
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Control 2: Padding / Spacing Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-stone-700 flex items-center gap-1.5">
                      <Layout className="w-3.5 h-3.5 text-stone-400" />
                      <span>Padding / Spacing</span>
                    </label>
                    <div className="flex items-center gap-1 font-mono text-xs font-bold text-[#0B192C] bg-white px-2 py-0.5 rounded border border-stone-200">
                      <span>{currentPadding}</span>
                      <span className="text-stone-400 text-[10px]">px</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={20}
                    step={2}
                    value={currentPadding}
                    onChange={(e) => onChange({ logoPadding: Number(e.target.value) })}
                    className="w-full accent-[#0B192C] cursor-pointer"
                  />

                  {/* Preset Padding Buttons */}
                  <div className="flex gap-1.5 pt-0.5">
                    {[
                      { label: 'Flush (0px)', val: 0 },
                      { label: 'Subtle (4px)', val: 4 },
                      { label: 'Medium (8px)', val: 8 },
                      { label: 'Wide (12px)', val: 12 },
                    ].map((btn) => (
                      <button
                        key={btn.val}
                        type="button"
                        onClick={() => onChange({ logoPadding: btn.val })}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                          currentPadding === btn.val
                            ? 'bg-[#0B192C] text-[#FAF7F2] border-[#0B192C]'
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Real-Time Previews (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#C5A059]" />
                <span className="text-xs font-bold text-stone-800">Real-Time Site Preview</span>
              </div>

              {/* Preview Mode Switcher */}
              <div className="flex bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setPreviewMode('dark')}
                  className={`px-2 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                    previewMode === 'dark'
                      ? 'bg-[#0B192C] text-[#FAF7F2] shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Moon className="w-3 h-3 text-[#C5A059]" />
                  <span>Dark Nav</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('light')}
                  className={`px-2 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                    previewMode === 'light'
                      ? 'bg-white text-[#0B192C] shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Sun className="w-3 h-3 text-amber-500" />
                  <span>Light Mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('footer')}
                  className={`px-2 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                    previewMode === 'footer'
                      ? 'bg-[#061120] text-[#FAF7F2] shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span>Footer</span>
                </button>
              </div>
            </div>

            {/* PREVIEW CONTAINER */}
            <div className="rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
              {/* Context bar / Transparency grid toggle */}
              <div className="bg-stone-100 px-3 py-1.5 border-b border-stone-200 flex items-center justify-between text-[11px] text-stone-600">
                <span className="font-semibold">
                  {previewMode === 'dark'
                    ? 'Header Bar (#0B192C Navy)'
                    : previewMode === 'light'
                    ? 'Light Surface (#FAF7F2 Ivory)'
                    : 'Footer (#061120 Midnight)'}
                </span>
                <label className="flex items-center gap-1 cursor-pointer select-none text-[10px]">
                  <input
                    type="checkbox"
                    checked={showCheckerboard}
                    onChange={(e) => setShowCheckerboard(e.target.checked)}
                    className="accent-[#0B192C] rounded"
                  />
                  <span>Alpha Grid</span>
                </label>
              </div>

              {/* Real-time Render Stage */}
              <div
                className={`p-6 flex flex-col justify-center min-h-[220px] transition-colors relative ${
                  previewMode === 'dark'
                    ? 'bg-[#0B192C] text-[#FAF7F2]'
                    : previewMode === 'light'
                    ? 'bg-[#FAF7F2] text-[#0B192C]'
                    : 'bg-[#061120] text-[#FAF7F2]'
                } ${
                  showCheckerboard
                    ? 'bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:12px_12px]'
                    : ''
                }`}
              >
                {/* Simulated Header Navigation Bar */}
                {previewMode === 'dark' && (
                  <div className="w-full border-b border-[#C5A059]/20 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {currentLogo ? (
                          <img
                            src={currentLogo}
                            alt={settings.brandName}
                            style={{
                              maxHeight: `${currentHeight}px`,
                              height: `${currentHeight}px`,
                              padding: `${currentPadding}px`,
                            }}
                            className="w-auto object-contain transition-all duration-200"
                          />
                        ) : (
                          <div
                            style={{
                              maxHeight: `${currentHeight}px`,
                              height: `${currentHeight}px`,
                              width: `${currentHeight}px`,
                            }}
                            className="rounded-lg bg-gradient-to-br from-[#C5A059] to-[#8C6D2D] p-0.5 shadow-md flex items-center justify-center shrink-0"
                          >
                            <span className="font-serif font-bold text-xs text-[#0B192C]">S</span>
                          </div>
                        )}
                        <div>
                          <div className="font-serif text-sm sm:text-base font-bold tracking-wider text-[#FAF7F2]">
                            {settings.brandName.toUpperCase()}
                          </div>
                          <div className="text-[9px] tracking-widest uppercase text-[#C5A059] font-medium">
                            Powered by {settings.parentCompany}
                          </div>
                        </div>
                      </div>

                      {/* Mock Nav Links */}
                      <div className="hidden sm:flex items-center gap-2 text-[10px] text-stone-300">
                        <span className="text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded">Books</span>
                        <span className="hover:text-white">Authors</span>
                        <span className="hover:text-white">Contact</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Simulated Light Mode / Print Surface */}
                {previewMode === 'light' && (
                  <div className="w-full p-4 bg-white rounded-xl border border-stone-200 shadow-xs">
                    <div className="flex items-center gap-3">
                      {currentLogo ? (
                        <img
                          src={currentLogo}
                          alt={settings.brandName}
                          style={{
                            maxHeight: `${currentHeight}px`,
                            height: `${currentHeight}px`,
                            padding: `${currentPadding}px`,
                          }}
                          className="w-auto object-contain transition-all duration-200"
                        />
                      ) : (
                        <div
                          style={{
                            maxHeight: `${currentHeight}px`,
                            height: `${currentHeight}px`,
                            width: `${currentHeight}px`,
                          }}
                          className="rounded-lg bg-[#0B192C] p-0.5 flex items-center justify-center shrink-0"
                        >
                          <span className="font-serif font-bold text-xs text-[#C5A059]">S</span>
                        </div>
                      )}
                      <div>
                        <div className="font-serif text-sm font-bold tracking-wider text-[#0B192C]">
                          {settings.brandName.toUpperCase()}
                        </div>
                        <div className="text-[9px] tracking-widest uppercase text-stone-500 font-medium">
                          Official Publication &amp; Invoices
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Simulated Footer */}
                {previewMode === 'footer' && (
                  <div className="w-full space-y-2">
                    <div className="flex items-center gap-3">
                      {currentLogo ? (
                        <img
                          src={currentLogo}
                          alt={settings.brandName}
                          style={{
                            maxHeight: `${Math.min(currentHeight, 48)}px`,
                            padding: `${currentPadding}px`,
                          }}
                          className="w-auto object-contain transition-all duration-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-[#C5A059] p-0.5 flex items-center justify-center">
                          <span className="font-serif font-bold text-xs text-[#0B192C]">S</span>
                        </div>
                      )}
                      <div>
                        <div className="font-serif text-sm font-bold tracking-wider text-[#FAF7F2]">
                          {settings.brandName.toUpperCase()}
                        </div>
                        <div className="text-[8px] uppercase tracking-widest text-[#C5A059]">
                          {settings.parentCompany}
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-stone-400 max-w-xs">
                      “{settings.tagline}” — Leading academic publications in Indian governance and economics.
                    </p>
                  </div>
                )}
              </div>

              {/* Status info bar */}
              <div className="bg-stone-50 px-3 py-2 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
                <span>
                  Rendered at: <strong className="text-stone-800 font-mono">{currentHeight}px</strong> height •{' '}
                  <strong className="text-stone-800 font-mono">{currentPadding}px</strong> padding
                </span>
                <span className="text-emerald-700 font-medium">Live Storefront Synchronized</span>
              </div>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {saveSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Brand website logo settings successfully synchronized and published site-wide!</span>
          </div>
        )}
      </div>

      {/* MEDIA LIBRARY PICKER MODAL */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-4 bg-[#0B192C] text-[#FAF7F2] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-[#C5A059]" />
                <h4 className="font-serif font-bold text-sm">Select Logo from Media Assets Library</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(false)}
                className="text-stone-400 hover:text-white font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              {mediaItems && mediaItems.filter((m) => m.folder === 'Logos' || m.category === 'Branding').length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {mediaItems
                    .filter((m) => m.folder === 'Logos' || m.category === 'Branding')
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          const url = item.publicUrl || item.url;
                          onChange({
                            mainLogo: url,
                            logoUrl: url,
                            darkLogo: url,
                          });
                          setIsMediaModalOpen(false);
                          showToast(`Applied logo asset: ${item.name}`);
                        }}
                        className="p-3 rounded-xl border border-stone-200 hover:border-[#C5A059] bg-stone-50 hover:bg-stone-100 cursor-pointer flex flex-col items-center gap-2 transition-all group"
                      >
                        <div className="w-16 h-16 bg-[#0B192C] rounded-lg p-2 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <img
                            src={item.publicUrl || item.url}
                            alt={item.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <span className="text-xs font-bold text-stone-800 truncate w-full text-center">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-stone-400">{item.fileSize || 'Image'}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-10 text-stone-500 text-xs">
                  <ImageIcon className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p>No logo items stored in the Media Library yet.</p>
                  <p className="text-stone-400 mt-1">Upload a new PNG, SVG, or WEBP logo using the upload box above.</p>
                </div>
              )}
            </div>

            <div className="p-3 bg-stone-50 border-t border-stone-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(false)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold cursor-pointer transition-colors"
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
