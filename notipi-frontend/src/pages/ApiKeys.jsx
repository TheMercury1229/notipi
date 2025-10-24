import { useState } from 'react'
import { Plus, Trash2, Copy, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useApiKeys } from '../hooks/useApiKeys'
import toast from 'react-hot-toast'

export default function ApiKeys() {
  const { apiKeys, loading, createApiKey, deleteApiKey } = useApiKeys()
  const [showModal, setShowModal] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [visibleKeys, setVisibleKeys] = useState({})
  const [newlyCreatedKeys, setNewlyCreatedKeys] = useState({}) // Track newly created keys

  const handleCreate = async (e) => {
    e.preventDefault()
    
    try {
      const result = await createApiKey({ name: keyName })
      
      // Store the raw key temporarily for copy functionality
      if (result?.key) {
        setNewlyCreatedKeys(prev => ({
          ...prev,
          [result._id]: result.key
        }))
      }
      
      setShowModal(false)
      setKeyName('')
    } catch (error) {
      console.error('Create failed:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      try {
        await deleteApiKey(id)
        // Remove from newly created keys if it exists
        setNewlyCreatedKeys(prev => {
          const updated = { ...prev }
          delete updated[id]
          return updated
        })
      } catch (error) {
        console.error('Delete failed:', error)
      }
    }
  }

  const handleCopy = (keyId) => {
    // Try to get the key from newly created keys first
    const key = newlyCreatedKeys[keyId]
    
    if (!key || key === 'undefined') {
      toast.error('⚠️ This key is no longer available for copying. Please save it when creating!')
      return
    }
    
    navigator.clipboard.writeText(key)
    toast.success('✅ API key copied to clipboard!')
  }

  const maskKey = (keyId) => {
    const key = newlyCreatedKeys[keyId]
    
    if (!key || key === 'undefined') {
      return '••••••••••••••••••••••••••••••••'
    }
    return `${key.substring(0, 15)}${'•'.repeat(25)}`
  }

  const toggleKeyVisibility = (id) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const getDisplayKey = (keyId) => {
    const key = newlyCreatedKeys[keyId]
    
    if (!key) {
      return '••••••••••••••••••••••••••••••••'
    }
    
    return visibleKeys[keyId] ? key : maskKey(keyId)
  }

  const isKeyAvailable = (keyId) => {
    return !!newlyCreatedKeys[keyId]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
          <p className="text-gray-600 mt-2">Manage your API keys for authentication</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-lg"
        >
          <Plus size={20} />
          Create New Key
        </button>
      </div>

      {/* API Keys Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apiKeys.map((key) => (
          <div
            key={key._id}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{key.name}</h3>
              <button
                onClick={() => handleDelete(key._id)}
                className="p-2 hover:bg-red-50 rounded-lg transition"
                title="Delete API key"
              >
                <Trash2 size={16} className="text-red-500" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono text-gray-700 truncate flex-1">
                  {getDisplayKey(key._id)}
                </code>
                {isKeyAvailable(key._id) && (
                  <button
                    onClick={() => toggleKeyVisibility(key._id)}
                    className="p-1 hover:bg-gray-200 rounded ml-2"
                    title={visibleKeys[key._id] ? 'Hide key' : 'Show key'}
                  >
                    {visibleKeys[key._id] ? (
                      <EyeOff size={16} className="text-gray-600" />
                    ) : (
                      <Eye size={16} className="text-gray-600" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {!isKeyAvailable(key._id) && (
              <div className="flex items-start gap-2 mb-4 p-3 bg-yellow-50 rounded-lg">
                <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-700">
                  Key is no longer visible. For security, keys are only shown once when created.
                </p>
              </div>
            )}

            <div className="text-sm text-gray-500 mb-4">
              Created: {new Date(key.createdAt).toLocaleDateString()}
            </div>

            <button
              onClick={() => handleCopy(key._id)}
              disabled={!isKeyAvailable(key._id)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                isKeyAvailable(key._id)
                  ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              title={isKeyAvailable(key._id) ? 'Copy key to clipboard' : 'Key no longer available'}
            >
              <Copy size={16} />
              {isKeyAvailable(key._id) ? 'Copy Key' : 'Key Not Available'}
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {apiKeys.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No API keys yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-lg"
          >
            Create Your First API Key
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Create New API Key</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>⚠️ Important:</strong> Copy your API key immediately after creation. 
                You won't be able to see it again for security reasons.
              </p>
            </div>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Name
                </label>
                <input
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Production API Key"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setKeyName('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
