import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Copy, AlertTriangle, Clock, 
  Upload, Calendar, ChevronDown, MoreVertical,
  Building2, BarChart2
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../hooks/useAuth';
import { getAlerts } from '../api/alerts';
import { getDocuments } from '../api/documents';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [days, setDays] = useState(30);
  const [activeAlertTab, setActiveAlertTab] = useState('All');

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        const [documentsResponse, alertsResponse] = await Promise.all([
          getDocuments({ page: 0, size: 5, days }),
          getAlerts({ days }),
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
  }, [days]);

  const activeAlerts = alerts
    .filter(alert => !['resolved', 'closed', 'ignored'].includes(String(alert.status || '').toLowerCase()));
  const duplicateAlerts = alerts.filter(alert => String(alert.alertType || '').toLowerCase().includes('duplicate')).length;
  const fraudAlerts = activeAlerts.filter(alert => ['high', 'critical'].includes(String(alert.severity || '').toLowerCase())).length;
  const mediumAlerts = activeAlerts.filter(alert => String(alert.severity || '').toLowerCase() === 'medium').length;
  const pendingReviews = documents.filter(doc => ['pending', 'processing'].includes(String(doc.processingStatus || '').toLowerCase())).length + activeAlerts.length;

  let filteredAlerts = activeAlerts;
  if (activeAlertTab === 'High') {
    filteredAlerts = activeAlerts.filter(a => ['high', 'critical'].includes(String(a.severity || '').toLowerCase()));
  } else if (activeAlertTab === 'Medium') {
    filteredAlerts = activeAlerts.filter(a => String(a.severity || '').toLowerCase() === 'medium');
  }
  const visibleActiveAlerts = filteredAlerts.slice(0, 4);

  const activityData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      { label: 'Uploaded', data: [4, 7, 5, 9, 6, 10], backgroundColor: '#1a56db', borderRadius: 3, borderSkipped: false },
      { label: 'Duplicates', data: [1, 2, 1, 4, 3, 5], backgroundColor: '#f59e0b', borderRadius: 3, borderSkipped: false },
      { label: 'Alerts', data: [0, 1, 2, 3, 2, 4], backgroundColor: '#ef4444', borderRadius: 3, borderSkipped: false }
    ]
  };

  const activityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#6b7280' } },
      y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 }, color: '#6b7280', stepSize: 2 }, border: { display: false } }
    },
    barPercentage: 0.6,
    categoryPercentage: 0.8
  };

  const typeData = {
    labels: ['Invoice', 'Bank statement', 'Receipt'],
    datasets: [{
      data: [60, 25, 15],
      backgroundColor: ['#1a56db', '#7c3aed', '#059669'],
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverOffset: 4
    }]
  };

  const typeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.parsed}%` } } }
  };

  const getStatusChipClass = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'completed') return 'status-chip completed';
    if (s === 'processing' || s === 'pending') return 'status-chip processing';
    if (s === 'failed') return 'status-chip failed';
    return 'status-chip';
  };

  const getTypeChipClass = (type) => {
    const t = String(type || '').toLowerCase();
    if (t.includes('invoice')) return 'type-chip invoice';
    if (t.includes('receipt')) return 'type-chip receipt';
    if (t.includes('bank')) return 'type-chip bank';
    return 'type-chip';
  };

  const getSeverityBadgeClass = (severity) => {
    const s = String(severity || '').toLowerCase();
    if (s === 'critical' || s === 'high') return 'sev-badge high';
    if (s === 'medium') return 'sev-badge medium';
    if (s === 'low') return 'sev-badge low';
    return 'sev-badge';
  };

  const getAlertIcon = (type) => {
    const t = String(type || '').toLowerCase();
    if (t.includes('duplicate')) return <FileText size={11} />;
    if (t.includes('amount') || t.includes('fraud')) return <BarChart2 size={11} />;
    return <Building2 size={11} />;
  };

  return (
    <div className="dashboard-redesign">
      <div className="date-bar">
        <div>
          <div className="greeting">Good morning, {user?.name?.split(' ')[0] || 'User'}</div>
          <div className="date-label">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · Finance Operations</div>
        </div>
        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
          <div className="date-selector">
            <Calendar size={14} />
            <select 
              value={days} 
              onChange={(e) => setDays(Number(e.target.value))}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: 'inherit', fontSize: 'inherit', cursor: 'pointer', appearance: 'none', paddingRight: '4px' }}
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last 365 days</option>
            </select>
            <ChevronDown size={14} style={{ pointerEvents: 'none', marginLeft: '-4px' }} />
          </div>
          <button className="upload-btn" onClick={() => navigate('/upload')}><Upload size={14} /> Upload document</button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon blue"><FileText size={16} /></div>
            <span className="stat-trend up">+12%</span>
          </div>
          <div className="stat-val">{isLoading ? '-' : totalDocuments}</div>
          <div className="stat-lbl">Documents uploaded</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon amber"><Copy size={16} /></div>
            <span className="stat-trend down">+4</span>
          </div>
          <div className="stat-val">{isLoading ? '-' : duplicateAlerts}</div>
          <div className="stat-lbl">Duplicates found</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon red"><AlertTriangle size={16} /></div>
            <span className="stat-trend down">High</span>
          </div>
          <div className="stat-val">{isLoading ? '-' : fraudAlerts}</div>
          <div className="stat-lbl">High-risk alerts</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green"><Clock size={16} /></div>
            <span className="stat-trend neutral">Pending</span>
          </div>
          <div className="stat-val">{isLoading ? '-' : pendingReviews}</div>
          <div className="stat-lbl">Pending reviews</div>
        </div>
      </div>

      <div className="middle-row">
        <div className="panel">
          <div className="panel-hdr">
            <span className="panel-title">Document activity</span>
            <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
              <div className="chart-legend" style={{margin: 0}}>
                <span className="legend-item"><span className="legend-dot" style={{background: '#1a56db'}}></span> Uploaded</span>
                <span className="legend-item"><span className="legend-dot" style={{background: '#f59e0b'}}></span> Duplicates</span>
                <span className="legend-item"><span className="legend-dot" style={{background: '#ef4444'}}></span> Alerts</span>
              </div>
              <button className="view-all">Export</button>
            </div>
          </div>
          <div className="chart-wrap">
            <div style={{position: 'relative', width: '100%', height: '180px'}}>
              <Bar data={activityData} options={activityOptions} />
            </div>
          </div>
        </div>

        <div className="panel" style={{display: 'flex', flexDirection: 'column'}}>
          <div className="panel-hdr">
            <span className="panel-title">Document types</span>
          </div>
          <div style={{padding: '0 18px', display: 'flex', gap: '12px', alignItems: 'center', flex: 1}}>
            <div style={{position: 'relative', width: '120px', height: '120px', flexShrink: 0}}>
              <Doughnut data={typeData} options={typeOptions} />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '8px', flex: 1}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <span style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-secondary, #6b7280)'}}>
                  <span style={{width: '8px', height: '8px', borderRadius: '2px', background: '#1a56db', display: 'inline-block'}}></span>Invoice
                </span>
                <span style={{fontSize: '12px', fontWeight: 500, color: 'var(--color-text-primary, #111827)'}}>60%</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <span style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-secondary, #6b7280)'}}>
                  <span style={{width: '8px', height: '8px', borderRadius: '2px', background: '#7c3aed', display: 'inline-block'}}></span>Bank stmt
                </span>
                <span style={{fontSize: '12px', fontWeight: 500, color: 'var(--color-text-primary, #111827)'}}>25%</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <span style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-secondary, #6b7280)'}}>
                  <span style={{width: '8px', height: '8px', borderRadius: '2px', background: '#059669', display: 'inline-block'}}></span>Receipt
                </span>
                <span style={{fontSize: '12px', fontWeight: 500, color: 'var(--color-text-primary, #111827)'}}>15%</span>
              </div>
              <div style={{marginTop: '4px', paddingTop: '8px', borderTop: '0.5px solid var(--color-border-tertiary, #e5e7eb)'}}>
                <div style={{fontSize: '11px', color: 'var(--color-text-secondary, #6b7280)'}}>Avg similarity score</div>
                <div style={{fontSize: '18px', fontWeight: 500, color: 'var(--color-text-primary, #111827)'}}>87.3%</div>
              </div>
            </div>
          </div>
          <div style={{height: '16px'}}></div>
        </div>
      </div>

      <div className="bottom-row">
        <div className="panel">
          <div className="panel-hdr">
            <span className="panel-title">Recent uploads</span>
            <button className="view-all" onClick={() => navigate('/documents')}>View all</button>
          </div>
          <div className="table-wrap">
            {errorMsg && <div style={{padding: '18px', color: '#B91C1C', fontSize: '12px'}}>{errorMsg}</div>}
            <table>
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
                  <tr><td colSpan="6" style={{textAlign: 'center'}}>Loading...</td></tr>
                ) : documents.length === 0 ? (
                  <tr><td colSpan="6" style={{textAlign: 'center'}}>No documents found</td></tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.id} onClick={() => navigate(`/documents/${doc.id}`)}>
                      <td><span className="doc-id">{doc.invoiceNumber || String(doc.id).slice(0, 8)}</span></td>
                      <td><span className="vendor-name">{doc.vendor || '—'}</span></td>
                      <td><span className={getTypeChipClass(doc.documentType)}>{doc.documentType || '—'}</span></td>
                      <td><span className={getStatusChipClass(doc.processingStatus)}>{doc.processingStatus || 'Unknown'}</span></td>
                      <td style={{color: 'var(--color-text-secondary, #6b7280)', fontSize: '12px'}}>
                        {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : '—'}
                      </td>
                      <td><button className="more-btn" onClick={(e) => { e.stopPropagation(); navigate(`/documents/${doc.id}`); }}><MoreVertical size={14} /></button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel alerts-panel">
          <div className="panel-hdr" style={{marginBottom: 0}}>
            <span className="panel-title">Active alerts</span>
            <button className="view-all" onClick={() => navigate('/alerts')}>View all</button>
          </div>
          <div className="alerts-tabs">
            <div className={`atab ${activeAlertTab === 'All' ? 'active' : ''}`} onClick={() => setActiveAlertTab('All')} style={{cursor: 'pointer'}}>All <span style={{background: '#EBF3FF', color: '#1E429F', borderRadius: '9999px', padding: '1px 5px', fontSize: '10px', marginLeft: '3px'}}>{activeAlerts.length}</span></div>
            <div className={`atab ${activeAlertTab === 'High' ? 'active' : ''}`} onClick={() => setActiveAlertTab('High')} style={{cursor: 'pointer'}}>High <span style={{background: '#FEE2E2', color: '#B91C1C', borderRadius: '9999px', padding: '1px 5px', fontSize: '10px', marginLeft: '3px'}}>{fraudAlerts}</span></div>
            <div className={`atab ${activeAlertTab === 'Medium' ? 'active' : ''}`} onClick={() => setActiveAlertTab('Medium')} style={{cursor: 'pointer'}}>Medium <span style={{background: '#FDF6B2', color: '#723B13', borderRadius: '9999px', padding: '1px 5px', fontSize: '10px', marginLeft: '3px'}}>{mediumAlerts}</span></div>
          </div>
          <div className="alert-list">
            {isLoading ? (
              <div style={{padding: '10px 18px', fontSize: '12px'}}>Loading...</div>
            ) : visibleActiveAlerts.length === 0 ? (
              <div style={{padding: '10px 18px', fontSize: '12px'}}>No active alerts.</div>
            ) : (
              visibleActiveAlerts.map(alert => (
                <div key={alert.id} className="alert-item" onClick={() => navigate('/alerts')}>
                  <span className={getSeverityBadgeClass(alert.severity)}>{String(alert.severity || '').toUpperCase()}</span>
                  <div className="alert-body">
                    <div className="alert-type">{alert.alertType}</div>
                    <div className="alert-desc">{alert.description}</div>
                    <div className="alert-meta">
                      {getAlertIcon(alert.alertType)} 
                      <span style={{marginLeft: '2px'}}>Alert ·</span>
                      <span className="status-new" style={{marginLeft: '4px'}}>NEW</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
