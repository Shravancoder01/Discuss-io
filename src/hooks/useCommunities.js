import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useCommunities() {
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCommunities = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('communities')
        .select('id, name, description, is_public')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching communities:', error)
      } else {
        setCommunities(data)
      }
      setLoading(false)
    }

    fetchCommunities()
  }, [])

  return { communities, loading }
}
