import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileUp,
  Search,
  FileText,
  AlertTriangle,
  ClipboardList,
  Settings,
  Menu,
  ChevronLeft,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './Sidebar.css';

export function Sidebar({ isCollapsed, toggleSidebar }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef(null);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['all'] },
    { path: '/upload', label: 'Upload', icon: FileUp, roles: ['all'] },
    { path: '/search', label: 'Search', icon: Search, roles: ['all'] },
    { path: '/documents', label: 'Documents', icon: FileText, roles: ['all'] },
    { path: '/alerts', label: 'Alerts', icon: AlertTriangle, roles: ['finance_manager', 'admin'] },
    { path: '/audit', label: 'Audit Trail', icon: ClipboardList, roles: ['admin'] },
    { path: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
  ];

  const filteredNav = navItems.filter(item =>
    item.roles.includes('all') || item.roles.includes(role)
  );

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setPopoverOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      <div className="sidebar-header">
        {!isCollapsed && <div className="brand-logo">FinDoc AI</div>}
        {isCollapsed && <div className="brand-logo-collapsed">FA</div>}
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {filteredNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon size={20} />
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer" ref={popoverRef}>
        {/* Popover menu */}
        {popoverOpen && (
          <div className={`sidebar-popover ${isCollapsed ? 'popover-collapsed' : ''}`}>
            <div className="popover-header">
              <strong>{user?.name || 'User'}</strong>
              <span>{user?.email || 'user@example.com'}</span>
            </div>
            <button
              className="popover-item"
              onClick={() => { navigate('/profile'); setPopoverOpen(false); }}
            >
              <User size={16} />
              View Profile
            </button>
            <button
              className="popover-item"
              onClick={() => { navigate('/settings'); setPopoverOpen(false); }}
            >
              <Settings size={16} />
              Settings
            </button>
            <div className="popover-divider"></div>
            <button
              className="popover-item popover-danger"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        )}

        <button
          className={`user-profile-btn ${popoverOpen ? 'profile-active' : ''}`}
          onClick={() => setPopoverOpen(!popoverOpen)}
          title={isCollapsed ? (user?.name || 'User') : undefined}
        >
          <div className="avatar">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
          </div>
          {!isCollapsed && (
            <div className="user-info">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-role">{role || 'Standard'}</div>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
