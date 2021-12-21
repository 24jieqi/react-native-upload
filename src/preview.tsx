import { Flex } from '@fruits-chain/react-native'
import React, { useState } from 'react'
import { Dimensions, Image, TouchableOpacity, StyleSheet, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import ImagePreview from './components/ImagePreview'
import VideoPreview from './components/VideoPreview'
import { getThumbnailImageUrl } from './utils'

export interface FileVO {
  /** 文件ID */
  fileId?: string

  /** 文件上传时间 */
  fileUploadTime?: string

  /** 文件地址 */
  fileUrl?: string

  /** 文件名称 */
  filename?: string
}

interface IUploadPreview {
  list: FileVO[]
}
// 除去边距后每行显示四个元素
const itemWidth = (Dimensions.get('screen').width - 56) / 4

const UploadPreview: React.FC<IUploadPreview> = ({ list = [] }) => {
  const [showImagePreview, setShowImagePreview] = useState(false) // 图片预览与否
  const [currImageIndex, setCurrImageIndex] = useState(0) // 当前预览图片的索引
  const [showVideoPreview, setShowVideoPreview] = useState(false) // 视频预览与否
  const [videoUrl, setVideoUrl] = useState('') // 当前预览图片的url
  function handlePreview(file: FileVO) {
    const isVideo = file.fileUrl && file.fileUrl.includes('.mp4')
    // 图片类型所在的文本
    const imgIndex = list
      .filter((source) => !source.fileUrl.includes('.mp4'))
      .findIndex((one) => one.fileId === file.fileId)
    if (isVideo) {
      setVideoUrl(file.fileUrl)
      setShowVideoPreview(true)
    } else {
      setCurrImageIndex(imgIndex)
      setShowImagePreview(true)
    }
  }
  const imageUrls = list
    .filter((source) => !source.fileUrl.includes('.mp4'))
    .map((item) => ({ url: item.fileUrl, id: item.fileId }))
  return (
    <>
      <Flex wrap="wrap">
        {list.map((file, index) => {
          const isVideo = file.fileUrl && file.fileUrl.includes('.mp4')
          return (
            <View style={[styles.itemMargin, index % 4 === 3 ? { marginRight: 0 } : null]} key={index}>
              <TouchableOpacity onPress={() => handlePreview(file)}>
                <FastImage
                  source={{ uri: getThumbnailImageUrl(file.fileUrl), priority: FastImage.priority.high }}
                  style={styles.item as any}
                />
                {isVideo ? (
                  <Flex justify="center" align="center" style={styles.playIconWrapper}>
                    <Image source={require('./images/icon_play.png')} />
                  </Flex>
                ) : null}
              </TouchableOpacity>
            </View>
          )
        })}
      </Flex>
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

const styles = StyleSheet.create({
  itemMargin: {
    marginRight: 8,
    marginBottom: 8,
  },
  item: {
    width: itemWidth,
    height: itemWidth,
    borderRadius: 5,
    backgroundColor: '#F7F7F7',
  },
  playIconWrapper: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 5,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
})

export default UploadPreview
