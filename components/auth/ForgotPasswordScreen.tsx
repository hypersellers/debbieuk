import React, { useState } from 'react';
import AuthCard from './AuthCard';

interface ForgotPasswordScreenProps {
  onNavigateLogin: () => void;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onNavigateLogin }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Simulating password recovery for:', email);
    setSubmitted(true);
  };

  return (
    <AuthCard title="Recover Password">
      {submitted ? (
        <div className="text-center">
          <p className="text-cyan-100/90">If an account with that email exists, we've sent a password reset link.</p>
          <button
            onClick={onNavigateLogin}
            className="mt-6 font-medium text-cyan-400 hover:text-cyan-300 transition"
          >
            Back to Sign In
          </button>
        </div>
      ) : (
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
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 transition-all duration-300 transform hover:scale-105"
          >
            Send Recovery Link
          </button>
          <p className="text-center text-sm text-cyan-200/70">
            Remember your password?{' '}
            <button type="button" onClick={onNavigateLogin} className="font-medium text-cyan-400 hover:text-cyan-300 transition">
              Sign in
            </button>
          </p>
        </form>
      )}
    </AuthCard>
  );
};

export default ForgotPasswordScreen;