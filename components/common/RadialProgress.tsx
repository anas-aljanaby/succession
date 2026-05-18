

import React, { useState, useEffect } from 'react';

interface RadialProgressProps {
  value: number;
  label: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export const RadialProgress: React.FC<RadialProgressProps> = ({
  value,
  label,
  size = 120,
  strokeWidth = 10,
  color = 'stroke-primary-500',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (value / 100) * circumference;
  
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    // Animate the stroke offset on component mount or when value changes
    const animation = setTimeout(() => setOffset(targetOffset), 100);
    return () => clearTimeout(animation);
  }, [targetOffset]);


  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div style={{ width: size, height: size }} className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            className="stroke-gray-700"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            className={`${color} transition-all duration-1000 ease-out`}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{value}%</span>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-300 text-center">{label}</p>
    </div>
  );
};