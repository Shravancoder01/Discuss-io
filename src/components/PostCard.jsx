import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { 
  ChevronUpIcon, 
  ChevronDownIcon, 
  ChatBubbleLeftIcon, 
  ShareIcon,
  BookmarkIcon 
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'

export default function PostCard({ post, onVote }) {
  const { user } = useAuth()
  const [isVoting, setIsVoting] = useState(false)

  const handleVote = async (voteType) => {
    if (!user || isVoting) return
    
    setIsVoting(true)
    try {
      await onVote(post.id, voteType)
    } finally {
      setIsVoting(false)
    }
  }

  const getVoteColor = (voteType) => {
    if (!user) return 'text-gray-400'
    if (post.user_vote === voteType) {
      return voteType === 'up' ? 'text-orange-500' : 'text-blue-500'
    }
    return 'text-gray-400'
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors">
      <div className="flex">
        {/* Vote Section */}
        <div className="flex flex-col items-center p-2 bg-gray-900 space-y-1">
          <button
            onClick={() => handleVote('up')}
            disabled={!user || isVoting}
            className={`p-1 rounded hover:bg-gray-700 transition-colors ${getVoteColor('up')} ${
              !user ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <ChevronUpIcon className="h-6 w-6" />
          </button>
          <span className="text-xs font-bold text-white">
            {post.vote_score || 0}
          </span>
          <button
            onClick={() => handleVote('down')}
            disabled={!user || isVoting}
            className={`p-1 rounded hover:bg-gray-700 transition-colors ${getVoteColor('down')} ${
              !user ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <ChevronDownIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4">
          {/* Post Meta */}
          <div className="flex items-center space-x-2 text-xs text-gray-400 mb-2">
            <Link
              to={`/category/${post.category}`}
              className="hover:text-white transition-colors"
            >
              d/{post.category}
            </Link>
            <span>•</span>
            <span>Posted by</span>
            <Link
              to={`/user/${post.author}`}
              className="hover:text-white transition-colors"
            >
              u/{post.author}
            </Link>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(post.created_at))} ago</span>
          </div>

          {/* Title */}
          <Link to={`/post/${post.id}`}>
            <h2 className="text-white font-medium mb-2 hover:text-blue-400 transition-colors">
              {post.title}
            </h2>
          </Link>

          {/* Content Preview */}
          {post.content && (
            <p className="text-gray-300 text-sm mb-3 line-clamp-3">
              {post.content}
            </p>
          )}

          {/* Image */}
          {post.image_url && (
            <div className="mb-3">
              <img
                src={post.image_url}
                alt={post.title}
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4 text-gray-400">
            <Link
              to={`/post/${post.id}`}
              className="flex items-center space-x-1 hover:text-white transition-colors"
            >
              <ChatBubbleLeftIcon className="h-4 w-4" />
              <span className="text-xs">{post.comment_count || 0} Comments</span>
            </Link>
            <button className="flex items-center space-x-1 hover:text-white transition-colors">
              <ShareIcon className="h-4 w-4" />
              <span className="text-xs">Share</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-white transition-colors">
              <BookmarkIcon className="h-4 w-4" />
              <span className="text-xs">Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}