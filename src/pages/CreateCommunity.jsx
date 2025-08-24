import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function CreateCommunity() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    navigate('/login')
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('communities')
        .insert([
          {
            name: name.toLowerCase(),
            description,
            is_public: isPublic,
            owner_id: user.id,
          }
        ])

      if (error) {
        console.error('Error creating community:', error)
        // Optionally show a user-friendly notification here
        setLoading(false)
        return
      }

      navigate(`/category/${name.toLowerCase()}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Create a community</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Community Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Community name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                d/
              </span>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="technology"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-8 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                maxLength={21}
                pattern="[a-zA-Z0-9_]+"
                title="Community names can only contain letters, numbers, and underscores"
              />
            </div>
            <div className="text-right text-xs text-gray-400 mt-1">
              {name.length}/21
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Community names including capitalization cannot be changed.
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is your community about?"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {description.length}/500
            </div>
          </div>

          {/* Community Type */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">Community type</h3>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                  className="mt-1 text-orange-500 bg-gray-700 border-gray-600 focus:ring-orange-500"
                />
                <div>
                  <div className="text-white font-medium">Public</div>
                  <div className="text-sm text-gray-400">
                    Anyone can view, post, and comment to this community
                  </div>
                </div>
              </label>
              
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                  className="mt-1 text-orange-500 bg-gray-700 border-gray-600 focus:ring-orange-500"
                />
                <div>
                  <div className="text-white font-medium">Private</div>
                  <div className="text-sm text-gray-400">
                    Only approved users can view and submit to this community
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Adult Content Warning */}
          <div className="bg-gray-700 rounded-lg p-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 text-orange-500 bg-gray-700 border-gray-600 focus:ring-orange-500"
              />
              <div>
                <div className="text-white font-medium">18+ year old community</div>
                <div className="text-sm text-gray-400">
                  This community contains mature content
                </div>
              </div>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {loading ? 'Creating...' : 'Create Community'}
            </button>
          </div>
        </form>
      </div>

      {/* Guidelines */}
      <div className="bg-gray-800 rounded-lg p-4 mt-6">
        <h3 className="text-white font-semibold mb-3">Community Guidelines</h3>
        <ul className="text-sm text-gray-300 space-y-2">
          <li>• Choose a name that reflects your community's purpose</li>
          <li>• Keep the description clear and welcoming</li>
          <li>• Set clear rules for your community members</li>
          <li>• Be respectful and foster healthy discussions</li>
        </ul>
      </div>
    </div>
  )
}
