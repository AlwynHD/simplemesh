// src/components/WebGLGuard.tsx
'use client';

import { useEffect, useState, ReactNode } from 'react';
import { isWebGLSupported } from '../utils/webgl';

interface WebGLGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function WebGLGuard({ children, fallback }: WebGLGuardProps) {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setIsSupported(isWebGLSupported());
  }, []);

  // Wait until we've checked (client-side only)
  if (isSupported === null) {
    return null;
  }

  if (!isSupported) {
    return fallback || (
      <div className="webgl-error p-4 text-center">
        <h3 className="font-bold text-lg">3D rendering not available</h3>
        <p>Your browser doesn't support WebGL, which is needed to display 3D models.</p>
      </div>
    );
  }

  return <>{children}</>;
}