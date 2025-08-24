import { supabase } from './supabase'

// Posts API
export const fetchPosts = async (sortBy = 'hot', category = null) => {
  let query = supabase
    .from('app_97300927f3_posts')
    .select(`
      *,
      app_97300927f3_post_votes!inner(vote_type)
    `)

  if (category) {
    query = query.eq('category', category)
  }

  switch (sortBy) {
    case 'new':
      query = query.order('created_at', { ascending: false })
      break
    case 'top':
      query = query.order('vote_score', { ascending: false })
      break
    case 'hot':
    default:
      // Simple hot algorithm: combine vote score and recency
      query = query.order('vote_score', { ascending: false })
      break
  }

  const { data, error } = await query.limit(20)
  if (error) throw error
  
  return data.map(post => ({
    ...post,
    user_vote: post.app_97300927f3_post_votes?.[0]?.vote_type || null
  }))
}

export const fetchPost = async (postId) => {
  const { data, error } = await supabase
    .from('app_97300927f3_posts')
    .select(`
      *,
      app_97300927f3_post_votes(vote_type)
    `)
    .eq('id', postId)
    .single()

  if (error) throw error
  return {
    ...data,
    user_vote: data.app_97300927f3_post_votes?.[0]?.vote_type || null
  }
}

export const createPost = async (title, content, category) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get or create user profile
  const { data: profile } = await supabase
    .from('app_97300927f3_profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  const username = profile?.username || user.user_metadata?.username || user.email.split('@')[0]

  const { data, error } = await supabase
    .from('app_97300927f3_posts')
    .insert({
      title,
      content,
      category,
      author_id: user.id,
      author_username: username
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const voteOnPost = async (postId, voteType) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check if user already voted
  const { data: existingVote } = await supabase
    .from('app_97300927f3_post_votes')
    .select('vote_type')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single()

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      // Remove vote if same type
      const { error } = await supabase
        .from('app_97300927f3_post_votes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
      if (error) throw error
    } else {
      // Update vote type
      const { error } = await supabase
        .from('app_97300927f3_post_votes')
        .update({ vote_type: voteType })
        .eq('post_id', postId)
        .eq('user_id', user.id)
      if (error) throw error
    }
  } else {
    // Create new vote
    const { error } = await supabase
      .from('app_97300927f3_post_votes')
      .insert({
        post_id: postId,
        user_id: user.id,
        vote_type: voteType
      })
    if (error) throw error
  }
}

// Comments API
export const fetchComments = async (postId) => {
  const { data, error } = await supabase
    .from('app_97300927f3_comments')
    .select(`
      *,
      app_97300927f3_comment_votes(vote_type)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) throw error

  // Build comment tree
  const commentsMap = new Map()
  const rootComments = []

  // First pass: create all comment objects
  data.forEach(comment => {
    const commentObj = {
      ...comment,
      user_vote: comment.app_97300927f3_comment_votes?.[0]?.vote_type || null,
      replies: []
    }
    commentsMap.set(comment.id, commentObj)
  })

  // Second pass: build the tree
  data.forEach(comment => {
    const commentObj = commentsMap.get(comment.id)
    if (comment.parent_id) {
      const parent = commentsMap.get(comment.parent_id)
      if (parent) {
        parent.replies.push(commentObj)
      }
    } else {
      rootComments.push(commentObj)
    }
  })

  return rootComments
}

export const createComment = async (postId, content, parentId = null) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get username
  const { data: profile } = await supabase
    .from('app_97300927f3_profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  const username = profile?.username || user.user_metadata?.username || user.email.split('@')[0]

  const { data, error } = await supabase
    .from('app_97300927f3_comments')
    .insert({
      post_id: postId,
      parent_id: parentId,
      content,
      author_id: user.id,
      author_username: username
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const voteOnComment = async (commentId, voteType) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check if user already voted
  const { data: existingVote } = await supabase
    .from('app_97300927f3_comment_votes')
    .select('vote_type')
    .eq('comment_id', commentId)
    .eq('user_id', user.id)
    .single()

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      // Remove vote if same type
      const { error } = await supabase
        .from('app_97300927f3_comment_votes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
      if (error) throw error
    } else {
      // Update vote type
      const { error } = await supabase
        .from('app_97300927f3_comment_votes')
        .update({ vote_type: voteType })
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
      if (error) throw error
    }
  } else {
    // Create new vote
    const { error } = await supabase
      .from('app_97300927f3_comment_votes')
      .insert({
        comment_id: commentId,
        user_id: user.id,
        vote_type: voteType
      })
    if (error) throw error
  }
}

// Search API
export const searchPosts = async (query) => {
  const { data, error } = await supabase
    .from('app_97300927f3_posts')
    .select(`
      *,
      app_97300927f3_post_votes(vote_type)
    `)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error
  
  return data.map(post => ({
    ...post,
    user_vote: post.app_97300927f3_post_votes?.[0]?.vote_type || null
  }))
}

// User API
export const fetchUserProfile = async (username) => {
  const { data, error } = await supabase
    .from('app_97300927f3_profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error) throw error
  return data
}

export const fetchUserPosts = async (username) => {
  const { data, error } = await supabase
    .from('app_97300927f3_posts')
    .select(`
      *,
      app_97300927f3_post_votes(vote_type)
    `)
    .eq('author_username', username)
    .order('created_at', { ascending: false })

  if (error) throw error
  
  return data.map(post => ({
    ...post,
    user_vote: post.app_97300927f3_post_votes?.[0]?.vote_type || null
  }))
}

export const updateUserProfile = async (bio, avatarUrl = null) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const updates = {
    bio,
    ...(avatarUrl && { avatar_url: avatarUrl })
  }

  const { data, error } = await supabase
    .from('app_97300927f3_profiles')
    .upsert({
      id: user.id,
      username: user.user_metadata?.username || user.email.split('@')[0],
      ...updates
    })
    .select()
    .single()

  if (error) throw error
  return data
}