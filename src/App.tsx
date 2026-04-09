import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import QuestionList from './pages/QuestionList';
import QuestionEditor from './pages/QuestionEditor';
import PracticeSettings from './pages/PracticeSettings';
import PracticeSession from './pages/PracticeSession';
import Settings from './pages/Settings';
import { useAppStore } from './store';
import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

function App() {
  const theme = useAppStore((state) => state.theme);
  const { githubToken, gistId, fetchFromCloud, isInitializing } = useAppStore();
  const initRef = useRef(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // App startup sync
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      if (githubToken && gistId) {
        fetchFromCloud();
      }
    }
  }, [githubToken, gistId, fetchFromCloud]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 text-slate-500 dark:text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <p className="font-medium animate-pulse">正在从 GitHub Gist 同步数据...</p>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="questions" element={<QuestionList />} />
          <Route path="questions/new" element={<QuestionEditor />} />
          <Route path="questions/edit/:id" element={<QuestionEditor />} />
          <Route path="practice" element={<PracticeSettings />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="/practice/session" element={<PracticeSession />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
