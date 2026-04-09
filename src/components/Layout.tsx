import { Outlet, NavLink } from 'react-router-dom';
import { useAppStore } from '../store';
import { LayoutDashboard, Library, PlayCircle, Settings, Sun, Moon, Sparkles, PanelLeftClose, PanelLeft, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function Layout() {
  const { sidebarOpen, toggleSidebar, theme, toggleTheme, isSyncing, githubToken, gistId, syncError } = useAppStore();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: '数据统计' },
    { to: '/questions', icon: Library, label: '题库管理' },
    { to: '/practice', icon: PlayCircle, label: '沉浸式刷题' },
    { to: '/settings', icon: Settings, label: '数据设置' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-300 noise-bg">
      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-4 left-4 z-50 flex flex-col rounded-3xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] glass-panel",
          sidebarOpen ? "w-56" : "w-20"
        )}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-200/50 dark:border-white/5 relative">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 mx-auto">
              <Sparkles className="w-5 h-5" />
            </span>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-xl font-display font-bold text-slate-900 dark:text-white whitespace-nowrap"
                >
                  面试通
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  "relative flex items-center px-4 py-3 rounded-2xl transition-colors group",
                  isActive
                    ? "text-emerald-700 dark:text-emerald-400 font-medium"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-bg"
                      className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon className={clsx("shrink-0 relative z-10", sidebarOpen ? "w-5 h-5 mr-3" : "w-6 h-6 mx-auto")} />
                  {sidebarOpen && <span className="relative z-10 whitespace-nowrap">{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200/50 dark:border-white/5 space-y-2">
          {/* Cloud Sync Status */}
          <div 
            className="flex items-center w-full p-3 rounded-2xl transition-all group relative cursor-default"
            title={
              !githubToken ? '未配置云端同步' :
              isSyncing ? '正在同步到云端...' :
              syncError ? `同步失败: ${syncError}` :
              '云端同步已开启'
            }
          >
            <div className={clsx("shrink-0 relative z-10", sidebarOpen ? "w-5 h-5 mr-3" : "w-6 h-6 mx-auto flex items-center justify-center")}>
              {isSyncing ? (
                <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
              ) : syncError ? (
                <CloudOff className="w-5 h-5 text-rose-500" />
              ) : githubToken ? (
                <Cloud className="w-5 h-5 text-emerald-500" />
              ) : (
                <CloudOff className="w-5 h-5 text-slate-400" />
              )}
            </div>
            
            {sidebarOpen && (
              <span className={clsx(
                "font-medium whitespace-nowrap text-sm",
                isSyncing ? "text-blue-500" :
                syncError ? "text-rose-500" :
                githubToken ? "text-emerald-600 dark:text-emerald-400" :
                "text-slate-500 dark:text-slate-400"
              )}>
                {isSyncing ? '正在同步...' : syncError ? '同步失败' : githubToken ? '云端已同步' : '未开启同步'}
              </span>
            )}
          </div>

          <div className="h-px bg-slate-200/50 dark:bg-white/5 my-2" />

          <button
            onClick={toggleSidebar}
            className="flex items-center w-full p-3 rounded-2xl text-slate-500 hover:bg-slate-100/50 dark:text-slate-400 dark:hover:bg-white/5 transition-all group"
            title={sidebarOpen ? "收起侧边栏" : "展开侧边栏"}
          >
            <div className={clsx("shrink-0 relative z-10", sidebarOpen ? "w-5 h-5 mr-3" : "w-6 h-6 mx-auto flex items-center justify-center")}>
              {sidebarOpen ? (
                <PanelLeftClose className="w-5 h-5 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors" />
              ) : (
                <PanelLeft className="w-5 h-5 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors" />
              )}
            </div>
            {sidebarOpen && <span className="font-medium whitespace-nowrap">收起导航栏</span>}
          </button>

          <button
            onClick={toggleTheme}
            className="flex items-center w-full p-3 rounded-2xl text-slate-500 hover:bg-slate-100/50 dark:text-slate-400 dark:hover:bg-white/5 transition-all group"
            title="切换主题"
          >
            <div className={clsx("shrink-0 relative z-10", sidebarOpen ? "w-5 h-5 mr-3" : "w-6 h-6 mx-auto flex items-center justify-center")}>
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 group-hover:text-amber-400 transition-colors" />
              ) : (
                <Moon className="w-5 h-5 group-hover:text-blue-500 transition-colors" />
              )}
            </div>
            {sidebarOpen && <span className="font-medium whitespace-nowrap">{theme === 'dark' ? '亮色模式' : '深色模式'}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={clsx(
          "flex-1 flex flex-col min-w-0 h-screen overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] relative z-10",
          sidebarOpen ? "md:pl-72" : "md:pl-28"
        )}
      >
        <div className="flex-1 overflow-auto px-6 lg:px-10 py-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
