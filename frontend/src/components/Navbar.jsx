import React, { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Calendar, Activity, Brain, LogOut, LogIn } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const greeting = useMemo(() => {
    return Math.random() > 0.5 ? 'Namaste' : 'Konnichiwa';
  }, []);

  const navItems = [
    { id: 'home', path: '/', label: 'Home', icon: Home },
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: Calendar },
    { id: 'insights', path: '/insights', label: 'Insights', icon: Activity },
    { id: 'clarity', path: '/clarity', label: 'Clarity', icon: Brain },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#244846] backdrop-blur-md border-b border-white/10 shadow-sm text-sm text-white">
      <div className="h-16 w-full px-4 sm:px-6 md:px-8 flex items-center justify-between">
        {/* Left Side: Brand Logo & Navigation Links */}
        <div className="flex items-center gap-6 sm:gap-8 md:gap-10">
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-base shadow-sm transition-transform group-hover:scale-105">
              🌸
            </div>
            <span className="font-bold text-xl tracking-tight text-white leading-none">HerFlow</span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4 md:gap-7">
            {navItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center gap-2 py-1.5 px-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'text-white bg-white/15 shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Auth / Login Action */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="hidden md:inline text-white/80 font-medium text-xs md:text-sm">
                {greeting}, <strong className="text-white">{user?.name?.split(' ')[0] || 'User'}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 bg-white text-[#244846] hover:bg-gray-50 px-4 py-1.5 rounded-xl font-semibold text-sm transition shadow-sm"
            >
              <LogIn className="w-4 h-4 text-[#244846]" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
