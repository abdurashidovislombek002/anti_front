import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Modal,
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
import {
  getChatName,
  getMembersNames,
  getInitials,
  formatChatTime,
} from '../utils/format'
import GroupChatModal from '../components/GroupChatModal'

export default function ChatListScreen({ navigation }) {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const chats = useChatStore((state) => state.chats)
  const unreadCounts = useChatStore((state) => state.unreadCounts)
  const isLoadingChats = useChatStore((state) => state.isLoadingChats)
  const fetchChats = useChatStore((state) => state.fetchChats)
  const selectChat = useChatStore((state) => state.selectChat)
  const createChat = useChatStore((state) => state.createChat)
  const createGroupChat = useChatStore((state) => state.createGroupChat)
  const isCreatingChat = useChatStore((state) => state.isCreatingChat)
  const storeError = useChatStore((state) => state.error)

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [groupModalOpen, setGroupModalOpen] = useState(false)
  const [newChatUsername, setNewChatUsername] = useState('')
  const [createError, setCreateError] = useState('')

  useEffect(() => {
    if (chats.length === 0) {
      fetchChats()
    }
  }, [chats.length, fetchChats])

  useEffect(() => {
    if (storeError) {
      setCreateError(storeError)
    }
  }, [storeError])

  const handleLogout = async () => {
    await logout()
  }

  const handleOpenChat = (chat) => {
    selectChat(chat.id)
    navigation.navigate('Chat', { chatId: chat.id })
  }

  const handleCreateChat = async () => {
    const username = newChatUsername.trim()
    if (!username || isCreatingChat) return

    setCreateError('')
    const { ok, chatId } = await createChat({ username })
    if (ok) {
      setModalOpen(false)
      setNewChatUsername('')
      if (chatId) {
        selectChat(chatId)
        navigation.navigate('Chat', { chatId })
      }
    } else {
      setCreateError(useChatStore.getState().error)
    }
  }

  const handleCreateGroup = async ({ name, members }) => {
    const { ok, chatId } = await createGroupChat({ name, members })
    if (ok && chatId) {
      selectChat(chatId)
      navigation.navigate('Chat', { chatId })
      return { ok: true }
    }
    return { ok: false }
  }

  const filteredChats = chats.filter((chat) => {
    if (!search.trim()) return true
    const name = getChatName(chat, user?.id).toLowerCase()
    return name.includes(search.trim().toLowerCase())
  })

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>A</Text>
          </View>
          <Text style={styles.brandTitle}>Antigram</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.settingsBtn} onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.settingsText}>&#9881;</Text>
          </Pressable>
          <Pressable style={styles.plusButton} onPress={() => setModalOpen(true)}>
            <Text style={styles.plusText}>+</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.userRow}>
        <Pressable style={styles.avatar} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.avatarText}>{getInitials(user?.username || 'A')}</Text>
        </Pressable>
        <Pressable style={styles.usernamePressable} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.username}>{user?.username || 'Foydalanuvchi'}</Text>
        </Pressable>
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Chiqish</Text>
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Chatlarni qidirish"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isLoadingChats ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : filteredChats.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.hint}>
            {search ? 'Hech narsa topilmadi' : "Chatlar hozircha yo'q"}
          </Text>
          <Pressable style={styles.groupBtn} onPress={() => setGroupModalOpen(true)}>
            <Text style={styles.groupBtnText}>+ Yangi guruh yaratish</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          ListFooterComponent={
            <Pressable style={styles.groupListBtn} onPress={() => setGroupModalOpen(true)}>
              <View style={styles.groupListIcon}>
                <Text style={styles.groupListIconText}>+</Text>
              </View>
              <Text style={styles.groupListText}>Yangi guruh yaratish</Text>
            </Pressable>
          }
          renderItem={({ item }) => {
            const isGroup = item.isGroup
            const name = getChatName(item, user?.id)
            const isLastOwn = item.lastMessage?.sender?.id === user?.id
            const lastMessage = item.lastMessage?.text
              ? item.lastMessage.text
              : item.lastMessage?.type && item.lastMessage.type !== 'text'
                ? "Fayl"
                : ''

            return (
              <Pressable style={styles.chatItem} onPress={() => handleOpenChat(item)}>
                <View style={[styles.chatAvatar, isGroup && styles.chatAvatarGroup]}>
                  <Text style={styles.chatAvatarText}>{getInitials(name)}</Text>
                </View>
                <View style={styles.chatInfo}>
                  <View style={styles.chatTop}>
                    <Text style={styles.chatName} numberOfLines={1}>
                      {name}
                    </Text>
                    <View style={styles.chatTopRight}>
                      {unreadCounts[item.id] > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadText}>{unreadCounts[item.id]}</Text>
                        </View>
                      )}
                      <Text style={styles.chatTime}>
                        {formatChatTime(item.lastMessage?.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.chatPreview,
                      unreadCounts[item.id] > 0 && styles.chatPreviewUnread,
                    ]}
                    numberOfLines={1}
                  >
                    {`${isLastOwn ? 'Siz: ' : ''}${lastMessage || "Xabar yo'q"}`}
                  </Text>
                  {isGroup && item.members?.length > 0 && (
                    <Text style={styles.chatMeta} numberOfLines={1}>
                      {getMembersNames(item, user?.id)}
                    </Text>
                  )}
                </View>
              </Pressable>
            )
          }}
        />
      )}

      <Modal
        visible={modalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yangi chat</Text>
              <Pressable onPress={() => setModalOpen(false)}>
                <Text style={styles.modalClose}>&times;</Text>
              </Pressable>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Foydalanuvchi nomi"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoFocus
              value={newChatUsername}
              onChangeText={setNewChatUsername}
            />
            {createError && <Text style={styles.error}>{createError}</Text>}
            <Pressable
              style={[styles.button, isCreatingChat && styles.buttonDisabled]}
              onPress={handleCreateChat}
              disabled={isCreatingChat}
            >
              <Text style={styles.buttonText}>
                {isCreatingChat ? 'Yaratilmoqda...' : 'Chatni boshlash'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <GroupChatModal
        visible={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        onCreate={handleCreateGroup}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sidebar },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  brandTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingsBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(51,144,236,0.15)' },
  settingsText: { color: colors.accent, fontSize: 18 },
  plusButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(51,144,236,0.15)' },
  plusText: { color: colors.accent, fontSize: 26, lineHeight: 30 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  usernamePressable: { flex: 1 },
  username: { color: colors.text, fontWeight: '600' },
  logoutBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: 'rgba(239,83,80,0.12)' },
  logoutText: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 8 },
  search: { backgroundColor: colors.inputBg, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, color: colors.text, fontSize: 15 },
  input: { backgroundColor: colors.inputBg, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, color: colors.text, fontSize: 15 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 16 },
  hint: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
  chatItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10, marginHorizontal: 8, borderRadius: 10 },
  chatAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  chatAvatarGroup: { backgroundColor: '#4caf50', borderRadius: 14 },
  chatAvatarText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  chatInfo: { flex: 1 },
  chatTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  chatTopRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chatName: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '600' },
  chatTime: { color: colors.textMuted, fontSize: 12 },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  chatPreview: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  chatPreviewUnread: { color: colors.text, fontWeight: '600' },
  chatMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  groupBtn: { backgroundColor: 'rgba(51,144,236,0.15)', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center' },
  groupBtnText: { color: colors.accent, fontSize: 14, fontWeight: '600' },
  groupListBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10, marginHorizontal: 8, borderRadius: 10 },
  groupListIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(51,144,236,0.15)', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  groupListIconText: { color: colors.accent, fontSize: 22 },
  groupListText: { color: colors.accent, fontSize: 15, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modal: { width: '100%', maxWidth: 380, backgroundColor: colors.sidebar, borderRadius: 14, padding: 20, gap: 14 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  modalClose: { color: colors.textSecondary, fontSize: 22 },
  error: { color: colors.danger, fontSize: 13 },
  button: { backgroundColor: colors.accent, borderRadius: 8, paddingVertical: 13, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
})