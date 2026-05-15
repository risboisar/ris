'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<any[]>([])

  const bottomRef = useRef<HTMLDivElement | null>(null)

  const ADMIN_USERNAME = 'admin'
  const ADMIN_PASSWORD = 'ris123'

  useEffect(() => {
    fetchMessages()

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchMessages()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages])

  async function fetchMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })

    setMessages(data || [])
  }

  function login() {
    if (
      username === ADMIN_USERNAME &&
      password === ADMIN_PASSWORD
    ) {
      setLoggedIn(true)
    } else {
      alert('Wrong admin credentials')
    }
  }

  async function sendMessage() {
    if (!message.trim()) return

    await supabase.from('messages').insert([
      {
        name: 'RIS Admin',
        username: 'admin',
        message,
        is_admin: true,
      },
    ])

    setMessage('')
  }

  async function deleteMessage(id: number) {
    await supabase
      .from('messages')
      .delete()
      .eq('id', id)

    fetchMessages()
  }

  async function clearChat() {
    const confirmDelete = confirm(
      'Delete ALL chat messages?'
    )

    if (!confirmDelete) return

    await supabase
      .from('messages')
      .delete()
      .neq('id', 0)

    fetchMessages()
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-white flex items-center justify-center p-4">

        <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl">

          <div className="flex flex-col items-center mb-8">

            <img
              src="https://d3bat55ebwjhsf.cloudfront.net/schools/logos/user_root_user@ezy.com/Screenshot_2024-06-18_174652.png"
              alt="RIS Logo"
              className="w-24 h-24 rounded-3xl mb-5 object-cover shadow-2xl"
            />

            <h1 className="text-4xl font-bold">
              RIS Admin
            </h1>

            <p className="text-zinc-400 mt-2">
              Secure administrator access
            </p>
          </div>

          <div className="space-y-4">

            <input
              type="text"
              placeholder="Admin username"
              className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              onClick={login}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-4 rounded-2xl shadow-xl hover:scale-[1.02] transition"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e1b4b] text-white flex flex-col">

      <div className="backdrop-blur-xl bg-white/5 border-b border-white/10 p-4">

        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold text-yellow-400">
              RIS Admin Panel
            </h1>

            <p className="text-zinc-400 mt-1">
              Manage global realtime chat
            </p>
          </div>

          <button
            onClick={clearChat}
            className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded-2xl font-bold shadow-lg"
          >
            Clear Chat
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-3xl p-5 shadow-xl border flex justify-between gap-4 ${
              msg.is_admin
                ? 'bg-gradient-to-r from-yellow-400/80 via-orange-500/80 to-red-500/80 border-yellow-300 text-black'
                : 'bg-white/10 border-white/10'
            }`}
          >

            <div className="flex-1">

              <div className="flex items-center gap-2 flex-wrap mb-2">

                <span className="font-bold text-lg">
                  {msg.name}
                </span>

                <span
                  className={`text-sm ${
                    msg.is_admin
                      ? 'text-black/70'
                      : 'text-zinc-400'
                  }`}
                >
                  @{msg.username}
                </span>

                {msg.is_admin && (
                  <span className="bg-black text-yellow-400 text-xs px-2 py-1 rounded-full font-bold">
                    ADMIN
                  </span>
                )}
              </div>

              <p
                className={`break-words leading-relaxed ${
                  msg.is_admin
                    ? 'text-black font-medium'
                    : 'text-zinc-100'
                }`}
              >
                {msg.message}
              </p>

              <p
                className={`text-xs mt-3 ${
                  msg.is_admin
                    ? 'text-black/70'
                    : 'text-zinc-500'
                }`}
              >
                {new Date(
                  msg.created_at
                ).toLocaleTimeString()}
              </p>
            </div>

            <button
              onClick={() => deleteMessage(msg.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl h-fit font-semibold"
            >
              Delete
            </button>
          </div>
        ))}

        <div ref={bottomRef}></div>
      </div>

      <div className="sticky bottom-0 p-4 backdrop-blur-2xl bg-black/20 border-t border-white/10">

        <div className="flex gap-3 bg-white/10 border border-white/10 rounded-full px-3 py-2 shadow-2xl">

          <input
            type="text"
            placeholder="Send admin announcement..."
            className="flex-1 bg-transparent outline-none text-white placeholder:text-zinc-400 px-3"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendMessage()
              }
            }}
          />

          <button
            onClick={sendMessage}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}