import React from 'react'
import { ActivityIndicator } from 'react-native'
import ImageViewer from 'react-native-image-zoom-viewer'
import { BasicPreviewProps } from './interface'
interface ImagePreviewProps extends BasicPreviewProps {}

const ImagePreview: React.FC<ImagePreviewProps> = ({ uri, onClose }) => {
  return (
    <ImageViewer
      onClick={onClose}
      imageUrls={[{ url: uri }]}
      renderIndicator={() => null}
      enableImageZoom
      failImageSource={require('../images/icon_failed.png')}
      loadingRender={() => <ActivityIndicator color="#fff" />}
    />
  )
}

export default ImagePreview
