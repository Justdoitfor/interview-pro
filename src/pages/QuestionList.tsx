import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Upload, Download, FileDown, Trash } from 'lucide-react';
import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { Question } from '../types';
import { useAppStore } from '../store';

export default function QuestionList() {
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterMastery, setFilterMastery] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importMode, setImportMode] = useState<'skip_duplicates' | 'allow_duplicates'>('skip_duplicates');
  const [importRows, setImportRows] = useState<
    Array<{
      index: number;
      title: string;
      difficulty: 'easy' | 'medium' | 'hard';
      tags: string[];
      content: string;
      answer: string;
      aiAnswer: string;
      errors: string[];
      duplicate: boolean;
      signature: string;
    }>
  >([]);

  const allQuestions = useAppStore(state => state.questions);
  const bulkAddQuestions = useAppStore(state => state.bulkAddQuestions);
  const bulkUpdateQuestions = useAppStore(state => state.bulkUpdateQuestions);
  const bulkDeleteQuestions = useAppStore(state => state.bulkDeleteQuestions);
  const deleteQuestion = useAppStore(state => state.deleteQuestion);

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    allQuestions.forEach(q => q.tags.forEach(t => tagsSet.add(t)));
    return Array.from(tagsSet).sort();
  }, [allQuestions]);

  const questions = useMemo(() => {
    let results = allQuestions.filter(q => filterDifficulty === 'all' || q.difficulty === filterDifficulty);
    
    if (filterMastery !== 'all') {
      results = results.filter(q => q.masteryLevel === parseInt(filterMastery, 10));
    }
    
    if (filterTag !== 'all') {
      results = results.filter(q => q.tags.includes(filterTag));
    }
    
    if (search.trim()) {
      results = results.filter(q => 
        q.title.toLowerCase().includes(search.toLowerCase()) || 
        q.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      );
    }
    return results.sort((a, b) => b.createdAt - a.createdAt);
  }, [allQuestions, filterDifficulty, filterMastery, filterTag, search]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      await deleteQuestion(id);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-500/20 dark:bg-emerald-500/10';
      case 'medium': return 'text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-500/20 dark:bg-amber-500/10';
      case 'hard': return 'text-rose-600 border-rose-200 bg-rose-50 dark:text-rose-400 dark:border-rose-500/20 dark:bg-rose-500/10';
      default: return 'text-slate-600 border-slate-200 bg-slate-50 dark:text-slate-400 dark:border-slate-500/20 dark:bg-slate-500/10';
    }
  };

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case 'easy': return '简单';
      case 'medium': return '中等';
      case 'hard': return '困难';
      default: return '未知';
    }
  };

  const signatureOf = (title: string, answer: string, aiAnswer?: string) => {
    const t = title.trim().replace(/\s+/g, ' ');
    const a0 = answer.trim();
    const a1 = String(aiAnswer ?? '').trim();
    const a = (a0 || a1).replace(/\s+/g, ' ');
    return `${t}||${a}`;
  };

  const normalizeDifficulty = (raw: unknown): 'easy' | 'medium' | 'hard' => {
    const v = String(raw ?? 'medium').toLowerCase().trim();
    if (v === '简单' || v === 'easy') return 'easy';
    if (v === '困难' || v === 'hard') return 'hard';
    return 'medium';
  };

  const parseTags = (raw: unknown) =>
    String(raw ?? '')
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);

  const downloadFile = (filename: string, content: BlobPart, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const headers = [
      { 题目名称: '', 难度: '', 标签: '', 题目描述: '', 答案与解析: '', AI答案: '' }
    ];
    const worksheet = XLSX.utils.json_to_sheet(headers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '模板');
    XLSX.writeFile(workbook, '题库导入模板.xlsx');
  };

  const exportExcel = async () => {
    const rows = allQuestions.map((q) => ({
      题目名称: q.title,
      难度: q.difficulty === 'easy' ? '简单' : q.difficulty === 'hard' ? '困难' : '中等',
      标签: q.tags.join(','),
      题目描述: q.content,
      答案与解析: q.answer,
      AI答案: q.aiAnswer || ''
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '题库');
    XLSX.writeFile(workbook, `题库导出-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportCsv = async () => {
    const rows = allQuestions.map((q) => ({
      题目名称: q.title,
      难度: q.difficulty === 'easy' ? '简单' : q.difficulty === 'hard' ? '困难' : '中等',
      标签: q.tags.join(','),
      题目描述: q.content,
      答案与解析: q.answer,
      AI答案: q.aiAnswer || ''
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    downloadFile(`题库导出-${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv;charset=utf-8');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet) as any[];

      const existingSigs = new Set(allQuestions.map((q) => signatureOf(q.title, q.answer, q.aiAnswer)));

      const localSeen = new Set<string>();
      const parsed = json.map((row, i) => {
        const title = String(row['题目名称'] || row['title'] || '').trim();
        const answer = String(row['答案与解析'] || row['answer'] || '').trim();
        const aiAnswer = String(row['AI答案'] || row['aiAnswer'] || '').trim();
        const difficulty = normalizeDifficulty(row['难度'] || row['difficulty']);
        const tags = parseTags(row['标签'] || row['tags']);
        const content = String(row['题目描述'] || row['content'] || '');
        const signature = signatureOf(title, answer, aiAnswer);

        const errors: string[] = [];
        if (!title) errors.push('缺少题目名称');
        if (!answer && !aiAnswer) errors.push('缺少答案与解析（固定答案或 AI 答案至少提供一个）');
        if (!['easy', 'medium', 'hard'].includes(difficulty)) errors.push('难度不合法');

        const duplicate = (title && (answer || aiAnswer) && (existingSigs.has(signature) || localSeen.has(signature))) || false;
        localSeen.add(signature);

        return {
          index: i + 2,
          title,
          difficulty,
          tags,
          content,
          answer,
          aiAnswer,
          errors,
          duplicate,
          signature
        };
      });

      setImportRows(parsed);
      setImportDialogOpen(true);
    } catch (error) {
      console.error('导入失败:', error);
      alert('文件解析失败，请确保格式正确（支持 csv, txt, xls, xlsx）。');
    } finally {
      event.target.value = '';
    }
  };

  const closeImportDialog = () => {
    setImportDialogOpen(false);
    setImportRows([]);
  };

  const confirmImport = async () => {
    const valid = importRows.filter((r) => r.errors.length === 0);
    const filtered =
      importMode === 'skip_duplicates' ? valid.filter((r) => !r.duplicate) : valid;

    if (filtered.length === 0) {
      alert('没有可导入的数据（可能全是错误行或重复行）。');
      return;
    }

    const now = Date.now();
    const toAdd: Question[] = filtered.map((r) => ({
      id: uuidv4(),
      title: r.title,
      difficulty: r.difficulty,
      tags: r.tags,
      content: r.content,
      answer: r.answer,
      aiAnswer: r.aiAnswer,
      aiAnswerUpdatedAt: r.aiAnswer ? now : 0,
      masteryLevel: 0,
      lastReviewedAt: 0,
      reviewCount: 0,
      nextReviewAt: 0,
      intervalDays: 0,
      easeFactor: 2.5,
      createdAt: now,
      updatedAt: now
    }));

    await bulkAddQuestions(toAdd);
    alert(`成功导入 ${toAdd.length} 道题目！`);
    closeImportDialog();
  };

  const toggleAll = (checked: boolean) => {
    if (!questions) return;
    if (checked) setSelectedIds(new Set(questions.map((q) => q.id)));
    else setSelectedIds(new Set());
  };

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`确定要删除选中的 ${selectedIds.size} 道题目吗？此操作不可撤销。`)) return;
    await bulkDeleteQuestions(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleBulkChangeDifficulty = async (difficulty: 'easy' | 'medium' | 'hard') => {
    if (selectedIds.size === 0) return;
    const now = Date.now();
    const updates = Array.from(selectedIds).map(id => ({
      id,
      changes: { difficulty, updatedAt: now }
    }));
    await bulkUpdateQuestions(updates);
    setSelectedIds(new Set());
  };

  const handleBulkAddTags = async () => {
    if (selectedIds.size === 0) return;
    const tagsStr = window.prompt('请输入要追加的标签，多个标签用逗号分隔：');
    if (!tagsStr) return;
    const newTags = parseTags(tagsStr);
    if (newTags.length === 0) return;

    const now = Date.now();
    const selectedSet = new Set(Array.from(selectedIds));
    const qsToUpdate = allQuestions.filter(q => selectedSet.has(q.id));
    
    const updates = qsToUpdate.map(q => {
      const mergedTags = Array.from(new Set([...q.tags, ...newTags]));
      return { id: q.id, changes: { tags: mergedTags, updatedAt: now } };
    });

    await bulkUpdateQuestions(updates);
    setSelectedIds(new Set());
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white mb-2">题库管理</h1>
          <p className="text-slate-500 dark:text-slate-400">管理和编辑您的本地面试题目</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 justify-end">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".csv,.txt,.xls,.xlsx" 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-50 dark:hover:bg-white/5 transition-colors font-medium shadow-sm"
          >
            <Upload className="w-5 h-5 mr-2" />
            批量上传
          </button>
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-50 dark:hover:bg-white/5 transition-colors font-medium shadow-sm"
          >
            <FileDown className="w-5 h-5 mr-2" />
            下载模板
          </button>
          <button
            onClick={exportExcel}
            className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-50 dark:hover:bg-white/5 transition-colors font-medium shadow-sm"
          >
            <Download className="w-5 h-5 mr-2" />
            导出 Excel
          </button>
          <button
            onClick={exportCsv}
            className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-50 dark:hover:bg-white/5 transition-colors font-medium shadow-sm"
          >
            <Download className="w-5 h-5 mr-2" />
            导出 CSV
          </button>
          <Link
            to="/questions/new"
            className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors font-medium shadow-lg shadow-slate-900/10 dark:shadow-white/10"
          >
            <Plus className="w-5 h-5 mr-2" />
            录入题目
          </Link>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden w-full">
        {selectedIds.size > 0 && (
          <div className="px-6 py-4 border-b border-emerald-200/50 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
              已选择 {selectedIds.size} 项
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    handleBulkChangeDifficulty(val as any);
                    e.target.value = '';
                  }
                }}
                className="px-3 py-1.5 bg-white dark:bg-[#111] border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-medium outline-none cursor-pointer"
              >
                <option value="">修改难度...</option>
                <option value="easy">设为简单</option>
                <option value="medium">设为中等</option>
                <option value="hard">设为困难</option>
              </select>
              <button
                onClick={handleBulkAddTags}
                className="px-4 py-1.5 bg-white dark:bg-[#111] border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-bold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
              >
                追加标签
              </button>
              <button
                onClick={bulkDelete}
                className="inline-flex items-center px-4 py-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30 dark:hover:bg-rose-500/20 transition-colors font-bold shadow-sm"
              >
                <Trash className="w-4 h-4 mr-1.5" />
                批量删除
              </button>
            </div>
          </div>
        )}

        <div className="p-6 border-b border-slate-200/50 dark:border-white/5 flex flex-col gap-4 bg-white/50 dark:bg-slate-900/50">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="搜索题目或标签..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all shadow-sm"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all cursor-pointer shadow-sm min-w-[120px]"
            >
              <option value="all">所有难度</option>
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
            </select>

            <select
              value={filterMastery}
              onChange={(e) => setFilterMastery(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all cursor-pointer shadow-sm min-w-[120px]"
            >
              <option value="all">所有掌握程度</option>
              <option value="0">新题目</option>
              <option value="1">学习中</option>
              <option value="2">已掌握</option>
            </select>

            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all cursor-pointer shadow-sm min-w-[120px] max-w-[200px]"
            >
              <option value="all">所有标签</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-[#111]/50 border-b border-slate-200/50 dark:border-white/5">
                <th className="px-6 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={!!questions?.length && selectedIds.size === questions.length}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                </th>
                <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">题目名称</th>
                <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">难度</th>
                <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">标签</th>
                <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap">掌握程度</th>
                <th className="px-6 py-4 font-medium text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50 dark:divide-white/5">
              <AnimatePresence>
                {questions?.map((q, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    key={q.id} 
                    className="hover:bg-white dark:hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-5 w-10 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(q.id)}
                        onChange={(e) => toggleOne(q.id, e.target.checked)}
                      />
                    </td>
                    <td className="px-6 py-5 min-w-[300px]">
                      <p className="font-medium text-slate-900 dark:text-white line-clamp-2">{q.title}</p>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={clsx("px-3 py-1 rounded-full text-xs font-medium border", getDifficultyColor(q.difficulty))}>
                        {getDifficultyLabel(q.difficulty)}
                      </span>
                    </td>
                    <td className="px-6 py-5 min-w-[150px]">
                      <div className="flex flex-wrap gap-2">
                        {q.tags.map(tag => (
                          <span key={tag} className="px-2.5 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-md text-xs font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={clsx("w-2 h-2 rounded-full shadow-sm", q.masteryLevel >= 0 ? (q.masteryLevel === 0 ? "bg-rose-500 shadow-rose-500/50" : (q.masteryLevel === 1 ? "bg-amber-500 shadow-amber-500/50" : "bg-emerald-500 shadow-emerald-500/50")) : "bg-slate-300 dark:bg-slate-600")} />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {q.masteryLevel === 0 ? '新题目' : q.masteryLevel === 1 ? '学习中' : '已掌握'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/questions/edit/${q.id}`}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {questions?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-lg font-medium text-slate-900 dark:text-white mb-1">未找到题目</p>
                      <p>点击上方按钮添加您的第一道面试题吧。</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {importDialogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeImportDialog} />
          <div className="relative w-full max-w-5xl rounded-3xl glass-panel overflow-hidden">
            <div className="p-6 border-b border-slate-200/50 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">批量导入预览</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  共 {importRows.length} 行，错误 {importRows.filter((r) => r.errors.length > 0).length} 行，重复 {importRows.filter((r) => r.duplicate).length} 行
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 justify-end">
                <select
                  value={importMode}
                  onChange={(e) => setImportMode(e.target.value as any)}
                  className="px-4 py-3 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all cursor-pointer shadow-sm"
                >
                  <option value="skip_duplicates">跳过重复</option>
                  <option value="allow_duplicates">允许重复</option>
                </select>
                <button
                  onClick={confirmImport}
                  className="inline-flex items-center justify-center px-6 py-3 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors font-medium shadow-lg shadow-emerald-500/20"
                >
                  确认导入
                </button>
                <button
                  onClick={closeImportDialog}
                  className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-50 dark:hover:bg-white/5 transition-colors font-medium shadow-sm"
                >
                  取消
                </button>
              </div>
            </div>
            <div className="max-h-[70vh] overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5">
                  <tr>
                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 w-20">行号</th>
                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">题目名称</th>
                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 w-24">难度</th>
                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 w-36">状态</th>
                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">错误</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50 dark:divide-white/5">
                  {importRows.map((r) => (
                    <tr key={`${r.index}-${r.signature}`} className={clsx(r.errors.length ? 'bg-rose-50/40 dark:bg-rose-500/5' : r.duplicate ? 'bg-amber-50/40 dark:bg-amber-500/5' : '')}>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{r.index}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{r.title || '（空）'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {r.difficulty === 'easy' ? '简单' : r.difficulty === 'hard' ? '困难' : '中等'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {r.errors.length > 0 ? (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">错误</span>
                        ) : r.duplicate ? (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">重复</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">可导入</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {r.errors.length ? r.errors.join('，') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
