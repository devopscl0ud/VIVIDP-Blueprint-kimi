import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-deep-space">
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-electric-cyan mb-4 animate-slide-up">
          Welcome to VividP
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          The AI-Native Internal Developer Platform for Elite Engineering Teams
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-8 py-3 bg-circuit-teal text-white rounded-lg hover:bg-electric-cyan transition">
            Get Started
          </button>
          <button className="px-8 py-3 border border-circuit-teal text-circuit-teal rounded-lg hover:bg-circuit-teal/10 transition">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
