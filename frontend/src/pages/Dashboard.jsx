import React, { useState, useEffect } from 'react';
import { FileText, Copy, AlertTriangle, Clock, FileUp, MoreVertical } from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import './Dashboard.css';

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { title: 'Documents Uploaded', value: '1,248', icon: FileText, color: 'navy', trend: { direction: 'up', value: 12 } },
    { title: 'Duplicates Found', value: '34', icon: Copy, color: 'amber', trend: { direction: 'down', value: 5 } },
    { title: 'Fraud Alerts', value: '7', icon: AlertTriangle, color: 'red', trend: { direction: 'up', value: 2 } },
    { title: 'Pending Reviews', value: '18', icon: Clock, color: 'slate', trend: { direction: 'neutral', value: 0 } },
  ];

  const recentUploads = [
    { id: 'INV-2023-001', vendor: 'Acme Corp', type: 'Invoice', status: 'Indexed', date: 'Oct 24, 10:30 AM' },
    { id: 'REC-89234', vendor: 'TechSupply', type: 'Receipt', status: 'Processing', date: 'Oct 24, 09:15 AM' },
    { id: 'INV-2023-002', vendor: 'Global Services', type: 'Invoice', status: 'Failed', date: 'Oct 23, 04:45 PM' },
    { id: 'PO-45992', vendor: 'Office Needs', type: 'Purchase Order', status: 'Pending', date: 'Oct 23, 02:20 PM' },
  ];

  const activeAlerts = [
    { id: 1, type: 'Potential Duplicate', severity: 'High', message: 'Invoice #1029 matches amount and vendor of #1024', docId: 'INV-1029' },
    { id: 2, type: 'Date Anomaly', severity: 'Medium', message: 'Document date is in the future', docId: 'REC-9921' },
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
            <button className="btn btn-ghost btn-sm">View All</button>
          </div>
          
          <div className="card table-card">
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
                  recentUploads.map((doc) => (
                    <tr key={doc.id}>
                      <td className="invoice-id">{doc.id}</td>
                      <td><strong>{doc.vendor}</strong></td>
                      <td><span className="text-slate-500">{doc.type}</span></td>
                      <td><StatusBadge status={doc.status} /></td>
                      <td className="text-slate-500 text-sm">{doc.date}</td>
                      <td className="text-right">
                        <button className="icon-btn"><MoreVertical size={16} /></button>
                      </td>
                    </tr>
                  ))
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
              activeAlerts.map(alert => (
                <div key={alert.id} className="alert-card">
                  <div className="alert-header">
                    <span className={`badge ${alert.severity === 'High' ? 'badge-danger' : 'badge-warning'}`}>
                      {alert.severity}
                    </span>
                    <span className="alert-type">{alert.type}</span>
                  </div>
                  <p className="alert-message">{alert.message}</p>
                  <div className="alert-footer">
                    <span className="text-sm text-slate-500">Affects:</span>
                    <a href="#" className="invoice-id text-navy-600">{alert.docId}</a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <button className="fab-btn" title="Quick Upload">
        <FileUp size={24} />
      </button>
    </div>
  );
}
