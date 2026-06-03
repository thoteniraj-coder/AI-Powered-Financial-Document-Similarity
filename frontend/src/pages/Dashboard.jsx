import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Copy, AlertTriangle, Clock, FileUp, MoreVertical } from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { getAlerts } from '../api/alerts';
import { getDocuments } from '../api/documents';
import './Dashboard.css';

export function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [documentsResponse, alertsResponse] = await Promise.all([
          getDocuments({ page: 0, size: 5 }),
          getAlerts(),
        ]);

        setDocuments(documentsResponse.data.content || []);
        setTotalDocuments(documentsResponse.data.totalElements || 0);
        setAlerts(alertsResponse.data || []);
      } catch (error) {
        setErrorMsg(error.response?.data?.message || error.message || 'Unable to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const activeAlerts = alerts
    .filter(alert => !['resolved', 'closed', 'ignored'].includes(String(alert.status || '').toLowerCase()));
  const visibleActiveAlerts = activeAlerts.slice(0, 3);
  const duplicateAlerts = alerts.filter(alert => String(alert.alertType || '').toLowerCase().includes('duplicate')).length;
  const fraudAlerts = activeAlerts.filter(alert => ['high', 'critical'].includes(String(alert.severity || '').toLowerCase())).length;
  const pendingReviews = documents.filter(doc => ['pending', 'processing'].includes(String(doc.processingStatus || '').toLowerCase())).length + activeAlerts.length;

  const stats = [
    { title: 'Documents Uploaded', value: totalDocuments.toLocaleString(), icon: FileText, color: 'navy' },
    { title: 'Duplicates Found', value: duplicateAlerts.toLocaleString(), icon: Copy, color: 'amber' },
    { title: 'High Risk Alerts', value: fraudAlerts.toLocaleString(), icon: AlertTriangle, color: 'red' },
    { title: 'Pending Reviews', value: pendingReviews.toLocaleString(), icon: Clock, color: 'slate' },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        {stats.map((stat, i) => (
          isLoading ? <LoadingSkeleton key={i} type="stat-card" /> : <StatCard key={i} {...stat} colorClass={stat.color} />
        ))}
      </div>

      <div className="dashboard-sections">
        <div className="recent-uploads-section">
          <div className="section-header">
            <h2 className="section-heading">Recent Uploads</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/documents')}>View All</button>
          </div>
          
          <div className="card table-card">
            {errorMsg && <div className="login-error">{errorMsg}</div>}
            <table className="data-table">
              <thead>
                <tr>
                  <th>Document ID</th>
                  <th>Vendor</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Uploaded</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan="6"><LoadingSkeleton type="table-row" /></td>
                    </tr>
                  ))
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.id}>
                      <td className="invoice-id">{doc.invoiceNumber || String(doc.id).slice(0, 8)}</td>
                      <td><strong>{doc.vendor || '-'}</strong></td>
                      <td><span className="text-slate-500">{doc.documentType || '-'}</span></td>
                      <td><StatusBadge status={doc.processingStatus} /></td>
                      <td className="text-slate-500 text-sm">{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : '-'}</td>
                      <td className="text-right">
                        <button className="icon-btn" onClick={() => navigate(`/documents/${doc.id}`)}><MoreVertical size={16} /></button>
                      </td>
                    </tr>
                  ))
                )}
                {!isLoading && documents.length === 0 && (
                  <tr>
                    <td colSpan="6">No documents uploaded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="active-alerts-section">
          <div className="section-header">
            <h2 className="section-heading">Active Alerts</h2>
          </div>
          
          <div className="alerts-list">
            {isLoading ? (
              <LoadingSkeleton type="card" count={2} />
            ) : (
              visibleActiveAlerts.map(alert => (
                <div key={alert.id} className="alert-card">
                  <div className="alert-header">
                    <span className={`badge ${String(alert.severity).toLowerCase() === 'high' ? 'badge-danger' : 'badge-warning'}`}>
                      {alert.severity}
                    </span>
                    <span className="alert-type">{alert.alertType}</span>
                  </div>
                  <p className="alert-message">{alert.description}</p>
                  <div className="alert-footer">
                    <span className="text-sm text-slate-500">Status:</span>
                    <button type="button" className="invoice-id text-navy-600 text-btn" onClick={() => navigate('/alerts')}>
                      {alert.status || 'open'}
                    </button>
                  </div>
                </div>
              ))
            )}
            {!isLoading && visibleActiveAlerts.length === 0 && (
              <div className="alert-card">
                <p className="alert-message">No active alerts.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <button className="fab-btn" title="Quick Upload" onClick={() => navigate('/upload')}>
        <FileUp size={24} />
      </button>
    </div>
  );
}
