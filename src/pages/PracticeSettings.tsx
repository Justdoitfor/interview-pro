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
          className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30"
        >
          <PlayCircle className="w-10 h-10" />
        </motion.div>
        <div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white tracking-tight mb-4"
          >
            沉浸式刷题
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto"
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
            "relative p-8 rounded-3xl border-2 text-left transition-all duration-300 group overflow-hidden",
            mode === 'all' 
              ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 shadow-xl shadow-emerald-500/10" 
              : "border-slate-200 dark:border-white/5 glass-panel hover:border-emerald-500/50"
          )}
        >
          <div className={clsx("absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 transition-opacity duration-500", mode === 'all' && "opacity-100")} />
          <Layers className={clsx("w-10 h-10 mb-6 transition-colors", mode === 'all' ? "text-emerald-500" : "text-slate-400 group-hover:text-emerald-400")} />
          <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3">全部题目</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">按随机顺序复习题库中的所有题目。</p>
          <div className={clsx("inline-flex items-center px-3 py-1 rounded-full text-sm font-medium", mode === 'all' ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300")}>
            共 {stats?.total || 0} 题
          </div>
        </button>

        <button
          onClick={() => setMode('review')}
          className={clsx(
            "relative p-8 rounded-3xl border-2 text-left transition-all duration-300 group overflow-hidden",
            mode === 'review' 
              ? "border-amber-500 bg-amber-50/50 dark:bg-amber-500/10 shadow-xl shadow-amber-500/10" 
              : "border-slate-200 dark:border-white/5 glass-panel hover:border-amber-500/50"
          )}
        >
          <div className={clsx("absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 transition-opacity duration-500", mode === 'review' && "opacity-100")} />
          <Clock className={clsx("w-10 h-10 mb-6 transition-colors", mode === 'review' ? "text-amber-500" : "text-slate-400 group-hover:text-amber-400")} />
          <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3">智能复习</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">专注复习概念模糊或近期未看的题目。</p>
          <div className={clsx("inline-flex items-center px-3 py-1 rounded-full text-sm font-medium", mode === 'review' ? "bg-amber-500/20 text-amber-700 dark:text-amber-400" : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300")}>
            {stats?.reviewQs || 0} 题待复习
          </div>
        </button>

        <button
          onClick={() => setMode('new')}
          className={clsx(
            "relative p-8 rounded-3xl border-2 text-left transition-all duration-300 group overflow-hidden",
            mode === 'new' 
              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 shadow-xl shadow-blue-500/10" 
              : "border-slate-200 dark:border-white/5 glass-panel hover:border-blue-500/50"
          )}
        >
          <div className={clsx("absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 transition-opacity duration-500", mode === 'new' && "opacity-100")} />
          <Star className={clsx("w-10 h-10 mb-6 transition-colors", mode === 'new' ? "text-blue-500" : "text-slate-400 group-hover:text-blue-400")} />
          <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3">只看新题</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">专门攻克尚未掌握的全新面试题。</p>
          <div className={clsx("inline-flex items-center px-3 py-1 rounded-full text-sm font-medium", mode === 'new' ? "bg-blue-500/20 text-blue-700 dark:text-blue-400" : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300")}>
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
          className="group relative flex items-center justify-center px-12 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-xl font-bold hover:scale-105 transition-all shadow-2xl shadow-slate-900/20 dark:shadow-white/20 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative flex items-center group-hover:text-white transition-colors">
            {stats?.total === 0 ? '题库为空' : '开始刷题'}
            <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
          </span>
        </button>
      </motion.div>
    </div>
  );
}
