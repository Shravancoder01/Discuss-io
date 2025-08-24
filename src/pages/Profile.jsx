import { motion } from "framer-motion";
import { User, Mail, Settings, LogOut, Edit3 } from "lucide-react";
import { useContext } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex justify-center items-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-lg bg-gray-900/70 backdrop-blur-xl shadow-2xl rounded-2xl p-8 text-white"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
            <User size={60} />
          </div>
           <h1 className="mt-4 text-2xl font-bold">
        {user?.user_metadata?.username || user?.email || "Guest"}
      </h1>
      <p className="text-gray-400 flex items-center gap-2">
        <Mail size={16} /> {user?.email || "guest@example.com"}
      </p>
        </div>

        {/* Profile Actions */}
        <div className="space-y-3">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition">
            <Edit3 size={20} /> Edit Profile
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition">
            <Settings size={20} /> Account Settings
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-500 rounded-xl transition"
          >
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
