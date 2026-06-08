import React, { useEffect, useState } from 'react';
import { Users, Clock, Activity, Key, Copy, Trash2, Plus, CheckCircle, RefreshCw, X, Eye, EyeOff, Pencil } from 'lucide-react';
import { Button } from '../components/common/Button';
import { getHealth } from '../api/health';
import { getUsers, getRoles, createUser, updateUser } from '../api/users';
import './Settings.css';

const TABS = [
  { id: 'users', label: 'Users & Roles', icon: Users },
  { id: 'retention', label: 'Retention Policies', icon: Clock },
  { id: 'health', label: 'System Health', icon: Activity },
  { id: 'apikeys', label: 'API Keys', icon: Key },
];

const EMPTY_USER_FORM = {
  fullName: '',
  email: '',
  password: '',
  role: '',
  department: '',
  active: true,
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // User modal state
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userModalMode, setUserModalMode] = useState('add'); // 'add' | 'edit'
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState({ ...EMPTY_USER_FORM });
  const [userFormError, setUserFormError] = useState('');
  const [userFormSaving, setUserFormSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Retention state (persisted in localStorage)
  const [retentionDays, setRetentionDays] = useState(() => {
    return localStorage.getItem('settings_retentionDays') || '365';
  });
  const [autoPurge, setAutoPurge] = useState(() => {
    return localStorage.getItem('settings_autoPurge') === 'true';
  });
  const [archiveThreshold, setArchiveThreshold] = useState(() => {
    return localStorage.getItem('settings_archiveThreshold') || '90';
  });
  const [retentionSaved, setRetentionSaved] = useState(false);

  // API Keys state (persisted in localStorage)
  const [apiKeys, setApiKeys] = useState(() => {
    try { return JSON.parse(localStorage.getItem('settings_apiKeys') || '[]'); } catch { return []; }
  });
  const [copiedKeyId, setCopiedKeyId] = useState(null);
  const [newKeyName, setNewKeyName] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [usersResult, healthResult, rolesResult] = await Promise.allSettled([
          getUsers(),
          getHealth(),
          getRoles(),
        ]);

        if (usersResult.status === 'fulfilled') {
          setUsers(usersResult.value.data || []);
        } else {
          setErrorMsg(usersResult.reason.response?.data?.message || usersResult.reason.message || 'Unable to load users.');
        }

        if (healthResult.status === 'fulfilled') {
          setHealth(healthResult.value.data);
        } else if (healthResult.reason.response?.data) {
          setHealth(healthResult.reason.response.data);
        } else {
          setErrorMsg(healthResult.reason.message || 'Unable to load system health.');
        }

        if (rolesResult.status === 'fulfilled') {
          setRoles(rolesResult.value.data || []);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const healthEntries = health?.components ? Object.entries(health.components) : [];

  // ── User modal handlers ──
  const openAddUser = () => {
    setUserModalMode('add');
    setEditingUserId(null);
    setUserForm({ ...EMPTY_USER_FORM, role: roles[0] || '' });
    setUserFormError('');
    setShowPassword(false);
    setUserModalOpen(true);
  };

  const openEditUser = (user) => {
    setUserModalMode('edit');
    setEditingUserId(user.id);
    setUserForm({
      fullName: user.fullName || '',
      email: user.email || '',
      password: '',
      role: user.role || '',
      department: user.department || '',
      active: user.active !== false,
    });
    setUserFormError('');
    setShowPassword(false);
    setUserModalOpen(true);
  };

  const closeUserModal = () => {
    setUserModalOpen(false);
    setUserFormError('');
    setUserFormSaving(false);
  };

  const handleUserFormChange = (field, value) => {
    setUserForm(prev => ({ ...prev, [field]: value }));
    if (userFormError) setUserFormError('');
  };

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    setUserFormError('');

    // Validate
    if (!userForm.fullName.trim()) {
      setUserFormError('Full name is required.');
      return;
    }
    if (!userForm.email.trim() || !/\S+@\S+\.\S+/.test(userForm.email)) {
      setUserFormError('A valid email address is required.');
      return;
    }
    if (userModalMode === 'add' && (!userForm.password || userForm.password.length < 8)) {
      setUserFormError('Password must be at least 8 characters.');
      return;
    }
    if (!userForm.role) {
      setUserFormError('Please select a role.');
      return;
    }

    setUserFormSaving(true);
    try {
      if (userModalMode === 'add') {
        await createUser({
          fullName: userForm.fullName.trim(),
          email: userForm.email.trim(),
          password: userForm.password,
          role: userForm.role,
          department: userForm.department.trim() || null,
        });
      } else {
        await updateUser(editingUserId, {
          fullName: userForm.fullName.trim(),
          email: userForm.email.trim(),
          role: userForm.role,
          department: userForm.department.trim() || null,
          active: userForm.active,
        });
      }

      // Refresh users list
      const res = await getUsers();
      setUsers(res.data || []);
      closeUserModal();
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.error
        || err.message
        || 'An error occurred. Please try again.';
      setUserFormError(msg);
    } finally {
      setUserFormSaving(false);
    }
  };

  const formatRoleName = (roleName) => {
    if (!roleName) return '-';
    return roleName.replace(/^ROLE_/, '').replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  // Retention handlers
  const handleRetentionSave = () => {
    localStorage.setItem('settings_retentionDays', retentionDays);
    localStorage.setItem('settings_autoPurge', String(autoPurge));
    localStorage.setItem('settings_archiveThreshold', archiveThreshold);
    setRetentionSaved(true);
    setTimeout(() => setRetentionSaved(false), 2500);
  };

  // API Key handlers
  const generateApiKey = () => {
    const name = newKeyName.trim() || `API Key ${apiKeys.length + 1}`;
    const key = 'sk-' + Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    const newKey = {
      id: Date.now().toString(),
      name,
      key,
      createdAt: new Date().toISOString(),
      lastUsed: null,
    };
    const updated = [...apiKeys, newKey];
    setApiKeys(updated);
    localStorage.setItem('settings_apiKeys', JSON.stringify(updated));
    setNewKeyName('');
  };

  const revokeApiKey = (keyId) => {
    const updated = apiKeys.filter(k => k.id !== keyId);
    setApiKeys(updated);
    localStorage.setItem('settings_apiKeys', JSON.stringify(updated));
  };

  const copyApiKey = (keyId, keyValue) => {
    navigator.clipboard.writeText(keyValue).then(() => {
      setCopiedKeyId(keyId);
      setTimeout(() => setCopiedKeyId(null), 2000);
    });
  };

  const maskKey = (key) => {
    if (!key) return '';
    return key.slice(0, 7) + '•'.repeat(20) + key.slice(-4);
  };

  // Refresh health
  const [refreshingHealth, setRefreshingHealth] = useState(false);
  const refreshHealth = async () => {
    setRefreshingHealth(true);
    try {
      const res = await getHealth();
      setHealth(res.data);
    } catch (err) {
      if (err.response?.data) setHealth(err.response.data);
    } finally {
      setRefreshingHealth(false);
    }
  };

  return (
    <>
      <div className="settings-page">
        <div className="page-header">
          <h1 className="page-title">Settings</h1>
        </div>

        <div className="settings-layout">
          <div className="settings-sidebar">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={16} className="settings-tab-icon" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="settings-content">
            {errorMsg && <div className="login-error">{errorMsg}</div>}

            {/* ── Users & Roles Tab ── */}
            {activeTab === 'users' && (
              <div className="settings-card">
                <div className="settings-card-header">
                  <h2 className="settings-card-title">Users</h2>
                  <Button variant="primary" icon={Plus} onClick={openAddUser}>
                    Add User
                  </Button>
                </div>

                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!isLoading && users.map(user => (
                      <tr key={user.id}>
                        <td className="font-medium">{user.fullName || '-'}</td>
                        <td>{user.email}</td>
                        <td><span className="settings-role-tag">{formatRoleName(user.role)}</span></td>
                        <td className="text-slate-500">{user.department || '-'}</td>
                        <td>
                          <span className={`status-dot ${user.active ? 'active' : ''}`}></span>
                          {user.active ? 'Active' : 'Inactive'}
                        </td>
                        <td>
                          <button className="edit-user-btn" onClick={() => openEditUser(user)} title="Edit user">
                            <Pencil size={14} />
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                    {isLoading && (
                      <tr>
                        <td colSpan="6">Loading users...</td>
                      </tr>
                    )}
                    {!isLoading && users.length === 0 && (
                      <tr>
                        <td colSpan="6">No users found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Retention Policies Tab ── */}
            {activeTab === 'retention' && (
              <div className="settings-card">
                <div className="settings-card-header">
                  <h2 className="settings-card-title">Retention Policies</h2>
                </div>
                <div className="settings-card-body">
                  <p className="settings-description">
                    Configure how long documents and data are retained in the system before archival or deletion.
                  </p>

                  <div className="settings-form-group">
                    <label className="settings-label" htmlFor="retention-days">
                      Document Retention Period (days)
                    </label>
                    <p className="settings-hint">Documents older than this will be eligible for archival.</p>
                    <input
                      id="retention-days"
                      className="input settings-input"
                      type="number"
                      min="30"
                      max="3650"
                      value={retentionDays}
                      onChange={(e) => setRetentionDays(e.target.value)}
                    />
                  </div>

                  <div className="settings-form-group">
                    <label className="settings-label" htmlFor="archive-threshold">
                      Archive Threshold (days)
                    </label>
                    <p className="settings-hint">Documents not accessed for this period are moved to archive storage.</p>
                    <input
                      id="archive-threshold"
                      className="input settings-input"
                      type="number"
                      min="7"
                      max="365"
                      value={archiveThreshold}
                      onChange={(e) => setArchiveThreshold(e.target.value)}
                    />
                  </div>

                  <div className="settings-form-group">
                    <div className="settings-toggle-row">
                      <div>
                        <label className="settings-label" htmlFor="auto-purge">Auto-Purge Expired Documents</label>
                        <p className="settings-hint">Automatically delete documents beyond retention period.</p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          id="auto-purge"
                          type="checkbox"
                          checked={autoPurge}
                          onChange={(e) => setAutoPurge(e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="settings-form-actions">
                    {retentionSaved && (
                      <span className="settings-save-success">
                        <CheckCircle size={16} /> Saved
                      </span>
                    )}
                    <button className="btn btn-primary" onClick={handleRetentionSave}>
                      Save Policies
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── System Health Tab ── */}
            {activeTab === 'health' && (
              <div className="settings-card">
                <div className="settings-card-header">
                  <h2 className="settings-card-title">System Health</h2>
                  <button
                    className="btn btn-secondary"
                    onClick={refreshHealth}
                    disabled={refreshingHealth}
                  >
                    <RefreshCw size={16} className={refreshingHealth ? 'spin-animation' : ''} />
                    {refreshingHealth ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
                <div className="health-grid">
                  <div className="health-card">
                    <div className="health-title">Backend API</div>
                    <div className={`health-status ${health?.status === 'UP' ? 'good' : ''}`}>
                      {health?.status === 'UP' ? 'Operational' : health?.status || 'Unknown'}
                    </div>
                  </div>
                  {healthEntries.map(([component, status]) => (
                    <div key={component} className="health-card">
                      <div className="health-title">{component}</div>
                      <div className={`health-status ${status === 'UP' ? 'good' : ''}`}>
                        {status === 'UP' ? 'Operational' : status}
                      </div>
                    </div>
                  ))}
                  {!isLoading && healthEntries.length === 0 && (
                    <div className="health-card">
                      <div className="health-title">No component data</div>
                      <div className="health-status">Unknown</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── API Keys Tab ── */}
            {activeTab === 'apikeys' && (
              <div className="settings-card">
                <div className="settings-card-header">
                  <h2 className="settings-card-title">API Keys</h2>
                </div>
                <div className="settings-card-body">
                  <p className="settings-description">
                    Generate API keys to authenticate programmatic access to the FinDoc AI platform.
                  </p>

                  <div className="apikey-generate-row">
                    <input
                      className="input apikey-name-input"
                      type="text"
                      placeholder="Key name (optional)"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && generateApiKey()}
                    />
                    <button className="btn btn-primary" onClick={generateApiKey}>
                      <Plus size={16} />
                      Generate Key
                    </button>
                  </div>

                  {apiKeys.length > 0 ? (
                    <div className="apikey-list">
                      {apiKeys.map(k => (
                        <div key={k.id} className="apikey-item">
                          <div className="apikey-item-info">
                            <span className="apikey-name">{k.name}</span>
                            <code className="apikey-value">{maskKey(k.key)}</code>
                            <span className="apikey-date">
                              Created {new Date(k.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="apikey-actions">
                            <button
                              className="apikey-action-btn"
                              title="Copy key"
                              onClick={() => copyApiKey(k.id, k.key)}
                            >
                              {copiedKeyId === k.id ? <CheckCircle size={16} className="text-success" /> : <Copy size={16} />}
                            </button>
                            <button
                              className="apikey-action-btn danger"
                              title="Revoke key"
                              onClick={() => revokeApiKey(k.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="apikey-empty">
                      <Key size={32} className="apikey-empty-icon" />
                      <p>No API keys generated yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Add / Edit User Modal ── */}
      {userModalOpen && (
        <div className="modal-backdrop" onClick={closeUserModal}>
          <div className="modal-card user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {userModalMode === 'add' ? 'Add New User' : 'Edit User'}
              </h3>
              <button className="modal-close-btn" onClick={closeUserModal} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUserFormSubmit}>
              <div className="modal-body">
                {userFormError && (
                  <div className="user-form-error">{userFormError}</div>
                )}

                <div className="user-form-row">
                  <div className="user-form-group">
                    <label className="user-form-label" htmlFor="user-fullname">Full Name *</label>
                    <input
                      id="user-fullname"
                      className="input"
                      type="text"
                      value={userForm.fullName}
                      onChange={(e) => handleUserFormChange('fullName', e.target.value)}
                      placeholder="John Doe"
                      autoFocus
                    />
                  </div>
                  <div className="user-form-group">
                    <label className="user-form-label" htmlFor="user-email">Email *</label>
                    <input
                      id="user-email"
                      className="input"
                      type="email"
                      value={userForm.email}
                      onChange={(e) => handleUserFormChange('email', e.target.value)}
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                {userModalMode === 'add' && (
                  <div className="user-form-group">
                    <label className="user-form-label" htmlFor="user-password">Password *</label>
                    <div className="user-password-wrapper">
                      <input
                        id="user-password"
                        className="input"
                        type={showPassword ? 'text' : 'password'}
                        value={userForm.password}
                        onChange={(e) => handleUserFormChange('password', e.target.value)}
                        placeholder="Minimum 8 characters"
                      />
                      <button
                        type="button"
                        className="user-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="user-form-row">
                  <div className="user-form-group">
                    <label className="user-form-label" htmlFor="user-role">Role *</label>
                    <select
                      id="user-role"
                      className="input user-select"
                      value={userForm.role}
                      onChange={(e) => handleUserFormChange('role', e.target.value)}
                    >
                      <option value="">Select role...</option>
                      {roles.map(r => (
                        <option key={r} value={r}>{formatRoleName(r)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="user-form-group">
                    <label className="user-form-label" htmlFor="user-department">Department</label>
                    <input
                      id="user-department"
                      className="input"
                      type="text"
                      value={userForm.department}
                      onChange={(e) => handleUserFormChange('department', e.target.value)}
                      placeholder="e.g. Finance, Operations"
                    />
                  </div>
                </div>

                {userModalMode === 'edit' && (
                  <div className="user-form-group">
                    <div className="user-active-toggle">
                      <div>
                        <label className="user-form-label" htmlFor="user-active">Account Status</label>
                        <p className="user-form-hint">
                          {userForm.active ? 'User can log in and access the system.' : 'User is deactivated and cannot log in.'}
                        </p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          id="user-active"
                          type="checkbox"
                          checked={userForm.active}
                          onChange={(e) => handleUserFormChange('active', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeUserModal}>
                  Cancel
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={userFormSaving}
                  disabled={userFormSaving}
                >
                  {userModalMode === 'add' ? 'Create User' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Settings;
