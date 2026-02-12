import { useState } from 'react'
import { Home, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Exercise({ exercise, userId, onBack }) {
  const [userAnswers, setUserAnswers] = useState({})
  const [showFeedback, setShowFeedback] = useState(false)
  const [startTime] = useState(Date.now())

  const handleAnswerChange = (questionIdx, value) => {
    setUserAnswers({
      ...userAnswers,
      [questionIdx]: value
    })
  }

  const handleSubmit = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)

    // 保存每个答案到数据库
    for (let i = 0; i < exercise.questions.length; i++) {
      const userAnswer = userAnswers[i] || ''
      
      try {
        await supabase.from('user_progress').insert([{
          user_id: userId,
          exercise_id: exercise.id.toString(),
          question_index: i,
          user_answer: userAnswer,
          is_correct: null, // 主观题无法自动判断
          time_spent_seconds: Math.floor(timeSpent / exercise.questions.length)
        }])
      } catch (error) {
        console.error('Error saving answer:', error)
      }
    }

    setShowFeedback(true)
  }

  const getGradeColor = (type) => {
    if (type === 'achieved') return 'border-blue-500 bg-blue-50'
    if (type === 'merit') return 'border-purple-500 bg-purple-50'
    return 'border-orange-500 bg-orange-50'
  }

  const getGradeLabel = (type) => {
    if (type === 'achieved') return 'Achieved'
    if (type === 'merit') return 'Merit'
    return 'Excellence'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* 头部 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">{exercise.title}</h2>
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            >
              <Home size={20} />
              返回
            </button>
          </div>
          
          {/* 词汇提示 */}
          <div className="bg-gray-50 p-6 rounded-xl mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">📚 Vocabulario útil:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(exercise.vocabulary).map(([spanish, english]) => (
                <div key={spanish} className="text-sm">
                  <span className="font-semibold text-blue-600">{spanish}</span>
                  <span className="text-gray-600"> - {english}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 阅读文本 */}
          <div className="text-lg leading-relaxed text-gray-800 whitespace-pre-line bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
            {exercise.text}
          </div>
        </div>

        {/* 问题 */}
        <div className="space-y-6">
          {exercise.questions.map((q, idx) => (
            <div key={idx} className={`bg-white rounded-2xl shadow-lg p-8 border-l-4 ${getGradeColor(q.type)}`}>
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex-1">
                  Question {idx + 1}
                </h3>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  q.type === 'achieved' ? 'bg-blue-100 text-blue-700' :
                  q.type === 'merit' ? 'bg-purple-100 text-purple-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {getGradeLabel(q.type)}
                </span>
              </div>
              
              <p className="text-lg text-gray-700 mb-4">{q.question}</p>
              
              <textarea
                value={userAnswers[idx] || ''}
                onChange={(e) => handleAnswerChange(idx, e.target.value)}
                disabled={showFeedback}
                placeholder="在此输入你的答案（英文或中文）..."
                className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl text-base focus:border-blue-500 focus:outline-none resize-none disabled:bg-gray-50"
              />

              {showFeedback && (
                <div className="mt-4 bg-green-50 border-2 border-green-300 rounded-xl p-4">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <CheckCircle size={20} />
                    参考答案 ({getGradeLabel(q.type)} level):
                  </h4>
                  <p className="text-gray-700">{q.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 提交按钮 */}
        <div className="mt-8">
          {!showFeedback ? (
            <div className="flex gap-4">
              <button
                onClick={onBack}
                className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all"
              >
                返回
              </button>
              <button
                onClick={handleSubmit}
                disabled={Object.keys(userAnswers).length === 0}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                查看参考答案
              </button>
            </div>
          ) : (
            <button
              onClick={onBack}
              className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Home size={24} />
              返回练习列表
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
