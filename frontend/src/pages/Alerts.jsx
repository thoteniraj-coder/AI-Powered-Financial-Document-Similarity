import React, { useEffect, useState } from 'react';
import { ShieldAlert, AlertTriangle, Info, CheckCircle } from 'lucide-react';

import { Button } from '../components/common/Button';
import Modal from '../components/common/Modal';
import { getAlerts, updateAlert } from '../api/alerts';
import './Alerts.css';

const Alerts = () => {
  const [activeTab, setActiveTab] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionModal, setActionModal] = useState({ isOpen: false, alertId: null, status: '', title: '' });
  const [alerts, setAlerts] = useState([]);
  const [actionComment, setActionComment] = useState('');
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

  const openActionModal = (id, status, title) => setActionModal({ isOpen: true, alertId: id, status, title });
  const closeActionModal = () => {
    setActionModal({ isOpen: false, alertId: null, status: '', title: '' });
    setActionComment('');
  };

  const handleAlertStatus = async (id, status, comment = '') => {
    try {
      await updateAlert(id, { status, comment });
      closeActionModal();
      await loadAlerts();
    } catch (error) {
      setErrorMsg(error.response?.data?.message || error.message || 'Unable to update alert.');
    }
  };

  // Build dynamic tab list from actual alertType values in the data
  const alertTypeOptions = [...new Set(alerts.map(a => (a.alertType || '').toUpperCase()).filter(Boolean))];
  const statusOptions = [...new Set(alerts.map(a => (a.status || '').toLowerCase()).filter(Boolean))];

  const formatTabLabel = (type) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  const visibleAlerts = alerts
    .map((alert) => ({
      id: alert.id,
      type: (alert.alertType || 'UNKNOWN').toUpperCase(),
      severity: (alert.severity || 'low').toLowerCase(),
      title: formatTabLabel(alert.alertType || 'Alert'),
      desc: alert.description,
      status: (alert.status || 'open').toLowerCase(),
      date: alert.createdAt ? new Date(alert.createdAt).toLocaleString() : '-',
    }))
    .filter(alert => activeTab === 'ALL' || alert.type === activeTab)
    .filter(alert => statusFilter === 'all' || alert.status === statusFilter);

  return (
    <>
      <div className="alerts-page">
        <div className="page-header">
          <h1 className="page-title">Alerts & Findings</h1>
          <p className="page-subtitle">Review system-generated alerts for duplicates, fraud, and anomalies.</p>
        </div>

        <div className="alerts-filters">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${activeTab === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveTab('ALL')}
            >
              All
            </button>
            {alertTypeOptions.map(type => (
              <button
                key={type}
                className={`filter-tab ${activeTab === type ? 'active' : ''}`}
                onClick={() => setActiveTab(type)}
              >
                {formatTabLabel(type)}
              </button>
            ))}
          </div>
          <div className="filter-dropdowns">
            <select className="alerts-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Status: All</option>
              {statusOptions.map(s => (
                <option key={s} value={s}>Status: {s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
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
                {(alert.status === 'open' || alert.status === 'new') && (
                  <>
                    <Button variant="outline" className="w-full mb-2" onClick={() => handleAlertStatus(alert.id, 'acknowledged')}>Acknowledge</Button>
                    <Button variant="outline" className="w-full mb-2" onClick={() => openActionModal(alert.id, 'dismissed', 'Dismiss Alert')}>Dismiss</Button>
                    <Button variant="outline" className="w-full mb-2" onClick={() => openActionModal(alert.id, 'escalated', 'Escalate Alert')}>Escalate</Button>
                    <Button variant="primary" className="w-full" onClick={() => openActionModal(alert.id, 'resolved', 'Resolve Alert')}>Resolve</Button>
                  </>
                )}
                {alert.status === 'acknowledged' && (
                  <>
                    <Button variant="outline" className="w-full mb-2" onClick={() => openActionModal(alert.id, 'dismissed', 'Dismiss Alert')}>Dismiss</Button>
                    <Button variant="outline" className="w-full mb-2" onClick={() => openActionModal(alert.id, 'escalated', 'Escalate Alert')}>Escalate</Button>
                    <Button variant="primary" className="w-full" onClick={() => openActionModal(alert.id, 'resolved', 'Resolve Alert')}>Resolve</Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={actionModal.isOpen}
        onClose={closeActionModal}
        title={actionModal.title}
        footer={
          <>
            <Button variant="ghost" onClick={closeActionModal}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => handleAlertStatus(actionModal.alertId, actionModal.status, actionComment)}
              disabled={!actionComment.trim()}
            >
              Submit
            </Button>
          </>
        }
      >
        <div className="resolve-form">
          <p className="resolve-prompt">Please provide a comment for this alert action:</p>
          <div className="form-group">
            <label>Action Category</label>
            <select className="w-full p-2 border rounded">
              <option>Confirmed Duplicate - Ignored</option>
              <option>Confirmed Duplicate - Deleted</option>
              <option>False Positive</option>
              <option>Verified Exception</option>
              <option>Escalated for Manager Review</option>
            </select>
          </div>
          <div className="form-group mt-4">
            <label>Comments (Required)</label>
            <textarea
              className="w-full p-2 border rounded"
              rows={4}
              placeholder="Enter action details..."
              value={actionComment}
              onChange={(event) => setActionComment(event.target.value)}
            ></textarea>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Alerts;
