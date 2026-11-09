import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  math: string;
  block?: boolean;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ math, block = true }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math || 'x', {
        displayMode: block,
        throwOnError: false,
      });
    } catch (err) {
      return `<span class="text-red-500 font-mono">${math}</span>`;
    }
  }, [math, block]);

  return (
    <div 
      className={`overflow-x-auto my-2 p-3 rounded-lg bg-black/5 dark:bg-white/5 text-center ${block ? 'block' : 'inline-block'}`}
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
};
