'use client';

import { useState } from 'react';
import { FaLinkedin, FaFacebook, FaDiscord, FaTwitter, FaYoutube } from 'react-icons/fa';

interface ConnectedAccount {
  id: string;
  platform: string;
  accountName?: string;
  avatarUrl?: string;
  metadata?: any;
}

interface PostComposerProps {
  connectedAccounts: ConnectedAccount[];
  onClose: () => void;
  onPostCreated: () => void;
}

export default function PostComposer({ connectedAccounts, onClose, onPostCreated }: PostComposerProps) {
  const [content, setContent] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin': return FaLinkedin;
      case 'facebook': return FaFacebook;
      case 'discord': return FaDiscord;
      case 'twitter': return FaTwitter;
      case 'youtube': return FaYoutube;
      default: return FaLinkedin;
    }
  };

  const toggleAccount = (accountId: string) => {
    setSelectedAccounts(prev =>
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMediaFiles(Array.from(e.target.files));
    }
  };

  const handlePost = async () => {
    if (!content.trim()) {
      setError('Please enter some content');
      return;
    }

    if (selectedAccounts.length === 0) {
      setError('Please select at least one account');
      return;
    }

    setIsPosting(true);
    setError(null);

    try {
      const scheduledFor = scheduledDate && scheduledTime
        ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
        : null;

      // Post to each selected account
      const promises = selectedAccounts.map(async (accountId) => {
        const account = connectedAccounts.find(a => a.id === accountId);
        if (!account) return;

        const formData = new FormData();
        formData.append('content', content);
        formData.append('socialAccountId', accountId);
        if (scheduledFor) {
          formData.append('scheduledFor', scheduledFor);
        }

        mediaFiles.forEach(file => {
          formData.append('media', file);
        });

        const response = await fetch(`/api/posts/create`, {
          method: 'POST',
          headers: {
            'x-user-id': 'default-user', // TODO: Implement proper auth
          },
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || `Failed to post to ${account.platform}`);
        }

        return response.json();
      });

      await Promise.all(promises);

      onPostCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">Create Post</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 text-2xl">
            &times;
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error}
            </div>
          )}

          {/* Account Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Accounts to Post To
            </label>
            <div className="grid grid-cols-2 gap-3">
              {connectedAccounts.map(account => {
                const Icon = getPlatformIcon(account.platform);
                const isSelected = selectedAccounts.includes(account.id);

                return (
                  <button
                    key={account.id}
                    onClick={() => toggleAccount(account.id)}
                    className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`text-xl ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="text-left flex-1">
                      <div className="font-medium text-sm text-gray-900 capitalize">
                        {account.platform}
                      </div>
                      {account.accountName && (
                        <div className="text-xs text-gray-500">
                          {account.platform === 'discord' && account.metadata?.guildName
                            ? `${account.metadata.guildName} - ${account.accountName}`
                            : account.accountName
                          }
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's on your mind?
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="Write your post content here..."
            />
            <div className="text-sm text-gray-500 mt-1">
              {content.length} characters
            </div>
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Media (Optional)
            </label>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleMediaUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {mediaFiles.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                {mediaFiles.length} file(s) selected - Images will be uploaded and displayed in your posts.
              </div>
            )}
          </div>

          {/* Scheduling */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule Post (Optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
              />
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>
            {scheduledDate && scheduledTime && (
              <div className="text-sm text-gray-600 mt-2">
                Will be posted on {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            disabled={isPosting}
          >
            Cancel
          </button>
          <button
            onClick={handlePost}
            disabled={isPosting || !content.trim() || selectedAccounts.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPosting ? 'Posting...' : scheduledDate ? 'Schedule Post' : 'Post Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
