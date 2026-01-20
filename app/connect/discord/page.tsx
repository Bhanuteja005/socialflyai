'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConnectDiscord() {
  const router = useRouter();
  const [channelId, setChannelId] = useState('');
  const [channelName, setChannelName] = useState('');
  const [guildName, setGuildName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [botStatus, setBotStatus] = useState<{canAccess: boolean, message: string} | null>(null);
  const [checkingBot, setCheckingBot] = useState(false);

  const checkBotAccess = async (channelIdToCheck: string) => {
    if (!channelIdToCheck.trim()) {
      setBotStatus(null);
      return;
    }

    setCheckingBot(true);
    try {
      const response = await fetch(`/api/discord/test-token?channelId=${channelIdToCheck}`);
      const data = await response.json();
      
      if (data.success) {
        setBotStatus({ canAccess: true, message: 'Bot can access this channel ✓' });
      } else {
        setBotStatus({ canAccess: false, message: 'Bot cannot access this channel. Please add the bot to your server first.' });
      }
    } catch (error) {
      setBotStatus({ canAccess: false, message: 'Cannot verify bot access. Please add the bot to your server first.' });
    } finally {
      setCheckingBot(false);
    }
  };

  const generateInviteLink = () => {
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '1463080016488435786';
    const permissions = 2048 + 65536 + 16384; // Send Messages + Read Message History + Embed Links
    const scope = 'bot%20applications.commands';
    
    return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=${scope}`;
  };

  const handleChannelIdChange = (value: string) => {
    setChannelId(value);
    // Debounce the bot check
    setTimeout(() => {
      if (value.trim()) {
        checkBotAccess(value.trim());
      } else {
        setBotStatus(null);
      }
    }, 500);
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/discord/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'default-user',
        },
        body: JSON.stringify({
          channelId,
          channelName,
          guildName,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/dashboard'), 1500);
      } else {
        setError(data.error || 'Failed to connect Discord');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-500 rounded-full mx-auto flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Connect Discord</h2>
          <p className="text-gray-600 mt-2">Connect your Discord server to SocialFly AI</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">✓ Discord connected successfully! Redirecting...</p>
          </div>
        )}

        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Channel ID *
            </label>
            <input
              type="text"
              value={channelId}
              onChange={(e) => handleChannelIdChange(e.target.value)}
              placeholder="123456789012345678"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
            />
            <p className="mt-1 text-xs text-gray-500">
              Right-click on a channel → Copy Channel ID
            </p>
            {checkingBot && (
              <p className="mt-1 text-xs text-blue-600">
                Checking bot access...
              </p>
            )}
            {botStatus && (
              <div className={`mt-2 p-3 rounded-lg border ${
                botStatus.canAccess 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-yellow-50 border-yellow-200 text-yellow-800'
              }`}>
                <p className="text-sm font-medium">
                  {botStatus.message}
                </p>
                {!botStatus.canAccess && (
                  <div className="mt-3 space-y-3">
                    <button
                      type="button"
                      onClick={() => window.open(generateInviteLink(), '_blank')}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      Add Bot to Server
                    </button>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => checkBotAccess(channelId)}
                        disabled={checkingBot}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {checkingBot ? 'Checking...' : 'Check Status'}
                      </button>
                      <p className="text-xs text-yellow-700">
                        After adding the bot, click "Check Status" to verify access and enable connection.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            {botStatus && !botStatus.canAccess && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Connection disabled:</strong> The bot cannot access this channel. Please add the bot to your server using the button above, then click "Check Status" to verify access and enable the Connect button.
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Channel Name
            </label>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="general"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Server Name
            </label>
            <input
              type="text"
              value={guildName}
              onChange={(e) => setGuildName(e.target.value)}
              placeholder="My Discord Server"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Make sure your Discord bot is added to the server and has permission to send messages in the channel.
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !channelId || botStatus?.canAccess === false}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
