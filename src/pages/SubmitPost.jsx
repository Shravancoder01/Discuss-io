import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useCommunities } from '../hooks/useCommunities'

// Static categories (permanent!)
const categories = [
  'technology',
  'gaming',
  'science',
  'sports',
  'music',
  'movies',
  'books',
  'food',
  'photography',
  'announcements'
]

export default function SubmitPost() {
  const { communities, loading } = useCommunities()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [loadingPost, setLoadingPost] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  // Merge static and dynamic, filter out duplicates based on lowercased name
  const dynamicCommunities = communities.filter(
    comm => !categories.includes(comm.name.toLowerCase())
  )
  const allCommunities = [...categories, ...dynamicCommunities.map(comm => comm.name.toLowerCase())]

  if (!user) {
    navigate('/login')
    return null
  }

  if (loading) return <div>Loading communities...</div>

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoadingPost(true)
    try {
      const { error } = await supabase
        .from('app_97300927f3_posts')
        .insert([
          {
            title,
            content,
            author_id: user.id,
            author_username: user.user_metadata?.username || user.email,
            category,
          }
        ])

      if (error) {
        alert('Error creating post: ' + error.message)
        setLoadingPost(false)
        return
      }
      navigate('/')
    } finally {
      setLoadingPost(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Create a post</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Community Selection */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
              Choose a community
            </label>
            <select
              id="category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              {allCommunities.map((cat) => (
                <option key={cat} value={cat}>
                  d/{cat}
                </option>
              ))}
            </select>
          </div>
          
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="An interesting title"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
              maxLength={300}
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {title.length}/300
            </div>
          </div>
          
          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
              Text (optional)
            </label>
            <textarea
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Text (optional)"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={8}
            />
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
              disabled={!title.trim() || loadingPost}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {loadingPost ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>

      {/* Posting Guidelines */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mt-6">
        <h3 className="text-white font-semibold mb-3">Posting to discus-io</h3>
        <ul className="text-sm text-gray-300 space-y-2">
          <li>• Remember the human</li>
          <li>• Behave like you would in real life</li>
          <li>• Look for the original source of content</li>
          <li>• Search for duplicates before posting</li>
          <li>• Read the community's rules</li>
        </ul>
      </div>
    </div>
  )
}
