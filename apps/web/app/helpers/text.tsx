import { sanitizeHTML } from '@/app/helpers/html_helper';

export const truncateText = (text: string, lines = 3) => {
  const words = text.split(' ');
  let result = '';
  let lineCount = 0;
  let charCount = 0;

  for (let word of words) {
    result += word + ' ';
    charCount += word.length + 1; // Include space

    if (charCount > 50) {
      // Approximate per line character count
      lineCount++;
      charCount = 0;
    }

    if (lineCount >= lines) {
      return result.trim() + '...';
    }
  }

  return result.trim();
};

const fallbackCopyTextToClipboard = (
  text: string,
  onSuccess?: () => void,
  onError?: (err: any) => void,
) => {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      onSuccess?.();
    } else {
      throw new Error('execCommand failed');
    }
  } catch (err) {
    console.error('Fallback copy failed', err);
    onError?.(err);
  } finally {
    document.body.removeChild(textArea);
  }
};

export const copyToClipboard = (
  text: string,
  onSuccess?: () => void,
  onError?: (err: any) => void,
) => {
  if (!text) return;

  try {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => onSuccess?.())
        .catch((err) => {
          console.warn('Clipboard API failed, falling back...', err);
          fallbackCopyTextToClipboard(text, onSuccess, onError);
        });
    } else {
      fallbackCopyTextToClipboard(text, onSuccess, onError);
    }
  } catch (err) {
    console.warn('Clipboard attempt threw an error', err);
    fallbackCopyTextToClipboard(text, onSuccess, onError);
  }
};

export const countWords = (text: string) => {
  const sanitizedString = sanitizeHTML(text ?? '');
  if (!sanitizedString) return 0;
  return sanitizedString.trim().split(/\s+/).length;
};

export const camelToKebab = (str: string) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
