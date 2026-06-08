import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, AlertTriangle, CheckCheck, ExternalLink, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getAlerts } from '../../api/alerts';
import './TopBar.css';

export function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef(null);

  // Notification state
  const [notifOpen, setNotifOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [readAlertIds, setReadAlertIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('readAlertIds') || '[]'); } catch { return []; }
  });
  const notifRef = useRef(null);

  // User dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Format path to title
  const getPageTitle = () => {
    const path = location.pathname.split('/')[1] || 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Search on Enter
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      searchInputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      searchInputRef.current?.blur();
    }
  };

  // Fetch alerts for notifications
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const res = await getAlerts();
        setAlerts(res.data || []);
      } catch { /* silent */ }
    };
    loadAlerts();
  }, []);

  // Unread alerts count
  const unresolvedAlerts = alerts.filter(
    a => !['resolved', 'closed', 'ignored'].includes(String(a.status || '').toLowerCase())
  );
  const unreadCount = unresolvedAlerts.filter(a => !readAlertIds.includes(a.id)).length;

  // Mark all read
  const handleMarkAllRead = () => {
    const allIds = unresolvedAlerts.map(a => a.id);
    const updated = [...new Set([...readAlertIds, ...allIds])];
    setReadAlertIds(updated);
    localStorage.setItem('readAlertIds', JSON.stringify(updated));
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSeverityClass = (severity) => {
    const s = String(severity || '').toLowerCase();
    if (s === 'critical' || s === 'high') return 'badge-danger';
    if (s === 'medium') return 'badge-warning';
    return 'badge-info';
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="page-title">{getPageTitle()}</h1>
      </div>

      <div className="topbar-right">
        {/* Search bar */}
        <div className="search-container">
          <Search size={16} className="search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search documents..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onKeyDown={handleSearchKeyDown}
          />
          {!searchFocused && !searchQuery && (
            <div className="search-shortcut">⌘K</div>
          )}
          {searchQuery && (
            <button
              className="search-clear-btn"
              onMouseDown={(e) => { e.preventDefault(); setSearchQuery(''); searchInputRef.current?.focus(); }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Notification bell */}
        <div className="notification-wrapper" ref={notifRef}>
          <button
            className={`notification-btn ${notifOpen ? 'active' : ''}`}
            onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {notifOpen && (
            <div className="notification-panel">
              <div className="notif-header">
                <h3 className="notif-title">Notifications</h3>
                {unreadCount > 0 && (
                  <button className="notif-mark-read" onClick={handleMarkAllRead}>
                    <CheckCheck size={14} />
                    Mark all read
                  </button>
                )}
              </div>
              <div className="notif-list">
                {unresolvedAlerts.length === 0 ? (
                  <div className="notif-empty">
                    <Bell size={32} className="notif-empty-icon" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  unresolvedAlerts.slice(0, 8).map(alert => (
                    <div
                      key={alert.id}
                      className={`notif-item ${readAlertIds.includes(alert.id) ? 'read' : 'unread'}`}
                      onClick={() => { navigate('/alerts'); setNotifOpen(false); }}
                    >
                      <div className="notif-item-top">
                        <span className={`badge ${getSeverityClass(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className="notif-time">{formatTime(alert.createdAt)}</span>
                      </div>
                      <p className="notif-item-desc">{alert.description || alert.alertType || 'Alert'}</p>
                    </div>
                  ))
                )}
              </div>
              <button className="notif-footer-btn" onClick={() => { navigate('/alerts'); setNotifOpen(false); }}>
                View All Alerts
                <ExternalLink size={14} />
              </button>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="user-menu" ref={dropdownRef}>
          <button
            className="user-menu-btn"
            onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
          >
            <div className="avatar-small">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
            </div>
            <ChevronDown size={16} className={`chevron-icon ${dropdownOpen ? 'rotated' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <strong>{user?.name || 'User'}</strong>
                <span>{user?.email || 'user@example.com'}</span>
              </div>
              <button className="dropdown-item" onClick={() => { navigate('/profile'); setDropdownOpen(false); }}>
                Profile
              </button>
              <button className="dropdown-item" onClick={() => { navigate('/settings'); setDropdownOpen(false); }}>
                Settings
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item text-danger" onClick={() => { logout(); navigate('/login'); }}>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
