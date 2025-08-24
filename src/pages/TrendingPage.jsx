import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import PostCard from '../components/PostCard'
import { fetchPosts, voteOnPost } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { ChartBarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline'

export default function TrendingPage() {
  const { user } = useAuth()
  const [sortBy, setSortBy] = useState('hot')

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['posts', sortBy, null],
    queryFn: () => fetchPosts(sortBy, null),
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

  // Mock trending topics (in a real app, this would come from analytics)
  const trendingTopics = [
    { name: 'AI & Machine Learning', posts: 156, growth: '+23%' },
    { name: 'Web3 & Blockchain', posts: 89, growth: '+15%' },
    { name: 'Game Development', posts: 234, growth: '+41%' },
    { name: 'Climate Tech', posts: 67, growth: '+8%' },
    { name: 'Space Exploration', posts: 145, growth: '+19%' },
  ]

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
      {/* Trending Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
          <h1 className="text-2xl font-bold text-white">Trending</h1>
        </div>
        <p className="text-gray-400">Posts and topics gaining momentum right now</p>
      </div>

      {/* Trending Topics */}
      <div className="mb-8 bg-gray-800 rounded-lg p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2 text-green-500" />
          Hot Topics
        </h3>
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <div key={topic.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-green-500 font-bold text-sm">#{index + 1}</span>
                <div>
                  <div className="text-white font-medium">{topic.name}</div>
                  <div className="text-gray-400 text-sm">{topic.posts} posts</div>
                </div>
              </div>
              <div className="text-green-400 text-sm font-medium">{topic.growth}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
          {['hot', 'top', 'new'].map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                sortBy === option
                  ? 'bg-green-500 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Trending Posts */}
      <div className="space-y-4">
        {posts && posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} onVote={handleVote} />)
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <ArrowTrendingUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">No trending posts yet</h3>
            <p className="text-gray-400">Posts will appear here as they gain traction in the community.</p>
          </div>
        )}
      </div>
    </div>
  )
}
