import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import PostCard from '../components/PostCard'
import { fetchPosts, voteOnPost } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { FireIcon } from '@heroicons/react/24/outline'

export default function PopularPage() {
  const { user } = useAuth()
  const [timeframe, setTimeframe] = useState('week')

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['posts', 'top', null, timeframe],
    queryFn: () => fetchPosts('top', null)
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
      {/* Popular Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <FireIcon className="h-8 w-8 text-orange-500" />
          <h1 className="text-2xl font-bold text-white">Popular Posts</h1>
        </div>
        <p className="text-gray-400">
          The most upvoted posts across all communities
        </p>
      </div>

      {/* Timeframe Selection */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
          {['today', 'week', 'month', 'year', 'all'].map((option) => (
            <button
              key={option}
              onClick={() => setTimeframe(option)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                timeframe === option
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              {option}
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
            <FireIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">No popular posts yet</h3>
            <p className="text-gray-400">
              Check back later or be the first to create a popular post!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}