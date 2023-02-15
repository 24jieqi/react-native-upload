import React, { useState } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import Video from 'react-native-video'

interface VideoPreviewProps {
  uri: string
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ uri }) => {
  const [loading, setLoading] = useState(false)
  return (
    <View style={styles.container}>
      <Video
        controls
        style={{ flex: 1 }}
        resizeMode="contain"
        playWhenInactive
        source={{
          uri,
        }}
        onLoadStart={() => setLoading(true)}
        onLoad={() => setLoading(false)}
      />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#fff" />
        </View>
      ) : null}
    </View>
  )
}

export default VideoPreview

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
    backgroundColor: '#000',
  },
  loadingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
})
