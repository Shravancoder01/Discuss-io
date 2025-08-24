import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ShareIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline'
import CommentThread from '../components/CommentThread'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function PostDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [commentContent, setCommentContent] = useState('')
  const [isCommenting, setIsCommenting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)

  // Fetch post by ID
  const fetchPost = async () => {
    if (!id) return
    const { data, error } = await supabase
      .from('app_97300927f3_posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching post:', error)
      navigate('/') // redirect to home if post not found
      return
    }
    setPost(data)
  }

  const fetchComments = async () => {
  if (!id) return
  const { data, error } = await supabase
    .from('app_97300927f3_comments')
    .select('*')
    .eq('post_id', id)   // use id from useParams()
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching comments:', error)
    setComments([])
    return
  }

  // Build tree structure
  const map = new Map();
  const roots = [];
  data.forEach(c => {
    c.replies = [];
    map.set(c.id, c);
  });
  data.forEach(c => {
    if (c.parent_comment_id) {
      const parent = map.get(c.parent_comment_id);
      if (parent) parent.replies.push(c);
      else roots.push(c);
    } else {
      roots.push(c);
    }
  });
  setComments(roots);
};


  // Check if post is saved by current user
  useEffect(() => {
    if (!user || !post) return

    const checkSaved = async () => {
      // Use proper select with "id" and filter by user_id, post_id
      const { data, error } = await supabase
        .from('app_97300927f3_saved_posts')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', post.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is ok
        console.error('Error checking saved post:', error)
        setIsSaved(false)
        return
      }
      setIsSaved(!!data)
    }
    checkSaved()
  }, [user, post])

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchPost(), fetchComments()])
      setLoading(false)
    }
    loadData()
  }, [id])

  // Copy post URL to clipboard
  const handleShare = () => {
    try {
      const url = `${window.location.origin}/post/${post.id}`
      navigator.clipboard.writeText(url)
      alert('Post URL copied to clipboard!')
    } catch {
      alert('Failed to copy. Please manually copy from address bar.')
    }
  }

  // Save/unsave post handler
  const handleSave = async () => {
    if (!user || !post) return
    try {
      if (isSaved) {
        await supabase
          .from('app_97300927f3_saved_posts')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id)
        setIsSaved(false)
      } else {
        await supabase
          .from('app_97300927f3_saved_posts')
          .insert({ user_id: user.id, post_id: post.id })
        setIsSaved(true)
      }
    } catch (error) {
      console.error('Error saving/unsaving post:', error)
      alert('An error occurred while saving the post.')
    }
  }

  // Voting on post
  const handleVotePost = async (voteType) => {
    if (!user || !post) return
    try {
      const { data: existingVote } = await supabase
        .from('app_97300927f3_post_votes')
        .select('*')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .single()

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          await supabase
            .from('app_97300927f3_post_votes')
            .delete()
            .eq('id', existingVote.id)
        } else {
          await supabase
            .from('app_97300927f3_post_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id)
        }
      } else {
        await supabase.from('app_97300927f3_post_votes').insert({
          post_id: post.id,
          user_id: user.id,
          vote_type: voteType,
        })
      }
      await fetchPost()
    } catch (error) {
      console.error('Error voting on post:', error)
    }
  }

  // Voting on comment -- placeholder (implement same as post voting adapted for comment_votes)
  const handleVoteComment = async (commentId, voteType) => {
    // Implement in your app_97300927f3_comment_votes table accordingly
  }

  // Add a new comment
  const handleComment = async (e) => {
    e.preventDefault()
    if (!user || !commentContent.trim() || isCommenting || !post) return
    setIsCommenting(true)
    try {
      const { error } = await supabase
        .from('app_97300927f3_comments')
        .insert({
          content: commentContent,
          author_id: user.id,
          author_username: user.user_metadata?.username || user.email,
          post_id: post.id,
        })

      if (error) {
        console.error('Error adding comment:', error)
        alert('Failed to add comment')
        return
      }
      setCommentContent('')
      await supabase
        .from('app_97300927f3_posts')
        .update({ comment_count: (post.comment_count || 0) + 1 })
        .eq('id', post.id)

      fetchComments()
      fetchPost()
    } finally {
      setIsCommenting(false)
    }
  }

  // Reply to comment
  const handleReply = async (parentId, content) => {
    if (!user || !content.trim() || !post) return
    try {
      const { error } = await supabase
        .from('app_97300927f3_comments')
        .insert({
          content,
          author_id: user.id,
          author_username: user.user_metadata?.username || user.email,
          post_id: post.id,
          parent_comment_id: parentId,
        })
      if (error) {
        console.error('Error adding reply comment:', error)
        return
      }
      fetchComments()
    } catch (error) {
      console.error('Error replying to comment:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <div className="animate-pulse">
          <div className="bg-gray-800 rounded-lg h-64 mb-6"></div>
          <div className="bg-gray-800 rounded-lg h-32 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg h-20"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto py-6 text-center">
        <h1 className="text-2xl text-white mb-4">Post not found</h1>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
        >
          Go Back Home
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      {/* Post display */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden mb-6">
        <div className="flex">
          {/* Votes left side */}
          <div className="flex flex-col items-center p-4 bg-gray-900 space-y-2">
            <button
              onClick={() => handleVotePost('up')}
              disabled={!user}
              className={`p-2 rounded hover:bg-gray-700 transition-colors text-gray-400 hover:text-orange-500 ${
                !user ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <ChevronUpIcon className="h-6 w-6" />
            </button>
            <span className="text-sm font-bold text-white">{post.vote_score || 0}</span>
            <button
              onClick={() => handleVotePost('down')}
              disabled={!user}
              className={`p-2 rounded hover:bg-gray-700 transition-colors text-gray-400 hover:text-blue-500 ${
                !user ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <ChevronDownIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Post content */}
          <div className="flex-1 p-6">
            <div className="flex items-center space-x-2 text-sm text-gray-400 mb-4">
              <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                d/{post.category}
              </span>
              <span>•</span>
              <span>Posted by u/{post.author_username}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(post.created_at))} ago</span>
            </div>

            <h1 className="text-2xl font-bold text-white mb-4">{post.title}</h1>
            <div className="text-gray-300 mb-6 whitespace-pre-wrap leading-relaxed">{post.content}</div>

            {post.image_url && (
              <div className="mb-6">
                <img src={post.image_url} alt="Post image" className="max-w-full h-auto rounded-lg" />
              </div>
            )}

            <div className="flex items-center space-x-6 text-gray-400">
              <span className="text-sm">{post.comment_count || 0} Comments</span>

              <button
                onClick={() => {
                  const postUrl = `${window.location.origin}/post/${post.id}`
                  navigator.clipboard.writeText(postUrl)
                  alert('Post URL copied to clipboard!')
                }}
                className="flex items-center space-x-1 hover:text-white transition-colors"
              >
                <ShareIcon className="h-4 w-4" />
                <span className="text-sm">Share</span>
              </button>

              <button
                onClick={handleSave}
                disabled={!user}
                className="flex items-center space-x-1 hover:text-white transition-colors"
              >
                <BookmarkIcon className={`h-4 w-4 ${isSaved ? 'text-orange-500' : ''}`} />
                <span className="text-sm">{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {user ? (
        <form onSubmit={handleComment} className="mb-8">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="mb-3">
              <span className="text-sm text-gray-400">
                Comment as u/{user.user_metadata?.username || user.email}
              </span>
            </div>
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="What are your thoughts?"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={4}
              required
            />
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={!commentContent.trim() || isCommenting}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                {isCommenting ? 'Commenting...' : 'Comment'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8 text-center">
          <p className="text-gray-400 mb-4">Sign in to join the discussion</p>
          <button
            onClick={() => navigate('/login')}
            className="inline-block px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white mb-4">Comments ({comments.length})</h2>
        {comments.map((comment) => (
          <CommentThread key={comment.id} comment={comment} onVote={handleVoteComment} onReply={handleReply} />
        ))}
      </div>
    </div>
  )
}
