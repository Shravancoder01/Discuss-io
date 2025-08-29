// components/ResponsivePostCard.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import { 
  ChevronUpIcon, 
  ChevronDownIcon, 
  ChatBubbleLeftIcon, 
  ShareIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import {
  BookmarkIcon as BookmarkIconSolid,
  HeartIcon as HeartIconSolid
} from '@heroicons/react/24/solid'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const ResponsivePostCard = ({ post, onVote, className = '' }) => {
  const { user } = useAuth()
  const [isVoting, setIsVoting] = useState(false)
  const [isSaved, setIsSaved] = useState(post?.isSaved || false)
  const [showFullContent, setShowFullContent] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Check if post is saved when component mounts
  useEffect(() => {
    const checkIfSaved = async () => {
      if (!user || !post.id) return
      
      try {
        const { data, error } = await supabase
          .from('app_97300927f3_saved_posts')
          .select('id')
          .eq('user_id', user.id)
          .eq('post_id', post.id)
          .maybeSingle() // Use maybeSingle() to avoid 406 error
        
        if (!error && data) {
          setIsSaved(true)
        }
      } catch (error) {
        console.error('Error checking saved status:', error)
      }
    }
    
    checkIfSaved()
  }, [user, post.id])

  const handleVote = async (voteType) => {
    if (!user || isVoting) return
    
    setIsVoting(true)
    try {
      await onVote(post.id, voteType)
    } finally {
      setIsVoting(false)
    }
  }

  const handleSave = async () => {
    if (!user) {
      toast.error('Please login to save posts')
      return
    }
    
    if (isSaving) return
    
    setIsSaving(true)
    
    try {
      if (isSaved) {
        // Unsave post
        const { error } = await supabase
          .from('app_97300927f3_saved_posts')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id)
        
        if (!error) {
          setIsSaved(false)
          toast.success('Post unsaved')
        } else {
          console.error('Error unsaving post:', error)
          toast.error('Failed to unsave post')
        }
      } else {
        // Save post
        const { error } = await supabase
          .from('app_97300927f3_saved_posts')
          .insert({
            user_id: user.id,
            post_id: post.id
          })
        
        if (!error) {
          setIsSaved(true)
          toast.success('Post saved')
        } else {
          console.error('Error saving post:', error)
          toast.error('Failed to save post')
        }
      }
    } catch (error) {
      console.error('Error in save/unsave operation:', error)
      toast.error('Something went wrong')
    } finally {
      setIsSaving(false)
    }
  }

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${post.id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content ? post.content.substring(0, 100) + '...' : '',
          url: postUrl,
        })
      } catch (error) {
        if (error.name !== 'AbortError') {
          fallbackShare(postUrl)
        }
      }
    } else {
      fallbackShare(postUrl)
    }
  }

  const fallbackShare = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied to clipboard!')
    }).catch(() => {
      toast.error('Failed to copy link')
    })
  }

  const getVoteColor = (voteType) => {
    if (!user) return 'text-gray-400'
    if (post.user_vote === voteType) {
      return voteType === 'up' ? 'text-orange-500' : 'text-blue-500'
    }
    return 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num?.toString() || '0'
  }

  const truncateContent = (content, maxLength = 300) => {
    if (!content) return ''
    if (content.length <= maxLength) return content
    return content.substr(0, maxLength) + '...'
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
        hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200
        ${className}
      `}
    >
      <div className="flex">
        {/* Vote Section - Hidden on small mobile */}
        <div className="hidden xs:flex flex-col items-center p-2 sm:p-4 bg-gray-50 dark:bg-gray-700/50 border-r border-gray-200 dark:border-gray-700">
          <button
            onClick={() => handleVote('up')}
            disabled={!user || isVoting}
            className={`
              p-1 rounded transition-colors
              ${getVoteColor('up')}
              ${!user ? 'cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-600'}
              ${isVoting ? 'opacity-50' : ''}
            `}
            title={!user ? 'Login to vote' : 'Upvote'}
          >
            <ChevronUpIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <span className={`
            text-xs sm:text-sm font-medium py-1 
            ${post.user_vote === 'up' ? 'text-orange-500' : 
              post.user_vote === 'down' ? 'text-blue-500' : 
              'text-gray-700 dark:text-gray-300'}
          `}>
            {formatNumber(post.vote_score || 0)}
          </span>
          
          <button
            onClick={() => handleVote('down')}
            disabled={!user || isVoting}
            className={`
              p-1 rounded transition-colors
              ${getVoteColor('down')}
              ${!user ? 'cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-600'}
              ${isVoting ? 'opacity-50' : ''}
            `}
            title={!user ? 'Login to vote' : 'Downvote'}
          >
            <ChevronDownIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-3 sm:p-4">
          {/* Post Meta */}
          <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2 space-x-1 sm:space-x-2">
            <Link 
              to={`/r/${post.category}`}
              className="font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400"
            >
              r/{post.category}
            </Link>
            <span>•</span>
            <span className="hidden sm:inline">Posted by</span>
            <Link 
              to={`/u/${post.author}`}
              className="hover:text-gray-700 dark:hover:text-gray-300 hover:underline"
            >
              u/{post.author}
            </Link>
            <span>•</span>
            <span className="truncate">
              {formatDistanceToNow(new Date(post.created_at))} ago
            </span>
          </div>

          {/* Title */}
          <Link to={`/post/${post.id}`} className="block mb-2 sm:mb-3">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors line-clamp-2 sm:line-clamp-none">
              {post.title}
            </h2>
          </Link>

          {/* Content Preview */}
          {post.content && (
            <div className="mb-3 sm:mb-4">
              <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                {showFullContent ? (
                  <div className="whitespace-pre-wrap">
                    {post.content}
                    <button
                      onClick={() => setShowFullContent(false)}
                      className="ml-2 text-orange-600 dark:text-orange-400 hover:underline text-sm"
                    >
                      Show less
                    </button>
                  </div>
                ) : (
                  <div>
                    {post.content.length > 300 ? (
                      <>
                        <span className="whitespace-pre-wrap">{truncateContent(post.content)}</span>
                        <button
                          onClick={() => setShowFullContent(true)}
                          className="ml-2 text-orange-600 dark:text-orange-400 hover:underline text-sm"
                        >
                          Show more
                        </button>
                      </>
                    ) : (
                      <span className="whitespace-pre-wrap">{post.content}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Image */}
          {post.image_url && !imageError && (
            <div className="mb-3 sm:mb-4">
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-auto max-h-96 sm:max-h-[500px] object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile Vote Buttons - Only shown on small screens */}
              <div className="flex items-center xs:hidden space-x-1">
                <button
                  onClick={() => handleVote('up')}
                  disabled={!user || isVoting}
                  className={`p-1 rounded transition-colors ${getVoteColor('up')} ${isVoting ? 'opacity-50' : ''}`}
                >
                  <ChevronUpIcon className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {formatNumber(post.vote_score || 0)}
                </span>
                <button
                  onClick={() => handleVote('down')}
                  disabled={!user || isVoting}
                  className={`p-1 rounded transition-colors ${getVoteColor('down')} ${isVoting ? 'opacity-50' : ''}`}
                >
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Comments */}
              <Link
                to={`/post/${post.id}`}
                className="flex items-center space-x-1 sm:space-x-2 px-2 py-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <ChatBubbleLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm font-medium">
                  {formatNumber(post.comment_count || 0)}
                  <span className="hidden sm:inline ml-1">Comments</span>
                </span>
              </Link>

              {/* Share */}
              <button 
                onClick={handleShare}
                className="flex items-center space-x-1 sm:space-x-2 px-2 py-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <ShareIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline text-sm font-medium">Share</span>
              </button>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Save */}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`
                  p-1 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 
                  hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors
                  ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                title={isSaved ? 'Unsave' : 'Save'}
              >
                {isSaved ? (
                  <BookmarkIconSolid className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                ) : (
                  <BookmarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>

              {/* More Options */}
              <button className="p-1 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                <EllipsisHorizontalIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export default ResponsivePostCard
