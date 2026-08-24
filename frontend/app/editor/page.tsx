'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

export default function EditorPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [code, setCode] = useState('// Start coding here...')
  const [language, setLanguage] = useState('typescript')

  useEffect(() => {
    // Simulate WebSocket connection to editor-service
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3002')
    
    ws.onopen = () => {
      setIsConnected(true)
      console.log('Connected to editor service')
    }
    
    ws.onclose = () => {
      setIsConnected(false)
      console.log('Disconnected from editor service')
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
    
    return () => {
      ws.close()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Code Editor</h1>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm"
              >
                <option value="typescript">TypeScript</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="go">Go</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-65px)]">
        {/* File Tree */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
          <h2 className="text-sm font-semibold mb-4 text-gray-400 uppercase tracking-wider">
            Files
          </h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 cursor-pointer">
              <span>📁</span>
              <span>src</span>
            </div>
            <div className="pl-4 space-y-1">
              <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 cursor-pointer bg-gray-700">
                <span>📄</span>
                <span>index.ts</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 cursor-pointer">
                <span>📄</span>
                <span>app.ts</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 cursor-pointer">
                <span>📄</span>
                <span>utils.ts</span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 cursor-pointer">
              <span>📁</span>
              <span>tests</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 cursor-pointer">
              <span>📄</span>
              <span>package.json</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 cursor-pointer">
              <span>📄</span>
              <span>README.md</span>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="bg-gray-800 border-b border-gray-700 flex">
            <div className="px-4 py-2 bg-gray-700 border-r border-gray-600 text-sm">
              index.ts
            </div>
            <div className="px-4 py-2 text-gray-400 text-sm hover:bg-gray-700 cursor-pointer">
              app.ts
            </div>
            <div className="px-4 py-2 text-gray-400 text-sm hover:bg-gray-700 cursor-pointer">
              utils.ts
            </div>
          </div>

          {/* Code Area */}
          <div className="flex-1 p-4 font-mono text-sm">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-gray-900 text-gray-100 border-none resize-none focus:outline-none"
              spellCheck={false}
            />
          </div>

          {/* Terminal */}
          <div className="h-48 bg-gray-800 border-t border-gray-700">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
              <span className="text-sm font-semibold">Terminal</span>
              <div className="flex gap-2">
                <button className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600">
                  Run
                </button>
                <button className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600">
                  Clear
                </button>
              </div>
            </div>
            <div className="p-4 font-mono text-sm text-gray-300">
              <div className="text-green-400">$ npm run dev</div>
              <div className="text-gray-400 mt-1">Starting development server...</div>
              <div className="text-gray-400">Ready on http://localhost:3000</div>
            </div>
          </div>
        </div>

        {/* Collaborators */}
        <div className="w-48 bg-gray-800 border-l border-gray-700 p-4">
          <h2 className="text-sm font-semibold mb-4 text-gray-400 uppercase tracking-wider">
            Collaborators
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-xs">
                JD
              </div>
              <div>
                <div className="text-sm">John Doe</div>
                <div className="text-xs text-green-400">Online</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-xs">
                SK
              </div>
              <div>
                <div className="text-sm">Sarah Kim</div>
                <div className="text-xs text-green-400">Online</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-xs">
                MR
              </div>
              <div>
                <div className="text-sm">Mike Ross</div>
                <div className="text-xs text-gray-400">Away</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
