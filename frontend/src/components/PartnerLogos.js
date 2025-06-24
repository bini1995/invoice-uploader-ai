import React from 'react';

export default function PartnerLogos() {
  const logos = [
    'https://dummyimage.com/120x60/000/fff.png&text=Client+1',
    'https://dummyimage.com/120x60/000/fff.png&text=Client+2',
    'https://dummyimage.com/120x60/000/fff.png&text=Client+3',
    'https://dummyimage.com/120x60/000/fff.png&text=Client+4',
  ];
  return (
    <div className="flex justify-center md:justify-start items-center gap-4 pt-4 opacity-80">
      {logos.map((src, idx) => (
        <img key={idx} src={src} alt={`Partner ${idx + 1}`} className="h-8 object-contain" />
      ))}
    </div>
  );
}
