import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, RefreshCw, Check, X, Flame, Coffee, Code2, Smile, Lightbulb } from 'lucide-react';
import soundFX from '../../utils/soundEffects';

const AI_MODES = [
  {
    id: 'viral',
    label: 'Viral Xu Hướng',
    icon: Flame,
    color: 'from-orange-500 to-rose-500',
    description: 'Hook giật gân, emoji & hashtag dễ lên top',
  },
  {
    id: 'genz',
    label: 'Hài Hước Gen Z',
    icon: Smile,
    color: 'from-amber-400 to-pink-500',
    description: 'Bắt trend, dí dỏm, lầy lội',
  },
  {
    id: 'tech',
    label: 'Dân Công Nghệ',
    icon: Code2,
    color: 'from-cyan-500 to-blue-600',
    description: 'Góc nhìn lập trình viên, tinh tế & chuyên nghiệp',
  },
  {
    id: 'deep',
    label: 'Deep Suy Tư',
    icon: Coffee,
    color: 'from-purple-500 to-indigo-600',
    description: 'Triết lý nhẹ nhàng, thơ mộng',
  },
  {
    id: 'idea',
    label: 'Gợi Ý Ý Tưởng',
    icon: Lightbulb,
    color: 'from-emerald-400 to-teal-600',
    description: 'Chủ đề hot hôm nay nếu chưa biết đăng gì',
  },
];

const TEMPLATES = {
  viral: [
    (text) => `🚨 BẬT MÍ MỘT ĐIỀU MÀ KHÔNG AI NÓI VỚI BẠN:\n\n${text || 'Cuộc sống chỉ thực sự thay đổi khi bạn dám bắt đầu từ những điều nhỏ nhất!'}\n\n👉 Bạn nghĩ sao về điều này? Để lại bình luận bên dưới nhé! 👇\n\n#SocialDB #Viral #Trending #KhamPha #CuocSong`,
    (text) => `⚡ TOP 1 ĐIỀU KHIẾN BẠN BẤT NGỜ HÔM NAY:\n\n"${text || 'Hạnh phúc không phải là đích đến, mà là hành trình chúng ta cùng nhau đi qua.'}" ✨\n\nThả tim nếu bạn thấy đúng nhé! ❤️🚀\n#Motivation #ViralPost #DailyWisdom`,
  ],
  genz: [
    (text) => `Sáng dậy tính làm người chăm chỉ nhưng vũ trụ bảo "thôi nghỉ đi em":\n\n${text || 'Deadline dí đến chân nhưng tâm hồn vẫn đang ở trạng thái chill out cực độ.'} 😭💅\n\nKeo lỳ tái châu luôn á! Ai chung cảnh ngộ giơ tay phát nào 🙋‍♂️\n#GenZ #HaiHuoc #Overthinking #OutTrinh`,
    (text) => `Tính không flex đâu nhưng mà thôi:\n${text || 'Hôm nay code không bug, cảm giác như trúng số độc đắc vậy mấy ní ơi.'} 😎🔥\n\nEt o et ai cứu tôi khỏi sự ngầu này với!\n#Flexing #MemeViet #Fun`,
  ],
  tech: [
    (text) => `💻 Tech Insights hôm nay:\n\n"${text || 'Clean code không chỉ là viết cho máy chạy, mà là viết để người tiếp theo đọc không muốn trầm cảm.'}"\n\nKiến trúc Microservices, Event-Driven với Kafka hay Monolith thực chất đều là bài toán Trade-off. Quan trọng nhất vẫn là giải quyết bài toán nghiệp vụ đúng thời điểm.\n\nAnh em dev nghĩ sao? 🚀\n#DevLife #SoftwareEngineering #Kafka #Architecture #Coding`,
  ],
  deep: [
    (text) => `Có những ngày lòng nhẹ tênh như một làn gió thu...\n\n${text || 'Thành phố vẫn hối hả, đèn đường vẫn rực rỡ, chỉ có lòng mình dừng lại để thở và cảm nhận từng khoảnh khắc giản đơn.'} 🍂☕\n\nChúc mọi người một buổi tối thật an yên.\n#GocTamSu #ChillVibes #DeepSuy #NightThoughts`,
  ],
  idea: [
    () => `Hôm nay bạn đã tự thưởng cho bản thân điều gì chưa? Dù chỉ là một ly cafe hay 15 phút nghe bản nhạc yêu thích, hãy nhớ chăm sóc năng lượng của mình nhé! ☕✨ #SelfCare #DailyReminder`,
    () => `Nếu có một lời khuyên gửi cho bản thân của 3 năm trước, bạn sẽ nói điều gì? Comment câu trả lời thú vị nhất xuống đây nhé! 💬🕰️ #Reflection #QnA #Community`,
  ],
};

export const AIMagicWriter = ({ currentContent, onApply, isOpen, onClose }) => {
  const [selectedMode, setSelectedMode] = useState('viral');
  const [generatedResult, setGeneratedResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = (modeId = selectedMode) => {
    soundFX.playPop();
    setIsGenerating(true);
    setGeneratedResult('');

    const templateList = TEMPLATES[modeId] || TEMPLATES.viral;
    const chosenFn = templateList[Math.floor(Math.random() * templateList.length)];
    const fullText = chosenFn(currentContent.trim());

    // Typewriter streaming effect
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex += 2;
      setGeneratedResult(fullText.slice(0, currentIndex));

      if (currentIndex >= fullText.length) {
        clearInterval(interval);
        setIsGenerating(false);
        soundFX.playHeartBurst();
      }
    }, 18);
  };

  const handleApply = () => {
    soundFX.playPop();
    if (onApply && generatedResult) {
      onApply(generatedResult);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                <Wand2 className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Phù Thủy AI Viết Bài</span>
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold px-2 py-0.5 rounded-full">
                    Magic Co-Pilot
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Tối ưu hóa bài viết, tạo phong cách Viral & sáng tạo nội dung tự động
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            {AI_MODES.map((mode) => {
              const isSelected = selectedMode === mode.id;
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    setSelectedMode(mode.id);
                    handleGenerate(mode.id);
                  }}
                  className={`p-2.5 rounded-2xl border text-left transition cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`p-1 rounded-lg bg-gradient-to-tr ${mode.color} text-white`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {mode.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">
                    {mode.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Generated Result Output Box */}
          <div className="relative rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-4 mb-4 min-h-[140px] max-h-[220px] overflow-y-auto">
            {isGenerating ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 animate-pulse mb-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>AI đang xuất thần suy nghĩ và viết bài...</span>
              </div>
            ) : null}

            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-sans">
              {generatedResult || (
                <span className="text-slate-400 italic">
                  Chọn một phong cách ở trên hoặc bấm "Tạo nội dung" để xem phép màu của AI ✨
                </span>
              )}
              {isGenerating && <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-500 animate-pulse align-middle" />}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() => handleGenerate(selectedMode)}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Đổi ý tưởng khác</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!generatedResult || isGenerating}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition active:scale-95 disabled:opacity-40 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Áp dụng vào bài viết</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AIMagicWriter;
