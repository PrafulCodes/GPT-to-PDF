function sanitizeSegment(input: string) {
  return input
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export function createPdfFileName(title: string, fallback = 'chatgpt-conversation') {
  const safeTitle = sanitizeSegment(title || fallback).slice(0, 80) || fallback;
  return `${safeTitle}.pdf`;
}

export function parseContentDispositionFileName(value: string | null) {
  if (!value) return null;

  const match = value.match(/filename\*=(?:UTF-8''|)([^;]+)|filename="?([^";]+)"?/i);
  const raw = match?.[1] || match?.[2];
  if (!raw) return null;

  try {
    return decodeURIComponent(raw.replace(/^"|"$/g, ''));
  } catch {
    return raw.replace(/^"|"$/g, '');
  }
}