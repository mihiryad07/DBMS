import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, User, Sun, Moon, LogOut, Check, X, AlertCircle, CheckCircle, Info, Globe, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
  const { t, i18n } = useTranslation();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const languageRef = useRef(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setIsLanguageOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return t('justNow');
    if (minutes < 60) return t('minutesAgo', { minutes });
    if (hours < 24) return t('hoursAgo', { hours });
    return t('daysAgo', { days });
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-card border-b border-border/40 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/60 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:block">
          <h2 className="text-lg font-semibold text-foreground tracking-tight flex items-center gap-2">
            {t('operationsPanel')} <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span></span>
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => setIsDark(!isDark)}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-lg transition-colors"
          title={t('toggleTheme')}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative" ref={languageRef}>
          <button
            onClick={() => {
              setIsLanguageOpen(!isLanguageOpen);
              setIsNotificationsOpen(false);
              setIsProfileOpen(false);
            }}
            className="flex items-center gap-1 p-2 text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-lg transition-colors"
            title={t('selectLanguage')}
          >
            <Globe size={18} />
            <ChevronDown size={14} className={`transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`} />
          </button>

          {isLanguageOpen && (
            <div className="absolute right-0 mt-2 w-40 rounded-lg bg-card border border-border shadow-lg overflow-hidden z-50">
              <div className="p-1">
                <button
                  onClick={() => {
                    i18n.changeLanguage('en');
                    setIsLanguageOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    i18n.language === 'en' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/20'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => {
                    i18n.changeLanguage('es');
                    setIsLanguageOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    i18n.language === 'es' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/20'
                  }`}
                >
                  {t('spanish')}
                </button>
                <button
                  onClick={() => {
                    i18n.changeLanguage('fr');
                    setIsLanguageOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    i18n.language === 'fr' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/20'
                  }`}
                >
                  {t('french')}
                </button>
                <button
                  onClick={() => {
                    i18n.changeLanguage('nl');
                    setIsLanguageOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    i18n.language === 'nl' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/20'
                  }`}
                >
                  {t('dutch')}
                </button>
                <button
                  onClick={() => {
                    i18n.changeLanguage('hi');
                    setIsLanguageOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    i18n.language === 'hi' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/20'
                  }`}
                >
                  {t('hindi')}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
            }}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-lg transition-colors relative"
            title={t('notifications')}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center font-semibold text-xs animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg bg-card border border-border shadow-lg overflow-hidden z-50 max-h-96 overflow-y-auto">
              <div className="px-4 py-3 border-b border-border/50 bg-muted/30 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{t('notifications')}</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:text-primary/80 font-medium"
                  >
                    {t('markAllRead')}
                  </button>
                )}
              </div>
              <div className="divide-y divide-border/50">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    <Bell size={24} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">{t('noNotifications')}</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-muted/20 transition-colors group ${!notification.read ? 'bg-primary/3' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-md flex-shrink-0 ${
                          notification.type === 'warning' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                          notification.type === 'success' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                          'bg-sky-500/20 text-sky-600 dark:text-sky-400'
                        }`}>
                          {notification.type === 'warning' ? <AlertCircle size={14} /> :
                           notification.type === 'success' ? <CheckCircle size={14} /> :
                           <Info size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </h4>
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground/70">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                              >
                                <Check size={12} />
                                {t('markRead')}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <div className="w-px h-6 bg-border/50 mx-1" />
        
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/40 transition-colors text-left pl-2 pr-3"
          >
            <div className="w-7 h-7 rounded-lg bg-accent/20 text-accent flex items-center justify-center font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-none text-foreground">{user?.name || 'User'}</p>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-card border border-border shadow-lg overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
                <p className="text-sm font-semibold">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role || 'Guest'}</p>
              </div>
              <div className="p-1">
                <button 
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsNotificationsOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut size={16} />
                  <span>{t('logOut')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
