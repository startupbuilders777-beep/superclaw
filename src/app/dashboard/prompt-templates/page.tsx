'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface PromptTemplate {
  id: string
  name: string
  description: string
  content: string
  category: string
}

export default function PromptTemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<PromptTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null)
  const [editedContent, setEditedContent] = useState('')
  const [showSaved, setShowSaved] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/prompt-templates')
      const data = await res.json()
      setTemplates(data.templates || [])
      if (data.templates?.length > 0) {
        setSelectedTemplate(data.templates[0])
        setEditedContent(data.templates[0].content)
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveTemplates = async () => {
    setSaving(true)
    try {
      const updatedTemplates = templates.map(t => 
        t.id === selectedTemplate?.id 
          ? { ...t, content: editedContent }
          : t
      )
      
      const res = await fetch('/api/prompt-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templates: updatedTemplates })
      })
      
      if (res.ok) {
        setTemplates(updatedTemplates)
        setShowSaved(true)
        setTimeout(() => setShowSaved(false), 2000)
      }
    } catch (error) {
      console.error('Failed to save templates:', error)
    } finally {
      setSaving(false)
    }
  }

  const selectTemplate = (template: PromptTemplate) => {
    setSelectedTemplate(template)
    setEditedContent(template.content)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'greeting': return 'bg-green-900 text-green-200'
      case 'system': return 'bg-blue-900 text-blue-200'
      case 'fallback': return 'bg-yellow-900 text-yellow-200'
      default: return 'bg-gray-700 text-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading templates...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push('/dashboard')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Back
              </button>
              <h1 className="text-xl font-bold text-white">Prompt Templates</h1>
            </div>
            <button
              onClick={saveTemplates}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg font-medium transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </header>

      {/* Saved Notification */}
      {showSaved && (
        <div className="fixed top-20 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          ✓ Saved successfully!
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template List */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Templates</h2>
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => selectTemplate(template)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }`}
                >
                  <div className="font-medium">{template.name}</div>
                  <div className={`text-xs mt-1 inline-block px-2 py-0.5 rounded ${getCategoryColor(template.category)}`}>
                    {template.category}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Editor */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg border border-gray-700 p-6">
            {selectedTemplate ? (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{selectedTemplate.name}</h2>
                    <p className="text-gray-400 text-sm mt-1">{selectedTemplate.description}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(selectedTemplate.category)}`}>
                    {selectedTemplate.category}
                  </span>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prompt Content
                  </label>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={12}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg p-4 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Enter your prompt template..."
                  />
                </div>

                <div className="flex justify-between items-center text-sm text-gray-400">
                  <span>{editedContent.length} characters</span>
                  <span>Preview available on save</span>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-400 py-12">
                Select a template to edit
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-3">💡 Tips for Effective Prompts</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• Be specific about your agent&apos;s role and personality</li>
            <li>• Include examples of desired responses</li>
            <li>• Define clear boundaries and limitations</li>
            <li>• Add context about your brand voice and style</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
