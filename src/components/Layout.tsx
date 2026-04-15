import { Outlet, NavLink } from 'react-router-dom';
import { useAppStore } from '../store';
import { LayoutDashboard, Library, PlayCircle, Settings, Sun, Moon, PanelLeftClose, PanelLeft, Cloud, CloudOff, RefreshCw } from 'lucide-react';
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

  const renderNavContent = () => (
    <>
      <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => clsx(
              "flex items-center px-4 py-3 rounded-[12px] font-bold text-sm transition-all group",
              isActive 
                ? "bg-miro-blue text-white shadow-soft" 
                : "text-miro-slate hover:bg-slate-100 dark:hover:bg-white/5 dark:text-slate-300"
            )}
          >
            <item.icon className={clsx(
              "w-5 h-5 shrink-0 transition-transform group-hover:scale-110",
              sidebarOpen ? "mr-4" : "mx-auto"
            )} />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-miro-border/40 dark:border-white/10 space-y-4">
        <button
          onClick={toggleTheme}
          className={clsx(
            "flex items-center w-full px-4 py-3 rounded-[12px] font-bold text-sm text-miro-slate hover:bg-slate-100 dark:hover:bg-white/5 dark:text-slate-300 transition-all group",
            !sidebarOpen && "justify-center"
          )}
        >
          {theme === 'dark' ? (
            <Sun className={clsx("w-5 h-5 shrink-0 group-hover:scale-110 transition-transform", sidebarOpen && "mr-4")} />
          ) : (
            <Moon className={clsx("w-5 h-5 shrink-0 group-hover:scale-110 transition-transform", sidebarOpen && "mr-4")} />
          )}
          {sidebarOpen && <span>{theme === 'dark' ? '浅色模式' : '深色模式'}</span>}
        </button>
        
        <div className={clsx(
          "flex items-center px-4 py-3 rounded-[12px] text-sm font-bold bg-slate-50 dark:bg-white/5",
          !sidebarOpen && "justify-center",
          isSyncing ? "text-miro-blue" : syncError ? "text-pastel-coral-dark dark:text-pastel-coral-light" : "text-miro-success"
        )}>
          {isSyncing ? (
            <RefreshCw className={clsx("w-5 h-5 shrink-0 animate-spin", sidebarOpen && "mr-4")} />
          ) : syncError ? (
            <CloudOff className={clsx("w-5 h-5 shrink-0", sidebarOpen && "mr-4")} />
          ) : (
            <Cloud className={clsx("w-5 h-5 shrink-0", sidebarOpen && "mr-4")} />
          )}
          {sidebarOpen && (
            <span className="truncate">
              {isSyncing ? '同步中...' : syncError ? '同步失败' : '已同步'}
            </span>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-miro-black flex text-miro-black dark:text-white font-sans">
      <AnimatePresence mode="wait">
        {sidebarOpen ? (
          <motion.aside
            key="sidebar-open"
            initial={{ width: 80 }}
            animate={{ width: 280 }}
            exit={{ width: 80 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="flex-shrink-0 h-screen sticky top-0 bg-white dark:bg-miro-black border-r border-miro-border/40 shadow-ring z-40 overflow-hidden flex flex-col"
          >
            {/* Logo Area */}
            <div className="flex flex-col items-center justify-center pt-8 pb-6 relative">
              <div className="flex flex-col items-center gap-2">
                <img src="/src/assets/nm.svg" alt="fkcoding logo" className="w-16 h-16 object-contain" />
                <AnimatePresence>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-[28px] font-display font-bold text-miro-black dark:text-white whitespace-nowrap tracking-[-1px] leading-none"
                  >
                    fkcoding
                  </motion.span>
                </AnimatePresence>
              </div>
              <button 
                onClick={toggleSidebar}
                className="absolute right-4 top-8 p-1.5 text-miro-slate hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
            
            {renderNavContent()}
          </motion.aside>
        ) : (
          <motion.aside
            key="sidebar-closed"
            initial={{ width: 280 }}
            animate={{ width: 80 }}
            exit={{ width: 280 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="flex-shrink-0 h-screen sticky top-0 bg-white dark:bg-miro-black border-r border-miro-border/40 shadow-ring z-40 overflow-hidden flex flex-col"
          >
            <div className="flex flex-col items-center justify-center pt-8 pb-6 relative">
              <img src="/src/assets/nm.svg" alt="fkcoding logo" className="w-10 h-10 object-contain mb-4" />
              <button 
                onClick={toggleSidebar}
                className="p-2 text-miro-slate hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
            </div>
            {renderNavContent()}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-slate-50 dark:bg-miro-black">
        <div className="flex-1 max-w-[1400px] w-full mx-auto p-6 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
