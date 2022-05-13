import { Uploader } from '@fruits-chain/react-native-xiaoshu'
import React, { useState } from 'react'
import { formatUploadList } from '.'
import ImagePreview from './components/ImagePreview'
import VideoPreview from './components/VideoPreview'
import { FileVO, UploadItem } from './interface'

interface IUploadPreview {
  list: FileVO[]
}

const UploadPreview: React.FC<IUploadPreview> = ({ list = [] }) => {
  const [showImagePreview, setShowImagePreview] = useState(false) // 图片预览与否
  const [currImageIndex, setCurrImageIndex] = useState(0) // 当前预览图片的索引
  const [showVideoPreview, setShowVideoPreview] = useState(false) // 视频预览与否
  const [videoUrl, setVideoUrl] = useState('') // 当前预览图片的url
  function handlePreview(file: UploadItem, _: number, list: UploadItem[]) {
    const isVideo = file.filepath && file.filepath.includes('.mp4')
    if (isVideo) {
      setVideoUrl(file.filepath)
      setShowVideoPreview(true)
    } else {
      // 图片类型所在的文本
      const imgIndex = list
        .filter((source) => !source.filepath.includes('.mp4'))
        .findIndex((one) => one.key === file.key)
      setCurrImageIndex(imgIndex)
      setShowImagePreview(true)
    }
  }
  const imageUrls = list
    .filter((source) => !source.fileUrl.includes('.mp4'))
    .map((item) => ({ url: item.fileUrl, id: item.fileId }))
  return (
    <>
      <Uploader
        imageGap={12}
        onPressImage={handlePreview}
        showUpload={false}
        deletable={false}
        list={formatUploadList(list)}
      />
      <ImagePreview
        index={currImageIndex}
        visible={showImagePreview}
        onVisibleChange={(visible) => setShowImagePreview(visible)}
        photos={imageUrls}
      />
      <VideoPreview
        videoUrl={videoUrl}
        show={showVideoPreview}
        setShow={(show?: boolean) => setShowVideoPreview(show)}
      />
    </>
  )
}

export default UploadPreview
