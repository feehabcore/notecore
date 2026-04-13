import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

function sanitizeName(name: string) {
  return name.replace(/[^\w.-]+/g, '_');
}

async function blobToBase64(blob: Blob) {
  const buffer = await blob.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export async function exportBlob(name: string, blob: Blob) {
  const fileName = sanitizeName(name);
  if (!Capacitor.isNativePlatform()) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return;
  }

  const data = await blobToBase64(blob);
  const { uri } = await Filesystem.writeFile({
    path: fileName,
    data,
    directory: Directory.Cache,
  });
  await Share.share({
    title: 'Export file',
    text: fileName,
    url: uri,
  });
}

export async function exportDataUrl(name: string, dataUrl: string) {
  const [meta, content] = dataUrl.split(',', 2);
  if (!meta || !content) return;
  const mimeMatch = /data:(.*?);base64/.exec(meta);
  const mime = mimeMatch?.[1] ?? 'application/octet-stream';
  const bytes = Uint8Array.from(atob(content), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: mime });
  await exportBlob(name, blob);
}

