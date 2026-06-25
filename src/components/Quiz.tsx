import React, { useState } from 'react';
import { useStore } from '../store';
import { dict } from '../i18n';
import { patches } from '../data/patches';
import { CheckCircle2, ArrowRight, ExternalLink, Mail } from 'lucide-react';

type Goal = 'pain' | 'sleep' | 'energy' | 'antiAging' | 'detox' | 'stress' | 'weight' | 'muscle' | 'skin' | 'custom';

export default function Quiz() {
  const { language } = useStore();
  const t = dict[language];
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
  const [customGoalText, setCustomGoalText] = useState('');
  const [step, setStep] = useState(1); // 1 = goal selection, 1.5 = lead form, 2 = recommendations
  
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [subscribeInsights, setSubscribeInsights] = useState(true);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [emailSentStatus, setEmailSentStatus] = useState<boolean | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const getMailtoUrl = () => {
    const goalLabels = selectedGoals.map(gId => {
      if (gId === 'custom' && customGoalText) {
        return `${t.goalCustom} (${customGoalText})`;
      }
      const goalObj = goalsList.find(item => item.id === gId);
      return goalObj ? goalObj.label : gId;
    });

    const recommendedList = getRecommendations();
    const recommendedNames = recommendedList.map(patch => {
      // @ts-ignore
      const translatedPatch = t.patches?.[patch.id] || patch;
      return translatedPatch.name || patch.name;
    });

    const subject = encodeURIComponent(`Daily Radiance Lead - ${leadName}`);
    const body = encodeURIComponent(`Daily Radiance - New Lead Wellness Plan Recommendation

Lead Contact Information:
-------------------------
Name: ${leadName}
Email: ${leadEmail}
Subscribe to Phototherapy Wellness Insights: ${subscribeInsights ? "Yes" : "No"}

Selected Wellness Goals:
------------------------
${goalLabels.map(g => `- ${g}`).join('\n')}

Recommended LifeWave Products:
------------------------------
${recommendedNames.map(p => `- ${p}`).join('\n')}

--
Sent from Daily Radiance Partner Portal.`);

    return `mailto:lightup365nz@gmail.com?subject=${subject}&body=${body}`;
  };

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

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadEmail) return;

    setIsSubmittingLead(true);

    try {
      const goalLabels = selectedGoals.map(gId => {
        if (gId === 'custom' && customGoalText) {
          return `${t.goalCustom} (${customGoalText})`;
        }
        const goalObj = goalsList.find(item => item.id === gId);
        return goalObj ? goalObj.label : gId;
      });

      const recommendedList = getRecommendations();
      const recommendedNames = recommendedList.map(patch => {
        // @ts-ignore
        const translatedPatch = t.patches?.[patch.id] || patch;
        return translatedPatch.name || patch.name;
      });

      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: leadName,
          email: leadEmail,
          selectedGoals: goalLabels,
          recommendedProducts: recommendedNames,
          language,
          subscribeInsights
        }),
      });

      const data = await res.json();
      console.log("[Lead API response]", data);
      setEmailSentStatus(!!data.sent);
      if (!data.sent) {
        setApiError(data.error || "Email delivery setup pending on server");
      } else {
        setApiError(null);
      }
    } catch (err: any) {
      console.error("Error submitting lead:", err);
      setEmailSentStatus(false);
      setApiError(err.message || "Network error submitting lead");
    } finally {
      setIsSubmittingLead(false);
      setStep(2); // Unlock recommendations
    }
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
              onClick={() => setStep(1.5)}
              className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium flex items-center space-x-2 hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 transition-colors"
            >
              <span>{t.getRecommendations}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {step === 1.5 && (
        <div className="max-w-md mx-auto p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              {t.leadFormTitle}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {t.leadFormSubtitle}
            </p>
          </div>

          <form onSubmit={handleLeadSubmit} className="space-y-4">
            <div>
              <label htmlFor="lead-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.name}
              </label>
              <input
                id="lead-name"
                type="text"
                required
                value={leadName}
                onChange={e => setLeadName(e.target.value)}
                placeholder={t.name}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
            </div>

            <div>
              <label htmlFor="lead-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.email}
              </label>
              <input
                id="lead-email"
                type="email"
                required
                value={leadEmail}
                onChange={e => setLeadEmail(e.target.value)}
                placeholder={t.email}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
            </div>

            <div className="flex items-start space-x-3 pt-1">
              <input
                id="subscribe-insights"
                type="checkbox"
                checked={subscribeInsights}
                onChange={e => setSubscribeInsights(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 mt-0.5 cursor-pointer accent-blue-600"
              />
              <label htmlFor="subscribe-insights" className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed cursor-pointer select-none">
                {language === 'zh' 
                  ? '订阅光疗健康资讯 (获取免费的使用贴片技巧、方案更新与健康洞察)' 
                  : 'Sign up for Phototherapy Wellness Insights (receive tips, patch guidelines & updates)'}
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmittingLead}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white rounded-xl font-semibold transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              <span>{isSubmittingLead ? t.sending : t.submit}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              &larr; Back to Goals
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-4 mb-8">
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

          {/* Email Delivery Feedback / One-click client Mailto Fallback */}
          <div className="space-y-4 max-w-xl mx-auto text-center">
            {emailSentStatus === true && (
              <div className="p-6 rounded-2xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/40 text-left max-w-xl mx-auto space-y-2 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center gap-2.5 text-teal-700 dark:text-teal-400 font-bold">
                  <span className="text-xl">✅</span>
                  <span>{language === 'zh' ? '健康方案已成功发送！' : 'Wellness Plan Sent Successfully!'}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {language === 'zh' 
                    ? `您的专属健康方案和推荐贴片已自动发送到 ${leadEmail}！`
                    : `Your personalized wellness recommendations have been successfully emailed to ${leadEmail}!`}
                </p>
              </div>
            )}

            {emailSentStatus === false && (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-500/10 to-teal-500/10 border border-blue-200/50 dark:border-teal-800/40 text-left max-w-xl mx-auto space-y-4 shadow-sm animate-in fade-in slide-in-from-top-4">
                {apiError && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs leading-relaxed space-y-1 mb-2">
                    <p className="font-bold">⚠️ {language === 'zh' ? '后台邮件发送配置提示：' : 'Background Email Delivery Notice:'}</p>
                    <p>{apiError}</p>
                    {apiError.includes("535") && (
                      <p className="mt-2 font-semibold text-slate-700 dark:text-slate-300">
                        {language === 'zh' 
                          ? '💡 修复方法：在您的 Gmail 账户中启用两步验证，然后在「安全性 -> 两步验证 -> 应用专用密码」中生成一个 16 位字符的应用密码，并用它作为 SMTP_PASS。' 
                          : '💡 To Fix: Enable 2-Step Verification in your Gmail account, then go to Security -> 2-Step Verification -> App Passwords to generate a 16-character app-specific password. Put that into SMTP_PASS.'}
                      </p>
                    )}
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl shrink-0 mt-0.5">
                    <Mail className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                      {language === 'zh' ? '📧 立即发送邮件至 lightup365nz@gmail.com' : '📧 Instant Email Send to lightup365nz@gmail.com'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {language === 'zh' 
                        ? '您可以使用以下一键发送功能，直接通过您本机的邮件客户端发送定制推荐方案：' 
                        : 'You can instantly dispatch this custom wellness plan via your local email app using the button below:'}
                    </p>
                  </div>
                </div>

                <a
                  href={getMailtoUrl()}
                  className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/10 hover:scale-[1.01]"
                >
                  <Mail className="w-5 h-5" />
                  <span>{language === 'zh' ? '一键发送邮件至 lightup365nz@gmail.com' : 'Send Recommendation to lightup365nz@gmail.com'}</span>
                </a>
              </div>
            )}
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
              onClick={() => {
                setSelectedGoals([]);
                setCustomGoalText('');
                setLeadName('');
                setLeadEmail('');
                setStep(1);
              }}
              className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors animate-all"
            >
              Start Over
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
