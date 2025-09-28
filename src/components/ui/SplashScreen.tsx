import React from 'react';
import Logo from './Logo';

const SplashScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="animate-fade-in-scale">
        <Logo className="h-28 w-28 sm:h-32 sm:w-32" />
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-white mt-6 animate-fade-in-text">
        hypersellers<span className="text-cyan-400">.ai</span>
      </h1>
    </div>
  );
};

export default SplashScreen;