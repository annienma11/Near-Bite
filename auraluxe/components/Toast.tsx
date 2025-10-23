'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className={`px-6 py-4 border ${type === 'success' ? 'border-gold-500 bg-gold-50 dark:bg-brown-800' : 'border-red-500 bg-red-50 dark:bg-brown-800'} min-w-[300px]`}>
        <div className="flex items-center justify-between gap-4">
          <p className="text-brown-900 dark:text-cream-50">{message}</p>
          <button onClick={onClose} className="text-brown-600 dark:text-cream-300 hover:text-gold-600">×</button>
        </div>
      </div>
    </div>
  );
}
