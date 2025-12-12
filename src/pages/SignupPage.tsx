import React from 'react';

const SignupPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-deep-space">
      <div className="w-full max-w-md p-8 bg-gradient-to-br from-nebula-blue/10 to-circuit-teal/10 rounded-lg border border-circuit-teal/20">
        <h1 className="text-3xl font-bold mb-6 text-center text-electric-cyan">Sign Up</h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-deep-space/50 border border-circuit-teal/30 rounded-lg focus:outline-none focus:border-electric-cyan"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 bg-deep-space/50 border border-circuit-teal/30 rounded-lg focus:outline-none focus:border-electric-cyan"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-deep-space/50 border border-circuit-teal/30 rounded-lg focus:outline-none focus:border-electric-cyan"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-circuit-teal text-white rounded-lg hover:bg-electric-cyan transition font-medium"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
