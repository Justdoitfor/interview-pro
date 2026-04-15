import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Question } from '../types';
import { X, RefreshCcw, Check, XCircle, Sparkles, ChevronLeft, HelpCircle, CheckCircle2, Bot, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createDeck, Grade } from 'femto-fsrs';
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
import { generateQwenAnswer } from '../services/qwen';

const { newCard, gradeCard } = createDeck();

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
  const [activeAnswerTab, setActiveAnswerTab] = useState<'fixed' | 'ai'>('fixed');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const isInitialized = useRef(false);

  const allQuestions = useAppStore(state => state.questions);
  const updateQuestion = useAppStore(state => state.updateQuestion);
  const qwenApiKey = useAppStore(state => state.qwenApiKey);
  const qwenBaseUrl = useAppStore(state => state.qwenBaseUrl);
  const qwenModel = useAppStore(state => state.qwenModel);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
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

  const handleGenerateAIAnswer = async () => {
    if (!currentQuestion) return;
    if (currentQuestion.aiAnswer) return;

    if (!qwenApiKey) {
      alert('请先在设置中配置 Qwen API Key');
      setActiveAnswerTab('fixed');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const prompt = `请作为资深技术面试官，为以下面试题提供专业、准确且结构清晰的解答：\n\n题目：${currentQuestion.title}\n${currentQuestion.content ? `背景描述：${currentQuestion.content}\n` : ''}\n请直接给出答案，无需多余寒暄，使用 Markdown 格式。`;
      
      const aiAnswer = await generateQwenAnswer({
        apiKey: qwenApiKey,
        baseUrl: qwenBaseUrl,
        model: qwenModel,
        messages: [
          { role: 'system', content: '你是一个资深的技术专家和面试官，擅长用简洁清晰的语言解答技术问题。' },
          { role: 'user', content: prompt }
        ]
      });

      const now = Date.now();
      await updateQuestion(currentQuestion.id, {
        aiAnswer,
        aiAnswerUpdatedAt: now,
        updatedAt: now
      });
      
      setQuestions(prev => prev.map(q => q.id === currentQuestion.id ? { ...q, aiAnswer, aiAnswerUpdatedAt: now } : q));
    } catch (err: any) {
      alert(`生成 AI 答案失败: ${err.message}`);
      setActiveAnswerTab('fixed');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleMastery = async (level: 0 | 1 | 2) => {
    if (!currentQuestion) return;

    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const grade = level === 0 ? Grade.AGAIN : level === 1 ? Grade.HARD : Grade.GOOD;
    const prevReviewedAt = currentQuestion.fsrsLastReviewAt || currentQuestion.lastReviewedAt || 0;
    const daysSinceReview = prevReviewedAt > 0 ? (now - prevReviewedAt) / day : 0;
    const nextCard = currentQuestion.fsrsCard
      ? gradeCard(currentQuestion.fsrsCard, daysSinceReview, grade)
      : newCard(grade);
    const intervalDays = Math.max(1, Math.round(nextCard.I));
    const nextReviewAt = now + nextCard.I * day;

    await updateQuestion(currentQuestion.id, {
      masteryLevel: level,
      lastReviewedAt: now,
      reviewCount: (currentQuestion.reviewCount || 0) + 1,
      intervalDays,
      nextReviewAt,
      fsrsCard: nextCard,
      fsrsLastReviewAt: now,
      updatedAt: now
    });

    if (currentIndex < questions.length - 1) {
      setHistoryStack(prev => [...prev, currentIndex]);
      const nextQ = questions[currentIndex + 1];
      setIsFlipped(nextQ.reviewCount === 0);
      setActiveAnswerTab('fixed');
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-miro-black text-miro-black dark:text-white">
        <div className="flex flex-col items-center">
          <RefreshCcw className="w-8 h-8 text-miro-blue animate-spin mb-4" />
          <p className="text-miro-slate font-sans">准备题库中...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-miro-black text-miro-black dark:text-white p-4">
        <div className="w-24 h-24 bg-pastel-coral-light dark:bg-pastel-coral-dark rounded-[24px] flex items-center justify-center mb-8 shadow-soft">
          <XCircle className="w-12 h-12 text-pastel-coral-dark dark:text-pastel-coral-light" />
        </div>
        <h2 className="text-[32px] font-display font-bold mb-4 tracking-[-0.72px]">没有符合条件的题目</h2>
        <p className="text-miro-slate mb-8 font-sans">当前题库中没有待复习的题目。</p>
        <button onClick={() => navigate('/')} className="px-8 py-3 bg-miro-blue text-white rounded-[8px] font-display font-bold text-[17.5px] hover:bg-miro-bluePressed transition-colors shadow-soft">
          返回控制台
        </button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-miro-black flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-24 h-24 bg-miro-success rounded-[24px] flex items-center justify-center mb-8 shadow-soft"
        >
          <Check className="w-12 h-12 text-white" />
        </motion.div>
        <motion.h2 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-[48px] font-display font-bold mb-4 tracking-[-1.44px] text-miro-black dark:text-white"
        >
          练习完成！
        </motion.h2>
        <motion.p 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-miro-slate dark:text-slate-400 mb-10 text-[18px] font-sans"
        >
          您本次复习了 {questions.length} 道题目，干得漂亮！
        </motion.p>
        <motion.button 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
          onClick={() => navigate('/')} 
          className="px-8 py-3 bg-miro-blue text-white rounded-[8px] font-display font-bold text-[17.5px] hover:bg-miro-bluePressed transition-colors shadow-soft"
        >
          返回控制台
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-miro-black flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <header className="h-20 flex flex-col justify-center px-4 md:px-8 border-b border-miro-border/40 dark:border-white/10 bg-white/80 dark:bg-miro-black/80 backdrop-blur-xl z-20 w-full max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between w-full mb-3 mt-2 gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => navigate('/practice')} className="p-2 text-miro-slate hover:bg-slate-100 dark:hover:bg-white/5 rounded-[8px] transition-colors" title="退出练习">
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
                  setActiveAnswerTab('fixed');
                }} 
                className="flex items-center px-4 py-2 text-[14px] font-display font-bold text-miro-black dark:text-white bg-white dark:bg-white/5 border border-miro-border dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 rounded-[8px] transition-colors shrink-0 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                上一题
              </button>
            )}
          </div>
          
          {/* Progress Indicator Combined */}
          <div className="flex items-center justify-center flex-1 min-w-0">
            {isFlipped && (
              <h3 className="text-[16px] md:text-[18px] font-display font-bold text-miro-black dark:text-slate-200 truncate px-4">
                {currentQuestion.title}
              </h3>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-[14px] font-display font-bold text-miro-blue bg-miro-blue/10 dark:bg-miro-blue/20 px-3 py-1.5 rounded-[8px]">
              {currentIndex + 1} <span className="opacity-50">/</span> {questions.length}
            </div>
          </div>
        </div>
        
        {/* Progress Bar Container */}
        <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden shrink-0">
          <div 
            className="h-full bg-miro-blue transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Flashcard Area */}
      <main className="flex-1 relative overflow-hidden z-10 w-full max-w-[1400px] mx-auto p-4 md:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id + (isFlipped ? '-back' : '-front')}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -10 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="absolute inset-4 md:inset-6 flex flex-col"
          >
            <div className={clsx(
              "w-full h-full rounded-[24px] flex flex-col overflow-hidden relative transition-colors duration-500",
              isFlipped 
                ? "bg-pastel-pink-soft dark:bg-pastel-pink-soft/10 border border-pastel-pink-soft/50 shadow-soft" 
                : "bg-white dark:bg-[#111] border border-miro-border/40 dark:border-white/10 shadow-soft"
            )}>
              <div className="p-8 md:p-12 flex-1 overflow-y-auto custom-scrollbar relative z-10">
                {!isFlipped ? (
                  <div className="flex flex-col h-full justify-center">
                    <div className="flex gap-2 mb-8 justify-center">
                      <span className={clsx("px-4 py-1.5 rounded-[8px] text-[12px] font-bold uppercase tracking-wider border", 
                        currentQuestion.difficulty === 'easy' ? 'bg-miro-success/10 text-miro-success border-miro-success/20' :
                        currentQuestion.difficulty === 'medium' ? 'bg-pastel-orange-light text-[#cc7a00] border-[#cc7a00]/20 dark:bg-pastel-orange-light/10 dark:text-pastel-orange-light' :
                        'bg-pastel-red-light text-pastel-coral-dark border-pastel-coral-dark/20 dark:bg-pastel-red-light/10 dark:text-pastel-red-light'
                      )}>
                        {currentQuestion.difficulty === 'easy' ? '简单' : currentQuestion.difficulty === 'medium' ? '中等' : '困难'}
                      </span>
                      {currentQuestion.tags.map(tag => (
                        <span key={tag} className="px-4 py-1.5 bg-slate-100 border border-miro-border/40 text-miro-slate dark:bg-white/5 dark:border-white/10 dark:text-slate-300 rounded-[8px] text-[12px] font-bold uppercase tracking-wider">
                          {tag}
                        </span>
                      ))}
                    </div>
                    {!isFlipped && (
                      <h2 className="text-[32px] md:text-[40px] font-display font-bold text-center text-miro-black dark:text-white mb-8 leading-tight tracking-[-0.72px]">
                        {currentQuestion.title}
                      </h2>
                    )}
                    {currentQuestion.content && (
                      <div className="prose prose-slate prose-lg dark:prose-invert max-w-none mx-auto text-center text-miro-slate dark:text-slate-400 mt-4">
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]} components={MarkdownComponents}>{currentQuestion.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="prose prose-slate prose-lg dark:prose-invert max-w-none w-full relative">
                    <div className="absolute top-0 right-0 flex items-center bg-slate-100 dark:bg-white/5 rounded-[12px] p-1 border border-miro-border/40 dark:border-white/10 shadow-sm z-20">
                      <button
                        onClick={() => setActiveAnswerTab('fixed')}
                        className={clsx(
                          "px-4 py-2 rounded-[8px] text-[14px] font-bold transition-all flex items-center gap-2 font-display",
                          activeAnswerTab === 'fixed' 
                            ? "bg-white dark:bg-[#222] text-miro-blue shadow-sm" 
                            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        )}
                      >
                        <FileText className="w-4 h-4" />
                        固定答案
                      </button>
                      <button
                        onClick={() => {
                          setActiveAnswerTab('ai');
                          if (!currentQuestion.aiAnswer) {
                            handleGenerateAIAnswer();
                          }
                        }}
                        className={clsx(
                          "px-4 py-2 rounded-[8px] text-[14px] font-bold transition-all flex items-center gap-2 font-display",
                          activeAnswerTab === 'ai' 
                            ? "bg-white dark:bg-[#222] text-miro-success shadow-sm" 
                            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        )}
                      >
                        <Bot className="w-4 h-4" />
                        AI 解析
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-miro-black/5 dark:border-white/10 pr-[240px]">
                      {activeAnswerTab === 'fixed' ? (
                        <>
                          <Sparkles className="w-6 h-6 text-miro-blue" />
                          <h3 className="text-[24px] font-display font-bold text-miro-black dark:text-white m-0 tracking-[-0.72px]">答案与解析</h3>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-6 h-6 text-miro-success" />
                          <h3 className="text-[24px] font-display font-bold text-miro-black dark:text-white m-0 tracking-[-0.72px]">AI 参考答案</h3>
                        </>
                      )}
                    </div>
                    
                    <div className="text-miro-black/80 dark:text-slate-300 font-sans text-[18px]">
                      {activeAnswerTab === 'fixed' ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]} components={MarkdownComponents}>
                          {currentQuestion.answer || '*未提供固定答案*'}
                        </ReactMarkdown>
                      ) : (
                        isGeneratingAI ? (
                          <div className="flex flex-col items-center justify-center py-20 text-miro-slate">
                            <Loader2 className="w-10 h-10 animate-spin mb-4 text-miro-success" />
                            <p className="font-bold text-[16px] tracking-widest">AI 正在思考中...</p>
                          </div>
                        ) : (
                          <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]} components={MarkdownComponents}>
                            {currentQuestion.aiAnswer || '*AI 暂无答案*'}
                          </ReactMarkdown>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              {!isFlipped ? (
                <div className="p-6 bg-slate-50/50 dark:bg-black/20 border-t border-miro-border/40 dark:border-white/10 relative z-10 flex justify-center">
                  <button
                    onClick={() => setIsFlipped(true)}
                    className="w-full md:w-auto min-w-[200px] px-8 py-4 bg-miro-blue text-white rounded-[8px] font-display font-bold text-[17.5px] hover:bg-miro-bluePressed transition-colors shadow-soft"
                  >
                    查看答案
                  </button>
                </div>
              ) : (
                <div className="p-6 bg-white/50 dark:bg-black/20 border-t border-miro-border/20 dark:border-white/10 relative z-10">
                  <p className="text-center text-[14px] font-bold text-miro-slate dark:text-slate-400 mb-4 tracking-widest uppercase">评估掌握程度</p>
                  <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
                    <button
                      onClick={() => handleMastery(0)}
                      className="flex flex-col items-center justify-center p-4 bg-white dark:bg-[#111] border border-miro-border/40 dark:border-white/10 rounded-[12px] hover:border-pastel-coral-dark dark:hover:border-pastel-coral-light hover:bg-pastel-red-light/30 transition-all group shadow-sm hover:shadow-soft"
                    >
                      <XCircle className="w-8 h-8 text-pastel-coral-dark dark:text-pastel-coral-light mb-3 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-miro-black dark:text-slate-300 group-hover:text-pastel-coral-dark dark:group-hover:text-pastel-coral-light">未掌握</span>
                    </button>
                    <button
                      onClick={() => handleMastery(1)}
                      className="flex flex-col items-center justify-center p-4 bg-white dark:bg-[#111] border border-miro-border/40 dark:border-white/10 rounded-[12px] hover:border-pastel-yellow-dark dark:hover:border-pastel-orange-light hover:bg-pastel-orange-light/30 transition-all group shadow-sm hover:shadow-soft"
                    >
                      <HelpCircle className="w-8 h-8 text-pastel-yellow-dark dark:text-pastel-orange-light mb-3 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-miro-black dark:text-slate-300 group-hover:text-pastel-yellow-dark dark:group-hover:text-pastel-orange-light">模糊</span>
                    </button>
                    <button
                      onClick={() => handleMastery(2)}
                      className="flex flex-col items-center justify-center p-4 bg-white dark:bg-[#111] border border-miro-border/40 dark:border-white/10 rounded-[12px] hover:border-miro-success hover:bg-miro-success/10 transition-all group shadow-sm hover:shadow-soft"
                    >
                      <CheckCircle2 className="w-8 h-8 text-miro-success mb-3 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-miro-black dark:text-slate-300 group-hover:text-miro-success">已掌握</span>
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
