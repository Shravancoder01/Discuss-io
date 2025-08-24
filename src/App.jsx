import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "./contexts/AuthContext"

// Layout + Shared UI
import Header from "./components/Header"
import Sidebar from "./components/Sidebar"
import RightSidebar from "./components/RightSidebar"

// Pages
import Home from "./pages/Home"
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

const queryClient = new QueryClient()

function Layout({ children }) {
  // Sidebar visibility state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header onHamburgerClick={() => setSidebarOpen((prev) => !prev)} />
      <div className="flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 px-6 py-4">{children}</main>
        <RightSidebar />
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Main content routes */}
            <Route
              path="/"
              element={
                <Layout>
                  <Home />
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
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
