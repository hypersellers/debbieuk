import React, { useState, useCallback, useEffect } from 'react';
import LoginScreen from './components/auth/LoginScreen';
import RegisterScreen from './components/auth/RegisterScreen';
import ForgotPasswordScreen from './components/auth/ForgotPasswordScreen';
import PracticeScreen from './components/practice/PracticeScreen';
import AssessmentScreen from './components/practice/AssessmentScreen';
import SplashScreen from './components/ui/SplashScreen';
import { AppState, User } from './types';
import Logo from './components/ui/Logo';
import Background from './components/ui/Background';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.Splash);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lastTranscript, setLastTranscript] = useState<string>('');

  useEffect(() => {
    if (appState === AppState.Splash) {
      const timer = setTimeout(() => {
        setAppState(AppState.Login);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [appState]);

  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user);
    setAppState(AppState.Practice);
  }, []);

  const handleRegister = useCallback((user: User) => {
    setCurrentUser(user);
    setAppState(AppState.Practice);
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setLastTranscript('');
    setAppState(AppState.Login);
  }, []);

  const handlePracticeComplete = useCallback((transcript: string) => {
    setLastTranscript(transcript);
    setAppState(AppState.Assessment);
  }, []);

  const handleStartNewSession = useCallback(() => {
    setLastTranscript('');
    setAppState(AppState.Practice);
  }, []);

  const renderContent = () => {
    switch (appState) {
      case AppState.Splash:
        return <SplashScreen />;
      case AppState.Login:
        return <LoginScreen onLogin={handleLogin} onNavigateRegister={() => setAppState(AppState.Register)} onNavigateForgotPassword={() => setAppState(AppState.ForgotPassword)} />;
      case AppState.Register:
        return <RegisterScreen onRegister={handleRegister} onNavigateLogin={() => setAppState(AppState.Login)} />;
      case AppState.ForgotPassword:
        return <ForgotPasswordScreen onNavigateLogin={() => setAppState(AppState.Login)} />;
      case AppState.Practice:
        return <PracticeScreen onPracticeComplete={handlePracticeComplete} userEmail={currentUser?.email || 'student@hyperseller.ai'} />;
      case AppState.Assessment:
        return <AssessmentScreen transcript={lastTranscript} onStartNewSession={handleStartNewSession} userEmail={currentUser?.email || 'student@hyperseller.ai'} />;
      default:
        return <LoginScreen onLogin={handleLogin} onNavigateRegister={() => setAppState(AppState.Register)} onNavigateForgotPassword={() => setAppState(AppState.ForgotPassword)} />;
    }
  };

  return (
    <div className="min-h-screen text-cyan-100 font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <Background showWaves={appState === AppState.Practice || appState === AppState.Splash} />
       {appState !== AppState.Splash && (
         <header className="absolute top-0 left-0 p-4 sm:p-6 flex items-center w-full z-10 animate-fade-in">
           <div className="flex items-center">
              <Logo className="h-8 w-8 sm:h-10 sm:w-10 mr-3" />
              <h1 className="text-xl sm:text-2xl font-bold text-white">hypersellers<span className="text-cyan-400">.ai</span></h1>
           </div>
          {currentUser && (
            <button onClick={handleLogout} className="ml-auto bg-slate-700/50 hover:bg-slate-600/70 border border-slate-600/80 text-white font-bold py-2 px-4 rounded-full transition duration-300 text-sm">
              Logout
            </button>
          )}
        </header>
       )}
      <main className="w-full h-full flex-grow flex items-center justify-center z-0">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;