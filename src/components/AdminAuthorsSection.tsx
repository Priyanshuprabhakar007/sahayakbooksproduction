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
  Share2,
  BarChart3,
  ChevronUp,
  ChevronDown,
  Eye,
  Mail,
  Phone,
  Link as LinkIcon,
  Sparkles,
  Check,
  FileText,
} from 'lucide-react';

const DEFAULT_AUTHOR_AVATAR =
  'https://pub-d7c01d3edc7e4dbab0acb59d64c988a8.r2.dev/sahayak/authors/default-author.png';

type EditorTab = 'basic' | 'media' | 'bio' | 'credentials' | 'social' | 'seo' | 'books';

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

  // Navigation mode: list | new | edit
  const [mode, setMode] = useState<'list' | 'new' | 'edit'>('list');
  const [authorSearch, setAuthorSearch] = useState('');
  const [editingAuthor, setEditingAuthor] = useState<Partial<Author> | null>(null);
  const [activeEditorTab, setActiveEditorTab] = useState<EditorTab>('basic');

  // Avatar & Cover Files & Previews
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string | null>(null);
  const [previewCoverUrl, setPreviewCoverUrl] = useState<string | null>(null);

  // Status & Progress
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Media Library Modal Target
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'avatar' | 'coverImage' | null>(null);
  const [mediaPickerCategory, setMediaPickerCategory] = useState<string>('authors');
  const [mediaPickerSearch, setMediaPickerSearch] = useState<string>('');

  // Delete Target & Warning State
  const [deleteTargetAuthor, setDeleteTargetAuthor] = useState<Author | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  // Qualification & Expertise New Inputs
  const [newQualificationInput, setNewQualificationInput] = useState('');
  const [newExpertiseInput, setNewExpertiseInput] = useState('');

  // Linked Books Selection State
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);

  // File Input Refs
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Sync mode with route
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

  // Open New Author Form
  const handleOpenNewAuthor = () => {
    const freshAuthor: Partial<Author> = {
      name: '',
      slug: '',
      title: 'Author & Financial Educator',
      avatar: DEFAULT_AUTHOR_AVATAR,
      coverImage: '',
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
      email: '',
      phone: '',
      publishedBookCount: 0,
      articlesCount: 0,
    };
    setEditingAuthor(freshAuthor);
    setAvatarFile(null);
    setCoverFile(null);
    setPreviewAvatarUrl(DEFAULT_AUTHOR_AVATAR);
    setPreviewCoverUrl('');
    setStatusMessage(null);
    setSelectedBookIds([]);
    setActiveEditorTab('basic');
    setMode('new');
  };

  // Open Edit Author Form
  const handleOpenEditAuthor = (author: Author) => {
    setEditingAuthor({
      id: author.id,
      slug: author.slug,
      name: author.name,
      title: author.title || '',
      avatar: author.avatar || DEFAULT_AUTHOR_AVATAR,
      coverImage: author.coverImage || '',
      profileMediaId: author.profileMediaId,
      status: author.status || 'published',
      isFeatured: author.isFeatured ?? true,
      imageAltText: author.imageAltText || '',
      bio: author.bio || '',
      biography: author.biography || '',
      qualifications: author.qualifications ? [...author.qualifications] : [],
      expertise: author.expertise ? [...author.expertise] : [],
      socialLinks: {
        website: author.socialLinks?.website || '',
        linkedin: author.socialLinks?.linkedin || '',
        twitter: author.socialLinks?.twitter || '',
        facebook: author.socialLinks?.facebook || '',
        instagram: author.socialLinks?.instagram || '',
        youtube: author.socialLinks?.youtube || '',
      },
      seoTitle: author.seoTitle || '',
      metaDescription: author.metaDescription || '',
      email: author.email || '',
      phone: author.phone || '',
      publishedBookCount: author.publishedBookCount !== undefined ? author.publishedBookCount : 0,
      articlesCount: author.articlesCount !== undefined ? author.articlesCount : 0,
      createdAt: author.createdAt,
      updatedAt: author.updatedAt,
    });
    setAvatarFile(null);
    setCoverFile(null);
    setPreviewAvatarUrl(author.avatar || DEFAULT_AUTHOR_AVATAR);
    setPreviewCoverUrl(author.coverImage || '');
    setStatusMessage(null);

    // Linked books
    const linkedIds = books
      .filter((b) => b.authorId === author.id || b.authorName?.toLowerCase() === author.name.toLowerCase())
      .map((b) => b.id);
    setSelectedBookIds(linkedIds);

    setActiveEditorTab('basic');
    setMode('edit');
  };

  // Process selected Avatar file
  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'Avatar image exceeds 10MB limit.' });
      return;
    }
    setAvatarFile(file);
    setPreviewAvatarUrl(URL.createObjectURL(file));
    setStatusMessage({ type: 'info', text: `Avatar file "${file.name}" selected. Save author profile to upload.` });
  };

  // Process selected Cover Image file
  const handleCoverFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'Cover image exceeds 10MB limit.' });
      return;
    }
    setCoverFile(file);
    setPreviewCoverUrl(URL.createObjectURL(file));
    setStatusMessage({ type: 'info', text: `Cover banner file "${file.name}" selected. Save author profile to upload.` });
  };

  // Media Library selection
  const handleSelectMediaFromPicker = (media: MediaItem) => {
    if (mediaPickerTarget === 'avatar' && editingAuthor) {
      setAvatarFile(null);
      setPreviewAvatarUrl(media.publicUrl);
      setEditingAuthor({
        ...editingAuthor,
        avatar: media.publicUrl,
        profileMediaId: media.id,
        imageAltText: media.altText || editingAuthor.imageAltText || `${editingAuthor.name} avatar`,
      });
    } else if (mediaPickerTarget === 'coverImage' && editingAuthor) {
      setCoverFile(null);
      setPreviewCoverUrl(media.publicUrl);
      setEditingAuthor({
        ...editingAuthor,
        coverImage: media.publicUrl,
      });
    }
    setIsMediaPickerOpen(false);
    setMediaPickerTarget(null);
    setStatusMessage({ type: 'success', text: `Selected media item "${media.originalFilename || media.id}".` });
  };

  // Qualifications logic
  const handleAddQualification = () => {
    if (!newQualificationInput.trim() || !editingAuthor) return;
    const current = editingAuthor.qualifications || [];
    setEditingAuthor({ ...editingAuthor, qualifications: [...current, newQualificationInput.trim()] });
    setNewQualificationInput('');
  };

  const handleUpdateQualification = (index: number, value: string) => {
    if (!editingAuthor || !editingAuthor.qualifications) return;
    const current = [...editingAuthor.qualifications];
    current[index] = value;
    setEditingAuthor({ ...editingAuthor, qualifications: current });
  };

  const handleRemoveQualification = (index: number) => {
    if (!editingAuthor || !editingAuthor.qualifications) return;
    setEditingAuthor({ ...editingAuthor, qualifications: editingAuthor.qualifications.filter((_, i) => i !== index) });
  };

  const handleMoveQualification = (index: number, direction: 'up' | 'down') => {
    if (!editingAuthor || !editingAuthor.qualifications) return;
    const items = [...editingAuthor.qualifications];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const [moved] = items.splice(index, 1);
    items.splice(targetIdx, 0, moved);
    setEditingAuthor({ ...editingAuthor, qualifications: items });
  };

  // Expertise logic
  const handleAddExpertise = () => {
    if (!newExpertiseInput.trim() || !editingAuthor) return;
    const current = editingAuthor.expertise || [];
    setEditingAuthor({ ...editingAuthor, expertise: [...current, newExpertiseInput.trim()] });
    setNewExpertiseInput('');
  };

  const handleUpdateExpertise = (index: number, value: string) => {
    if (!editingAuthor || !editingAuthor.expertise) return;
    const current = [...editingAuthor.expertise];
    current[index] = value;
    setEditingAuthor({ ...editingAuthor, expertise: current });
  };

  const handleRemoveExpertise = (index: number) => {
    if (!editingAuthor || !editingAuthor.expertise) return;
    setEditingAuthor({ ...editingAuthor, expertise: editingAuthor.expertise.filter((_, i) => i !== index) });
  };

  const handleMoveExpertise = (index: number, direction: 'up' | 'down') => {
    if (!editingAuthor || !editingAuthor.expertise) return;
    const items = [...editingAuthor.expertise];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const [moved] = items.splice(index, 1);
    items.splice(targetIdx, 0, moved);
    setEditingAuthor({ ...editingAuthor, expertise: items });
  };

  // Toggle book link
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

    setIsSaving(true);
    setStatusMessage({ type: 'info', text: 'Saving author information to database...' });

    try {
      const cleanName = editingAuthor.name.trim();
      const slug =
        editingAuthor.slug?.trim() ||
        cleanName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

      let finalAvatar = editingAuthor.avatar || DEFAULT_AUTHOR_AVATAR;
      let finalMediaId = editingAuthor.profileMediaId;
      let finalCoverImage = editingAuthor.coverImage || '';

      // Upload avatar file if selected
      if (avatarFile) {
        setUploadProgress(25);
        const uploadedAvatar = await uploadFileToR2(avatarFile, {
          folder: `authors/${slug}`,
          altText: editingAuthor.imageAltText || `${cleanName} — Author Avatar`,
          caption: `${cleanName} official author avatar`,
          uploadedBy: adminUser?.name || 'Administrator',
          onProgress: (p) => setUploadProgress(p),
        });
        addMediaItem(uploadedAvatar);
        finalAvatar = uploadedAvatar.publicUrl;
        finalMediaId = uploadedAvatar.id;
      }

      // Upload cover file if selected
      if (coverFile) {
        setUploadProgress(60);
        const uploadedCover = await uploadFileToR2(coverFile, {
          folder: `authors/${slug}/covers`,
          altText: `${cleanName} author cover banner`,
          caption: `${cleanName} profile banner`,
          uploadedBy: adminUser?.name || 'Administrator',
          onProgress: (p) => setUploadProgress(p),
        });
        addMediaItem(uploadedCover);
        finalCoverImage = uploadedCover.publicUrl;
      }

      const authorId = editingAuthor.id || `author-${Date.now()}`;

      const payload: Author = {
        id: authorId,
        slug,
        name: cleanName,
        title: editingAuthor.title?.trim() || 'Author & Educator',
        avatar: finalAvatar,
        profileMediaId: finalMediaId,
        coverImage: finalCoverImage,
        status: editingAuthor.status || 'published',
        isFeatured: editingAuthor.isFeatured ?? true,
        imageAltText: editingAuthor.imageAltText || `${cleanName} — Author Portrait`,
        bio: editingAuthor.bio?.trim() || '',
        biography: editingAuthor.biography?.trim() || editingAuthor.bio?.trim() || '',
        qualifications: editingAuthor.qualifications || [],
        expertise: editingAuthor.expertise || [],
        socialLinks: {
          website: editingAuthor.socialLinks?.website?.trim() || '',
          linkedin: editingAuthor.socialLinks?.linkedin?.trim() || '',
          twitter: editingAuthor.socialLinks?.twitter?.trim() || '',
          facebook: editingAuthor.socialLinks?.facebook?.trim() || '',
          instagram: editingAuthor.socialLinks?.instagram?.trim() || '',
          youtube: editingAuthor.socialLinks?.youtube?.trim() || '',
        },
        seoTitle: editingAuthor.seoTitle?.trim() || `${cleanName} | Author Profile`,
        metaDescription: editingAuthor.metaDescription?.trim() || `Read biography and research books by ${cleanName}.`,
        email: editingAuthor.email?.trim() || '',
        phone: editingAuthor.phone?.trim() || '',
        publishedBookCount:
          editingAuthor.publishedBookCount !== undefined && editingAuthor.publishedBookCount !== null
            ? Number(editingAuthor.publishedBookCount)
            : selectedBookIds.length,
        articlesCount: editingAuthor.articlesCount !== undefined ? Number(editingAuthor.articlesCount) : 0,
        createdAt: editingAuthor.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingAuthor.id) {
        await updateAuthor(payload);
      } else {
        await addAuthor(payload);
      }

      // Sync linked books
      books.forEach((b) => {
        const isCurrentlyLinked = selectedBookIds.includes(b.id);
        const isAuthorAssigned = b.authorId === authorId;

        if (isCurrentlyLinked && !isAuthorAssigned) {
          updateBook({ ...b, authorId, authorName: cleanName });
        } else if (!isCurrentlyLinked && isAuthorAssigned) {
          updateBook({ ...b, authorId: 'author-unassigned', authorName: 'Sahayak Editorial Board' });
        }
      });

      setStatusMessage({ type: 'success', text: 'Author saved successfully!' });
      setAvatarFile(null);
      setCoverFile(null);
      setMode('list');
      navigate('/admin/authors');
    } catch (err: any) {
      console.error('Error saving author:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save author to server.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Author
  const handleConfirmDeleteAuthor = async () => {
    if (!deleteTargetAuthor) return;
    setDeleteErrorMessage(null);
    try {
      await deleteAuthor(deleteTargetAuthor.id);
      setDeleteTargetAuthor(null);
    } catch (err: any) {
      console.error('Error deleting author:', err);
      setDeleteErrorMessage(err.message || 'Failed to delete author.');
    }
  };

  // Filtered authors roster
  const filteredAuthors = authors.filter(
    (a) =>
      a.name.toLowerCase().includes(authorSearch.toLowerCase()) ||
      a.title.toLowerCase().includes(authorSearch.toLowerCase()) ||
      a.bio.toLowerCase().includes(authorSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* MODE 1: AUTHORS ROSTER LISTING */}
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
                Manage full author profiles, Cloudflare R2 images, academic qualifications, social handles, and linked book publications.
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

          {/* Authors Table */}
          <div className="overflow-x-auto rounded-2xl border border-stone-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-100 text-stone-600 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Author Avatar</th>
                  <th className="p-3">Author Name & Designation</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Books Count</th>
                  <th className="p-3">Status</th>
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
                        <div className="text-[10px] text-stone-400 font-mono">ID: {author.id} | /author/{author.slug}</div>
                      </td>
                      <td className="p-3 text-[11px] text-stone-600 space-y-0.5">
                        {author.email && <div>{author.email}</div>}
                        {author.phone && <div className="font-mono text-stone-400">{author.phone}</div>}
                        {!author.email && !author.phone && <span className="text-stone-300">—</span>}
                      </td>
                      <td className="p-3">
                        <span className="font-mono font-bold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-lg">
                          {author.publishedBookCount !== undefined ? author.publishedBookCount : authorBooksCount} book(s)
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
                            title="Edit Full Author Profile"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteTargetAuthor(author);
                              setDeleteErrorMessage(null);
                            }}
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

      {/* MODE 2 & 3: FULL AUTHOR EDITOR FORM */}
      {(mode === 'new' || mode === 'edit') && editingAuthor && (
        <form onSubmit={handleSaveAuthor} className="space-y-6 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
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
                  {mode === 'new' ? 'Create Author Profile' : `Edit Author: ${editingAuthor.name}`}
                </h2>
                <p className="text-xs text-stone-500">
                  Manage basic details, Cloudflare R2 photos, biography, academic qualifications, social handles, and SEO.
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
                disabled={isSaving}
                className="px-5 py-2 bg-[#0B192C] text-[#C5A059] font-bold rounded-xl text-xs hover:bg-[#152A4A] transition-colors flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{isSaving ? `Saving (${uploadProgress}%)...` : 'Save Author Profile'}</span>
              </button>
            </div>
          </div>

          {/* Status Message Banner */}
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

          {/* Organized Navigation Tabs */}
          <div className="flex flex-wrap border-b border-stone-200 gap-1 bg-stone-100/60 p-1.5 rounded-2xl text-xs">
            {[
              { id: 'basic', label: '1. Basic Profile', icon: Users },
              { id: 'media', label: '2. Photos & Media', icon: ImageIcon },
              { id: 'bio', label: '3. Biography', icon: FileText },
              { id: 'credentials', label: '4. Qualifications & Expertise', icon: Award },
              { id: 'social', label: '5. Social Links', icon: Share2 },
              { id: 'seo', label: '6. SEO & Counters', icon: BarChart3 },
              { id: 'books', label: '7. Linked Books', icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeEditorTab === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveEditorTab(tab.id as EditorTab)}
                  className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0B192C] text-[#C5A059] shadow-xs'
                      : 'text-stone-600 hover:bg-stone-200/70 hover:text-stone-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: BASIC PROFILE */}
          {activeEditorTab === 'basic' && (
            <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200 space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#0B192C]">Basic Profile Information</h3>

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
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={editingAuthor.slug || ''}
                    onChange={(e) => setEditingAuthor({ ...editingAuthor, slug: e.target.value })}
                    placeholder="sandeep-sahni"
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-mono text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">Designation / Faculty Title</label>
                  <input
                    type="text"
                    value={editingAuthor.title || ''}
                    onChange={(e) => setEditingAuthor({ ...editingAuthor, title: e.target.value })}
                    placeholder="e.g. Senior Financial Educator & Author"
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editingAuthor.email || ''}
                    onChange={(e) => setEditingAuthor({ ...editingAuthor, email: e.target.value })}
                    placeholder="sandeep.sahni@sahayakassociates.org"
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editingAuthor.phone || ''}
                    onChange={(e) => setEditingAuthor({ ...editingAuthor, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Visibility Status</label>
                  <select
                    value={editingAuthor.status || 'published'}
                    onChange={(e) => setEditingAuthor({ ...editingAuthor, status: e.target.value })}
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-bold text-xs"
                  >
                    <option value="published">Published (Visible on public site)</option>
                    <option value="draft">Draft (Hidden from public site)</option>
                    <option value="active">Active</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-stone-200 cursor-pointer w-full">
                    <input
                      type="checkbox"
                      checked={editingAuthor.isFeatured ?? true}
                      onChange={(e) => setEditingAuthor({ ...editingAuthor, isFeatured: e.target.checked })}
                      className="w-4 h-4 text-[#0B192C] rounded focus:ring-[#C5A059]"
                    />
                    <span className="font-bold text-stone-800">Featured Author Spotlight</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PHOTOS & MEDIA */}
          {activeEditorTab === 'media' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Profile Photo / Avatar Card */}
                <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-base font-bold text-[#0B192C] flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#C5A059]" />
                      <span>Profile Photo / Avatar</span>
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0B192C] text-[#C5A059] font-bold">
                      Square (1:1)
                    </span>
                  </div>

                  {/* Avatar Preview */}
                  <div className="w-40 h-40 mx-auto rounded-2xl overflow-hidden border-2 border-[#C5A059] shadow-md bg-white relative">
                    <img
                      src={previewAvatarUrl || editingAuthor.avatar || DEFAULT_AUTHOR_AVATAR}
                      alt={editingAuthor.name || 'Author Avatar'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Action Controls for Avatar */}
                  <div className="space-y-2 text-xs">
                    <input
                      ref={avatarFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileSelect}
                      className="hidden"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => avatarFileInputRef.current?.click()}
                        className="py-2.5 px-3 bg-[#0B192C] text-[#C5A059] hover:bg-[#152A4A] rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMediaPickerTarget('avatar');
                          setIsMediaPickerOpen(true);
                        }}
                        className="py-2.5 px-3 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Media Library</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-1">Or Paste Avatar Image URL</label>
                      <input
                        type="text"
                        value={editingAuthor.avatar || ''}
                        onChange={(e) => {
                          setAvatarFile(null);
                          setPreviewAvatarUrl(e.target.value);
                          setEditingAuthor({ ...editingAuthor, avatar: e.target.value });
                        }}
                        placeholder="https://..."
                        className="w-full p-2 bg-white border border-stone-300 rounded-xl font-mono text-[11px]"
                      />
                    </div>

                    {(previewAvatarUrl || editingAuthor.avatar) && (
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarFile(null);
                          setPreviewAvatarUrl(DEFAULT_AUTHOR_AVATAR);
                          setEditingAuthor({ ...editingAuthor, avatar: DEFAULT_AUTHOR_AVATAR, profileMediaId: undefined });
                        }}
                        className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Reset to Default Avatar</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Cover / Banner Image Card */}
                <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-base font-bold text-[#0B192C] flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#C5A059]" />
                      <span>Cover / Banner Image</span>
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0B192C] text-[#C5A059] font-bold">
                      Banner (3:1)
                    </span>
                  </div>

                  {/* Cover Preview */}
                  <div className="w-full h-40 rounded-2xl overflow-hidden border border-stone-300 shadow-sm bg-stone-200 relative flex items-center justify-center">
                    {previewCoverUrl || editingAuthor.coverImage ? (
                      <img
                        src={previewCoverUrl || editingAuthor.coverImage}
                        alt="Author Banner"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-stone-400 p-4">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                        <span className="text-xs">No Cover Banner Set</span>
                      </div>
                    )}
                  </div>

                  {/* Action Controls for Cover */}
                  <div className="space-y-2 text-xs">
                    <input
                      ref={coverFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverFileSelect}
                      className="hidden"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => coverFileInputRef.current?.click()}
                        className="py-2.5 px-3 bg-[#0B192C] text-[#C5A059] hover:bg-[#152A4A] rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Banner</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMediaPickerTarget('coverImage');
                          setIsMediaPickerOpen(true);
                        }}
                        className="py-2.5 px-3 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Media Library</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-1">Or Paste Banner Image URL</label>
                      <input
                        type="text"
                        value={editingAuthor.coverImage || ''}
                        onChange={(e) => {
                          setCoverFile(null);
                          setPreviewCoverUrl(e.target.value);
                          setEditingAuthor({ ...editingAuthor, coverImage: e.target.value });
                        }}
                        placeholder="https://..."
                        className="w-full p-2 bg-white border border-stone-300 rounded-xl font-mono text-[11px]"
                      />
                    </div>

                    {(previewCoverUrl || editingAuthor.coverImage) && (
                      <button
                        type="button"
                        onClick={() => {
                          setCoverFile(null);
                          setPreviewCoverUrl('');
                          setEditingAuthor({ ...editingAuthor, coverImage: '' });
                        }}
                        className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Banner Image</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Image Alt Text */}
              <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200 text-xs">
                <label className="block font-bold text-stone-700 mb-1">
                  Image Alt Text (SEO & Accessibility)
                </label>
                <input
                  type="text"
                  value={editingAuthor.imageAltText || ''}
                  onChange={(e) => setEditingAuthor({ ...editingAuthor, imageAltText: e.target.value })}
                  placeholder="e.g. Sandeep Sahni — author and financial educator portrait"
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                />
              </div>
            </div>
          )}

          {/* TAB 3: BIOGRAPHY */}
          {activeEditorTab === 'bio' && (
            <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200 space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#0B192C]">Biographies & Profiles</h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Short Bio (Displayed on cards, catalog popovers, and author widgets)
                  </label>
                  <textarea
                    rows={3}
                    value={editingAuthor.bio || ''}
                    onChange={(e) => setEditingAuthor({ ...editingAuthor, bio: e.target.value })}
                    placeholder="Brief 2-3 sentence overview of qualifications and financial literacy mission..."
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Full Biography (Displayed on dedicated /author/[slug] profile page)
                  </label>
                  <textarea
                    rows={8}
                    value={editingAuthor.biography || ''}
                    onChange={(e) => setEditingAuthor({ ...editingAuthor, biography: e.target.value })}
                    placeholder="Comprehensive career trajectory, publications history, appointments, and academic contributions..."
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: QUALIFICATIONS & EXPERTISE */}
          {activeEditorTab === 'credentials' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Qualifications */}
              <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200 space-y-4">
                <h3 className="font-serif text-base font-bold text-[#0B192C] flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#C5A059]" />
                  <span>Degrees & Qualifications</span>
                </h3>

                <div className="flex gap-2 text-xs">
                  <input
                    type="text"
                    value={newQualificationInput}
                    onChange={(e) => setNewQualificationInput(e.target.value)}
                    placeholder="e.g. Certified Financial Planner (CFP)"
                    className="flex-1 p-2 bg-white border border-stone-300 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={handleAddQualification}
                    className="px-3.5 py-2 bg-[#0B192C] text-[#C5A059] font-bold rounded-xl cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  {(editingAuthor.qualifications || []).map((q, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2 border border-stone-200 rounded-xl text-xs">
                      <input
                        type="text"
                        value={q}
                        onChange={(e) => handleUpdateQualification(idx, e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none font-medium"
                      />
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveQualification(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 hover:bg-stone-100 rounded text-stone-500 disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveQualification(idx, 'down')}
                          disabled={idx === (editingAuthor.qualifications?.length || 0) - 1}
                          className="p-1 hover:bg-stone-100 rounded text-stone-500 disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveQualification(idx)}
                          className="p-1 hover:bg-rose-50 text-rose-600 rounded cursor-pointer"
                          title="Delete"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!editingAuthor.qualifications || editingAuthor.qualifications.length === 0) && (
                    <p className="text-xs text-stone-400 italic">No qualifications added yet.</p>
                  )}
                </div>
              </div>

              {/* Expertise */}
              <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200 space-y-4">
                <h3 className="font-serif text-base font-bold text-[#0B192C] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C5A059]" />
                  <span>Areas of Expertise</span>
                </h3>

                <div className="flex gap-2 text-xs">
                  <input
                    type="text"
                    value={newExpertiseInput}
                    onChange={(e) => setNewExpertiseInput(e.target.value)}
                    placeholder="e.g. Wealth Management"
                    className="flex-1 p-2 bg-white border border-stone-300 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={handleAddExpertise}
                    className="px-3.5 py-2 bg-[#0B192C] text-[#C5A059] font-bold rounded-xl cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  {(editingAuthor.expertise || []).map((exp, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-2 border border-stone-200 rounded-xl text-xs">
                      <input
                        type="text"
                        value={exp}
                        onChange={(e) => handleUpdateExpertise(idx, e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none font-medium"
                      />
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveExpertise(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 hover:bg-stone-100 rounded text-stone-500 disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveExpertise(idx, 'down')}
                          disabled={idx === (editingAuthor.expertise?.length || 0) - 1}
                          className="p-1 hover:bg-stone-100 rounded text-stone-500 disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveExpertise(idx)}
                          className="p-1 hover:bg-rose-50 text-rose-600 rounded cursor-pointer"
                          title="Delete"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!editingAuthor.expertise || editingAuthor.expertise.length === 0) && (
                    <p className="text-xs text-stone-400 italic">No expertise areas added yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SOCIAL LINKS */}
          {activeEditorTab === 'social' && (
            <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200 space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#0B192C]">Social Links & Portfolios</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-stone-500" />
                    <span>Official Website</span>
                  </label>
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
                  <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                    <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                    <span>LinkedIn Profile</span>
                  </label>
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
                  <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                    <Twitter className="w-3.5 h-3.5 text-sky-500" />
                    <span>Twitter / X Handle</span>
                  </label>
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
                  <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                    <Facebook className="w-3.5 h-3.5 text-blue-700" />
                    <span>Facebook Page</span>
                  </label>
                  <input
                    type="text"
                    value={editingAuthor.socialLinks?.facebook || ''}
                    onChange={(e) =>
                      setEditingAuthor({
                        ...editingAuthor,
                        socialLinks: { ...editingAuthor.socialLinks, facebook: e.target.value },
                      })
                    }
                    placeholder="https://facebook.com/sandeepsahni"
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5 text-pink-600" />
                    <span>Instagram Handle</span>
                  </label>
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

                <div>
                  <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                    <Youtube className="w-3.5 h-3.5 text-rose-600" />
                    <span>YouTube Channel</span>
                  </label>
                  <input
                    type="text"
                    value={editingAuthor.socialLinks?.youtube || ''}
                    onChange={(e) =>
                      setEditingAuthor({
                        ...editingAuthor,
                        socialLinks: { ...editingAuthor.socialLinks, youtube: e.target.value },
                      })
                    }
                    placeholder="https://youtube.com/@sandeepsahni"
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SEO, COUNTERS & SYSTEM INFO */}
          {activeEditorTab === 'seo' && (
            <div className="space-y-6">
              <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200 space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#0B192C]">Search Engine Optimization (SEO)</h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">SEO Title Tag</label>
                    <input
                      type="text"
                      value={editingAuthor.seoTitle || ''}
                      onChange={(e) => setEditingAuthor({ ...editingAuthor, seoTitle: e.target.value })}
                      placeholder="Sandeep Sahni | Author Profile | Sahayak Books"
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Meta Description</label>
                    <textarea
                      rows={2}
                      value={editingAuthor.metaDescription || ''}
                      onChange={(e) => setEditingAuthor({ ...editingAuthor, metaDescription: e.target.value })}
                      placeholder="Discover books and financial publications by Sandeep Sahni."
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Counters & Display Metrics */}
              <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200 space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#0B192C]">Author Metrics & Counters</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Published Book Count (Explicit Override)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editingAuthor.publishedBookCount ?? 0}
                      onChange={(e) =>
                        setEditingAuthor({ ...editingAuthor, publishedBookCount: parseInt(e.target.value) || 0 })
                      }
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-mono text-sm font-bold"
                    />
                    <p className="text-[10px] text-stone-400 mt-1">
                      Note: Setting an explicit number here will be saved and displayed.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Articles & Papers Count</label>
                    <input
                      type="number"
                      min={0}
                      value={editingAuthor.articlesCount ?? 0}
                      onChange={(e) =>
                        setEditingAuthor({ ...editingAuthor, articlesCount: parseInt(e.target.value) || 0 })
                      }
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-mono text-sm font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* System Information (Read-Only) */}
              <div className="p-6 bg-stone-100/80 rounded-3xl border border-stone-200 space-y-3 text-xs">
                <h3 className="font-serif font-bold text-stone-800">System Records (Read-Only)</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-[11px] text-stone-600">
                  <div className="p-3 bg-white rounded-xl border border-stone-200">
                    <span className="text-[10px] uppercase text-stone-400 block font-sans">Author ID (D1 PK)</span>
                    <strong className="text-[#0B192C]">{editingAuthor.id || 'Assigned on Save'}</strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-stone-200">
                    <span className="text-[10px] uppercase text-stone-400 block font-sans">Created At</span>
                    <span>{editingAuthor.createdAt ? new Date(editingAuthor.createdAt).toLocaleString() : 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-stone-200">
                    <span className="text-[10px] uppercase text-stone-400 block font-sans">Last Updated At</span>
                    <span>{editingAuthor.updatedAt ? new Date(editingAuthor.updatedAt).toLocaleString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: LINKED BOOKS */}
          {activeEditorTab === 'books' && (
            <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#0B192C]">Linked Catalog Books</h3>
                  <p className="text-xs text-stone-500">
                    Select books from the store catalog authored or co-authored by {editingAuthor.name || 'this author'}:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingAuthor({ ...editingAuthor, publishedBookCount: selectedBookIds.length })
                  }
                  className="px-3 py-1.5 bg-[#C5A059]/20 hover:bg-[#C5A059]/30 text-[#0B192C] font-bold text-xs rounded-xl cursor-pointer"
                >
                  Set Count to {selectedBookIds.length} Linked
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs max-h-80 overflow-y-auto p-1">
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
          )}
        </form>
      )}

      {/* MEDIA LIBRARY PICKER MODAL */}
      {isMediaPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-stone-200">
            <div className="p-6 bg-[#0B192C] text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold">
                  Select {mediaPickerTarget === 'avatar' ? 'Avatar Photo' : 'Banner Cover'} from Media Library
                </h3>
                <p className="text-xs text-stone-300 mt-1">
                  Pick a Cloudflare R2 uploaded image to assign to this author profile.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsMediaPickerOpen(false);
                  setMediaPickerTarget(null);
                }}
                className="p-2 text-stone-400 hover:text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center gap-3 text-xs">
              <input
                type="text"
                placeholder="Search media by filename..."
                value={mediaPickerSearch}
                onChange={(e) => setMediaPickerSearch(e.target.value)}
                className="flex-1 p-2 bg-white border border-stone-300 rounded-xl min-w-[200px]"
              />

              <select
                value={mediaPickerCategory}
                onChange={(e) => setMediaPickerCategory(e.target.value)}
                className="p-2 bg-white border border-stone-300 rounded-xl font-semibold"
              >
                <option value="all">All Media</option>
                <option value="authors">Authors</option>
                <option value="books">Books</option>
                <option value="branding">Branding</option>
              </select>
            </div>

            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
              {mediaItems
                .filter((item) => {
                  const matchFolder =
                    mediaPickerCategory === 'all' ||
                    (item.folder && item.folder.toLowerCase().includes(mediaPickerCategory));
                  const matchSearch =
                    !mediaPickerSearch ||
                    (item.originalFilename && item.originalFilename.toLowerCase().includes(mediaPickerSearch.toLowerCase()));
                  return matchFolder && matchSearch;
                })
                .map((media) => (
                  <div
                    key={media.id}
                    onClick={() => handleSelectMediaFromPicker(media)}
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
                    </div>
                  </div>
                ))}
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => {
                  setIsMediaPickerOpen(false);
                  setMediaPickerTarget(null);
                }}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Picker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTargetAuthor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-rose-200 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif text-lg font-bold text-[#0B192C]">Delete Author Profile?</h3>
            </div>

            {deleteErrorMessage ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
                {deleteErrorMessage}
              </div>
            ) : (
              <p className="text-xs text-stone-600 leading-relaxed">
                Are you sure you want to delete author <strong className="text-stone-900">{deleteTargetAuthor.name}</strong>?
                This action is permanent and will remove their record from Cloudflare D1 database.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTargetAuthor(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
              {!deleteErrorMessage && (
                <button
                  onClick={handleConfirmDeleteAuthor}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
                >
                  Yes, Delete Author
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
