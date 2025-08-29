// components/ResponsiveSidebar.jsx
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  HomeIcon,
  FireIcon,
  ClockIcon,
  ChartBarIcon,
  HashtagIcon,
  PlusIcon,
  UserGroupIcon,
  BookmarkIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  FireIcon as FireIconSolid,
  ClockIcon as ClockIconSolid,
  ChartBarIcon as ChartBarIconSolid
} from '@heroicons/react/24/solid'

const ResponsiveSidebar = ({ className = '' }) => {
  const location = useLocation()

  const mainNavigation = [
    { name: 'Home', href: '/', icon: HomeIcon, activeIcon: HomeIconSolid },
    { name: 'Popular', href: '/popular', icon: FireIcon, activeIcon: FireIconSolid },
    { name: 'Recent', href: '/recent', icon: ClockIcon, activeIcon: ClockIconSolid },
    { name: 'Trending', href: '/trending', icon: ChartBarIcon, activeIcon: ChartBarIconSolid },
  ]

  const quickActions = [
    { name: 'Create Post', href: '/submit', icon: PlusIcon },
    { name: 'Create Community', href: '/create-community', icon: UserGroupIcon },
  ]

  const userItems = [
    { name: 'Saved Posts', href: '/saved', icon: BookmarkIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon },
  ]

  const sampleCommunities = [
    { name: 'r/technology', href: '/r/technology', members: '2.1M' },
    { name: 'r/programming', href: '/r/programming', members: '4.5M' },
    { name: 'r/webdev', href: '/r/webdev', members: '1.2M' },
    { name: 'r/javascript', href: '/r/javascript', members: '2.8M' },
    { name: 'r/reactjs', href: '/r/reactjs', members: '500K' },
  ]

  const NavigationItem = ({ item, isActive }) => {
    const Icon = isActive ? item.activeIcon || item.icon : item.icon
    
    return (
      <Link
        to={item.href}
        className={`
          flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group
          ${isActive
            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-r-2 border-orange-500'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
          }
        `}
      >
        <Icon className={`w-5 h-5 mr-3 flex-shrink-0 ${isActive ? 'text-orange-500' : ''}`} />
        <span className="truncate">{item.name}</span>
      </Link>
    )
  }

  const CommunityItem = ({ community }) => (
    <Link
      to={community.href}
      className="flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
    >
      <div className="flex items-center min-w-0">
        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex-shrink-0 mr-3" />
        <span className="text-gray-700 dark:text-gray-300 truncate group-hover:text-gray-900 dark:group-hover:text-white">
          {community.name}
        </span>
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
        {community.members}
      </span>
    </Link>
  )

  return (
    <div className={`h-full flex flex-col bg-white dark:bg-gray-800 ${className}`}>
      {/* Main Navigation */}
      <div className="px-3 py-4">
        <nav className="space-y-1">
          {mainNavigation.map((item) => (
            <NavigationItem
              key={item.name}
              item={item}
              isActive={location.pathname === item.href}
            />
          ))}
        </nav>
      </div>

      {/* Divider */}
      <div className="px-3">
        <div className="border-t border-gray-200 dark:border-gray-700" />
      </div>

      {/* Quick Actions */}
      <div className="px-3 py-4">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Create
        </h3>
        <nav className="space-y-1">
          {quickActions.map((item) => (
            <NavigationItem
              key={item.name}
              item={item}
              isActive={location.pathname === item.href}
            />
          ))}
        </nav>
      </div>

      {/* Divider */}
      <div className="px-3">
        <div className="border-t border-gray-200 dark:border-gray-700" />
      </div>

      {/* User Items (Hidden on mobile to save space) */}
      <div className="px-3 py-4 hidden md:block">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Personal
        </h3>
        <nav className="space-y-1">
          {userItems.map((item) => (
            <NavigationItem
              key={item.name}
              item={item}
              isActive={location.pathname === item.href}
            />
          ))}
        </nav>
      </div>

      {/* Communities Section - Scrollable */}
      <div className="flex-1 px-3 pb-4 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Communities
          </h3>
          <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            See all
          </button>
        </div>
        
        <div className="space-y-1 overflow-y-auto max-h-64 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          {sampleCommunities.map((community) => (
            <CommunityItem key={community.name} community={community} />
          ))}
        </div>
      </div>

      {/* Footer (Only on desktop) */}
      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700 hidden lg:block">
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>© 2025 Discuss.io</p>
          <div className="flex space-x-3">
            <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Privacy</a>
            <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Terms</a>
            <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Help</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResponsiveSidebar