import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { HomeIcon, FireIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline'

const categories = [
  { name: 'Technology', slug: 'technology', color: 'bg-blue-500' },
  { name: 'Gaming', slug: 'gaming', color: 'bg-purple-500' },
  { name: 'Science', slug: 'science', color: 'bg-green-500' },
  { name: 'Sports', slug: 'sports', color: 'bg-red-500' },
  { name: 'Music', slug: 'music', color: 'bg-pink-500' },
  { name: 'Movies', slug: 'movies', color: 'bg-yellow-500' },
  { name: 'Books', slug: 'books', color: 'bg-indigo-500' },
  { name: 'Food', slug: 'food', color: 'bg-orange-500' },
]

export default function Sidebar({ open, onClose }) {
  // Close sidebar on Esc key
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      {/* Sidebar panel */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 shadow-lg p-4 space-y-6 transform transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Navigation */}
        <div className="space-y-2">
          <Link
            to="/"
            className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 p-2 rounded-lg transition-colors"
          >
            <HomeIcon className="h-5 w-5" />
            <span>Home</span>
          </Link>
          <Link
            to="/popular"
            className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 p-2 rounded-lg transition-colors"
          >
            <FireIcon className="h-5 w-5" />
            <span>Popular</span>
          </Link>
          <Link
            to="/recent"
            className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 p-2 rounded-lg transition-colors"
          >
            <ClockIcon className="h-5 w-5" />
            <span>Recent</span>
          </Link>
          <Link
            to="/trending"
            className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 p-2 rounded-lg transition-colors"
          >
            <ChartBarIcon className="h-5 w-5" />
            <span>Trending</span>
          </Link>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-gray-400 text-sm font-semibold mb-3 uppercase tracking-wider">
            Categories
          </h3>
          <div className="space-y-1">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/category/${category.slug}`}
                className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 p-2 rounded-lg transition-colors"
              >
                <div className={`w-4 h-4 rounded-full ${category.color}`} />
                <span>{category.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Create Community */}
        <div className="pt-4 border-t border-gray-700">
          <Link
            to="/create-community"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors block"
          >
            Create Community
          </Link>
        </div>
      </div>
    </>
  )
}
