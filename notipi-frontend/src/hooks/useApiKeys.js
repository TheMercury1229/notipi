import { useState, useEffect } from 'react'
import { apiKeysAPI } from '../services/api'
import toast from 'react-hot-toast'

export const useApiKeys = () => {
  const [apiKeys, setApiKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchApiKeys = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiKeysAPI.getAll()
      console.log('Fetched API keys:', data)
      setApiKeys(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Fetch API keys error:', err)
      setError(err.message)
      setApiKeys([])
      toast.error('Failed to fetch API keys')
    } finally {
      setLoading(false)
    }
  }

  const createApiKey = async (keyData) => {
    try {
      const newKey = await apiKeysAPI.create(keyData)
      setApiKeys(prev => [...prev, newKey])
      toast.success('API key created successfully')
      return newKey
    } catch (err) {
      console.error('Create API key error:', err)
      toast.error('Failed to create API key')
      throw err
    }
  }

  const updateApiKey = async (id, keyData) => {
    try {
      const updatedKey = await apiKeysAPI.update(id, keyData)
      setApiKeys(prev => prev.map(key => key._id === id ? updatedKey : key))
      toast.success('API key updated successfully')
      return updatedKey
    } catch (err) {
      console.error('Update API key error:', err)
      toast.error('Failed to update API key')
      throw err
    }
  }

  const deleteApiKey = async (id) => {
    try {
      await apiKeysAPI.delete(id)
      setApiKeys(prev => prev.filter(key => key._id !== id))
      toast.success('API key deleted successfully')
    } catch (err) {
      console.error('Delete API key error:', err)
      toast.error('Failed to delete API key')
      throw err
    }
  }

  useEffect(() => {
    fetchApiKeys()
  }, [])

  return {
    apiKeys,
    loading,
    error,
    fetchApiKeys,
    createApiKey,
    updateApiKey,
    deleteApiKey,
  }
}

export default useApiKeys
