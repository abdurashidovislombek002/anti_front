import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { useChatStore } from '../../store/useChatStore'
import { getOtherUser, getInitials, formatChatTime } from '../../utils/format'
import Modal from '../common/Modal'
import api from '../../api/axios'

export default function ChatSidebar() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const logout = useAuthStore((state) => state.logout)
  const chats = useChatStore((state) => state.chats)
  const activeChatId = useChatStore((state) => state.activeChatId)
  const isLoadingChats = useChatStore((state) => state.isLoadingChats)
  const fetchChats = useChatStore((state) => state.fetchChats)
  const selectChat = useChatStore((state) => state.selectChat)

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [newChatUsername, setNewChatUsername] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  useEffect(() => {
    if (token && !chats.length) {
      fetchChats()
    }
  }, [token, chats.length, fetchChats])

  const handleOpenChat = (chat) => {
    selectChat(chat.id)
    navigate(`/chats/${chat.id}`)
  }

  const handleCreateChat = async () => {
    const username = newChatUsername.trim()
    if (!username || isCreating) return

    setIsCreating(true)
    setCreateError('')
    try {
      const { data } = await api.post('/chats', { username })
      const chat = data.chat || data
      const chatId = chat.id ?? chat._id
      fetchChats()
      setModalOpen(false)
      setNewChatUsername('')
      selectChat(chatId)
      navigate(`/chats/${chatId}`)
    } catch (error) {
      setCreateError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          'Foydalanuvchi topilmadi',
      )
    } finally {
      setIsCreating(false)
    }
  }

  const filteredChats = chats.filter((chat) => {
    if (!search.trim()) return true
    const other = getOtherUser(chat, user?.id)
    const name = other?.username || chat.name || ''
    return name.toLowerCase().includes(search.trim().toLowerCase())
  })

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo">A</div>
            <span className="sidebar-title">Antigram</span>
          </div>
          <button
            className="icon-btn new-chat-btn"
            type="button"
            title="Yangi chat"
            onClick={() => setModalOpen(true)}
          >
            +
          </button>
        </div>

        <div className="sidebar-user">
          <div className="avatar avatar-sm">
            {getInitials(user?.username || 'A')}
          </div>
          <span className="sidebar-username">{user?.username || 'Foydalanuvchi'}</span>
          <button className="logout-btn" type="button" onClick={logout}>
            Chiqish
          </button>
        </div>

        <div className="sidebar-search">
          <input
            className="search-input"
            type="text"
            placeholder="Chatlarni qidirish"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="chat-list">
          {isLoadingChats && <div className="chat-list-hint">Yuklanmoqda...</div>}

          {!isLoadingChats && filteredChats.length === 0 && (
            <div className="chat-list-hint">
              {search ? 'Hech narsa topilmadi' : 'Chatlar hozircha yo\'q'}
            </div>
          )}

          {filteredChats.map((chat) => {
            const other = getOtherUser(chat, user?.id)
            const name = other?.username || chat.name || 'Noma\'lum'
            const lastMessage = chat.lastMessage?.text || ''
            const isLastOwn = chat.lastMessage?.sender?.id === user?.id

            return (
              <button
                key={chat.id}
                className={`chat-item ${chat.id === activeChatId ? 'chat-item-active' : ''}`}
                type="button"
                onClick={() => handleOpenChat(chat)}
              >
                <div className="avatar avatar-md">{getInitials(name)}</div>
                <div className="chat-item-info">
                  <div className="chat-item-top">
                    <span className="chat-item-name">{name}</span>
                    <span className="chat-item-time">
                      {formatChatTime(chat.lastMessage?.createdAt)}
                    </span>
                  </div>
                  <div className="chat-item-preview">
                    {isLastOwn ? 'Siz: ' : ''}
                    {lastMessage || 'Xabar yo\'q'}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </aside>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setCreateError('')
        }}
        title="Yangi chat"
      >
        <form
          className="modal-form"
          onSubmit={(event) => {
            event.preventDefault()
            handleCreateChat()
          }}
        >
          <input
            className="modal-input"
            type="text"
            placeholder="Foydalanuvchi nomi"
            value={newChatUsername}
            onChange={(event) => setNewChatUsername(event.target.value)}
            autoFocus
          />
          {createError && <div className="form-error">{createError}</div>}
          <button className="btn btn-primary btn-block" type="submit" disabled={isCreating}>
            {isCreating ? 'Yaratilmoqda...' : 'Chatni boshlash'}
          </button>
        </form>
      </Modal>
    </>
  )
}