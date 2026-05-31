import React, { useEffect, useState } from 'react';
import './ScoreRing.css';

const ScoreRing = ({ score, size = 'md' }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    // Respect prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setAnimatedScore(score);
    } else {
      let start = 0;
      const duration = 500;
      const startTime = performance.now();
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (easeOutQuad)
        const easeProgress = progress * (2 - progress);
        setAnimatedScore(Math.round(easeProgress * score * 100) / 100);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [score]);

  const sizeMap = {
    sm: { width: 48, strokeWidth: 4, textClass: 'score-text-sm' },
    md: { width: 64, strokeWidth: 5, textClass: 'score-text-md' },
    lg: { width: 80, strokeWidth: 6, textClass: 'score-text-lg' }
  };

  const { width, strokeWidth, textClass } = sizeMap[size] || sizeMap.md;
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedScore * circumference);

  let colorClass = 'score-gray';
  if (animatedScore >= 0.85) colorClass = 'score-green';
  else if (animatedScore >= 0.70) colorClass = 'score-amber';
  else if (animatedScore >= 0.60) colorClass = 'score-yellow';

  return (
    <div className={`score-ring ${colorClass}`} style={{ width, height: width }}>
      <svg width={width} height={width} viewBox={`0 0 ${width} ${width}`}>
        <circle
          className="score-ring-bg"
          cx={width / 2}
          cy={width / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="score-ring-progress"
          cx={width / 2}
          cy={width / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${width/2} ${width/2})`}
        />
      </svg>
      <div className={`score-ring-text ${textClass}`}>
        {Math.round(animatedScore * 100)}%
      </div>
    </div>
  );
};

export default ScoreRing;
