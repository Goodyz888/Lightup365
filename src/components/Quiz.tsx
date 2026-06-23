import React, { useState } from 'react';
import { useStore } from '../store';
import { dict } from '../i18n';
import { patches } from '../data/patches';
import { CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';

type Goal = 'pain' | 'sleep' | 'energy' | 'antiAging' | 'custom';

export default function Quiz() {
  const { language } = useStore();
  const t = dict[language];
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
  const [customGoalText, setCustomGoalText] = useState('');
  const [step, setStep] = useState(1);

  const toggleGoal = (g: Goal) => {
    setSelectedGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const goalsList: { id: Goal, label: string }[] = [
    { id: 'pain', label: t.goalPain },
    { id: 'sleep', label: t.goalSleep },
    { id: 'energy', label: t.goalEnergy },
    { id: 'antiAging', label: t.goalAntiAging },
    { id: 'custom', label: t.goalCustom }
  ];

  const getRecommendations = () => {
    let recs = new Set<string>();
    if (selectedGoals.includes('pain')) { recs.add('icewave'); recs.add('aeon'); }
    if (selectedGoals.includes('sleep')) { recs.add('silentnights'); recs.add('aeon'); }
    if (selectedGoals.includes('energy')) { recs.add('x39'); recs.add('x49'); }
    if (selectedGoals.includes('antiAging')) { recs.add('x39'); recs.add('aeon'); }
    if (selectedGoals.includes('custom') && customGoalText) { recs.add('x39'); recs.add('aeon'); }
    
    // Always include x39 for baseline if nothing profound is picked
    if (recs.size === 0) recs.add('x39');

    return patches.filter(p => recs.has(p.id));
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">{t.quizTitle}</h1>
            <p className="text-slate-600 dark:text-slate-400">{t.quizSubtitle}</p>
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
                  <span className="font-medium text-lg">{g.label}</span>
                  {selectedGoals.includes(g.id) && (
                    <CheckCircle2 className="w-6 h-6 text-blue-500" />
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
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">{t.yourProtocol}</h2>
            <p className="text-slate-600 dark:text-slate-400">Based on your goals, here are our recommended solutions.</p>
          </div>

          <div className="space-y-6">
            {getRecommendations().map(patch => (
              <div key={patch.id} className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold tracking-tight">{patch.name}</h3>
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
                  {patch.description}
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2 uppercase text-xs tracking-wider">Key Benefits</h4>
                    <ul className="space-y-2">
                      {patch.benefits.map(b => (
                        <li key={b} className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2 uppercase text-xs tracking-wider">Placement Points</h4>
                    <ul className="space-y-2">
                      {patch.points.map(p => (
                        <li key={p} className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
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
