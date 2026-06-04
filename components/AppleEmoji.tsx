import React from 'react';

// Converts an emoji string to a dash-separated hex string for the CDN
function getEmojiUrl(emoji: string) {
  // Use Array.from to correctly handle surrogate pairs and ZWJs
  let hex = Array.from(emoji)
    .map((char) => char.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join('-');
    
  // Handle some special cases where the Apple CDN might strip FE0F (variation selector 16)
  if (hex.endsWith('-fe0f')) {
    // some CDNs prefer the stripped version for base emojis, but emoji-datasource-apple usually keeps them.
    // Let's just use it directly.
  }
  
  return `https://unpkg.com/emoji-datasource-apple@15.0.1/img/apple/64/${hex}.png`;
}

export default function AppleEmoji({ 
  emoji, 
  size = 24, 
  className = '',
  style = {}
}: { 
  emoji: string; 
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <img 
      src={getEmojiUrl(emoji)} 
      alt={emoji} 
      width={size} 
      height={size} 
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }} 
      loading="lazy"
      onError={(e) => {
        // Fallback if the specific codepoint combo isn't found
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}
