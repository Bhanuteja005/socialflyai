'use client';

import { useState, useEffect } from 'react';
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

interface SocialAccount {
  id: string;
  platform: string;
  accountName?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
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
  const [loading, setLoading] = useState(true);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'queue' | 'drafts' | 'approvals' | 'sent'>('queue');

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
             <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center">
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
                
                return (
                  <div 
                    key={platform}
                    onClick={() => handleConnectPlatform(platform)}
                    className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer group"
                  >
                     <div className={`w-5 h-5 flex items-center justify-center text-lg ${config.color} opacity-70 group-hover:opacity-100`}>
                        <Icon />
                     </div>
                     <span className={isConnected ? "font-semibold text-gray-800" : ""}>
                       {isConnected ? config.name : `Connect ${config.name}`}
                     </span>
                     {isConnected && <div className="ml-auto w-2 h-2 bg-green-500 rounded-full"></div>}
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
                   { id: 'queue', label: 'Queue', count: 0 },
                   { id: 'drafts', label: 'Drafts', count: 0 },
                   { id: 'approvals', label: 'Approvals', count: 0, showBolt: true },
                   { id: 'sent', label: 'Sent', count: 0 }
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
              
              {/* Empty State Content */}
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
                         onClick={() => setShowConnectionModal(true)}
                         className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
                       >
                         + Connect a Channel
                       </button>
                       <button className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition">
                         Manage Channel Access
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </main>
        
        {/* Setup Checklist (Bottom Right) */}
        {!loading && accounts.length < 3 && (
          <div className="fixed bottom-6 right-6 w-80 bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden z-20">
             <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                <h4 className="font-semibold text-gray-900">Complete your setup</h4>
                <button className="text-gray-400 hover:text-gray-600">×</button>
             </div>
             <div className="p-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                   <span>1 of 4</span>
                   <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="w-1/4 h-full bg-blue-600"></div>
                   </div>
                </div>
                
                <div className="space-y-3">
                   <div className="flex items-start">
                      <MdCheckCircle className="text-blue-600 mt-0.5 mr-2 text-lg" />
                      <span className="text-sm text-gray-600 line-through">Create your SocialFly account</span>
                   </div>
                   <div className="flex items-start">
                      <div className={`w-4 h-4 rounded-full border-2 mr-2.5 mt-0.5 flex-shrink-0 ${accounts.length > 0 ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                         {accounts.length > 0 && <MdCheckCircle className="text-white text-xs" />}
                      </div>
                      <span className={`text-sm ${accounts.length > 0 ? 'text-gray-600 line-through' : 'text-gray-800 font-medium'}`}>
                        Connect your first channel
                      </span>
                   </div>
                   <div className="flex items-start">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 mr-2.5 mt-0.5 flex-shrink-0"></div>
                      <span className="text-sm text-gray-500">Save an idea</span>
                   </div>
                   <div className="flex items-start">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 mr-2.5 mt-0.5 flex-shrink-0"></div>
                      <span className="text-sm text-gray-500">Publish your first post</span>
                   </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
                   Need some help? <a href="#" className="underline hover:text-gray-600">Read our guide</a>
                </div>
             </div>
          </div>
        )}
        
        {/* Help Bubble */}
        <div className="fixed bottom-6 right-6 z-10" style={{ right: accounts.length < 3 ? '340px' : '24px' }}>
           <button className="w-10 h-10 bg-blue-600 rounded-full text-white flex items-center justify-center font-bold text-xl shadow-lg hover:bg-blue-700 transition">
              ?
           </button>
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
      if ((data.success && data.authUrl) || data.authUrl) {
        setAuthUrl(data.authUrl);
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


