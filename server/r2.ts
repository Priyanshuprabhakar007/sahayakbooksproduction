import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

// Allowed MIME types
export const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
};

// Dangerous file extensions to strictly reject
export const DISALLOWED_EXTENSIONS = [
  '.exe', '.js', '.jsx', '.ts', '.tsx', '.html', '.htm', '.php',
  '.sh', '.bash', '.bat', '.cmd', '.py', '.pl', '.cgi', '.jar',
  '.dll', '.so', '.vbs', '.scr', '.msi', '.com', '.pif'
];

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
  endpoint?: string;
}

let s3ClientInstance: S3Client | null = null;

export function getR2Config(): R2Config {
  return {
    accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID || '',
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
    bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || '',
    publicUrl: (process.env.CLOUDFLARE_R2_PUBLIC_URL || '').replace(/\/+$/, ''),
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || '',
  };
}

export function isR2Configured(): boolean {
  const config = getR2Config();
  return Boolean(
    config.accountId &&
    config.accessKeyId &&
    config.secretAccessKey &&
    config.bucketName
  );
}

export function getR2Client(): S3Client {
  const config = getR2Config();
  if (!isR2Configured()) {
    throw new Error('Cloudflare R2 is not fully configured. Missing credentials.');
  }

  if (!s3ClientInstance) {
    const endpoint = config.endpoint || `https://${config.accountId}.r2.cloudflarestorage.com`;
    s3ClientInstance = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return s3ClientInstance;
}

export function getSafeMaskedStatus() {
  const config = getR2Config();
  const configured = isR2Configured();
  return {
    isConfigured: configured,
    isConnected: configured, // Can be verified via test connection
    provider: configured ? ('Cloudflare R2' as const) : ('Local Emulated R2' as const),
    bucketName: config.bucketName ? `${config.bucketName.slice(0, 3)}***` : 'Not Configured',
    publicUrl: config.publicUrl || (config.bucketName ? `https://pub-r2.dev/${config.bucketName}` : 'Not Configured'),
    accountIdMasked: config.accountId ? `${config.accountId.slice(0, 4)}••••••••${config.accountId.slice(-4)}` : 'Not Configured',
    region: 'auto',
    endpoint: config.endpoint || (config.accountId ? `https://${config.accountId.slice(0, 4)}...r2.cloudflarestorage.com` : 'Default'),
    maxImageSizeMB: 10,
    maxLogoSizeMB: 5,
    maxPdfSizeMB: 25,
    lastChecked: new Date().toISOString(),
  };
}

/**
 * Perform active connection test to Cloudflare R2 bucket
 */
export async function testR2Connection(): Promise<{
  success: boolean;
  message: string;
  latencyMs?: number;
  bucket?: string;
  objectsCount?: number;
  error?: string;
}> {
  if (!isR2Configured()) {
    return {
      success: false,
      message: 'Cloudflare R2 credentials (ACCOUNT_ID, ACCESS_KEY_ID, SECRET_ACCESS_KEY, BUCKET_NAME) are missing in environment configuration.',
      error: 'UNCONFIGURED_ENVIRONMENT',
    };
  }

  const startTime = Date.now();
  const config = getR2Config();

  try {
    const client = getR2Client();
    // Test bucket accessibility
    await client.send(
      new HeadBucketCommand({
        Bucket: config.bucketName,
      })
    );

    // List recent objects to test read permissions
    const listRes = await client.send(
      new ListObjectsV2Command({
        Bucket: config.bucketName,
        MaxKeys: 10,
      })
    );

    const latencyMs = Date.now() - startTime;
    return {
      success: true,
      message: `Successfully connected to Cloudflare R2 bucket "${config.bucketName}" in ${latencyMs}ms.`,
      latencyMs,
      bucket: config.bucketName,
      objectsCount: listRes.KeyCount || 0,
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      message: `Cloudflare R2 Connection Failed: ${err.message || 'Access Denied or Bucket Not Found'}`,
      latencyMs,
      error: err.name || 'R2_CONNECTION_ERROR',
    };
  }
}

/**
 * Sanitizes input filename to prevent directory traversal and special chars
 */
export function sanitizeFilename(originalName: string): string {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  const cleanName = nameWithoutExt
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleanName || 'asset';
}

/**
 * Generates unique, structured R2 object key
 * e.g. sahayak/books/20260901-art-of-governance-a3f1.webp
 */
export function generateObjectKey(
  folder: string,
  originalFilename: string,
  extension: string
): string {
  const cleanFolder = folder.toLowerCase().replace(/[^a-z0-9-_\/]/g, '') || 'misc';
  const cleanSlug = sanitizeFilename(originalFilename);
  const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomHex = crypto.randomBytes(3).toString('hex');
  const safeExt = extension.replace(/^\./, '').toLowerCase();

  return `sahayak/${cleanFolder}/${datePrefix}-${cleanSlug}-${randomHex}.${safeExt}`;
}

/**
 * Validates file buffer, mime type, and size limits
 */
export function validateUpload(
  mimeType: string,
  originalFilename: string,
  bufferSize: number,
  folder: string
): { valid: boolean; error?: string; extension?: string } {
  // Check extension against dangerous list
  const lowerName = originalFilename.toLowerCase();
  for (const dangerous of DISALLOWED_EXTENSIONS) {
    if (lowerName.endsWith(dangerous)) {
      return { valid: false, error: `File type "${dangerous}" is blocked for security.` };
    }
  }

  // Check MIME type
  const extension = ALLOWED_MIME_TYPES[mimeType.toLowerCase()];
  if (!extension) {
    return {
      valid: false,
      error: `Unsupported file type: ${mimeType}. Allowed formats: JPG, PNG, WebP, AVIF, SVG, GIF, PDF.`,
    };
  }

  // Validate Size Limit
  const maxBytes =
    folder.toLowerCase() === 'logos' || folder.toLowerCase() === 'branding'
      ? 5 * 1024 * 1024 // 5MB
      : mimeType === 'application/pdf'
      ? 25 * 1024 * 1024 // 25MB
      : 10 * 1024 * 1024; // 10MB default

  if (bufferSize > maxBytes) {
    const maxMB = maxBytes / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds the allowed limit of ${maxMB}MB for ${folder}.`,
    };
  }

  return { valid: true, extension };
}

/**
 * Server-side upload directly to Cloudflare R2
 */
export async function uploadBufferToR2(params: {
  buffer: Buffer;
  mimeType: string;
  originalFilename: string;
  folder: string;
  altText?: string;
  caption?: string;
  uploadedBy?: string;
}): Promise<{
  id: string;
  objectKey: string;
  publicUrl: string;
  url: string;
  name: string;
  fileName: string;
  originalFileName: string;
  mimeType: string;
  size: string;
  fileSizeBytes: number;
  folder: any;
  storageProvider: 'cloudflare-r2' | 'local';
  createdAt: string;
  altText?: string;
  caption?: string;
}> {
  const { buffer, mimeType, originalFilename, folder, altText, caption, uploadedBy } = params;

  // Validation
  const validation = validateUpload(mimeType, originalFilename, buffer.length, folder);
  if (!validation.valid || !validation.extension) {
    throw new Error(validation.error || 'Upload validation failed.');
  }

  const objectKey = generateObjectKey(folder, originalFilename, validation.extension);
  const config = getR2Config();

  let publicUrl = '';
  let storageProvider: 'cloudflare-r2' | 'local' = 'local';

  if (isR2Configured()) {
    const client = getR2Client();

    // Cache control: 1 year immutable cache since objectKey has unique random hash
    const cacheControl = 'public, max-age=31536000, immutable';

    await client.send(
      new PutObjectCommand({
        Bucket: config.bucketName,
        Key: objectKey,
        Body: buffer,
        ContentType: mimeType,
        CacheControl: cacheControl,
        Metadata: {
          originalName: encodeURIComponent(originalFilename),
          uploadedBy: uploadedBy || 'admin',
          folder: folder,
        },
      })
    );

    storageProvider = 'cloudflare-r2';

    if (config.publicUrl) {
      publicUrl = `${config.publicUrl}/${objectKey}`;
    } else {
      // Direct R2 public bucket URL format
      publicUrl = `https://pub-r2.storage.cloudflarestorage.com/${config.bucketName}/${objectKey}`;
    }
  } else {
    // Development fallback when R2 credentials are not yet set
    const base64 = `data:${mimeType};base64,${buffer.toString('base64')}`;
    publicUrl = base64;
    storageProvider = 'local';
  }

  const formattedSize =
    buffer.length < 1024 * 1024
      ? `${(buffer.length / 1024).toFixed(1)} KB`
      : `${(buffer.length / (1024 * 1024)).toFixed(2)} MB`;

  const fileName = objectKey.split('/').pop() || originalFilename;

  return {
    id: `med-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
    objectKey,
    publicUrl,
    url: publicUrl,
    name: sanitizeFilename(originalFilename).replace(/-/g, ' '),
    fileName,
    originalFileName: originalFilename,
    mimeType,
    size: formattedSize,
    fileSizeBytes: buffer.length,
    folder: folder as any,
    storageProvider,
    createdAt: new Date().toISOString(),
    altText: altText || sanitizeFilename(originalFilename),
    caption: caption || '',
  };
}

/**
 * Delete object from Cloudflare R2
 */
export async function deleteObjectFromR2(objectKey: string): Promise<{ success: boolean; message?: string }> {
  if (!isR2Configured() || !objectKey) {
    return { success: true, message: 'Local/Unconfigured object deleted from catalog.' };
  }

  try {
    const client = getR2Client();
    const config = getR2Config();

    await client.send(
      new DeleteObjectCommand({
        Bucket: config.bucketName,
        Key: objectKey,
      })
    );

    return { success: true };
  } catch (err: any) {
    console.error('Failed to delete object from R2:', err);
    return { success: false, message: err.message };
  }
}

/**
 * Generate Presigned Upload URL for high-volume or direct uploads
 */
export async function createPresignedUploadUrl(params: {
  folder: string;
  originalFilename: string;
  mimeType: string;
}): Promise<{ uploadUrl: string; objectKey: string; publicUrl: string }> {
  const { folder, originalFilename, mimeType } = params;
  const validation = validateUpload(mimeType, originalFilename, 0, folder);
  if (!validation.valid || !validation.extension) {
    throw new Error(validation.error || 'Invalid file type');
  }

  const objectKey = generateObjectKey(folder, originalFilename, validation.extension);
  const config = getR2Config();

  if (!isR2Configured()) {
    throw new Error('Cloudflare R2 is not configured.');
  }

  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: objectKey,
    ContentType: mimeType,
    CacheControl: 'public, max-age=31536000, immutable',
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
  const publicUrl = config.publicUrl
    ? `${config.publicUrl}/${objectKey}`
    : `https://pub-r2.storage.cloudflarestorage.com/${config.bucketName}/${objectKey}`;

  return {
    uploadUrl,
    objectKey,
    publicUrl,
  };
}
