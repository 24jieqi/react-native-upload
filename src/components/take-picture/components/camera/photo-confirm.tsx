import { Button, Flex, Popup } from '@fruits-chain/react-native-xiaoshu'
import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { ImageInfo } from '../../interface'
import { BUTTON_HEIGHT, TITLE_HEIGHT } from '../../interface'
import ImageViewCom from '../image-view'

interface PhotoConfirmProps {
  img: ImageInfo
  visible: boolean
  onSubmit: (img: ImageInfo) => void
  onCancel: () => void
}

const PhotoConfirm: React.FC<PhotoConfirmProps> = ({
  img,
  visible,
  onSubmit,
  onCancel,
}) => {
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
        <ImageViewCom imageList={[img]} index={0} />
        <View />
      </View>
      <View style={[styles.button, { height: BUTTON_HEIGHT }]}>
        <Flex justify="between">
          {/* @ts-ignore */}
          <Button type="hazy" style={styles.btn} onPress={onCancel}>
            重拍
          </Button>
          {/* @ts-ignore */}
          <Button
            type="primary"
            style={[styles.btn, styles.confirmBtn]}
            onPress={() => onSubmit(img)}>
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
  button: {
    marginVertical: 16,
    paddingHorizontal: 14,
    backgroundColor: '#000',
  },
  btn: {
    borderRadius: 50,
    flex: 1,
  },
  confirmBtn: {
    marginLeft: 12,
  },
})

export default PhotoConfirm
