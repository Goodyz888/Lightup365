import React, { useState } from 'react';
import { useStore } from '../store';
import { dict } from '../i18n';
import { 
  Video, 
  PlayCircle, 
  ExternalLink, 
  Image as ImageIcon, 
  User, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Heart, 
  Zap, 
  Moon, 
  Activity 
} from 'lucide-react';

const VIDEOS = [
  {
    id: "GLf4Csk1k9I",
    title: "Be the Light Testimonial Marathon: Real Stories, Real Impact",
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
  },
  {
    id: "Cy7Lt172Ifg",
    title: "LifeWave Presentation",
  },
  {
    id: "8mDjVAim-vA",
    title: "萊威能量貼 教學篇 LifeWave Patching Tutorial by David Schmidt",
  }
];

const TESTIMONIALS = {
  en: [
    {
      name: "Sarah M.",
      age: "58",
      condition: "Severe Knee Discomfort",
      duration: "4 Years",
      solution: "X39 + Y-Age Aeon",
      timeline: "Improved in 14 days",
      story: "Suffered from chronic bone-on-bone knee discomfort that severely limited daily mobility. Within two weeks of using X39 and Aeon patches, she regained pain-free movement. Now back to walking her dog and climbing stairs comfortably.",
      benefitTag: "Mobility & Pain Relief",
      icon: Heart,
      color: "from-rose-500/10 to-orange-500/10 border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20"
    },
    {
      name: "Michael K.",
      age: "45",
      condition: "Chronic Sleep Issues & Fatigue",
      duration: "10 Years",
      solution: "X39 + Silent Nights",
      timeline: "Deep sleep in 3 days",
      story: "Struggled with constant middle-of-the-night waking and debilitating afternoon fatigue. After starting the X39 and Silent Nights regimen, he began sleeping deeply through the night, waking up with sustained natural vitality.",
      benefitTag: "Deep Sleep & Stamina",
      icon: Moon,
      color: "from-indigo-500/10 to-blue-500/10 border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20"
    },
    {
      name: "Linda T.",
      age: "64",
      condition: "Post-Surgical Scars & Slow Recovery",
      duration: "6 Months",
      solution: "X39 + Glutathione",
      timeline: "Rapid healing in 4 weeks",
      story: "Experienced delayed skin healing and persistent swelling following a major leg surgery. The combination of X39 (stem cell activation) and Glutathione (detoxification) dramatically accelerated tissue repair with minimal scarring.",
      benefitTag: "Tissue & Skin Repair",
      icon: Activity,
      color: "from-teal-500/10 to-emerald-500/10 border-teal-100 dark:border-teal-900/30 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/20"
    },
    {
      name: "David H.",
      age: "51",
      condition: "Cognitive Brain Fog & Fatigue",
      duration: "2 Years",
      solution: "X39 + Energy Enhancer",
      timeline: "Immediate focus boost",
      story: "Felt mentally sluggish, with frequent concentration lapses and low daily productivity. Utilizing the phototherapy patches cleared his brain fog, giving him long-lasting mental clarity and physical energy for bike rides.",
      benefitTag: "Mental Clarity & Energy",
      icon: Zap,
      color: "from-amber-500/10 to-yellow-500/10 border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20"
    }
  ],
  zh: [
    {
      name: "Sarah M.",
      age: "58岁",
      condition: "严重膝关节不适与活动受限",
      duration: "长达4年",
      solution: "X39 + Y-Age Aeon (消炎贴片)",
      timeline: "14天内明显改善",
      story: "曾饱受骨磨骨膝关节疼痛之苦，日常生活和上下楼梯极度困难。在使用 X39 与 Aeon 贴片仅两周后，恢复了无痛自由行动能力，现在能轻松遛狗、自如爬楼梯。",
      benefitTag: "关节活动与止痛",
      icon: Heart,
      color: "from-rose-500/10 to-orange-500/10 border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20"
    },
    {
      name: "Michael K.",
      age: "45岁",
      condition: "长期睡眠障碍与慢性疲劳",
      duration: "长达10年",
      solution: "X39 + Silent Nights (安睡贴片)",
      timeline: "3天内实现深度睡眠",
      story: "多年来夜间频繁醒来，伴有严重的日间疲乏。在采用 X39 和 Silent Nights 调理方案后，他开始整夜安稳熟睡，醒来时感到精力充沛，下午不再容易疲倦。",
      benefitTag: "深度睡眠与精力",
      icon: Moon,
      color: "from-indigo-500/10 to-blue-500/10 border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20"
    },
    {
      name: "Linda T.",
      age: "64岁",
      condition: "术后伤口愈合缓慢与疤痕增生",
      duration: "术后6个月",
      solution: "X39 + Glutathione (谷胱甘肽贴片)",
      timeline: "4周内组织快速修复",
      story: "在经历了一次大型腿部手术后，伤口愈合缓慢且伴有持续性肿胀。结合使用 X39（激活干细胞）和 Glutathione（强力抗氧化排毒）贴片后，极大地加速了伤口闭合，疤痕明显淡化。",
      benefitTag: "组织再生与美肌",
      icon: Activity,
      color: "from-teal-500/10 to-emerald-500/10 border-teal-100 dark:border-teal-900/30 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/20"
    },
    {
      name: "David H.",
      age: "51岁",
      condition: "脑雾频发与精力透支",
      duration: "2年",
      solution: "X39 + Energy Enhancer (能量贴片)",
      timeline: "即刻提升专注度",
      story: "长期处于大脑昏沉状态，注意力不集中，下午工作效率低下。使用光疗贴片后，脑雾完全消散，恢复了清晰的思维与持久的体能，重新爱上骑行与户外运动。",
      benefitTag: "思维清晰与活力",
      icon: Zap,
      color: "from-amber-500/10 to-yellow-500/10 border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20"
    }
  ]
};

export default function Resources() {
  const { language } = useStore();
  const t = dict[language];
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const testimonialsList = TESTIMONIALS[language] || TESTIMONIALS.en;

  return (
    <div className="w-full space-y-12 animate-in fade-in duration-500">
      
      {/* Page Title */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
          {t.resourcesTitle}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          {language === 'zh' 
            ? '科学指南、真实见证与光疗使用教程' 
            : 'Scientific guidelines, real user feedback, and phototherapy video tutorials'}
        </p>
      </div>

      {/* Info Album Link Card */}
      <div>
        <a 
          href="https://photos.app.goo.gl/nigZ4qxsWkmTqJcP8" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/40 dark:hover:to-indigo-900/40 transition-all border border-blue-100 dark:border-blue-800/50 group shadow-sm"
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

      {/* Video Guides Section */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center space-x-2">
          <Video className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
            {language === 'zh' ? '见证与教程视频库' : 'Testimonials & Tutorials Video Library'}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {VIDEOS.map((video) => (
            <div 
              key={video.id} 
              className="flex flex-col gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 hover:scale-[1.01] transition-transform"
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg shrink-0">
                  <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-sm font-semibold line-clamp-2 mt-1 text-slate-800 dark:text-slate-200">
                  {video.title}
                </h4>
              </div>
              
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 group">
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

      {/* Testimonials Bento Section (Extracted from Video) */}
      <div className="space-y-6 pt-2">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
            {language === 'zh' ? 'Be the Light：真实用户成功案例' : 'Be the Light: Real User Success Stories'}
          </h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          {language === 'zh' 
            ? '以下健康改善案例提炼自「Be the Light 真实见证分享马拉松」视频。这些真实经历展示了 LifeWave 光波贴片如何通过生物光疗法温和调理身体、唤醒内在自愈活力、全面解决各类长期健康困扰。' 
            : 'These concise real-world impact cases are extracted from the "Be the Light" Testimonial Marathon video, showcasing how LifeWave phototherapy gently balances the body, activates internal vitality, and addresses chronic wellness challenges.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {testimonialsList.map((test, index) => {
            const IconComponent = test.icon;
            return (
              <div 
                key={index}
                className="p-6 rounded-3xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-2xl border ${test.color}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          {test.name} <span className="text-xs font-normal text-slate-500">({test.age})</span>
                        </h4>
                        <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {test.benefitTag}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                        {language === 'zh' ? '困扰时长:' : 'Duration:'} {test.duration}
                      </span>
                    </div>
                  </div>

                  {/* Core Condition Block */}
                  <div className="p-3.5 rounded-2xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-150 dark:border-slate-800 text-left">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
                      {language === 'zh' ? '⚠️ 面对的健康挑战:' : '⚠️ Wellness Challenge:'}
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {test.condition}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2.5 text-sm text-left">
                    <div className="flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {language === 'zh' ? '光疗调理方案: ' : 'Patch Solution: '}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">{test.solution}</span>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Clock className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {language === 'zh' ? '见效时间: ' : 'Timeline of Results: '}
                        </span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{test.timeline}</span>
                      </div>
                    </div>
                  </div>

                  {/* Story Text */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800/60 text-left italic">
                    &ldquo;{test.story}&rdquo;
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
