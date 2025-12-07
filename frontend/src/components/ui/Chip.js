import React from 'react';
import { motion } from 'framer-motion';
import './Chip.css';

const Chip = ({ children, variant = 'default', size = 'md', className = '', icon }) => {
  return (
    <motion.div
      className={`chip ${variant} ${size} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {icon && <span className="chip-icon">{icon}</span>}
      <span>{children}</span>
    </motion.div>
  );
};

export default Chip;

