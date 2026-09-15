import ChatSidebar from '../components/chat/ChatSidebar'

export default function ChatListPage() {
  return (
    <div className="app page-chats">
      <ChatSidebar />
      <div className="chat-main chat-empty">
        <div className="empty-state">
          <div className="empty-logo">A</div>
          <p className="empty-hint">Chat tanlang yoki yangi chat boshlang</p>
        </div>
      </div>
    </div>
  )
}