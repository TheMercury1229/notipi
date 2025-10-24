import { Link } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { ArrowRight, Code, FileText, BarChart, Shield } from 'lucide-react'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function Landing() {
  const { isSignedIn } = useUser()
  const heroRef = useRef(null)

  useEffect(() => {
    gsap.from(heroRef.current, {
      opacity: 0,
      y: 30,
      duration: 1,
      ease: 'power3.out'
    })
  }, [])

  const features = [
    {
      icon: Code,
      title: 'Easy Integration',
      description: 'Simple REST API that works with any programming language'
    },
    {
      icon: FileText,
      title: 'Template Management',
      description: 'Create and manage reusable email templates'
    },
    {
      icon: BarChart,
      title: 'Real-time Analytics',
      description: 'Track email delivery and engagement'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div ref={heroRef} className="text-center">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Send Emails at Scale with NotiPi
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              The simplest way to send transactional emails. Powerful API, beautiful templates, and real-time analytics.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to={isSignedIn ? '/dashboard' : '/sign-up'}
                className="flex items-center gap-2 px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Get Started <ArrowRight size={20} />
              </Link>
              <Link
                to="/docs"
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-500 transition"
              >
                View Docs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">
            Everything you need to send emails
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-xl transition transform hover:-translate-y-2"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of developers using NotiPi to power their notifications
          </p>
          <Link
            to={isSignedIn ? '/dashboard' : '/sign-up'}
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-semibold shadow-lg"
          >
            Start for Free
          </Link>
        </div>
      </div>
    </div>
  )
}
