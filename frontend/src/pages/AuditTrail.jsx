import React, { useEffect, useState } from 'react';
import { Download, Filter } from 'lucide-react';

import { Button } from '../components/common/Button';
import { exportAuditLogs, getAuditLogs } from '../api/audit';
import './AuditTrail.css';

const AuditTrail = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [actionFilter, setActionFilter] = useState('All Actions');
  const [userFilter, setUserFilter] = useState('All Users');

  const actorOptions = [...new Set(logs.map(log => log.actorUserId || 'System'))];
  const actionOptions = [...new Set(logs.map(log => log.action).filter(Boolean))];

  const filteredLogs = logs.filter(log => {
    let match = true;
    const logDate = new Date(log.createdAt);

    if (startDate) {
      const start = new Date(startDate + 'T00:00:00');
      match = match && logDate >= start;
    }
    if (endDate) {
      const end = new Date(endDate + 'T23:59:59');
      match = match && logDate <= end;
    }
    if (actionFilter !== 'All Actions') {
      match = match && String(log.action).toUpperCase() === actionFilter.toUpperCase();
    }
    if (userFilter !== 'All Users') {
      const actor = userFilter === 'System' ? 'System' : userFilter.replace('User ', '');
      match = match && String(log.actorUserId || 'System') === String(actor);
    }
    return match;
  });

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const response = await getAuditLogs();
        setLogs(response.data?.content || response.data || []);
      } catch (error) {
        setErrorMsg(error.response?.data?.message || error.message || 'Unable to load audit logs.');
      } finally {
        setIsLoading(false);
      }
    };

    loadLogs();
  }, []);

  const buildServerFilters = () => {
    const params = {};
    if (startDate) params.startDate = `${startDate}T00:00:00`;
    if (endDate) params.endDate = `${endDate}T23:59:59`;
    if (actionFilter !== 'All Actions') params.action = actionFilter;
    if (userFilter !== 'All Users' && userFilter !== 'System') {
      params.userId = userFilter.replace('User ', '');
    }
    return params;
  };

  const handleExport = async () => {
    try {
      const response = await exportAuditLogs(buildServerFilters());
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'audit-logs.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || error.message || 'Unable to export audit logs.');
    }
  };

  return (
    <>
      <div className="audit-page">
        <div className="page-header">
          <h1 className="page-title">Audit Trail</h1>
          <Button variant="outline" onClick={handleExport}><Download size={16} /> Export CSV</Button>
        </div>

        <div className="audit-filters">
          <div className="filter-group">
            <input
              type="date"
              className="audit-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span>to</span>
            <input
              type="date"
              className="audit-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <select
            className="audit-input"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option>All Actions</option>
            {actionOptions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
          <select
            className="audit-input"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          >
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
              {!isLoading && filteredLogs.map(log => (
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
              {!isLoading && filteredLogs.length === 0 && logs.length > 0 && (
                <tr>
                  <td colSpan="6">No audit events match your filters.</td>
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
