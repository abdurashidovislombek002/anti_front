import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import ChatSidebar from '../components/chat/ChatSidebar'
import ChatWindow from '../components/chat/ChatWindow'
import { useChatStore } from '../store/useChatStore'

export default function ChatPage() {
  const { chatId } = useParams()
  const chats = useChatStore((state) => state.chats)
  const fetchChats = useChatStore((state) => state.fetchChats)
  const selectChat = useChatStore((state) => state.selectChat)
  const fetchMessages = useChatStore((state) => state.fetchMessages)

  const chat = chats.find((item) => String(item.id) === String(chatId)) || null

  useEffect(() => {
    selectChat(chatId)
    fetchMessages(chatId)
  }, [chatId, selectChat, fetchMessages])

  useEffect(() => {
    if (chats.length === 0) {
      fetchChats()
    }
  }, [chats.length, fetchChats])

  if (chats.length > 0 && !chat) {
    return <Navigate to="/chats" replace />
  }

  return (
    <div className="app page-chat">
      <ChatSidebar />
      {chat ? (
        <ChatWindow chat={chat} />
      ) : (
        <div className="chat-main chat-empty">
          <div className="empty-state">
            <div className="empty-logo">A</div>
            <p className="empty-hint">Chat yuklanmoqda...</p>
          </div>
        </div>
      )}
    </div>
  )
}