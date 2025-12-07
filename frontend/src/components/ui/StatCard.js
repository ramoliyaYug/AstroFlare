import React from 'react';
import { motion } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';
import './StatCard.css';

const StatCard = ({ 
  label, 
  value, 
  icon, 
  trend, 
  trendValue, 
  variant = 'default',
  className = ''
}) => {
  return (
    <motion.div
      className={`stat-card ${variant} ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      /* Removed hover effects */
    >
      <div className="stat-card-header">
        {icon && <div className="stat-card-icon">{icon}</div>}
        <span className="stat-card-label">{label}</span>
      </div>
      
      <div className="stat-card-value">
        {typeof value === 'number' && !isNaN(value) ? (
          <AnimatedNumber value={value} />
        ) : (
          <span>{value != null ? String(value) : 'N/A'}</span>
        )}
      </div>
      
      {trend && trendValue != null && (
        <div className={`stat-card-trend ${trend}`}>
          <span className="trend-icon">
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
          </span>
          <span>{String(trendValue)}</span>
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;

