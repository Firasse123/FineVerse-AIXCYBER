import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAvatar } from '../context/AvatarContext';
import { toast } from 'react-hot-toast';

const AvatarProgression = () => {
  const { avatar, fetchProgression, updateSkill, addXP } = useAvatar();
  const [progression, setProgression] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSkill, setActiveSkill] = useState(null);
  const [skillPointsToAdd, setSkillPointsToAdd] = useState(1);

  useEffect(() => {
    loadProgression();
  }, []);

  const loadProgression = async () => {
    try {
      const data = await fetchProgression();
      setProgression(data);
    } catch (error) {
      console.error('Failed to load progression:', error);
    }
  };

  const handleSkillUpdate = async (skillType) => {
    if (!progression || progression.totalSkillPoints < skillPointsToAdd) {
      toast.error('Insufficient skill points');
      return;
    }

    setIsLoading(true);
    try {
      await updateSkill(skillType, skillPointsToAdd);
      await loadProgression(); // Reload to get updated data
      toast.success(`${skillPointsToAdd} points added to ${skillType}!`);
    } catch (error) {
      console.error('Failed to update skill:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddXP = async () => {
    setIsLoading(true);
    try {
      await addXP(100, 'demo', 'Demo XP gain');
      await loadProgression(); // Reload to get updated data
    } catch (error) {
      console.error('Failed to add XP:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const skills = [
    {
      id: 'technicalAnalysis',
      name: 'Technical Analysis',
      description: 'Chart reading and technical indicators',
      icon: '📊',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'fundamentalAnalysis',
      name: 'Fundamental Analysis',
      description: 'Company financials and market research',
      icon: '📈',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'riskManagement',
      name: 'Risk Management',
      description: 'Portfolio protection and position sizing',
      icon: '🛡️',
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'cybersecurity',
      name: 'Cybersecurity',
      description: 'Security awareness and threat detection',
      icon: '🔒',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'marketSentiment',
      name: 'Market Sentiment',
      description: 'Understanding market psychology',
      icon: '🧠',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 'portfolioOptimization',
      name: 'Portfolio Optimization',
      description: 'Asset allocation and rebalancing',
      icon: '⚖️',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  if (!avatar || !progression) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-dark-text-muted">Loading progression...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient-primary mb-2">
            Avatar Progression
          </h1>
          <p className="text-dark-text-muted">
            Track your growth and allocate skill points
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Level & XP */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-lg font-semibold text-dark-text mb-4">Level Progress</h3>
              
              {/* Level Display */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{progression.level}</span>
                </div>
                <h4 className="text-xl font-semibold text-dark-text">Level {progression.level}</h4>
                <p className="text-dark-text-muted">{progression.xp} XP</p>
              </div>

              {/* XP Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-dark-text-muted mb-2">
                  <span>Progress to Level {progression.level + 1}</span>
                  <span>{Math.round(progression.xpProgress * 100)}%</span>
                </div>
                <div className="w-full bg-dark-surface rounded-full h-3">
                  <motion.div
                    className="bg-gradient-primary h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progression.xpProgress * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex justify-between text-xs text-dark-text-muted mt-1">
                  <span>{progression.xp} XP</span>
                  <span>{progression.nextLevelXP} XP</span>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-dark-text-muted">Reputation:</span>
                  <span className="text-dark-text font-medium">{progression.reputationScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-text-muted">Skill Points:</span>
                  <span className="text-dark-text font-medium">{progression.totalSkillPoints}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-text-muted">Skill Level:</span>
                  <span className="text-dark-text font-medium">{progression.skillLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-text-muted">Badges:</span>
                  <span className="text-dark-text font-medium">{progression.badges.length}</span>
                </div>
              </div>

              {/* Demo XP Button */}
              <button
                onClick={handleAddXP}
                disabled={isLoading}
                className="btn-secondary w-full mt-4"
              >
                {isLoading ? 'Adding XP...' : '+100 Demo XP'}
              </button>
            </div>
          </div>

          {/* Skills */}
          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-lg font-semibold text-dark-text mb-4">Skills</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.map((skill) => {
                  const skillData = progression.skills[skill.id] || { level: 0, points: 0 };
                  const isMaxLevel = skillData.level >= 10;
                  
                  return (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border transition-all ${
                        activeSkill === skill.id
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-dark-border bg-dark-surface hover:border-primary-500/50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${skill.color} flex items-center justify-center text-white text-xl`}>
                          {skill.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-dark-text">{skill.name}</h4>
                          <p className="text-sm text-dark-text-muted mb-2">{skill.description}</p>
                          
                          {/* Skill Level */}
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm text-dark-text-muted">Level:</span>
                            <span className="text-sm font-medium text-dark-text">{skillData.level}</span>
                            <div className="flex-1 bg-dark-surface rounded-full h-2">
                              <div
                                className={`bg-gradient-to-r ${skill.color} h-2 rounded-full`}
                                style={{ width: `${(skillData.points % 100) / 100 * 100}%` }}
                              />
                            </div>
                          </div>

                          {/* Skill Points */}
                          <div className="flex justify-between text-sm mb-3">
                            <span className="text-dark-text-muted">Points:</span>
                            <span className="text-dark-text">{skillData.points}</span>
                          </div>

                          {/* Skill Controls */}
                          {!isMaxLevel && progression.totalSkillPoints > 0 && (
                            <div className="flex items-center space-x-2">
                              <select
                                value={skillPointsToAdd}
                                onChange={(e) => setSkillPointsToAdd(parseInt(e.target.value))}
                                className="input text-sm py-1 px-2 w-16"
                              >
                                {[1, 2, 3, 4, 5].map(num => (
                                  <option key={num} value={num}>{num}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleSkillUpdate(skill.id)}
                                disabled={isLoading || progression.totalSkillPoints < skillPointsToAdd}
                                className="btn-primary text-sm py-1 px-3"
                              >
                                Add Points
                              </button>
                            </div>
                          )}

                          {isMaxLevel && (
                            <div className="text-sm text-success-500 font-medium">
                              Max Level Reached!
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Badges */}
        {progression.badges.length > 0 && (
          <div className="mt-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-dark-text mb-4">Recent Badges</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {progression.badges.slice(-6).map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center p-3 rounded-lg border border-dark-border bg-dark-surface hover:border-primary-500/50 transition-all"
                  >
                    <div className="w-12 h-12 mx-auto mb-2 bg-gradient-accent rounded-full flex items-center justify-center text-white text-xl">
                      {badge.icon || '🏆'}
                    </div>
                    <h4 className="text-sm font-medium text-dark-text">{badge.name}</h4>
                    <p className="text-xs text-dark-text-muted">{badge.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarProgression;
