import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { AppLayout } from '../components/Layout/AppLayout';
import { Button } from '../components/common/Button';
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
