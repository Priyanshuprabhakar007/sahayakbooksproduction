import React, { useState, useEffect } from 'react';
import { Cloud, CheckCircle2, AlertTriangle, RefreshCw, Server, ShieldCheck, Database, Key, Globe, FileText, Check, Copy } from 'lucide-react';
import { fetchR2StorageStatus, runR2ConnectionTest } from '../services/r2MediaService';
import { R2StorageStatus } from '../types';

export const R2StorageSettingsCard: React.FC = () => {
  const [status, setStatus] = useState<R2StorageStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
    objectsCount?: number;
    bucket?: string;
    error?: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const data = await fetchR2StorageStatus();
      setStatus(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await runR2ConnectionTest();
      setTestResult(res);
      if (res.success && status) {
        setStatus({ ...status, isConnected: true, objectsCount: res.objectsCount });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed',
        error: 'NETWORK_ERROR',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const envVarsTemplate = `# Cloudflare R2 Credentials in AI Studio / Deployment Settings:
CLOUDFLARE_R2_ACCOUNT_ID="your_account_id"
CLOUDFLARE_R2_ACCESS_KEY_ID="your_access_key_id"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your_secret_access_key"
CLOUDFLARE_R2_BUCKET_NAME="sahayak-media"
CLOUDFLARE_R2_PUBLIC_URL="https://media.sahayakassociates.org"`;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C5A059] mb-1">
          <Cloud className="w-4 h-4" />
          <span>Object Storage & Media Infrastructure</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#0B192C]">
          Cloudflare R2 Storage Configuration
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Secure, zero-egress fee object storage engine powering all book covers, author portraits, brand logos, blog assets, and public documents.
        </p>
      </div>

      {/* Main Status Hero Card */}
      <div className="bg-[#0B192C] text-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-[#C5A059]/40 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] shadow-inner shrink-0">
              <Cloud className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl font-bold text-white">
                  Storage Provider: Cloudflare R2
                </h3>
                {status?.isConfigured ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Configured & Active</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Emulated Dev Storage</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                S3-Compatible Object Storage • Automatic WebP/AVIF Optimization • Immutable 1-Year CDN Caching
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-4 py-2.5 bg-[#C5A059] hover:bg-[#D4AF37] text-[#0B192C] text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Pinging R2...' : 'Test R2 Connection'}</span>
            </button>
            <button
              onClick={loadStatus}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-stone-200 rounded-xl transition-colors cursor-pointer"
              title="Refresh Storage Status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 text-stone-400 font-medium">
              <Database className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Target Bucket</span>
            </div>
            <div className="font-bold text-white font-mono text-sm truncate">
              {status?.bucketName || 'Not Set'}
            </div>
            <p className="text-[10px] text-stone-400">Object root container</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 text-stone-400 font-medium">
              <Globe className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Public CDN Domain</span>
            </div>
            <div className="font-bold text-white font-mono text-xs truncate" title={status?.publicUrl}>
              {status?.publicUrl || 'Direct R2 pub-r2.dev'}
            </div>
            <p className="text-[10px] text-stone-400">Zero-egress fast delivery</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 text-stone-400 font-medium">
              <Key className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Account ID</span>
            </div>
            <div className="font-bold text-white font-mono text-xs">
              {status?.accountIdMasked || '••••••••••••••••'}
            </div>
            <p className="text-[10px] text-stone-400">Server-side secured</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 text-stone-400 font-medium">
              <Server className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Region</span>
            </div>
            <div className="font-bold text-white font-mono text-sm">
              auto (Global Cloudflare)
            </div>
            <p className="text-[10px] text-stone-400">Global edge routing</p>
          </div>
        </div>

        {/* Test Result Live Banner */}
        {testResult && (
          <div
            className={`p-4 rounded-2xl border text-xs flex items-start gap-3 animate-in fade-in ${
              testResult.success
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 flex-1">
              <div className="font-bold flex items-center justify-between">
                <span>{testResult.success ? 'R2 Connection Verified Successfully' : 'R2 Diagnostics Notice'}</span>
                {testResult.latencyMs !== undefined && (
                  <span className="font-mono text-[11px] px-2 py-0.5 bg-black/40 rounded">
                    Ping: {testResult.latencyMs}ms
                  </span>
                )}
              </div>
              <p className="text-stone-300">{testResult.message}</p>
              {testResult.objectsCount !== undefined && (
                <p className="text-[11px] font-mono text-stone-400">
                  Inspected {testResult.objectsCount} sample objects in bucket.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Upload Size Rules & Security Standards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-stone-900 font-bold">
            <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
            <span>MIME Type Validation</span>
          </div>
          <p className="text-stone-500 text-[11px] leading-relaxed">
            Strict server-side validation rejecting executable binaries (.exe, .js, .html, .php).
          </p>
          <div className="flex flex-wrap gap-1">
            {['JPG', 'JPEG', 'PNG', 'WEBP', 'AVIF', 'SVG', 'PDF'].map((ext) => (
              <span key={ext} className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded font-mono text-[10px] font-bold">
                .{ext.toLowerCase()}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-stone-900 font-bold">
            <FileText className="w-4 h-4 text-[#C5A059]" />
            <span>File Size Limits</span>
          </div>
          <ul className="space-y-1.5 text-stone-600 text-[11px]">
            <li className="flex justify-between">
              <span>Catalog Book Covers:</span>
              <span className="font-mono font-bold text-stone-900">Max 10 MB</span>
            </li>
            <li className="flex justify-between">
              <span>Brand Logos & Emblems:</span>
              <span className="font-mono font-bold text-stone-900">Max 5 MB</span>
            </li>
            <li className="flex justify-between">
              <span>Resource & Preview PDFs:</span>
              <span className="font-mono font-bold text-stone-900">Max 25 MB</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-stone-900 font-bold">
            <Globe className="w-4 h-4 text-[#C5A059]" />
            <span>R2 Folder Organization</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-stone-500">
            <div>• sahayak/books/</div>
            <div>• sahayak/authors/</div>
            <div>• sahayak/branding/</div>
            <div>• sahayak/blogs/</div>
            <div>• sahayak/homepage/</div>
            <div>• sahayak/resources/</div>
          </div>
        </div>
      </div>

      {/* Environment Setup Reference Box */}
      <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-stone-800 flex items-center gap-1.5">
            <Key className="w-4 h-4 text-[#C5A059]" />
            <span>Cloudflare R2 Environment Credentials Reference</span>
          </span>
          <button
            onClick={() => handleCopy(envVarsTemplate, 'env')}
            className="px-3 py-1 bg-white hover:bg-stone-100 text-stone-700 rounded-lg border border-stone-200 font-semibold flex items-center gap-1 cursor-pointer"
          >
            {copiedKey === 'env' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copiedKey === 'env' ? 'Copied' : 'Copy Template'}</span>
          </button>
        </div>
        <pre className="p-3.5 bg-stone-900 text-amber-200/90 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
          {envVarsTemplate}
        </pre>
        <p className="text-[11px] text-stone-500">
          Set these variables in your deployment environment or secrets panel. Secrets are never exposed to the frontend browser.
        </p>
      </div>
    </div>
  );
};
