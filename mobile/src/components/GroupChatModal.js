import { useState } from 'react'
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
import { colors } from '../theme'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore'
import { getInitials } from '../utils/format'

export default function GroupChatModal({ visible, onClose, onCreate }) {
  const user = useAuthStore((state) => state.user)
  const searchUsers = useChatStore((state) => state.searchUsers)
  const searchResults = useChatStore((state) => state.searchResults)
  const isSearchingUsers = useChatStore((state) => state.isSearchingUsers)
  const isCreatingChat = useChatStore((state) => state.isCreatingChat)
  const clearSearch = useChatStore((state) => state.clearSearch)

  const [groupName, setGroupName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [error, setError] = useState('')

  const handleSearch = (value) => {
    setSearchQuery(value)
    searchUsers(value)
  }

  const isSelected = (userId) => selectedUsers.some((u) => u.id === userId)

  const toggleUser = (item) => {
    setError('')
    if (isSelected(item.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== item.id))
    } else {
      setSelectedUsers([...selectedUsers, item])
    }
  }

  const handleCreate = async () => {
    if (!groupName.trim()) {
      setError("Guruh nomini kiriting")
      return
    }
    if (selectedUsers.length === 0) {
      setError("Kamida bitta a'zo qo'shing")
      return
    }

    const { ok } = await onCreate({
      name: groupName.trim(),
      members: selectedUsers.map((u) => u.username),
    })

    if (ok) {
      setGroupName('')
      setSearchQuery('')
      setSelectedUsers([])
      setError('')
      clearSearch()
      onClose()
    } else {
      const store = useChatStore.getState()
      setError(store.error || "Guruh yaratilmadi")
    }
  }

  const handleClose = () => {
    setGroupName('')
    setSearchQuery('')
    setSelectedUsers([])
    setError('')
    clearSearch()
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Yangi guruh</Text>
            <Pressable onPress={handleClose}>
              <Text style={styles.close}>&times;</Text>
            </Pressable>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Guruh nomi"
            placeholderTextColor={colors.textMuted}
            value={groupName}
            onChangeText={setGroupName}
          />

          <Text style={styles.label}>A'zolarni qo'shish</Text>
          <TextInput
            style={styles.input}
            placeholder="Username qidirish..."
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            value={searchQuery}
            onChangeText={handleSearch}
          />

          {selectedUsers.length > 0 && (
            <View style={styles.selectedWrap}>
              <Text style={styles.selectedText}>
                Tanlangan: {selectedUsers.map((u) => `@${u.username}`).join(', ')}
              </Text>
            </View>
          )}

          <View style={styles.results}>
            {isSearchingUsers ? (
              <ActivityIndicator color={colors.accent} style={styles.loading} />
            ) : searchQuery.trim() && searchResults.length === 0 ? (
              <Text style={styles.noResults}>Foydalanuvchi topilmadi</Text>
            ) : (
              <FlatList
                data={searchResults.filter((u) => u.id !== user?.id)}
                keyExtractor={(item, i) => item.id || String(i)}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const selected = isSelected(item.id)
                  return (
                    <Pressable style={styles.resultItem} onPress={() => toggleUser(item)}>
                      <View
                        style={[
                          styles.resultAvatar,
                          selected && styles.resultAvatarSelected,
                        ]}
                      >
                        <Text style={styles.avatarText}>{getInitials(item.username)}</Text>
                      </View>
                      <Text style={styles.resultName}>@{item.username}</Text>
                      <Text style={styles.check}>{selected ? '\u2713' : ''}</Text>
                    </Pressable>
                  )
                }}
              />
            )}
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            style={[styles.button, isCreatingChat && styles.buttonDisabled]}
            onPress={handleCreate}
            disabled={isCreatingChat}
          >
            {isCreatingChat ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Guruh yaratish</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
    backgroundColor: colors.sidebar,
    borderRadius: 14,
    padding: 20,
    gap: 12,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  close: { color: colors.textSecondary, fontSize: 26, lineHeight: 28 },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: colors.text,
    fontSize: 15,
  },
  selectedWrap: {
    backgroundColor: 'rgba(51,144,236,0.12)',
    borderRadius: 8,
    padding: 10,
  },
  selectedText: { color: colors.accent, fontSize: 13 },
  results: { maxHeight: 220, minHeight: 40 },
  loading: { marginTop: 12 },
  noResults: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 16 },
  resultItem: {
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
  resultAvatarSelected: { backgroundColor: colors.accent },
  avatarText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  resultName: { flex: 1, color: colors.text, fontSize: 14 },
  check: { color: colors.accent, fontSize: 18, fontWeight: '700', width: 22, textAlign: 'center' },
  error: { color: colors.danger, fontSize: 13 },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
})