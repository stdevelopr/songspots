import React from 'react';

interface DescriptionBlockProps {
  text?: string;
  title?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const DescriptionBlock: React.FC<DescriptionBlockProps> = ({ text, title = 'Description', size = 'md', className = '' }) => {
  const has = Boolean(text && text.trim().length > 0);
  if (!has) return null;

  if (size === 'sm') {
    return (
      <div className={`px-4 py-3 border-b border-gray-100/50 ${className}`}>
        <div className="bg-white/20 rounded-lg p-3 border border-white/30">
          <p className="text-sm text-gray-700 leading-relaxed break-words line-clamp-6">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-100 rounded-xl p-6 bg-white/30 shadow-sm ${className}`}>
      <h4 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">{title}</h4>
      <p className="text-base text-gray-700 leading-relaxed break-words">{text}</p>
    </div>
  );
};

export default DescriptionBlock;

