// Helper to reliably extract file extension from URL, item metadata, or MIME type
export const extractFileExtension = (url: string, itemObj?: any, msgObj?: any): string => {
  if (!url && !itemObj && !msgObj) return '';

  // 1. Check if format or extension is explicitly specified in itemObj or msgObj
  const explicitFormat =
    itemObj?.format ||
    itemObj?.ext ||
    itemObj?.extension ||
    msgObj?.format ||
    msgObj?.fileFormat ||
    msgObj?.attachment?.format;
  if (explicitFormat && typeof explicitFormat === 'string') {
    return explicitFormat.replace(/^\./, '').toLowerCase();
  }

  const rawUrl = String(url || itemObj?.url || itemObj?.secure_url || itemObj?.file || '');

  // 2. Check query params or Cloudinary URL transformations for format (e.g. format=pdf, format=png, f_pdf, f_png)
  const formatQueryMatch = rawUrl.match(/[?&]format=([a-zA-Z0-9]+)/i);
  if (formatQueryMatch) {
    return formatQueryMatch[1].toLowerCase();
  }

  const cldFormatMatch = rawUrl.match(/\/f_([a-zA-Z0-9]+)[\/,]/i);
  if (cldFormatMatch && cldFormatMatch[1].toLowerCase() !== 'auto') {
    return cldFormatMatch[1].toLowerCase();
  }

  // 3. Check if PDF is indicated anywhere in the URL (path, filename, or query)
  if (
    /\.pdf($|[?#])/i.test(rawUrl) ||
    /format=pdf/i.test(rawUrl) ||
    rawUrl.toLowerCase().includes('.pdf') ||
    rawUrl.toLowerCase().includes('format=pdf')
  ) {
    return 'pdf';
  }

  // 4. Check url path for standard file extension (before query string)
  const cleanUrl = rawUrl.split('?')[0].split('#')[0];
  const urlExtMatch = cleanUrl.match(/\.([a-zA-Z0-9]{2,6})$/);
  if (urlExtMatch) {
    return urlExtMatch[1].toLowerCase();
  }

  // 5. Check MIME types
  const mime = (
    itemObj?.type ||
    itemObj?.mimeType ||
    msgObj?.fileType ||
    msgObj?.attachment?.type ||
    ''
  ).toLowerCase();
  if (mime.includes('pdf')) return 'pdf';
  if (mime.includes('image/png')) return 'png';
  if (mime.includes('image/jpeg') || mime.includes('image/jpg')) return 'jpg';
  if (mime.includes('image/webp')) return 'webp';
  if (mime.includes('image/gif')) return 'gif';
  if (mime.includes('image/svg')) return 'svg';
  if (mime.includes('application/zip') || mime.includes('zip')) return 'zip';
  if (mime.includes('text/csv') || mime.includes('csv')) return 'csv';
  if (mime.includes('text/plain')) return 'txt';
  if (mime.includes('word') || mime.includes('docx')) return 'docx';
  if (mime.includes('sheet') || mime.includes('xlsx')) return 'xlsx';

  // 6. Check common video extensions
  if (/\.(mp4|webm|ogg|mov|mkv|avi|m4v)($|[?#])/i.test(rawUrl) || rawUrl.includes('/video/')) {
    return 'mp4';
  }

  // 7. Check if Cloudinary raw file
  if (cleanUrl.includes('cloudinary.com') && cleanUrl.includes('/raw/')) {
    return '';
  }

  // 8. If Cloudinary image upload and not pdf/doc/video, fallback to image format (jpg/png)
  if (
    cleanUrl.includes('cloudinary.com') &&
    cleanUrl.includes('/image/') &&
    !rawUrl.toLowerCase().includes('pdf') &&
    !rawUrl.toLowerCase().includes('format=')
  ) {
    return 'png';
  }

  return '';
};

// Formats file name to ensure it ALWAYS has its proper extension
export const formatFileNameWithExtension = (name: string, url: string, itemObj?: any, msgObj?: any): string => {
  let trimmed = (name || '').trim();

  // Try extracting filename from URL query params (e.g. ?filename=my_doc.pdf or ?name=photo.jpg)
  if (!trimmed || trimmed === 'Attachment' || trimmed === 'download' || trimmed === 'download.png') {
    const rawUrl = String(url || itemObj?.url || '');
    const qNameMatch = rawUrl.match(/[?&](?:filename|original_filename|name|file|title)=([^&#]+)/i);
    if (qNameMatch) {
      try {
        const decoded = decodeURIComponent(qNameMatch[1]).trim();
        if (decoded) trimmed = decoded;
      } catch {
        // ignore decoding error
      }
    }
  }

  if (!trimmed) {
    trimmed = 'Attachment';
  }

  const ext = extractFileExtension(url, itemObj, msgObj);

  // If the name already ends with the correct extension (case insensitive)
  if (ext && new RegExp(`\\.${ext}$`, 'i').test(trimmed)) {
    return trimmed;
  }

  // If name has a different extension (e.g. name was "download.png", but format is "pdf"!)
  if (ext && /\.[a-zA-Z0-9]{2,6}$/.test(trimmed)) {
    const currentExtMatch = trimmed.match(/\.([a-zA-Z0-9]{2,6})$/);
    const currentExt = currentExtMatch ? currentExtMatch[1].toLowerCase() : '';
    if (currentExt !== ext) {
      return trimmed.replace(/\.[a-zA-Z0-9]{2,6}$/, `.${ext}`);
    }
    return trimmed;
  }

  if (/\.[a-zA-Z0-9]{2,6}$/.test(trimmed)) {
    return trimmed;
  }

  return ext ? `${trimmed}.${ext}` : trimmed;
};

// Parse JSON payload from custom offer string or object
export const parseOffer = (desc?: any) => {
  if (!desc) return null;
  if (typeof desc === 'object' && (desc.price !== undefined || desc.packageID || desc.delivery)) {
    return desc;
  }
  if (typeof desc !== 'string') return null;
  const str = desc.trim();
  if (str.includes('[CUSTOM_OFFER]')) {
    try {
      const jsonPart = str.substring(str.indexOf('[CUSTOM_OFFER]') + '[CUSTOM_OFFER]'.length).trim();
      return JSON.parse(jsonPart);
    } catch (err) {
      console.error("Failed to parse custom offer json:", err);
      return null;
    }
  }
  return null;
};

// Parse JSON payload from video meeting invite string or object
export const parseMeeting = (desc?: any) => {
  if (!desc) return null;
  if (typeof desc === 'object' && (desc.roomUrl || desc.meetingId || desc.joinUrl)) {
    return desc;
  }
  if (typeof desc !== 'string') return null;
  const str = desc.trim();
  if (str.includes('[MEETING_INVITE]')) {
    try {
      const jsonPart = str.substring(str.indexOf('[MEETING_INVITE]') + '[MEETING_INVITE]'.length).trim();
      return JSON.parse(jsonPart);
    } catch (err) {
      console.error("Failed to parse meeting invite json:", err);
      return null;
    }
  }
  return null;
};

// Check if a file is an image
export const isImageFile = (file: { name: string; url: string }): boolean => {
  const url = (file.url || '').toLowerCase();
  const name = (file.name || '').toLowerCase();

  // Check if PDF (never treat as image!)
  const isPdf =
    url.includes('format=pdf') ||
    url.includes('.pdf') ||
    name.endsWith('.pdf') ||
    /\.pdf($|[?#])/i.test(url);
  if (isPdf) return false;

  const isDoc =
    /\.(docx?|xlsx?|pptx?|txt|csv|zip|rar|tar|gz)($|[?#])/i.test(url) ||
    /\.(docx?|xlsx?|pptx?|txt|csv|zip|rar|tar|gz)$/i.test(name) ||
    /[?&]format=(docx?|xlsx?|pptx?|zip|rar|tar|gz|txt|csv)/i.test(url);
  if (isDoc) return false;

  const isVideo =
    /\.(mp4|webm|ogg|mov|mkv|avi|m4v|3gp)($|[?#])/i.test(url) ||
    /\.(mp4|webm|ogg|mov|mkv|avi|m4v|3gp)$/i.test(name) ||
    /[?&]format=(mp4|webm|ogg|mov)/i.test(url);
  if (isVideo) return false;

  return Boolean(
    /\.(png|jpe?g|gif|webp|svg|bmp|avif)($|[?#])/i.test(url) ||
    /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i.test(name) ||
    /[?&]format=(png|jpe?g|gif|webp|svg|bmp|avif)/i.test(url) ||
    (url.includes('cloudinary.com') && url.includes('/image/upload/') && !url.includes('pdf'))
  );
};

// Check if a file is a PDF
export const isPdfFile = (file: { name?: string; url?: string }): boolean => {
  const url = (file?.url || '').toLowerCase();
  const name = (file?.name || '').toLowerCase();
  return (
    url.includes('format=pdf') ||
    url.includes('.pdf') ||
    name.endsWith('.pdf') ||
    /\.pdf($|[?#])/i.test(url)
  );
};

