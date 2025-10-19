import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Top Navigation */}
      <nav className="bg-dark-surface border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gradient-primary">
                AIxCyber
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="btn-ghost">
                Notifications
              </button>
              <button className="btn-ghost">
                Profile
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
