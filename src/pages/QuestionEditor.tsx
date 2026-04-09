import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, Save, Eye, Edit3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { Question } from '../types';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useAppStore } from '../store';

type QuestionFormData = Omit<
  Question,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'lastReviewedAt'
  | 'reviewCount'
  | 'masteryLevel'
  | 'nextReviewAt'
  | 'intervalDays'
  | 'easeFactor'
>;

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

export default function QuestionEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const questions = useAppStore(state => state.questions);
  const addQuestion = useAppStore(state => state.addQuestion);
  const updateQuestion = useAppStore(state => state.updateQuestion);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<QuestionFormData>({
    defaultValues: {
      title: '',
      difficulty: 'medium',
      tags: [],
      content: '',
      answer: ''
    }
  });

  const tags = watch('tags');
  const content = watch('content');
  const answer = watch('answer');

  useEffect(() => {
    if (id) {
      const q = questions.find(q => q.id === id);
      if (q) {
        reset({
          title: q.title,
          difficulty: q.difficulty,
          tags: q.tags,
          content: q.content,
          answer: q.answer
        });
      }
    }
  }, [id, questions, reset]);

  const onSubmit = async (data: QuestionFormData) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await updateQuestion(id, {
          ...data,
          updatedAt: Date.now()
        });
      } else {
        const now = Date.now();
        const newQuestion: Question = {
          id: uuidv4(),
          ...data,
          masteryLevel: 0,
          lastReviewedAt: 0,
          reviewCount: 0,
          nextReviewAt: 0,
          intervalDays: 0,
          easeFactor: 2.5,
          createdAt: now,
          updatedAt: now
        };
        await addQuestion(newQuestion);
      }
      navigate('/questions');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Save failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setValue('tags', [...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', tags.filter(t => t !== tagToRemove));
  };

  const allTags = Array.from(new Set(questions.flatMap(q => q.tags)));
  const suggestedTags = allTags.filter(t => !tags.includes(t) && t.toLowerCase().includes(tagInput.toLowerCase()));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1400px] mx-auto space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/questions')}
            className="p-3 text-slate-500 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-white/5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
            {id ? '编辑题目' : '新建题目'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center px-6 py-3 text-slate-600 bg-white dark:text-slate-300 dark:bg-[#111] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 rounded-full transition-all font-bold shadow-sm"
          >
            {isPreview ? <><Edit3 className="w-5 h-5 mr-2" /> 编辑模式</> : <><Eye className="w-5 h-5 mr-2" /> 预览模式</>}
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="flex items-center px-8 py-3 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 hover:scale-105 transition-all font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Save className="w-5 h-5 mr-2" />
            {isSubmitting ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      <form className="space-y-8 glass-panel rounded-3xl p-8 md:p-12">
        {!isPreview ? (
          <>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">题目标题 <span className="text-emerald-500">*</span></label>
                <input
                  {...register('title', { required: '请输入题目标题' })}
                  className="w-full px-5 py-4 bg-slate-50/50 dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all text-lg font-medium"
                  placeholder="例如：解释一下 React 中的 useEffect"
                />
                {errors.title && <p className="mt-2 text-sm text-rose-500 font-medium">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">难度</label>
                  <select
                    {...register('difficulty')}
                    className="w-full px-5 py-4 bg-slate-50/50 dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all cursor-pointer font-medium"
                  >
                    <option value="easy">简单</option>
                    <option value="medium">中等</option>
                    <option value="hard">困难</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">标签 (按回车添加)</label>
                  <div className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-50/50 dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl focus-within:ring-2 focus-within:ring-emerald-500/50 focus-within:border-emerald-500 transition-all min-h-[58px]">
                    {tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-bold">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-emerald-900 dark:hover:text-emerald-200 ml-1">×</button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="flex-1 min-w-[120px] bg-transparent border-none outline-none px-2 py-1 text-slate-900 dark:text-white font-medium"
                      placeholder="添加标签..."
                    />
                  </div>
                  {/* Tag Suggestions */}
                  {suggestedTags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-1">建议标签:</span>
                      {suggestedTags.slice(0, 10).map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            setValue('tags', [...tags, tag]);
                            setTagInput('');
                          }}
                          className="px-3 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">题目描述 (支持 Markdown)</label>
                <textarea
                  {...register('content')}
                  rows={4}
                  className="w-full px-5 py-4 bg-slate-50/50 dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all font-mono text-sm leading-relaxed resize-y"
                  placeholder="详细描述题目或要求..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">答案与解析 (支持 Markdown) <span className="text-emerald-500">*</span></label>
                <textarea
                  {...register('answer', { required: '请输入答案' })}
                  rows={12}
                  className="w-full px-5 py-4 bg-slate-50/50 dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all font-mono text-sm leading-relaxed resize-y"
                  placeholder="提供详细的答案和解析..."
                />
                {errors.answer && <p className="mt-2 text-sm text-rose-500 font-medium">{errors.answer.message}</p>}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-12 prose prose-slate prose-lg dark:prose-invert max-w-none">
            <div className="text-center pb-8 border-b border-slate-200/50 dark:border-white/10">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 tracking-tight">{watch('title') || '无标题题目'}</h2>
              <div className="flex flex-wrap justify-center gap-3">
                <span className={clsx("px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border", 
                  watch('difficulty') === 'easy' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                  watch('difficulty') === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                  'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                )}>
                  {watch('difficulty') === 'easy' ? '简单' : watch('difficulty') === 'medium' ? '中等' : '困难'}
                </span>
                {tags.map(tag => (
                  <span key={tag} className="px-4 py-1.5 bg-slate-100 border border-slate-200 text-slate-600 dark:bg-white/5 dark:border-white/10 dark:text-slate-300 rounded-full text-xs font-bold uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            {content && (
              <div>
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-6">题目描述</h3>
                <div className="bg-slate-50/50 dark:bg-[#111]/50 p-8 rounded-3xl border border-slate-200/50 dark:border-white/5">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>{content}</ReactMarkdown>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-6">答案与解析</h3>
              <div className="bg-emerald-50/50 dark:bg-emerald-500/5 p-8 rounded-3xl border border-emerald-200/50 dark:border-emerald-500/10">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>{answer || '*未提供答案*'}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </form>
    </motion.div>
  );
}
