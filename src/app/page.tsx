import { redirect } from "next/navigation"
import Link from "next/link"


export const dynamic = 'force-dynamic'
export default async function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">SuperClaw</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-700 rounded-full text-blue-300 text-sm mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Now in Public Beta — 2,000+ agents created
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Create custom AI agents in <span className="text-blue-400">60 seconds</span> — no coding required
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Your personal AI employee that works 24/7. Pick skills, configure, and watch it work.
          </p>
          
          {/* Demo placeholder - animated gradient */}
          <div className="relative max-w-4xl mx-auto mb-16 rounded-2xl overflow-hidden border border-gray-700 bg-gray-800">
            <div className="aspect-video flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 animate-pulse"></div>
              <div className="relative z-10 text-center">
                <div className="text-6xl mb-4">🤖</div>
                <p className="text-gray-300 text-lg">AI Agent Demo</p>
                <p className="text-gray-500 text-sm mt-2">[Demo video coming soon]</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-medium transition-colors"
            >
              Start Free
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-lg font-medium transition-colors"
            >
              View Pricing
            </Link>
          </div>

          {/* Compact Pricing Tiers - Above the Fold */}
          <div className="flex justify-center gap-6 mt-10 flex-wrap">
            <div className="bg-gray-800/80 border border-gray-700 rounded-xl px-6 py-4">
              <p className="text-gray-400 text-sm mb-1">Starter</p>
              <p className="text-2xl font-bold text-white">$9<span className="text-gray-400 text-sm font-normal">/mo</span></p>
              <p className="text-gray-500 text-xs mt-1">1 agent, 500 msgs</p>
            </div>
            <div className="bg-gray-800/80 border-2 border-blue-500 rounded-xl px-6 py-4">
              <p className="text-blue-400 text-sm font-medium mb-1">Most Popular</p>
              <p className="text-2xl font-bold text-white">$29<span className="text-gray-400 text-sm font-normal">/mo</span></p>
              <p className="text-gray-500 text-xs mt-1">3 agents, unlimited</p>
            </div>
            <div className="bg-gray-800/80 border border-gray-700 rounded-xl px-6 py-4">
              <p className="text-gray-400 text-sm mb-1">Agency</p>
              <p className="text-2xl font-bold text-white">$99<span className="text-gray-400 text-sm font-normal">/mo</span></p>
              <p className="text-gray-500 text-xs mt-1">10 agents, priority</p>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>10,000+ Active Users</span>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-white text-center mb-4">
              Simple, Transparent Pricing
            </h3>
            <p className="text-gray-400 text-center mb-12">
              Start free, upgrade when you&apos;re ready
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Starter */}
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
                <h4 className="text-xl font-semibold text-white mb-2">Starter</h4>
                <p className="text-gray-400 text-sm mb-4">Perfect for individuals</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">$9</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <ul className="space-y-3 text-gray-300 text-sm mb-8">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    1 AI Agent
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    500 messages/month
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Basic skills
                  </li>
                </ul>
                <Link
                  href="/register?plan=starter"
                  className="block w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-center font-medium transition-colors"
                >
                  Get Started
                </Link>
              </div>

              {/* Pro */}
              <div className="bg-gray-800 border-2 border-blue-500 rounded-2xl p-8 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">Pro</h4>
                <p className="text-gray-400 text-sm mb-4">For growing teams</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">$29</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <ul className="space-y-3 text-gray-300 text-sm mb-8">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    3 AI Agents
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    5,000 messages/month
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    All skills + custom prompts
                  </li>
                </ul>
                <Link
                  href="/register?plan=pro"
                  className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center font-medium transition-colors"
                >
                  Get Started
                </Link>
              </div>

              {/* Agency */}
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
                <h4 className="text-xl font-semibold text-white mb-2">Agency</h4>
                <p className="text-gray-400 text-sm mb-4">For businesses</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">$99</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <ul className="space-y-3 text-gray-300 text-sm mb-8">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Unlimited agents
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Unlimited messages
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Team management
                  </li>
                </ul>
                <Link
                  href="/register?plan=agency"
                  className="block w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-center font-medium transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-white text-center mb-12">
              Loved by creators worldwide
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 mb-4">
                  &quot;SuperClaw let me create my first AI agent in under a minute. No coding needed!&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    JM
                  </div>
                  <div>
                    <p className="text-white font-medium">John M.</p>
                    <p className="text-gray-500 text-sm">Marketing Manager</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 mb-4">
                  &quot;The skill system is brilliant. I set up a content writer agent in minutes.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    SL
                  </div>
                  <div>
                    <p className="text-white font-medium">Sarah L.</p>
                    <p className="text-gray-500 text-sm">Content Creator</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 mb-4">
                  &quot;We use SuperClaw for our entire support team. Game changer for our business.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    DK
                  </div>
                  <div>
                    <p className="text-white font-medium">David K.</p>
                    <p className="text-gray-500 text-sm">Startup Founder</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-20 bg-blue-600/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to get your AI agent?
            </h3>
            <p className="text-gray-400 mb-8">
              Join thousands of creators who are already using SuperClaw.
            </p>
            <Link
              href="/register"
              className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-medium transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
            <p>&copy; 2026 SuperClaw. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
