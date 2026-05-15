'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [joined, setJoined] = useState(false)
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<any[]>([])

  const bottomRef = useRef<HTMLDivElement | null>(null)

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

  async function sendMessage() {
    if (!message.trim()) return

    await supabase.from('messages').insert([
      {
        name,
        username,
        message,
      },
    ])

    setMessage('')
  }

  function joinChat() {
    if (name.trim() && username.trim()) {
      setJoined(true)
    }
  }

 if (!joined) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e1b4b] text-white flex items-center justify-center p-4 overflow-hidden">
      
      <div className="absolute w-72 h-72 bg-violet-500/20 blur-3xl rounded-full top-10 left-10"></div>
      <div className="absolute w-72 h-72 bg-blue-500/20 blur-3xl rounded-full bottom-10 right-10"></div>

      <div className="relative w-full max-w-md backdrop-blur-2xl bg-white/10 border border-white/10 rounded-[32px] p-8 shadow-2xl">
        
        <div className="flex flex-col items-center mb-8">
          <img
            src="https://d3bat55ebwjhsf.cloudfront.net/schools/logos/user_root_user@ezy.com/Screenshot_2024-06-18_174652.png"
            alt="RIS Logo"
            className="w-24 h-24 rounded-3xl object-cover shadow-2xl mb-5"
          />

          <h1 className="text-4xl font-bold tracking-tight">
            RIS Chat
          </h1>

          <p className="text-zinc-300 mt-2 text-center">
            Join the global realtime conversation
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Your name"
            className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 outline-none placeholder:text-zinc-400 focus:border-violet-400 transition"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                joinChat()
              }
            }}
          />

          <input
            type="text"
            placeholder="Username"
            className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 outline-none placeholder:text-zinc-400 focus:border-violet-400 transition"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                joinChat()
              }
            }}
          />

          <button
            onClick={joinChat}
            className="w-full bg-gradient-to-r from-blue-500 to-violet-500 hover:scale-[1.02] transition-all duration-200 rounded-2xl p-4 font-semibold shadow-xl"
          >
            Enter Global Chat
          </button>
        </div>

        <p className="text-center text-xs text-zinc-500 mt-6">
          RIS • Realtime Interactive Social
        </p>
      </div>
    </div>
  )
}
return (
  <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e1b4b] text-white flex flex-col">
    
    <div className="backdrop-blur-xl bg-white/5 border-b border-white/10 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            RIS Global Chat
          </h1>

          <p className="text-sm text-zinc-400 mt-1">
            Connect with everyone in realtime
          </p>
        </div>

        <img
         src="https://d3bat55ebwjhsf.cloudfront.net/schools/logos/user_root_user@ezy.com/Screenshot_2024-06-18_174652.png"
         alt="RIS Logo"
         className="w-12 h-12 rounded-2xl object-cover shadow-lg"
        />
      </div>
    </div>

    <div className="flex-1 overflow-y-auto px-3 py-5 space-y-5">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className="flex items-end gap-3"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center font-bold shrink-0 shadow-lg">
            {msg.name?.charAt(0)}
          </div>

          <div className="max-w-[82%]">
            <div className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-3xl px-4 py-3 shadow-xl">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">
                  {msg.name}
                </span>
              </div>

              <p className="text-zinc-100 break-words leading-relaxed">
                {msg.message}
              </p>
            </div>

            <p className="text-xs text-zinc-500 mt-1 ml-2">
              {new Date(
                msg.created_at
              ).toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}

      <div ref={bottomRef}></div>
    </div>

    <div className="sticky bottom-0 p-3 backdrop-blur-2xl bg-black/20 border-t border-white/10">
      <div className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-full px-3 py-2 shadow-2xl">
        
        <input
          type="text"
          placeholder="Message everyone..."
          className="flex-1 bg-transparent outline-none text-white placeholder:text-zinc-400 px-2"
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
          className="bg-gradient-to-r from-blue-500 to-violet-500 hover:scale-105 transition-all duration-200 px-6 py-2 rounded-full font-semibold shadow-lg"
        >
          Send
        </button>
      </div>
    </div>
  </div>
)
}