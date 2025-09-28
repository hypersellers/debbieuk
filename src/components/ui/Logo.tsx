import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {}

const Logo: React.FC<LogoProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    {...props}
  >
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#083344" />
      </linearGradient>
    </defs>
    <path
      fill="url(#logoGradient)"
      d="M62.5,12.5 C78.1,12.5 87.5,21.9 87.5,37.5 C87.5,53.1 78.1,62.5 62.5,62.5 C55.3,62.5 50,59.3 50,59.3 L50,87.5 C50,87.5 59.4,78.1 75,78.1 C90.6,78.1 100,87.5 100,100 L0,100 L0,0 L100,0 C100,12.5 90.6,21.9 75,21.9 C59.4,21.9 50,12.5 50,12.5 L50,40.7 C50,40.7 55.3,37.5 62.5,37.5 M37.5,87.5 C21.9,87.5 12.5,78.1 12.5,62.5 C12.5,46.9 21.9,37.5 37.5,37.5 C44.7,37.5 50,40.7 50,40.7 L50,12.5 C50,12.5 40.6,21.9 25,21.9 C9.4,21.9 0,12.5 0,0 L-1.42109e-14,100 L0,100 C0,87.5 9.4,78.1 25,78.1 C40.6,78.1 50,87.5 50,87.5 L50,59.3 C50,59.3 44.7,62.5 37.5,62.5"
      transform="scale(1, -1) translate(0, -100)"
    />
  </svg>
);

export default Logo;