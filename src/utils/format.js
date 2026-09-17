export function formatTime(dateValue) {
  if (!dateValue) return ''
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function formatChatTime(dateValue) {
  if (!dateValue) return ''
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return ''

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (startOfDay.getTime() === startOfToday.getTime()) {
    return formatTime(date)
  }

  if (startOfDay.getTime() === startOfToday.getTime() - 86400000) {
    return 'Kecha'
  }

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { day: 'numeric', month: 'short' })
  }

  return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })
}

export function getOtherUser(chat, currentUserId) {
  // Backend "peer" deb, allaqachon topilgan foydalanuvchini qaytaradi
  if (chat.peer) return chat.peer

  const members = chat.members || chat.users || chat.participants || []
  return members.find((user) => user.id !== currentUserId) || members[0] || null
}

export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}