import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './TopBar.css';

export function TopBar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Format path to title: /dashboard -> Dashboard
  const getPageTitle = () => {
    const path = location.pathname.split('/')[1] || 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="page-title">{getPageTitle()}</h1>
      </div>

      <div className="topbar-right">
        <div className="search-container">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search..." className="search-input" />
          <div className="search-shortcut">⌘K</div>
        </div>

        <button className="notification-btn">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>

        <div className="user-menu">
          <button 
            className="user-menu-btn" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="avatar-small">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
            </div>
            <ChevronDown size={16} />
          </button>
          
          {dropdownOpen && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <strong>{user?.name || 'User'}</strong>
                <span>{user?.email || 'user@example.com'}</span>
              </div>
              <button className="dropdown-item">Profile</button>
              <button className="dropdown-item">Settings</button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item text-danger" onClick={logout}>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
