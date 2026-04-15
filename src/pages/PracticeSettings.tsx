import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Clock, Star, Layers, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useAppStore } from '../store';

export default function PracticeSettings() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'all' | 'review' | 'new'>('all');
  const questions = useAppStore(state => state.questions);
  
  const stats = useMemo(() => {
    const now = Date.now();
    const total = questions.length;
    const newQs = questions.filter((q) => q.masteryLevel === 0).length;
    const reviewQs = questions.filter((q) => (q.nextReviewAt || 0) > 0 && (q.nextReviewAt || 0) <= now).length;

    return { total, newQs, reviewQs };
  }, [questions]);

  const handleStart = () => {
    navigate(`/practice/session?mode=${mode}`);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 mt-8">
      <div className="text-center space-y-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-pastel-teal-light dark:bg-pastel-teal-dark rounded-[24px] flex items-center justify-center mx-auto shadow-soft border border-miro-border/40 dark:border-white/10"
        >
          <PlayCircle className="w-10 h-10 text-miro-blue dark:text-pastel-teal-light" />
        </motion.div>
        <div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[48px] font-display font-bold text-miro-black dark:text-white tracking-[-1.44px] mb-4"
          >
            沉浸式刷题
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[18px] text-miro-slate dark:text-slate-400 max-w-xl mx-auto font-sans"
          >
            选择您的复习范围，开启无干扰的闪卡练习模式。
          </motion.p>
        </div>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <button
          onClick={() => setMode('all')}
          className={clsx(
            "relative p-8 rounded-[24px] border-2 text-left transition-all duration-300 group overflow-hidden bg-white dark:bg-[#111]",
            mode === 'all' 
              ? "border-miro-blue bg-miro-blue/5 dark:bg-miro-blue/10 shadow-soft" 
              : "border-miro-border/40 dark:border-white/10 hover:border-miro-blue/50 hover:shadow-soft"
          )}
        >
          <Layers className={clsx("w-10 h-10 mb-6 transition-colors", mode === 'all' ? "text-miro-blue" : "text-miro-slate group-hover:text-miro-blue")} />
          <h3 className="text-[24px] font-display font-bold text-miro-black dark:text-white mb-3 tracking-[-0.72px]">全部题目</h3>
          <p className="text-[16px] text-miro-slate dark:text-slate-400 mb-6 font-sans leading-[1.45]">按随机顺序复习题库中的所有题目。</p>
          <div className={clsx("inline-flex items-center px-4 py-1.5 rounded-[8px] text-[14px] font-bold tracking-wider uppercase", mode === 'all' ? "bg-miro-blue/20 text-miro-blue" : "bg-slate-100 dark:bg-white/10 text-miro-slate dark:text-slate-300")}>
            共 {stats?.total || 0} 题
          </div>
        </button>

        <button
          onClick={() => setMode('review')}
          className={clsx(
            "relative p-8 rounded-[24px] border-2 text-left transition-all duration-300 group overflow-hidden bg-white dark:bg-[#111]",
            mode === 'review' 
              ? "border-pastel-yellow-dark dark:border-pastel-orange-light bg-pastel-orange-light/20 dark:bg-pastel-orange-light/10 shadow-soft" 
              : "border-miro-border/40 dark:border-white/10 hover:border-pastel-yellow-dark/50 dark:hover:border-pastel-orange-light/50 hover:shadow-soft"
          )}
        >
          <Clock className={clsx("w-10 h-10 mb-6 transition-colors", mode === 'review' ? "text-pastel-yellow-dark dark:text-pastel-orange-light" : "text-miro-slate group-hover:text-pastel-yellow-dark dark:group-hover:text-pastel-orange-light")} />
          <h3 className="text-[24px] font-display font-bold text-miro-black dark:text-white mb-3 tracking-[-0.72px]">智能复习</h3>
          <p className="text-[16px] text-miro-slate dark:text-slate-400 mb-6 font-sans leading-[1.45]">专注复习概念模糊或近期未看的题目。</p>
          <div className={clsx("inline-flex items-center px-4 py-1.5 rounded-[8px] text-[14px] font-bold tracking-wider uppercase", mode === 'review' ? "bg-pastel-orange-light text-[#cc7a00] dark:bg-pastel-orange-light/20 dark:text-pastel-orange-light" : "bg-slate-100 dark:bg-white/10 text-miro-slate dark:text-slate-300")}>
            {stats?.reviewQs || 0} 题待复习
          </div>
        </button>

        <button
          onClick={() => setMode('new')}
          className={clsx(
            "relative p-8 rounded-[24px] border-2 text-left transition-all duration-300 group overflow-hidden bg-white dark:bg-[#111]",
            mode === 'new' 
              ? "border-miro-success bg-miro-success/10 shadow-soft" 
              : "border-miro-border/40 dark:border-white/10 hover:border-miro-success/50 hover:shadow-soft"
          )}
        >
          <Star className={clsx("w-10 h-10 mb-6 transition-colors", mode === 'new' ? "text-miro-success" : "text-miro-slate group-hover:text-miro-success")} />
          <h3 className="text-[24px] font-display font-bold text-miro-black dark:text-white mb-3 tracking-[-0.72px]">只看新题</h3>
          <p className="text-[16px] text-miro-slate dark:text-slate-400 mb-6 font-sans leading-[1.45]">专门攻克尚未掌握的全新面试题。</p>
          <div className={clsx("inline-flex items-center px-4 py-1.5 rounded-[8px] text-[14px] font-bold tracking-wider uppercase", mode === 'new' ? "bg-miro-success/20 text-miro-success" : "bg-slate-100 dark:bg-white/10 text-miro-slate dark:text-slate-300")}>
            {stats?.newQs || 0} 题未掌握
          </div>
        </button>
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center pt-4"
      >
        <button
          onClick={handleStart}
          disabled={!stats || stats.total === 0}
          className="group relative flex items-center justify-center px-12 py-4 bg-miro-blue text-white rounded-[8px] text-[17.5px] font-display font-bold hover:bg-miro-bluePressed transition-colors shadow-soft disabled:opacity-50 disabled:hover:bg-miro-blue disabled:shadow-none"
        >
          <span className="relative flex items-center transition-colors">
            {stats?.total === 0 ? '题库为空' : '开始刷题'}
            <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
          </span>
        </button>
      </motion.div>
    </div>
  );
}
