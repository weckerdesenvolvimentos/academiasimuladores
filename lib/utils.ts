import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function generateCode(codeBase: string, sequence: number): string {
  return `SIM-${codeBase}-${sequence.toString().padStart(3, '0')}`;
}

export function calculateRiceScore(
  reach: number,
  impact: number,
  confidence: number,
  effort: number
): number {
  if (effort === 0) return 0;
  return (reach * impact * confidence) / effort;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateEmbedUrl(url: string): boolean {
  const allowedDomains = [
    'itch.io',
    'sketchfab.com',
    'youtube.com',
    'vimeo.com',
    'codepen.io',
    'jsfiddle.net',
  ];

  try {
    const urlObj = new URL(url);
    return (
      urlObj.protocol === 'https:' &&
      allowedDomains.some((domain) => urlObj.hostname.includes(domain))
    );
  } catch {
    return false;
  }
}

export function extractIframeSrc(html: string): string | null {
  const match = html.match(/src=["']([^"']+)["']/);
  return match ? match[1] : null;
}

export function normalizeIframeHtml(src: string): string {
  return `<iframe src="${src}" sandbox="allow-scripts allow-same-origin" referrerpolicy="no-referrer" allow="fullscreen" width="100%" height="400" frameborder="0"></iframe>`;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k**i).toFixed(2))  } ${  sizes[i]}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'IDEIA':
      return 'text-blue-500';
    case 'PROTOTIPO':
      return 'text-yellow-500';
    case 'PILOTO':
      return 'text-orange-500';
    case 'PRODUCAO':
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'IDEIA':
      return 'Ideia';
    case 'PROTOTIPO':
      return 'Protótipo';
    case 'PILOTO':
      return 'Piloto';
    case 'PRODUCAO':
      return 'Produção';
    default:
      return status;
  }
}
