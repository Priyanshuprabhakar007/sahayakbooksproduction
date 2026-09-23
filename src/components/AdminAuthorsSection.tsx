import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Author, Book, MediaItem } from '../types';
import { uploadFileToR2 } from '../services/r2MediaService';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  BookOpen,
  ArrowLeft,
  RefreshCw,
  Award,
  Globe,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  ShieldCheck,
  Tag,
  FileText,
  Star,
  Check,
  Eye,
  Clock,
  Sparkles,
} from 'lucide-react';

const DEFAULT_AUTHOR_AVATAR =
  'https://pub-d7c01d3edc7e4dbab0acb59d64c988a8.r2.dev/sahayak/authors/default-author.png';

export const AdminAuthorsSection: React.FC = () => {
  const {
    authors,
    books,
    mediaItems,
    addAuthor,
    updateAuthor,
    deleteAuthor,
    updateBook,
    addMediaItem,
    navigate,
    currentPath,
    adminUser,
  } = useStore();

  // Mode: list, new, or edit
  const [mode, setMode] = useState<'list' | 'new' | 'edit'>('list');
  const [authorSearch, setAuthorSearch] = useState('');
  const [editingAuthor, setEditingAuthor] = useState<Partial<Author> | null>(null);

  // Image Upload & Selection State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Media Library Modal
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerCategory, setMediaPickerCategory] = useState<string>('authors');
  const [mediaPickerSearch, setMediaPickerSearch] = useState<string>('');

  // Delete Confirmation Modal
  const [deleteTargetAuthor, setDeleteTargetAuthor] = useState<Author | null>(null);

  // Dynamic Array Inputs for Form
  const [qualificationInput, setQualificationInput] = useState('');
  const [expertiseInput, setExpertiseInput] = useState('');

  // Linked Books Selection State
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize Mode with URL subpaths (/admin/authors, /admin/authors/new, /admin/authors/:id/edit)
  useEffect(() => {
    if (currentPath === '/admin/authors/new') {
      handleOpenNewAuthor();
    } else if (currentPath.startsWith('/admin/authors/') && currentPath.endsWith('/edit')) {
      const parts = currentPath.split('/');
      const authorId = parts[3];
      const found = authors.find((a) => a.id === authorId || a.slug === authorId);
      if (found) {
        handleOpenEditAuthor(found);
      } else {
        setMode('list');
      }
    } else if (currentPath === '/admin/authors') {
      setMode('list');
    }
  }, [currentPath, authors]);

  // Handle open New Author form
  const handleOpenNewAuthor = () => {
    setEditingAuthor({
      name: '',
      slug: '',
      title: 'Author & Financial Educator',
      avatar: DEFAULT_AUTHOR_AVATAR,
      profileMediaId: undefined,
      bio: '',
      biography: '',
      qualifications: ['B.Com (Hons)', 'Certified Financial Planner (CFP)'],
      expertise: ['Financial Planning', 'Personal Finance', 'Retirement Strategies'],
      socialLinks: {
        website: 'https://sahayakassociates.org',
        linkedin: '',
        twitter: '',
        instagram: '',
        youtube: '',
        facebook: '',
      },
      status: 'published',
      isFeatured: true,
      imageAltText: '',
      seoTitle: '',
      metaDescription: '',
      publishedBookCount: 0,
      articlesCount: 0,
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setStatusMessage(null);
    setSelectedBookIds([]);
    setMode('new');
  };

  // Handle open Edit Author form
  const handleOpenEditAuthor = (author: Author) => {
    setEditingAuthor({ ...author });
    setSelectedFile(null);
    setPreviewUrl(author.avatar || DEFAULT_AUTHOR_AVATAR);
    setStatusMessage(null);

    // Collect book IDs linked to this author
    const linkedIds = books
      .filter((b) => b.authorId === author.id || b.authorName?.toLowerCase() === author.name.toLowerCase())
      .map((b) => b.id);
    setSelectedBookIds(linkedIds);

    setMode('edit');
  };

  // Drag and drop state
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // File Validation and Processing Helper
  const processSelectedFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setStatusMessage({
        type: 'error',
        text: 'File size exceeds 10MB limit. Please select a smaller photo.',
      });
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setStatusMessage({
        type: 'error',
        text: 'Unsupported image format. Allowed: JPG, PNG, WebP, AVIF, SVG.',
      });
      return;
    }

    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setStatusMessage({
      type: 'info',
      text: `Photo "${file.name}" selected (${(file.size / (1024 * 1024)).toFixed(2)} MB). Click "Save Author Profile" or "Upload & Use Photo" to upload to Cloudflare R2.`,
    });
  };

  // Handle File Selection for Image Upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processSelectedFile(file);
  };

  // Remove Photo Handler
  const handleRemovePhoto = () => {
    if (window.confirm('Remove this author profile photo and revert to default avatar?')) {
      setSelectedFile(null);
      setPreviewUrl(DEFAULT_AUTHOR_AVATAR);
      if (editingAuthor) {
        setEditingAuthor({
          ...editingAuthor,
          avatar: DEFAULT_AUTHOR_AVATAR,
          profileMediaId: undefined,
          profileMedia: undefined,
        });
      }
      setStatusMessage({
        type: 'info',
        text: 'Author profile photo removed. Default avatar assigned.',
      });
    }
  };

  // Selecting media from Media Library
  const handleSelectMediaFromLibrary = (media: MediaItem) => {
    setSelectedFile(null);
    setPreviewUrl(media.publicUrl);
    if (editingAuthor) {
      setEditingAuthor({
        ...editingAuthor,
        avatar: media.publicUrl,
        profileMediaId: media.id,
        profileMedia: media,
        imageAltText: media.altText || editingAuthor.imageAltText || `${editingAuthor.name} portrait`,
      });
    }
    setIsMediaPickerOpen(false);
    setStatusMessage({
      type: 'success',
      text: `Selected asset "${media.originalFileName || media.originalFilename || media.id}" from Cloudflare R2 Media Library.`,
    });
  };

  // Qualifications Add/Remove
  const handleAddQualification = () => {
    if (!qualificationInput.trim() || !editingAuthor) return;
    const current = editingAuthor.qualifications || [];
    setEditingAuthor({
      ...editingAuthor,
      qualifications: [...current, qualificationInput.trim()],
    });
    setQualificationInput('');
  };

  const handleRemoveQualification = (index: number) => {
    if (!editingAuthor) return;
    const current = editingAuthor.qualifications || [];
    setEditingAuthor({
      ...editingAuthor,
      qualifications: current.filter((_, i) => i !== index),
    });
  };

  // Expertise Add/Remove
  const handleAddExpertise = () => {
    if (!expertiseInput.trim() || !editingAuthor) return;
    const current = editingAuthor.expertise || [];
    setEditingAuthor({
      ...editingAuthor,
      expertise: [...current, expertiseInput.trim()],
    });
    setExpertiseInput('');
  };

  const handleRemoveExpertise = (index: number) => {
    if (!editingAuthor) return;
    const current = editingAuthor.expertise || [];
    setEditingAuthor({
      ...editingAuthor,
      expertise: current.filter((_, i) => i !== index),
    });
  };

  // Toggle Linked Book
  const handleToggleBookLink = (bookId: string) => {
    setSelectedBookIds((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  // Save Author Handler
  const handleSaveAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAuthor || !editingAuthor.name?.trim()) {
      setStatusMessage({ type: 'error', text: 'Author name is required.' });
      return;
    }

    const cleanName = editingAuthor.name.trim();
    const slug =
      editingAuthor.slug?.trim() ||
      cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const authorId = editingAuthor.id || `author-${Date.now()}`;
    let finalAvatar = editingAuthor.avatar || DEFAULT_AUTHOR_AVATAR;
    let finalMediaId = editingAuthor.profileMediaId;
    let finalMediaItem = editingAuthor.profileMedia;

    // 1. Process R2 Upload if a file is selected
    if (selectedFile) {
      setIsUploading(true);
      setUploadProgress(20);
      try {
        const folderPath = `authors/${slug}`;
        const alt = editingAuthor.imageAltText || `${cleanName} — Author Profile Photo`;

        const uploadedMedia = await uploadFileToR2(selectedFile, {
          folder: folderPath,
          altText: alt,
          caption: `${cleanName} official author portrait`,
          uploadedBy: adminUser?.name || 'Administrative Officer',
          onProgress: (p) => setUploadProgress(p),
        });

        // Add media item to state
        addMediaItem(uploadedMedia);

        finalAvatar = uploadedMedia.publicUrl;
        finalMediaId = uploadedMedia.id;
        finalMediaItem = uploadedMedia;

        setStatusMessage({
          type: 'success',
          text: 'Image uploaded successfully to Cloudflare R2 permanent storage.',
        });
      } catch (err: any) {
        setIsUploading(false);
        setStatusMessage({
          type: 'error',
          text: `R2 Upload Failed: ${err.message || 'Check network connection'}. Previous image preserved.`,
        });
        return;
      } finally {
        setIsUploading(false);
      }
    }

    // 2. Construct Final Author Payload
    const payload: Author = {
      id: authorId,
      name: cleanName,
      slug,
      title: editingAuthor.title?.trim() || 'Author & Educator',
      avatar: finalAvatar,
      profileMediaId: finalMediaId,
      profileMedia: finalMediaItem,
      bio: editingAuthor.bio?.trim() || '',
      biography: editingAuthor.biography?.trim() || editingAuthor.bio?.trim() || '',
      qualifications: editingAuthor.qualifications || [],
      expertise: editingAuthor.expertise || [],
      email: editingAuthor.email?.trim() || '',
      phone: editingAuthor.phone?.trim() || '',
      status: editingAuthor.status || 'published',
      isFeatured: editingAuthor.isFeatured ?? true,
      imageAltText: editingAuthor.imageAltText || `${cleanName} — Author Portrait`,
      seoTitle: editingAuthor.seoTitle || `${cleanName} | Author Profile | Sahayak Associates`,
      metaDescription:
        editingAuthor.metaDescription || `Read biography and research publications by ${cleanName}.`,
      socialLinks: {
        website: editingAuthor.socialLinks?.website || '',
        linkedin: editingAuthor.socialLinks?.linkedin || '',
        twitter: editingAuthor.socialLinks?.twitter || '',
        instagram: editingAuthor.socialLinks?.instagram || '',
        youtube: editingAuthor.socialLinks?.youtube || '',
        facebook: editingAuthor.socialLinks?.facebook || '',
      },
      publishedBookCount: Math.max(selectedBookIds.length, editingAuthor.publishedBookCount || 0),
      articlesCount: editingAuthor.articlesCount || 0,
      updatedAt: new Date().toISOString(),
      createdAt: editingAuthor.createdAt || new Date().toISOString(),
    };

    // 3. Save Author to Database / Context
    if (editingAuthor.id) {
      updateAuthor(payload);
    } else {
      addAuthor(payload);
    }

    // 4. Synchronize Linked Books
    books.forEach((b) => {
      const isCurrentlyLinked = selectedBookIds.includes(b.id);
      const isAuthorAssigned = b.authorId === authorId;

      if (isCurrentlyLinked && !isAuthorAssigned) {
        updateBook({ ...b, authorId, authorName: cleanName });
      } else if (!isCurrentlyLinked && isAuthorAssigned) {
        updateBook({ ...b, authorId: 'author-unassigned', authorName: 'Sahayak Editorial Board' });
      }
    });

    // Clean up
    setSelectedFile(null);
    setPreviewUrl(null);
    setMode('list');
    navigate('/admin/authors');
  };

  // Delete Author
  const handleConfirmDeleteAuthor = () => {
    if (!deleteTargetAuthor) return;
    deleteAuthor(deleteTargetAuthor.id);
    setDeleteTargetAuthor(null);
  };

  // Filtered authors list
  const filteredAuthors = authors.filter(
    (a) =>
      a.name.toLowerCase().includes(authorSearch.toLowerCase()) ||
      a.title.toLowerCase().includes(authorSearch.toLowerCase()) ||
      a.bio.toLowerCase().includes(authorSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* MODE 1: AUTHORS ROSTER LISTING */}
      {/* ========================================================= */}
      {mode === 'list' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-[#C5A059]" />
                <h2 className="font-serif text-2xl font-bold text-[#0B192C]">
                  Authors & Faculty Directory ({authors.length})
                </h2>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Manage jurist faculty profiles, upload Cloudflare R2 profile portraits, edit biographies & link scholarly publications.
              </p>
            </div>

            <button
              onClick={() => {
                handleOpenNewAuthor();
                navigate('/admin/authors/new');
              }}
              className="px-4 py-2.5 bg-[#0B192C] text-[#C5A059] rounded-xl text-xs font-bold hover:bg-[#152A4A] transition-colors flex items-center gap-1.5 shadow-sm self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Author</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="Search authors by name, title, or biography..."
                value={authorSearch}
                onChange={(e) => setAuthorSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl"
              />
            </div>
          </div>

          {/* Authors Listing Table */}
          <div className="overflow-x-auto rounded-2xl border border-stone-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-100 text-stone-600 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Author Photo</th>
                  <th className="p-3">Author Name & Designation</th>
                  <th className="p-3">Published Books</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Last Updated</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredAuthors.map((author) => {
                  const authorBooksCount = books.filter(
                    (b) => b.authorId === author.id || b.authorName?.toLowerCase().includes(author.name.toLowerCase())
                  ).length;

                  return (
                    <tr key={author.id} className="hover:bg-stone-50 transition-colors">
                      <td className="p-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#C5A059] shadow-sm shrink-0 bg-stone-100">
                          <img
                            src={author.avatar || DEFAULT_AUTHOR_AVATAR}
                            alt={author.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-serif font-bold text-[#0B192C] text-sm">
                          {author.name}
                        </div>
                        <div className="text-[11px] text-[#C5A059] font-medium">{author.title}</div>
                        <div className="text-[10px] text-stone-400 font-mono">/author/{author.slug}</div>
                      </td>
                      <td className="p-3">
                        <span className="font-mono font-bold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-lg">
                          {authorBooksCount} book(s)
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            author.status === 'draft'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {author.status === 'draft' ? 'Draft' : 'Published'}
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-stone-500 font-mono">
                        {author.updatedAt ? new Date(author.updatedAt).toLocaleDateString() : 'Active'}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/author/${author.slug}`)}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 cursor-pointer"
                            title="View Public Profile Page"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              handleOpenEditAuthor(author);
                              navigate(`/admin/authors/${author.id}/edit`);
                            }}
                            className="p-1.5 rounded-lg bg-[#0B192C] hover:bg-[#152A4A] text-[#C5A059] border border-[#C5A059]/30 cursor-pointer"
                            title="Edit Author Details & Photo"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetAuthor(author)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer"
                            title="Delete Author"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 2 & 3: ADD / EDIT AUTHOR FORM */}
      {/* ========================================================= */}
      {(mode === 'new' || mode === 'edit') && editingAuthor && (
        <form onSubmit={handleSaveAuthor} className="space-y-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setMode('list');
                  navigate('/admin/authors');
                }}
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#0B192C]">
                  {mode === 'new' ? 'Create New Author Profile' : `Edit Author: ${editingAuthor.name}`}
                </h2>
                <p className="text-xs text-stone-500">
                  Upload R2 profile photo, manage biography, social handles and assign published books.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode('list');
                  navigate('/admin/authors');
                }}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-5 py-2 bg-[#0B192C] text-[#C5A059] font-bold rounded-xl text-xs hover:bg-[#152A4A] transition-colors flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{isUploading ? `Uploading R2 (${uploadProgress}%)...` : 'Save Author Profile'}</span>
              </button>
            </div>
          </div>

          {/* Notification / Error banner */}
          {statusMessage && (
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-semibold ${
                statusMessage.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {statusMessage.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                )}
                <span>{statusMessage.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusMessage(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* MAIN 2-COLUMN LAYOUT (Req 30: Left Profile Image Card, Right Info) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN: PROFILE IMAGE MANAGEMENT CARD */}
            <div className="space-y-6">
              <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-base font-bold text-[#0B192C] flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#C5A059]" />
                    <span>Author Profile Photo</span>
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0B192C] text-[#C5A059] font-bold">
                    R2 Storage
                  </span>
                </div>

                {/* Photo Preview Container (1:1 Square) with Drag & Drop */}
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
                    const file = e.dataTransfer.files?.[0];
                    if (file) processSelectedFile(file);
                  }}
                  className={`relative group w-48 h-48 mx-auto rounded-2xl overflow-hidden border-2 transition-all shadow-md bg-white flex flex-col items-center justify-center ${
                    isDragging
                      ? 'border-[#C5A059] bg-[#C5A059]/10 scale-105'
                      : 'border-[#C5A059]'
                  }`}
                >
                  <img
                    src={previewUrl || editingAuthor.avatar || DEFAULT_AUTHOR_AVATAR}
                    alt={editingAuthor.name || 'Author photo'}
                    className="w-full h-full object-cover"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2 p-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#C5A059]" />
                      <span className="text-xs font-mono font-bold">Uploading to R2 {uploadProgress}%</span>
                    </div>
                  )}
                </div>

                {/* Selected File Metadata Badge */}
                {selectedFile && (
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1">
                    <div className="font-bold text-amber-900 truncate flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">{selectedFile.name}</span>
                    </div>
                    <div className="text-[10px] text-amber-700 font-mono flex items-center justify-between">
                      <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                      <span>{selectedFile.type.replace('image/', '').toUpperCase()}</span>
                    </div>
                  </div>
                )}

                {/* Alt Text Field */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Image Alt Text (SEO & Accessibility)
                  </label>
                  <input
                    type="text"
                    value={editingAuthor.imageAltText || ''}
                    onChange={(e) => setEditingAuthor({ ...editingAuthor, imageAltText: e.target.value })}
                    placeholder="e.g. Sandeep Sahni — author and financial educator"
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs"
                  />
                </div>

                {/* Photo Management Action Buttons */}
                <div className="space-y-2 pt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <button
                      type="button"
                      onClick={(e) => handleSaveAuthor(e)}
                      disabled={isUploading}
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload & Use Photo</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 bg-[#0B192C] text-[#FAF7F2] hover:bg-[#152A4A] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Upload className="w-4 h-4 text-[#C5A059]" />
                      <span>{previewUrl && previewUrl !== DEFAULT_AUTHOR_AVATAR ? 'Replace Photo' : 'Upload New Photo'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="w-full py-2.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-stone-600" />
                    <span>Choose From Media Library</span>
                  </button>

                  {previewUrl && previewUrl !== DEFAULT_AUTHOR_AVATAR && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Photo</span>
                    </button>
                  )}
                </div>

                <p className="text-[10px] text-stone-500 text-center leading-relaxed">
                  Supported: JPG, PNG, WebP, AVIF, SVG (Max 10MB). Stored permanently in Cloudflare R2 under{' '}
                  <code className="bg-stone-200 px-1 py-0.5 rounded font-mono">
                    sahayak/authors/{editingAuthor.slug || 'slug'}
                  </code>
                </p>
              </div>

              {/* Status & Visibility Card */}
              <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200 space-y-4">
                <h3 className="font-serif text-sm font-bold text-[#0B192C]">Publishing Control</h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Roster Visibility Status</label>
                    <select
                      value={editingAuthor.status || 'published'}
                      onChange={(e) =>
                        setEditingAuthor({ ...editingAuthor, status: e.target.value as 'published' | 'draft' })
                      }
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-semibold"
                    >
                      <option value="published">Published (Visible on Storefront)</option>
                      <option value="draft">Draft (Hidden from Public)</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingAuthor.isFeatured ?? true}
                      onChange={(e) => setEditingAuthor({ ...editingAuthor, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded text-[#0B192C] focus:ring-[#C5A059]"
                    />
                    <span className="font-bold text-stone-800">Featured Author Spotlight</span>
                  </label>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: MAIN AUTHOR FIELDS */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200 space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#0B192C]">1. Basic Author Profile</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Full Author Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editingAuthor.name || ''}
                      onChange={(e) => setEditingAuthor({ ...editingAuthor, name: e.target.value })}
                      placeholder="e.g. Sandeep Sahni"
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">URL Slug</label>
                    <input
                      type="text"
                      value={editingAuthor.slug || ''}
                      onChange={(e) => setEditingAuthor({ ...editingAuthor, slug: e.target.value })}
                      placeholder="sandeep-sahni"
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-stone-700 mb-1">
                      Designation / Faculty Title
                    </label>
                    <input
                      type="text"
                      value={editingAuthor.title || ''}
                      onChange={(e) => setEditingAuthor({ ...editingAuthor, title: e.target.value })}
                      placeholder="e.g. Financial Educator & Author"
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Email Address (Optional)</label>
                    <input
                      type="email"
                      value={editingAuthor.email || ''}
                      onChange={(e) => setEditingAuthor({ ...editingAuthor, email: e.target.value })}
                      placeholder="sandeep.sahni@sahayakassociates.org"
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Phone Number (Optional)</label>
                    <input
                      type="text"
                      value={editingAuthor.phone || ''}
                      onChange={(e) => setEditingAuthor({ ...editingAuthor, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Biography Section */}
              <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200 space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#0B192C]">2. Biographies & Excerpts</h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Short Bio (Display on Cards & Hover Dossiers)
                    </label>
                    <textarea
                      rows={2}
                      value={editingAuthor.bio || ''}
                      onChange={(e) => setEditingAuthor({ ...editingAuthor, bio: e.target.value })}
                      placeholder="Brief 2-3 sentence overview of qualifications and books..."
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Full Biography (Display on Dedicated /author/[slug] Profile Page)
                    </label>
                    <textarea
                      rows={6}
                      value={editingAuthor.biography || ''}
                      onChange={(e) => setEditingAuthor({ ...editingAuthor, biography: e.target.value })}
                      placeholder="Comprehensive career trajectory, publications history, appointments and academic contributions..."
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Qualifications & Expertise */}
              <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200 space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#0B192C]">
                  3. Academic Credentials & Expertise
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  {/* Qualifications */}
                  <div className="space-y-2">
                    <label className="block font-bold text-stone-700">Degrees & Qualifications</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={qualificationInput}
                        onChange={(e) => setQualificationInput(e.target.value)}
                        placeholder="e.g. Certified Financial Planner (CFP)"
                        className="flex-1 p-2 bg-white border border-stone-300 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={handleAddQualification}
                        className="px-3 py-2 bg-[#0B192C] text-[#C5A059] font-bold rounded-xl"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(editingAuthor.qualifications || []).map((q, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-white border border-stone-300 text-stone-800 flex items-center gap-1.5"
                        >
                          <span>{q}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveQualification(idx)}
                            className="text-stone-400 hover:text-rose-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Expertise */}
                  <div className="space-y-2">
                    <label className="block font-bold text-stone-700">Areas of Expertise</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={expertiseInput}
                        onChange={(e) => setExpertiseInput(e.target.value)}
                        placeholder="e.g. Wealth Management"
                        className="flex-1 p-2 bg-white border border-stone-300 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={handleAddExpertise}
                        className="px-3 py-2 bg-[#0B192C] text-[#C5A059] font-bold rounded-xl"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(editingAuthor.expertise || []).map((exp, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-white border border-stone-300 text-stone-800 flex items-center gap-1.5"
                        >
                          <span>{exp}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExpertise(idx)}
                            className="text-stone-400 hover:text-rose-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Linked Publications */}
              <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-[#0B192C] flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#C5A059]" />
                    <span>4. Linked Books & Publications</span>
                  </h3>
                  <span className="text-xs font-mono font-bold text-[#0B192C] bg-[#C5A059]/20 px-2.5 py-0.5 rounded-full">
                    {selectedBookIds.length} Linked
                  </span>
                </div>

                <p className="text-xs text-stone-500">
                  Select books from the catalog authored or co-authored by {editingAuthor.name || 'this author'}:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs max-h-60 overflow-y-auto p-1">
                  {books.map((b) => {
                    const isSelected = selectedBookIds.includes(b.id);
                    return (
                      <label
                        key={b.id}
                        onClick={() => handleToggleBookLink(b.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'bg-white border-[#C5A059] shadow-xs'
                            : 'bg-stone-100 border-stone-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 text-[#0B192C] rounded focus:ring-[#C5A059]"
                        />
                        <img
                          src={b.coverImage}
                          alt={b.title}
                          className="w-8 h-12 object-cover rounded shadow-xs shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-serif font-bold text-[#0B192C] truncate">{b.title}</div>
                          <div className="text-[10px] text-stone-500 font-mono">ISBN: {b.isbn}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Social Media & Web */}
              <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200 space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#0B192C]">5. Social Links & Portfolios</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Official Website</label>
                    <input
                      type="text"
                      value={editingAuthor.socialLinks?.website || ''}
                      onChange={(e) =>
                        setEditingAuthor({
                          ...editingAuthor,
                          socialLinks: { ...editingAuthor.socialLinks, website: e.target.value },
                        })
                      }
                      placeholder="https://sahayakassociates.org"
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">LinkedIn Profile</label>
                    <input
                      type="text"
                      value={editingAuthor.socialLinks?.linkedin || ''}
                      onChange={(e) =>
                        setEditingAuthor({
                          ...editingAuthor,
                          socialLinks: { ...editingAuthor.socialLinks, linkedin: e.target.value },
                        })
                      }
                      placeholder="https://linkedin.com/in/sandeepsahni"
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Twitter / X Handle</label>
                    <input
                      type="text"
                      value={editingAuthor.socialLinks?.twitter || ''}
                      onChange={(e) =>
                        setEditingAuthor({
                          ...editingAuthor,
                          socialLinks: { ...editingAuthor.socialLinks, twitter: e.target.value },
                        })
                      }
                      placeholder="https://x.com/sandeepsahni"
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Instagram Handle</label>
                    <input
                      type="text"
                      value={editingAuthor.socialLinks?.instagram || ''}
                      onChange={(e) =>
                        setEditingAuthor({
                          ...editingAuthor,
                          socialLinks: { ...editingAuthor.socialLinks, instagram: e.target.value },
                        })
                      }
                      placeholder="https://instagram.com/sandeepsahni"
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* SEO Meta Fields */}
              <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200 space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#0B192C]">6. Search Engine Optimization (SEO)</h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">SEO Title</label>
                    <input
                      type="text"
                      value={editingAuthor.seoTitle || ''}
                      onChange={(e) => setEditingAuthor({ ...editingAuthor, seoTitle: e.target.value })}
                      placeholder="Sandeep Sahni | Author Profile | Sahayak Associates"
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Meta Description</label>
                    <textarea
                      rows={2}
                      value={editingAuthor.metaDescription || ''}
                      onChange={(e) => setEditingAuthor({ ...editingAuthor, metaDescription: e.target.value })}
                      placeholder="Discover published books, research commentaries and financial guides by Sandeep Sahni."
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* MEDIA LIBRARY PICKER MODAL */}
      {/* ========================================================= */}
      {isMediaPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-stone-200">
            {/* Modal Header */}
            <div className="p-6 bg-[#0B192C] text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold">Select Author Photo from Cloudflare R2 Media Library</h3>
                <p className="text-xs text-stone-300 mt-1">
                  Choose a previously uploaded portrait asset to assign to this author profile.
                </p>
              </div>
              <button
                onClick={() => setIsMediaPickerOpen(false)}
                className="p-2 text-stone-400 hover:text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Filters */}
            <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center gap-3 text-xs">
              <input
                type="text"
                placeholder="Search media by filename or object key..."
                value={mediaPickerSearch}
                onChange={(e) => setMediaPickerSearch(e.target.value)}
                className="flex-1 p-2 bg-white border border-stone-300 rounded-xl min-w-[200px]"
              />

              <select
                value={mediaPickerCategory}
                onChange={(e) => setMediaPickerCategory(e.target.value)}
                className="p-2 bg-white border border-stone-300 rounded-xl font-semibold"
              >
                <option value="all">All Folders</option>
                <option value="authors">Authors</option>
                <option value="books">Books</option>
                <option value="blogs">Blogs</option>
                <option value="branding">Branding</option>
                <option value="homepage">Homepage</option>
              </select>
            </div>

            {/* Media Grid */}
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
              {mediaItems
                .filter((item) => {
                  const matchFolder =
                    mediaPickerCategory === 'all' ||
                    (item.folder && item.folder.toLowerCase().includes(mediaPickerCategory)) ||
                    (item.objectKey && item.objectKey.toLowerCase().includes(mediaPickerCategory));

                  const matchSearch =
                    !mediaPickerSearch ||
                    (item.originalFilename && item.originalFilename.toLowerCase().includes(mediaPickerSearch.toLowerCase())) ||
                    (item.objectKey && item.objectKey.toLowerCase().includes(mediaPickerSearch.toLowerCase()));

                  return matchFolder && matchSearch;
                })
                .map((media) => (
                  <div
                    key={media.id}
                    onClick={() => handleSelectMediaFromLibrary(media)}
                    className="group relative rounded-2xl overflow-hidden border border-stone-200 hover:border-[#C5A059] bg-stone-100 cursor-pointer shadow-xs hover:shadow-lg transition-all"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={media.publicUrl}
                        alt={media.altText || media.originalFilename || 'Media'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-2 bg-white text-[10px] border-t border-stone-100 truncate">
                      <div className="font-bold text-stone-800 truncate">
                        {media.originalFilename || media.id}
                      </div>
                      <div className="text-stone-400 font-mono truncate">{media.folder || 'R2 Bucket'}</div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setIsMediaPickerOpen(false)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Picker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {deleteTargetAuthor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-rose-200 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif text-lg font-bold text-[#0B192C]">
                Delete Author Profile?
              </h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to delete author <strong className="text-stone-900">{deleteTargetAuthor.name}</strong>?
              This action is permanent. Any books currently linked to this author will be set to unassigned.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTargetAuthor(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteAuthor}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
              >
                Yes, Delete Author
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
