import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useStore } from '../store';
import { dict } from '../i18n';
import { Sun, Moon, Languages, Home, Search, ClipboardList, Shield, Video, HelpCircle } from 'lucide-react';

export default function Layout() {
  const { theme, toggleTheme, language, setLanguage } = useStore();
  const t = dict[language];
  const [activeSection, setActiveSection] = React.useState<string>('home');

  React.useEffect(() => {
    const handleScrollAndHash = () => {
      const hash = window.location.hash;
      if (hash === '#search') {
        setActiveSection('search');
      } else if (hash === '#quiz') {
        setActiveSection('quiz');
      } else if (hash === '#resources') {
        setActiveSection('resources');
      } else if (hash === '#faq_section') {
        setActiveSection('faq');
      } else if (hash === '#' || hash === '') {
        setActiveSection('home');
      }
    };

    window.addEventListener('hashchange', handleScrollAndHash);
    // Also listen to scroll to update active menu items as user scrolls
    const handleScroll = () => {
      const sections = [
        { id: 'resources', name: 'resources' },
        { id: 'quiz', name: 'quiz' },
        { id: 'faq_section', name: 'faq' },
        { id: 'search', name: 'search' }
      ];
      
      let found = false;
      const viewportHeight = window.innerHeight;
      const triggerPoint = viewportHeight * 0.35; // 35% from the top is perfect for detection
      
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerPoint && rect.bottom >= triggerPoint) {
            setActiveSection(section.name);
            found = true;
            break;
          }
        }
      }
      if (!found) {
        const scrollY = window.scrollY;
        if (scrollY < 300) {
          setActiveSection('home');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScrollAndHash(); // initial run

    return () => {
      window.removeEventListener('hashchange', handleScrollAndHash);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
            
            <div className="hidden md:flex flex-1 justify-center items-center space-x-1.5 lg:space-x-3">
              <a 
                href="/#" 
                onClick={() => setActiveSection('home')}
                className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-300 border ${
                  activeSection === 'home'
                    ? 'bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-500/20 dark:to-teal-500/20 border-blue-200/50 dark:border-teal-800/40 shadow-sm shadow-blue-500/5 scale-[1.03]'
                    : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                }`}
              >
                <Home className={`w-4 h-4 transition-all duration-300 ${activeSection === 'home' ? 'scale-110 text-blue-600 dark:text-teal-400 drop-shadow-sm' : 'text-slate-400 dark:text-slate-500'}`} /> 
                <span className={activeSection === 'home' ? 'bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-300 bg-clip-text text-transparent font-extrabold' : 'font-semibold'}>
                  {t.home}
                </span>
              </a>

              <a 
                href="/#resources" 
                onClick={() => setActiveSection('resources')}
                className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-300 border ${
                  activeSection === 'resources'
                    ? 'bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-500/20 dark:to-teal-500/20 border-blue-200/50 dark:border-teal-800/40 shadow-sm shadow-blue-500/5 scale-[1.03]'
                    : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                }`}
              >
                <Video className={`w-4 h-4 transition-all duration-300 ${activeSection === 'resources' ? 'scale-110 text-blue-600 dark:text-teal-400 drop-shadow-sm' : 'text-slate-400 dark:text-slate-500'}`} /> 
                <span className={activeSection === 'resources' ? 'bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-300 bg-clip-text text-transparent font-extrabold' : 'font-semibold'}>
                  {t.resources}
                </span>
              </a>

              <a 
                href="/#quiz" 
                onClick={() => setActiveSection('quiz')}
                className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-300 border ${
                  activeSection === 'quiz'
                    ? 'bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-500/20 dark:to-teal-500/20 border-blue-200/50 dark:border-teal-800/40 shadow-sm shadow-blue-500/5 scale-[1.03]'
                    : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                }`}
              >
                <ClipboardList className={`w-4 h-4 transition-all duration-300 ${activeSection === 'quiz' ? 'scale-110 text-blue-600 dark:text-teal-400 drop-shadow-sm' : 'text-slate-400 dark:text-slate-500'}`} /> 
                <span className={activeSection === 'quiz' ? 'bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-300 bg-clip-text text-transparent font-extrabold' : 'font-semibold'}>
                  {t.quiz}
                </span>
              </a>

              <a 
                href="/#faq_section" 
                onClick={() => setActiveSection('faq')}
                className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-300 border ${
                  activeSection === 'faq'
                    ? 'bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-500/20 dark:to-teal-500/20 border-blue-200/50 dark:border-teal-800/40 shadow-sm shadow-blue-500/5 scale-[1.03]'
                    : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                }`}
              >
                <HelpCircle className={`w-4 h-4 transition-all duration-300 ${activeSection === 'faq' ? 'scale-110 text-blue-600 dark:text-teal-400 drop-shadow-sm' : 'text-slate-400 dark:text-slate-500'}`} /> 
                <span className={activeSection === 'faq' ? 'bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-300 bg-clip-text text-transparent font-extrabold' : 'font-semibold'}>
                  {t.faq}
                </span>
              </a>

              <a 
                href="/#search" 
                onClick={() => setActiveSection('search')}
                className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-300 border ${
                  activeSection === 'search'
                    ? 'bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-500/20 dark:to-teal-500/20 border-blue-200/50 dark:border-teal-800/40 shadow-sm shadow-blue-500/5 scale-[1.03]'
                    : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-teal-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                }`}
              >
                <Search className={`w-4 h-4 transition-all duration-300 ${activeSection === 'search' ? 'scale-110 text-blue-600 dark:text-teal-400 drop-shadow-sm' : 'text-slate-400 dark:text-slate-500'}`} /> 
                <span className={activeSection === 'search' ? 'bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-300 bg-clip-text text-transparent font-extrabold' : 'font-semibold'}>
                  {t.search}
                </span>
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex justify-around p-2.5 shadow-lg">
        <a 
          href="/#" 
          onClick={() => setActiveSection('home')}
          className="flex flex-col items-center p-1.5 rounded-xl transition-all duration-300"
        >
          <Home className={`w-5 h-5 transition-all duration-300 ${activeSection === 'home' ? 'text-blue-600 dark:text-teal-400 scale-110 drop-shadow-sm' : 'text-slate-400 dark:text-slate-500'}`} />
          <span className={`text-[9px] mt-1 transition-all duration-300 ${activeSection === 'home' ? 'bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-300 bg-clip-text text-transparent font-extrabold' : 'text-slate-500 dark:text-slate-400 font-medium'}`}>
            {t.home}
          </span>
        </a>
        <a 
          href="/#resources" 
          onClick={() => setActiveSection('resources')}
          className="flex flex-col items-center p-1.5 rounded-xl transition-all duration-300"
        >
          <Video className={`w-5 h-5 transition-all duration-300 ${activeSection === 'resources' ? 'text-blue-600 dark:text-teal-400 scale-110 drop-shadow-sm' : 'text-slate-400 dark:text-slate-500'}`} />
          <span className={`text-[9px] mt-1 transition-all duration-300 ${activeSection === 'resources' ? 'bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-300 bg-clip-text text-transparent font-extrabold' : 'text-slate-500 dark:text-slate-400 font-medium'}`}>
            {t.resources}
          </span>
        </a>
        <a 
          href="/#quiz" 
          onClick={() => setActiveSection('quiz')}
          className="flex flex-col items-center p-1.5 rounded-xl transition-all duration-300"
        >
          <ClipboardList className={`w-5 h-5 transition-all duration-300 ${activeSection === 'quiz' ? 'text-blue-600 dark:text-teal-400 scale-110 drop-shadow-sm' : 'text-slate-400 dark:text-slate-500'}`} />
          <span className={`text-[9px] mt-1 transition-all duration-300 ${activeSection === 'quiz' ? 'bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-300 bg-clip-text text-transparent font-extrabold' : 'text-slate-500 dark:text-slate-400 font-medium'}`}>
            {t.quiz}
          </span>
        </a>
        <a 
          href="/#faq_section" 
          onClick={() => setActiveSection('faq')}
          className="flex flex-col items-center p-1.5 rounded-xl transition-all duration-300"
        >
          <HelpCircle className={`w-5 h-5 transition-all duration-300 ${activeSection === 'faq' ? 'text-blue-600 dark:text-teal-400 scale-110 drop-shadow-sm' : 'text-slate-400 dark:text-slate-500'}`} />
          <span className={`text-[9px] mt-1 transition-all duration-300 ${activeSection === 'faq' ? 'bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-300 bg-clip-text text-transparent font-extrabold' : 'text-slate-500 dark:text-slate-400 font-medium'}`}>
            {t.faq}
          </span>
        </a>
        <a 
          href="/#search" 
          onClick={() => setActiveSection('search')}
          className="flex flex-col items-center p-1.5 rounded-xl transition-all duration-300"
        >
          <Search className={`w-5 h-5 transition-all duration-300 ${activeSection === 'search' ? 'text-blue-600 dark:text-teal-400 scale-110 drop-shadow-sm' : 'text-slate-400 dark:text-slate-500'}`} />
          <span className={`text-[9px] mt-1 transition-all duration-300 ${activeSection === 'search' ? 'bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-300 bg-clip-text text-transparent font-extrabold' : 'text-slate-500 dark:text-slate-400 font-medium'}`}>
            {t.search}
          </span>
        </a>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 mb-16 md:mb-0">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-50 dark:bg-slate-950 py-12 border-t border-slate-200 dark:border-slate-800 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          <div className="flex-1 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-4xl">
            <div className="flex items-start space-x-4">
              <Shield className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 text-amber-500 mt-1" />
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Important Disclaimer</h3>
                <p className="text-base md:text-lg leading-relaxed font-medium italic bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">{t.disclaimer}</p>
              </div>
            </div>
          </div>
          <div className="text-center md:text-right space-y-4 shrink-0 flex flex-col items-center md:items-end">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Get In Touch</h3>
            <a href="mailto:lightup365nz@gmail.com" className="inline-flex items-center justify-center text-lg font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm group">
              <span className="bg-gradient-to-r from-blue-600 to-teal-500 group-hover:from-blue-500 group-hover:to-teal-400 bg-clip-text text-transparent transition-all">lightup365nz@gmail.com</span>
            </a>
            <div className="pt-4">
              <Link to="/admin" className="text-xs text-slate-500 hover:text-slate-400 transition-colors uppercase tracking-widest font-bold">Admin Access</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
