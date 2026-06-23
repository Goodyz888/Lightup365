import React, { useState } from 'react';
import { useStore } from '../store';
import { dict } from '../i18n';
import { Video, PlayCircle, ExternalLink, Image as ImageIcon } from 'lucide-react';

const VIDEOS = [
  {
    id: "8mDjVAim-vA",
    title: "萊威能量貼 教學篇 LifeWave Patching Tutorial by David Schmidt",
  },
  {
    id: "_m7bhYr2RLo",
    title: "Testimonials: Before and After",
  },
  {
    id: "6lT_wLtQYXg",
    title: "Top 20 FAQ",
  },
  {
    id: "j_FKOc7K6N8",
    title: "How the X39 Patch Works w/David Schmidt",
  },
  {
    id: "7Y3d74LQaT4",
    title: "Dr. Staci explains what each patch does!",
  }
];

export default function Resources() {
  const { language } = useStore();
  const t = dict[language];
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  return (
    <div className="w-full">
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8 text-center bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
        {t.resourcesTitle}
      </h2>

      <div className="mb-8">
        <a 
          href="https://photos.app.goo.gl/nigZ4qxsWkmTqJcP8" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/40 dark:hover:to-indigo-900/40 transition-all border border-blue-100 dark:border-blue-800/50 group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500 text-white rounded-xl shadow-sm">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {t.infoAlbumTitle}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t.infoAlbumDesc}
              </p>
            </div>
          </div>
          <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
        </a>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {VIDEOS.map((video) => (
          <div 
            key={video.id} 
            className="flex flex-col gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg shrink-0">
                <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-base font-semibold line-clamp-2 mt-1">{video.title}</h3>
            </div>
            
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 group">
              {playingVideo === video.id ? (
                <iframe 
                  src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                  title={video.title}
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin" 
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              ) : (
                <button 
                  onClick={() => setPlayingVideo(video.id)}
                  className="absolute inset-0 w-full h-full focus:outline-none"
                >
                  <img 
                    src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`} 
                    alt={video.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <PlayCircle className="w-16 h-16 text-white drop-shadow-md opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                  </div>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
