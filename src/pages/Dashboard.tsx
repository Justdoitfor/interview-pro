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
      <motion.div variants={item} className="relative overflow-hidden rounded-[40px] bg-pastel-teal-light dark:bg-pastel-teal-dark p-8 md:p-16 text-miro-black dark:text-white border border-miro-border/20 dark:border-white/5 shadow-soft">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-white/40 dark:bg-white/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 text-sm font-bold mb-6 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-miro-blue dark:text-pastel-teal-light" />
            <span>为下一次面试做好准备</span>
          </div>
          <h1 className="text-[48px] md:text-[64px] font-display font-bold tracking-[-1.68px] leading-[1.15] mb-6">
            欢迎回来， <br className="hidden md:block" />
            <span className="text-miro-blue dark:text-pastel-teal-light">
              继续构建您的技能树。
            </span>
          </h1>
          <p className="text-miro-slate dark:text-slate-300 text-[22px] font-sans max-w-2xl leading-[1.35] tracking-[-0.44px]">
            您有 {stats.toReview} 道题目需要复习。坚持是通往精通的必经之路。
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={item} className="bg-white dark:bg-[#111] p-6 rounded-[24px] border border-miro-border/40 dark:border-white/10 shadow-soft group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-[12px] group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-miro-slate dark:text-slate-400" />
            </div>
          </div>
          <div>
            <h3 className="text-[32px] font-display font-bold text-miro-black dark:text-white tracking-[-0.72px]">{stats.total}</h3>
            <p className="text-[14px] font-bold text-miro-slate dark:text-slate-400 uppercase tracking-wider mt-1">总题数</p>
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-white dark:bg-[#111] p-6 rounded-[24px] border border-miro-border/40 dark:border-white/10 shadow-soft group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-miro-success/10 rounded-[12px] group-hover:scale-110 transition-transform">
              <CheckCircle className="w-6 h-6 text-miro-success" />
            </div>
          </div>
          <div>
            <h3 className="text-[32px] font-display font-bold text-miro-black dark:text-white tracking-[-0.72px]">{stats.mastered}</h3>
            <p className="text-[14px] font-bold text-miro-slate dark:text-slate-400 uppercase tracking-wider mt-1">已掌握</p>
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-white dark:bg-[#111] p-6 rounded-[24px] border border-miro-border/40 dark:border-white/10 shadow-soft group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-miro-blue/10 rounded-[12px] group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-miro-blue" />
            </div>
          </div>
          <div>
            <h3 className="text-[32px] font-display font-bold text-miro-black dark:text-white tracking-[-0.72px]">{stats.masteryRate}%</h3>
            <p className="text-[14px] font-bold text-miro-slate dark:text-slate-400 uppercase tracking-wider mt-1">掌握率</p>
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-white dark:bg-[#111] p-6 rounded-[24px] border border-miro-border/40 dark:border-white/10 shadow-soft group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-pastel-orange-light rounded-[12px] group-hover:scale-110 transition-transform dark:bg-pastel-yellow-dark">
              <Clock className="w-6 h-6 text-[#cc7a00] dark:text-pastel-orange-light" />
            </div>
          </div>
          <div>
            <h3 className="text-[32px] font-display font-bold text-miro-black dark:text-white tracking-[-0.72px]">{stats.toReview}</h3>
            <p className="text-[14px] font-bold text-miro-slate dark:text-slate-400 uppercase tracking-wider mt-1">待复习</p>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div variants={item} className="lg:col-span-2 bg-white dark:bg-[#111] rounded-[24px] p-8 border border-miro-border/40 dark:border-white/10 shadow-soft">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[24px] font-display font-bold text-miro-black dark:text-white tracking-[-0.72px]">快捷操作</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/practice" className="group relative overflow-hidden p-6 rounded-[16px] border border-miro-success/20 bg-miro-success/5 hover:bg-miro-success/10 transition-colors shadow-sm">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-[12px] bg-white dark:bg-[#111] shadow-sm border border-miro-success/10 flex items-center justify-center mb-4 text-miro-success">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-[18px] font-display font-bold text-miro-black dark:text-white mb-2 group-hover:text-miro-success transition-colors">开始沉浸式刷题</h3>
                <p className="text-[14px] font-sans text-miro-slate dark:text-slate-400">进入由间隔重复驱动的沉浸式闪卡练习模式。</p>
              </div>
              <ArrowRight className="absolute bottom-6 right-6 w-6 h-6 text-miro-success opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </Link>

            <Link to="/questions/new" className="group relative overflow-hidden p-6 rounded-[16px] border border-miro-border/40 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shadow-sm">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-[12px] bg-white dark:bg-[#111] shadow-sm border border-miro-border/20 flex items-center justify-center mb-4 text-miro-slate dark:text-slate-300">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-[18px] font-display font-bold text-miro-black dark:text-white mb-2 group-hover:text-miro-blue transition-colors">录入新题目</h3>
                <p className="text-[14px] font-sans text-miro-slate dark:text-slate-400">使用 Markdown 记录新的面试题，完善您的题库。</p>
              </div>
              <ArrowRight className="absolute bottom-6 right-6 w-6 h-6 text-miro-blue opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </Link>
          </div>
        </motion.div>

        {/* Progress Overview */}
        <motion.div variants={item} className="bg-white dark:bg-[#111] rounded-[24px] p-8 border border-miro-border/40 dark:border-white/10 shadow-soft">
          <h2 className="text-[24px] font-display font-bold text-miro-black dark:text-white mb-8 tracking-[-0.72px]">掌握度分布</h2>
          <div className="space-y-6">
            <div className="group">
              <div className="flex justify-between text-[14px] font-sans mb-2">
                <span className="font-medium text-miro-slate dark:text-slate-300">已掌握</span>
                <span className="font-bold text-miro-black dark:text-white">{stats.mastered}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2.5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.total ? (stats.mastered/stats.total)*100 : 0}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-miro-success h-full rounded-full transition-colors" 
                />
              </div>
            </div>
            <div className="group">
              <div className="flex justify-between text-[14px] font-sans mb-2">
                <span className="font-medium text-miro-slate dark:text-slate-300">学习中</span>
                <span className="font-bold text-miro-black dark:text-white">{stats.learning}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2.5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.total ? (stats.learning/stats.total)*100 : 0}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                  className="bg-pastel-yellow-dark dark:bg-pastel-orange-light h-full rounded-full transition-colors" 
                />
              </div>
            </div>
            <div className="group">
              <div className="flex justify-between text-[14px] font-sans mb-2">
                <span className="font-medium text-miro-slate dark:text-slate-300">新题目</span>
                <span className="font-bold text-miro-black dark:text-white">{stats.newCount}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2.5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.total ? (stats.newCount/stats.total)*100 : 0}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className="bg-pastel-coral-dark dark:bg-pastel-coral-light h-full rounded-full transition-colors" 
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
