import React from 'react';
import { Button } from './Button';

export default function CTAButton({ className = '', children, ...props }) {
  return (
    <Button className={className} {...props}>
      {children}
    </Button>
  );
}
