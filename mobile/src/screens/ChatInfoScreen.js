import { useEffect, useState } from 'react'
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../theme'
import { useAuthStore } from '../store/useAuthStore'
import { useChatStore } from '../store/useChatStore'
import { getChatName, getInitials } from '../utils/format'
import api from '../api/axios'

export default function ChatInfoScreen({ navigation, route }) {
  const { chatId } = route.params
  const user = useAuthStore((state) => state.user)
  const chats = useChatStore((state) => state.chats)
  const fetchChats = useChatStore((state) => state.fetchChats)
  const searchUsers = useChatStore((state) => state.searchUsers)
  const searchResults = useChatStore((state) => state.searchResults)

  const [showAddMember, setShowAddMember] = useState(false)
  const [memberQuery, setMemberQuery] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [message, setMessage] = useState('')

  const chat = chats.find((item) => item.id === chatId) || null
  const isGroup = chat?.isGroup || false
  const chatName = getChatName(chat || {}, user?.id)
  const members = chat?.members || []
  const otherUser = members.find((m) => m.id !== user?.id) || null

  useEffect(() => {
    fetchChats()
  }, [fetchChats])

  const handleMemberSearch = (value) => {
    setMemberQuery(value)
    if (value.trim()) {
      searchUsers(value)
    }
  }

  const isAlreadyMember = (userId) =>
    members.some((m) => m.id === userId)

  const handleAddMember = async (userToAdd) => {
    setIsAdding(true)
    setMessage('')
    try {
      const { data } = await api.post(`/chats/${chatId}/members`, {
        username: userToAdd.username,
      })
      const updatedChat = data.chat || data
      if (updatedChat) {
        useChatStore.setState((state) => ({
          chats: state.chats.map((c) =>
            c.id === chatId ? { ...c, ...updatedChat, members: updatedChat.members || c.members } : c,
          ),
        }))
      }
      setMessage(`@${userToAdd.username} qo'shildi`)
      setMemberQuery('')
      setShowAddMember(false)
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "A'zo qo'shib bo'lmadi",
      )
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>&#8592;</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Ma'lumot</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={members}
        keyExtractor={(item, i) => item.id || String(i)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <View style={styles.chatIdentity}>
              <View style={[styles.bigAvatar, isGroup && styles.bigAvatarGroup]}>
                <Text style={styles.bigAvatarText}>{getInitials(chatName)}</Text>
              </View>
              <Text style={styles.chatName}>{chatName}</Text>
              <Text style={styles.chatType}>
                {isGroup ? `${members.length} a'zo` : `@${otherUser?.username || ''}`}
              </Text>
            </View>

            {message && (
              <Text style={styles.message}>{message}</Text>
            )}

            {isGroup && (
              <Pressable
                style={styles.addMemberToggle}
                onPress={() => setShowAddMember((value) => !value)}
              >
                <Text style={styles.addMemberToggleText}>
                  {showAddMember ? 'Yopish' : '+ A\'zo qo\'shish'}
                </Text>
              </Pressable>
            )}

            {showAddMember && (
              <View style={styles.addMemberBox}>
                <TextInput
                  style={styles.input}
                  placeholder="Foydalanuvchi qidirish..."
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  autoFocus
                  value={memberQuery}
                  onChangeText={handleMemberSearch}
                />
                {searchResults.length > 0 && (
                  <View style={styles.searchResults}>
                    {searchResults
                      .filter((r) => r.id !== user?.id && !isAlreadyMember(r.id))
                      .map((r) => (
                        <Pressable
                          key={r.id}
                          style={styles.resultRow}
                          onPress={() => handleAddMember(r)}
                          disabled={isAdding}
                        >
                          <View style={styles.resultAvatar}>
                            <Text style={styles.resultAvatarText}>
                              {getInitials(r.username)}
                            </Text>
                          </View>
                          <Text style={styles.resultName}>@{r.username}</Text>
                          <Text style={styles.resultAdd}>
                            {isAdding ? '...' : '+'}
                          </Text>
                        </Pressable>
                      ))}
                  </View>
                )}
                {memberQuery.trim() && searchResults.length === 0 && (
                  <Text style={styles.noResults}>Foydalanuvchi topilmadi</Text>
                )}
              </View>
            )}

            <Text style={styles.sectionTitle}>
              {isGroup ? 'A\'zolar' : "Ma'lumot"}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.memberRow}>
            <View style={[styles.memberAvatar, item.id === user?.id && styles.memberAvatarSelf]}>
              <Text style={styles.memberAvatarText}>{getInitials(item.username)}</Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>@{item.username}</Text>
              {item.id === user?.id && (
                <Text style={styles.memberTag}>Siz</Text>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          !isGroup ? (
            <Text style={styles.emptyText}>A\'zo ma\'lumotlari topilmadi</Text>
          ) : null
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.sidebar,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  backText: { color: colors.textSecondary, fontSize: 20 },
  headerTitle: { flex: 1, color: colors.text, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  headerSpacer: { width: 40 },
  content: { padding: 20, gap: 8 },
  chatIdentity: { alignItems: 'center', marginBottom: 16 },
  bigAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  bigAvatarGroup: { backgroundColor: '#4caf50', borderRadius: 24 },
  bigAvatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  chatName: { color: colors.text, fontSize: 20, fontWeight: '700' },
  chatType: { color: colors.textSecondary, fontSize: 14, marginTop: 4 },
  message: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    backgroundColor: colors.sidebar,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  addMemberToggle: {
    backgroundColor: 'rgba(51,144,236,0.15)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  addMemberToggleText: { color: colors.accent, fontSize: 14, fontWeight: '600' },
  addMemberBox: {
    backgroundColor: colors.sidebar,
    borderRadius: 10,
    padding: 12,
    gap: 10,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: colors.text,
    fontSize: 15,
  },
  searchResults: { gap: 4 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  resultAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.sidebarHover,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultAvatarText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  resultName: { flex: 1, color: colors.text, fontSize: 14 },
  resultAdd: { color: colors.accent, fontSize: 22, fontWeight: '700' },
  noResults: { color: colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 8 },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 6,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarSelf: { backgroundColor: '#4caf50' },
  memberAvatarText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  memberInfo: { flex: 1 },
  memberName: { color: colors.text, fontSize: 15 },
  memberTag: { color: colors.accent, fontSize: 12, marginTop: 2 },
  emptyText: { color: colors.textMuted, fontSize: 14, textAlign: 'center', padding: 20 },
})