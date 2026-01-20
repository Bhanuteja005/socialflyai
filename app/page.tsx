'use client';

import { useState, useEffect } from 'react';
import { FaLinkedin, FaFacebook, FaDiscord, FaYoutube, FaTwitter, FaInstagram } from 'react-icons/fa';
import { SiBluesky, SiMastodon, SiPinterest } from 'react-icons/si';

interface SocialAccount {
  id: string;
  platform: string;
  accountName?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}

const platformConfig = {
  linkedin: {
    name: 'LinkedIn',
    icon: FaLinkedin,
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
  },
  facebook: {
    name: 'Facebook',
    icon: FaFacebook,
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
  },
  discord: {
    name: 'Discord',
    icon: FaDiscord,
    color: 'bg-indigo-500',
    hoverColor: 'hover:bg-indigo-600',
  },
  youtube: {
    name: 'YouTube',
    icon: FaYoutube,
    color: 'bg-red-600',
    hoverColor: 'hover:bg-red-700',
  },
  twitter: {
    name: 'Twitter / X',
    icon: FaTwitter,
    color: 'bg-black',
    hoverColor: 'hover:bg-gray-800',
  },
  instagram: {
    name: 'Instagram',
    icon: FaInstagram,
    color: 'bg-pink-500',
    hoverColor: 'hover:bg-pink-600',
  },
  bluesky: {
    name: 'Bluesky',
    icon: SiBluesky,
    color: 'bg-sky-500',
    hoverColor: 'hover:bg-sky-600',
  },
  mastodon: {
    name: 'Mastodon',
    icon: SiMastodon,
    color: 'bg-purple-600',
    hoverColor: 'hover:bg-purple-700',
  },
  pinterest: {
    name: 'Pinterest',
    icon: SiPinterest,
    color: 'bg-red-700',
    hoverColor: 'hover:bg-red-800',
  },
};

export default function Home() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await fetch('/api/social-accounts', {
        headers: {
          'x-user-id': 'default-user', // TODO: Implement proper auth
        },
      });
      const data = await response.json();
      if (data.success) {
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectPlatform = (platform: string) => {
    setSelectedPlatform(platform);
    setShowConnectionModal(true);
  };

  const connectedPlatforms = new Set(accounts.filter(a => a.isActive).map(a => a.platform));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">SF</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">SocialFly AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                + New Post
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Connected</div>
            <div className="text-3xl font-bold text-gray-900">{accounts.filter(a => a.isActive).length}/3</div>
            <div className="text-xs text-gray-500 mt-1">channels connected</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Queue</div>
            <div className="text-3xl font-bold text-gray-900">0</div>
            <div className="text-xs text-gray-500 mt-1">posts in queue</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Drafts</div>
            <div className="text-3xl font-bold text-gray-900">0</div>
            <div className="text-xs text-gray-500 mt-1">saved drafts</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Sent</div>
            <div className="text-3xl font-bold text-gray-900">0</div>
            <div className="text-xs text-gray-500 mt-1">posts published</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Channels Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Channels</h2>
                <p className="text-sm text-gray-500 mt-1">Connect your social accounts</p>
              </div>

              <div className="p-4">
                <div className="space-y-2">
                  {Object.entries(platformConfig).map(([platform, config]) => {
                    const isConnected = connectedPlatforms.has(platform);
                    const Icon = config.icon;

                    return (
                      <div key={platform} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 ${config.color} rounded-lg flex items-center justify-center`}>
                            <Icon className="text-white text-lg" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{config.name}</div>
                            {isConnected && (
                              <div className="text-xs text-green-600 flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                Connected
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleConnectPlatform(platform)}
                          className={`px-4 py-2 text-sm rounded-lg transition ${
                            isConnected
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : config.color + ' text-white ' + config.hoverColor
                          }`}
                        >
                          {isConnected ? 'Manage' : 'Connect'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Posts Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm min-h-96">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Welcome to SocialFly AI 👋</h2>
                <p className="text-sm text-gray-500 mt-1">
                  As an admin of this team, you can grant yourself access to your team's social channels, or connect your own channels.
                </p>
              </div>

              <div className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="mb-6">
                    <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                      <span className="text-4xl">📱</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Started</h3>
                    <p className="text-gray-600">
                      Connect your social media accounts to start posting and managing your content from one place.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowConnectionModal(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    + Connect a Channel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Modal */}
      {showConnectionModal && (
        <ConnectionModal
          platform={selectedPlatform}
          onClose={() => {
            setShowConnectionModal(false);
            setSelectedPlatform(null);
            loadAccounts();
          }}
        />
      )}
    </div>
  );
}

// Connection Modal Component
function ConnectionModal({ platform, onClose }: { platform: string | null; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (platform === 'linkedin') {
      handleLinkedInConnect();
    } else if (platform === 'twitter') {
      handleXConnect();
    } else if (platform === 'discord') {
      handleDiscordConnect();
    }
  }, [platform]);

  const handleLinkedInConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/linkedin/auth-url');
      const data = await response.json();
      if (data.authUrl) {
        setAuthUrl(data.authUrl);
      } else {
        setError(data.error || 'Failed to get LinkedIn auth URL');
      }
    } catch (err) {
      setError('Failed to connect to LinkedIn');
    } finally {
      setLoading(false);
    }
  };

  const handleXConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/x/auth-url');
      const data = await response.json();
      if (data.success && data.authUrl) {
        setAuthUrl(data.authUrl);
      } else {
        setError(data.error || 'Failed to get X auth URL');
      }
    } catch (err) {
      setError('Failed to connect to X');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscordConnect = () => {
    // Redirect to Discord connection page
    window.location.href = '/connect/discord';
  };

  const handleAuthorize = () => {
    if (authUrl) {
      window.open(authUrl, '_blank');
      onClose();
    }
  };

  if (!platform) return null;

  const config = platformConfig[platform as keyof typeof platformConfig];
  const Icon = config?.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {Icon && <Icon className={`text-2xl ${config.color.replace('bg-', 'text-')}`} />}
            <h3 className="text-xl font-semibold text-gray-900">
              Connect {config?.name || platform}
            </h3>
          </div>
        </div>

        <div className="p-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Preparing connection...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {authUrl && !loading && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Ready to Connect</h4>
                <p className="text-blue-800 text-sm">
                  Click "Authorize" to open {config?.name} and grant permissions to SocialFly AI.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Make sure you're logged into the correct account on {config?.name} before authorizing.
                </p>
              </div>
            </div>
          )}

          {!authUrl && !loading && !error && platform === 'discord' && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                You'll be redirected to configure your Discord bot connection.
              </p>
            </div>
          )}

          {!authUrl && !loading && !error && (platform === 'linkedin' || platform === 'twitter') && (
            <div className="text-center py-8">
              <p className="text-gray-600">
                Preparing {config?.name} connection...
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>

          {platform === 'discord' && (
            <button
              onClick={handleDiscordConnect}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Continue
            </button>
          )}

          {authUrl && (platform === 'linkedin' || platform === 'twitter') && (
            <button
              onClick={handleAuthorize}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Authorize {config?.name}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
