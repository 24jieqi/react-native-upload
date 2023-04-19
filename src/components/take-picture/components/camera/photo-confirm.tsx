import { Button, Flex, Popup } from '@fruits-chain/react-native-xiaoshu'
import React from 'react'
import { Image, View, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { ImageInfo } from '../../interface'
import { BUTTON_HEIGHT, TITLE_HEIGHT } from '../../interface'

interface PhotoConfirmProps {
  img: ImageInfo
  visible: boolean
  onSubmit: (img: ImageInfo) => void
  onCancel: () => void
}

const PhotoConfirm: React.FC<PhotoConfirmProps> = ({ img, visible, onSubmit, onCancel }) => {
  const insets = useSafeAreaInsets()
  return (
    <Popup.Page visible={visible} safeAreaInsetTop={0} style={styles.container}>
      <View
        style={[
          styles.content,
          {
            marginTop: insets.top + TITLE_HEIGHT,
          },
        ]}>
        <Image source={{ uri: `file://${img?.path}` }} style={styles.img} />
        <View />
      </View>
      <View style={[styles.button, { height: BUTTON_HEIGHT }]}>
        <Flex justify="between">
          {/* @ts-ignore */}
          <Button type="hazy" style={styles.btn} onPress={onCancel}>
            重拍
          </Button>
          {/* @ts-ignore */}
          <Button type="primary" style={[styles.btn, { marginLeft: 12 }]} onPress={() => onSubmit(img)}>
            确定
          </Button>
        </Flex>
      </View>
    </Popup.Page>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  button: {
    marginVertical: 16,
    paddingHorizontal: 14,
    backgroundColor: '#000',
  },
  btn: {
    borderRadius: 50,
    flex: 1,
  },
})

export default PhotoConfirm
