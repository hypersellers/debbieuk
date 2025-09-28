
import React from 'react';

const Spinner: React.FC<{className?: string}> = ({ className='' }) => {
  return (
    <div className={`animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 ${className}`}></div>
  );
};

export default Spinner;
