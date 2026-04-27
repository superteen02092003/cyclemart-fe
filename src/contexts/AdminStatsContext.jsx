import { createContext, useContext, useState, useEffect } from 'react'
import { adminService } from '@/services/admin'
import { inspectionService } from '@/services/inspection'

const AdminStatsContext = createContext()

export function AdminStatsProvider({ children }) {
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    inspections: 0,
    loading: true
  })

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }))
      
      // Fetch posts + inspections data for stats calculation
      const [postsData, inspectionsData] = await Promise.all([
        adminService.getAllPosts({ page: 0, size: 1000 }),
        inspectionService.getAllAdminRequests({ page: 0, size: 1000 }),
      ])
      const posts = postsData.content || []
      const inspections = inspectionsData.content || []
      const unassignedInspections = inspections.filter(
        (task) => task.status === 'PENDING' && !task.inspectorName
      ).length
      
      // Calculate stats from posts
      const newStats = {
        pending: posts.filter(p => p.postStatus === 'PENDING').length,
        approved: posts.filter(p => p.postStatus === 'APPROVED').length,
        rejected: posts.filter(p => p.postStatus === 'REJECTED').length,
        inspections: unassignedInspections,
        loading: false
      }
      
      setStats(newStats)
    } catch (error) {
      console.error('Error fetching admin stats:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  useEffect(() => {
    fetchStats()
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const refreshStats = () => {
    fetchStats()
  }

  return (
    <AdminStatsContext.Provider value={{ stats, refreshStats }}>
      {children}
    </AdminStatsContext.Provider>
  )
}

export function useAdminStats() {
  const context = useContext(AdminStatsContext)
  if (!context) {
    throw new Error('useAdminStats must be used within AdminStatsProvider')
  }
  return context
}