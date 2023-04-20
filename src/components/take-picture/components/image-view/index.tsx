import React, { useMemo } from 'react'
import { View, StyleSheet, Dimensions, Platform, ActivityIndicator, Image } from 'react-native'
import ImageViewer from 'react-native-image-zoom-viewer'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BUTTON_HEIGHT, ImageInfo, TITLE_HEIGHT } from '../../interface'

interface IProps {
  imageList: ImageInfo[]
  onChange?: (index: number) => void
  index: number
}

const ImageViewCom: React.FC<IProps> = ({ imageList, onChange, index }) => {
  const insets = useSafeAreaInsets()

  const imgHeight = useMemo(() => {
    return (
      Dimensions.get('screen').height - insets.top - TITLE_HEIGHT - BUTTON_HEIGHT - (Platform.OS === 'ios' ? 0 : 16)
    )
  }, [insets.top])

  const photos = useMemo(() => {
    const width = Dimensions.get('screen').width
    return imageList.map((ele) => ({
      url: `file://${ele.path}`,
      id: ele.path,
      width: width,
      height: imgHeight,
    }))
  }, [imageList, imgHeight])

  return (
    <ImageViewer
      imageUrls={photos}
      onChange={onChange}
      renderImage={(props) => {
        return (
          <View style={styles.content}>
            <Image resizeMode="contain" {...props} />
          </View>
        )
      }}
      enableImageZoom
      index={index}
      failImageSource={require('../../images/icon_failed.png')}
      loadingRender={() => <ActivityIndicator color="#fff" />}
    />
  )
}

export default ImageViewCom

const styles = StyleSheet.create({
  content: {
    flex: 1,
    position: 'relative',
  },
})
