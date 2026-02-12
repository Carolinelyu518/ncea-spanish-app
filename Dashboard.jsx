import { useState, useEffect } from 'react'
import { BookOpen, TrendingUp, Award } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Dashboard({ exercises, onStartExercise, userId }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserStats()
  }, [userId])

  async function fetchUserStats() {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)

      if (error) throw error

      if (data) {
        const totalAttempts = data.length
        const correctAnswers = data.filter(d => d.is_correct).length
        const uniqueExercises = [...new Set(data.map(d => d.exercise_id))].length
        const avgTime = data.length > 0 
          ? Math.round(data.reduce((acc, d) => acc + (d.time_spent_seconds || 0), 0) / data.length)
          : 0

        setStats({
          totalAttempts,
          correctAnswers,
          accuracyRate: totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0,
          completedExercises: uniqueExercises,
          averageTime: avgTime
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 统计卡片 */}
      {!loading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">已完成练习</p>
                <p className="text-2xl font-bold">{stats.completedExercises}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Award className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">正确率</p>
                <p className="text-2xl font-bold">{stats.accuracyRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">总答题数</p>
                <p className="text-2xl font-bold">{stats.totalAttempts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <svg className="text-orange-600" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">平均用时</p>
                <p className="text-2xl font-bold">{Math.floor(stats.averageTime / 60)}分</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 练习列表 */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <h2 className="text-2xl font-bold">阅读理解练习</h2>
          <p className="text-blue-100 mt-1">基于NCEA 2024-2025真题</p>
        </div>

        <div className="p-6 space-y-4">
          {exercises.map((exercise, idx) => (
            <button
              key={exercise.id}
              onClick={() => onStartExercise(exercise)}
              className="w-full text-left p-5 rounded-xl bg-gray-50 hover:bg-blue-50 transition-all border-2 border-transparent hover:border-blue-300 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                      练习 {idx + 1}
                    </span>
                    <span className="text-xs text-gray-500">
                      {exercise.questions.length} 题
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{exercise.title}</h3>
                  <p className="text-sm text-gray-600">
                    类型: {exercise.type.replace(/_/g, ' ')}
                  </p>
                </div>
                <div className="text-blue-400 group-hover:text-blue-600 transition-colors text-2xl">
                  →
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 反馈按钮 */}
      <div className="mt-8 text-center">
        <button
          onClick={async () => {
            const feedback = prompt('有任何建议或问题吗？请告诉我们：')
            if (feedback) {
              await supabase.from('feedback').insert([{
                user_id: userId,
                message: feedback,
                feedback_type: 'general'
              }])
              alert('感谢你的反馈！')
            }
          }}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          💬 提供反馈
        </button>
      </div>
    </div>
  )
}
