import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { dict } from '../i18n';
import { Search, Bot, Loader2, Mic, MicOff, Volume2, Play, Pause, Square, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function SearchPage() {
  const { language, knowledgeBase } = useStore();
  const t = dict[language];
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [isListening, setIsListening] = useState(false);
  const [audioState, setAudioState] = useState<'stopped' | 'playing' | 'paused'>('stopped');
  
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const cleanTextForSpeech = (markdownText: string) => {
    return markdownText
      .replace(/[*#`~_\[\]()>-]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\n+/g, '. ')
      .trim();
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setAudioState('stopped');
  };

  const pauseAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    setAudioState('paused');
  };

  const resumeAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
    setAudioState('playing');
  };

  const playAudio = (textToRead?: string, targetLang?: string) => {
    if (!('speechSynthesis' in window)) {
      alert("Text to speech is not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();

    const rawText = textToRead || answer;
    if (!rawText) return;

    const cleanText = cleanTextForSpeech(rawText);
    const langCode = (targetLang || language) === 'zh' ? 'zh-CN' : 'en-US';

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = langCode;

    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => 
      v.lang.toLowerCase().includes(langCode.toLowerCase()) || 
      v.lang.replace('_', '-').toLowerCase().includes(langCode.toLowerCase())
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => setAudioState('stopped');
    utterance.onerror = () => setAudioState('stopped');

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setAudioState('playing');
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please try Chrome or Edge.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    stopAudio();

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'zh' ? 'zh-CN' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
       setIsListening(true);
       setError('');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
      handleSearch(transcript, language);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSearch = async (searchQuery: string, searchLang: string = language, autoPlay: boolean = false) => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError('');
    setAnswer('');
    setSummary('');
    stopAudio();
    
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, language: searchLang, knowledgeBase })
      });
      
      if (!res.ok) {
        let errMsg = 'Failed to fetch answer';
        try {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errData = await res.json();
            errMsg = errData.error || errMsg;
          } else {
            errMsg = `Server error (Status ${res.status})`;
          }
        } catch (_) {
          errMsg = `Server error (Status ${res.status})`;
        }
        throw new Error(errMsg);
      }
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('The server returned an invalid response. This may be due to a server restart or the service starting up. Please wait a moment and try again.');
      }
      
      const data = await res.json();
      setAnswer(data.answer);
      setSummary(data.summary || '');
      if (autoPlay) {
        playAudio(data.answer, searchLang);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const wasPlaying = audioState !== 'stopped';
    stopAudio();

    if (query.trim() && answer) {
      handleSearch(query, language, wasPlaying);
    }
  }, [language]);

  const suggestedQuestions = [
    {
      title: {
        en: "How do LifeWave patches work?",
        zh: "LifeWave 贴片的工作原理是什么？"
      },
      desc: {
        en: "Learn about phototherapy and active wavelengths",
        zh: "了解光波疗法与波长调节的科学原理"
      },
      query: "How do LifeWave patches work?"
    },
    {
      title: {
        en: "How do I activate stem cells with X39?",
        zh: "如何使用 X39 激活干细胞？"
      },
      desc: {
        en: "Learn about X39 benefits and placement",
        zh: "了解 X39 的功效与常用贴敷穴位"
      },
      query: "How do I activate stem cells with X39?"
    },
    {
      title: {
        en: "Which patches help with deep sleep?",
        zh: "哪些贴片有助于深度睡眠？"
      },
      desc: {
        en: "Explore sleep protocols like Silent Nights",
        zh: "探索 Silent Nights 睡眠贴片与穴位配方"
      },
      query: "Which patches help with deep sleep?"
    },
    {
      title: {
        en: "What is the recommended protocol for pain?",
        zh: "缓解身体疼痛推荐什么贴片？"
      },
      desc: {
        en: "Learn about IceWave and rapid pain relief",
        zh: "了解 IceWave 贴片的快速镇痛贴法"
      },
      query: "What is the recommended protocol for pain?"
    }
  ];

  const handleCardClick = (cardQuery: string) => {
    setQuery(cardQuery);
    handleSearch(cardQuery);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-4">
      {/* Phototherapy Wellness Advisor Chat Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/60 pb-5">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
            {language === 'zh' ? '光波疗法健康顾问对话' : 'Phototherapy Wellness Advisor Chat'}
          </h1>
        </div>
        <div className="flex items-center">
          <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-teal-500 text-white shadow-sm animate-pulse">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            {language === 'zh' ? 'AI 驱动' : 'AI Powered'}
          </span>
        </div>
      </div>

      {/* Asking fields on top */}
      <div className="space-y-3">
        <div className="relative flex items-center bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 focus-within:border-teal-500 dark:focus-within:border-teal-500 rounded-2xl p-1.5 shadow-sm transition-all">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch(query)}
            placeholder={isListening ? t.listening : (language === 'zh' ? '咨询贴片配方、贴片使用或健康养生建议...' : 'Ask about protocols, patches, or wellness guidance...')}
            className="flex-1 px-4 py-3 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-base"
          />
          
          <div className="flex items-center gap-1.5 pr-1.5">
            <button
              onClick={startListening}
              type="button"
              className={`p-2.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={t.listenPrompt}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={() => handleSearch(query)}
              disabled={isLoading || !query.trim()}
              className="bg-[#5c728a] hover:bg-[#4b5d72] disabled:opacity-50 text-white p-3 rounded-xl transition-all shadow-sm flex items-center justify-center shrink-0"
              title="Send Message"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5 transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {isListening && (
          <div className="text-center animate-in fade-in text-xs font-semibold text-red-500 flex items-center justify-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            {t.listenPrompt}
          </div>
        )}
      </div>

      {/* Main chat output or questions suggestions */}
      {(!answer && !isLoading) ? (
        <div className="space-y-4 pt-2">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              {language === 'zh' ? '推荐咨询问题' : 'SUGGESTED QUESTIONS'}
            </h3>
 
            {/* Suggested Questions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCardClick(q.query)}
                  className="flex p-5 bg-white dark:bg-slate-900/40 hover:bg-slate-100/40 dark:hover:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl transition-all duration-300 text-left group hover:scale-[1.01] hover:shadow-sm gap-4 items-start"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-snug">
                      {q.title[language as 'en' | 'zh']}
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {q.desc[language as 'en' | 'zh']}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Chat response layout */
        <div className="space-y-6">
          {/* User message block */}
          {query && (
            <div className="flex justify-end animate-in fade-in duration-300">
              <div className="max-w-2xl bg-teal-600 dark:bg-teal-700 text-white rounded-2xl rounded-tr-none px-5 py-3.5 shadow-sm text-left">
                <p className="text-sm font-medium">{query}</p>
              </div>
            </div>
          )}

          {/* Error notice */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800/50">
              {error}
            </div>
          )}

          {/* AI Advisor answer */}
          {(isLoading || answer) && (
            <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                    <Bot className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                    {language === 'zh' ? '光波疗法健康顾问的专业指导' : 'Phototherapy Wellness Advisor\'s Guidance'}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {answer && (
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      {audioState === 'stopped' && (
                        <button
                          onClick={() => playAudio()}
                          className="flex items-center space-x-1 px-2.5 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                          title={t.readOut}
                        >
                          <Volume2 className="w-4 h-4" />
                          <span className="hidden sm:inline">{t.readOut}</span>
                        </button>
                      )}

                      {audioState === 'playing' && (
                        <button
                          onClick={pauseAudio}
                          className="flex items-center space-x-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                          title={t.pauseAudio}
                        >
                          <Pause className="w-4 h-4" />
                          <span className="hidden sm:inline">{t.pauseAudio}</span>
                        </button>
                      )}

                      {audioState === 'paused' && (
                        <button
                          onClick={resumeAudio}
                          className="flex items-center space-x-1 px-2.5 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                          title={t.resumeAudio}
                        >
                          <Play className="w-4 h-4" />
                          <span className="hidden sm:inline">{t.resumeAudio}</span>
                        </button>
                      )}

                      {audioState !== 'stopped' && (
                        <button
                          onClick={stopAudio}
                          className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                          title={t.stopAudio}
                        >
                          <Square className="w-4 h-4 fill-current" />
                          <span className="hidden sm:inline">{t.stopAudio}</span>
                        </button>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setAnswer('');
                      setSummary('');
                      setError('');
                      stopAudio();
                    }}
                    className="px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-800 transition-all"
                  >
                    {language === 'zh' ? '返回提问' : 'Reset Chat'}
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {language === 'zh' ? '光波疗法健康顾问正在整理专业指导方案...' : 'Phototherapy Wellness Advisor is tailoring your personalized guidance...'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Concise Summary Card */}
                  {summary && (
                    <div className="p-5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100/80 dark:border-teal-900/40 mb-6 flex items-start gap-3.5 shadow-sm text-left animate-in fade-in duration-300">
                      <div className="p-2 bg-teal-500/10 dark:bg-teal-400/10 rounded-xl shrink-0 text-teal-600 dark:text-teal-400 mt-0.5">
                        <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold uppercase tracking-widest text-teal-700 dark:text-teal-400 mb-1">
                          {language === 'zh' ? '智能摘要 / Quick Summary' : 'Quick Summary'}
                        </h4>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                          {summary}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="markdown-body prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed text-left">
                    <ReactMarkdown>{answer}</ReactMarkdown>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Disclaimer & Educational Footer */}
      <div className="space-y-4 pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
        <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal text-center max-w-2xl mx-auto px-4">
          {language === 'zh'
            ? 'LifeWave 产品并非旨在用于诊断、治疗、治愈或预防任何疾病。如果您有任何医疗状况，请咨询合格的医疗保健专业人员。'
            : 'LifeWave products are not intended to diagnose, treat, cure, or prevent any disease. Please consult a qualified healthcare professional for medical conditions.'}
        </p>
        <div className="text-center text-xs text-slate-400 dark:text-slate-500">
          {language === 'zh' ? '仅供教育参考。非医疗诊断建议。' : 'For educational purposes only. Not medical advice.'}
        </div>
      </div>
    </div>
  );
}
