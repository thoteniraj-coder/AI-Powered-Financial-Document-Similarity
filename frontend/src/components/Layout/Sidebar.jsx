import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileUp, 
  Search, 
  FileText, 
  AlertTriangle, 
  ClipboardList, 
  Settings,
  Menu,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './Sidebar.css';

export function Sidebar({ isCollapsed, toggleSidebar }) {
  const { user, role } = useAuth();
  
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['all'] },
    { path: '/upload', label: 'Upload', icon: FileUp, roles: ['all'] },
    { path: '/search', label: 'Search', icon: Search, roles: ['all'] },
    { path: '/documents', label: 'Documents', icon: FileText, roles: ['all'] },
    { path: '/alerts', label: 'Alerts', icon: AlertTriangle, roles: ['manager', 'admin'] },
    { path: '/audit', label: 'Audit Trail', icon: ClipboardList, roles: ['admin'] },
    { path: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
  ];

  const filteredNav = navItems.filter(item => 
    item.roles.includes('all') || item.roles.includes(role)
  );

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

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
          </div>
          {!isCollapsed && (
            <div className="user-info">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-role">{role || 'Standard'}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
