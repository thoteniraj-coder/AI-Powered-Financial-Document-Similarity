import React from 'react';
import { AppLayout } from '../components/Layout/AppLayout';
import { Button } from '../components/common/Button';
import './Settings.css';

const Settings = () => {
  return (
    <AppLayout>
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
                  <tr>
                    <td className="font-medium">Jane Doe</td>
                    <td>jane@example.com</td>
                    <td>Admin</td>
                    <td><span className="status-dot active"></span> Active</td>
                    <td><button className="text-btn">Edit</button></td>
                  </tr>
                  <tr>
                    <td className="font-medium">John Smith</td>
                    <td>john@example.com</td>
                    <td>Manager</td>
                    <td><span className="status-dot active"></span> Active</td>
                    <td><button className="text-btn">Edit</button></td>
                  </tr>
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
                  <div className="health-status good">Operational</div>
                </div>
                <div className="health-card">
                  <div className="health-title">PostgreSQL Database</div>
                  <div className="health-status good">Operational</div>
                </div>
                <div className="health-card">
                  <div className="health-title">Qdrant Vector DB</div>
                  <div className="health-status good">Operational</div>
                </div>
                <div className="health-card">
                  <div className="health-title">Embedding Service</div>
                  <div className="health-status good">Operational</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
