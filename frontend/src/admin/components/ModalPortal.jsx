import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const ModalPortal = ({ children }) => {
  useEffect(() => {
    // Prevent background scroll while modal open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return createPortal(children, document.body);
};

export default ModalPortal;
