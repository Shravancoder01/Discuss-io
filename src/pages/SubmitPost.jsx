import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import RichTextEditor from '../components/RichTextEditor'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const SubmitPost = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [postType, setPostType] = useState(searchParams.get('type') || 'text')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [community, setCommunity] = useState('')
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchCommunities()
  }, [user, navigate])

  const fetchCommunities = async () => {
    const { data, error } = await supabase
      .from('communities')
      .select('name, display_name')
      .order('member_count', { ascending: false })

    if (!error && data) {
      setCommunities(data)
    }
  }

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(fileName, file)

    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }

    if (!community) {
      toast.error('Please select a community')
      return
    }

    setLoading(true)

    try {
      let imageUrl = null
      
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      const postData = {
        title: title.trim(),
        content: postType === 'text' ? content.trim() : linkUrl,
        community_id: community,
        author_id: user.id,
        post_type: postType,
        image_url: imageUrl,
        vote_score: 1 // Author gets automatic upvote
      }

      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select()

      if (error) throw error

      // Add author's upvote
      await supabase
        .from('post_votes')
        .insert({
          post_id: data[0].id,
          user_id: user.id,
          vote_type: 'up'
        })

      toast.success('Post created successfully!')
      navigate(`/post/${data[0].id}`)

    } catch (error) {
      console.error('Error creating post:', error)
      toast.error('Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  const postTypes = [
    { value: 'text', label: 'Text', icon: '📝' },
    { value: 'image', label: 'Image', icon: '🖼️' },
    { value: 'link', label: 'Link', icon: '🔗' }
  ]

  return (
    <div className="max-w-4xl mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Create a Post
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Post Type
            </label>
            <div className="flex space-x-2">
              {postTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setPostType(type.value)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors
                    ${postType === type.value
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Community Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Community
            </label>
            <select
              value={community}
              onChange={(e) => setCommunity(e.target.value)}
              required
              className="input"
            >
              <option value="">Choose a community</option>
              {communities.map((comm) => (
                <option key={comm.name} value={comm.name}>
                  r/{comm.name} - {comm.display_name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="An interesting title"
              maxLength={300}
              required
              className="input"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {title.length}/300 characters
            </p>
          </div>

          {/* Content based on post type */}
          {postType === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content (Optional)
              </label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="What are your thoughts?"
              />
            </div>
          )}

          {postType === 'image' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
            </div>
          )}

          {postType === 'link' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                required={postType === 'link'}
                className="input"
              />
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default SubmitPost
