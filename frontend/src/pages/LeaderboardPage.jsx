import React from 'react';

const LeaderboardPage = () => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-3xl font-bold text-gradient-primary mb-4">
          Leaderboard
        </h1>
        <p className="text-dark-text-muted">
          Compete with other players and climb the rankings
        </p>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Top Players</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-dark-surface rounded-lg">
            <span className="font-medium">#1 Player Name</span>
            <span className="text-accent-500 font-semibold">$1,234,567</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-dark-surface rounded-lg">
            <span className="font-medium">#2 Player Name</span>
            <span className="text-accent-500 font-semibold">$987,654</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-dark-surface rounded-lg">
            <span className="font-medium">#3 Player Name</span>
            <span className="text-accent-500 font-semibold">$765,432</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
