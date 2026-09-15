import { getInitials } from '../../utils/format'

export default function MessageBubble({ message, isOwn, showAvatar, senderName }) {
  return (
    <div className={`message-row ${isOwn ? 'message-row-own' : ''}`}>
      {!isOwn && (
        <div className="avatar avatar-xs">{getInitials(senderName)}</div>
      )}
      <div className={`bubble ${isOwn ? 'bubble-own' : 'bubble-other'}`}>
        {showAvatar && !isOwn && (
          <div className="bubble-sender">{senderName}</div>
        )}
        <div className="bubble-text">{message.text}</div>
        <div className="bubble-time">{message.time}</div>
      </div>
    </div>
  )
}