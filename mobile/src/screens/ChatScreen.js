import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../theme'
import { useAuthStore } from '../store/useAuthStore'
import { useChatStore } from '../store/useChatStore'
import { emitJoinChat } from '../hooks/useChatSocket'
import {
  getOtherUser,
  getChatName,
  getInitials,
  formatTime,
  formatDayLabel,
  sameDay,
} from '../utils/format'
import MessageBubble from '../components/MessageBubble'
import MessageInput from '../components/MessageInput'

export default function ChatScreen({ navigation, route }) {
  const { chatId } = route.params
  const user = useAuthStore((state) => state.user)
  const chats = useChatStore((state) => state.chats)
  const messages = useChatStore((state) => state.messages[chatId] || [])
  const isLoadingMessages = useChatStore((state) => state.isLoadingMessages)
  const typingUsers = useChatStore((state) => state.typingUsers[chatId] || [])
  const onlineUsers = useChatStore((state) => state.onlineUsers)
  const fetchMessages = useChatStore((state) => state.fetchMessages)
  const selectChat = useChatStore((state) => state.selectChat)
  const markChatRead = useChatStore((state) => state.markChatRead)
  const sendMessage = useChatStore((state) => state.sendMessage)

  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchIndex, setSearchIndex] = useState(0)

  const scrollRef = useRef(null)

  const chat = chats.find((item) => item.id === chatId) || null
  const otherUser = getOtherUser(chat || {}, user?.id)
  const chatName = getChatName(chat || {}, user?.id)
  const isGroup = chat?.isGroup || false
  const otherOnline = otherUser ? onlineUsers[otherUser.id] : false
  const membersOnlineCount = isGroup
    ? (chat?.members || []).filter((m) => m.id !== user?.id && onlineUsers[m.id]).length
    : 0
  const statusText = isTyping
    ? ''
    : isGroup
      ? `${chat?.members?.length || 0} a'zo, ${membersOnlineCount} onlayn`
      : otherOnline
        ? 'onlayn'
        : otherUser?.username || ''

  const typingNames = typingUsers.filter((name) => name !== user?.username)
  const isTyping = typingNames.length > 0
  const typingLabel =
    typingNames.length === 1
      ? `${typingNames[0]} yozmoqda...`
      : typingNames.length > 1
        ? `${typingNames.length} kishi yozmoqda...`
        : ''

  const decoratedMessages = useMemo(
    () =>
      messages.map((message) => ({
        ...message,
        time: formatTime(message.createdAt),
      })),
    [messages],
  )

  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.trim().toLowerCase()
    return decoratedMessages
      .map((m, i) => ({ m, i }))
      .filter(({ m }) => (m.text || '').toLowerCase().includes(q))
  }, [searchQuery, decoratedMessages])

  const matchedIndexes = useMemo(() => searchMatches.map((s) => s.i), [searchMatches])

  useEffect(() => {
    selectChat(chatId)
    fetchMessages(chatId)
    emitJoinChat(chatId)
    markChatRead(chatId)
  }, [chatId, selectChat, fetchMessages, markChatRead])

  useEffect(() => {
    if (matchedIndexes.length === 0) return
    setSearchIndex((current) => Math.min(current, matchedIndexes.length - 1))
  }, [matchedIndexes.length])

  useEffect(() => {
    if (matchedIndexes.length === 0 || searchIndex >= matchedIndexes.length) return
    const target = matchedIndexes[searchIndex]
    scrollRef.current?.scrollTo({
      y: target * 60,
      animated: true,
    })
  }, [searchIndex, matchedIndexes])

  const scrollToEnd = () => {
    scrollRef.current?.scrollToEnd({ animated: true })
  }

  const decoratedWithSections = useMemo(() => {
    const result = []
    let prevDate = null
    decoratedMessages.forEach((message) => {
      if (!prevDate || !sameDay(prevDate, message.createdAt)) {
        result.push({ type: 'separator', date: message.createdAt })
        prevDate = message.createdAt
      }
      result.push({ type: 'message', message })
    })
    return result
  }, [decoratedMessages])

  const goToChatInfo = () => {
    navigation.navigate('ChatInfo', { chatId })
  }

  const goToNextMatch = () => {
    if (matchedIndexes.length === 0) return
    setSearchIndex((current) => (current + 1) % matchedIndexes.length)
  }

  const goToPrevMatch = () => {
    if (matchedIndexes.length === 0) return
    setSearchIndex((current) =>
      current === 0 ? matchedIndexes.length - 1 : current - 1,
    )
  }

  let messageIndex = -1

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>&#8592;</Text>
        </Pressable>
        <Pressable style={styles.headerMain} onPress={goToChatInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(chatName)}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>
              {chatName}
            </Text>
            <Text style={styles.headerStatus} numberOfLines={1}>
              {isTyping ? typingLabel : statusText}
            </Text>
          </View>
        </Pressable>
        <Pressable
          style={styles.searchBtn}
          onPress={() => setIsSearching((value) => !value)}
        >
          <Text style={styles.searchIcon}>&#128269;</Text>
        </Pressable>
      </View>

      {isSearching && (
        <View style={styles.searchBar}>
          <View style={styles.searchInputWrap}>
            <TextInput
              style={styles.searchInput}
              placeholder="Xabarlardan qidirish..."
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              value={searchQuery}
              onChangeText={(v) => {
                setSearchQuery(v)
                setSearchIndex(0)
              }}
              autoFocus
            />
            {searchQuery.trim() && (
              <View style={styles.searchCount}>
                <Text style={styles.searchCountText}>
                  {matchedIndexes.length > 0
                    ? `${searchIndex + 1}/${matchedIndexes.length}`
                    : '0'}
                </Text>
              </View>
            )}
          </View>
          {matchedIndexes.length > 0 && (
            <View style={styles.searchNav}>
              <Pressable style={styles.searchNavBtn} onPress={goToPrevMatch}>
                <Text style={styles.searchNavText}>&#8593;</Text>
              </Pressable>
              <Pressable style={styles.searchNavBtn} onPress={goToNextMatch}>
                <Text style={styles.searchNavText}>&#8595;</Text>
              </Pressable>
            </View>
          )}
          <Pressable onPress={() => { setIsSearching(false); setSearchQuery('') }}>
            <Text style={styles.searchClose}>&times;</Text>
          </Pressable>
        </View>
      )}

      {isLoadingMessages ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : decoratedMessages.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.hint}>Xabarlar yo'q. Birinchi xabarni yozing!</Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={styles.messagesArea}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={searchQuery.trim() ? undefined : scrollToEnd}
        >
          {decoratedWithSections.map((section, index) => {
            if (section.type === 'separator') {
              return (
                <View key={`sep-${index}`} style={styles.separatorWrap}>
                  <Text style={styles.separatorText}>
                    {formatDayLabel(section.date)}
                  </Text>
                </View>
              )
            }

            messageIndex += 1
            const message = section.message
            const senderId = message.sender?.id ?? message.senderId
            const isOwn = senderId === user?.id
            const prev = decoratedMessages[messageIndex - 1]
            const showSender = !prev || prev.sender?.id !== senderId
            const isMatch = matchedIndexes.includes(messageIndex)

            return (
              <View
                key={message.id || `msg-${index}`}
                style={[
                  isMatch && searchQuery.trim()
                    ? styles.searchHighlightWrap
                    : null,
                ]}
              >
                <MessageBubble
                  message={message}
                  isOwn={isOwn}
                  showSender={showSender}
                  senderName={message.sender?.username || chatName}
                />
              </View>
            )
          })}
        </ScrollView>
      )}

      <MessageInput chatId={chatId} onSend={(text) => sendMessage(chatId, text)} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.sidebar,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: colors.textSecondary,
    fontSize: 20,
  },
  headerMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  headerStatus: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: { fontSize: 17, color: colors.textSecondary },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.sidebar,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  searchCount: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(51,144,236,0.15)',
    borderRadius: 6,
  },
  searchCountText: { color: colors.accent, fontSize: 12, fontWeight: '600' },
  searchNav: { flexDirection: 'row', gap: 4 },
  searchNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchNavText: { color: colors.text, fontSize: 15 },
  searchClose: { color: colors.textSecondary, fontSize: 24, paddingHorizontal: 4 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  messagesArea: {
    flex: 1,
  },
  messagesContent: {
    padding: 14,
    flexGrow: 1,
  },
  separatorWrap: {
    alignItems: 'center',
    marginVertical: 10,
  },
  separatorText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: colors.sidebar,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  searchHighlightWrap: {
    backgroundColor: 'rgba(51,144,236,0.18)',
    borderRadius: 12,
  },
})