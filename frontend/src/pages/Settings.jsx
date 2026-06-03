import React, { useEffect, useState } from 'react';

import { Button } from '../components/common/Button';
import { getHealth } from '../api/health';
import { getUsers } from '../api/users';
import './Settings.css';

const Settings = () => {
  const [users, setUsers] = useState([]);
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [usersResult, healthResult] = await Promise.allSettled([
          getUsers(),
          getHealth(),
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
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const healthEntries = health?.components ? Object.entries(health.components) : [];

  return (
    <>
      <div className="settings-page">
        <div className="page-header">
          <h1 className="page-title">Settings</h1>
        </div>

        <div className="settings-layout">
          <div className="settings-sidebar">
            <button className="settings-tab active">Users & Roles</button>
            <button className="settings-tab">Retention Policies</button>
            <button className="settings-tab">System Health</button>
            <button className="settings-tab">API Keys</button>
          </div>

          <div className="settings-content">
            {errorMsg && <div className="login-error">{errorMsg}</div>}
            <div className="settings-card">
              <div className="settings-card-header">
                <h2 className="settings-card-title">Users</h2>
                <Button variant="primary">Add User</Button>
              </div>
              
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!isLoading && users.map(user => (
                    <tr key={user.id}>
                      <td className="font-medium">{user.fullName || '-'}</td>
                      <td>{user.email}</td>
                      <td>{user.role || '-'}</td>
                      <td><span className={`status-dot ${user.active ? 'active' : ''}`}></span> {user.active ? 'Active' : 'Inactive'}</td>
                      <td><button className="text-btn">Edit</button></td>
                    </tr>
                  ))}
                  {isLoading && (
                    <tr>
                      <td colSpan="5">Loading users...</td>
                    </tr>
                  )}
                  {!isLoading && users.length === 0 && (
                    <tr>
                      <td colSpan="5">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="settings-card mt-6">
              <div className="settings-card-header">
                <h2 className="settings-card-title">System Health</h2>
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
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
