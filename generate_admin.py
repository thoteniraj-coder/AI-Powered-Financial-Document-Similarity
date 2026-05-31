import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content.strip() + '\n')
    print(f"Created {path}")

alerts_jsx = """
import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import AppLayout from '../components/Layout/AppLayout';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import './Alerts.css';

const MOCK_ALERTS = [
  { id: '1', type: 'duplicate', severity: 'high', title: 'Exact Duplicate Detected', desc: 'INV-2023-042_AcmeCorp.pdf is a 98% match with INV-2023-041_AcmeCorp.pdf', status: 'open', date: '2 hours ago' },
  { id: '2', type: 'fraud', severity: 'high', title: 'Suspicious Vendor Anomaly', desc: 'Vendor "Acme Corp" bank details differ from historical records.', status: 'open', date: '5 hours ago' },
  { id: '3', type: 'anomaly', severity: 'medium', title: 'Unusual Amount', desc: 'Invoice amount $45,000 exceeds usual vendor average by 400%.', status: 'acknowledged', date: '1 day ago' },
];

const Alerts = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [resolveModal, setResolveModal] = useState({ isOpen: false, alertId: null });

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <ShieldAlert className="text-danger-600" size={24} />;
      case 'medium': return <AlertTriangle className="text-warning-600" size={24} />;
      case 'low': return <Info className="text-info-600" size={24} />;
      default: return <Info size={24} />;
    }
  };

  const openResolveModal = (id) => setResolveModal({ isOpen: true, alertId: id });
  const closeResolveModal = () => setResolveModal({ isOpen: false, alertId: null });

  return (
    <AppLayout>
      <div className="alerts-page">
        <div className="page-header">
          <h1 className="page-title">Alerts & Findings</h1>
          <p className="page-subtitle">Review system-generated alerts for duplicates, fraud, and anomalies.</p>
        </div>

        <div className="alerts-filters">
          <div className="filter-tabs">
            {['all', 'duplicate', 'fraud', 'anomaly'].map(tab => (
              <button 
                key={tab} 
                className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}s
              </button>
            ))}
          </div>
          <div className="filter-dropdowns">
            <select className="alerts-select">
              <option value="open">Status: Open</option>
              <option value="acknowledged">Status: Acknowledged</option>
              <option value="resolved">Status: Resolved</option>
            </select>
          </div>
        </div>

        <div className="alerts-list">
          {MOCK_ALERTS.filter(a => activeTab === 'all' || a.type === activeTab).map(alert => (
            <div key={alert.id} className={`alert-card severity-${alert.severity}`}>
              <div className="alert-icon-col">
                {getSeverityIcon(alert.severity)}
              </div>
              
              <div className="alert-content-col">
                <div className="alert-header">
                  <span className={`alert-badge type-${alert.type}`}>{alert.type}</span>
                  <span className="alert-date">{alert.date}</span>
                </div>
                <h3 className="alert-title">{alert.title}</h3>
                <p className="alert-desc">{alert.desc}</p>
              </div>
              
              <div className="alert-actions-col">
                {alert.status === 'open' && (
                  <>
                    <Button variant="outline" className="w-full mb-2">Acknowledge</Button>
                    <Button variant="primary" className="w-full" onClick={() => openResolveModal(alert.id)}>Resolve</Button>
                  </>
                )}
                {alert.status === 'acknowledged' && (
                  <Button variant="primary" className="w-full" onClick={() => openResolveModal(alert.id)}>Resolve</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal 
        isOpen={resolveModal.isOpen} 
        onClose={closeResolveModal} 
        title="Resolve Alert"
        footer={
          <>
            <Button variant="ghost" onClick={closeResolveModal}>Cancel</Button>
            <Button variant="primary" onClick={closeResolveModal}>Submit Resolution</Button>
          </>
        }
      >
        <div className="resolve-form">
          <p className="resolve-prompt">Please provide a reason for resolving this alert:</p>
          <div className="form-group">
            <label>Resolution Category</label>
            <select className="w-full p-2 border rounded">
              <option>Confirmed Duplicate - Ignored</option>
              <option>Confirmed Duplicate - Deleted</option>
              <option>False Positive</option>
              <option>Verified Exception</option>
            </select>
          </div>
          <div className="form-group mt-4">
            <label>Comments (Required)</label>
            <textarea className="w-full p-2 border rounded" rows={4} placeholder="Enter resolution details..."></textarea>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
};

export default Alerts;
"""

alerts_css = """
.alerts-page {
  max-width: 1000px;
  margin: 0 auto;
}

.alerts-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
}

.filter-tabs {
  display: flex;
  background-color: var(--slate-100);
  padding: 4px;
  border-radius: var(--radius-md);
}

.filter-tab {
  padding: var(--space-2) var(--space-4);
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--slate-600);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-tab:hover {
  color: var(--navy-800);
}

.filter-tab.active {
  background-color: white;
  color: var(--navy-900);
  box-shadow: var(--shadow-xs);
}

.alerts-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--slate-300);
  border-radius: var(--radius-md);
  background-color: white;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.alert-card {
  display: flex;
  background-color: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--slate-200);
  border-left: 4px solid transparent;
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
  gap: var(--space-5);
}

.alert-card.severity-high { border-left-color: var(--danger-500); }
.alert-card.severity-medium { border-left-color: var(--warning-500); }
.alert-card.severity-low { border-left-color: var(--info-500); }

.alert-icon-col {
  padding-top: var(--space-1);
}

.text-danger-600 { color: var(--danger-600); }
.text-warning-600 { color: var(--warning-600); }
.text-info-600 { color: var(--info-600); }

.alert-content-col {
  flex: 1;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.alert-badge {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.alert-badge.type-duplicate { background-color: var(--info-100); color: var(--info-700); }
.alert-badge.type-fraud { background-color: var(--danger-100); color: var(--danger-700); }
.alert-badge.type-anomaly { background-color: var(--warning-100); color: var(--warning-700); }

.alert-date {
  font-size: 12px;
  color: var(--slate-500);
}

.alert-title {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--navy-900);
  margin: 0 0 var(--space-1) 0;
}

.alert-desc {
  font-size: 14px;
  color: var(--slate-700);
  margin: 0;
  line-height: 1.5;
}

.alert-actions-col {
  width: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.w-full { width: 100%; }
.mb-2 { margin-bottom: var(--space-2); }
.mt-4 { margin-top: var(--space-4); }

.resolve-prompt {
  margin-bottom: var(--space-4);
  color: var(--slate-700);
}

.p-2 { padding: var(--space-2); }
.border { border: 1px solid var(--slate-300); }
.rounded { border-radius: var(--radius-md); }
"""

audit_jsx = """
import React from 'react';
import { Download, Filter } from 'lucide-react';
import AppLayout from '../components/Layout/AppLayout';
import Button from '../components/common/Button';
import './AuditTrail.css';

const MOCK_LOGS = [
  { id: 1, timestamp: '2023-10-15 14:32:01', user: 'Jane Doe', action: 'UPLOAD', entity: 'Document', details: 'Uploaded INV-2023-042_AcmeCorp.pdf', ip: '192.168.1.104' },
  { id: 2, timestamp: '2023-10-15 14:35:22', user: 'System', action: 'FLAG', entity: 'Alert', details: 'Created duplicate alert for INV-2023-042', ip: '-' },
  { id: 3, timestamp: '2023-10-15 15:10:05', user: 'John Smith', action: 'RESOLVE', entity: 'Alert', details: 'Resolved duplicate alert #1 - Ignored', ip: '10.0.0.52' },
  { id: 4, timestamp: '2023-10-14 09:12:44', user: 'Jane Doe', action: 'LOGIN', entity: 'UserSession', details: 'Successful login', ip: '192.168.1.104' },
];

const AuditTrail = () => {
  return (
    <AppLayout>
      <div className="audit-page">
        <div className="page-header">
          <h1 className="page-title">Audit Trail</h1>
          <Button variant="outline"><Download size={16} /> Export CSV</Button>
        </div>

        <div className="audit-filters">
          <div className="filter-group">
            <input type="date" className="audit-input" />
            <span>to</span>
            <input type="date" className="audit-input" />
          </div>
          <select className="audit-input">
            <option>All Actions</option>
            <option>UPLOAD</option>
            <option>DELETE</option>
            <option>RESOLVE</option>
          </select>
          <select className="audit-input">
            <option>All Users</option>
            <option>Jane Doe</option>
            <option>John Smith</option>
            <option>System</option>
          </select>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Details</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_LOGS.map(log => (
                <tr key={log.id}>
                  <td className="monospace text-sm">{log.timestamp}</td>
                  <td className="font-medium">{log.user}</td>
                  <td><span className={`action-badge ${log.action.toLowerCase()}`}>{log.action}</span></td>
                  <td>{log.entity}</td>
                  <td className="text-sm truncate-max">{log.details}</td>
                  <td className="monospace text-sm">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default AuditTrail;
"""

audit_css = """
.audit-page {
  max-width: 1200px;
  margin: 0 auto;
}

.audit-filters {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
  background-color: white;
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--slate-200);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.audit-input {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--slate-300);
  border-radius: var(--radius-md);
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px;
}

.text-sm { font-size: 13px; }
.truncate-max { max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.action-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background-color: var(--slate-100);
  color: var(--slate-700);
}

.action-badge.upload { background-color: var(--info-100); color: var(--info-700); }
.action-badge.delete { background-color: var(--danger-100); color: var(--danger-700); }
.action-badge.resolve { background-color: var(--success-100); color: var(--success-700); }
.action-badge.flag { background-color: var(--warning-100); color: var(--warning-700); }
"""

settings_jsx = """
import React from 'react';
import AppLayout from '../components/Layout/AppLayout';
import Button from '../components/common/Button';
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
"""

settings_css = """
.settings-page {
  max-width: 1200px;
  margin: 0 auto;
}

.settings-layout {
  display: flex;
  gap: var(--space-8);
  align-items: flex-start;
}

.settings-sidebar {
  width: 240px;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.settings-tab {
  text-align: left;
  padding: var(--space-3) var(--space-4);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: var(--slate-600);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.settings-tab:hover {
  background-color: var(--slate-100);
  color: var(--navy-800);
}

.settings-tab.active {
  background-color: var(--navy-50);
  color: var(--navy-700);
  font-weight: 600;
}

.settings-content {
  flex: 1;
}

.settings-card {
  background-color: white;
  border-radius: var(--radius-xl);
  border: 1px solid var(--slate-200);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.settings-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--slate-200);
}

.settings-card-title {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: var(--navy-900);
  margin: 0;
}

.text-btn {
  background: none;
  border: none;
  color: var(--info-600);
  font-weight: 500;
  cursor: pointer;
}

.text-btn:hover {
  text-decoration: underline;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: var(--space-2);
}

.status-dot.active { background-color: var(--success-500); }

.health-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
  padding: var(--space-6);
}

.health-card {
  padding: var(--space-4);
  border: 1px solid var(--slate-200);
  border-radius: var(--radius-md);
  background-color: var(--slate-50);
}

.health-title {
  font-weight: 600;
  color: var(--navy-900);
  margin-bottom: var(--space-2);
}

.health-status {
  font-size: 14px;
  display: flex;
  align-items: center;
}

.health-status::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: var(--space-2);
}

.health-status.good::before { background-color: var(--success-500); }
.health-status.good { color: var(--success-600); }
"""

write_file('frontend/src/pages/Alerts.jsx', alerts_jsx)
write_file('frontend/src/pages/Alerts.css', alerts_css)
write_file('frontend/src/pages/AuditTrail.jsx', audit_jsx)
write_file('frontend/src/pages/AuditTrail.css', audit_css)
write_file('frontend/src/pages/Settings.jsx', settings_jsx)
write_file('frontend/src/pages/Settings.css', settings_css)
