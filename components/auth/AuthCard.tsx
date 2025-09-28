import React from 'react';
import Logo from '../ui/Logo';

interface AuthCardProps {
  title: string;
  children: React.ReactNode;
}

const AuthCard: React.FC<AuthCardProps> = ({ title, children }) => {
  return (
    <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-cyan-400/20 animate-fade-in">
      <div className="text-center mb-8">
        <Logo className="h-20 w-20 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white">{title}</h2>
        <p className="text-cyan-200/80 mt-1">Welcome to Hypersellers.ai</p>
      </div>
      {children}
    </div>
  );
};

export default AuthCard;