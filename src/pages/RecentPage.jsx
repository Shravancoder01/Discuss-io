import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import PostCard from '../components/PostCard'
import { fetchPosts, voteOnPost } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { ClockIcon } from '@heroicons/react/24/outline'

export default function RecentPage() {
  const { user } = useAuth()
  const [category, setCategory] = useState(null)

  const categories = [
    { name: 'All', slug: null },
    { name: 'Technology', slug: 'technology' },
    { name: 'Gaming', slug: 'gaming' },
    { name: 'Science', slug: 'science' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Music', slug: 'music' },
    { name: 'Movies', slug: 'movies' },
    { name: 'Books', slug: 'books' },
    { name: 'Food', slug: 'food' },
  ]

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['posts', 'new', category],
    queryFn: () => fetchPosts('new', category)
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
      {/* Recent Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <ClockIcon className="h-8 w-8 text-blue-500" />
          <h1 className="text-2xl font-bold text-white">Recent Posts</h1>
        </div>
        <p className="text-gray-400">
          The newest posts from all communities
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.slug || 'all'}
              onClick={() => setCategory(cat.slug)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                category === cat.slug
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              {cat.name}
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
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">No recent posts</h3>
            <p className="text-gray-400">
              {category ? `No recent posts in ${categories.find(c => c.slug === category)?.name}` : 'No posts have been created yet.'}
            </p>
            {user && (
              <a
                href="/submit"
                className="inline-block mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Create the First Post
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}