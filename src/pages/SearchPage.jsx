import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import PostCard from '../components/PostCard'
import { searchPosts, voteOnPost } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['search', searchParams.get('q')],
    queryFn: () => searchPosts(searchParams.get('q')),
    enabled: !!searchParams.get('q')
  })

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      setSearchParams({ q: query.trim() })
    }
  }

  const handleVote = async (postId, voteType) => {
    if (!user) return
    try {
      await voteOnPost(postId, voteType)
      refetch()
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const searchQuery = searchParams.get('q')

  return (
    <div className="max-w-2xl mx-auto py-6">
      {/* Search Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-4">Search</h1>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="relative mb-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </form>

        {searchQuery && (
          <p className="text-gray-400">
            Search results for "{searchQuery}"
          </p>
        )}
      </div>

      {/* Results */}
      {searchQuery && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-lg h-32"></div>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} onVote={handleVote} />
            ))
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">No results found</h3>
              <p className="text-gray-400">
                Try different keywords or check your spelling.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Search Tips */}
      {!searchQuery && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-white font-semibold mb-3">Search Tips</h3>
          <ul className="text-gray-300 space-y-2">
            <li>• Use specific keywords for better results</li>
            <li>• Try different variations of your search terms</li>
            <li>• Search works across post titles and content</li>
            <li>• Results are sorted by most recent first</li>
          </ul>
        </div>
      )}
    </div>
  )
}