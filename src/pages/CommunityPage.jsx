import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import PostCard from '../components/PostCard'
import { fetchPosts, voteOnPost } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { UserGroupIcon, PlusIcon } from '@heroicons/react/24/outline'

const communityInfo = {
  technology: {
    name: 'Technology',
    description: 'Discussions about the latest in tech, programming, and innovation.',
    members: '125K',
    color: 'bg-blue-500',
    rules: ['Be respectful', 'No spam or self-promotion', 'Stay on topic', 'Use proper flair']
  },
  gaming: {
    name: 'Gaming',
    description: 'All things gaming - from indie games to AAA titles.',
    members: '89K',
    color: 'bg-purple-500',
    rules: ['No toxicity', 'Mark spoilers', 'No piracy discussion', 'Original content preferred']
  },
  science: {
    name: 'Science',
    description: 'Share and discuss scientific discoveries and research.',
    members: '67K',
    color: 'bg-green-500',
    rules: ['Cite sources', 'No pseudoscience', 'Peer-reviewed preferred', 'Explain like I\'m 5 welcome']
  },
  sports: {
    name: 'Sports',
    description: 'Sports news, highlights, and discussions.',
    members: '78K',
    color: 'bg-red-500',
    rules: ['No personal attacks', 'Keep it civil', 'No betting promotion', 'All sports welcome']
  },
  music: {
    name: 'Music',
    description: 'Share your favorite tracks, discuss artists, and discover new music.',
    members: '92K',
    color: 'bg-pink-500',
    rules: ['Support artists', 'No illegal downloads', 'Share discoveries', 'All genres welcome']
  },
  movies: {
    name: 'Movies',
    description: 'Movie reviews, discussions, and recommendations.',
    members: '103K',
    color: 'bg-yellow-500',
    rules: ['Mark spoilers', 'Be constructive', 'No cam recordings', 'Include ratings']
  },
  books: {
    name: 'Books',
    description: 'Book recommendations, reviews, and literary discussions.',
    members: '45K',
    color: 'bg-indigo-500',
    rules: ['No spoilers in titles', 'Mark spoilers', 'Include genre', 'Support authors']
  },
  food: {
    name: 'Food',
    description: 'Recipes, restaurant reviews, and culinary adventures.',
    members: '134K',
    color: 'bg-orange-500',
    rules: ['Share recipes', 'No food shaming', 'Include ingredients', 'Safety first']
  }
}

export default function CommunityPage() {
  const { category } = useParams()
  const { user } = useAuth()
  const [sortBy, setSortBy] = useState('hot')
  const [joined, setJoined] = useState(false)

  const community = communityInfo[category] || {
    name: category,
    description: `Community for ${category} discussions.`,
    members: '0',
    color: 'bg-gray-500',
    rules: ['Be respectful', 'Stay on topic', 'Follow community guidelines']
  }

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

  const handleJoin = () => {
    setJoined(!joined)
  }

  if (isLoading) {
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

  return (
    <div className="max-w-4xl mx-auto py-6">
      {/* Community Header */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 ${community.color} rounded-full flex items-center justify-center`}>
              <span className="text-white font-bold text-xl">
                {community.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">d/{category}</h1>
              <p className="text-gray-400 mt-1">{community.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-300">
                <span className="flex items-center">
                  <UserGroupIcon className="h-4 w-4 mr-1" />
                  {community.members} members
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            {user && (
              <>
                <button
                  onClick={handleJoin}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    joined
                      ? 'bg-gray-600 hover:bg-gray-700 text-white'
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
              {community.rules.map((rule, index) => (
                <li key={index} className="text-gray-300 text-sm">
                  <span className="text-orange-500 font-medium">{index + 1}.</span> {rule}
                </li>
              ))}
            </ol>
          </div>

          {/* About */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-white font-semibold mb-4">About Community</h3>
            <p className="text-gray-300 text-sm mb-4">{community.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Members</span>
                <span className="text-white">{community.members}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Created</span>
                <span className="text-white">Jan 2024</span>
              </div>
            </div>
          </div>

          {/* Moderators */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-white font-semibold mb-4">Moderators</h3>
            <div className="space-y-3">
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