import React from 'react'
import { ActivityIndicator } from 'react-native'
import ImageViewer from 'react-native-image-zoom-viewer'
interface ImagePreviewProps {
  uri: string
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ uri }) => {
  return (
    <ImageViewer
      imageUrls={[{ url: uri }]}
      renderIndicator={() => null}
      enableImageZoom
      failImageSource={require('../images/icon_failed.png')}
      loadingRender={() => <ActivityIndicator color="#fff" />}
    />
  )
}

export default ImagePreview
