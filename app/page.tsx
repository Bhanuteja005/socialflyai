'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">SF</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Socialflyai</h1>
          </div>
          <nav className="space-x-3">
            <Link href="/dashboard" className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm">Open Dashboard</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Manage your social presence from one place</h2>
              <p className="text-gray-600 mb-6">SocialFly helps teams and creators plan, schedule, and publish content across multiple social platforms. Streamline workflows, collaborate with teammates, and track performance — without switching apps.</p>

              <div className="flex items-center space-x-3">
                <Link href="/dashboard" className="px-5 py-3 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700">Open Dashboard</Link>
                <a href="#features" className="px-4 py-3 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50">Learn more</a>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="text-2xl mr-3">📅</div>
                  <div>
                    <h4 className="font-semibold">Schedule & Queue</h4>
                    <p className="text-sm text-gray-600">Plan posts ahead of time and keep your content calendar full.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="text-2xl mr-3">🤝</div>
                  <div>
                    <h4 className="font-semibold">Team Collaboration</h4>
                    <p className="text-sm text-gray-600">Invite teammates, assign drafts, and review posts before publishing.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="text-2xl mr-3">📊</div>
                  <div>
                    <h4 className="font-semibold">Analytics</h4>
                    <p className="text-sm text-gray-600">See how your posts perform and optimize your strategy over time.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <div className="text-3xl mb-3">🗂️</div>
              <h4 className="font-semibold mb-1">Unified Inbox</h4>
              <p className="text-sm text-gray-600">Manage replies and comments across platforms in one place.</p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <div className="text-3xl mb-3">⏱️</div>
              <h4 className="font-semibold mb-1">Smart Scheduling</h4>
              <p className="text-sm text-gray-600">Automatically schedule posts at optimal times for engagement.</p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <div className="text-3xl mb-3">🔁</div>
              <h4 className="font-semibold mb-1">Multi-Channel</h4>
              <p className="text-sm text-gray-600">Publish to LinkedIn, Twitter/X, Facebook, Instagram and more.</p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <div className="text-3xl mb-3">🔒</div>
              <h4 className="font-semibold mb-1">Secure Tokens</h4>
              <p className="text-sm text-gray-600">We store OAuth tokens securely and use best practices for integration.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} SocialFly — Built for creators and teams.
        </div>
      </footer>
    </div>
  );
}
