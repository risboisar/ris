'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [messages, setMessages] = useState<any[]>([])

  const ADMIN_PASSWORD = 'risadmin123'

  async function fetchMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })

    setMessages(data || [])
  }

  async function deleteMessage(id: number) {
    await supabase
      .from('messages')
      .delete()
      .eq('id', id)

    fetchMessages()
  }

  async function clearChat() {
    await supabase
      .from('messages')
      .delete()
      .neq('id', 0)

    fetchMessages()
  }

  useEffect(() => {
    if (authorized) {
      fetchMessages()
    }
  }, [authorized])

  function login() {
    if (password === ADMIN_PASSWORD) {
      setAuthorized(true)
    } else {
      alert('Wrong password')
    }
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            RIS Admin
          </h1>

          <p className="text-zinc-400 mb-6">
            Enter admin password
          </p>

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                login()
              }
            }}
            className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-xl p-3 outline-none mb-4"
          />

          <button
            onClick={login}
            className="w-full bg-white text-black rounded-xl p-3 font-semibold"
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">
            RIS Admin Panel
          </h1>

          <p className="text-zinc-400 mt-1">
            Manage global chat
          </p>
        </div>

        <button
          onClick={clearChat}
          className="bg-red-600 hover:bg-red-700 transition px-5 py-3 rounded-2xl"
        >
          Clear Chat
        </button>
      </div>

      <div className="space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center font-bold">
                    {msg.name?.charAt(0)}
                  </div>

                  <div>
                    <p className="font-bold">
                      {msg.name}
                    </p>

                    <p className="text-sm text-zinc-500">
                      @{msg.username}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-zinc-200">
                  {msg.message}
                </p>

                <p className="text-xs text-zinc-500 mt-4">
                  {new Date(
                    msg.created_at
                  ).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() =>
                  deleteMessage(msg.id)
                }
                className="bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded-xl text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}