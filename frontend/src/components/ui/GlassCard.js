import React from 'react';
import { motion } from 'framer-motion';
import './GlassCard.css';

const GlassCard = ({ children, className = '', hover = true, glow = false, onClick }) => {
  return (
    <motion.div
      className={`glass-card ${className} ${glow ? 'glow' : ''}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? {
        y: -4,
        scale: 1.02,
        transition: { duration: 0.3 }
      } : {}}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;

