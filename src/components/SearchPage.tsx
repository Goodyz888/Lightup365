import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { dict } from '../i18n';
import { Search, Bot, Loader2, Mic, MicOff, Volume2, Play, Pause, Square } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function SearchPage() {
  const { language, knowledgeBase } = useStore();
  const t = dict[language];
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
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
    stopAudio();
    
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, language: searchLang, knowledgeBase })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch answer');
      }
      setAnswer(data.answer);
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

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-teal-100 dark:bg-teal-900/40 rounded-full mb-4 shadow-inner">
          <Bot className="w-10 h-10 text-teal-600 dark:text-teal-400" />
        </div>
        <h1 className="text-3xl font-bold">{t.searchTitle}</h1>
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch(query)}
          placeholder={isListening ? t.listening : t.searchPlaceholder}
          className={`w-full px-6 py-5 pl-14 pr-36 text-lg rounded-2xl border-2 transition-colors shadow-sm focus:outline-none ${
            isListening 
              ? 'border-red-500 bg-red-50/30 dark:bg-red-950/20' 
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-teal-500 dark:focus:border-teal-500'
          }`}
        />
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <button
            onClick={startListening}
            type="button"
            className={`p-2.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30 ring-4 ring-red-200 dark:ring-red-900/40'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
            title={t.listenPrompt}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button 
            onClick={() => handleSearch(query)}
            disabled={isLoading || !query.trim()}
            className="bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ask'}
          </button>
        </div>
      </div>

      {isListening && (
        <div className="text-center animate-in fade-in -mt-4 text-sm font-medium text-red-500 flex items-center justify-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          {t.listenPrompt}
        </div>
      )}

      {!answer && !isLoading && !error && (
        <div className="flex flex-col items-center space-y-4 animate-in fade-in slide-in-from-bottom-2 pt-4">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.suggestionsTitle}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[t.suggest1, t.suggest2, t.suggest3, t.suggest4].map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(suggestion);
                  handleSearch(suggestion);
                }}
                className="px-5 py-2.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium transition-colors border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800/50">
          {error}
        </div>
      )}

      {answer && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                  <Bot className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">{t.aiAdvisorResponse}</h3>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                {audioState === 'stopped' && (
                  <button
                    onClick={() => playAudio()}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                    title={t.readOut}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{t.readOut}</span>
                  </button>
                )}

                {audioState === 'playing' && (
                  <button
                    onClick={pauseAudio}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                    title={t.pauseAudio}
                  >
                    <Pause className="w-4 h-4" />
                    <span>{t.pauseAudio}</span>
                  </button>
                )}

                {audioState === 'paused' && (
                  <button
                    onClick={resumeAudio}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                    title={t.resumeAudio}
                  >
                    <Play className="w-4 h-4" />
                    <span>{t.resumeAudio}</span>
                  </button>
                )}

                {audioState !== 'stopped' && (
                  <button
                    onClick={stopAudio}
                    className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors"
                    title={t.stopAudio}
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span className="hidden sm:inline">{t.stopAudio}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="markdown-body prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed">
              <ReactMarkdown>{answer}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
