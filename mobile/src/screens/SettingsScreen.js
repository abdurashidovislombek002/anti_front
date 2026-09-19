import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../theme'
import { useAuthStore } from '../store/useAuthStore'

export default function SettingsScreen({ navigation }) {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [notifications, setNotifications] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)

  const handleLogout = async () => {
    await logout()
    navigation.popToTop()
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>&#8592;</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Sozlamalar</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hisob</Text>
          <Pressable
            style={styles.row}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.rowLabel}>Profil</Text>
            <Text style={styles.rowArrow}>&#8250;</Text>
          </Pressable>
          <Pressable style={styles.row} onPress={handleLogout}>
            <Text style={[styles.rowLabel, styles.dangerText]}>Chiqish</Text>
            <Text style={styles.rowArrow}>&#8250;</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bildirishnomalar</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Bildirishnomalar</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.inputBorder, true: colors.accent }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Ovoz</Text>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: colors.inputBorder, true: colors.accent }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ma'lumot</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Versiya</Text>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Foydalanuvchi</Text>
            <Text style={styles.rowValue}>@{user?.username || '-'}</Text>
          </View>
        </View>
      </ScrollView>
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
  content: { padding: 16, gap: 20 },
  section: {
    backgroundColor: colors.sidebar,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLabel: { color: colors.text, fontSize: 15 },
  rowValue: { color: colors.textSecondary, fontSize: 15 },
  rowArrow: { color: colors.textSecondary, fontSize: 22 },
  dangerText: { color: colors.danger },
})