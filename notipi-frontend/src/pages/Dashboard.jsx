import { useUser } from '@clerk/clerk-react'
import { Key, FileText, Mail, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useEffect, useState } from 'react'
import { apiKeysAPI, templatesAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user } = useUser()
  const [apiKeys, setApiKeys] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [keysData, templatesData] = await Promise.all([
        apiKeysAPI.getAll(),
        templatesAPI.getAll()
      ])
      setApiKeys(keysData)
      setTemplates(templatesData)
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const chartData = [
    { date: 'Mon', emails: 145 },
    { date: 'Tue', emails: 178 },
    { date: 'Wed', emails: 156 },
    { date: 'Thu', emails: 203 },
    { date: 'Fri', emails: 189 },
    { date: 'Sat', emails: 221 },
    { date: 'Sun', emails: 155 },
  ]

  const stats = [
    {
      title: 'Total API Keys',
      value: apiKeys.length,
      icon: Key,
      color: 'blue',
    },
    {
      title: 'Total Templates',
      value: templates.length,
      icon: FileText,
      color: 'purple',
    },
    {
      title: 'Emails Sent',
      value: '1,247',
      icon: Mail,
      color: 'green',
    },
    {
      title: 'Success Rate',
      value: '98.5%',
      icon: TrendingUp,
      color: 'yellow',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName || 'User'}! 👋
        </h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your account today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                  <Icon className={`text-${stat.color}-600`} size={24} />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Activity (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="emails" stroke="#0ea5e9" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
