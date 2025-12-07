import React from 'react';
import { motion } from 'framer-motion';
import './GradientButton.css';

const GradientButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  className = '',
  icon,
  fullWidth = false
}) => {
  return (
    <motion.button
      className={`gradient-button ${variant} ${size} ${fullWidth ? 'full-width' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <span className="gradient-button-content">
        {icon && <span className="gradient-button-icon">{icon}</span>}
        {children}
      </span>
      <span className="gradient-button-shimmer"></span>
    </motion.button>
  );
};

export default GradientButton;

