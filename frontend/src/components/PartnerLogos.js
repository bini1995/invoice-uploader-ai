import React from 'react';

export default function PartnerLogos() {
  const companies = ['Contoso', 'NuBank', 'Globex', 'Initech'];
  return (
    <div className="pt-4 text-center md:text-left">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">
        Used by FinOps teams at
      </p>
      <div className="flex justify-center md:justify-start items-center gap-4 opacity-80">
        {companies.map((name, idx) => (
          <img
            key={idx}
            src={`https://dummyimage.com/120x60/4b2ad3/ffffff.png&text=${encodeURIComponent(
              name
            )}`}
            alt={name}
            className="h-8 object-contain rounded"
          />
        ))}
      </div>
    </div>
  );
}
