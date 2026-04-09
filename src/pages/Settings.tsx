import { useState } from 'react';
import { Download, Upload, AlertTriangle, Database, Cloud, Key, FileJson, Github } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import { useAppStore } from '../store';
import { pushToGist, pullFromGist } from '../services/githubSync';

export default function Settings() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStrategy, setImportStrategy] = useState<'overwrite' | 'skip' | 'new_id'>('skip');

  // Github Gist Sync states
  const { githubToken, gistId, setGithubToken, setGistId } = useAppStore();
  const [isSyncing, setIsSyncing] = useState(false);

  const questions = useAppStore(state => state.questions);
  const bulkAddQuestions = useAppStore(state => state.bulkAddQuestions);
  const bulkUpdateQuestions = useAppStore(state => state.bulkUpdateQuestions);
  const setQuestions = useAppStore(state => state.setQuestions);
  const clearData = useAppStore(state => state.clearData);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const dataStr = JSON.stringify({ version: 2, questions }, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `interview-questions-backup-${new Date().toISOString().slice(0,10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('导出失败', error);
      alert('导出失败，请检查控制台');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        
        if (parsed.questions && Array.isArray(parsed.questions)) {
          const now = Date.now();
          const existingIds = new Set(questions.map(q => q.id));

          let importedCount = 0;
          let skippedCount = 0;

          const toAdd: any[] = [];
          const toUpdate: any[] = [];

          parsed.questions.forEach((q: any) => {
            const masteryLevel = Number(q.masteryLevel);
            const normQ = {
              ...q,
              title: String(q.title || '').trim(),
              content: String(q.content || ''),
              answer: String(q.answer || ''),
              tags: Array.isArray(q.tags) ? q.tags.map((t: any) => String(t)) : [],
              difficulty: q.difficulty === 'easy' || q.difficulty === 'hard' ? q.difficulty : 'medium',
              masteryLevel: masteryLevel === 1 || masteryLevel === 2 ? masteryLevel : 0,
              lastReviewedAt: typeof q.lastReviewedAt === 'number' ? q.lastReviewedAt : 0,
              reviewCount: typeof q.reviewCount === 'number' ? q.reviewCount : 0,
              nextReviewAt: typeof q.nextReviewAt === 'number' ? q.nextReviewAt : 0,
              intervalDays: typeof q.intervalDays === 'number' ? q.intervalDays : 0,
              easeFactor: typeof q.easeFactor === 'number' ? q.easeFactor : 2.5,
              createdAt: typeof q.createdAt === 'number' ? q.createdAt : now,
              updatedAt: typeof q.updatedAt === 'number' ? q.updatedAt : now
            };

            const qId = normQ.id || uuidv4();

            if (existingIds.has(qId)) {
              if (importStrategy === 'skip') {
                skippedCount++;
              } else if (importStrategy === 'overwrite') {
                normQ.id = qId;
                toUpdate.push({ id: qId, changes: normQ });
                importedCount++;
              } else if (importStrategy === 'new_id') {
                normQ.id = uuidv4();
                toAdd.push(normQ);
                importedCount++;
              }
            } else {
              normQ.id = qId;
              toAdd.push(normQ);
              importedCount++;
            }
          });

          if (toAdd.length > 0) await bulkAddQuestions(toAdd);
          if (toUpdate.length > 0) await bulkUpdateQuestions(toUpdate);

          alert(`成功导入 ${importedCount} 道题目！${skippedCount > 0 ? `(跳过 ${skippedCount} 道冲突题目)` : ''}`);
        } else {
          alert('无效的备份文件格式');
        }
      } catch (error) {
        console.error('导入失败', error);
        alert('解析文件失败。请确保它是一个有效的 JSON 备份。');
      } finally {
        setIsImporting(false);
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = async () => {
    if (window.confirm('警告：此操作将永久删除所有本地题目和练习历史记录！\n\n您确定要继续吗？')) {
      const confirmText = window.prompt('输入 "DELETE" 确认：');
      if (confirmText === 'DELETE') {
        await clearData();
        alert('所有数据已被清除。');
      }
    }
  };

  const handlePushToCloud = async () => {
    if (!githubToken) return alert('请先配置 GitHub Token');
    try {
      setIsSyncing(true);
      const payload = { version: 2, questions };
      const newGistId = await pushToGist(githubToken, gistId, payload);
      
      if (!gistId) {
        setGistId(newGistId);
        alert(`成功上传！已生成新的 Gist ID: ${newGistId}。请妥善保管该 ID 以便在其他设备上拉取。`);
      } else {
        alert('成功覆盖更新云端备份！');
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || '上传失败，请检查 Token 是否具有 gist 权限。');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullFromCloud = async () => {
    if (!githubToken || !gistId) return alert('请配置完整的 GitHub Token 和 Gist ID');
    if (!window.confirm('将使用云端数据完全覆盖本地数据。未上传的本地修改将丢失。确定要继续吗？')) return;

    try {
      setIsSyncing(true);
      const payload = await pullFromGist(githubToken, gistId);
      
      if (payload && Array.isArray(payload.questions)) {
        await setQuestions(payload.questions);
        alert(`成功拉取云端备份并覆盖本地题库（共 ${payload.questions.length} 道题目）！`);
      } else {
        alert('云端备份格式不正确。');
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || '拉取失败，请检查 Gist ID 和 Token。');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1400px] mx-auto space-y-8"
    >
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white mb-2">数据设置</h1>
        <p className="text-slate-500 dark:text-slate-400">管理您的本地题库备份和数据恢复。</p>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden">
        <div className="p-8 border-b border-slate-200/50 dark:border-white/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-purple-500/10 rounded-2xl">
              <Cloud className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">云端同步 (GitHub Gist)</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">使用私有 GitHub Gist 在云端保存题库。即使清除浏览器缓存也能找回数据。</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center">
                  <Key className="w-4 h-4 mr-2 text-slate-400" />
                  GitHub Personal Access Token (需 gist 权限)
                </label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none transition-all text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center">
                  <Github className="w-4 h-4 mr-2 text-slate-400" />
                  Gist ID (留空则在上传时自动创建新备份)
                </label>
                <input
                  type="text"
                  value={gistId}
                  onChange={(e) => setGistId(e.target.value)}
                  placeholder="32个字符的哈希字符串..."
                  className="w-full px-4 py-3 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none transition-all text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
              <button
                onClick={handlePushToCloud}
                disabled={isSyncing || !githubToken}
                className="flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
              >
                <Upload className="w-5 h-5 mr-2" />
                {isSyncing ? '同步中...' : (gistId ? '更新云端备份' : '首次创建云端备份')}
              </button>
              <button
                onClick={handlePullFromCloud}
                disabled={isSyncing || !githubToken || !gistId}
                className="flex items-center px-6 py-3 bg-slate-800 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 dark:hover:bg-slate-100 shadow-lg shadow-slate-900/10 dark:shadow-white/10"
              >
                <Download className="w-5 h-5 mr-2" />
                从云端覆盖到本地
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 border-b border-slate-200/50 dark:border-white/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-blue-500/10 rounded-2xl">
              <Database className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">备份与恢复</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">所有数据都本地存储在您的浏览器中。我们强烈建议定期导出备份。</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center justify-center p-6 border-2 border-slate-200 dark:border-white/10 rounded-2xl hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 transition-all group disabled:opacity-50"
            >
              <Download className="w-6 h-6 mr-3 text-slate-400 group-hover:text-blue-500 transition-colors" />
              <span className="text-lg font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {isExporting ? '导出中...' : '导出备份 (JSON)'}
              </span>
            </button>

            <div className="flex flex-col gap-4 p-6 border-2 border-slate-200 dark:border-white/10 rounded-2xl transition-all">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">导入策略 (ID 冲突时)</span>
                <select
                  value={importStrategy}
                  onChange={(e) => setImportStrategy(e.target.value as any)}
                  className="px-3 py-1.5 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-lg text-sm font-medium outline-none text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <option value="skip">跳过不导入</option>
                  <option value="overwrite">覆盖原有数据</option>
                  <option value="new_id">生成新ID导入</option>
                </select>
              </div>
              <label className="flex items-center justify-center p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all group cursor-pointer disabled:opacity-50 mt-auto">
                <Upload className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold text-emerald-700 dark:text-emerald-400 transition-colors">
                  {isImporting ? '导入中...' : '选择 JSON 备份导入'}
                </span>
                <input type="file" accept=".json" className="hidden" onChange={handleImport} disabled={isImporting} />
              </label>
            </div>
          </div>
        </div>

        <div className="p-8 bg-rose-50/50 dark:bg-rose-500/5">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-rose-100/80 dark:bg-rose-500/20 rounded-2xl">
              <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-rose-900 dark:text-rose-400">危险区域</h2>
              <p className="text-rose-600/80 dark:text-rose-400/80 mt-1">此处的操作将永久删除数据。请谨慎操作。</p>
            </div>
          </div>
          
          <button
            onClick={handleClearData}
            className="px-6 py-3 bg-white dark:bg-[#111] border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors font-bold shadow-sm"
          >
            清除所有本地数据
          </button>
        </div>
      </div>
    </motion.div>
  );
}
