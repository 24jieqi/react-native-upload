import React, { useMemo } from 'react'
import { ActivityIndicator } from 'react-native'
import ImageViewer from 'react-native-image-zoom-viewer'
import { BasicPreviewProps } from './interface'
import { URL } from 'react-native-url-polyfill'

interface ImagePreviewProps extends BasicPreviewProps {}

const ImagePreview: React.FC<ImagePreviewProps> = ({ uri, onClose, list = [] }) => {
  const previewOptions = useMemo(() => {
    const imageUrls = list
      .filter((file) => {
        const pathName = new URL(file.previewPath).pathname
        return ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'].some((img) => pathName.endsWith(img))
      })
      .map((image) => ({ url: image.previewPath }))
    const index = imageUrls.findIndex((image) => image.url === uri)
    return {
      imageUrls,
      index,
    }
  }, [list, uri])
  return (
    <ImageViewer
      index={previewOptions.index}
      onClick={onClose}
      imageUrls={previewOptions.imageUrls}
      enableImageZoom
      failImageSource={require('../images/icon_failed.png')}
      loadingRender={() => <ActivityIndicator color="#fff" />}
    />
  )
}

export default ImagePreview
