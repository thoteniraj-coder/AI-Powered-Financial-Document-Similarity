import React from 'react';
import './StatCard.css';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function StatCard({ title, value, icon: Icon, trend, colorClass = 'navy' }) {
  return (
    <div className={`card stat-card stat-card-${colorClass}`}>
      <div className="stat-card-header">
        <div className={`stat-icon-wrapper text-${colorClass}`}>
          <Icon size={20} />
        </div>
        {trend && (
          <div className={`stat-trend ${trend.direction === 'up' ? 'trend-up' : trend.direction === 'down' ? 'trend-down' : 'trend-neutral'}`}>
            {trend.direction === 'up' && <TrendingUp size={14} />}
            {trend.direction === 'down' && <TrendingDown size={14} />}
            {trend.direction === 'neutral' && <Minus size={14} />}
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
      <div className="stat-card-body">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
}
