import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import Exercise from './components/Exercise'
import AdminPanel from './components/AdminPanel'
import { readingExercises } from './data/exercises'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState('dashboard') // 'dashboard', 'exercise', 'admin'
  const [currentExercise, setCurrentExercise] = useState(null)

  useEffect(() => {
    // 检查当前session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const startExercise = (exercise) => {
    setCurrentExercise(exercise)
    setCurrentView('exercise')
  }

  const backToDashboard = () => {
    setCurrentView('dashboard')
    setCurrentExercise(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">加载中...</div>
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">NCEA Spanish Practice</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{session.user.email}</span>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                练习
              </button>
              <button
                onClick={() => setCurrentView('admin')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                数据
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main>
        {currentView === 'dashboard' && (
          <Dashboard 
            exercises={readingExercises} 
            onStartExercise={startExercise}
            userId={session.user.id}
          />
        )}
        {currentView === 'exercise' && currentExercise && (
          <Exercise 
            exercise={currentExercise}
            userId={session.user.id}
            onBack={backToDashboard}
          />
        )}
        {currentView === 'admin' && (
          <AdminPanel userId={session.user.id} />
        )}
      </main>
    </div>
  )
}

export default App
