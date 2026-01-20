'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('discord');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string>('');

  // Discord State
  const [discordChannelId, setDiscordChannelId] = useState('');
  const [discordContent, setDiscordContent] = useState('');
  const [discordFiles, setDiscordFiles] = useState<FileList | null>(null);

  // Facebook State
  const [fbMessage, setFbMessage] = useState('');
  const [fbLink, setFbLink] = useState('');
  const [fbFile, setFbFile] = useState<File | null>(null);
  const [fbDescription, setFbDescription] = useState('');

  // LinkedIn State
  const [liText, setLiText] = useState('');
  const [liImageUrl, setLiImageUrl] = useState('');

  // X (Twitter) State
  const [xAuthUrl, setXAuthUrl] = useState('');
  const [xCodeVerifier, setXCodeVerifier] = useState('');
  const [xCode, setXCode] = useState('');
  const [xAccessToken, setXAccessToken] = useState('');
  const [xTweetText, setXTweetText] = useState('');

  // YouTube State
  const [ytAuthUrl, setYtAuthUrl] = useState('');
  const [ytCode, setYtCode] = useState('');
  const [ytAccessToken, setYtAccessToken] = useState('');
  const [ytVideo, setYtVideo] = useState<File | null>(null);
  const [ytTitle, setYtTitle] = useState('');
  const [ytDescription, setYtDescription] = useState('');

  // Handle OAuth callbacks on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // X (Twitter) OAuth callback
    if (params.get('x_success') === 'true') {
      const code = params.get('code');
      const state = params.get('state');
      const storedVerifier = localStorage.getItem('x_code_verifier');
      
      if (code && storedVerifier) {
        // Automatically exchange code for token
        setActiveTab('x');
        setXCode(code);
        setXCodeVerifier(storedVerifier);
        
        // Exchange the code
        fetch('/api/x/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: code,
            code_verifier: storedVerifier,
          }),
        })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data && data.data.tokens) {
            setXAccessToken(data.data.tokens.access_token);
            setResponse({
              success: true,
              message: 'X (Twitter) authentication successful!',
              tokens: data.data.tokens
            });
            // Clean up - code can only be used once
            setXCode('');
            setXCodeVerifier('');
            localStorage.removeItem('x_code_verifier');
            localStorage.removeItem('x_state');
          } else {
            setError(data.error || data.details || 'Failed to exchange token');
          }
          window.history.replaceState({}, '', '/');
        })
        .catch(err => {
          setError(err.message || 'Failed to exchange token');
          window.history.replaceState({}, '', '/');
        });
      } else if (code && !storedVerifier) {
        // Code received but no verifier stored - allow manual exchange
        setActiveTab('x');
        setXCode(code);
        setResponse({
          success: false,
          message: 'Authorization code received. Please enter the code manually and click "Exchange Token"',
          code: code
        });
        window.history.replaceState({}, '', '/');
      }
    } else if (params.get('x_error')) {
      setActiveTab('x');
      const errorMsg = params.get('error_description') || params.get('x_error') || 'X authentication failed';
      setError(decodeURIComponent(errorMsg));
      window.history.replaceState({}, '', '/');
    }
    
    // YouTube OAuth callback
    if (params.get('youtube_success') === 'true') {
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      
      if (accessToken) {
        setYtAccessToken(accessToken);
        setActiveTab('youtube');
        setResponse({
          success: true,
          message: 'YouTube authentication successful!',
          tokens: { access_token: accessToken, refresh_token: refreshToken }
        });
        
        // Clean URL
        window.history.replaceState({}, '', '/');
      }
    } else if (params.get('youtube_error')) {
      setActiveTab('youtube');
      setError(params.get('youtube_error') || 'YouTube authentication failed');
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const clearMessages = () => {
    setResponse(null);
    setError('');
  };

  // Discord Functions
  const sendDiscordMessage = async () => {
    clearMessages();
    setLoading(true);
    try {
      const res = await fetch('/api/discord/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: discordChannelId,
          content: discordContent,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResponse(data);
      } else {
        setError(data.error || 'Failed to send message');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendDiscordMessageWithMedia = async () => {
    if (!discordFiles || discordFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }
    clearMessages();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('channelId', discordChannelId);
      formData.append('content', discordContent);
      for (let i = 0; i < discordFiles.length; i++) {
        formData.append('files', discordFiles[i]);
      }

      const res = await fetch('/api/discord/send-message-with-media', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setResponse(data);
      } else {
        setError(data.error || 'Failed to send message with media');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Facebook Functions
  const postToFacebook = async () => {
    clearMessages();
    setLoading(true);
    try {
      const res = await fetch('/api/facebook/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: fbMessage,
          link: fbLink,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResponse(data);
      } else {
        setError(data.error || 'Failed to post to Facebook');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadFacebookMedia = async () => {
    if (!fbFile) {
      setError('Please select a file');
      return;
    }
    clearMessages();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', fbFile);
      formData.append('description', fbDescription);

      const res = await fetch('/api/facebook/upload-media', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setResponse(data);
      } else {
        setError(data.error || 'Failed to upload media');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFacebookPosts = async () => {
    clearMessages();
    setLoading(true);
    try {
      const res = await fetch('/api/facebook/posts');
      const data = await res.json();
      if (res.ok) {
        setResponse(data);
      } else {
        setError(data.error || 'Failed to fetch posts');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // LinkedIn Functions
  const postLinkedInText = async () => {
    clearMessages();
    setLoading(true);
    try {
      const res = await fetch('/api/linkedin/text-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: liText }),
      });
      const data = await res.json();
      if (res.ok) {
        setResponse(data);
      } else {
        setError(data.error || 'Failed to post to LinkedIn');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const postLinkedInImage = async () => {
    clearMessages();
    setLoading(true);
    try {
      const res = await fetch('/api/linkedin/image-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: liText,
          imageUrl: liImageUrl,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResponse(data);
      } else {
        setError(data.error || 'Failed to post image to LinkedIn');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getLinkedInProfile = async () => {
    clearMessages();
    setLoading(true);
    try {
      const res = await fetch('/api/linkedin/profile');
      const data = await res.json();
      if (res.ok) {
        setResponse(data);
      } else {
        setError(data.error || 'Failed to fetch profile');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // X (Twitter) Functions
  const getXAuthUrl = async () => {
    clearMessages();
    setLoading(true);
    try {
      const res = await fetch('/api/x/auth-url');
      const data = await res.json();
      if (res.ok) {
        setXAuthUrl(data.data.url);
        setXCodeVerifier(data.data.code_verifier);
        // Store code_verifier in localStorage for callback (persists across tabs)
        localStorage.setItem('x_code_verifier', data.data.code_verifier);
        localStorage.setItem('x_state', data.data.state);
        setResponse(data);
      } else {
        setError(data.error || 'Failed to generate auth URL');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exchangeXToken = async () => {
    // Get code_verifier from state or localStorage
    let verifier = xCodeVerifier;
    if (!verifier) {
      verifier = localStorage.getItem('x_code_verifier') || '';
      if (verifier) {
        setXCodeVerifier(verifier);
      }
    }

    if (!xCode || !verifier) {
      setError('Missing authorization code or code verifier. Please click "Generate Auth URL" first.');
      return;
    }

    clearMessages();
    setLoading(true);
    try {
      const res = await fetch('/api/x/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: xCode,
          code_verifier: verifier,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data && data.data.tokens) {
        setXAccessToken(data.data.tokens.access_token);
        setResponse({
          success: true,
          message: 'X (Twitter) authentication successful!',
          tokens: data.data.tokens
        });
        // Clean up - code can only be used once
        setXCode('');
        setXCodeVerifier('');
        localStorage.removeItem('x_code_verifier');
        localStorage.removeItem('x_state');
      } else {
        setError(data.error || data.details || 'Failed to exchange token');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const postToX = async () => {
    clearMessages();
    setLoading(true);
    try {
      const res = await fetch('/api/x/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: xTweetText,
          accessToken: xAccessToken,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResponse(data);
      } else {
        setError(data.error || 'Failed to post tweet');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // YouTube Functions
  const getYouTubeAuthUrl = async () => {
    clearMessages();
    setLoading(true);
    try {
      const res = await fetch('/api/youtube/auth-url');
      const data = await res.json();
      if (res.ok) {
        setYtAuthUrl(data.url);
        setResponse(data);
      } else {
        setError(data.error || 'Failed to generate auth URL');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exchangeYouTubeToken = async () => {
    clearMessages();
    setLoading(true);
    try {
      const res = await fetch('/api/youtube/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: ytCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setYtAccessToken(data.tokens.access_token);
        setResponse(data);
      } else {
        setError(data.error || 'Failed to exchange token');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadToYouTube = async () => {
    if (!ytVideo) {
      setError('Please select a video file');
      return;
    }
    clearMessages();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('video', ytVideo);
      formData.append('title', ytTitle);
      formData.append('description', ytDescription);
      formData.append('accessToken', ytAccessToken);

      const res = await fetch('/api/youtube/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setResponse(data);
      } else {
        setError(data.error || 'Failed to upload video');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyYouTubeToken = async () => {
    if (!ytAccessToken) {
      setError('No access token available. Please authenticate first.');
      return;
    }
    clearMessages();
    setLoading(true);
    try {
      const res = await fetch('/api/youtube/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: ytAccessToken }),
      });
      const data = await res.json();
      if (res.ok) {
        setResponse(data);
      } else {
        setError(data.error || 'Token verification failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          SocialFly AI - Social Media Integration Testing
        </h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['discord', 'facebook', 'linkedin', 'x', 'youtube'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {/* Discord Tab */}
          {activeTab === 'discord' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Discord Integration</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Channel ID
                </label>
                <input
                  type="text"
                  value={discordChannelId}
                  onChange={(e) => setDiscordChannelId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter Discord Channel ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message Content
                </label>
                <textarea
                  value={discordContent}
                  onChange={(e) => setDiscordContent(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                  placeholder="Enter message content"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Files (for media message)
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setDiscordFiles(e.target.files)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={sendDiscordMessage}
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Send Text Message
                </button>
                <button
                  onClick={sendDiscordMessageWithMedia}
                  disabled={loading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  Send Message with Media
                </button>
              </div>
            </div>
          )}

          {/* Facebook Tab */}
          {activeTab === 'facebook' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Facebook Integration</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={fbMessage}
                  onChange={(e) => setFbMessage(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                  placeholder="Enter Facebook post message"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Link (optional)
                </label>
                <input
                  type="text"
                  value={fbLink}
                  onChange={(e) => setFbLink(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter link URL"
                />
              </div>

              <button
                onClick={postToFacebook}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Post to Facebook
              </button>

              <hr className="my-6 dark:border-gray-700" />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Media
                </label>
                <input
                  type="file"
                  onChange={(e) => setFbFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={fbDescription}
                  onChange={(e) => setFbDescription(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter media description"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={uploadFacebookMedia}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Upload Media
                </button>
                <button
                  onClick={getFacebookPosts}
                  disabled={loading}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                  Get Posts
                </button>
              </div>
            </div>
          )}

          {/* LinkedIn Tab */}
          {activeTab === 'linkedin' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">LinkedIn Integration</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Post Text
                </label>
                <textarea
                  value={liText}
                  onChange={(e) => setLiText(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                  placeholder="Enter LinkedIn post text"
                />
              </div>

              <button
                onClick={postLinkedInText}
                disabled={loading}
                className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50"
              >
                Post Text
              </button>

              <hr className="my-6 dark:border-gray-700" />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  value={liImageUrl}
                  onChange={(e) => setLiImageUrl(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter image URL"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={postLinkedInImage}
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Post Image
                </button>
                <button
                  onClick={getLinkedInProfile}
                  disabled={loading}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                  Get Profile
                </button>
              </div>
            </div>
          )}

          {/* X (Twitter) Tab */}
          {activeTab === 'x' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">X (Twitter) Integration</h2>

              <button
                onClick={getXAuthUrl}
                disabled={loading}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                Generate Auth URL
              </button>

              {xAuthUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Authorization URL
                  </label>
                  <a
                    href={xAuthUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {xAuthUrl}
                  </a>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Click the link above to authorize. You'll be redirected back automatically.
                  </p>
                </div>
              )}

              {xCodeVerifier && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    ✓ Code verifier stored (will be used automatically on callback)
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Authorization Code
                </label>
                <input
                  type="text"
                  value={xCode}
                  onChange={(e) => setXCode(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Paste authorization code here (auto-filled on callback)"
                />
              </div>

              <button
                onClick={exchangeXToken}
                disabled={loading || !xCode || !xCodeVerifier || !!xAccessToken}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {xAccessToken ? 'Already Authenticated' : 'Exchange Token (Validate)'}
              </button>

              {xAccessToken && (
                <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    ✓ Access Token Obtained! You can now post tweets.
                  </p>
                </div>
              )}

              <hr className="my-6 dark:border-gray-700" />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tweet Text
                </label>
                <textarea
                  value={xTweetText}
                  onChange={(e) => setXTweetText(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                  placeholder="What's happening?"
                  maxLength={280}
                />
                <p className="text-sm text-gray-500 mt-1">{xTweetText.length}/280</p>
              </div>

              <button
                onClick={postToX}
                disabled={loading || !xAccessToken}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                Post Tweet
              </button>
            </div>
          )}

          {/* YouTube Tab */}
          {activeTab === 'youtube' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">YouTube Integration</h2>

              <button
                onClick={getYouTubeAuthUrl}
                disabled={loading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Generate Auth URL
              </button>

              {ytAuthUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Authorization URL
                  </label>
                  <a
                    href={ytAuthUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {ytAuthUrl}
                  </a>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Authorization Code
                </label>
                <input
                  type="text"
                  value={ytCode}
                  onChange={(e) => setYtCode(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Paste authorization code here"
                />
              </div>

              <button
                onClick={exchangeYouTubeToken}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Exchange Token
              </button>

              {ytAccessToken && (
                <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Access Token Obtained!
                  </p>
                </div>
              )}

              <hr className="my-6 dark:border-gray-700" />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Video File
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setYtVideo(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Video Title
                </label>
                <input
                  type="text"
                  value={ytTitle}
                  onChange={(e) => setYtTitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter video title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Video Description
                </label>
                <textarea
                  value={ytDescription}
                  onChange={(e) => setYtDescription(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                  placeholder="Enter video description"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={verifyYouTubeToken}
                  disabled={loading || !ytAccessToken}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  Verify Token
                </button>
                
                <button
                  onClick={uploadToYouTube}
                  disabled={loading || !ytAccessToken}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Upload Video
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Response/Error Display */}
        {(response || error) && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {error ? 'Error' : 'Response'}
            </h3>
            {error && (
              <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg">
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}
            {response && (
              <pre className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-auto text-sm">
                {JSON.stringify(response, null, 2)}
              </pre>
            )}
          </div>
        )}

        {loading && (
          <div className="mt-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Processing...</p>
          </div>
        )}
      </div>
    </div>
  );
}
