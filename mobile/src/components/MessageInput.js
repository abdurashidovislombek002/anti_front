import { useRef, useState } from 'react'
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { colors } from '../theme'
import { getSocket, SOCKET_EVENTS } from '../socket/socket'
import { useAuthStore } from '../store/useAuthStore'
import { useChatStore } from '../store/useChatStore'

export default function MessageInput({ chatId, onSend }) {
  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [attachment, setAttachment] = useState(null)
  const [isAttaching, setIsAttaching] = useState(false)
  const typingTimer = useRef(null)
  const user = useAuthStore((state) => state.user)
  const sendMedia = useChatStore((state) => state.sendMedia)

  const emitTyping = (isTyping) => {
    const socket = getSocket()
    if (!socket) return
    socket.emit(SOCKET_EVENTS.TYPING, {
      chatId,
      username: user?.username,
      isTyping,
    })
  }

  const handleChange = (value) => {
    setText(value)

    const socket = getSocket()
    if (!socket) return

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

  const stopTyping = () => {
    if (typingTimer.current) clearTimeout(typingTimer.current)
    emitTyping(false)
    typingTimer.current = null
  }

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      useChatStore.setState({ error: 'Rasmga kirish ruxsati berilmadi' })
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: 0.7,
    })
    if (result.canceled || result.assets?.length === 0) return
    const asset = result.assets[0]
    setAttachment({
      type: 'image',
      uri: asset.uri,
      fileName: asset.fileName || `image_${Date.now()}.jpg`,
      mimeType: asset.mimeType || 'image/jpeg',
      text: '',
    })
  }

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/zip', 'text/csv'],
      })
      if (result.canceled || result.assets?.length === 0) return
      const asset = result.assets[0]
      setAttachment({
        type: 'file',
        uri: asset.uri,
        fileName: asset.name || `file_${Date.now()}`,
        mimeType: asset.mimeType || 'application/octet-stream',
        text: '',
      })
    } catch {
      useChatStore.setState({ error: 'Fayl tanlanmadi' })
    }
  }

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      useChatStore.setState({ error: "Kameraga kirish ruxsati berilmadi" })
      return
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    })
    if (result.canceled || result.assets?.length === 0) return
    const asset = result.assets[0]
    setAttachment({
      type: 'image',
      uri: asset.uri,
      fileName: asset.fileName || `photo_${Date.now()}.jpg`,
      mimeType: asset.mimeType || 'image/jpeg',
      text: '',
    })
  }

  const handleSubmit = async () => {
    if (isSending) return

    if (attachment) {
      setIsAttaching(true)
      setAttachment((att) => {
        att.text = text
        return att
      })
      const payload = { ...attachment, text }
      const { ok } = await sendMedia(chatId, payload)
      setIsAttaching(false)
      if (ok) {
        setText('')
        setAttachment(null)
      }
      return
    }

    if (!text.trim()) return

    setIsSending(true)
    stopTyping()

    const { ok } = await onSend(text)
    if (ok) {
      setText('')
    }
    setIsSending(false)
  }

  const hasAttachment = Boolean(attachment)

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {hasAttachment && (
        <View style={styles.attachmentBanner}>
          {attachment.type === 'image' ? (
            <Image source={{ uri: attachment.uri }} style={styles.attachmentPreview} />
          ) : (
            <View style={styles.fileIcon}>
              <Text style={styles.fileIconText}>F</Text>
            </View>
          )}
          <Text style={styles.attachmentName} numberOfLines={1}>
            {attachment.fileName}
          </Text>
          <Pressable style={styles.removeAttachment} onPress={() => setAttachment(null)}>
            <Text style={styles.removeAttachmentText}>&times;</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.container}>
        <View style={styles.attachMenu}>
          <Pressable style={styles.attachBtn} onPress={takePhoto}>
            <Text style={styles.attachIcon}>&#127916;</Text>
          </Pressable>
          <Pressable style={styles.attachBtn} onPress={pickImage}>
            <Text style={styles.attachIcon}>&#128444;</Text>
          </Pressable>
          <Pressable style={styles.attachBtn} onPress={pickDocument}>
            <Text style={styles.attachIcon}>&#128196;</Text>
          </Pressable>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Xabar yozing..."
          placeholderTextColor={colors.textMuted}
          multiline
          value={text}
          onChangeText={handleChange}
        />
        <Pressable
          style={[styles.sendButton, (!text.trim() && !hasAttachment) && styles.sendDisabled]}
          onPress={handleSubmit}
          disabled={(!text.trim() && !hasAttachment) || isSending || isAttaching}
        >
          {isSending || isAttaching ? (
            <Text style={styles.sendText}>...</Text>
          ) : (
            <View style={styles.sendIcon}>
              <View style={styles.sendArrow} />
            </View>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.sidebar,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  attachMenu: {
    flexDirection: 'column',
    gap: 6,
    alignItems: 'center',
  },
  attachBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachIcon: { fontSize: 16, color: colors.textSecondary },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    borderRadius: 12,
    backgroundColor: colors.inputBg,
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 11,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.5,
  },
  sendText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sendIcon: {
    width: 18,
    height: 18,
    overflow: 'hidden',
  },
  sendArrow: {
    width: 18,
    height: 18,
    backgroundColor: '#fff',
    transform: [{ rotate: '225deg' }, { scaleY: 0.5 }],
    borderRadius: 3,
  },
  attachmentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.inputBg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  attachmentPreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.bgDeep,
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileIconText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  attachmentName: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  removeAttachment: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.sidebar,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeAttachmentText: {
    color: colors.danger,
    fontSize: 22,
    lineHeight: 24,
  },
})