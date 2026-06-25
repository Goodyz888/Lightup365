import React from 'react';
import { useStore } from '../store';
import { dict } from '../i18n';
import { Sparkles, Video, ArrowRight } from 'lucide-react';
import SearchPage from './SearchPage';
import Quiz from './Quiz';
import Resources from './Resources';
import Faq from './Faq';
import lifewaveLogo from '../assets/images/lifewave_x39_logo_1782362582012.jpg';

export default function Home() {
  const { language, socialUpdates } = useStore();
  const t = dict[language];

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto space-y-16">
      
      {/* Hero Section */}
      <section className="text-center w-full py-12 px-6 rounded-3xl bg-gradient-to-b from-blue-50 to-white dark:from-slate-800/50 dark:to-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="w-48 h-48 text-blue-500" />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8 relative z-10">
          <img 
            src={lifewaveLogo} 
            alt="LifeWave X39 Logo" 
            className="w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-white dark:border-slate-700 shadow-md object-cover flex-shrink-0"
            referrerPolicy="no-referrer"
          />
          <h1 className="tracking-tight flex flex-col items-center sm:items-start gap-1.5 text-center sm:text-left">
            <span className="text-2xl md:text-3xl font-extrabold bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
              {t.heroTitle}
            </span>
            <span className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              {t.heroTitle2}
            </span>
          </h1>
        </div>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-4 relative z-10">
          {t.heroSubtitle}
        </p>
      </section>

      {/* Resources Section */}
      <section id="resources" className="w-full scroll-mt-24">
        <Resources />
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent my-8" />
      </section>

      {/* Quiz Section */}
      <section id="quiz" className="w-full relative z-20 scroll-mt-24">
        <Quiz />
      </section>

      {/* FAQ Section */}
      <section id="faq_section" className="w-full scroll-mt-24">
        <Faq />
      </section>

      {/* Phototherapy Wellness Advisor Section */}
      <section id="search" className="w-full scroll-mt-24">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent my-8" />
        <SearchPage />
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent my-8" />
      </section>

    </div>
  );
}
