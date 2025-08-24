import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import PostCard from '../components/PostCard'
import { fetchPosts, voteOnPost } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

export default function CategoryPage() {
  const { category } = useParams()
  const { user } = useAuth()
  const [sortBy, setSortBy] = useState('hot')

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['posts', sortBy, category],
    queryFn: () => fetchPosts(sortBy, category)
  })

  const handleVote = async (postId, voteType) => {
    if (!user) return
    try {
      await voteOnPost(postId, voteType)
      refetch()
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      {/* Category Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">d/{category}</h1>
        <p className="text-gray-400">
          Posts in the {category} category
        </p>
      </div>

      {/* Sort Options */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
          {['hot', 'new', 'top'].map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                sortBy === option
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onVote={handleVote} />
          ))
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <h3 className="text-white font-medium mb-2">No posts yet</h3>
            <p className="text-gray-400 mb-4">
              Be the first to post in d/{category}!
            </p>
            {user && (
              <a
                href="/submit"
                className="inline-block px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                Create Post
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}