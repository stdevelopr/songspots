import { MutableRefObject, useEffect } from 'react';

export function useHighlightScroll(
  selectedId: string | null | undefined,
  refs: MutableRefObject<Record<string, HTMLDivElement | null>>
) {
  useEffect(() => {
    if (!selectedId) return;
    const element = refs.current[selectedId];
    if (!element) return;

    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

    // Temporary highlight
    element.style.transform = 'scale(1.02)';
    element.style.boxShadow = '0 8px 32px rgba(59, 130, 246, 0.3)';
    element.style.borderColor = 'rgb(59, 130, 246)';

    const timeout = setTimeout(() => {
      if (!element) return;
      element.style.transform = '';
      element.style.boxShadow = '';
      element.style.borderColor = '';
    }, 2000);

    return () => clearTimeout(timeout);
  }, [selectedId, refs]);
}

