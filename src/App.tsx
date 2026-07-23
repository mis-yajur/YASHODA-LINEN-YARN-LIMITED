/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { 
  LayoutDashboard, Package, MapPin, Users, ShoppingCart, 
  ScanLine, Menu, X, Bell, LogOut, Sun, Moon, Database, Settings, ArrowRightLeft,
  CheckSquare, FileText
} from 'lucide-react';
import { cn } from './lib/utils';
// Pages
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Masters from './pages/Masters';
import Procurement from './pages/Procurement';
import MaterialIssue from './pages/MaterialIssue';
import Approvals from './pages/Approvals';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Setup from './pages/Setup';
import GateRegister from './pages/GateRegister';

function Layout({ children }: { children: React.ReactNode }) {
  const { initApp, isSyncing, scriptUrl } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    initApp();
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Masters', path: '/masters', icon: Database },
    { name: 'Gate Entry', path: '/gate', icon: MapPin },
    { name: 'Procurement', path: '/procurement', icon: ShoppingCart },
    { name: 'Inventory', path: '/inventory', icon: Package },
    { name: 'Material Issue', path: '/issue', icon: ArrowRightLeft },
    { name: 'Approvals', path: '/approvals', icon: CheckSquare },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Setup', path: '/setup', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col md:flex-row text-gray-900 dark:text-gray-100 transition-colors">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border-b dark:border-zinc-800">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xl">
          <Package /> Yashoda Inventory
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
          {sidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r dark:border-zinc-800 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-bold text-lg border-b dark:border-zinc-800 hidden md:flex">
          <Database className="w-8 h-8 shrink-0" />
          <span className="leading-tight">YASHODA LINEN<br/>YARN LIMITED</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t dark:border-zinc-800 flex flex-col gap-2">
          {!scriptUrl && (
            <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 p-3 rounded-lg text-xs mb-2">
              <span className="font-bold block">Setup Required</span>
              Connect Google Sheets to enable sync.
            </div>
          )}
          {isSyncing && <div className="text-xs text-center text-gray-500 animate-pulse">Syncing...</div>}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Theme</span>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
        {children}
      </main>
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/masters" element={<Masters />} />
            <Route path="/gate" element={<GateRegister />} />
            <Route path="/procurement" element={<Procurement />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/issue" element={<MaterialIssue />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppProvider>
  );
}

