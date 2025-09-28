import React from 'react';

export const MagicWandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <defs>
        <linearGradient id="wandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
    </defs>
    <path
      fill="url(#wandGradient)"
      d="M14.23,2.18L13.2,3.21C13.06,3.35 13.06,3.58 13.2,3.72L14.22,4.74C14.36,4.88 14.59,4.88 14.73,4.74L15.76,3.71C15.9,3.57 15.9,3.34 15.76,3.2L14.74,2.18C14.59,2.04 14.37,2.04 14.23,2.18M4.44,9.45L3.3,10.59C3.16,10.73 3.16,10.96 3.3,11.1L4.32,12.12C4.46,12.26 4.69,12.26 4.83,12.12L5.86,11.09C6,10.95 6,10.72 5.86,10.58L4.84,9.56C4.69,9.42 4.58,9.42 4.44,9.45M21.5,13.21L20,11.71C19.85,11.56 19.63,11.56 19.47,11.71L12.5,18.68L10.45,16.63C10.16,16.34 9.69,16.34 9.4,16.63L2.12,23.91C1.83,24.2 1.83,24.67 2.12,24.96C2.26,25.1 2.45,25.18 2.64,25.18C2.83,25.18 3.02,25.1 3.16,24.96L10.44,17.68L12.5,19.73C12.79,20.02 13.26,20.02 13.55,19.73L21.5,11.78C21.65,11.64 21.65,11.4 21.5,11.25L21.5,13.21Z"
      transform="translate(0, -1.5)"
    />
  </svg>
);

export const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
    >
        <path d="M12,14c1.66,0,3-1.34,3-3V5c0-1.66-1.34-3-3-3S9,3.34,9,5v6C9,12.66,10.34,14,12,14z" />
        <path d="M17,11h-1c0,2.76-2.24,5-5,5s-5-2.24-5-5H5c0,3.53,2.61,6.43,6,6.92V21h2v-3.08c3.39-0.49,6-3.39,6-6.92z" />
    </svg>
);