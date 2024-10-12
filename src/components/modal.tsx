import React, { useEffect, useState } from 'react';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<CustomModalProps> = ({ isOpen, onClose, children }) => {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    } else {
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none transition-all duration-300 ease-in-out ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out ${
        isOpen ? 'opacity-50' : 'opacity-0'
      }`}></div>
      <div 
        className={`relative w-auto max-w-3xl mx-auto my-6 z-50 transition-all duration-300 ease-in-out ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-0 right-0 mt-4 mr-4 text-gray-500 hover:text-gray-700 transition-colors duration-150 ease-in-out"
          onClick={onClose}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;