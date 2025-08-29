// components/GamificationBadge.jsx
import React from 'react'
import { motion } from 'framer-motion'
import { 
  TrophyIcon, 
  StarIcon, 
  FireIcon, 
  ShieldCheckIcon,
  CogIcon,
  AcademicCapIcon
} from '@heroicons/react/24/solid'

const badges = {
  // User Level Badges
  newbie: { icon: AcademicCapIcon, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20', name: 'Newbie' },
  contributor: { icon: StarIcon, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/20', name: 'Contributor' },
  expert: { icon: TrophyIcon, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/20', name: 'Expert' },
  legend: { icon: FireIcon, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20', name: 'Legend' },
  
  // Achievement Badges
  first_post: { icon: StarIcon, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/20', name: 'First Post' },
  helpful: { icon: ShieldCheckIcon, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20', name: 'Helpful' },
  popular: { icon: FireIcon, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/20', name: 'Popular' },
  moderator: { icon: CogIcon, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/20', name: 'Moderator' }
}

const GamificationBadge = ({ 
  type, 
  size = 'md', 
  showLabel = false, 
  animated = false,
  className = '' 
}) => {
  const badge = badges[type]
  if (!badge) return null

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  }

  const containerSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  }

  const BadgeIcon = badge.icon

  const badgeElement = (
    <div className={`
      ${containerSizeClasses[size]} 
      ${badge.bg} 
      ${badge.color} 
      rounded-full 
      flex 
      items-center 
      justify-center 
      ${className}
    `}>
      <BadgeIcon className={sizeClasses[size]} />
    </div>
  )

  return (
    <div className="flex items-center space-x-1">
      {animated ? (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {badgeElement}
        </motion.div>
      ) : (
        badgeElement
      )}
      
      {showLabel && (
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {badge.name}
        </span>
      )}
    </div>
  )
}

// User Level Component
export const UserLevel = ({ level, experience, nextLevelXP }) => {
  const getLevelInfo = (level) => {
    if (level >= 50) return { name: 'Legend', color: 'text-red-500', bgColor: 'bg-red-500' }
    if (level >= 25) return { name: 'Expert', color: 'text-yellow-500', bgColor: 'bg-yellow-500' }
    if (level >= 10) return { name: 'Contributor', color: 'text-blue-500', bgColor: 'bg-blue-500' }
    return { name: 'Newbie', color: 'text-green-500', bgColor: 'bg-green-500' }
  }

  const levelInfo = getLevelInfo(level)
  const progress = nextLevelXP ? (experience / nextLevelXP) * 100 : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <span className={`text-sm font-bold ${levelInfo.color}`}>
          Level {level}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {levelInfo.name}
        </span>
      </div>
      
      {nextLevelXP && (
        <div className="space-y-1">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className={`h-2 ${levelInfo.bgColor} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{experience} XP</span>
            <span>{nextLevelXP - experience} XP to next level</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Achievement Showcase Component
export const AchievementShowcase = ({ achievements = [], maxDisplay = 3 }) => {
  const displayedAchievements = achievements.slice(0, maxDisplay)
  const remainingCount = achievements.length - maxDisplay

  return (
    <div className="flex items-center space-x-1">
      {displayedAchievements.map((achievement, index) => (
        <motion.div
          key={achievement.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          title={achievement.name}
        >
          <GamificationBadge 
            type={achievement.type} 
            size="sm"
            animated={achievement.isNew}
          />
        </motion.div>
      ))}
      
      {remainingCount > 0 && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          +{remainingCount} more
        </span>
      )}
    </div>
  )
}

export default GamificationBadge