// CommentThread.jsx
import { formatDistanceToNow } from 'date-fns'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

export default function CommentThread({ comment, onVote, onReply }) {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      <div className="flex items-start space-x-3">
        {/* Vote buttons */}
        <div className="flex flex-col items-center space-y-1">
          <button
            onClick={() => onVote(comment.id, 'up')}
            className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-orange-500"
          >
            <ChevronUpIcon className="h-4 w-4" />
          </button>
          <span className="text-xs text-gray-400">{comment.vote_score || 0}</span>
          <button
            onClick={() => onVote(comment.id, 'down')}
            className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-blue-500"
          >
            <ChevronDownIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Comment content */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
            <span>u/{comment.author_username}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(comment.created_at))} ago</span>
          </div>
          
          <div className="text-gray-300 mb-3">
            {comment.content}
          </div>

          {/* Reply button */}
          <button
            onClick={() => onReply(comment.id, prompt('Enter your reply:'))}
            className="text-sm text-gray-400 hover:text-white"
          >
            Reply
          </button>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 pl-4 border-l-2 border-gray-600 space-y-3">
              {comment.replies.map((reply) => (
                <CommentThread
                  key={reply.id}
                  comment={reply}
                  onVote={onVote}
                  onReply={onReply}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
