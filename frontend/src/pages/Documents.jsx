import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MoreVertical, Eye, FileSearch, Trash2 } from 'lucide-react';

import { StatusBadge } from '../components/common/StatusBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Button } from '../components/common/Button';
import './Documents.css';

const MOCK_DOCS = [
  { id: '1', filename: 'INV-2023-042_AcmeCorp.pdf', vendor: 'Acme Corp', type: 'invoice', status: 'approved', amount: '$4,250.00', date: 'Oct 15, 2023' },
  { id: '2', filename: 'PO-78902_TechFlow.pdf', vendor: 'TechFlow', type: 'purchase_order', status: 'pending', amount: '$3,800.00', date: 'Oct 14, 2023' },
  { id: '3', filename: 'Receipt_Uber_Oct.pdf', vendor: 'Uber', type: 'receipt', status: 'rejected', amount: '$45.50', date: 'Oct 12, 2023' },
  { id: '4', filename: 'Contract_GlobalSystems.docx', vendor: 'Global Systems', type: 'contract', status: 'approved', amount: '-', date: 'Oct 10, 2023' },
  { id: '5', filename: 'INV-2023-041_AcmeCorp_dup.pdf', vendor: 'Acme Corp', type: 'invoice', status: 'flagged', amount: '$4,250.00', date: 'Oct 09, 2023' },
];

const Documents = () => {
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState(null);
  
  return (
    <>
      <div className="documents-page">
        <div className="page-header">
          <h1 className="page-title">Documents</h1>
          <Button variant="primary" onClick={() => navigate('/upload')}>Upload New</Button>
        </div>

        <div className="docs-filter-bar">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search documents..." className="docs-search-input" />
          </div>
          <div className="filter-dropdowns">
            <select className="filter-select">
              <option value="">All Types</option>
              <option value="invoice">Invoice</option>
              <option value="receipt">Receipt</option>
              <option value="contract">Contract</option>
            </select>
            <select className="filter-select">
              <option value="">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="flagged">Flagged</option>
              <option value="rejected">Rejected</option>
            </select>
            <Button variant="outline"><Filter size={16} /> Filters</Button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Filename</th>
                <th>Vendor</th>
                <th>Type</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_DOCS.map(doc => (
                <tr key={doc.id}>
                  <td className="font-medium text-navy-900 cursor-pointer hover-underline" onClick={() => navigate(`/documents/${doc.id}`)}>
                    {doc.filename}
                  </td>
                  <td>{doc.vendor}</td>
                  <td className="capitalize">{doc.type.replace('_', ' ')}</td>
                  <td><StatusBadge status={doc.status} /></td>
                  <td className="monospace">{doc.amount}</td>
                  <td>{doc.date}</td>
                  <td className="text-right">
                    <div className="row-actions">
                      <button className="icon-btn" title="View" onClick={() => navigate(`/documents/${doc.id}`)}><Eye size={16} /></button>
                      <button className="icon-btn" title="Find Similar" onClick={() => navigate('/search')}><FileSearch size={16} /></button>
                      <button className="icon-btn danger" title="Delete" onClick={() => setDeleteId(doc.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="pagination">
          <span className="pagination-info">Showing 1-5 of 124 results</span>
          <div className="pagination-controls">
            <button className="page-btn disabled">Previous</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <span className="page-ellipsis">...</span>
            <button className="page-btn">Next</button>
          </div>
        </div>
      </div>
      
      <ConfirmDialog 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => setDeleteId(null)}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        confirmText="Delete"
        isDanger={true}
      />
    </>
  );
};

export default Documents;
