import React, { useState } from 'react';
import { useStore } from '../store';
import { dict } from '../i18n';
import { Lock, Plus, Database } from 'lucide-react';

export default function Admin() {
  const { language, addKnowledgeBaseEntry, addSocialUpdate } = useStore();
  const t = dict[language];
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // Forms state
  const [kbTitle, setKbTitle] = useState('');
  const [kbContent, setKbContent] = useState('');
  const [socUrl, setSocUrl] = useState('');
  const [socContent, setSocContent] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || 'admin';
    if (password === adminPass) {
      setIsAuthenticated(true);
    } else {
      alert("Invalid credentials");
    }
  };

  const handleKBSync = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kbTitle || !kbContent) return;
    addKnowledgeBaseEntry({
      lang: language,
      title: kbTitle,
      content: kbContent,
      category: 'science', // simplified for prototype
      tags: []
    });
    setKbTitle('');
    setKbContent('');
    alert("Knowledge Base synced!");
  };

  const handleSocialAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socUrl || !socContent) return;
    addSocialUpdate({
      type: 'link',
      url: socUrl,
      content: socContent
    });
    setSocUrl('');
    setSocContent('');
    alert("Social update added!");
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto pt-20">
        <form onSubmit={handleLogin} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
              <Lock className="w-8 h-8 text-slate-600 dark:text-slate-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center">{t.adminTitle}</h2>
          <div>
            <label className="sr-only">{t.adminPassword}</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={t.adminPassword}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
            {t.login}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold">{t.adminTitle}</h1>
        <p className="text-slate-500 mt-2">Manage content locally for current session</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Knowledge Base Uploader */}
        <section className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <Database className="w-6 h-6 text-teal-500" />
            <h2 className="text-xl font-semibold">Knowledge Base</h2>
          </div>
          <form onSubmit={handleKBSync} className="space-y-4">
            <div>
              <input 
                type="text" 
                value={kbTitle}
                onChange={e => setKbTitle(e.target.value)}
                placeholder="Title"
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <textarea 
                value={kbContent}
                onChange={e => setKbContent(e.target.value)}
                placeholder="Paste Markdown or Raw Text here..."
                rows={6}
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
              />
            </div>
            <button type="submit" className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>{t.syncData}</span>
            </button>
          </form>
        </section>

        {/* Social Feed Uploader */}
        <section className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <Plus className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold">{t.latestUpdates}</h2>
          </div>
          <form onSubmit={handleSocialAdd} className="space-y-4">
            <div>
              <input 
                type="url" 
                value={socUrl}
                onChange={e => setSocUrl(e.target.value)}
                placeholder={t.contentUrl}
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <textarea 
                value={socContent}
                onChange={e => setSocContent(e.target.value)}
                placeholder={t.contentDescription}
                rows={4}
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Add Social Link</span>
            </button>
          </form>
        </section>

      </div>
    </div>
  );
}
