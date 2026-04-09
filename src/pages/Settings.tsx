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

        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-blue-500/10 rounded-2xl">
              <Database className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">本地备份导出</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">您可以随时将题库数据导出为 JSON 文件保存在本地。</p>
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center justify-center p-6 border-2 border-slate-200 dark:border-white/10 rounded-2xl hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 transition-all group disabled:opacity-50 w-full md:w-1/2"
          >
            <Download className="w-6 h-6 mr-3 text-slate-400 group-hover:text-blue-500 transition-colors" />
            <span className="text-lg font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {isExporting ? '导出中...' : '导出备份 (JSON)'}
            </span>
          </button>
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
