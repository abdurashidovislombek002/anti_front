import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { useChatStore } from '../../store/useChatStore'
import { getSocketForChat } from '../../hooks/useChatSocket'
import { getOtherUser, getInitials, formatTime } from '../../utils/format'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'

export default function ChatWindow({ chat }) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const messages = useChatStore((state) => state.messages[chat.id] || [])
  const isLoadingMessages = useChatStore((state) => state.isLoadingMessages)
  const typingUsers = useChatStore((state) => state.typingUsers[chat.id] || [])
  const sendMessage = useChatStore((state) => state.sendMessage)

  const bottomRef = useRef(null)

  const otherUser = getOtherUser(chat, user?.id)
  const chatName = otherUser?.username || chat.name || 'Chat'

  const typingNames = typingUsers.filter((name) => name !== user?.username)
  const isTyping = typingNames.length > 0
  const typingLabel = typingNames[0] ? `${typingNames[0]} yozmoqda...` : ''

  const decoratedMessages = useMemo(
    () =>
      messages.map((message) => ({
        ...message,
        time: formatTime(message.createdAt),
      })),
    [messages],
  )

  useEffect(() => {
    getSocketForChat(chat.id)
  }, [chat.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isLoadingMessages])

  const handleBack = () => {
    navigate('/chats')
  }

  return (
    <div className="chat-main">
      <header className="chat-header">
        <button className="back-btn icon-btn" type="button" onClick={handleBack}>
          &#8592;
        </button>
        <div className="avatar avatar-sm">{getInitials(chatName)}</div>
        <div className="chat-header-info">
          <span className="chat-header-name">{chatName}</span>
          <span className="chat-header-status">{isTyping ? typingLabel : 'onlayn'}</span>
        </div>
      </header>

      <div className="messages-area">
        {isLoadingMessages && <div className="chat-list-hint">Xabarlar yuklanmoqda...</div>}

        {!isLoadingMessages && decoratedMessages.length === 0 && (
          <div className="chat-list-hint">Xabarlar yo'q. Birinchi xabarni yozing!</div>
        )}

        {decoratedMessages.map((message, index) => {
          const senderId = message.sender?.id ?? message.senderId
          const isOwn = senderId === user?.id
          const prevSenderId = decoratedMessages[index - 1]?.sender?.id
          const showAvatar = prevSenderId !== senderId

          return (
            <MessageBubble
              key={message.id || index}
              message={message}
              isOwn={isOwn}
              showAvatar={showAvatar}
              senderName={message.sender?.username || chatName}
            />
          )
        })}

        <div ref={bottomRef} />
      </div>

      {isTyping && <div className="typing-indicator">{typingLabel}</div>}

      <MessageInput chatId={chat.id} onSend={(text) => sendMessage(chat.id, text)} />
    </div>
  )
}