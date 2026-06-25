import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  Sparkles, 
  Flame, 
  Droplet, 
  UserCheck, 
  Lightbulb,
  Volume2,
  VolumeX,
  Pause,
  Play
} from 'lucide-react';

interface FAQItem {
  q: string;
  summary: string;
  a: string;
}

interface FAQCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

export default function Faq() {
  const { language } = useStore();
  const [activeCategory, setActiveCategory] = useState<string>('works');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [activeSpeech, setActiveSpeech] = useState<{ id: string; isPaused: boolean } | null>(null);

  const isZh = language === 'zh';

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setActiveSpeech(null);
  };

  const toggleSpeak = (id: string, textToSpeak: string) => {
    if (!('speechSynthesis' in window)) {
      alert(isZh ? '您的浏览器不支持语音播放。' : 'Your browser does not support text-to-speech.');
      return;
    }

    if (activeSpeech?.id === id) {
      if (activeSpeech.isPaused) {
        window.speechSynthesis.resume();
        setActiveSpeech({ id, isPaused: false });
      } else {
        window.speechSynthesis.pause();
        setActiveSpeech({ id, isPaused: true });
      }
    } else {
      window.speechSynthesis.cancel();

      // Clean up punctuation and special technical jargon for cleaner TTS voicing
      const cleanText = textToSpeak
        .replace(/X39/gi, isZh ? 'X 3 9' : 'X 3 9')
        .replace(/GHK-Cu/gi, 'G H K Copper')
        .replace(/GV14/gi, isZh ? '大椎穴' : 'G V 14')
        .replace(/CV6/gi, isZh ? '气海穴' : 'C V 6');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = isZh ? 'zh-CN' : 'en-US';
      utterance.rate = isZh ? 1.05 : 0.95;

      utterance.onend = () => {
        setActiveSpeech(null);
      };
      utterance.onerror = () => {
        setActiveSpeech(null);
      };

      window.speechSynthesis.speak(utterance);
      setActiveSpeech({ id, isPaused: false });
    }
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const faqData: FAQCategory[] = [
    {
      id: 'works',
      name: isZh ? '工作原理' : 'How It Works',
      icon: <Sparkles className="w-5 h-5 text-blue-500" />,
      items: [
        {
          q: isZh 
            ? '这些贴片如何在没有任何药物的情况下刺激身体？' 
            : 'How do LifeWave patches stimulate the body without any drugs?',
          summary: isZh 
            ? '它们将您身体天然排放的红外线热量以特定光波形式反射回来，激活有益的生物通路。' 
            : 'They reflect your body\'s natural infrared heat back as specific light wavelengths to activate beneficial bio-pathways.',
          a: isZh 
            ? '该贴片使用一种获得专利的光疗形式。每片贴片都含有纳米级有机结晶。当贴在皮肤上时，它们会被您身体周围的红外线热量激活，将特定波长的光反射回皮肤，从而刺激穴位。这种非透皮（不经皮肤吸收）的过程可引导身体产生天然化合物（如铜肽），而无需吸收任何化学物质或药物。' 
            : 'The patches use a patented form of phototherapy. Each patch contains nano-scale organic crystals. When applied to the skin, they are activated by your body\'s ambient infrared heat, reflecting specific wavelengths of light back into the skin to stimulate acupuncture points. This non-transdermal process signals the body to produce natural compounds (like copper peptides) without absorbing any chemical substances or medications.'
        },
        {
          q: isZh 
            ? '什么是光疗/光生物调节？它在科学上被证实了吗？' 
            : 'What is phototherapy/photobiomodulation, and is it scientifically proven?',
          summary: isZh 
            ? '光疗是利用特定光频触发人体细胞天然愈合的科学，拥有超过80项临床研究支持。' 
            : 'Phototherapy uses light to trigger natural cellular healing, backed by over 80 clinical studies.',
          a: isZh 
            ? '光疗（或光生物调节）已被研究了数十年。它是利用光频率诱导生理变化的科学。LifeWave 贴片已通过众多独立的临床试验和科学出版物的验证，证明能显着提高细胞能量、抗氧化物生成以及相关肽类水平。' 
            : 'Phototherapy (or photobiomodulation) has been studied for decades. It is the science of using light frequencies to induce physiological changes. LifeWave patches have been validated by numerous independent clinical trials and scientific publications, demonstrating measurable increases in cellular energy, antioxidant production, and beneficial peptide levels.'
        },
        {
          q: isZh 
            ? 'X39 贴片与其他 LifeWave 辅助贴片有什么区别？' 
            : 'What makes the X39 patch different from other supportive LifeWave patches?',
          summary: isZh 
            ? 'X39 通过提升 GHK-Cu 铜肽来激活并重置体内干细胞，而其他贴片则针对特定功能（如睡眠或即时止痛）。' 
            : 'X39 specifically elevates GHK-Cu copper peptides to activate and reset stem cells, while others target specific functions like sleep or pain.',
          a: isZh 
            ? 'X39 是 LifeWave 的旗舰贴片。它专门设计用于提高 GHK-Cu，这是一种已知能激活干细胞、支持伤口愈合、增强细胞活力并使基因表达恢复到更年轻状态的活性铜肽。而其他辅助贴片，如 Aeon（抗压与抗炎）、IceWave（即时缓解疼痛）或 Silent Nights（刺激产生天然褪黑素），则直接针对特定的生理通路发挥作用。' 
            : 'X39 is LifeWave\'s flagship patch. It is uniquely engineered to elevate GHK-Cu, a copper peptide known to activate stem cells, support wound healing, boost cellular energy, and restore gene expression to a healthier, more youthful state. Other supportive patches like Aeon (anti-stress and inflammation), IceWave (immediate discomfort relief), or Silent Nights (melatonin pathway support) target specific local physiological benefits directly.'
        }
      ]
    },
    {
      id: 'apply',
      name: isZh ? '如何使用' : 'How to Apply',
      icon: <Flame className="w-5 h-5 text-orange-500" />,
      items: [
        {
          q: isZh 
            ? '我应该把贴片贴在什么位置才能获得最大效果？' 
            : 'Where should I place the patches for maximum benefit?',
          summary: isZh 
            ? '贴在推荐的穴位上（如脖子后部或肚脐下方），或直接贴在您感到不适或紧张的部位。' 
            : 'Place them on recommended acupuncture points (like the back of neck or below navel) or directly where you feel discomfort.',
          a: isZh 
            ? '临床研究推荐了标准的贴敷位置，例如大椎穴（颈部下方）或气海穴（肚脐下方两英寸）。然而，由于贴片是通过电磁光频信号起作用，它们几乎可以贴在身体的任何地方——甚至可以直接贴在紧张、疼痛或不适的部位或其附近。' 
            : 'Clinical studies recommend standard locations, such as the GV14 point (base of the neck) or CV6 point (two inches below the navel). However, since they work via electromagnetic light signals, they can be placed almost anywhere on your body—even directly on or near areas of tension, discomfort, or injury.'
        },
        {
          q: isZh 
            ? '除了局部疼痛点，最强大且全身起效的推荐贴法有哪些？' 
            : 'What are the most powerful systemic placements besides direct pain points?',
          summary: isZh 
            ? '颈部底部的突出骨头处（大椎穴）以及肚脐下方两指宽处（气海穴）是全身光疗的最佳通道。' 
            : 'The prominent bone at the base of the neck (GV14) and two inches below the navel (CV6) are the best overall channels for systemic phototherapy.',
          a: isZh 
            ? '虽然任何贴片都可以直接贴在您感觉紧张的局部区域，但广泛的临床研究表明，颈部下方的突出骨头（督脉大椎穴）和肚脐下方约两英寸（任脉气海穴）是极为强大的全身性能量通道。在这些位置贴敷，能使光疗微弱信号以最快的速度、最均衡地分布到全身经络系统。' 
            : 'While any patch can be placed directly on a local area of tension or distress, clinical studies show that the GV14 point (the prominent bone at the base of the neck) and the CV6 point (two inches below your navel) act as exceptionally powerful systemic gateways. Placing patches on these locations allows the gentle light reflection signals to distribute most quickly and evenly throughout your body\'s entire meridian network.'
        },
        {
          q: isZh 
            ? '在贴贴片之前，我需要特别清洁皮肤吗？' 
            : 'Do I need to clean my skin before applying a patch?',
          summary: isZh 
            ? '是的，请将贴片贴在干燥、清洁的皮肤上，以获得最佳的粘合度和舒适度。' 
            : 'Yes, apply to dry, clean skin for maximum adhesion and comfort.',
          a: isZh 
            ? '为了达到最佳粘合效果，请将贴片贴在干净、干燥的皮肤上。避免在贴敷前立即使用乳液、油或润肤霜，因为它们可能会减弱低敏粘合剂的附着力。如果贴片弄湿了，它仍然可以继续起作用，但保持干燥能确保其在整个使用期间保持牢固。' 
            : 'For the best adhesion, apply the patch to clean, dry skin. Avoid using lotions, oils, or moisturizers right before application, as they might weaken the hypoallergenic adhesive. If the patch gets wet, it will still work, but keeping it dry ensures it stays secure for the full session.'
        },
        {
          q: isZh 
            ? '贴贴片后，我可以进行运动流汗、洗澡淋浴或游泳吗？' 
            : 'Can I exercise, shower, or swim after applying a patch?',
          summary: isZh 
            ? '可以！贴片具有良好的防水性，正常流汗、洗澡淋浴和游泳不会影响其调理效果。' 
            : 'Yes! The patches are water-resistant. Normal sweating, showering, or swimming will not affect their wellness benefits.',
          a: isZh 
            ? 'LifeWave 贴片贴上后，一般可以放心进行以下日常活动：\n✅ 运动流汗\n✅ 洗澡淋浴\n✅ 游泳\n\n贴片具有一定的防水性，正常流汗和接触水不会影响使用效果。\n建议贴上后先等待约 30 分钟，让贴片牢固黏附在皮肤上再运动或下水。洗澡后用毛巾轻拍擦干即可，不要大力搓揉贴片。\n如果长时间游泳、泡温泉或大量流汗导致贴片脱落，建议更换新的贴片。**实用建议**：可使用 Tegaderm 等透明防水敷料覆盖固定。' 
            : 'Once applied, you can generally participate in the following activities with peace of mind:\n✅ Exercise & sweating\n✅ Showers & baths\n✅ Swimming\n\nThe patches are designed with water resistance, so normal sweating and brief contact with water will not reduce their phototherapy effectiveness. We recommend waiting about 30 minutes after application for the patch to adhere fully before initiating heavy exercise or going into water. After water exposure, simply pat dry with a towel without vigorously rubbing the patch.\nIf prolonged swimming, hot tubs, or extreme sweating causes the patch to peel off, it is advised to apply a new one. **Practical Tip**: You may use a transparent waterproof medical dressing like Tegaderm over the patch for extra secure fixation.'
        }
      ]
    },
    {
      id: 'safety',
      name: isZh ? '安全与佩戴' : 'Safety & Wear Time',
      icon: <ShieldAlert className="w-5 h-5 text-red-500" />,
      items: [
        {
          q: isZh 
            ? '单片贴片可以在我身上保持多久？' 
            : 'How long can I keep a single patch on my body?',
          summary: isZh 
            ? '每天最多佩戴12小时，随后必须有12小时的休息期，以防止身体适应并保持效果。' 
            : 'Wear for up to 12 hours daily, followed by a 12-hour rest period to prevent attenuation and maintain efficacy.',
          a: isZh 
            ? '贴片设计为最多可佩戴 12 小时。12 小时后，请取下贴片并丢弃。在贴新贴片之前，让身体休息 12 小时是非常重要的。这可以防止“受体衰减”（即身体对光疗信号产生脱敏或适应性），从而保证后续使用的效果。' 
            : 'Patches are designed to be worn for up to 12 hours. After 12 hours, remove the patch and discard it. It is essential to allow your body to rest for 12 hours without a patch before applying a new one. This prevents "receptor attenuation"—where the body becomes desensitized to the phototherapy signal, ensuring long-term efficacy.'
        },
        {
          q: isZh 
            ? '如果我的皮肤比较敏感，或者对粘合剂产生红痒过敏怎么办？' 
            : 'What if I have sensitive skin or experience minor adhesive irritation?',
          summary: isZh 
            ? '您可以直接将贴片贴在衣服上靠近皮肤的位置——它不需要直接接触皮肤即可通过红外热反射正常工作！' 
            : 'You can stick the patch onto your clothing near the recommended point—it does not need direct skin contact to reflect infrared signals.',
          a: isZh 
            ? '因为 LifeWave 贴片是通过反射您身体发出的红外热量光波来工作的，所以它们不需要直接接触皮肤即可发挥完全相同的功效。如果您是敏感肌，或者在贴敷部位感到轻微瘙痒，可以直接将贴片贴在背心、内衣或袜子的内侧，使其靠近推荐穴位。这完全不会影响它的光疗调理效果。' 
            : 'Since LifeWave patches work by reflecting the infrared light waves emitted by your own body heat, they do not require direct skin contact to function. If you have sensitive skin or experience mild redness at the placement site, you can stick the patch onto the inside of your shirt, undergarment, or sock near the recommended location. It will work just as effectively.'
        },
        {
          q: isZh 
            ? '会有什么副作用或排毒反应吗？' 
            : 'Are there any side effects or detox symptoms?',
          summary: isZh 
            ? '贴片是完全安全且非透皮的，但在脱水情况下可能会出现轻微的排毒反应（如轻微头痛）。' 
            : 'They are completely safe and non-transdermal, but mild detox reactions (like mild headaches) can occur if dehydrated.',
          a: isZh 
            ? '因为没有任何化学药物进入您的身体，所以贴片异常安全，不存在药物相互作用。一些用户在身体开始排除细胞废物时可能会经历暂时的“排毒”症状（如轻微的头痛、疲劳或口渴）。为了支持这一过程，请确保您在贴敷期间充分饮水。' 
            : 'Because nothing enters your body, the patches are exceptionally safe with no drug interactions. Some users might experience temporary "detoxification" symptoms (mild headaches, light fatigue, or thirst) as the body begins to eliminate cellular waste. To support this transition, ensure you stay exceptionally well-hydrated.'
        },
        {
          q: isZh 
            ? '任何人都可以戴贴片吗，还是有例外情况？' 
            : 'Can anyone wear the patches, or are there exceptions?',
          summary: isZh 
            ? '大多数人都可以佩戴，但孕妇、哺乳期母亲以及正在接受化疗的人群应在使用前咨询医生。' 
            : 'Most people can wear them, but pregnant/nursing mothers and individuals on active chemotherapy should consult their physicians first.',
          a: isZh 
            ? '虽然 LifeWave 贴片是非透皮且低敏的，但特殊人群——特别是怀孕或哺乳期的母亲，以及正在接受活动性化学治疗、放射治疗或服用免疫抑制剂的人群——在使用前应先咨询其医疗保健提供者。' 
            : 'While LifeWave patches are non-transdermal and hypoallergenic, special populations—specifically pregnant or nursing mothers, and individuals undergoing active chemotherapy, radiation, or taking immunosuppressive medications—should consult their healthcare providers before use.'
        }
      ]
    },
    {
      id: 'results',
      name: isZh ? '预期效果' : 'Expected Results',
      icon: <Droplet className="w-5 h-5 text-teal-500" />,
      items: [
        {
          q: isZh 
            ? '为什么在使用贴片时喝水（保持水分）如此关键？' 
            : 'Why is hydration so important when wearing the patches?',
          summary: isZh 
            ? '水分至关重要，因为光疗信号是通过您身体以液体为基础的微弱生物电通路进行传导的。' 
            : 'Hydration is vital because phototherapy signals travel through your body’s fluid-based electrical pathways.',
          a: isZh 
            ? '水是人体内能量 and 生化信号的主要传导介质。由于贴片依赖光生物调节来激活全身性的健康变化，脱水会严重减弱信号的传递。保持充足的水分可确保您的细胞能够顺畅地接收并执行这些至关重要的细胞修复和再生指令。' 
            : 'Water is a primary conductor of energy and biochemical signals in the body. Since the patches rely on photobiomodulation to activate systemic changes, being dehydrated can diminish the signal\'s transmission. Staying well-hydrated ensures your cells can receive and execute these vital regenerative and repairing instructions.'
        },
        {
          q: isZh 
            ? '需要多久才能看到或感觉到明显的效果？' 
            : 'How long does it take to see or feel noticeable results?',
          summary: isZh 
            ? '一些效果（如疼痛缓解、精力提升）在数分钟内即可显现，而深层修复（如细胞再生）通常需要3至6个月。' 
            : 'Some benefits (pain relief, energy) occur within minutes, while deep structural benefits (cellular regeneration) take 3 to 6 months.',
          a: isZh 
            ? '即时效果可能包括局部疼痛减轻、柔韧性增加或在几分钟或几小时内获得平静感。由 X39 驱动的更深层的细胞修复、干细胞激活和组织重塑是一个累积的过程。对于长期健康目标，我们建议连续使用贴片至少 90 天，让身体有充足时间重获新生。' 
            : 'Immediate effects can include localized pain reduction, increased flexibility, or a sense of calm within minutes or hours. Deeper cellular repair, such as stem cell renewal and tissue remodeling driven by X39, is a cumulative process. For long-term goals, we recommend using the patches consistently for at least 90 days to allow your body sufficient time to regenerate.'
        }
      ]
    },
    {
      id: 'tips',
      name: isZh ? '日常使用技巧' : 'Daily Usage Tips',
      icon: <Lightbulb className="w-5 h-5 text-amber-500" />,
      items: [
        {
          q: isZh 
            ? '我该如何保存光疗贴片以维持其最佳活性？' 
            : 'How should I store the patches to maintain their maximum potency?',
          summary: isZh 
            ? '请将贴片保存在阴凉干燥处，远离直射阳光、身体热量以及强电磁场（如手机或微波炉附近）。' 
            : 'Store patches in a cool, dry place away from direct sunlight, body heat, and strong electromagnetic fields (like microwaves or close proximity to cell phones).',
          a: isZh 
            ? '因为 LifeWave 贴片中的有机结晶会在受热以及遇到强电磁波时被激活，所以应将它们储存在远离暖气、直射强光和微波炉的地方。此外，不要将尚未使用的贴片长时间装在贴身衣口袋里，因为您的身体温度会促使其提前开始工作。' 
            : 'Because the biological crystals in LifeWave patches are designed to respond to ambient body heat and electromagnetic infrared frequencies, store them in a cool, dark place away from active heaters, cooking devices, or heavy electromagnetic interference. Also, avoid carrying unused sleeves in your pants or shirt pocket all day, as your body heat will slowly initiate early activation.'
        },
        {
          q: isZh 
            ? '获得最佳调理效果的日常佩戴流程是怎样的？' 
            : 'What is the ideal daily wear routine for the best long-term wellness outcomes?',
          summary: isZh 
            ? '早晨起床后大口喝水并贴上 X39 贴片，并在傍晚或贴满12小时后准时撕下，以保持生理节奏。' 
            : 'Apply regenerative patches (like X39) in the morning with a full glass of water, and peel them off in the evening after exactly 12 hours to maintain bio-rhythms.',
          a: isZh 
            ? '最理想的每日习惯是：早上醒来后喝下一大杯温水，然后在颈后大椎穴或腹部气海穴贴上 X39 或 Energy 贴片。在白天的活动时间享受能量激活与干细胞维护，然后在晚餐前或正好贴满 12 小时后撕下并丢弃。晚上可以改贴专门辅助睡眠与修复的 Silent Nights（夜间贴片），从而完美维持“12小时开启、12小时关闭”的细胞修复双重节律。' 
            : 'The ideal routine is to apply active regenerative patches (like X39) first thing in the morning right after having a full glass of water. Benefit from active cellular renewal and energy optimization during your daytime tasks, then peel it off around dinnertime (at the 12-hour mark). If using sleep or skin repair patches like Silent Nights or Alavida, apply them shortly before bed and remove them upon waking up, maintaining a flawless 12-hours-on, 12-hours-off natural biological rhythm.'
        }
      ]
    }
  ];

  const currentCategory = faqData.find(c => c.id === activeCategory) || faqData[0];

  return (
    <section id="faq_section" className="w-full py-12 px-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-lg scroll-mt-24">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* FAQ Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isZh ? '常见问题解答 (FAQ)' : 'Frequently Asked Questions'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-base">
            {isZh 
              ? '获取关于光疗贴片的工作原理、贴敷位置和安全说明的专业解答。' 
              : 'Find expert answers on phototherapy patch mechanisms, application locations, and safety.'}
          </p>
        </div>

        {/* Categories Tab Bar */}
        <div className="flex flex-wrap gap-2 justify-center border-b border-slate-100 dark:border-slate-800 pb-4">
          {faqData.map(category => {
            const isActive = category.id === activeCategory;
            return (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.id);
                  setExpandedIndex(0); // auto-expand first item of new category
                  stopSpeech(); // stop any speaking voice immediately on tab change
                }}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/10 scale-[1.02]'
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {category.icon}
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* FAQ Items accordion */}
        <div className="space-y-4">
          {currentCategory.items.map((item, index) => {
            const isExpanded = expandedIndex === index;
            const itemSpeechId = `${currentCategory.id}-${index}`;
            const isCurrentlyPlaying = activeSpeech?.id === itemSpeechId;
            const isCurrentlyPaused = activeSpeech?.isPaused;
            
            // Compose structured text for speaking
            const speechText = isZh 
              ? `问题：${item.q}。核心摘要：${item.summary}。详细解答：${item.a}` 
              : `Question: ${item.q}. Summary: ${item.summary}. Answer: ${item.a}`;

            return (
              <div
                key={index}
                className="border border-slate-100 dark:border-slate-800/60 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/10 hover:border-slate-200 dark:hover:border-slate-700/60 transition-all duration-300"
              >
                {/* Accordion Trigger */}
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  className="w-full text-left px-6 py-5 flex justify-between items-center space-x-4 focus:outline-none"
                >
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-base md:text-lg leading-snug">
                    {item.q}
                  </span>
                  <span className="flex-shrink-0 p-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 transition-transform">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </span>
                </button>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-1 space-y-4 animate-in fade-in duration-300">
                    
                    {/* Audio Player Controls */}
                    <div className="flex flex-wrap items-center gap-3 bg-slate-100/70 dark:bg-slate-800/40 p-3 rounded-2xl text-xs md:text-sm text-slate-700 dark:text-slate-300 border border-slate-200/40 dark:border-slate-700/30">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSpeak(itemSpeechId, speechText);
                        }}
                        className={`flex items-center space-x-2 font-semibold py-1.5 px-3.5 rounded-xl transition-all duration-300 shadow-sm ${
                          isCurrentlyPlaying
                            ? isCurrentlyPaused
                              ? 'bg-amber-500 hover:bg-amber-600 text-white scale-[1.02]'
                              : 'bg-emerald-500 hover:bg-emerald-600 text-white scale-[1.02]'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        {isCurrentlyPlaying ? (
                          isCurrentlyPaused ? (
                            <>
                              <Play className="w-4 h-4 fill-current" />
                              <span>{isZh ? '继续播放' : 'Resume Playback'}</span>
                            </>
                          ) : (
                            <>
                              <Pause className="w-4 h-4 fill-current" />
                              <span>{isZh ? '暂停播放' : 'Pause Playback'}</span>
                            </>
                          )
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4" />
                            <span>{isZh ? '语音朗读问答' : 'Listen to Q&A'}</span>
                          </>
                        )}
                      </button>
                      
                      {isCurrentlyPlaying && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            stopSpeech();
                          }}
                          className="flex items-center space-x-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 py-1.5 px-3 rounded-xl transition-colors font-medium"
                        >
                          <VolumeX className="w-4 h-4" />
                          <span>{isZh ? '停止' : 'Stop'}</span>
                        </button>
                      )}
                      
                      <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
                      
                      <span className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {isCurrentlyPlaying 
                          ? (isCurrentlyPaused ? (isZh ? '已暂停' : 'Audio paused') : (isZh ? '正在播放语音...' : 'Playing audio...')) 
                          : (isZh ? '使用 AI 语音功能聆听本条问答' : 'Listen via built-in high quality text-to-speech')}
                      </span>
                    </div>

                    {/* Concise Highlighted Summary box */}
                    <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100/70 dark:border-blue-900/30 flex items-start space-x-3">
                      <div className="mt-0.5 text-blue-500 dark:text-blue-400 flex-shrink-0">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                          {isZh ? '核心亮点总结' : 'Concise Summary'}
                        </span>
                        <p className="text-slate-800 dark:text-slate-200 text-sm md:text-base font-semibold leading-relaxed">
                          {item.summary}
                        </p>
                      </div>
                    </div>

                    {/* Detailed Answer */}
                    <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed pl-1">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
