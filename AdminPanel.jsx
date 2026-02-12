import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Users, BookOpen, TrendingUp, MessageSquare } from 'lucide-react'

export default function AdminPanel() {
  const [stats, setStats] = useState(null)
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllStats()
  }, [])

  async function fetchAllStats() {
    try {
      // 总用户数
      const { count: userCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      // 总答题数
      const { count: progressCount } = await supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true })

      // 获取所有答题记录计算正确率
      const { data: allProgress } = await supabase
        .from('user_progress')
        .select('is_correct, time_spent_seconds')

      const correctRate = allProgress?.length > 0
        ? (allProgress.filter(p => p.is_correct).length / allProgress.length * 100).toFixed(1)
        : 0

      const avgTime = allProgress?.length > 0
        ? Math.round(allProgress.reduce((acc, p) => acc + (p.time_spent_seconds || 0), 0) / allProgress.length)
        : 0

      // 获取反馈
      const { data: feedbackData } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      setStats({
        totalUsers: userCount || 0,
        totalAttempts: progressCount || 0,
        accuracyRate: correctRate,
        averageTime: avgTime
      })

      setFeedback(feedbackData || [])
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center">加载中...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">数据分析面板</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Users size={24} />
            <h3 className="font-semibold">总用户数</h3>
          </div>
          <p className="text-4xl font-bold">{stats.totalUsers}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen size={24} />
            <h3 className="font-semibold">总答题数</h3>
          </div>
          <p className="text-4xl font-bold">{stats.totalAttempts}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp size={24} />
            <h3 className="font-semibold">平均正确率</h3>
          </div>
          <p className="text-4xl font-bold">{stats.accuracyRate}%</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <h3 className="font-semibold">平均用时</h3>
          </div>
          <p className="text-4xl font-bold">{Math.floor(stats.averageTime / 60)}分</p>
        </div>
      </div>

      {/* 用户反馈 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="text-blue-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">最近反馈</h2>
        </div>

        {feedback.length === 0 ? (
          <p className="text-gray-500 text-center py-8">暂无反馈</p>
        ) : (
          <div className="space-y-4">
            {feedback.map((fb) => (
              <div key={fb.id} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                <p className="text-gray-800">{fb.message}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(fb.created_at).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
