import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { dict } from '../i18n';
import Fuse from 'fuse.js';
import { Search, Bot, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function SearchPage() {
  const { language, knowledgeBase } = useStore();
  const t = dict[language];
  const [query, setQuery] = useState('');

  const filteredKB = useMemo(() => {
    return knowledgeBase.filter(entry => !entry.lang || entry.lang === language);
  }, [knowledgeBase, language]);

  const fuse = useMemo(() => new Fuse(filteredKB, {
    keys: ['title', 'content', 'tags'],
    includeScore: true,
    threshold: 0.3
  }), [filteredKB]);

  const results = query ? fuse.search(query).map(r => r.item) : [];

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
          placeholder={t.searchPlaceholder}
          className="w-full px-6 py-5 pl-14 text-lg rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-teal-500 dark:focus:border-teal-500 transition-colors shadow-sm"
        />
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
      </div>

      {!query && (
        <div className="flex flex-col items-center space-y-4 animate-in fade-in slide-in-from-bottom-2 pt-4">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.suggestionsTitle}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[t.suggest1, t.suggest2, t.suggest3, t.suggest4].map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => setQuery(suggestion)}
                className="px-5 py-2.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium transition-colors border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {query && results.length === 0 && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
            {t.noResults}
          </div>
        )}
        
        {results.map(entry => (
          <div key={entry.id} className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="w-5 h-5 text-teal-500" />
              <h3 className="text-xl font-semibold">{entry.title}</h3>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed">
              <ReactMarkdown>{entry.content}</ReactMarkdown>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {entry.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-mono rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
