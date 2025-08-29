import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import ResponsivePostCard from '../components/PostCard'
import CreatePostCard from '../components/CreatePostCard'
import { UserGroupIcon, PlusIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function CommunityPage() {
  const { category: communityName } = useParams()
  const { user } = useAuth()
  const [sortBy, setSortBy] = useState('hot')
  const [community, setCommunity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [joined, setJoined] = useState(false)
  const [memberCount, setMemberCount] = useState(0)
  const [moderators, setModerators] = useState([])

  // Fetch community info from Supabase
  useEffect(() => {
    const fetchCommunity = async () => {
      setLoading(true)
      
      try {
        // Fetch community data
        const { data, error } = await supabase
          .from('communities')
          .select('*')
          .eq('name', communityName)
          .single()

        if (error) {
          console.error(error)
          setCommunity(null)
          setLoading(false)
          return
        }

        // Check if user is already a member
        if (user) {
          const { data: memberData } = await supabase
            .from('community_members')
            .select('role, joined_at')
            .eq('community_id', data.id)
            .eq('user_id', user.id)
            .single()

          if (memberData) {
            setJoined(true)
          }
        }

        // Get member count
        const { count } = await supabase
          .from('community_members')
          .select('*', { count: 'exact', head: true })
          .eq('community_id', data.id)

        setMemberCount(count || 0)

        // Get moderators
        const { data: modData } = await supabase
          .from('community_members')
          .select(`
            user_id,
            role,
            user_profiles(username, display_name, avatar_url)
          `)
          .eq('community_id', data.id)
          .in('role', ['moderator', 'admin'])

        setModerators(modData || [])

        // Set access permissions
        setHasAccess(true) // For now, assume all communities are public

        setCommunity(data)
      } catch (error) {
        console.error('Error fetching community:', error)
        setCommunity(null)
      }
      
      setLoading(false)
    }

    if (communityName) {
      fetchCommunity()
    }
  }, [communityName, user])

  // Fetch posts for community
  const fetchPosts = async () => {
    if (!community) return []

    let query = supabase
      .from('posts')
      .select(`
        *,
        user_profiles(username, display_name, avatar_url),
        post_votes(vote_type),
        saved_posts(id),
        comments(count)
      `)
      .eq('community_id', community.id)

    // Apply user-specific filters if logged in
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
      case 'hot':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching posts:', error)
      return []
    }

    // Process posts data
    return data?.map(post => ({
      ...post,
      author: post.user_profiles?.username || 'Unknown',
      category: community.name,
      user_vote: post.post_votes?.[0]?.vote_type || null,
      isSaved: post.saved_posts?.length > 0,
      comment_count: post.comments?.length || 0
    })) || []
  }

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['community-posts', sortBy, communityName, community?.id],
    queryFn: fetchPosts,
    enabled: hasAccess && !!community,
    staleTime: 30000
  })

  const handleVote = async (postId, voteType) => {
    if (!user) {
      toast.error('Please login to vote')
      return
    }

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('post_votes')
        .select('vote_type')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single()

      if (existingVote?.vote_type === voteType) {
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

      refetch()
    } catch (error) {
      console.error('Error voting:', error)
      toast.error('Failed to vote')
    }
  }

  const handleJoin = async () => {
    if (!user || !community) {
      toast.error('Please login to join communities')
      return
    }

    try {
      if (joined) {
        // Leave community
        await supabase
          .from('community_members')
          .delete()
          .eq('community_id', community.id)
          .eq('user_id', user.id)

        setJoined(false)
        setMemberCount(prev => prev - 1)
        toast.success('Left community')
      } else {
        // Join community
        await supabase
          .from('community_members')
          .insert({
            community_id: community.id,
            user_id: user.id,
            role: 'member'
          })

        setJoined(true)
        setMemberCount(prev => prev + 1)
        toast.success('Joined community!')
      }
    } catch (error) {
      console.error('Error joining/leaving community:', error)
      toast.error('Failed to update membership')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg h-48"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Community not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The community you're looking for doesn't exist.
          </p>
          <Link
            to="/"
            className="btn-primary"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const sortOptions = [
    { value: 'hot', label: 'Hot', icon: '🔥' },
    { value: 'new', label: 'New', icon: '🆕' },
    { value: 'top', label: 'Top', icon: '⭐' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Community Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            <div className="flex items-center space-x-4">
              {/* Community Avatar */}
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {community.display_name?.charAt(0).toUpperCase() || community.name.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  r/{community.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {community.description || `Welcome to r/${community.name}`}
                </p>
                
                {/* Stats */}
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <UserGroupIcon className="w-4 h-4 mr-1" />
                    {memberCount.toLocaleString()} members
                  </span>
                  <span className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    Created {new Date(community.created_at).getFullYear()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {user && (
                <>
                  <button
                    onClick={handleJoin}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      joined
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    {joined ? 'Joined' : 'Join'}
                  </button>
                  
                  <Link
                    to={`/submit?community=${community.name}`}
                    className="flex items-center px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Create Post</span>
                    <span className="sm:hidden">Post</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post Card */}
            {user && joined && (
              <CreatePostCard className="mb-6" />
            )}

            {/* Sort Options */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                      sortBy === option.value
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
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
              ) : posts && posts.length > 0 ? (
                posts.map((post) => (
                  <ResponsivePostCard 
                    key={post.id} 
                    post={post} 
                    onVote={handleVote}
                    className="rounded-lg"
                  />
                ))
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No posts yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Be the first to post in r/{community.name}!
                  </p>
                  {user && joined && (
                    <Link
                      to={`/submit?community=${community.name}`}
                      className="btn-primary"
                    >
                      Create Post
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* About Community */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                About Community
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {community.description || `Welcome to r/${community.name} - a place for meaningful discussions.`}
              </p>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Members</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {memberCount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Created</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {new Date(community.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Community Rules */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Community Rules
              </h3>
              <ol className="space-y-2 text-sm">
                <li className="text-gray-600 dark:text-gray-400">
                  <span className="text-orange-500 font-medium">1.</span> Be respectful and civil
                </li>
                <li className="text-gray-600 dark:text-gray-400">
                  <span className="text-orange-500 font-medium">2.</span> Stay on topic
                </li>
                <li className="text-gray-600 dark:text-gray-400">
                  <span className="text-orange-500 font-medium">3.</span> No spam or self-promotion
                </li>
                <li className="text-gray-600 dark:text-gray-400">
                  <span className="text-orange-500 font-medium">4.</span> Follow community guidelines
                </li>
              </ol>
            </div>

            {/* Moderators */}
            {moderators.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Moderators
                </h3>
                <div className="space-y-3">
                  {moderators.map((mod) => (
                    <div key={mod.user_id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="text-gray-900 dark:text-white text-sm font-medium">
                          u/{mod.user_profiles?.username || 'moderator'}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {mod.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
