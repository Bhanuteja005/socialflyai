'use client';

import React, { useState, useEffect } from 'react';
import {
  FaLinkedin, FaFacebook, FaDiscord, FaYoutube, FaTwitter,
  FaInstagram, FaPinterest, FaTiktok, FaGoogle, FaRegListAlt, FaCalendarAlt
} from 'react-icons/fa';
import {
  SiBluesky, SiMastodon, SiThreads
} from 'react-icons/si';
import { IoMdSettings, IoMdAdd } from 'react-icons/io';
import { MdDashboard, MdOutlineViewStream, MdDrafts, MdCheckCircle, MdSend } from 'react-icons/md';
import { BsGridFill, BsThreeDotsVertical } from 'react-icons/bs';
import PostComposer from '../components/PostComposer';

interface SocialAccount {
  id: string;
  platform: string;
  accountName?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  metadata?: any;
}

interface Post {
  id: string;
  content: string;
  status: string;
  scheduledFor?: string;
  publishedAt?: string;
  mediaUrls?: string[];
  socialAccount: {
    platform: string;
    accountName?: string;
    metadata?: any;
  };
}

// Helper to determine platform icon and color
const getPlatformConfig = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'instagram': return { name: 'Instagram', icon: FaInstagram, color: 'text-pink-600' };
    case 'threads': return { name: 'Threads', icon: SiThreads, color: 'text-black' };
    case 'linkedin': return { name: 'LinkedIn', icon: FaLinkedin, color: 'text-blue-700' };
    case 'bluesky': return { name: 'Bluesky', icon: SiBluesky, color: 'text-blue-500' };
    case 'facebook': return { name: 'Facebook', icon: FaFacebook, color: 'text-blue-600' };
    case 'youtube': return { name: 'YouTube', icon: FaYoutube, color: 'text-red-600' };
    case 'tiktok': return { name: 'TikTok', icon: FaTiktok, color: 'text-black' };
    case 'mastodon': return { name: 'Mastodon', icon: SiMastodon, color: 'text-purple-600' };
    case 'pinterest': return { name: 'Pinterest', icon: FaPinterest, color: 'text-red-700' };
    case 'google': return { name: 'Google Business', icon: FaGoogle, color: 'text-blue-500' };
    case 'twitter': return { name: 'Twitter / X', icon: FaTwitter, color: 'text-sky-500' }; // Or FaXTwitter if available
    case 'discord': return { name: 'Discord', icon: FaDiscord, color: 'text-indigo-500' };
    default: return { name: platform, icon: MdDashboard, color: 'text-gray-600' };
  }
};

const platformsList = [
  'instagram', 'threads', 'linkedin', 'bluesky', 'facebook', 
  'youtube', 'tiktok', 'mastodon', 'pinterest', 'google', 'twitter', 'discord'
];

export default function Dashboard() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showPostComposer, setShowPostComposer] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'queue' | 'drafts' | 'approvals' | 'sent'>('queue');
  const [discordBotStatus, setDiscordBotStatus] = useState<{needsSetup: boolean, message: string} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const getStatusForTab = (tab: string) => {
    const statusMap = {
      queue: 'scheduled',
      drafts: 'draft',
      sent: 'published',
      approvals: 'scheduled',
    };
    return statusMap[tab as keyof typeof statusMap] || 'scheduled';
  };

  const handlePageChange = (page: number) => {
    loadPosts(getStatusForTab(activeTab), page);
  };

  useEffect(() => {
    loadAccounts();
    loadPosts(undefined, 1);
  }, []);

  const checkDiscordBotStatus = async () => {
    try {
      // First check if token is valid
      const tokenResponse = await fetch('/api/discord/verify-token');
      const tokenData = await tokenResponse.json();
      
      if (!tokenData.success) {
        setDiscordBotStatus({
          needsSetup: true,
          message: 'Discord bot token is invalid'
        });
        return;
      }

      // Then check if bot can access the configured channel
      const discordAccount = accounts.find(acc => acc.platform === 'discord');
      if (discordAccount && discordAccount.metadata) {
        const channelId = discordAccount.metadata.channelId || discordAccount.metadata.defaultChannelId;
        if (channelId) {
          try {
            const channelResponse = await fetch(`/api/discord/test-token?channelId=${channelId}`);
            const channelData = await channelResponse.json();
            if (!channelData.success) {
              setDiscordBotStatus({
                needsSetup: true,
                message: 'Bot needs to be added to your Discord server'
              });
              return;
            }
          } catch (error) {
            setDiscordBotStatus({
              needsSetup: true,
              message: 'Cannot access Discord channel'
            });
            return;
          }
        }
      }

      setDiscordBotStatus(null);
    } catch (error) {
      setDiscordBotStatus({
        needsSetup: true,
        message: 'Cannot verify Discord bot status'
      });
    }
  };

  useEffect(() => {
    // Check Discord bot status when accounts change
    const discordAccount = accounts.find(acc => acc.platform === 'discord');
    if (discordAccount) {
      checkDiscordBotStatus();
    } else {
      setDiscordBotStatus(null);
    }
  }, [accounts]);

  const loadAccounts = async () => {
    try {
      const response = await fetch('/api/social-accounts', {
        headers: {
          'x-user-id': 'default-user',
        },
      });
      const data = await response.json();
      if (data.success) {
        setAccounts(data.accounts);
        
        // Check Discord bot status
        const discordAccount = data.accounts.find((acc: SocialAccount) => acc.platform === 'discord');
        if (discordAccount) {
          await checkDiscordBotStatus();
        }
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDiscordInviteLink = () => {
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '1463080016488435786';
    // Permissions: Send Messages (2048) + Read Message History (65536) + Use Slash Commands (0) + Embed Links (16384)
    const permissions = 2048 + 65536 + 16384; // Total: 83968
    const scope = 'bot%20applications.commands';
    
    return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=${scope}`;
  };

  const postsPerPage = 10;

  const loadPosts = async (status?: string, page: number = 1) => {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', page.toString());
      params.append('limit', postsPerPage.toString());
      
      const url = `/api/posts?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          'x-user-id': 'default-user',
        },
      });
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts);
        setTotalPosts(data.total || 0);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  useEffect(() => {
    const statusMap = {
      queue: 'scheduled',
      drafts: 'draft',
      sent: 'published',
      approvals: 'scheduled',
    };
    setCurrentPage(1);
    loadPosts(statusMap[activeTab], 1);
  }, [activeTab]);

  const handleConnectPlatform = (platform: string) => {
    setSelectedPlatform(platform);
    setShowConnectionModal(true);
  };

  const connectedPlatformIds = new Set(accounts.filter(a => a.isActive).map(a => a.platform));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
             <div className="flex items-center space-x-2">
               <div className="w-8 h-8 bg-blue-600 rounded text-white flex items-center justify-center font-bold text-xl">S</div>
               <span className="font-bold text-xl text-gray-900 tracking-tight">SocialFly</span>
             </div>
             <nav className="hidden md:flex space-x-1">
               <a href="#" className="px-3 py-2 text-gray-900 font-medium border-b-2 border-transparent hover:text-blue-600">Create</a>
               <a href="#" className="px-3 py-2 text-blue-600 font-medium border-b-2 border-blue-600">Publish</a>
               <a href="#" className="px-3 py-2 text-gray-500 font-medium border-b-2 border-transparent hover:text-blue-600">Community <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded ml-1">New</span></a>
               <a href="#" className="px-3 py-2 text-gray-500 font-medium border-b-2 border-transparent hover:text-blue-600">Start Page</a>
             </nav>
          </div>
          <div className="flex items-center space-x-4">
             <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center"
               onClick={() => setShowPostComposer(true)}>
               <IoMdAdd className="mr-1 text-lg" /> New
             </button>
             <div className="h-8 w-8 rounded-full bg-gray-200 cursor-pointer flex items-center justify-center text-gray-600 hover:bg-gray-300">
                <span className="text-sm">?</span>
             </div>
             <div className="h-8 w-8 rounded-full bg-blue-100 cursor-pointer flex items-center justify-center text-blue-700 font-bold">
                P
             </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto flex flex-col">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4 mt-2">
               <h3 className="font-bold text-gray-900">Channels</h3>
               <BsThreeDotsVertical className="text-gray-400 cursor-pointer" />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-3 px-3 py-2 bg-blue-50 text-blue-700 rounded-md cursor-pointer font-medium">
                 <div className="w-5 h-5 flex items-center justify-center bg-blue-100 rounded text-blue-600">
                    <BsGridFill className="text-xs" />
                 </div>
                 <span>All Channels</span>
              </div>
              
              {platformsList.map(platform => {
                const config = getPlatformConfig(platform);
                const Icon = config.icon;
                const isConnected = connectedPlatformIds.has(platform);
                const discordNeedsSetup = platform === 'discord' && discordBotStatus?.needsSetup;
                
                return (
                  <div 
                    key={platform}
                    onClick={() => handleConnectPlatform(platform)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md cursor-pointer group ${
                      discordNeedsSetup ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 
                      'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                     <div className={`w-5 h-5 flex items-center justify-center text-lg ${
                       discordNeedsSetup ? 'text-yellow-600' : `${config.color} opacity-70 group-hover:opacity-100`
                     }`}>
                        <Icon />
                     </div>
                     <div className="flex-1">
                       <span className={isConnected ? "font-semibold text-gray-800" : ""}>
                         {isConnected ? config.name : `Connect ${config.name}`}
                       </span>
                       {discordNeedsSetup && (
                         <div className="mt-2 space-y-2">
                           <div className="text-xs text-yellow-600">
                             {discordBotStatus.message}
                           </div>
                           <div className="text-xs text-yellow-700">
                             Click "Add Bot to Server" below to invite the bot with the correct permissions.
                           </div>
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               window.open(generateDiscordInviteLink(), '_blank');
                             }}
                             className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded font-medium"
                           >
                             Add Bot to Server
                           </button>
                         </div>
                       )}
                     </div>
                     {isConnected && !discordNeedsSetup && <div className="ml-auto w-2 h-2 bg-green-500 rounded-full"></div>}
                     {discordNeedsSetup && <div className="ml-auto w-2 h-2 bg-yellow-500 rounded-full"></div>}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-auto p-4 border-t border-gray-100">
             <div className="space-y-2 text-sm text-gray-600">
               <div className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer">
                 <FaRegListAlt /> <span>Manage Tags</span>
               </div>
               <div className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer">
                 <IoMdSettings /> <span>Manage Channels</span>
               </div>
             </div>
             
             {/* Channels limit indicator */}
             <div className="mt-4 px-3 py-2 bg-gray-100 rounded-md flex items-center justify-between text-xs text-gray-500">
               <span>{accounts.filter(a => a.isActive).length}/3 channels connected</span>
               <span className="cursor-pointer hover:text-gray-700">×</span>
             </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-white">
           <div className="max-w-5xl mx-auto px-8 py-6">
              {/* Main Header */}
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center space-x-3">
                   <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded text-gray-600">
                      <BsGridFill />
                   </div>
                   <h1 className="text-2xl font-bold text-gray-900">All Channels</h1>
                 </div>
                 
                 <div className="flex items-center space-x-2">
                    <div className="flex bg-gray-100 p-1 rounded-md">
                       <button className="px-3 py-1.5 bg-white shadow-sm rounded text-sm font-medium text-gray-800 flex items-center">
                          <FaRegListAlt className="mr-2" /> List
                       </button>
                       <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center">
                          <FaCalendarAlt className="mr-2" /> Calendar
                       </button>
                    </div>
                    <button className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 text-gray-700">
                       + New Post
                    </button>
                 </div>
              </div>
              
              {/* Tabs */}
              <div className="flex space-x-8 border-b border-gray-200 mb-8">
                 {[
                   { id: 'queue', label: 'Queue', count: posts.filter(p => p.status === 'scheduled').length },
                   { id: 'drafts', label: 'Drafts', count: posts.filter(p => p.status === 'draft').length },
                   { id: 'approvals', label: 'Approvals', count: 0, showBolt: true },
                   { id: 'sent', label: 'Sent', count: posts.filter(p => p.status === 'published').length }
                 ].map(tab => (
                   <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id as any)}
                     className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors flex items-center ${
                       activeTab === tab.id 
                         ? 'border-blue-600 text-blue-600' 
                         : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                     }`}
                   >
                     {tab.label} <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{tab.count}</span>
                     {tab.showBolt && <span className="ml-1 text-purple-500">⚡</span>}
                   </button>
                 ))}
              </div>
              
              {/* Filters */}
              <div className="flex items-center justify-end space-x-4 mb-8 text-sm text-gray-600">
                 <div className="flex items-center cursor-pointer hover:text-gray-900">
                    <BsGridFill className="mr-2" /> All Channels
                 </div>
                 <div className="flex items-center cursor-pointer hover:text-gray-900">
                    <FaRegListAlt className="mr-2" /> Tags
                 </div>
                 <div className="flex items-center cursor-pointer hover:text-gray-900">
                    <span className="mr-2">🌐</span> Kolkata
                 </div>
              </div>
              
              {/* Post List */}
              {posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map(post => (
                    <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          post.status === 'published' ? 'bg-green-100 text-green-600' :
                          post.status === 'scheduled' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {getPlatformConfig(post.socialAccount.platform).icon &&
                            <span className="text-lg">{React.createElement(getPlatformConfig(post.socialAccount.platform).icon)}</span>
                          }
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="font-medium text-gray-900 capitalize">
                                {post.socialAccount.platform}
                              </span>
                              {post.socialAccount.accountName && (
                                <span className="text-sm text-gray-500 ml-2">
                                  {post.socialAccount.platform === 'discord' && post.socialAccount.metadata?.guildName
                                    ? `${post.socialAccount.metadata.guildName} - ${post.socialAccount.accountName}`
                                    : post.socialAccount.accountName
                                  }
                                </span>
                              )}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              post.status === 'published' ? 'bg-green-100 text-green-700' :
                              post.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                              post.status === 'failed' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {post.status}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm mb-2">{post.content.substring(0, 150)}{post.content.length > 150 ? '...' : ''}</p>
                          {post.mediaUrls && post.mediaUrls.length > 0 && (
                            <div className="mb-2 flex flex-wrap gap-2">
                              {post.mediaUrls.slice(0, 3).map((url, index) => (
                                <img
                                  key={index}
                                  src={url}
                                  alt={`Media ${index + 1}`}
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                />
                              ))}
                              {post.mediaUrls.length > 3 && (
                                <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                  <span className="text-xs text-gray-500">+{post.mediaUrls.length - 3}</span>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="text-xs text-gray-500">
                            {post.publishedAt && `Published ${new Date(post.publishedAt).toLocaleString()}`}
                            {post.scheduledFor && `Scheduled for ${new Date(post.scheduledFor).toLocaleString()}`}
                            {!post.publishedAt && !post.scheduledFor && 'Draft'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty State */
              <div className="flex flex-col items-center justify-center py-12">
                 <div className="w-full max-w-2xl mb-8 opacity-50 relative">
                    {/* Skeleton UI for empty state */}
                    <div className="space-y-4">
                       {[1, 2, 3].map(i => (
                         <div key={i} className="flex bg-white border border-gray-200 rounded-lg p-4 h-24">
                            <div className="w-12 h-12 bg-gray-100 rounded-full mr-4"></div>
                            <div className="flex-1 space-y-2">
                               <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                               <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                            </div>
                         </div>
                       ))}
                    </div>
                    {/* Connecting line */}
                    <div className="absolute right-0 top-1/2 w-16 h-32 border-r-2 border-t-2 border-gray-200 rounded-tr-3xl transform -translate-y-1/2 translate-x-8 pointer-events-none hidden md:block"></div>
                 </div>
                 
                 <div className="text-center max-w-md">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to SocialFly 👋</h3>
                    <p className="text-gray-600 mb-8">
                       As an admin of this team, you can grant yourself access to your team's social channels, or connect your own channels. For questions, please contact your team admin.
                    </p>
                    <div className="flex items-center justify-center space-x-3">
                       <button 
                         onClick={() => setShowPostComposer(true)}
                         className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
                       >
                         + Create Your First Post
                       </button>
                       <button 
                         onClick={() => setShowConnectionModal(true)}
                         className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition">
                         Connect a Channel
                       </button>
                    </div>
                 </div>
              </div>
              )}
              
              {/* Pagination - only show if there are posts */}
              {posts.length > 0 && totalPosts > postsPerPage && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-black-700">
                    Showing {((currentPage - 1) * postsPerPage) + 1} to {Math.min(currentPage * postsPerPage, totalPosts)} of {totalPosts} posts
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-black-500 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {Math.ceil(totalPosts / postsPerPage)}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === Math.ceil(totalPosts / postsPerPage)}
                      className="px-3 text-black-500 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
                /* Empty State */
              <div className="flex flex-col items-center justify-center py-12">
                 <div className="w-full max-w-2xl mb-8 opacity-50 relative">
                    {/* Skeleton UI for empty state */}
                    <div className="space-y-4">
                       {[1, 2, 3].map(i => (
                         <div key={i} className="flex bg-white border border-gray-200 rounded-lg p-4 h-24">
                            <div className="w-12 h-12 bg-gray-100 rounded-full mr-4"></div>
                            <div className="flex-1 space-y-2">
                               <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                               <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                            </div>
                         </div>
                       ))}
                    </div>
                    {/* Connecting line */}
                    <div className="absolute right-0 top-1/2 w-16 h-32 border-r-2 border-t-2 border-gray-200 rounded-tr-3xl transform -translate-y-1/2 translate-x-8 pointer-events-none hidden md:block"></div>
                 </div>
                 
                 <div className="text-center max-w-md">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to SocialFly 👋</h3>
                    <p className="text-gray-600 mb-8">
                       As an admin of this team, you can grant yourself access to your team's social channels, or connect your own channels. For questions, please contact your team admin.
                    </p>
                    <div className="flex items-center justify-center space-x-3">
                       <button 
                         onClick={() => setShowPostComposer(true)}
                         className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
                       >
                         + Create Your First Post
                       </button>
                       <button 
                         onClick={() => setShowConnectionModal(true)}
                         className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition">
                         Connect a Channel
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </main>
        
        
        
       
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

      {/* Post Composer */}
      {showPostComposer && (
        <PostComposer
          connectedAccounts={accounts.filter(a => a.isActive)}
          onClose={() => setShowPostComposer(false)}
          onPostCreated={() => {
            setShowPostComposer(false);
            loadPosts(getStatusForTab(activeTab), currentPage);
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
    if (platform) {
      handleConnect();
    }
  }, [platform]);

  const handleConnect = async () => {
    if (!platform) return;
    
    setLoading(true);
    setError(null);
    setAuthUrl(null);
    
    try {
      let response;
      if (platform === 'linkedin') {
        response = await fetch('/api/linkedin/auth-url');
      } else if (platform === 'twitter') {
        response = await fetch('/api/x/auth-url');
      } else if (platform === 'youtube') {
        response = await fetch('/api/youtube/auth-url');
      } else if (platform === 'discord') {
         // Discord redirects directly
         window.location.href = '/connect/discord';
         return;
      } else {
        // Placeholder for other platforms
        await new Promise(resolve => setTimeout(resolve, 800));
        return;
      }
      
      const data = await response.json();
      if ((data.success && data.authUrl) || data.authUrl || data.url) {
        setAuthUrl(data.authUrl || data.url);
      } else {
        setError(data.error || `Failed to get ${platform} auth URL`);
      }
    } catch (err) {
      console.error(err);
      setError(`Failed to connect to ${platform}`);
    } finally {
      if (platform !== 'discord') setLoading(false);
    }
  };

  const handleAuthorize = () => {
    if (authUrl) {
      window.open(authUrl, '_blank');
      onClose();
    }
  };
  
  const config = platform ? getPlatformConfig(platform) : { name: 'Social Account', icon: MdDashboard, color: 'text-gray-600' };
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-xl w-full mx-4 overflow-hidden shadow-xl transform transition-all">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center space-x-3">
             <div className={`p-2 bg-gray-50 rounded-lg ${config.color}`}>
                <Icon className="text-xl" />
             </div>
             <h3 className="text-lg font-bold text-gray-900">
               Connect {config.name}
             </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 text-xl">
             &times;
          </button>
        </div>
        
        <div className="p-8">
           {loading ? (
             <div className="text-center py-4">
               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
               <p className="text-gray-500">Preparing connection...</p>
             </div>
           ) : error ? (
             <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start">
               <span className="mr-2">⚠️</span>
               <div>
                  <p className="font-medium">Connection Error</p>
                  <p className="text-sm mt-1">{error}</p>
               </div>
             </div>
           ) : authUrl ? (
             <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600 text-2xl">
                   <Icon />
                </div>
                <div>
                   <h4 className="text-lg font-semibold text-gray-900 mb-2">Ready to authorize</h4>
                   <p className="text-gray-600 text-sm max-w-sm mx-auto">
                      You'll be redirected to {config.name} to grant SocialFly AI permission to manage your posts.
                   </p>
                </div>
                <button 
                  onClick={handleAuthorize}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition shadow-sm"
                >
                  Authorize Access
                </button>
             </div>
           ) : (
             <div className="text-center py-6">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400 text-3xl mb-4">
                  <Icon />
               </div>
               <p className="text-gray-600 mb-6">
                 Integration for <strong>{config.name}</strong> is coming soon!
               </p>
               <button 
                 onClick={onClose}
                 className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
               >
                 Close
               </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}


