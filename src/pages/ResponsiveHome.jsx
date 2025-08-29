import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ResponsivePostCard from '../components/PostCard'
import CreatePostCard from '../components/CreatePostCard'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const ResponsiveHome = ({ onToggleSidebar, isMobile }) => {
  const [sortBy, setSortBy] = useState('hot')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { user } = useAuth()

  const sortOptions = [
    { value: 'hot', label: 'Hot', icon: '🔥' },
    { value: 'new', label: 'New', icon: '🆕' },
    { value: 'top', label: 'Top', icon: '⭐' },
    { value: 'rising', label: 'Rising', icon: '📈' }
  ]

  const fetchPosts = async (reset = false) => {
    setLoading(reset)
    const currentPage = reset ? 1 : page

    let query = supabase
      .from('posts')
      .select(`
        *,
        communities(name, display_name),
        user_profiles(username, display_name, avatar_url),
        post_votes(vote_type),
        saved_posts(id)
      `)
      .range((currentPage - 1) * 10, currentPage * 10 - 1)

    // Apply user-specific filters
    if (user) {
      query = query
        .eq('post_votes.user_id', user.id)
        .eq('saved_posts.user_id', user.id)
    }

    // Apply sorting
    switch (sortBy) {
      case 'new':
        query = query.order('created_at', { ascending: false })
        break
      case 'top':
        query = query.order('vote_score', { ascending: false })
        break
      case 'rising':
        // Rising posts: recent posts with good vote ratio
        query = query
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order('vote_score', { ascending: false })
        break
      default: // hot
        query = query.order('created_at', { ascending: false })
        break
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch posts:', error.message)
      setPosts(reset ? [] : posts)
    } else {
      const processedPosts = data?.map(post => ({
        ...post,
        author: post.user_profiles?.username || 'Unknown',
        category: post.communities?.name || 'general',
        user_vote: post.post_votes?.[0]?.vote_type || null,
        isSaved: post.saved_posts?.length > 0
      })) || []

      if (reset) {
        setPosts(processedPosts)
        setPage(2)
      } else {
        setPosts(prev => [...prev, ...processedPosts])
        setPage(prev => prev + 1)
      }
      setHasMore(processedPosts.length === 10)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPosts(true)
  }, [sortBy, user])

  const handleVote = async (postId, voteType) => {
    if (!user) return

    // Optimistic update
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              vote_score: post.user_vote === voteType 
                ? post.vote_score - (voteType === 'up' ? 1 : -1)
                : post.user_vote 
                  ? post.vote_score + (voteType === 'up' ? 2 : -2)
                  : post.vote_score + (voteType === 'up' ? 1 : -1),
              user_vote: post.user_vote === voteType ? null : voteType
            }
          : post
      )
    )

    // Database update
    try {
      if (posts.find(p => p.id === postId)?.user_vote === voteType) {
        // Remove vote
        await supabase
          .from('post_votes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
      } else {
        // Add or update vote
        await supabase
          .from('post_votes')
          .upsert({
            post_id: postId,
            user_id: user.id,
            vote_type: voteType
          })
      }

      // Update post vote count
      const { data: votes } = await supabase
        .from('post_votes')
        .select('vote_type')
        .eq('post_id', postId)

      const upvotes = votes?.filter(v => v.vote_type === 'up').length || 0
      const downvotes = votes?.filter(v => v.vote_type === 'down').length || 0

      await supabase
        .from('posts')
        .update({ vote_score: upvotes - downvotes })
        .eq('id', postId)

    } catch (error) {
      console.error('Error voting:', error)
      // Revert optimistic update on error
      fetchPosts(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Create Post Card */}
        {user && <CreatePostCard className="mb-4 sm:mb-6" />}

        {/* Sort Options */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto scrollbar-hide">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`
                  flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-all whitespace-nowrap
                  ${sortBy === option.value
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <span className="hidden sm:inline">{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-3 sm:space-y-4">
          {loading && posts.length === 0 ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
                  <div className="flex space-x-4">
                    <div className="w-10 h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No posts yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Be the first to share something interesting!
              </p>
            </div>
          ) : (
            <>
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ResponsivePostCard
                    post={post}
                    onVote={handleVote}
                    className="rounded-lg sm:rounded-xl"
                  />
                </motion.div>
              ))}
              
              {hasMore && (
                <div className="flex justify-center py-8">
                  {loading ? (
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Loading more posts...</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => fetchPosts(false)}
                      className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                    >
                      Load More Posts
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResponsiveHome
