import React from 'react';
import { Download, Filter } from 'lucide-react';
import { AppLayout } from '../components/Layout/AppLayout';
import { Button } from '../components/common/Button';
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
