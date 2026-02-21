import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CountdownTimer = ({ launchDate }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = new Date(launchDate) - new Date();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [launchDate]);

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  const isLaunched = new Date(launchDate) <= new Date();

  if (isLaunched) {
    return (
      <div className="text-center">
        <span className="text-green-400 font-semibold">🚀 Launched</span>
      </div>
    );
  }

  return (
    <div className="flex gap-2 md:gap-4">
      {timeUnits.map((unit, index) => (
        <motion.div
          key={unit.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="text-center"
        >
          <div className="bg-cosmic-light rounded-lg p-2 md:p-3 min-w-[60px] md:min-w-[80px]">
            <motion.div
              key={unit.value}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-2xl md:text-3xl font-bold text-cosmic-accent"
            >
              {unit.value.toString().padStart(2, '0')}
            </motion.div>
            <div className="text-xs text-gray-400 mt-1">{unit.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default CountdownTimer;
