import React, { useState } from 'react'
import { Modal, TouchableOpacity, View, StyleSheet } from 'react-native'
import { ActivityIndicator } from '@fruits-chain/react-native'
import Video from 'react-native-video'

interface IProps {
  videoUrl: string
  show: boolean // 显示模态窗口
  setShow: (show: boolean) => void // 设置是否显示模态框
}

const VideoPreview: React.FC<IProps> = ({ show, setShow, videoUrl }) => {
  const [loading, setLoading] = useState(false)
  return (
    <Modal visible={show} transparent statusBarTranslucent>
      <TouchableOpacity style={styles.modalView} onPress={() => setShow(false)} activeOpacity={1}>
        <Video
          style={{ flex: 1 }}
          resizeMode="contain"
          playWhenInactive
          source={{
            uri: videoUrl,
          }}
          onLoadStart={() => setLoading(true)}
          onLoad={() => setLoading(false)}
        />
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#fff" />
          </View>
        ) : null}
      </TouchableOpacity>
    </Modal>
  )
}

export default VideoPreview

const styles = StyleSheet.create({
  modalView: {
    flex: 1,
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
