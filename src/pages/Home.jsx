import { useState, useEffect } from 'react'
import PostCard from '../components/PostCard'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [sortBy, setSortBy] = useState('hot')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    setLoading(true)

    let query = supabase
      .from('app_97300927f3_posts')
      .select('*')

    if (sortBy === 'new') {
      query = query.order('created_at', { ascending: false })
    } else if (sortBy === 'top') {
      query = query.order('vote_score', { ascending: false })
    } else {
      // For 'hot', default ordering by newest for now
      query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      alert('Failed to fetch posts: ' + error.message)
      setPosts([])
    } else {
      setPosts(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPosts()
  }, [sortBy])

  const handleVote = async (postId, voteType) => {
    console.log(`Voting ${voteType} on post ${postId}`)
    // Implement vote logic with Supabase here later
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
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
        {loading && <p className="text-center text-gray-400">Loading posts...</p>}
        {!loading && posts.length === 0 && <p className="text-center text-gray-400">No posts to display.</p>}
        {!loading && posts.map((post) => (
          <PostCard key={post.id} post={post} onVote={handleVote} />
        ))}
      </div>

      {/* Load More */}
      <div className="mt-8 text-center">
        <button
          onClick={() => alert('Load more posts not implemented')}
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Load More Posts
        </button>
      </div>
    </div>
  )
}
