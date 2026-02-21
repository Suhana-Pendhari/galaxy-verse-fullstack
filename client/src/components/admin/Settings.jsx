import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCog, FaPalette, FaBell, FaLock, 
  FaDatabase, FaServer, FaMailBulk, FaGlobe,
  FaSave, FaRedo, FaShieldAlt
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'GalaxyVerse',
    siteDescription: 'Your gateway to the cosmos',
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerification: true,

    // Appearance
    theme: 'dark',
    primaryColor: '#6b21a5',
    accentColor: '#f59e0b',
    showStars: true,
    animationsEnabled: true,

    // Security
    twoFactorAuth: false,
    sessionTimeout: 30, // minutes
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireStrongPassword: true,

    // Email
    smtpServer: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: 'noreply@galaxyverse.com',
    smtpPassword: '********',
    senderEmail: 'noreply@galaxyverse.com',
    senderName: 'GalaxyVerse',

    // API Settings
    nasaApiKey: 'DEMO_KEY',
    spacexApiEnabled: true,
    cacheEnabled: true,
    cacheDuration: 3600, // seconds

    // Rate Limiting
    rateLimitEnabled: true,
    rateLimitWindow: 15, // minutes
    rateLimitMax: 100, // requests per window

    // Backup
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30, // days

    // Performance
    imageCompression: true,
    maxUploadSize: 5, // MB
    lazyLoading: true,
    cdnEnabled: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: <FaCog /> },
    { id: 'appearance', label: 'Appearance', icon: <FaPalette /> },
    { id: 'security', label: 'Security', icon: <FaLock /> },
    { id: 'email', label: 'Email', icon: <FaMailBulk /> },
    { id: 'api', label: 'API', icon: <FaGlobe /> },
    { id: 'performance', label: 'Performance', icon: <FaServer /> },
    { id: 'backup', label: 'Backup', icon: <FaDatabase /> },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('Settings saved successfully');
    setIsSaving(false);
  };

  const handleReset = () => {
    if (window.confirm('Reset all settings to default?')) {
      toast.success('Settings reset to default');
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success('Connection test successful');
    setIsTesting(false);
  };

  const renderGeneral = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Site Name
        </label>
        <input
          type="text"
          value={settings.siteName}
          onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
          className="w-full px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Site Description
        </label>
        <textarea
          value={settings.siteDescription}
          onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
          rows="3"
          className="w-full px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center justify-between p-3 bg-cosmic-light/30 rounded-lg">
          <div>
            <p className="font-medium">Maintenance Mode</p>
            <p className="text-sm text-gray-400">Put the site in maintenance mode</p>
          </div>
          <input
            type="checkbox"
            checked={settings.maintenanceMode}
            onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
            className="form-checkbox h-5 w-5 text-cosmic-accent"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-cosmic-light/30 rounded-lg">
          <div>
            <p className="font-medium">User Registration</p>
            <p className="text-sm text-gray-400">Allow new users to register</p>
          </div>
          <input
            type="checkbox"
            checked={settings.registrationEnabled}
            onChange={(e) => setSettings({ ...settings, registrationEnabled: e.target.checked })}
            className="form-checkbox h-5 w-5 text-cosmic-accent"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-cosmic-light/30 rounded-lg">
          <div>
            <p className="font-medium">Email Verification</p>
            <p className="text-sm text-gray-400">Require email verification for new accounts</p>
          </div>
          <input
            type="checkbox"
            checked={settings.emailVerification}
            onChange={(e) => setSettings({ ...settings, emailVerification: e.target.checked })}
            className="form-checkbox h-5 w-5 text-cosmic-accent"
          />
        </label>
      </div>
    </div>
  );

  const renderAppearance = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Theme
        </label>
        <select
          value={settings.theme}
          onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
          className="w-full px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="cosmic">Cosmic (Default)</option>
          <option value="auto">Auto (System)</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Primary Color
          </label>
          <div className="flex space-x-2">
            <input
              type="color"
              value={settings.primaryColor}
              onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
              className="h-10 w-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={settings.primaryColor}
              onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
              className="flex-1 px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Accent Color
          </label>
          <div className="flex space-x-2">
            <input
              type="color"
              value={settings.accentColor}
              onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
              className="h-10 w-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={settings.accentColor}
              onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
              className="flex-1 px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center justify-between p-3 bg-cosmic-light/30 rounded-lg">
          <div>
            <p className="font-medium">Show Stars Background</p>
            <p className="text-sm text-gray-400">Display animated stars in background</p>
          </div>
          <input
            type="checkbox"
            checked={settings.showStars}
            onChange={(e) => setSettings({ ...settings, showStars: e.target.checked })}
            className="form-checkbox h-5 w-5 text-cosmic-accent"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-cosmic-light/30 rounded-lg">
          <div>
            <p className="font-medium">Enable Animations</p>
            <p className="text-sm text-gray-400">Use animations and transitions</p>
          </div>
          <input
            type="checkbox"
            checked={settings.animationsEnabled}
            onChange={(e) => setSettings({ ...settings, animationsEnabled: e.target.checked })}
            className="form-checkbox h-5 w-5 text-cosmic-accent"
          />
        </label>
      </div>

      {/* Preview */}
      <div className="mt-4 p-4 bg-cosmic-light/30 rounded-lg">
        <p className="text-sm font-medium mb-2">Preview</p>
        <div 
          className="p-4 rounded-lg"
          style={{ 
            backgroundColor: settings.theme === 'light' ? '#ffffff' : '#1a1a2e',
            color: settings.theme === 'light' ? '#000000' : '#ffffff'
          }}
        >
          <button
            className="px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: settings.primaryColor }}
          >
            Primary Button
          </button>
          <button
            className="ml-2 px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: settings.accentColor }}
          >
            Accent Button
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-4">
      <label className="flex items-center justify-between p-3 bg-cosmic-light/30 rounded-lg">
        <div>
          <p className="font-medium">Two-Factor Authentication</p>
          <p className="text-sm text-gray-400">Require 2FA for admin accounts</p>
        </div>
        <input
          type="checkbox"
          checked={settings.twoFactorAuth}
          onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
          className="form-checkbox h-5 w-5 text-cosmic-accent"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
            min="5"
            max="480"
            className="w-full px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Max Login Attempts
          </label>
          <input
            type="number"
            value={settings.maxLoginAttempts}
            onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
            min="3"
            max="10"
            className="w-full px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Minimum Password Length
          </label>
          <input
            type="number"
            value={settings.passwordMinLength}
            onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) })}
            min="6"
            max="20"
            className="w-full px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          />
        </div>
      </div>

      <label className="flex items-center justify-between p-3 bg-cosmic-light/30 rounded-lg">
        <div>
          <p className="font-medium">Require Strong Passwords</p>
          <p className="text-sm text-gray-400">Enforce strong password requirements</p>
        </div>
        <input
          type="checkbox"
          checked={settings.requireStrongPassword}
          onChange={(e) => setSettings({ ...settings, requireStrongPassword: e.target.checked })}
          className="form-checkbox h-5 w-5 text-cosmic-accent"
        />
      </label>
    </div>
  );

  const renderEmail = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            SMTP Server
          </label>
          <input
            type="text"
            value={settings.smtpServer}
            onChange={(e) => setSettings({ ...settings, smtpServer: e.target.value })}
            className="w-full px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            SMTP Port
          </label>
          <input
            type="number"
            value={settings.smtpPort}
            onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            SMTP Username
          </label>
          <input
            type="text"
            value={settings.smtpUsername}
            onChange={(e) => setSettings({ ...settings, smtpUsername: e.target.value })}
            className="w-full px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            SMTP Password
          </label>
          <input
            type="password"
            value={settings.smtpPassword}
            onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
            className="w-full px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sender Email
          </label>
          <input
            type="email"
            value={settings.senderEmail}
            onChange={(e) => setSettings({ ...settings, senderEmail: e.target.value })}
            className="w-full px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sender Name
          </label>
          <input
            type="text"
            value={settings.senderName}
            onChange={(e) => setSettings({ ...settings, senderName: e.target.value })}
            className="w-full px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          />
        </div>
      </div>

      <button
        onClick={handleTestConnection}
        disabled={isTesting}
        className="px-4 py-2 bg-cosmic-primary text-white rounded-lg hover:bg-cosmic-primary/80 transition-colors disabled:opacity-50"
      >
        {isTesting ? 'Testing...' : 'Test Connection'}
      </button>
    </div>
  );

  const renderAPI = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          NASA API Key
        </label>
        <input
          type="text"
          value={settings.nasaApiKey}
          onChange={(e) => setSettings({ ...settings, nasaApiKey: e.target.value })}
          className="w-full px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
        />
        <p className="text-xs text-gray-500 mt-1">Get your API key from api.nasa.gov</p>
      </div>

      <label className="flex items-center justify-between p-3 bg-cosmic-light/30 rounded-lg">
        <div>
          <p className="font-medium">SpaceX API</p>
          <p className="text-sm text-gray-400">Enable SpaceX mission data</p>
        </div>
        <input
          type="checkbox"
          checked={settings.spacexApiEnabled}
          onChange={(e) => setSettings({ ...settings, spacexApiEnabled: e.target.checked })}
          className="form-checkbox h-5 w-5 text-cosmic-accent"
        />
      </label>

      <label className="flex items-center justify-between p-3 bg-cosmic-light/30 rounded-lg">
        <div>
          <p className="font-medium">Enable Caching</p>
          <p className="text-sm text-gray-400">Cache API responses for better performance</p>
        </div>
        <input
          type="checkbox"
          checked={settings.cacheEnabled}
          onChange={(e) => setSettings({ ...settings, cacheEnabled: e.target.checked })}
          className="form-checkbox h-5 w-5 text-cosmic-accent"
        />
      </label>

      {settings.cacheEnabled && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Cache Duration (seconds)
          </label>
          <input
            type="number"
            value={settings.cacheDuration}
            onChange={(e) => setSettings({ ...settings, cacheDuration: parseInt(e.target.value) })}
            min="60"
            max="86400"
            className="w-full px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          />
        </div>
      )}
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Rate Limit Window (minutes)
          </label>
          <input
            type="number"
            value={settings.rateLimitWindow}
            onChange={(e) => setSettings({ ...settings, rateLimitWindow: parseInt(e.target.value) })}
            min="1"
            max="60"
            className="w-full px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Rate Limit Max Requests
          </label>
          <input
            type="number"
            value={settings.rateLimitMax}
            onChange={(e) => setSettings({ ...settings, rateLimitMax: parseInt(e.target.value) })}
            min="10"
            max="1000"
            className="w-full px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Max Upload Size (MB)
          </label>
          <input
            type="number"
            value={settings.maxUploadSize}
            onChange={(e) => setSettings({ ...settings, maxUploadSize: parseInt(e.target.value) })}
            min="1"
            max="100"
            className="w-full px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
          />
        </div>
      </div>

      <label className="flex items-center justify-between p-3 bg-cosmic-light/30 rounded-lg">
        <div>
          <p className="font-medium">Enable Rate Limiting</p>
          <p className="text-sm text-gray-400">Protect API from excessive requests</p>
        </div>
        <input
          type="checkbox"
          checked={settings.rateLimitEnabled}
          onChange={(e) => setSettings({ ...settings, rateLimitEnabled: e.target.checked })}
          className="form-checkbox h-5 w-5 text-cosmic-accent"
        />
      </label>

      <label className="flex items-center justify-between p-3 bg-cosmic-light/30 rounded-lg">
        <div>
          <p className="font-medium">Image Compression</p>
          <p className="text-sm text-gray-400">Compress uploaded images</p>
        </div>
        <input
          type="checkbox"
          checked={settings.imageCompression}
          onChange={(e) => setSettings({ ...settings, imageCompression: e.target.checked })}
          className="form-checkbox h-5 w-5 text-cosmic-accent"
        />
      </label>

      <label className="flex items-center justify-between p-3 bg-cosmic-light/30 rounded-lg">
        <div>
          <p className="font-medium">Lazy Loading</p>
          <p className="text-sm text-gray-400">Lazy load images and components</p>
        </div>
        <input
          type="checkbox"
          checked={settings.lazyLoading}
          onChange={(e) => setSettings({ ...settings, lazyLoading: e.target.checked })}
          className="form-checkbox h-5 w-5 text-cosmic-accent"
        />
      </label>

      <label className="flex items-center justify-between p-3 bg-cosmic-light/30 rounded-lg">
        <div>
          <p className="font-medium">Enable CDN</p>
          <p className="text-sm text-gray-400">Serve assets from CDN</p>
        </div>
        <input
          type="checkbox"
          checked={settings.cdnEnabled}
          onChange={(e) => setSettings({ ...settings, cdnEnabled: e.target.checked })}
          className="form-checkbox h-5 w-5 text-cosmic-accent"
        />
      </label>
    </div>
  );

  const renderBackup = () => (
    <div className="space-y-4">
      <label className="flex items-center justify-between p-3 bg-cosmic-light/30 rounded-lg">
        <div>
          <p className="font-medium">Automatic Backup</p>
          <p className="text-sm text-gray-400">Schedule automatic database backups</p>
        </div>
        <input
          type="checkbox"
          checked={settings.autoBackup}
          onChange={(e) => setSettings({ ...settings, autoBackup: e.target.checked })}
          className="form-checkbox h-5 w-5 text-cosmic-accent"
        />
      </label>

      {settings.autoBackup && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Backup Frequency
            </label>
            <select
              value={settings.backupFrequency}
              onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
              className="w-full px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Backup Retention (days)
            </label>
            <input
              type="number"
              value={settings.backupRetention}
              onChange={(e) => setSettings({ ...settings, backupRetention: parseInt(e.target.value) })}
              min="1"
              max="365"
              className="w-full px-4 py-2 bg-cosmic-light border border-cosmic-primary/30 rounded-lg focus:outline-none focus:border-cosmic-accent"
            />
          </div>
        </>
      )}

      <div className="mt-6 p-4 bg-cosmic-light/30 rounded-lg">
        <h3 className="font-semibold mb-2">Manual Backup</h3>
        <p className="text-sm text-gray-400 mb-4">Create a backup of the database now</p>
        <button
          onClick={() => toast.success('Backup started')}
          className="px-4 py-2 bg-cosmic-primary text-white rounded-lg hover:bg-cosmic-primary/80 transition-colors"
        >
          Create Backup Now
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-orbitron font-bold bg-gradient-to-r from-cosmic-primary to-cosmic-accent bg-clip-text text-transparent">
        System Settings
      </h1>

      <div className="flex space-x-2 border-b border-cosmic-primary/30 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-cosmic-primary text-white'
                : 'hover:bg-cosmic-primary/20 text-gray-400'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="cosmic-card p-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'general' && renderGeneral()}
          {activeTab === 'appearance' && renderAppearance()}
          {activeTab === 'security' && renderSecurity()}
          {activeTab === 'email' && renderEmail()}
          {activeTab === 'api' && renderAPI()}
          {activeTab === 'performance' && renderPerformance()}
          {activeTab === 'backup' && renderBackup()}
        </motion.div>

        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-cosmic-primary/30">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 border border-cosmic-primary/30 rounded-lg hover:bg-cosmic-primary/20 transition-colors"
          >
            <FaRedo />
            <span>Reset to Default</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-6 py-2 bg-cosmic-primary text-white rounded-lg hover:bg-cosmic-primary/80 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FaSave />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
