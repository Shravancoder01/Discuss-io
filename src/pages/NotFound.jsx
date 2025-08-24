// src/pages/NotFound.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

function NotFound() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-center px-6 text-white"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.h1
        className="text-8xl font-extrabold text-indigo-500 drop-shadow-lg"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
      >
        404
      </motion.h1>

      <p className="text-xl text-gray-300 mt-4">
        Oops! The page you’re looking for doesn’t exist.
      </p>

      <p className="text-gray-500 mt-2">
        It might have been moved or deleted.
      </p>

      <Link
        to="/"
        className="flex items-center gap-2 mt-6 px-5 py-3 bg-indigo-600 text-white font-medium rounded-2xl shadow-md hover:bg-indigo-700 transition"
      >
        <Home size={20} />
        Back to Home
      </Link>
    </motion.div>
  );
}

export default NotFound;
