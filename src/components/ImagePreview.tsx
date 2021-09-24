import React from 'react'
import { View, Modal, StyleSheet, Dimensions } from 'react-native'
import ImageViewer from 'react-native-image-zoom-viewer'
import { IImageInfo } from 'react-native-image-zoom-viewer/built/image-viewer.type'
import { ActivityIndicator } from '@fruits-chain/react-native'
import imgs from '../images'

const screenHeight = Dimensions.get('screen').height

interface IProps {
  visible: boolean
  onVisibleChange: (visible: boolean) => void
  photos: IImageInfo[]
  index: number
}
const ImagePreview: React.FC<IProps> = ({ visible, photos, onVisibleChange, index }) => {
  const handleClose = () => {
    onVisibleChange(false)
  }
  return (
    <Modal visible={visible} transparent={true} statusBarTranslucent>
      <View style={styles.modalView}>
        <ImageViewer
          imageUrls={photos}
          enableImageZoom
          onClick={handleClose}
          index={index}
          failImageSource={imgs.IconFailed}
          loadingRender={() => <ActivityIndicator color="#fff" />}
        />
      </View>
    </Modal>
  )
}

export default ImagePreview

const styles = StyleSheet.create({
  modalView: {
    height: screenHeight,
  },
})
