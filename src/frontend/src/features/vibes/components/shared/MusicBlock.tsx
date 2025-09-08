import React from 'react';
import MusicEmbed from '../../../common/MusicEmbed';

interface MusicBlockProps {
  musicLink?: string;
  className?: string;
}

const MusicBlock: React.FC<MusicBlockProps> = ({ musicLink, className = '' }) => {
  if (!musicLink) return null;
  return (
    <div className={className}>
      <MusicEmbed musicLink={musicLink} />
    </div>
  );
};

export default MusicBlock;

