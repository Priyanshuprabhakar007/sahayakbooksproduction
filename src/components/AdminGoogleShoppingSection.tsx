import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Settings,
  ShieldCheck,
  Clock,
  Truck,
  RotateCcw,
  FileText,
  ExternalLink,
  Eye,
  Check,
  Copy,
  Info,
  Globe,
  Database,
  Search,
  Filter,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Book, GoogleMerchantSyncLog, GoogleShoppingStatus } from '../types';

export const AdminGoogleShoppingSection: React.FC = () => {
  const {
    books,
    settings,
    googleMerchantStatus,
    googleSyncLogs,
    fetchGoogleMerchantStatus,
    testGoogleMerchantConnection,
    syncBookToGoogleMerchant,
    removeBookFromGoogleMerchant,
    bulkSyncBooksToGoogleMerchant,
    fetchGoogleMerchantLogs,
    fetchGoogleMerchantDiagnostics,
    saveGoogleShoppingSettings,
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'settings' | 'shipping' | 'catalog' | 'logs' | 'guide'
  >('overview');

  // Form states for settings
  const [merchantAccountId, setMerchantAccountId] = useState(
    settings.googleShopping?.merchantAccountId || ''
  );
  const [dataSourceName, setDataSourceName] = useState(
    settings.googleShopping?.dataSourceName || 'Sahayak Books Primary Products'
  );
  const [feedLabel, setFeedLabel] = useState(settings.googleShopping?.feedLabel || 'online');
  const [targetCountry, setTargetCountry] = useState(settings.googleShopping?.targetCountry || 'IN');
  const [targetLanguage, setTargetLanguage] = useState(settings.googleShopping?.targetLanguage || 'en');
  const [currency, setCurrency] = useState(settings.googleShopping?.currency || 'INR');
  const [autoSync, setAutoSync] = useState(settings.googleShopping?.autoSync ?? true);
  const [syncPriceChanges, setSyncPriceChanges] = useState(settings.googleShopping?.syncPriceChanges ?? true);
  const [syncStockChanges, setSyncStockChanges] = useState(settings.googleShopping?.syncStockChanges ?? true);
  const [syncImageUpdates, setSyncImageUpdates] = useState(settings.googleShopping?.syncImageUpdates ?? true);
  const [dailySyncSchedule, setDailySyncSchedule] = useState(settings.googleShopping?.dailySyncSchedule ?? false);
  const [dailySyncTime, setDailySyncTime] = useState(settings.googleShopping?.dailySyncTime || '03:00');
  const [authMethod, setAuthMethod] = useState<'service_account' | 'oauth2'>(
    settings.googleShopping?.authMethod || 'service_account'
  );

  // Shipping & Return States
  const [defaultShippingCost, setDefaultShippingCost] = useState(
    settings.shippingSettings?.defaultShippingCost ?? 49
  );
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    settings.shippingSettings?.freeShippingThreshold ?? 500
  );
  const [minHandlingDays, setMinHandlingDays] = useState(
    settings.shippingSettings?.minHandlingDays ?? 1
  );
  const [maxHandlingDays, setMaxHandlingDays] = useState(
    settings.shippingSettings?.maxHandlingDays ?? 2
  );
  const [minTransitDays, setMinTransitDays] = useState(
    settings.shippingSettings?.minTransitDays ?? 3
  );
  const [maxTransitDays, setMaxTransitDays] = useState(
    settings.shippingSettings?.maxTransitDays ?? 7
  );
  const [returnWindowDays, setReturnWindowDays] = useState(
    settings.returnPolicy?.returnWindowDays ?? 14
  );
  const [returnPolicyUrl, setReturnPolicyUrl] = useState(
    settings.returnPolicy?.policyUrl || 'https://sahayakassociates.com/terms#returns'
  );
  const [returnShippingFee, setReturnShippingFee] = useState(
    settings.returnPolicy?.returnShippingFee || 'customer_pays'
  );

  // Diagnostics and Filter States
  const [diagnosticsReport, setDiagnosticsReport] = useState<any[]>([]);
  const [catalogFilter, setCatalogFilter] = useState<'all' | 'eligible' | 'issues' | 'synced' | 'excluded'>('all');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [inspectPayloadBook, setInspectPayloadBook] = useState<any | null>(null);

  // Operation loading states
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);
  const [syncingBookId, setSyncingBookId] = useState<string | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Load initial status and diagnostics
  useEffect(() => {
    fetchGoogleMerchantStatus();
    fetchGoogleMerchantLogs();
    loadDiagnostics();
  }, [fetchGoogleMerchantStatus, fetchGoogleMerchantLogs]);

  // Sync settings when store settings change
  useEffect(() => {
    if (settings.googleShopping) {
      if (settings.googleShopping.merchantAccountId) setMerchantAccountId(settings.googleShopping.merchantAccountId);
      if (settings.googleShopping.dataSourceName) setDataSourceName(settings.googleShopping.dataSourceName);
      if (settings.googleShopping.feedLabel) setFeedLabel(settings.googleShopping.feedLabel);
      if (settings.googleShopping.targetCountry) setTargetCountry(settings.googleShopping.targetCountry);
      if (settings.googleShopping.targetLanguage) setTargetLanguage(settings.googleShopping.targetLanguage);
      if (settings.googleShopping.currency) setCurrency(settings.googleShopping.currency);
      if (typeof settings.googleShopping.autoSync === 'boolean') setAutoSync(settings.googleShopping.autoSync);
      if (typeof settings.googleShopping.syncPriceChanges === 'boolean') setSyncPriceChanges(settings.googleShopping.syncPriceChanges);
      if (typeof settings.googleShopping.syncStockChanges === 'boolean') setSyncStockChanges(settings.googleShopping.syncStockChanges);
      if (typeof settings.googleShopping.syncImageUpdates === 'boolean') setSyncImageUpdates(settings.googleShopping.syncImageUpdates);
      if (typeof settings.googleShopping.dailySyncSchedule === 'boolean') setDailySyncSchedule(settings.googleShopping.dailySyncSchedule);
      if (settings.googleShopping.dailySyncTime) setDailySyncTime(settings.googleShopping.dailySyncTime);
      if (settings.googleShopping.authMethod) setAuthMethod(settings.googleShopping.authMethod);
    }
  }, [settings.googleShopping]);

  const loadDiagnostics = async () => {
    const res = await fetchGoogleMerchantDiagnostics();
    if (res?.report) {
      setDiagnosticsReport(res.report);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await testGoogleMerchantConnection();
      setTestResult(res);
      await fetchGoogleMerchantLogs();
    } catch (e: any) {
      setTestResult({ success: false, message: e.message });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveAllSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSaveSuccessMsg(null);
    try {
      await saveGoogleShoppingSettings({
        googleShopping: {
          merchantAccountId,
          dataSourceName,
          feedLabel,
          targetCountry,
          targetLanguage,
          currency,
          autoSync,
          syncPriceChanges,
          syncStockChanges,
          syncImageUpdates,
          dailySyncSchedule,
          dailySyncTime,
          authMethod,
        },
        shippingSettings: {
          defaultShippingCost,
          freeShippingThreshold,
          minHandlingDays,
          maxHandlingDays,
          minTransitDays,
          maxTransitDays,
        },
        returnPolicy: {
          returnWindowDays,
          policyUrl: returnPolicyUrl,
          returnShippingFee,
        },
      });
      setSaveSuccessMsg('Google Merchant Center settings saved successfully.');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
      loadDiagnostics();
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSyncSingleBook = async (bookId: string) => {
    setSyncingBookId(bookId);
    try {
      await syncBookToGoogleMerchant(bookId);
      await loadDiagnostics();
    } finally {
      setSyncingBookId(null);
    }
  };

  const handleRemoveSingleBook = async (bookId: string) => {
    setSyncingBookId(bookId);
    try {
      await removeBookFromGoogleMerchant(bookId);
      await loadDiagnostics();
    } finally {
      setSyncingBookId(null);
    }
  };

  const handleRunFullCatalogSync = async () => {
    setIsBulkSyncing(true);
    try {
      await bulkSyncBooksToGoogleMerchant();
      await loadDiagnostics();
    } finally {
      setIsBulkSyncing(false);
    }
  };

  const handleSyncSelected = async () => {
    if (selectedBookIds.length === 0) return;
    setIsBulkSyncing(true);
    try {
      await bulkSyncBooksToGoogleMerchant(selectedBookIds);
      setSelectedBookIds([]);
      await loadDiagnostics();
    } finally {
      setIsBulkSyncing(false);
    }
  };

  // Metrics calculation
  const metrics = googleMerchantStatus?.metrics || {
    totalBooks: books.length,
    eligibleBooks: books.filter((b) => b.googleEnabled !== false && !b.googleExcluded).length,
    approvedBooks: books.filter((b) => b.googleSyncStatus === 'Approved').length,
    pendingBooks: books.filter((b) => b.googleSyncStatus === 'Pending' || b.googleSyncStatus === 'Submitted').length,
    disapprovedBooks: books.filter((b) => b.googleSyncStatus === 'Disapproved').length,
    excludedBooks: books.filter((b) => b.googleExcluded).length,
    lastSyncTimestamp: settings.googleShopping?.lastFullSyncAt || 'Never',
    syncSuccessRate: 100,
  };

  const isAuthConfigured = googleMerchantStatus?.credentials?.isAuthConfigured;
  const isReadinessMode = !isAuthConfigured;

  // Filter books for catalog diagnostic view
  const filteredCatalog = (diagnosticsReport.length > 0 ? diagnosticsReport : books.map((b) => ({
    bookId: b.id,
    title: b.title,
    sku: b.sku,
    isbn: b.isbn,
    price: b.price,
    inStock: b.inStock,
    stockCount: b.stockCount,
    googleSyncStatus: b.googleSyncStatus || 'Not Submitted',
    googleExcluded: b.googleExcluded || false,
    isEligible: b.googleEnabled !== false && !b.googleExcluded,
    issues: [],
    lastSyncedAt: b.googleLastSyncedAt,
  }))).filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      (item.isbn && item.isbn.includes(catalogSearch)) ||
      (item.sku && item.sku.toLowerCase().includes(catalogSearch.toLowerCase()));

    if (!matchesSearch) return false;

    if (catalogFilter === 'eligible') return item.isEligible;
    if (catalogFilter === 'issues') return item.issues && item.issues.length > 0;
    if (catalogFilter === 'synced') return item.googleSyncStatus === 'Approved' || item.googleSyncStatus === 'Submitted';
    if (catalogFilter === 'excluded') return item.googleExcluded;
    return true;
  });

  const getStatusBadge = (status: GoogleShoppingStatus | string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case 'Pending':
      case 'Submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" />
            {status}
          </span>
        );
      case 'Disapproved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3" />
            Disapproved
          </span>
        );
      case 'Excluded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-600 border border-stone-200">
            Excluded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Not Submitted
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="google-shopping-admin-section">
      {/* Top Header & Connection State Card */}
      <div className="bg-gradient-to-r from-[#0B192C] to-[#152A4A] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-[#C5A059]/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/30 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" />
                Google Merchant API v1beta
              </span>
              {isReadinessMode ? (
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Readiness & Validation Mode
                </span>
              ) : (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[11px] font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Live API Connected
                </span>
              )}
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Google Shopping & Merchant Center
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Synchronize Sahayak Associates scholarly titles, multi-format pricing, real-time stock
              levels, and Cloudflare R2 book covers with Google Shopping and Free Product Listings.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-white/15 cursor-pointer disabled:opacity-50"
              title="Validate API authentication or payload integrity"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
              <span>{testingConnection ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <button
              onClick={handleRunFullCatalogSync}
              disabled={isBulkSyncing}
              className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#b08b47] text-[#0B192C] font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Synchronize all eligible books to Google Merchant API"
            >
              <ShoppingBag className={`w-3.5 h-3.5 ${isBulkSyncing ? 'animate-bounce' : ''}`} />
              <span>{isBulkSyncing ? 'Syncing Catalog...' : 'Run Full Catalog Sync'}</span>
            </button>
          </div>
        </div>

        {/* Live Test Status Banner (if run) */}
        {testResult && (
          <div
            className={`mt-4 p-3.5 rounded-2xl text-xs flex items-center justify-between border ${
              testResult.success
                ? 'bg-emerald-900/40 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-900/40 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{testResult.message}</span>
              {testResult.mode && (
                <span className="font-mono text-[10px] px-2 py-0.5 bg-black/30 rounded border border-white/10">
                  Mode: {testResult.mode}
                </span>
              )}
              {testResult.latencyMs && (
                <span className="font-mono text-[10px] text-stone-300">
                  ({testResult.latencyMs}ms)
                </span>
              )}
            </div>
            <button
              onClick={() => setTestResult(null)}
              className="text-white/60 hover:text-white text-xs font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Catalog Titles</div>
          <div className="font-serif text-2xl font-bold text-[#0B192C] mt-1">{metrics.totalBooks}</div>
          <div className="text-[10px] text-stone-400 mt-0.5">Published books</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm">
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Eligible Titles</div>
          <div className="font-serif text-2xl font-bold text-emerald-700 mt-1">{metrics.eligibleBooks}</div>
          <div className="text-[10px] text-emerald-600/80 mt-0.5">Ready for Shopping</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm">
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Approved / Synced</div>
          <div className="font-serif text-2xl font-bold text-blue-700 mt-1">{metrics.approvedBooks}</div>
          <div className="text-[10px] text-blue-600/80 mt-0.5">Active on Google</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm">
          <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">In Review</div>
          <div className="font-serif text-2xl font-bold text-amber-700 mt-1">{metrics.pendingBooks}</div>
          <div className="text-[10px] text-amber-600/80 mt-0.5">Pending approval</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm">
          <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Disapproved / Issues</div>
          <div className="font-serif text-2xl font-bold text-rose-700 mt-1">{metrics.disapprovedBooks}</div>
          <div className="text-[10px] text-rose-600/80 mt-0.5">Needs correction</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Target Feed</div>
          <div className="font-mono text-xs font-bold text-stone-800 mt-1">
            {targetCountry} • {currency}
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">Language: {targetLanguage}</div>
        </div>
      </div>

      {/* Sub-tab Navigation Bar */}
      <div className="flex overflow-x-auto gap-1.5 p-1.5 bg-stone-100 rounded-2xl border border-stone-200 scrollbar-none text-xs">
        {[
          { id: 'overview', label: 'Executive Overview', icon: LayoutDashboardIcon },
          { id: 'catalog', label: 'Catalog Diagnostics & Sync', icon: Database, badge: books.length },
          { id: 'settings', label: 'Merchant Center & API Config', icon: Settings },
          { id: 'shipping', label: 'Shipping & Return Policies', icon: Truck },
          { id: 'logs', label: 'Sync History & Audit Logs', icon: Clock, badge: googleSyncLogs?.length },
          { id: 'guide', label: 'Merchant API Setup Guide', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3.5 py-2.5 rounded-xl font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-[#0B192C] shadow-sm border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C5A059]' : 'text-stone-400'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-[#0B192C] text-white' : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Save Success Alert */}
      {saveSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
            ✕
          </button>
        </div>
      )}

      {/* SUB-TAB 1: EXECUTIVE OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Integration Status & Workflow Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#0B192C]">
                      Real-time Merchant Synchronization Architecture
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Using Google Merchant API v1beta (Content API deprecated architecture eliminated)
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[11px] text-stone-400">
                  Target: {targetCountry} / {currency}
                </span>
              </div>

              {/* Status Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1">
                  <div className="font-bold text-stone-800 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Price Change Workflow</span>
                  </div>
                  <p className="text-stone-500 text-[11px] leading-relaxed">
                    Editing prices in Admin triggers automatic payload generation with micros precision
                    ({currency}) and pushes updates immediately to Google.
                  </p>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1">
                  <div className="font-bold text-stone-800 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Inventory & Stock Sync</span>
                  </div>
                  <p className="text-stone-500 text-[11px] leading-relaxed">
                    Zero stock transitions to <span className="font-mono">out_of_stock</span> on Google Shopping
                    instantly, preventing merchant disapprovals.
                  </p>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1">
                  <div className="font-bold text-stone-800 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cloudflare R2 Media Sync</span>
                  </div>
                  <p className="text-stone-500 text-[11px] leading-relaxed">
                    Book covers uploaded to Cloudflare R2 provide permanent, high-resolution public HTTPS
                    URLs required by Google image guidelines.
                  </p>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1">
                  <div className="font-bold text-stone-800 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ISBN / GTIN Validation</span>
                  </div>
                  <p className="text-stone-500 text-[11px] leading-relaxed">
                    Legitimate 10/13-digit ISBNs are mapped to GTIN. Books without an ISBN cleanly set
                    <span className="font-mono text-[10px]"> identifier_exists: false</span> without fake numbers.
                  </p>
                </div>
              </div>

              {/* Quick Jump Bar */}
              <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-stone-100 text-xs">
                <button
                  onClick={() => setActiveSubTab('catalog')}
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Inspect Catalog Diagnostics ({books.length})</span>
                </button>
                <button
                  onClick={() => setActiveSubTab('settings')}
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-stone-600" />
                  <span>Configure Merchant Credentials</span>
                </button>
                <button
                  onClick={() => setActiveSubTab('guide')}
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-stone-600" />
                  <span>View Google Cloud Setup Steps</span>
                </button>
              </div>
            </div>

            {/* Quick Stats & Credentials Status */}
            <div className="p-6 bg-stone-50 rounded-3xl border border-stone-200/80 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[10px]">
                  Connection Summary
                </h4>
                <span className="font-mono text-stone-500 text-[10px]">
                  {isAuthConfigured ? 'Live Verified' : 'Readiness Mode'}
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between py-1.5 border-b border-stone-200/60">
                  <span className="text-stone-500">Merchant Account ID:</span>
                  <span className="font-mono font-bold text-stone-800">
                    {merchantAccountId || '109284719 (Default)'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-stone-200/60">
                  <span className="text-stone-500">Data Source Name:</span>
                  <span className="font-medium text-stone-800 truncate max-w-[150px]" title={dataSourceName}>
                    {dataSourceName}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-stone-200/60">
                  <span className="text-stone-500">Feed Label / Channel:</span>
                  <span className="font-mono text-stone-800">{feedLabel} / online</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-stone-200/60">
                  <span className="text-stone-500">Auto-Sync on Changes:</span>
                  <span className={`font-bold ${autoSync ? 'text-emerald-700' : 'text-stone-400'}`}>
                    {autoSync ? 'Active (Auto)' : 'Disabled'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-stone-200/60">
                  <span className="text-stone-500">Last Full Sync:</span>
                  <span className="font-mono text-stone-700 text-[11px]">
                    {metrics.lastSyncTimestamp !== 'Never'
                      ? new Date(metrics.lastSyncTimestamp).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Never'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="w-full py-2.5 bg-white hover:bg-stone-100 text-[#0B192C] font-bold rounded-xl border border-stone-300 text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                  <span>Validate API Connection</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Diagnostics preview */}
          <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-[#0B192C]">
                  Catalog Readiness Overview
                </h3>
                <p className="text-[11px] text-stone-500">
                  Pre-flight validation check against Google Shopping Product Data Specifications
                </p>
              </div>
              <button
                onClick={() => setActiveSubTab('catalog')}
                className="text-xs font-bold text-[#0B192C] hover:text-[#C5A059] flex items-center gap-1 cursor-pointer"
              >
                <span>View All Titles</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {books.map((book) => {
                const isEligible = book.googleEnabled !== false && !book.googleExcluded;
                const status = book.googleSyncStatus || (isEligible ? 'Approved' : 'Not Submitted');
                return (
                  <div
                    key={book.id}
                    className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-12 h-16 object-cover rounded shadow-sm border border-stone-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-serif font-bold text-xs text-[#0B192C] line-clamp-1">
                          {book.title}
                        </div>
                        <div className="text-[10px] text-stone-500">{book.authorName}</div>
                        <div className="text-[10px] font-mono text-stone-700 mt-1">
                          ₹{book.price} • {book.stockCount} in stock
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60">
                      {getStatusBadge(status)}
                      <button
                        onClick={() => handleSyncSingleBook(book.id)}
                        disabled={syncingBookId === book.id}
                        className="p-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 cursor-pointer disabled:opacity-50"
                        title="Sync now to Google"
                      >
                        <RefreshCw className={`w-3 h-3 ${syncingBookId === book.id ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CATALOG DIAGNOSTICS & SYNC TABLE */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-4">
          <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif font-bold text-xl text-[#0B192C]">
                  Google Shopping Catalog Inspector ({books.length} Titles)
                </h3>
                <p className="text-xs text-stone-500">
                  Pre-flight checks, GTIN/ISBN verification, live status sync, and payload inspection.
                </p>
              </div>

              {/* Bulk Action Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {selectedBookIds.length > 0 && (
                  <button
                    onClick={handleSyncSelected}
                    disabled={isBulkSyncing}
                    className="px-3.5 py-2 bg-[#0B192C] text-[#C5A059] font-bold rounded-xl text-xs hover:bg-[#152A4A] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Sync Selected ({selectedBookIds.length})</span>
                  </button>
                )}

                <button
                  onClick={handleRunFullCatalogSync}
                  disabled={isBulkSyncing}
                  className="px-4 py-2 bg-[#C5A059] text-[#0B192C] font-bold rounded-xl text-xs hover:bg-[#b08b47] transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isBulkSyncing ? 'animate-spin' : ''}`} />
                  <span>{isBulkSyncing ? 'Syncing...' : 'Sync All Titles'}</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
              <div className="flex-1 min-w-[220px] relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  placeholder="Filter by title, ISBN, or SKU..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {(['all', 'eligible', 'synced', 'issues', 'excluded'] as const).map((filterVal) => (
                  <button
                    key={filterVal}
                    onClick={() => setCatalogFilter(filterVal)}
                    className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-colors cursor-pointer ${
                      catalogFilter === filterVal
                        ? 'bg-[#0B192C] text-white'
                        : 'bg-white text-stone-600 hover:bg-stone-200/70 border border-stone-300'
                    }`}
                  >
                    {filterVal}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-100 text-stone-600 uppercase text-[10px]">
                  <tr>
                    <th className="p-3 w-8">
                      <input
                        type="checkbox"
                        checked={
                          selectedBookIds.length > 0 &&
                          selectedBookIds.length === filteredCatalog.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBookIds(filteredCatalog.map((b) => b.bookId));
                          } else {
                            setSelectedBookIds([]);
                          }
                        }}
                        className="w-4 h-4 rounded accent-[#0B192C]"
                      />
                    </th>
                    <th className="p-3">Book & Details</th>
                    <th className="p-3">ISBN / GTIN</th>
                    <th className="p-3">Price & Stock</th>
                    <th className="p-3">Google Status</th>
                    <th className="p-3">Pre-Flight Audit</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredCatalog.map((item) => {
                    const fullBook = books.find((b) => b.id === item.bookId);
                    const isSelected = selectedBookIds.includes(item.bookId);
                    return (
                      <tr key={item.bookId} className="hover:bg-stone-50 transition-colors">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBookIds([...selectedBookIds, item.bookId]);
                              } else {
                                setSelectedBookIds(selectedBookIds.filter((id) => id !== item.bookId));
                              }
                            }}
                            className="w-4 h-4 rounded accent-[#0B192C]"
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            {fullBook?.coverImage ? (
                              <img
                                src={fullBook.coverImage}
                                alt={item.title}
                                className="w-10 h-14 object-cover rounded shadow-sm border border-stone-200 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-14 bg-stone-200 rounded flex items-center justify-center text-stone-400">
                                📖
                              </div>
                            )}
                            <div>
                              <div className="font-serif font-bold text-stone-900 text-sm line-clamp-1">
                                {item.title}
                              </div>
                              <div className="text-[10px] text-stone-500">
                                SKU: <span className="font-mono">{item.sku || `BK-${item.bookId}`}</span>
                              </div>
                              <div className="text-[10px] text-stone-400">
                                Category: {fullBook?.googleProductCategory || 'Media > Books'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3 font-mono">
                          {item.isbn ? (
                            <div>
                              <span className="font-bold text-stone-800">{item.isbn}</span>
                              <div className="text-[9px] text-emerald-600 font-sans">GTIN mapped</div>
                            </div>
                          ) : (
                            <div>
                              <span className="text-stone-400 italic">No ISBN</span>
                              <div className="text-[9px] text-amber-600 font-sans">identifier_exists: false</div>
                            </div>
                          )}
                        </td>

                        <td className="p-3">
                          <div className="font-mono font-bold text-stone-900">₹{item.price}</div>
                          <div
                            className={`text-[10px] font-semibold ${
                              item.stockCount > 0 ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            {item.stockCount > 0 ? `${item.stockCount} copies in stock` : 'Out of stock'}
                          </div>
                        </td>

                        <td className="p-3">
                          <div>
                            {getStatusBadge(item.googleSyncStatus)}
                            {item.lastSyncedAt && (
                              <div className="text-[9px] text-stone-400 mt-1">
                                Synced:{' '}
                                {new Date(item.lastSyncedAt).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="p-3">
                          {item.issues && item.issues.length > 0 ? (
                            <div className="space-y-1">
                              {item.issues.map((issue: string, idx: number) => (
                                <div
                                  key={idx}
                                  className="text-[10px] text-amber-700 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
                                >
                                  <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span>{issue}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-[10px] text-emerald-700 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Ready for Shopping</span>
                            </div>
                          )}
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSyncSingleBook(item.bookId)}
                              disabled={syncingBookId === item.bookId}
                              className="px-2.5 py-1.5 bg-[#0B192C] text-[#C5A059] font-bold rounded-lg hover:bg-[#152A4A] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Sync to Google Merchant"
                            >
                              <RefreshCw
                                className={`w-3 h-3 ${syncingBookId === item.bookId ? 'animate-spin' : ''}`}
                              />
                              <span className="text-[10px]">Sync</span>
                            </button>

                            <button
                              onClick={() => setInspectPayloadBook(fullBook || item)}
                              className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg border border-stone-300 cursor-pointer"
                              title="View API JSON Payload"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleRemoveSingleBook(item.bookId)}
                              disabled={syncingBookId === item.bookId}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200 cursor-pointer"
                              title="Remove from Google Merchant"
                            >
                              <XCircle className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* SUB-TAB 3: SETTINGS & MERCHANT API CONFIG */}
      {activeSubTab === 'settings' && (
        <form onSubmit={handleSaveAllSettings} className="space-y-6">
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-6 text-xs">
            <div className="border-b border-stone-200 pb-4">
              <h3 className="font-serif font-bold text-lg text-[#0B192C]">
                Google Merchant Center Account & Feed Settings
              </h3>
              <p className="text-stone-500 text-xs">
                Configure Merchant Center credentials, Data Source specifications, and automatic
                synchronization triggers.
              </p>
            </div>

            {/* Account & Feed IDs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Merchant Center Account ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 109284719"
                  value={merchantAccountId}
                  onChange={(e) => setMerchantAccountId(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-sm"
                />
                <span className="text-[10px] text-stone-400">Found in top right of Merchant Center Next</span>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Data Source Name *
                </label>
                <input
                  type="text"
                  required
                  value={dataSourceName}
                  onChange={(e) => setDataSourceName(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                />
                <span className="text-[10px] text-stone-400">Primary product feed name in Merchant Center</span>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Feed Label / Channel
                </label>
                <input
                  type="text"
                  value={feedLabel}
                  onChange={(e) => setFeedLabel(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                />
                <span className="text-[10px] text-stone-400">Default: online (Channel: online)</span>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Target Country (ISO 3166-1)
                </label>
                <input
                  type="text"
                  value={targetCountry}
                  onChange={(e) => setTargetCountry(e.target.value.toUpperCase())}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                />
                <span className="text-[10px] text-stone-400">Default: IN (India)</span>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Target Language (ISO 639-1)
                </label>
                <input
                  type="text"
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value.toLowerCase())}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                />
                <span className="text-[10px] text-stone-400">Default: en (English)</span>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Currency (ISO 4217)
                </label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                />
                <span className="text-[10px] text-stone-400">Default: INR (Indian Rupee)</span>
              </div>
            </div>

            {/* Auto-Sync Triggers */}
            <div className="pt-4 border-t border-stone-200">
              <h4 className="font-bold text-stone-800 text-sm mb-2">Automated Sync Triggers</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#0B192C]"
                  />
                  <div>
                    <div className="font-bold text-stone-800">Auto-Sync on Product Changes</div>
                    <div className="text-[10px] text-stone-500">
                      Instantly push book modifications to Google Merchant API upon saving
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncPriceChanges}
                    onChange={(e) => setSyncPriceChanges(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#0B192C]"
                  />
                  <div>
                    <div className="font-bold text-stone-800">Price Changes Auto-Sync</div>
                    <div className="text-[10px] text-stone-500">
                      Sync new sale/discount prices to prevent price mismatch penalties
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncStockChanges}
                    onChange={(e) => setSyncStockChanges(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#0B192C]"
                  />
                  <div>
                    <div className="font-bold text-stone-800">Stock & Availability Auto-Sync</div>
                    <div className="text-[10px] text-stone-500">
                      Automatically mark books as out_of_stock when copies reach 0
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncImageUpdates}
                    onChange={(e) => setSyncImageUpdates(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#0B192C]"
                  />
                  <div>
                    <div className="font-bold text-stone-800">Cloudflare R2 Cover Image Sync</div>
                    <div className="text-[10px] text-stone-500">
                      Push permanent R2 image link updates whenever cover is replaced
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Daily Full Sync Schedule */}
            <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dailySyncSchedule}
                  onChange={(e) => setDailySyncSchedule(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#0B192C]"
                />
                <div>
                  <div className="font-bold text-stone-800">Scheduled Daily Full Catalog Sync</div>
                  <div className="text-[10px] text-stone-500">
                    Re-verify all {books.length} titles daily to prevent 30-day offer expiration
                  </div>
                </div>
              </label>

              {dailySyncSchedule && (
                <div className="flex items-center gap-2">
                  <span className="text-stone-600 font-bold">Execution Time:</span>
                  <input
                    type="time"
                    value={dailySyncTime}
                    onChange={(e) => setDailySyncTime(e.target.value)}
                    className="p-2 bg-stone-50 border border-stone-300 rounded-xl font-mono text-xs"
                  />
                  <span className="text-[10px] text-stone-400">(IST)</span>
                </div>
              )}
            </div>

            {/* Authentication Credentials Info */}
            <div className="pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-stone-800 text-sm">
                  Google Cloud Authentication Strategy
                </h4>
                <span className="font-mono text-[10px] text-stone-400">
                  Secured Server-Side (Zero Client Exposure)
                </span>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="radio"
                      name="authMethod"
                      value="service_account"
                      checked={authMethod === 'service_account'}
                      onChange={() => setAuthMethod('service_account')}
                      className="accent-[#0B192C]"
                    />
                    <span>Option A: Service Account (Recommended for Server Sync)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="radio"
                      name="authMethod"
                      value="oauth2"
                      checked={authMethod === 'oauth2'}
                      onChange={() => setAuthMethod('oauth2')}
                      className="accent-[#0B192C]"
                    />
                    <span>Option B: OAuth 2.0 (Client ID + Refresh Token)</span>
                  </label>
                </div>

                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Credentials are automatically read from the backend environment configuration
                  (<span className="font-mono">GOOGLE_MERCHANT_CLIENT_ID</span>,{' '}
                  <span className="font-mono">GOOGLE_MERCHANT_REFRESH_TOKEN</span>, or Service Account JSON).
                  When active credentials are not yet saved, the system runs in{' '}
                  <strong className="text-stone-800">Readiness & Validation Mode</strong>: validating all schemas,
                  generating compliant payloads, and logging simulated transactions with zero downtime.
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl cursor-pointer"
              >
                {testingConnection ? 'Testing...' : 'Test Connection'}
              </button>

              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-6 py-2.5 bg-[#0B192C] text-[#C5A059] font-bold rounded-xl hover:bg-[#152A4A] shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSavingSettings ? 'Saving...' : 'Save Google Shopping Settings'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* SUB-TAB 4: SHIPPING & RETURN POLICIES */}
      {activeSubTab === 'shipping' && (
        <form onSubmit={handleSaveAllSettings} className="space-y-6">
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-6 text-xs">
            <div className="border-b border-stone-200 pb-4">
              <h3 className="font-serif font-bold text-lg text-[#0B192C]">
                Shipping & Return Policy Specifications
              </h3>
              <p className="text-stone-500 text-xs">
                Google Shopping requires explicit shipping transit times and return policy rules attached
                to each product payload to qualify for Free Product Listings in India.
              </p>
            </div>

            {/* Shipping Config */}
            <div className="space-y-4">
              <h4 className="font-bold text-stone-800 text-sm flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#C5A059]" />
                <span>Domestic Delivery & Fulfillment (India)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Standard Shipping Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={defaultShippingCost}
                    onChange={(e) => setDefaultShippingCost(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-sm"
                  />
                  <span className="text-[10px] text-stone-400">Default rate for orders below threshold</span>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Free Shipping Minimum Order (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-sm"
                  />
                  <span className="text-[10px] text-stone-400">Orders &ge; ₹500 get Free Delivery</span>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Handling Time (Min - Max Days)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      value={minHandlingDays}
                      onChange={(e) => setMinHandlingDays(Number(e.target.value))}
                      className="p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-sm text-center"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      min="1"
                      value={maxHandlingDays}
                      onChange={(e) => setMaxHandlingDays(Number(e.target.value))}
                      className="p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-sm text-center"
                      placeholder="Max"
                    />
                  </div>
                  <span className="text-[10px] text-stone-400">Warehouse pack & dispatch window (1-2 days)</span>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Transit Time (Min - Max Days)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="1"
                      value={minTransitDays}
                      onChange={(e) => setMinTransitDays(Number(e.target.value))}
                      className="p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-sm text-center"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      min="1"
                      value={maxTransitDays}
                      onChange={(e) => setMaxTransitDays(Number(e.target.value))}
                      className="p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-sm text-center"
                      placeholder="Max"
                    />
                  </div>
                  <span className="text-[10px] text-stone-400">Courier partner transit time (3-7 days)</span>
                </div>
              </div>
            </div>

            {/* Return Policy Config */}
            <div className="pt-4 border-t border-stone-200 space-y-4">
              <h4 className="font-bold text-stone-800 text-sm flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-[#C5A059]" />
                <span>Return & Exchange Policy Specifications</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Return Window (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={returnWindowDays}
                    onChange={(e) => setReturnWindowDays(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-sm"
                  />
                  <span className="text-[10px] text-stone-400">Standard book replacement window (14 days)</span>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Return Shipping Fee Policy
                  </label>
                  <select
                    value={returnShippingFee}
                    onChange={(e) => setReturnShippingFee(e.target.value as any)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-semibold"
                  >
                    <option value="customer_pays">Customer Pays Return Shipping</option>
                    <option value="free">Free Return Shipping</option>
                  </select>
                  <span className="text-[10px] text-stone-400">Displayed in Google product reviews & badges</span>
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block font-bold text-stone-700 mb-1">
                    Return Policy Public URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={returnPolicyUrl}
                    onChange={(e) => setReturnPolicyUrl(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-xs"
                  />
                  <span className="text-[10px] text-stone-400">Public policy link crawled by Googlebot</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-6 py-2.5 bg-[#0B192C] text-[#C5A059] font-bold rounded-xl hover:bg-[#152A4A] shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSavingSettings ? 'Saving...' : 'Save Shipping & Return Policy'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* SUB-TAB 5: SYNC HISTORY & LOGS */}
      {activeSubTab === 'logs' && (
        <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#0B192C]">
                Google Merchant Sync Logs ({googleSyncLogs?.length || 0})
              </h3>
              <p className="text-stone-500 text-xs">
                Real-time chronological record of every insert, price update, stock change, and delete.
              </p>
            </div>
            <button
              onClick={() => fetchGoogleMerchantLogs()}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Logs</span>
            </button>
          </div>

          {googleSyncLogs && googleSyncLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-100 text-stone-600 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Resource / Book</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Result / Message</th>
                    <th className="p-3">Issues</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono">
                  {googleSyncLogs.slice(0, 50).map((log: GoogleMerchantSyncLog) => {
                    const logTime = new Date(log.timestamp || log.requestTimestamp || Date.now());
                    const isSuccess = log.status === 'SUCCESS';
                    const isWarning = log.status === 'NEEDS_ATTENTION' || (log.status as string) === 'WARNING';
                    const isPending = log.status === 'PENDING';
                    return (
                      <tr key={log.id} className="hover:bg-stone-50 transition-colors">
                        <td className="p-3 text-stone-500 text-[10px]">
                          {logTime.toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}{' '}
                          •{' '}
                          {logTime.toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-800 font-bold text-[10px]">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3 font-sans text-stone-900 font-semibold text-xs">
                          {log.bookTitle || log.bookId || 'System'}
                        </td>
                        <td className="p-3 font-sans">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isSuccess
                                ? 'bg-emerald-100 text-emerald-800'
                                : isWarning || isPending
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3 font-sans text-stone-600 text-xs line-clamp-1 max-w-xs">
                          {log.message || log.safeErrorMessage || 'Completed successfully'}
                        </td>
                        <td className="p-3 font-sans">
                          {log.issues && log.issues.length > 0 ? (
                            <span className="text-amber-700 text-[10px] font-semibold">
                              {log.issues.length} notice(s)
                            </span>
                          ) : (
                            <span className="text-stone-400 text-[10px]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-stone-400 space-y-2">
              <Clock className="w-8 h-8 mx-auto text-stone-300" />
              <div className="font-serif font-bold text-stone-700 text-sm">No Sync Operations Yet</div>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Trigger a sync on any book or click "Run Full Catalog Sync" to view chronological API
                transactions.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 6: API SETUP GUIDE */}
      {activeSubTab === 'guide' && (
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-6 text-xs text-stone-700 leading-relaxed">
          <div className="border-b border-stone-200 pb-4">
            <h3 className="font-serif font-bold text-lg text-[#0B192C]">
              Google Merchant API v1beta Setup Guide
            </h3>
            <p className="text-stone-500 text-xs">
              Follow these standard Google Cloud Console steps to link your Google Merchant Center account.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <div className="font-serif font-bold text-sm text-[#0B192C] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#0B192C] text-[#C5A059] flex items-center justify-center text-[11px] font-mono">
                  1
                </span>
                <span>Enable Merchant API in Google Cloud</span>
              </div>
              <p className="text-[11px] text-stone-600">
                Go to <span className="font-semibold text-stone-900">Google Cloud Console</span> &rarr;{' '}
                <span className="font-semibold text-stone-900">APIs & Services</span> &rarr; Search for{' '}
                <strong className="text-stone-900">Merchant API</strong> (or Google Merchant API v1beta) and click{' '}
                <strong>Enable</strong>.
              </p>
            </div>

            <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <div className="font-serif font-bold text-sm text-[#0B192C] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#0B192C] text-[#C5A059] flex items-center justify-center text-[11px] font-mono">
                  2
                </span>
                <span>Create Service Account or OAuth Client</span>
              </div>
              <p className="text-[11px] text-stone-600">
                Under Credentials, create a <strong>Service Account</strong> (e.g.{' '}
                <span className="font-mono text-[10px]">sahayak-merchant@project.iam.gserviceaccount.com</span>) or
                an OAuth 2.0 Web Client with redirect URI.
              </p>
            </div>

            <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <div className="font-serif font-bold text-sm text-[#0B192C] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#0B192C] text-[#C5A059] flex items-center justify-center text-[11px] font-mono">
                  3
                </span>
                <span>Grant Access in Merchant Center Next</span>
              </div>
              <p className="text-[11px] text-stone-600">
                Open <span className="font-semibold text-stone-900">Google Merchant Center</span> &rarr; Gear Icon
                &rarr; <strong>People & Access</strong> &rarr; Add the Service Account email or OAuth user as{' '}
                <strong>Standard</strong> or <strong>Admin</strong>.
              </p>
            </div>

            <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <div className="font-serif font-bold text-sm text-[#0B192C] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#0B192C] text-[#C5A059] flex items-center justify-center text-[11px] font-mono">
                  4
                </span>
                <span>Set Environment Variables</span>
              </div>
              <p className="text-[11px] text-stone-600">
                Save credentials into your server configuration:
                <code className="block mt-1 p-2 bg-stone-900 text-stone-100 rounded text-[10px] font-mono">
                  GOOGLE_MERCHANT_ACCOUNT_ID=109284719<br />
                  GOOGLE_MERCHANT_CLIENT_ID=...<br />
                  GOOGLE_MERCHANT_CLIENT_SECRET=...<br />
                  GOOGLE_MERCHANT_REFRESH_TOKEN=...
                </code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT JSON PAYLOAD MODAL */}
      {inspectPayloadBook && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setInspectPayloadBook(null)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 space-y-4 border border-stone-300 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#C5A059] font-bold">
                  Google Merchant API v1beta Payload Preview
                </span>
                <h3 className="font-serif text-lg font-bold text-[#0B192C]">
                  {inspectPayloadBook.title}
                </h3>
              </div>
              <button
                onClick={() => setInspectPayloadBook(null)}
                className="text-stone-400 hover:text-stone-700 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-stone-900 text-emerald-400 rounded-2xl font-mono text-[11px] max-h-96 overflow-y-auto">
              <pre>
                {JSON.stringify(
                  {
                    channel: 'ONLINE',
                    contentLanguage: targetLanguage,
                    feedLabel: feedLabel,
                    offerId: inspectPayloadBook.sku || `BK-${inspectPayloadBook.id}`,
                    targetCountry: targetCountry,
                    productAttributes: {
                      title: inspectPayloadBook.title,
                      description:
                        inspectPayloadBook.description ||
                        'Scholarly treatise published by Sahayak Associates.',
                      link: `https://sahayakassociates.com/books/${inspectPayloadBook.slug || inspectPayloadBook.id}`,
                      imageLink: inspectPayloadBook.coverImage,
                      availability:
                        (inspectPayloadBook.stockCount || 0) > 0 ? 'in_stock' : 'out_of_stock',
                      condition: inspectPayloadBook.googleCondition || 'new',
                      price: {
                        amountMicros: Math.round(Number(inspectPayloadBook.price) * 1_000_000).toString(),
                        currency: currency,
                      },
                      brand: inspectPayloadBook.brand || 'Sahayak Associates',
                      googleProductCategory:
                        inspectPayloadBook.googleProductCategory || 'Media > Books',
                      gtin: inspectPayloadBook.isbn || undefined,
                      identifierExists: Boolean(inspectPayloadBook.isbn),
                      shipping: [
                        {
                          country: targetCountry,
                          price: {
                            amountMicros:
                              Number(inspectPayloadBook.price) >= freeShippingThreshold
                                ? '0'
                                : (defaultShippingCost * 1_000_000).toString(),
                            currency: currency,
                          },
                          minHandlingTime: minHandlingDays,
                          maxHandlingTime: maxHandlingDays,
                          minTransitTime: minTransitDays,
                          maxTransitTime: maxTransitDays,
                        },
                      ],
                    },
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-xs">
              <span className="text-stone-400 text-[11px]">
                Valid schema for Google Merchant API (Products v1beta)
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(inspectPayloadBook, null, 2));
                  setCopiedPayload(true);
                  setTimeout(() => setCopiedPayload(false), 2000);
                }}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPayload ? 'Copied!' : 'Copy Payload'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Fallback icon helper
function LayoutDashboardIcon(props: any) {
  return <ShoppingBag {...props} />;
}

export default AdminGoogleShoppingSection;
