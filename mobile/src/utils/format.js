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

export function formatDayLabel(dateValue) {
  if (!dateValue) return ''
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return ''

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (startOfDay.getTime() === startOfToday.getTime()) return 'Bugun'
  if (startOfDay.getTime() === startOfToday.getTime() - 86400000) return 'Kecha'

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })
  }

  return date.toLocaleDateString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function sameDay(aValue, bValue) {
  const a = new Date(aValue)
  const b = new Date(bValue)
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return false
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function getOtherUser(chat, currentUserId) {
  if (chat.isGroup) return null
  const members = chat.members || chat.users || chat.participants || []
  return members.find((item) => item.id !== currentUserId) || members[0] || null
}

export function getChatName(chat, currentUserId) {
  if (chat?.isGroup && chat?.name) return chat.name
  const other = getOtherUser(chat, currentUserId)
  return other?.username || chat?.name || "Noma'lum"
}

export function getMembersNames(chat, currentUserId, limit = 3) {
  const members = chat?.members || []
  const others = members.filter((m) => m.id !== currentUserId)
  const names = others.slice(0, limit).map((m) => m.username || m.name || '?')
  if (others.length > limit) {
    names.push(`+${others.length - limit}`)
  }
  return names.join(', ')
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