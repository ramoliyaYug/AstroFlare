import React, { useEffect, useState } from 'react';
import { useSpring, animated } from 'framer-motion';

const AnimatedNumber = ({ value, decimals = 2, prefix = '', suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const formatNumber = (num) => {
    if (decimals === 0) return Math.round(num).toLocaleString();
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <animated.span>
      {prefix}{formatNumber(displayValue)}{suffix}
    </animated.span>
  );
};

export default AnimatedNumber;

