import React from 'react';

export default function VideoPlayer({ src, className }) {
  return (
    <video
      src={src}
      className={className}
      autoPlay
      loop
      muted
      playsInline
      controls
    />
  );
}
