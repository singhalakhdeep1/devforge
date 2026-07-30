import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="px-6 py-4 bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">DevForge</div>
          <div className="flex gap-6">
            <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
              Login
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Build Your Developer Career
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            The comprehensive platform for developers to learn, collaborate, and grow your skills with real-world projects
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/courses" className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-lg">
              Browse Courses
            </Link>
            <Link href="/dashboard" className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-800 text-lg">
              Go to Dashboard
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Learn</h3>
            <p className="text-gray-600 dark:text-gray-300">Access hundreds of courses covering modern technologies and best practices</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Collaborate</h3>
            <p className="text-gray-600 dark:text-gray-300">Work with other developers on real projects and build your portfolio</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Grow</h3>
            <p className="text-gray-600 dark:text-gray-300">Track your progress, earn certificates, and advance your career</p>
          </div>
        </div>
      </div>
    </div>
  )
}