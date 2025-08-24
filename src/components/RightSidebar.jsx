import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

export default function RightSidebar() {
  const { user } = useAuth()

  return (
    <div className="w-80 p-4 space-y-6">
      {/* About discus-io */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-3">About discuss-io</h3>
        <p className="text-gray-300 text-sm mb-4">
          A Reddit-style discussion forum where communities come together to share ideas, 
          discuss topics, and connect with like-minded people.
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-400">
            <span>Created</span>
            <span>Dec 2024</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Members</span>
            <span>10.2k</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Online</span>
            <span>847</span>
          </div>
        </div>
        {!user && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <Link
              to="/signup"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors block mb-2"
            >
              Join discus-io
            </Link>
          </div>
        )}
      </div>

      {/* Rules */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-3">Community Rules</h3>
        <div className="space-y-3">
          <div className="text-sm">
            <div className="text-white font-medium">1. Be respectful</div>
            <div className="text-gray-400">Treat others with kindness and respect</div>
          </div>
          <div className="text-sm">
            <div className="text-white font-medium">2. Stay on topic</div>
            <div className="text-gray-400">Keep discussions relevant to the community</div>
          </div>
          <div className="text-sm">
            <div className="text-white font-medium">3. No spam</div>
            <div className="text-gray-400">Don't post repetitive or promotional content</div>
          </div>
          <div className="text-sm">
            <div className="text-white font-medium">4. Use proper formatting</div>
            <div className="text-gray-400">Format your posts for readability</div>
          </div>
        </div>
      </div>

      {/* Popular Communities */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-3">Popular Communities</h3>
        <div className="space-y-2">
          {['Technology', 'Gaming', 'Science', 'Sports'].map((community) => (
            <Link
              key={community}
              to={`/category/${community.toLowerCase()}`}
              className="flex items-center space-x-2 text-gray-300 hover:text-white text-sm"
            >
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold">
                {community[0]}
              </div>
              <span>{community}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}