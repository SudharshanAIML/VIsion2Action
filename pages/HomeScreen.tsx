import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../types';
import { speak, announce } from '../services/accessibilityService';
import { cycleLanguage, getLanguage, t } from '../services/languageService';
import { Globe } from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [langName, setLangName] = useState(getLanguage().nativeName);
  const [welcomeText, setWelcomeText] = useState(t('welcome'));

  useEffect(() => {
    // Announce welcome message on mount
    announce(welcomeText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [welcomeText]);

  const handleStart = () => {
    speak(t('nav_active'));
    navigate(AppRoute.NAVIGATION);
  };

  const handleLanguageSwitch = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigating to next screen
    const newLang = cycleLanguage();
    setLangName(newLang.nativeName);
    setWelcomeText(t('welcome'));
    // Speak the name of the new language IN that language
    speak(newLang.nativeName);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 relative">
      
      {/* Main Touch Area for Start */}
      <button 
        onClick={handleStart}
        className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 active:bg-slate-800 transition-colors w-full"
        aria-label={welcomeText}
      >
        <div className="relative">
          <div className="absolute -inset-4 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
          <svg 
            width="120" 
            height="120" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-white relative z-10"
          >
            <path d="M2 12h20" />
            <path d="M12 2v20" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-5xl font-black text-white tracking-tighter">
            VISION<span className="text-blue-500 text-4xl">2</span>ACTION
          </h1>
          <p className="text-2xl text-slate-300 font-medium max-w-xs mx-auto">
            {welcomeText}
          </p>
        </div>
      </button>

      {/* Language Toggle Button (High Accessibility) */}
      <button 
        onClick={handleLanguageSwitch}
        className="absolute bottom-10 right-6 z-20 flex items-center gap-3 px-6 py-4 bg-slate-800 rounded-full border-2 border-slate-600 active:bg-slate-700 active:scale-95 transition-all shadow-xl"
        aria-label={`Change Language. Current: ${langName}`}
      >
        <Globe className="text-blue-400" size={24} />
        <span className="text-white text-xl font-bold">{langName}</span>
      </button>

    </div>
  );
};