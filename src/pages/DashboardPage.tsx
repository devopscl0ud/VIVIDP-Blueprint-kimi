import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-electric-cyan">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 bg-nebula-blue/10 border border-circuit-teal/20 rounded-lg hover:border-electric-cyan transition"
          >
            <h3 className="text-lg font-semibold text-electric-cyan mb-2">Metric {i}</h3>
            <p className="text-3xl font-bold text-white">0</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
