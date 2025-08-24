import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon, UserIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'

export default function Header({ onHamburgerClick }) {
  const [searchQuery, setSearchQuery] = useState('')
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Hamburger */}
          <div className="flex items-center">
            {/* Hamburger Button */}
            <button
              type="button"
              aria-label="Open Sidebar"
              className="bg-orange-500 rounded-full p-2 mr-2"
              onClick={onHamburgerClick}
            >
              <Bars3Icon className="h-6 w-6 text-white" />
            </button>
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-white">Discuss-io</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search discuss-io"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-full py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  Create Post
                </Link>
                <div className="flex items-center space-x-2">
                   <Link to="/profile">
                  <UserIcon className="h-6 w-6 text-gray-300" />
                  </Link>
                  <span className="text-white text-sm">
                    {user.user_metadata?.username || user.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-gray-300 hover:text-white text-sm"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white text-sm font-medium"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
