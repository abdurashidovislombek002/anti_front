import { Image, StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'
import { getInitials } from '../utils/format'

function MediaContent({ message, isOwn }) {
  if (message.type && message.type !== 'text') {
    const isImage = String(message.type).startsWith('image/') || message.type === 'image'

    if (isImage && message.mediaUrl) {
      return (
        <Image
          source={{ uri: message.mediaUrl }}
          style={styles.imageContent}
          resizeMode="cover"
        />
      )
    }

    if (message.mediaUrl) {
      return (
        <View style={[styles.fileCard, isOwn && styles.fileCardOwn]}>
          <View style={styles.fileIcon}>
            <Text style={styles.fileIconText}>F</Text>
          </View>
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>
              {message.fileName || 'Fayl'}
            </Text>
            {message.fileSize ? (
              <Text style={styles.fileSize}>
                {(message.fileSize / 1024).toFixed(1)} KB
              </Text>
            ) : null}
          </View>
        </View>
      )
    }
  }

  return null
}

export default function MessageBubble({ message, isOwn, showSender, senderName }) {
  const hasMedia = message.type && message.type !== 'text' && message.mediaUrl

  return (
    <View style={[styles.row, isOwn && styles.rowOwn]}>
      {!isOwn && (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarText}>{getInitials(senderName)}</Text>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isOwn ? styles.bubbleOwn : styles.bubbleOther,
          hasMedia && styles.bubbleMedia,
        ]}
      >
        {showSender && !isOwn && (
          <Text style={[styles.senderName, hasMedia && styles.senderOnMedia]}>{senderName}</Text>
        )}
        <MediaContent message={message} isOwn={isOwn} />
        {message.text ? <Text style={styles.text}>{message.text}</Text> : null}
        <Text style={[styles.time, isOwn && styles.timeOwn, hasMedia && styles.timeOnMedia]}>
          {message.time}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 6,
  },
  rowOwn: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholder: {
    marginBottom: 2,
  },
  avatarText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleOwn: {
    backgroundColor: colors.ownBubble,
    borderTopRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: colors.otherBubble,
    borderTopLeftRadius: 4,
  },
  bubbleMedia: {
    paddingHorizontal: 6,
    paddingTop: 6,
    overflow: 'hidden',
  },
  senderName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5eb5f7',
    marginBottom: 2,
  },
  senderOnMedia: {
    paddingHorizontal: 6,
    paddingTop: 2,
    marginBottom: 0,
  },
  text: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
  },
  imageContent: {
    width: 220,
    height: 180,
    borderRadius: 10,
    marginBottom: 4,
  },
  fileCard: {
    width: 220,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 4,
  },
  fileCardOwn: {
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileIconText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  fileInfo: { flex: 1 },
  fileName: { color: colors.text, fontSize: 14, fontWeight: '600' },
  fileSize: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  time: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    alignSelf: 'flex-end',
    marginTop: 3,
  },
  timeOwn: {
    color: 'rgba(255,255,255,0.55)',
  },
  timeOnMedia: {
    paddingHorizontal: 6,
    paddingBottom: 4,
  },
})