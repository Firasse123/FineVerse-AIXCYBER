import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useAvatar } from '../context/AvatarContext';
import AvatarCustomization from '../components/AvatarCustomization';
import AvatarProgression from '../components/AvatarProgression';
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { avatar, updateAvatarProfile, updateStatus } = useAvatar();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    status: '',
    statusMessage: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        bio: avatar?.bio || '',
        status: avatar?.status || 'online',
        statusMessage: avatar?.statusMessage || ''
      });
    }
  }, [user, avatar]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      // Update user profile
      await updateUser({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        username: profileData.username
      });

      // Update avatar profile
      await updateAvatarProfile({
        bio: profileData.bio,
        status: profileData.status,
        statusMessage: profileData.statusMessage
      });

      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        bio: avatar?.bio || '',
        status: avatar?.status || 'online',
        statusMessage: avatar?.statusMessage || ''
      });
    }
    setIsEditing(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'customization', label: 'Customization', icon: '🎨' },
    { id: 'progression', label: 'Progression', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const renderOverviewTab = () => {
    return (
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="card">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-dark-bg ${
                avatar?.status === 'online' ? 'bg-success-500' : 
                avatar?.status === 'away' ? 'bg-warning-500' : 'bg-error-500'
              }`}></div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <h2 className="text-2xl font-bold text-dark-text">
                  {profileData.firstName} {profileData.lastName}
                </h2>
                <span className="text-dark-text-muted">@{profileData.username}</span>
              </div>
              
              {avatar?.title && (
                <p className="text-primary-500 font-medium mb-2">{avatar.title}</p>
              )}
              
              <p className="text-dark-text-muted mb-4">
                {profileData.bio || 'No bio available'}
              </p>

              {/* Status */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-dark-text-muted">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  avatar?.status === 'online' ? 'bg-success-500/20 text-success-500' :
                  avatar?.status === 'away' ? 'bg-warning-500/20 text-warning-500' :
                  'bg-error-500/20 text-error-500'
                }`}>
                  {avatar?.status || 'offline'}
                </span>
                {avatar?.statusMessage && (
                  <span className="text-sm text-dark-text-muted">- {avatar.statusMessage}</span>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary-500 mb-1">{avatar?.level || 1}</div>
            <div className="text-sm text-dark-text-muted">Level</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-accent-500 mb-1">{avatar?.xp || 0}</div>
            <div className="text-sm text-dark-text-muted">XP</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-success-500 mb-1">{avatar?.reputationScore || 0}</div>
            <div className="text-sm text-dark-text-muted">Reputation</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-warning-500 mb-1">{avatar?.badges?.length || 0}</div>
            <div className="text-sm text-dark-text-muted">Badges</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-dark-text mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-dark-surface">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-sm">📈</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-dark-text">Completed KYC questionnaire</p>
                <p className="text-xs text-dark-text-muted">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-dark-surface">
              <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center">
                <span className="text-sm">🏆</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-dark-text">Earned "First Steps" badge</p>
                <p className="text-xs text-dark-text-muted">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-dark-surface">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-sm">⚡</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-dark-text">Gained 50 XP from tutorial</p>
                <p className="text-xs text-dark-text-muted">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSettingsTab = () => {
    return (
      <div className="space-y-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-dark-text mb-4">Profile Settings</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-text mb-1">First Name</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="input"
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-text mb-1">Last Name</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="input"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-text mb-1">Username</label>
              <input
                type="text"
                value={profileData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="input"
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-text mb-1">Bio</label>
              <textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="input"
                rows={3}
                disabled={!isEditing}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-text mb-1">Status</label>
              <select
                value={profileData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="input"
                disabled={!isEditing}
              >
                <option value="online">Online</option>
                <option value="away">Away</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-text mb-1">Status Message</label>
              <input
                type="text"
                value={profileData.statusMessage}
                onChange={(e) => handleInputChange('statusMessage', e.target.value)}
                className="input"
                disabled={!isEditing}
                placeholder="What are you up to?"
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelEdit}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="btn-primary"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'customization':
        return <AvatarCustomization />;
      case 'progression':
        return <AvatarProgression />;
      case 'settings':
        return renderSettingsTab();
      default:
        return null;
    }
  };

  if (!user || !avatar) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-dark-text-muted">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {profileData.firstName} {profileData.lastName}
              </h1>
              <p className="text-white/80">@{profileData.username}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4">
        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-dark-surface rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'text-dark-text-muted hover:text-dark-text hover:bg-dark-border'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfilePage;
