import React, { useEffect, useState } from 'react';
import { Download, Filter } from 'lucide-react';

import { Button } from '../components/common/Button';
import { getAuditLogs } from '../api/audit';
import './AuditTrail.css';

const AuditTrail = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const actorOptions = [...new Set(logs.map(log => log.actorUserId || 'System'))];

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const response = await getAuditLogs();
        setLogs(response.data || []);
      } catch (error) {
        setErrorMsg(error.response?.data?.message || error.message || 'Unable to load audit logs.');
      } finally {
        setIsLoading(false);
      }
    };

    loadLogs();
  }, []);

  return (
    <>
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
            {actorOptions.map(actor => (
              <option key={actor}>{actor === 'System' ? 'System' : `User ${actor}`}</option>
            ))}
          </select>
        </div>

        <div className="table-container">
          {errorMsg && <div className="login-error">{errorMsg}</div>}
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
              {!isLoading && logs.map(log => (
                <tr key={log.id}>
                  <td className="monospace text-sm">{log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}</td>
                  <td className="font-medium">{log.actorUserId || 'System'}</td>
                  <td><span className={`action-badge ${log.action.toLowerCase()}`}>{log.action}</span></td>
                  <td>{log.entityType || '-'}</td>
                  <td className="text-sm truncate-max">{log.payload || log.entityId || '-'}</td>
                  <td className="monospace text-sm">{log.ipAddress || '-'}</td>
                </tr>
              ))}
              {isLoading && (
                <tr>
                  <td colSpan="6">Loading audit logs...</td>
                </tr>
              )}
              {!isLoading && logs.length === 0 && (
                <tr>
                  <td colSpan="6">No audit events recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AuditTrail;
