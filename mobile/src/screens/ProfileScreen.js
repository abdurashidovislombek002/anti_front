import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { colors } from '../theme'
import { useAuthStore } from '../store/useAuthStore'
import { getInitials } from '../utils/format'

export default function ProfileScreen({ navigation }) {
  const user = useAuthStore((state) => state.user)
  const updateProfile = useAuthStore((state) => state.updateProfile)
  const updateAvatar = useAuthStore((state) => state.updateAvatar)
  const isUpdatingProfile = useAuthStore((state) => state.isUpdatingProfile)
  const error = useAuthStore((state) => state.error)
  const success = useAuthStore((state) => state.success)
  const clearMessages = useAuthStore((state) => state.clearMessages)

  const [username, setUsername] = useState(user?.username || '')
  const [phone, setPhone] = useState(user?.phone || '')

  useEffect(() => {
    setUsername(user?.username || '')
    setPhone(user?.phone || '')
  }, [user])

  useEffect(() => {
    if (!error && !success) return undefined
    const timer = setTimeout(clearMessages, 4000)
    return () => clearTimeout(timer)
  }, [error, success, clearMessages])

  const handleSave = async () => {
    if (!username.trim()) return
    const { ok } = await updateProfile({ username: username.trim(), phone: phone.trim() })
    if (ok) navigation.goBack()
  }

  const handlePickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      useAuthStore.setState({ error: 'Rasmga kirish ruxsati berilmadi' })
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    })
    if (result.canceled || result.assets?.length === 0) return
    const asset = result.assets[0]
    const formData = new FormData()
    formData.append('avatar', {
      uri: asset.uri,
      name: `avatar_${Date.now()}.jpg`,
      type: 'image/jpeg',
    })
    await updateAvatar(formData)
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>&#8592;</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable style={styles.avatarWrap} onPress={handlePickAvatar}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{getInitials(user?.username)}</Text>
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              <Text style={styles.avatarEditText}>+</Text>
            </View>
          </Pressable>
          <Text style={styles.avatarHint}>Rasmni yangilash uchun bosing</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholder="Username"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Telefon</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Telefon raqami"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {error && <Text style={styles.error}>{error}</Text>}
          {success && <Text style={styles.success}>{success}</Text>}

          <Pressable
            style={[styles.saveBtn, isUpdatingProfile && styles.btnDisabled]}
            onPress={handleSave}
            disabled={isUpdatingProfile}
          >
            {isUpdatingProfile ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Saqlash</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
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
  content: { padding: 24, alignItems: 'stretch', gap: 18 },
  avatarWrap: { alignSelf: 'center', width: 96, height: 96, borderRadius: 48 },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: '700' },
  avatarEditBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    borderWidth: 3,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  avatarHint: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: -8 },
  field: { gap: 6 },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    backgroundColor: 'rgba(239,83,80,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,83,80,0.35)',
    borderRadius: 8,
    padding: 10,
  },
  success: {
    color: '#4caf50',
    fontSize: 13,
    backgroundColor: 'rgba(76,175,80,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.35)',
    borderRadius: 8,
    padding: 10,
  },
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
})