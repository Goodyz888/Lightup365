import React, { useState } from 'react';
import { useStore } from '../store';
import { dict } from '../i18n';
import { patches } from '../data/patches';
import { CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';

type Goal = 'pain' | 'sleep' | 'energy' | 'antiAging' | 'detox' | 'stress' | 'weight' | 'muscle' | 'skin' | 'custom';

export default function Quiz() {
  const { language } = useStore();
  const t = dict[language];
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
  const [customGoalText, setCustomGoalText] = useState('');
  const [step, setStep] = useState(1);

  const toggleGoal = (g: Goal) => {
    setSelectedGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const goalsList: { id: Goal, label: string, emoji: string }[] = [
    { id: 'pain', label: t.goalPain, emoji: "🤕" },
    { id: 'sleep', label: t.goalSleep, emoji: "😴" },
    { id: 'energy', label: t.goalEnergy, emoji: "⚡" },
    { id: 'antiAging', label: t.goalAntiAging, emoji: "🌱" },
    { id: 'detox', label: t.goalDetox, emoji: "🛡️" },
    { id: 'stress', label: t.goalStress, emoji: "🧘" },
    { id: 'weight', label: t.goalWeight, emoji: "⚖️" },
    { id: 'muscle', label: t.goalMuscle, emoji: "💪" },
    { id: 'skin', label: t.goalSkin, emoji: "✨" },
    { id: 'custom', label: t.goalCustom, emoji: "🎯" }
  ];

  const getRecommendations = () => {
    let recs = new Set<string>();
    
    // Base foundational patch recommended for almost everything
    let addX39 = false;

    if (selectedGoals.includes('pain')) { recs.add('icewave'); recs.add('aeon'); addX39 = true; }
    if (selectedGoals.includes('sleep')) { recs.add('silentnights'); recs.add('alavida'); addX39 = true; }
    if (selectedGoals.includes('energy')) { recs.add('energyenhancer'); recs.add('x49'); addX39 = true; }
    if (selectedGoals.includes('antiAging')) { recs.add('carnosine'); addX39 = true; }
    if (selectedGoals.includes('detox')) { recs.add('glutathione'); addX39 = true; }
    if (selectedGoals.includes('stress')) { recs.add('aeon'); addX39 = true; }
    if (selectedGoals.includes('weight')) { recs.add('sp6'); recs.add('energyenhancer'); }
    if (selectedGoals.includes('muscle')) { recs.add('x49'); recs.add('carnosine'); addX39 = true; }
    if (selectedGoals.includes('skin')) { recs.add('alavida'); recs.add('carnosine'); addX39 = true; }
    if (selectedGoals.includes('custom') && customGoalText) { addX39 = true; recs.add('aeon'); }
    
    // Always include x39 for baseline if nothing profound is picked or if it's broadly recommended
    if (addX39 || recs.size === 0) recs.add('x39');

    // Return unique recommended patches
    return patches.filter(p => recs.has(p.id));
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-3 flex-wrap text-slate-900 dark:text-white mb-2">
              <span className="animate-bounce hover:animate-spin cursor-default">✨</span>
              <span className="relative overflow-hidden group max-w-[14rem] sm:max-w-xs md:max-w-sm leading-snug">
                <span className="relative z-10 transition-transform duration-500 group-hover:scale-105 inline-block pb-1 bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">{t.quizTitle}</span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-400/30 dark:via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
              </span>
              <span className="animate-bounce hover:animate-spin cursor-default" style={{ animationDelay: '0.2s' }}>🧬</span>
            </h1>
            <p className="text-xl md:text-2xl font-medium text-slate-800 dark:text-slate-200">{t.quizSubtitle}</p>
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/50 max-w-3xl mx-auto">
              <p className="text-sm md:text-base text-amber-800 dark:text-amber-300/90 font-medium italic">{t.disclaimer}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goalsList.map(g => (
              <button
                key={g.id}
                onClick={() => toggleGoal(g.id)}
                className={`p-6 rounded-2xl border-2 text-left transition-all relative ${
                  selectedGoals.includes(g.id)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl filter hover:drop-shadow-lg transition-all">{g.emoji}</span>
                    <span className="font-medium text-lg text-slate-800 dark:text-slate-200">{g.label}</span>
                  </div>
                  {selectedGoals.includes(g.id) && (
                    <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0 ml-4" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {selectedGoals.includes('custom') && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <input
                type="text"
                value={customGoalText}
                onChange={(e) => setCustomGoalText(e.target.value)}
                placeholder={t.customGoalPlaceholder || "Type your specific wellness goal..."}
                className="w-full mt-4 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-900/50 bg-white dark:bg-slate-900 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                autoFocus
              />
            </div>
          )}

          <div className="flex justify-end pt-8">
            <button
              disabled={selectedGoals.length === 0}
              onClick={() => setStep(2)}
              className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium flex items-center space-x-2 hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 transition-colors"
            >
              <span>{t.getRecommendations}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-3 flex-wrap text-slate-900 dark:text-white">
              <span className="animate-pulse cursor-default">💎</span>
              <span className="relative overflow-hidden group max-w-[14rem] sm:max-w-xs md:max-w-sm leading-snug">
                <span className="relative z-10 transition-transform duration-500 group-hover:scale-105 inline-block pb-1 bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">{t.yourProtocol}</span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-400/30 dark:via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
              </span>
              <span className="animate-pulse cursor-default" style={{ animationDelay: '0.5s' }}>🛡️</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400">{t.quizRecommendationSubtitle}</p>
          </div>

          <div className="space-y-6">
            {getRecommendations().map(patch => {
              // Get translated patch info from dictionary
              // @ts-ignore
              const translatedPatch = t.patches?.[patch.id] || patch;
              return (
              <div key={patch.id} className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold tracking-tight">{translatedPatch.name || patch.name}</h3>
                  <a
                    href="https://lifewave.com/lightup365"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span>{t.buyNow}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-lg mb-6 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                  {translatedPatch.description || patch.description}
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2 uppercase text-xs tracking-wider">{t.keyBenefits}</h4>
                    <ul className="space-y-2">
                      {(translatedPatch.benefits || patch.benefits).map((b: string) => (
                        <li key={b} className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2 uppercase text-xs tracking-wider">{t.placementPoints}</h4>
                    <ul className="space-y-2">
                      {(translatedPatch.points || patch.points).map((p: string) => (
                        <li key={p} className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )})}
          </div>

          <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/50 max-w-3xl mx-auto text-center">
            <p className="text-sm md:text-base text-amber-800 dark:text-amber-300/90 font-medium italic">{t.disclaimer}</p>
          </div>

          <div className="flex justify-center pt-8">
            <button
              onClick={() => setStep(1)}
              className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
