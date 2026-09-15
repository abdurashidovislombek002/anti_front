import { useRef, useState } from 'react'
import { getSocket, SOCKET_EVENTS } from '../../socket/socket'
import { useAuthStore } from '../../store/useAuthStore'

export default function MessageInput({ chatId, onSend }) {
  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const typingTimer = useRef(null)
  const user = useAuthStore((state) => state.user)

  const emitTyping = (isTyping) => {
    const socket = getSocket()
    if (!socket) return
    socket.emit(SOCKET_EVENTS.TYPING, {
      chatId,
      username: user?.username,
      isTyping,
    })
  }

  const handleChange = (event) => {
    setText(event.target.value)

    const socket = getSocket()
    if (socket) {
      socket.emit(SOCKET_EVENTS.TYPING, {
        chatId,
        username: user?.username,
        isTyping: true,
      })
      if (typingTimer.current) clearTimeout(typingTimer.current)
      typingTimer.current = setTimeout(() => {
        emitTyping(false)
        typingTimer.current = null
      }, 1500)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!text.trim() || isSending) return

    setIsSending(true)
    if (typingTimer.current) clearTimeout(typingTimer.current)
    emitTyping(false)
    typingTimer.current = null

    const { ok } = await onSend(text)
    if (ok) {
      setText('')
    }
    setIsSending(false)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit(event)
    }
  }

  return (
    <form className="message-input-form" onSubmit={handleSubmit}>
      <textarea
        className="message-input"
        rows={1}
        placeholder="Xabar yozing..."
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <button className="btn-send" type="submit" disabled={!text.trim() || isSending}>
        &#10148;
      </button>
    </form>
  )
}