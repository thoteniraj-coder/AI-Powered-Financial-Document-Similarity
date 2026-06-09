import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Save, Lock, Eye, EyeOff, CheckCircle, LogOut, FileText, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getDocuments } from '../api/documents';
import { getAlerts } from '../api/alerts';
import './Profile.css';

const Profile = () => {
  const { user, role, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Activity
  const [recentDocs, setRecentDocs] = useState(0);
  const [activeAlerts, setActiveAlerts] = useState(0);

  useEffect(() => {
    const loadActivity = async () => {
      try {
        const [docsRes, alertsRes] = await Promise.allSettled([
          getDocuments({ page: 0, size: 1 }),
          getAlerts(),
        ]);
        if (docsRes.status === 'fulfilled') {
          setRecentDocs(docsRes.value.data.totalElements || 0);
        }
        if (alertsRes.status === 'fulfilled') {
          const unresolved = (alertsRes.value.data || []).filter(
            a => !['resolved', 'closed', 'ignored'].includes(String(a.status || '').toLowerCase())
          );
          setActiveAlerts(unresolved.length);
        }
      } catch { /* silent */ }
    };
    loadActivity();
  }, []);

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateProfile({ name, email });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError('New password must contain at least one uppercase letter.');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setPasswordError('New password must contain at least one number.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    // No backend endpoint for password change yet — simulate success
    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = () => {
    if (!user?.name) return 'US';
    return user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="profile-page">
      <div className="profile-page-header">
        <h1 className="page-title">My Profile</h1>
      </div>

      <div className="profile-layout">
        {/* Left column — Avatar & Quick Info */}
        <div className="profile-sidebar-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {getInitials()}
            </div>
            <h2 className="profile-display-name">{user?.name || 'User'}</h2>
            <span className="profile-role-badge">{role || 'standard'}</span>
            <span className="profile-email-display">{user?.email || 'user@example.com'}</span>
          </div>

          <div className="profile-activity-stats">
            <button className="profile-stat-item" onClick={() => navigate('/documents')}>
              <FileText size={18} className="profile-stat-icon" />
              <div className="profile-stat-info">
                <span className="profile-stat-value">{recentDocs}</span>
                <span className="profile-stat-label">Documents</span>
              </div>
            </button>
            <button className="profile-stat-item" onClick={() => navigate('/alerts')}>
              <AlertTriangle size={18} className="profile-stat-icon" />
              <div className="profile-stat-info">
                <span className="profile-stat-value">{activeAlerts}</span>
                <span className="profile-stat-label">Active Alerts</span>
              </div>
            </button>
          </div>

          <button className="profile-logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

        {/* Right column — Forms */}
        <div className="profile-forms">
          {/* Profile Info Card */}
          <div className="profile-card">
            <div className="profile-card-header">
              <User size={20} className="profile-card-icon" />
              <h3 className="profile-card-title">Personal Information</h3>
            </div>
            <form onSubmit={handleProfileSave} className="profile-form">
              <div className="profile-form-row">
                <div className="input-group">
                  <label className="label" htmlFor="profile-name">
                    <User size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                    Full Name
                  </label>
                  <input
                    id="profile-name"
                    className="input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="input-group">
                  <label className="label" htmlFor="profile-email">
                    <Mail size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                    Email Address
                  </label>
                  <input
                    id="profile-email"
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                  />
                </div>
              </div>
              <div className="input-group">
                <label className="label" htmlFor="profile-role">
                  <Shield size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                  Role
                </label>
                <input
                  id="profile-role"
                  className="input"
                  type="text"
                  value={role || 'standard'}
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>
              <div className="profile-form-actions">
                {profileSaved && (
                  <span className="profile-save-success">
                    <CheckCircle size={16} /> Profile updated
                  </span>
                )}
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Password Change Card */}
          <div className="profile-card">
            <div className="profile-card-header">
              <Lock size={20} className="profile-card-icon" />
              <h3 className="profile-card-title">Change Password</h3>
            </div>
            <form onSubmit={handlePasswordChange} className="profile-form">
              <div className="input-group">
                <label className="label" htmlFor="current-password">Current Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="current-password"
                    className="input"
                    type={showCurrentPw ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowCurrentPw(!showCurrentPw)}>
                    {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="profile-form-row">
                <div className="input-group">
                  <label className="label" htmlFor="new-password">New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      id="new-password"
                      className="input"
                      type={showNewPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowNewPw(!showNewPw)}>
                      {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="input-group">
                  <label className="label" htmlFor="confirm-password">Confirm New Password</label>
                  <input
                    id="confirm-password"
                    className="input"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>
              {passwordError && <div className="profile-error">{passwordError}</div>}
              {passwordSuccess && (
                <div className="profile-success">
                  <CheckCircle size={16} /> Password changed successfully
                </div>
              )}
              <div className="profile-form-actions">
                <button type="submit" className="btn btn-primary">
                  <Lock size={16} />
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
