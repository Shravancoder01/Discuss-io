import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import PostCard from '../components/PostCard'
import { fetchPosts, voteOnPost } from '../lib/api'
import { UserGroupIcon, PlusIcon } from '@heroicons/react/24/outline'

export default function CommunityPage() {
  const { category: communityName } = useParams()
  const { user } = useAuth()
  const [sortBy, setSortBy] = useState('hot')
  const [community, setCommunity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [joined, setJoined] = useState(false)

  // Fetch community info from Supabase
  useEffect(() => {
    const fetchCommunity = async () => {
      setLoading(true)
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

      // For private communities, check user membership if logged in
      if (!data.is_public) {
        if (!user) {
          // No user - no access
          setHasAccess(false)
        } else {
          // Check community_members table for approved membership
          const { data: memberData, error: memberError } = await supabase
            .from('community_members')
            .select('approved')
            .eq('community_id', data.id)
            .eq('user_id', user.id)
            .single()

          if (memberError || !memberData || !memberData.approved) {
            setHasAccess(false)
          } else {
            setHasAccess(true)
          }
        }
      } else {
        // Public community - everyone has access
        setHasAccess(true)
      }

      setCommunity(data)
      setLoading(false)
    }

    fetchCommunity()
  }, [communityName, user])

  // Fetch posts only if user has access
  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['posts', sortBy, communityName],
    queryFn: () => fetchPosts(sortBy, communityName),
    enabled: hasAccess && !!communityName
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

  const handleJoin = async () => {
    if (!user || !community) return

    // Insert membership request with approved = false initially
    const { error } = await supabase
      .from('community_members')
      .upsert([
        {
          community_id: community.id,
          user_id: user.id,
          approved: false
        }
      ])

    if (error) {
      console.error('Error joining community:', error)
    } else {
      // You might want to notify user that request is pending approval
      setJoined(true)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-800 rounded-lg h-48"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!community) {
    return <div className="max-w-4xl mx-auto py-6 text-white">Community not found</div>
  }

  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto py-6 text-center text-white">
        <h2>This community is private</h2>
        <p>You must be an approved member to view the content.</p>
        {user ? (
          <>
            <button
              onClick={handleJoin}
              disabled={joined}
              className={`mt-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                joined ? 'bg-gray-600 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {joined ? 'Join Request Sent' : 'Request to Join'}
            </button>
          </>
        ) : (
          <p>
            Please <Link to="/login" className="text-orange-500 underline">log in</Link> to request access.
          </p>
        )}
      </div>
    )
  }

  // For community info, you may want to replace hardcoded communityInfo with your DB data or fallback stuff
  const communityInfo = {
    name: community.name,
    description: community.description || `Community for ${community.name} discussions.`,
    members: 'N/A', // You can query member count on demand if needed
    color: 'bg-gray-700', // Adjust color as needed or store in DB
    rules: ['Be respectful', 'Stay on topic', 'Follow community guidelines'] // You could fetch rules from DB or keep static
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      {/* Community Header */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 ${communityInfo.color} rounded-full flex items-center justify-center`}>
              <span className="text-white font-bold text-xl">
                {communityInfo.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">d/{communityName}</h1>
              <p className="text-gray-400 mt-1">{communityInfo.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-300">
                <span className="flex items-center">
                  <UserGroupIcon className="h-4 w-4 mr-1" />
                  {communityInfo.members} members
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            {user && (
              <>
                <button
                  onClick={handleJoin}
                  disabled={joined}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    joined
                      ? 'bg-gray-600 hover:bg-gray-700 text-white cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  {joined ? 'Joined' : 'Join'}
                </button>
                <Link
                  to="/submit"
                  className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Post
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Sort Options */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
              {['hot', 'new', 'top'].map((option) => (
                <button
                  key={option}
                  onClick={() => setSortBy(option)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                    sortBy === option
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
            {isLoading ? (
              <div>Loading posts...</div>
            ) : posts && posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post.id} post={post} onVote={handleVote} />
              ))
            ) : (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <h3 className="text-white font-medium mb-2">No posts yet</h3>
                <p className="text-gray-400 mb-4">
                  Be the first to post in d/{communityName}!
                </p>
                {user && (
                  <Link
                    to="/submit"
                    className="inline-block px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
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
          {/* Community Rules */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-white font-semibold mb-4">Community Rules</h3>
            <ol className="space-y-2">
              {communityInfo.rules.map((rule, index) => (
                <li key={index} className="text-gray-300 text-sm">
                  <span className="text-orange-500 font-medium">{index + 1}.</span> {rule}
                </li>
              ))}
            </ol>
          </div>

          {/* About */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-white font-semibold mb-4">About Community</h3>
            <p className="text-gray-300 text-sm mb-4">{communityInfo.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Members</span>
                <span className="text-white">{communityInfo.members}</span>
              </div>
              {/* Add more about info here if desired */}
            </div>
          </div>

          {/* Moderators */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-white font-semibold mb-4">Moderators</h3>
            <div className="space-y-3">
              {/* You can fetch and render moderators from DB */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">M</span>
                </div>
                <span className="text-gray-300 text-sm">u/moderator1</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
                <span className="text-gray-300 text-sm">u/admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
