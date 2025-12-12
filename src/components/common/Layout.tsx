import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-deep-space">
      {/* Sidebar */}
      <aside className="w-64 border-r border-circuit-teal/20 bg-nebula-blue/5 p-6">
        <h2 className="text-2xl font-bold text-electric-cyan mb-8">VividP</h2>
        <nav className="space-y-2">
          <a href="#" className="block px-4 py-2 rounded hover:bg-circuit-teal/10 transition">
            Dashboard
          </a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-circuit-teal/10 transition">
            Analytics
          </a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-circuit-teal/10 transition">
            Security
          </a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-circuit-teal/10 transition">
            Settings
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="border-b border-circuit-teal/20 bg-nebula-blue/5 p-6">
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
