export function toPlainText(htmlOrText: string) {
  if (!htmlOrText) return '';
  if (typeof window === 'undefined') {
    return htmlOrText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  const tmp = document.createElement('div');
  tmp.innerHTML = htmlOrText;
  return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
}

