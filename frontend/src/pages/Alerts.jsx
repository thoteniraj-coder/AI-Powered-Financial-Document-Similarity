import React, { useEffect, useState } from 'react';
import { ShieldAlert, AlertTriangle, Info, CheckCircle } from 'lucide-react';

import { Button } from '../components/common/Button';
import Modal from '../components/common/Modal';
import { getAlerts, updateAlert } from '../api/alerts';
import './Alerts.css';

const Alerts = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [resolveModal, setResolveModal] = useState({ isOpen: false, alertId: null });
  const [alerts, setAlerts] = useState([]);
  const [resolutionComment, setResolutionComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const response = await getAlerts();
      setAlerts(response.data || []);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || error.message || 'Unable to load alerts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <ShieldAlert className="text-danger-600" size={24} />;
      case 'medium': return <AlertTriangle className="text-warning-600" size={24} />;
      case 'low': return <Info className="text-info-600" size={24} />;
      default: return <Info size={24} />;
    }
  };

  const openResolveModal = (id) => setResolveModal({ isOpen: true, alertId: id });
  const closeResolveModal = () => {
    setResolveModal({ isOpen: false, alertId: null });
    setResolutionComment('');
  };

  const handleAlertStatus = async (id, status) => {
    try {
      await updateAlert(id, { status, comment: resolutionComment });
      closeResolveModal();
      await loadAlerts();
    } catch (error) {
      setErrorMsg(error.response?.data?.message || error.message || 'Unable to update alert.');
    }
  };

  const visibleAlerts = alerts
    .map((alert) => ({
      id: alert.id,
      type: (alert.alertType || 'anomaly').toLowerCase(),
      severity: (alert.severity || 'low').toLowerCase(),
      title: alert.alertType || 'Alert',
      desc: alert.description,
      status: (alert.status || 'open').toLowerCase(),
      date: alert.createdAt ? new Date(alert.createdAt).toLocaleString() : '-',
    }))
    .filter(alert => activeTab === 'all' || alert.type === activeTab);

  return (
    <>
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
          {errorMsg && <div className="login-error">{errorMsg}</div>}
          {isLoading && <div className="alert-card">Loading alerts...</div>}
          {!isLoading && visibleAlerts.length === 0 && <div className="alert-card">No alerts found.</div>}
          {!isLoading && visibleAlerts.map(alert => (
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
                    <Button variant="outline" className="w-full mb-2" onClick={() => handleAlertStatus(alert.id, 'acknowledged')}>Acknowledge</Button>
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
            <Button
              variant="primary"
              onClick={() => handleAlertStatus(resolveModal.alertId, 'resolved')}
              disabled={!resolutionComment.trim()}
            >
              Submit Resolution
            </Button>
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
            <textarea
              className="w-full p-2 border rounded"
              rows={4}
              placeholder="Enter resolution details..."
              value={resolutionComment}
              onChange={(event) => setResolutionComment(event.target.value)}
            ></textarea>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Alerts;
