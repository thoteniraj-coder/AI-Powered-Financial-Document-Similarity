import React, { useEffect, useState } from 'react';
import { Download, Search } from 'lucide-react';

import { Button } from '../components/common/Button';
import { exportAuditLogs, getAuditLogs } from '../api/audit';
import './AuditTrail.css';

const AuditTrail = () => {
  const [logs, setLogs] = useState([]);
  const [pageData, setPageData] = useState({ number: 0, totalElements: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [actionFilter, setActionFilter] = useState('All Actions');
  const [userFilter, setUserFilter] = useState('All Users');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState({ actors: [], actions: [] });

  const actorOptions = filterOptions.actors;
  const actionOptions = filterOptions.actions;
  const hasActiveFilters = Boolean(startDate || endDate || searchQuery.trim() || actionFilter !== 'All Actions' || userFilter !== 'All Users');

  const buildServerFilters = (page = 0, size = 20) => {
    const params = { page, size };
    if (startDate) params.startDate = `${startDate}T00:00:00`;
    if (endDate) params.endDate = `${endDate}T23:59:59`;
    if (actionFilter !== 'All Actions') params.action = actionFilter;
    if (userFilter === 'System') {
      params.systemActor = true;
    } else if (userFilter !== 'All Users') {
      params.userId = userFilter.replace('User ', '');
    }
    if (searchQuery.trim()) params.q = searchQuery.trim();
    return params;
  };

  const loadLogs = async (page = 0) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await getAuditLogs(buildServerFilters(page));
      setLogs(response.data?.content || []);
      setPageData({
        number: response.data?.number || 0,
        totalElements: response.data?.totalElements || 0,
        totalPages: response.data?.totalPages || 0,
      });
    } catch (error) {
      setErrorMsg(error.response?.data?.message || error.message || 'Unable to load audit logs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const response = await getAuditLogs({ page: 0, size: 200 });
        const optionLogs = response.data?.content || response.data || [];
        setFilterOptions({
          actors: [...new Set(optionLogs.map(log => log.actorUserId || 'System'))],
          actions: [...new Set(optionLogs.map(log => log.action).filter(Boolean))],
        });
      } catch (error) {
        setErrorMsg(error.response?.data?.message || error.message || 'Unable to load audit filter options.');
      }
    };

    loadFilterOptions();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadLogs(0), 300);
    return () => clearTimeout(timer);
  }, [startDate, endDate, actionFilter, userFilter, searchQuery]);

  const handleExport = async () => {
    try {
      const response = await exportAuditLogs(buildServerFilters(0, 2000));
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
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="audit-input"
              placeholder="Search audit trail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
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
              {!isLoading && logs.length === 0 && hasActiveFilters && (
                <tr>
                  <td colSpan="6">No audit events match your filters.</td>
                </tr>
              )}
              {!isLoading && logs.length === 0 && !hasActiveFilters && (
                <tr>
                  <td colSpan="6">No audit events recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span className="pagination-info">Showing {logs.length} of {pageData.totalElements} events</span>
          <div className="pagination-controls">
            <button
              className={`page-btn ${pageData.number === 0 ? 'disabled' : ''}`}
              disabled={pageData.number === 0}
              onClick={() => loadLogs(pageData.number - 1)}
            >
              Previous
            </button>
            {Array.from({ length: pageData.totalPages }, (_, index) => (
              <button
                key={index}
                className={`page-btn ${pageData.number === index ? 'active' : ''}`}
                onClick={() => loadLogs(index)}
              >
                {index + 1}
              </button>
            ))}
            <button
              className={`page-btn ${pageData.number + 1 >= pageData.totalPages ? 'disabled' : ''}`}
              disabled={pageData.number + 1 >= pageData.totalPages}
              onClick={() => loadLogs(pageData.number + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuditTrail;
