import { useState, useEffect } from 'react'
import { templatesAPI } from '../services/api'
import toast from 'react-hot-toast'

export const useTemplates = () => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await templatesAPI.getAll()
      console.log('Fetched templates:', data)
      setTemplates(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Fetch templates error:', err)
      setError(err.message)
      setTemplates([])
      toast.error('Failed to fetch templates')
    } finally {
      setLoading(false)
    }
  }

  const createTemplate = async (templateData) => {
    try {
      const newTemplate = await templatesAPI.create(templateData)
      setTemplates(prev => [...prev, newTemplate])
      toast.success('Template created successfully')
      return newTemplate
    } catch (err) {
      console.error('Create template error:', err)
      toast.error('Failed to create template')
      throw err
    }
  }

  const updateTemplate = async (id, templateData) => {
    try {
      const updatedTemplate = await templatesAPI.update(id, templateData)
      setTemplates(prev => prev.map(t => t._id === id ? updatedTemplate : t))
      toast.success('Template updated successfully')
      return updatedTemplate
    } catch (err) {
      console.error('Update template error:', err)
      toast.error('Failed to update template')
      throw err
    }
  }

  const deleteTemplate = async (id) => {
    try {
      await templatesAPI.delete(id)
      setTemplates(prev => prev.filter(t => t._id !== id))
      toast.success('Template deleted successfully')
    } catch (err) {
      console.error('Delete template error:', err)
      toast.error('Failed to delete template')
      throw err
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  }
}

export default useTemplates
