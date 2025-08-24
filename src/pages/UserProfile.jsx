import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import PostCard from '../components/PostCard'
import { fetchUserProfile, fetchUserPosts, voteOnPost } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { UserIcon, CalendarIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { formatDistanceToNow } from 'date-fns'

export default function UserProfile() {
  const { username } = useParams()
  const { user } = useAuth()

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => fetchUserProfile(username)
  })

  const { data: posts, isLoading: postsLoading, refetch } = useQuery({
    queryKey: ['userPosts', username],
    queryFn: () => fetchUserPosts(username)
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

  if (profileLoading) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <div className="animate-pulse">
          <div className="bg-gray-800 rounded-lg h-48 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">User not found</h2>
          <p className="text-gray-400">The user u/{username} doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      {/* User Header */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-2">
              u/{profile.username}
            </h1>
            
            {profile.bio && (
              <p className="text-gray-300 mb-4">{profile.bio}</p>
            )}

            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  Joined {formatDistanceToNow(new Date(profile.created_at))} ago
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-orange-500 font-bold">
                  {profile.karma || 0}
                </span>
                <span>karma</span>
              </div>
            </div>
          </div>

          {/* Edit Profile Button (if own profile) */}
          {user?.user_metadata?.username === username && (
            <button className="px-4 py-2 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 rounded-lg transition-colors">
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Posts Section */}
      <div>
        <div className="flex items-center space-x-2 mb-6">
          <ChatBubbleLeftIcon className="h-5 w-5 text-gray-400" />
          <h2 className="text-xl font-bold text-white">
            Posts by u/{profile.username}
          </h2>
        </div>

        {postsLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg h-32"></div>
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onVote={handleVote} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <ChatBubbleLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">No posts yet</h3>
            <p className="text-gray-400">
              u/{profile.username} hasn't posted anything yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}