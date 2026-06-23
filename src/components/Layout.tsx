import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useStore } from '../store';
import { dict } from '../i18n';
import { Sun, Moon, Languages, Home, Search, ClipboardList, Shield, Video } from 'lucide-react';

export default function Layout() {
  const { theme, toggleTheme, language, setLanguage } = useStore();
  const t = dict[language];

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 transition-colors flex flex-col font-sans`}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                {t.appTitle}
              </span>
            </div>
            
            <div className="hidden md:flex flex-1 justify-center items-center space-x-8">
              <a href="/#" className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                <Home className="w-4 h-4" /> <span>{t.home}</span>
              </a>
              <a href="/#search" className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                <Search className="w-4 h-4" /> <span>{t.search}</span>
              </a>
              <a href="/#quiz" className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                <ClipboardList className="w-4 h-4" /> <span>{t.quiz}</span>
              </a>
              <a href="/#resources" className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                <Video className="w-4 h-4" /> <span>{t.resources}</span>
              </a>
            </div>

            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center"
                title={t.languageSelect}
              >
                <Languages className="w-5 h-5" />
                <span className="ml-1 text-sm font-medium">{language.toUpperCase()}</span>
              </button>
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile nav bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around p-3">
        <a href="/#" className="flex flex-col items-center p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-1">{t.home}</span>
        </a>
        <a href="/#search" className="flex flex-col items-center p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
          <Search className="w-5 h-5" />
          <span className="text-[10px] mt-1">{t.search}</span>
        </a>
        <a href="/#quiz" className="flex flex-col items-center p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
          <ClipboardList className="w-5 h-5" />
          <span className="text-[10px] mt-1">{t.quiz}</span>
        </a>
        <a href="/#resources" className="flex flex-col items-center p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
          <Video className="w-5 h-5" />
          <span className="text-[10px] mt-1">{t.resources}</span>
        </a>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 mb-16 md:mb-0">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-100 dark:bg-slate-950 py-8 border-t border-slate-200 dark:border-slate-800 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-slate-500 max-w-2xl flex items-start space-x-3">
            <Shield className="w-6 h-6 flex-shrink-0 text-blue-500 mt-0.5" />
            <p>{t.disclaimer}</p>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Contact: lightup365nz@gmail.com
            <br />
            <Link to="/admin" className="hover:underline">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
