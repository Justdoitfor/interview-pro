import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Question } from '../types';
import { X, RefreshCcw, Check, XCircle, Sparkles, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import clsx from 'clsx';
import { useAppStore } from '../store';

const MarkdownComponents = {
  code({ node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || '');
    if (!inline && match) {
      const html = hljs.highlight(String(children).replace(/\n$/, ''), { language: match[1] }).value;
      return <code className={className} dangerouslySetInnerHTML={{ __html: html }} />;
    }
    return <code className={className} {...props}>{children}</code>;
  }
};

export default function PracticeSession() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'all';
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [historyStack, setHistoryStack] = useState<number[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  const allQuestions = useAppStore(state => state.questions);
  const updateQuestion = useAppStore(state => state.updateQuestion);

  useEffect(() => {
    const shuffle = <T,>(arr: T[]) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const loadQuestions = () => {
      let qList: Question[] = [];
      const now = Date.now();
      
      if (mode === 'all') {
        qList = allQuestions;
      } else if (mode === 'new') {
        qList = allQuestions.filter(q => q.masteryLevel === 0);
      } else if (mode === 'review') {
        qList = allQuestions.filter((q) => (q.nextReviewAt || 0) > 0 && (q.nextReviewAt || 0) <= now);
      }

      qList = shuffle(qList);
      setQuestions(qList);
      
      if (qList.length > 0) {
        setIsFlipped(qList[0].reviewCount === 0);
      }
      
      setIsLoading(false);
    };
    loadQuestions();
  }, [mode, allQuestions]);

  const currentQuestion = questions[currentIndex];

  const handleMastery = async (level: 0 | 1 | 2) => {
    if (!currentQuestion) return;

    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const ef0 = typeof currentQuestion.easeFactor === 'number' ? currentQuestion.easeFactor : 2.5;
    const interval0 = typeof currentQuestion.intervalDays === 'number' ? currentQuestion.intervalDays : 0;

    let easeFactor = ef0;
    let intervalDays = interval0;

    if (level === 0) {
      easeFactor = Math.max(1.3, ef0 - 0.2);
      intervalDays = 1;
    } else if (level === 1) {
      easeFactor = Math.max(1.3, ef0 - 0.15);
      intervalDays = Math.max(1, Math.round(interval0 * 1.5) || 2);
    } else {
      easeFactor = Math.min(3, ef0 + 0.1);
      intervalDays = interval0 <= 0 ? 3 : Math.max(1, Math.round(interval0 * easeFactor));
    }

    // 保留两位小数
    easeFactor = Number(easeFactor.toFixed(2));

    await updateQuestion(currentQuestion.id, {
      masteryLevel: level,
      lastReviewedAt: now,
      reviewCount: (currentQuestion.reviewCount || 0) + 1,
      easeFactor,
      intervalDays,
      nextReviewAt: now + intervalDays * day,
      updatedAt: now
    });

    if (currentIndex < questions.length - 1) {
      setHistoryStack(prev => [...prev, currentIndex]);
      const nextQ = questions[currentIndex + 1];
      setIsFlipped(nextQ.reviewCount === 0);
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a] text-slate-900 dark:text-white noise-bg">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Sparkles className="w-8 h-8 text-emerald-500" />
        </motion.div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a] text-slate-900 dark:text-white p-4 noise-bg">
        <h2 className="text-3xl font-display font-bold mb-6 tracking-tight">未找到符合条件的题目</h2>
        <button onClick={() => navigate('/practice')} className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full hover:scale-105 transition-all font-bold">
          返回设置
        </button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a] text-slate-900 dark:text-white p-4 noise-bg">
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/30"
        >
          <Check className="w-12 h-12 text-white" />
        </motion.div>
        <motion.h2 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight"
        >
          练习完成！
        </motion.h2>
        <motion.p 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-slate-500 dark:text-slate-400 mb-10 text-lg"
        >
          您本次复习了 {questions.length} 道题目，干得漂亮！
        </motion.p>
        <motion.button 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
          onClick={() => navigate('/')} 
          className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-slate-900/10 dark:shadow-white/10"
        >
          返回控制台
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] flex flex-col noise-bg overflow-hidden">
      {/* Header */}
      <header className="h-20 flex flex-col justify-center px-4 md:px-8 border-b border-slate-200/50 dark:border-white/5 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-xl z-20 w-full max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between w-full mb-3 mt-2">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/practice')} className="p-2 text-slate-500 hover:bg-slate-200/50 dark:hover:bg-white/5 rounded-full transition-colors" title="退出练习">
              <X className="w-6 h-6" />
            </button>
            {historyStack.length > 0 && (
              <button 
                onClick={() => {
                  const prevIndex = historyStack[historyStack.length - 1];
                  setHistoryStack(prev => prev.slice(0, -1));
                  const prevQ = questions[prevIndex];
                  setCurrentIndex(prevIndex);
                  setIsFlipped(prevQ.reviewCount === 0);
                }} 
                className="flex items-center px-3 py-1.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                上一题
              </button>
            )}
          </div>
          
          {/* Progress Indicator Combined */}
          <div className="flex items-center gap-3">
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full">
              {currentIndex + 1} <span className="opacity-50">/</span> {questions.length}
            </div>
          </div>
        </div>
        
        {/* Progress Bar Container */}
        <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden shrink-0">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Flashcard Area */}
      <main className="flex-1 relative overflow-hidden z-10 w-full max-w-[1400px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id + (isFlipped ? '-back' : '-front')}
            initial={{ opacity: 0, scale: 0.95, rotateY: isFlipped ? -10 : 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, rotateY: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.05, rotateY: isFlipped ? 10 : -10, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="absolute inset-4 md:inset-6 perspective-1000 flex flex-col"
          >
            <div className={clsx(
              "w-full h-full rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative",
              isFlipped 
                ? "bg-white dark:bg-[#111] border border-emerald-500/30 shadow-emerald-500/10" 
                : "bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 shadow-black/5 dark:shadow-white/5"
            )}>
              <div className="p-8 md:p-12 flex-1 overflow-y-auto custom-scrollbar relative z-10">
                {!isFlipped ? (
                  <div className="flex flex-col h-full justify-center">
                    <div className="flex gap-2 mb-8 justify-center">
                      <span className={clsx("px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border", 
                        currentQuestion.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                        currentQuestion.difficulty === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                        'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                      )}>
                        {currentQuestion.difficulty === 'easy' ? '简单' : currentQuestion.difficulty === 'medium' ? '中等' : '困难'}
                      </span>
                      {currentQuestion.tags.map(tag => (
                        <span key={tag} className="px-4 py-1.5 bg-slate-100 border border-slate-200 text-slate-600 dark:bg-white/5 dark:border-white/10 dark:text-slate-300 rounded-full text-xs font-bold uppercase tracking-wider">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-slate-900 dark:text-white mb-8 leading-tight">
                      {currentQuestion.title}
                    </h2>
                    {currentQuestion.content && (
                      <div className="prose prose-slate prose-lg dark:prose-invert max-w-none mx-auto text-center text-slate-600 dark:text-slate-400">
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]} components={MarkdownComponents}>{currentQuestion.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="prose prose-slate prose-lg dark:prose-invert max-w-none w-full">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-white/10">
                      <Sparkles className="w-6 h-6 text-emerald-500" />
                      <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white m-0">答案与解析</h3>
                    </div>
                    <div className="text-slate-700 dark:text-slate-300">
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]} components={MarkdownComponents}>{currentQuestion.answer}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>

              {!isFlipped ? (
                <div className="p-6 bg-slate-50 dark:bg-[#0a0a0a] border-t border-slate-200 dark:border-white/10 relative z-10">
                  <button
                    onClick={() => setIsFlipped(true)}
                    className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-lg hover:scale-[1.02] transition-transform shadow-xl shadow-slate-900/10 dark:shadow-white/10"
                  >
                    查看答案
                  </button>
                </div>
              ) : (
                <div className="p-6 bg-slate-50 dark:bg-[#0a0a0a] border-t border-slate-200 dark:border-white/10 relative z-10">
                  <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 mb-4 tracking-widest">请评估您对这道题的掌握程度</p>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => handleMastery(0)}
                      className="flex flex-col items-center justify-center p-4 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl hover:border-rose-500 dark:hover:border-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-500/10 transition-all group"
                    >
                      <XCircle className="w-8 h-8 text-rose-500 mb-3 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-rose-600 dark:group-hover:text-rose-400">未掌握</span>
                    </button>
                    <button
                      onClick={() => handleMastery(1)}
                      className="flex flex-col items-center justify-center p-4 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-500/10 transition-all group"
                    >
                      <RefreshCcw className="w-8 h-8 text-amber-500 mb-3 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400">概念模糊</span>
                    </button>
                    <button
                      onClick={() => handleMastery(2)}
                      className="flex flex-col items-center justify-center p-4 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10 transition-all group"
                    >
                      <Check className="w-8 h-8 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">熟练掌握</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
