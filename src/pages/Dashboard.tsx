import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useAppStore } from '../store';
import { useMemo } from 'react';

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const questions = useAppStore(state => state.questions);

  const stats = useMemo(() => {
    let total = questions.length;
    const now = Date.now();
    let mastered = 0;
    let learning = 0;
    let newCount = 0;
    let toReview = 0;

    questions.forEach(q => {
      const level = Number(q.masteryLevel) || 0;
      if (level === 2) mastered++;
      else if (level === 1) learning++;
      else newCount++;

      if ((q.nextReviewAt || 0) > 0 && (q.nextReviewAt || 0) <= now) {
        toReview++;
      }
    });

    return {
      total,
      mastered,
      learning,
      newCount,
      toReview,
      masteryRate: total > 0 ? Math.round((mastered / total) * 100) : 0
    };
  }, [questions]);

  if (!stats) return <div className="p-8 text-center text-slate-500 animate-pulse">正在加载...</div>;

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-[1400px] mx-auto space-y-8 w-full"
    >
      <motion.div variants={item} className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 dark:from-[#1a1a1a] dark:to-[#0a0a0a] p-8 md:p-12 text-white border border-slate-800 dark:border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-sm font-medium mb-6 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>为下一次面试做好准备</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">
            欢迎回来， <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
              继续构建您的技能树。
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl">
            您有 {stats.toReview} 道题目需要复习。坚持是通往精通的必经之路。
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={item} className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">{stats.total}</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">总题数</p>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">{stats.mastered}</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">已掌握</p>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">{stats.masteryRate}%</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">掌握率</p>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div>
            <h3 className="text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">{stats.toReview}</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">待复习</p>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div variants={item} className="lg:col-span-2 glass-panel rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">快捷操作</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/practice" className="group relative overflow-hidden p-6 rounded-2xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 hover:bg-emerald-100/50 dark:hover:bg-emerald-500/10 transition-colors">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">开始沉浸式刷题</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">进入由间隔重复驱动的沉浸式闪卡练习模式。</p>
              </div>
              <ArrowRight className="absolute bottom-6 right-6 w-6 h-6 text-emerald-500 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </Link>

            <Link to="/questions/new" className="group relative overflow-hidden p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 hover:bg-slate-100/50 dark:hover:bg-white/10 transition-colors">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-white/10 flex items-center justify-center mb-4 text-slate-700 dark:text-slate-300">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2">录入新题目</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">使用 Markdown 记录新的面试题，完善您的题库。</p>
              </div>
              <ArrowRight className="absolute bottom-6 right-6 w-6 h-6 text-slate-400 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </Link>
          </div>
        </motion.div>

        {/* Progress Overview */}
        <motion.div variants={item} className="glass-panel rounded-3xl p-8">
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-8">掌握度分布</h2>
          <div className="space-y-6">
            <div className="group">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700 dark:text-slate-300">已掌握</span>
                <span className="font-bold text-slate-900 dark:text-white">{stats.mastered}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.total ? (stats.mastered/stats.total)*100 : 0}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-emerald-500 h-full rounded-full group-hover:bg-emerald-400 transition-colors" 
                />
              </div>
            </div>
            <div className="group">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700 dark:text-slate-300">学习中</span>
                <span className="font-bold text-slate-900 dark:text-white">{stats.learning}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.total ? (stats.learning/stats.total)*100 : 0}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                  className="bg-amber-500 h-full rounded-full group-hover:bg-amber-400 transition-colors" 
                />
              </div>
            </div>
            <div className="group">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700 dark:text-slate-300">新题目</span>
                <span className="font-bold text-slate-900 dark:text-white">{stats.newCount}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.total ? (stats.newCount/stats.total)*100 : 0}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className="bg-rose-500 h-full rounded-full group-hover:bg-rose-400 transition-colors" 
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
