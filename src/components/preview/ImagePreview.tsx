import React, { useMemo } from 'react'
import { ActivityIndicator } from 'react-native'
import ImageViewer from 'react-native-image-zoom-viewer'
import { BasicPreviewProps } from './interface'
import { URL } from 'react-native-url-polyfill'

interface ImagePreviewProps extends BasicPreviewProps {}

const ImagePreview: React.FC<ImagePreviewProps> = ({ target, onClose, list = [], onChangeCurrent }) => {
  const previewOptions = useMemo(() => {
    const imageList = list.filter((file) => {
      const pathName = new URL(file.previewPath).pathname
      return ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'].some((img) => pathName.endsWith(img))
    })

    const imageUrls = imageList.map((image) => ({ url: image.previewPath }))
    const index = imageList.findIndex((image) => image.key === target.key)
    return {
      imageList,
      imageUrls,
      index,
    }
  }, [list, target])
  function handleChangePreview(index: number) {
    const target = previewOptions.imageList[index]
    setTimeout(() => {
      onChangeCurrent(target)
    }, 200)
  }
  return (
    <ImageViewer
      index={previewOptions.index}
      onClick={onClose}
      onChange={handleChangePreview}
      imageUrls={previewOptions.imageUrls}
      enableImageZoom
      failImageSource={require('../../images/icon_failed.png')}
      loadingRender={() => <ActivityIndicator color="#fff" />}
    />
  )
}

export default ImagePreview
