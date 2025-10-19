import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAvatar } from '../context/AvatarContext';
import { toast } from 'react-hot-toast';

const AvatarCustomization = () => {
  const { avatar, updateAppearance, fetchCustomization } = useAvatar();
  const [customization, setCustomization] = useState(null);
  const [currentAppearance, setCurrentAppearance] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('appearance');

  useEffect(() => {
    if (avatar) {
      setCurrentAppearance(avatar.appearance || {});
    }
  }, [avatar]);

  useEffect(() => {
    loadCustomizationData();
  }, []);

  const loadCustomizationData = async () => {
    try {
      const data = await fetchCustomization();
      setCustomization(data);
    } catch (error) {
      console.error('Failed to load customization data:', error);
    }
  };

  const handleAppearanceChange = (category, value) => {
    setCurrentAppearance(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleAccessoryToggle = (accessory) => {
    setCurrentAppearance(prev => {
      const currentAccessories = prev.accessories || [];
      const newAccessories = currentAccessories.includes(accessory)
        ? currentAccessories.filter(acc => acc !== accessory)
        : [...currentAccessories, accessory];
      
      return {
        ...prev,
        accessories: newAccessories
      };
    });
  };

  const saveAppearance = async () => {
    setIsLoading(true);
    try {
      await updateAppearance(currentAppearance);
      toast.success('Appearance saved successfully!');
    } catch (error) {
      console.error('Failed to save appearance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAppearance = () => {
    if (avatar?.appearance) {
      setCurrentAppearance(avatar.appearance);
    }
  };

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: '👤' },
    { id: 'personality', label: 'Personality', icon: '🧠' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
    { id: 'badges', label: 'Badges', icon: '🏆' }
  ];

  const renderAppearanceTab = () => {
    if (!customization) return null;

    return (
      <div className="space-y-6">
        {/* Skin Tone */}
        <div>
          <h3 className="text-lg font-semibold text-dark-text mb-3">Skin Tone</h3>
          <div className="grid grid-cols-5 gap-3">
            {customization.availableOptions.skinTones.map((tone) => (
              <button
                key={tone}
                onClick={() => handleAppearanceChange('skin', tone)}
                className={`p-3 rounded-lg border transition-all ${
                  currentAppearance.skin === tone
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-border bg-dark-surface hover:border-primary-500/50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full mx-auto mb-2 bg-${tone}-500`}></div>
                <span className="text-xs text-dark-text capitalize">{tone}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Hair */}
        <div>
          <h3 className="text-lg font-semibold text-dark-text mb-3">Hair</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-dark-text-muted mb-2">Color</h4>
              <div className="grid grid-cols-3 gap-2">
                {customization.availableOptions.hairColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleAppearanceChange('hair', { 
                      ...currentAppearance.hair, 
                      color 
                    })}
                    className={`p-2 rounded border transition-all ${
                      currentAppearance.hair?.color === color
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-dark-border bg-dark-surface hover:border-primary-500/50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full mx-auto bg-${color}-600`}></div>
                    <span className="text-xs text-dark-text capitalize">{color}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-dark-text-muted mb-2">Style</h4>
              <div className="space-y-2">
                {customization.availableOptions.hairStyles.map((style) => (
                  <button
                    key={style}
                    onClick={() => handleAppearanceChange('hair', { 
                      ...currentAppearance.hair, 
                      style 
                    })}
                    className={`w-full p-2 rounded border transition-all text-left ${
                      currentAppearance.hair?.style === style
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-dark-border bg-dark-surface hover:border-primary-500/50'
                    }`}
                  >
                    <span className="text-sm text-dark-text capitalize">{style}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Eyes */}
        <div>
          <h3 className="text-lg font-semibold text-dark-text mb-3">Eye Color</h3>
          <div className="grid grid-cols-5 gap-3">
            {customization.availableOptions.eyeColors.map((color) => (
              <button
                key={color}
                onClick={() => handleAppearanceChange('eyes', color)}
                className={`p-3 rounded-lg border transition-all ${
                  currentAppearance.eyes === color
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-border bg-dark-surface hover:border-primary-500/50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full mx-auto mb-2 bg-${color}-500`}></div>
                <span className="text-xs text-dark-text capitalize">{color}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Outfit */}
        <div>
          <h3 className="text-lg font-semibold text-dark-text mb-3">Outfit</h3>
          <div className="grid grid-cols-5 gap-3">
            {customization.availableOptions.outfits.map((outfit) => (
              <button
                key={outfit}
                onClick={() => handleAppearanceChange('outfit', outfit)}
                className={`p-3 rounded-lg border transition-all ${
                  currentAppearance.outfit === outfit
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-border bg-dark-surface hover:border-primary-500/50'
                }`}
              >
                <div className="w-8 h-8 rounded mx-auto mb-2 bg-gradient-to-br from-primary-500 to-accent-500"></div>
                <span className="text-xs text-dark-text capitalize">{outfit}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Accessories */}
        <div>
          <h3 className="text-lg font-semibold text-dark-text mb-3">Accessories</h3>
          <div className="grid grid-cols-5 gap-3">
            {customization.availableOptions.accessories.map((accessory) => (
              <button
                key={accessory}
                onClick={() => handleAccessoryToggle(accessory)}
                className={`p-3 rounded-lg border transition-all ${
                  currentAppearance.accessories?.includes(accessory)
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-border bg-dark-surface hover:border-primary-500/50'
                }`}
              >
                <div className="w-8 h-8 rounded mx-auto mb-2 bg-gradient-to-br from-accent-500 to-primary-500"></div>
                <span className="text-xs text-dark-text capitalize">{accessory}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Effects */}
        <div>
          <h3 className="text-lg font-semibold text-dark-text mb-3">Effects</h3>
          <div className="grid grid-cols-5 gap-3">
            {customization.availableOptions.effects.map((effect) => (
              <button
                key={effect}
                onClick={() => handleAppearanceChange('effects', effect)}
                className={`p-3 rounded-lg border transition-all ${
                  currentAppearance.effects === effect
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-dark-border bg-dark-surface hover:border-primary-500/50'
                }`}
              >
                <div className="w-8 h-8 rounded mx-auto mb-2 bg-gradient-to-br from-accent-500 to-primary-500"></div>
                <span className="text-xs text-dark-text capitalize">{effect}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPersonalityTab = () => {
    return (
      <div className="space-y-6">
        <div className="text-center text-dark-text-muted">
          <p>Personality customization coming soon!</p>
          <p className="text-sm">This will include trading style preferences and risk tolerance settings.</p>
        </div>
      </div>
    );
  };

  const renderSkillsTab = () => {
    return (
      <div className="space-y-6">
        <div className="text-center text-dark-text-muted">
          <p>Skills management coming soon!</p>
          <p className="text-sm">This will include skill point allocation and progression tracking.</p>
        </div>
      </div>
    );
  };

  const renderBadgesTab = () => {
    return (
      <div className="space-y-6">
        <div className="text-center text-dark-text-muted">
          <p>Badges showcase coming soon!</p>
          <p className="text-sm">This will display all earned achievements and badges.</p>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'appearance':
        return renderAppearanceTab();
      case 'personality':
        return renderPersonalityTab();
      case 'skills':
        return renderSkillsTab();
      case 'badges':
        return renderBadgesTab();
      default:
        return null;
    }
  };

  if (!avatar) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-dark-text-muted">Loading avatar...</p>
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
            Avatar Customization
          </h1>
          <p className="text-dark-text-muted">
            Customize your avatar's appearance and personality
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Avatar Preview */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <h3 className="text-lg font-semibold text-dark-text mb-4">Preview</h3>
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                  <span className="text-4xl">👤</span>
                </div>
                <h4 className="font-medium text-dark-text">{avatar.name}</h4>
                <p className="text-sm text-dark-text-muted">{avatar.title}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-text-muted">Level:</span>
                    <span className="text-dark-text">{avatar.level}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-text-muted">XP:</span>
                    <span className="text-dark-text">{avatar.xp}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-text-muted">Reputation:</span>
                    <span className="text-dark-text">{avatar.reputationScore}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customization Panel */}
          <div className="lg:col-span-3">
            <div className="card">
              {/* Tabs */}
              <div className="flex space-x-1 mb-6 bg-dark-surface rounded-lg p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary-500 text-white'
                        : 'text-dark-text-muted hover:text-dark-text hover:bg-dark-border'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span className="text-sm font-medium">{tab.label}</span>
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

              {/* Action Buttons */}
              {activeTab === 'appearance' && (
                <div className="flex justify-between mt-8 pt-6 border-t border-dark-border">
                  <button
                    onClick={resetAppearance}
                    className="btn-secondary"
                    disabled={isLoading}
                  >
                    Reset
                  </button>
                  <button
                    onClick={saveAppearance}
                    className="btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="spinner w-4 h-4 mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarCustomization;
