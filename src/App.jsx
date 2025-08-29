import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import { NotificationProvider } from "./contexts/NotificationContext"
import { Toaster } from 'react-hot-toast'

// Enhanced Responsive Components
import EnhancedHeader from "./components/EnhancedHeader"
import ResponsiveSidebar from "./components/ResponsiveSidebar"
import ResponsiveLayout from "./components/ResponsiveLayout"

// Pages - Some will be replaced with responsive versions
import ResponsiveHome from "./pages/ResponsiveHome"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import PostDetail from "./pages/PostDetail"
import SubmitPost from "./pages/SubmitPost"
import CreateCommunity from "./pages/CreateCommunity"
import Profile from "./pages/Profile"
import NotFound from "./pages/NotFound"
import PopularPage from "./pages/PopularPage"
import RecentPage from "./pages/RecentPage"
import TrendingPage from "./pages/TrendingPage"
import CategoryPage from "./pages/CategoryPage"
import CommunityPage from "./pages/CommunityPage"
import SearchPage from "./pages/SearchPage"
import UserProfile from "./pages/UserProfile"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

// Responsive Layout Component
function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Handle screen size detection
  React.useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (!mobile && sidebarOpen) {
        setSidebarOpen(false) // Close mobile sidebar when switching to desktop
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [sidebarOpen])

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Enhanced Header with theme toggle and notifications */}
      <EnhancedHeader onHamburgerClick={toggleSidebar} />
      
      {/* Main Layout Container */}
      <div className="flex relative">
        {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Responsive Sidebar */}
        <aside className={`
          ${isMobile ? 'fixed' : 'sticky'} 
          ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          top-0 left-0 z-50 w-64 h-screen pt-16 bg-white dark:bg-gray-800 
          border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
        `}>
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            <ResponsiveSidebar />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-h-screen">
          <div className="container-responsive py-4 lg:py-6">
            {/* Pass responsive props to children */}
            {React.cloneElement(children, { 
              isMobile, 
              onToggleSidebar: toggleSidebar 
            })}
          </div>
        </main>

        {/* Right Sidebar - Desktop Only */}
        <aside className="hidden xl:block w-80 sticky top-16 h-screen bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
          <div className="h-full overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {/* Right sidebar content - trending topics, ads, etc. */}
            <div className="space-y-6">
              <div className="card p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Trending Topics
                </h3>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    #ReactJS
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    #WebDevelopment
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    #JavaScript
                  </div>
                </div>
              </div>
              
              <div className="card p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Recent Activity
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  No recent activity
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

// Public Layout for Login/Signup pages
function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <Router>
              <Routes>
                {/* Public routes with special layout */}
                <Route 
                  path="/login" 
                  element={
                    <PublicLayout>
                      <Login />
                    </PublicLayout>
                  } 
                />
                <Route 
                  path="/signup" 
                  element={
                    <PublicLayout>
                      <Signup />
                    </PublicLayout>
                  } 
                />

                {/* Main application routes with responsive layout */}
                <Route
                  path="/"
                  element={
                    <Layout>
                      <ResponsiveHome />
                    </Layout>
                  }
                />
                <Route
                  path="/post/:id"
                  element={
                    <Layout>
                      <PostDetail />
                    </Layout>
                  }
                />
                <Route
                  path="/submit"
                  element={
                    <Layout>
                      <SubmitPost />
                    </Layout>
                  }
                />
                <Route
                  path="/create-community"
                  element={
                    <Layout>
                      <CreateCommunity />
                    </Layout>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <Layout>
                      <Profile />
                    </Layout>
                  }
                />

                {/* Category & community pages */}
                <Route
                  path="/category/:category"
                  element={
                    <Layout>
                      <CategoryPage />
                    </Layout>
                  }
                />
                <Route
                  path="/d/:category"
                  element={
                    <Layout>
                      <CommunityPage />
                    </Layout>
                  }
                />
                <Route
                  path="/popular"
                  element={
                    <Layout>
                      <PopularPage />
                    </Layout>
                  }
                />
                <Route
                  path="/recent"
                  element={
                    <Layout>
                      <RecentPage />
                    </Layout>
                  }
                />
                <Route
                  path="/trending"
                  element={
                    <Layout>
                      <TrendingPage />
                    </Layout>
                  }
                />
                <Route
                  path="/search"
                  element={
                    <Layout>
                      <SearchPage />
                    </Layout>
                  }
                />
                <Route
                  path="/user/:username"
                  element={
                    <Layout>
                      <UserProfile />
                    </Layout>
                  }
                />

                {/* 404 fallback */}
                <Route
                  path="*"
                  element={
                    <Layout>
                      <NotFound />
                    </Layout>
                  }
                />
              </Routes>
              
              {/* Toast notifications */}
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  className: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700',
                }}
              />
            </Router>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
