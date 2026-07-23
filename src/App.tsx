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
import GateRegister from './pages/GateRegister';

function Layout({ children }: { children: React.ReactNode }) {
  const { initApp, isSyncing } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col text-gray-900 dark:text-gray-100 transition-colors">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                <Database className="w-8 h-8" />
                <span className="hidden sm:block leading-tight">YASHODA LINEN<br/>YARN LIMITED</span>
                <span className="sm:hidden">YASHODA ERP</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden xl:flex space-x-1 items-center">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
              <div className="flex items-center ml-4 pl-4 border-l border-gray-200 dark:border-zinc-800">
                {isSyncing && <span className="text-xs text-gray-500 animate-pulse mr-2">Syncing...</span>}
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                  title="Toggle Theme"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
            </nav>

            {/* Mobile menu button */}
            <div className="flex items-center xl:hidden">
              <div className="flex items-center mr-2">
                 {isSyncing && <span className="text-xs text-gray-500 animate-pulse mr-2">Syncing...</span>}
                 <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                    title="Toggle Theme"
                  >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 shadow-lg absolute w-full">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
        {children}
      </main>
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
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppProvider>
  );
}

