// src/components/dashboard/Recommendations.js
import React from 'react';

const Recommendations = () => {
  const recommendations = [
    'Consider increasing irrigation during dry seasons.',
    'Try planting drought-resistant crops.',
    'Optimize fertilizer usage for better crop yield.',
  ];

  return (
    <div>
      <h3>Recommendations</h3>
      <ul>
        {recommendations.map((rec, index) => (
          <li key={index}>{rec}</li>
        ))}
      </ul>
    </div>
  );
};

export default Recommendations;
