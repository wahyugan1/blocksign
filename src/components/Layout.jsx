import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Shield, FileText, CheckCircle, Clock, Menu, X, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import WalletConnect from '@/components/WalletConnect';

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Shield },
    { path: '/create', label: 'Upload', icon: FileText },
    { path: '/verify', label: 'Verifikasi', icon: CheckCircle },
    { path: '/history', label: 'Riwayat', icon: Clock },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[128px] animate-float" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] animate-float" style={{ animationDelay: '1s' }} />

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/10 glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Shield className="h-8 w-8 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                <div className="absolute inset-0 bg-indigo-500/20 blur-lg group-hover:blur-xl transition-all" />
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">
                Block<span className="gradient-text">Sign</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      isActive(item.path)
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                data-testid="theme-toggle"
                className="text-gray-300 hover:text-white hover:bg-white/5"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <WalletConnect />
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-300 hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="mobile-menu-toggle"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 glass-effect" data-testid="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-all ${
                      isActive(item.path)
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
