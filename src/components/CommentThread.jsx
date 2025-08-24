import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChatBubbleLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon as ChevronDownIconCollapse,
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'

export default function CommentThread({ comment, onVote, onReply, depth = 0 }) {
  const { user } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isVoting, setIsVoting] = useState(false)
  const [isReplying, setIsReplying] = useState(false)

  const handleVote = async (voteType) => {
    if (!user || isVoting) return
    setIsVoting(true)
    try {
      await onVote(comment.id, voteType)
    } finally {
      setIsVoting(false)
    }
  }

  const handleReply = async (e) => {
    e.preventDefault()
    if (!user || !replyContent.trim() || isReplying) return
    setIsReplying(true)
    try {
      await onReply(comment.id, replyContent.trim())
      setReplyContent('')
      setShowReplyForm(false)
    } finally {
      setIsReplying(false)
    }
  }

  const getVoteColor = (voteType) => {
    if (!user) return 'text-gray-400'
    if (comment.user_vote === voteType) {
      return voteType === 'up' ? 'text-orange-500' : 'text-blue-500'
    }
    return 'text-gray-400'
  }

  const indentLevel = Math.min(depth, 8)

  return (
    <div className={`${depth > 0 ? 'ml-4 border-l-2 border-gray-700 pl-4' : ''}`}>
      <div className="bg-gray-800 rounded-lg p-3 mb-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <Link
              to={`/user/${comment.author_username}`}
              className="font-medium hover:text-white transition-colors"
            >
              u/{comment.author_username}
            </Link>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(comment.created_at))} ago</span>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIconCollapse className="h-4 w-4" />
            )}
          </button>
        </div>

        {!isCollapsed && (
          <>
            <div className="text-gray-300 text-sm mb-3 whitespace-pre-wrap">{comment.content}</div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleVote('up')}
                  disabled={!user || isVoting}
                  className={`p-1 rounded hover:bg-gray-700 transition-colors ${getVoteColor('up')} ${
                    !user ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <ChevronUpIcon className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold text-gray-300">{comment.vote_score || 0}</span>
                <button
                  onClick={() => handleVote('down')}
                  disabled={!user || isVoting}
                  className={`p-1 rounded hover:bg-gray-700 transition-colors ${getVoteColor('down')} ${
                    !user ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <ChevronDownIcon className="h-4 w-4" />
                </button>
              </div>
              {user && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors text-xs"
                >
                  <ChatBubbleLeftIcon className="h-4 w-4" />
                  <span>Reply</span>
                </button>
              )}
            </div>

            {showReplyForm && (
              <form onSubmit={handleReply} className="mt-3">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="What are your thoughts?"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={3}
                  required
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReplyForm(false)
                      setReplyContent('')
                    }}
                    className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!replyContent.trim() || isReplying}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {isReplying ? 'Replying...' : 'Reply'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>

      {!isCollapsed && comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              onVote={onVote}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
