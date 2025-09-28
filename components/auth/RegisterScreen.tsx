import React, { useState } from 'react';
import { User } from '../../types';
import AuthCard from './AuthCard';

interface RegisterScreenProps {
  onRegister: (user: User) => void;
  onNavigateLogin: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegister, onNavigateLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    console.log('Simulating registration for:', email);
    onRegister({ email });
  };

  return (
    <AuthCard title="Create Account">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-cyan-200/80">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full bg-slate-800/50 border border-cyan-400/30 rounded-full shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
          />
        </div>
        <div>
          <label htmlFor="password"className="block text-sm font-medium text-cyan-200/80">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full bg-slate-800/50 border border-cyan-400/30 rounded-full shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
          />
        </div>
        <div>
          <label htmlFor="confirm-password"className="block text-sm font-medium text-cyan-200/80">Confirm Password</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="mt-1 block w-full bg-slate-800/50 border border-cyan-400/30 rounded-full shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 transition-all duration-300 transform hover:scale-105"
        >
          Sign Up
        </button>
        <p className="text-center text-sm text-cyan-200/70">
          Already have an account?{' '}
          <button type="button" onClick={onNavigateLogin} className="font-medium text-cyan-400 hover:text-cyan-300 transition">
            Sign in
          </button>
        </p>
      </form>
    </AuthCard>
  );
};

export default RegisterScreen;