import React from 'react'
import { Link } from 'react-router-dom'
import { PlusIcon, PhotoIcon, LinkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'

const CreatePostCard = ({ className = '' }) => {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {user.email?.[0]?.toUpperCase()}
          </span>
        </div>
        
        <Link
          to="/submit"
          className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full px-4 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        >
          Create Post
        </Link>
        
        <div className="flex items-center space-x-2">
          <Link
            to="/submit?type=image"
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Image Post"
          >
            <PhotoIcon className="w-5 h-5" />
          </Link>
          
          <Link
            to="/submit?type=link"
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Link Post"
          >
            <LinkIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CreatePostCard
