import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';
import { Button } from '../common/Button';
import './FilterSidebar.css';

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="filter-section">
      <button 
        className="filter-section-header" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="filter-section-title">{title}</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && <div className="filter-section-content">{children}</div>}
    </div>
  );
};

const FilterSidebar = ({ onApply, onClear, filters, activeCount = 0 }) => {
  const [localFilters, setLocalFilters] = useState(filters || {
    vendors: [],
    docTypes: [],
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    currency: 'Any'
  });

  const handleChange = (field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field, value) => {
    setLocalFilters(prev => {
      const current = prev[field];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  return (
    <div className="filter-sidebar">
      <div className="filter-sidebar-header">
        <div className="filter-sidebar-title-row">
          <Filter size={18} className="filter-icon" />
          <h3 className="filter-sidebar-title">Filters</h3>
          {activeCount > 0 && <span className="filter-count-badge">{activeCount}</span>}
        </div>
        <button className="clear-filters-btn" onClick={() => {
          setLocalFilters({ vendors: [], docTypes: [], dateFrom: '', dateTo: '', minAmount: '', maxAmount: '', currency: 'Any' });
          onClear();
        }}>
          Clear All
        </button>
      </div>

      <div className="filter-sidebar-body">
        <FilterSection title="Document Type">
          <div className="checkbox-list">
            {['invoice', 'receipt', 'contract', 'purchase_order'].map(type => (
              <label key={type} className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={localFilters.docTypes.includes(type)}
                  onChange={() => handleCheckboxChange('docTypes', type)}
                />
                <span className="checkbox-text">{type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Vendor">
          <input 
            type="text" 
            className="filter-input" 
            placeholder="Search vendors..." 
            onChange={(e) => {
              // Mock multiselect behavior with text input for now
              handleChange('vendors', e.target.value ? [e.target.value] : []);
            }}
          />
        </FilterSection>

        <FilterSection title="Date Range">
          <div className="filter-row">
            <input 
              type="date" 
              className="filter-input half" 
              value={localFilters.dateFrom}
              onChange={(e) => handleChange('dateFrom', e.target.value)}
            />
            <span className="filter-separator">to</span>
            <input 
              type="date" 
              className="filter-input half" 
              value={localFilters.dateTo}
              onChange={(e) => handleChange('dateTo', e.target.value)}
            />
          </div>
        </FilterSection>

        <FilterSection title="Amount">
          <div className="filter-row">
            <input 
              type="number" 
              className="filter-input half" 
              placeholder="Min" 
              value={localFilters.minAmount}
              onChange={(e) => handleChange('minAmount', e.target.value)}
            />
            <span className="filter-separator">-</span>
            <input 
              type="number" 
              className="filter-input half" 
              placeholder="Max" 
              value={localFilters.maxAmount}
              onChange={(e) => handleChange('maxAmount', e.target.value)}
            />
          </div>
          <select 
            className="filter-select mt-2" 
            value={localFilters.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
          >
            <option value="Any">Any Currency</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </FilterSection>
      </div>

      <div className="filter-sidebar-footer">
        <Button variant="primary" className="w-full" onClick={() => onApply(localFilters)}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterSidebar;
