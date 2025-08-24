import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://dabnoxwkmrirohflawcc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhYm5veHdrbXJpcm9oZmxhd2NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MjM5NjMsImV4cCI6MjA3MTQ5OTk2M30.oXubpOqhC5jg0cEJDv5o6JIMbwPFIiB_vu3M8B_JFzA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const signUp = async (email, password, username) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
      }
    }
  })
  return { data, error }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}