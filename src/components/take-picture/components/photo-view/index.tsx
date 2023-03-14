import { Portal } from '@gorhom/portal'
import cloneDeep from 'lodash/cloneDeep'
import React, { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
// eslint-disable-next-line import/no-named-as-default
import ImageViewer from 'react-native-image-zoom-viewer'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { defaultPhoto, iconFailed, imgClose } from '../../images'
import type { ImageInfo } from '../../interface'
import { BUTTON_HEIGHT, TITLE_HEIGHT } from '../../interface'

interface PhotoViewProps {
  photoList: ImageInfo[]
  onChange: (photoList: ImageInfo[]) => void
}

const PhotoView: React.FC<PhotoViewProps> = ({ photoList, onChange }) => {
  const insets = useSafeAreaInsets()
  const [currentIndex, setCurrentIndex] = useState<number>(0)

  const handlePhotoClick = (index: number) => {
    setCurrentIndex(index)
  }

  const handlePhotoDelete = (index: number) => {
    let tempPhotoList = cloneDeep(photoList)
    tempPhotoList.splice(index, 1)
    onChange(tempPhotoList)
  }

  const imgHeight = useMemo(() => {
    return (
      Dimensions.get('screen').height -
      insets.top -
      TITLE_HEIGHT -
      BUTTON_HEIGHT -
      (Platform.OS === 'ios' ? 0 : 16)
    )
  }, [insets.top])

  const photos = useMemo(() => {
    const width = Dimensions.get('screen').width
    return photoList.map(ele => ({
      url: `file://${ele.path}`,
      id: ele.path,
      width: width,
      height: imgHeight,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoList, imgHeight])

  useEffect(() => {
    if (currentIndex > photoList.length) {
      setCurrentIndex(photoList.length)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoList])

  const EmptyImage = () => {
    return (
      <View style={[styles.imageView, styles.defaultWrap]}>
        <Image source={defaultPhoto} style={styles.defaultImg} />
        <Text style={styles.defaultText}>暂无照片</Text>
      </View>
    )
  }
  return (
    <View>
      {photoList.length > 0 ? (
        <View style={styles.imageView}>
          <ImageViewer
            imageUrls={photos}
            onChange={setCurrentIndex}
            renderImage={props => {
              return (
                <View style={styles.content}>
                  <Image {...props} />
                </View>
              )
            }}
            enableImageZoom
            index={currentIndex}
            failImageSource={iconFailed}
            loadingRender={() => <ActivityIndicator color="#fff" />}
          />
        </View>
      ) : (
        EmptyImage()
      )}

      <Portal hostName="photo-view">
        <ScrollView horizontal contentContainerStyle={styles.wrap}>
          {photoList.map((ele, index) => {
            return (
              <TouchableOpacity
                activeOpacity={1}
                key={index}
                onPress={() => handlePhotoClick(index)}>
                <View
                  style={[
                    styles.imageWrap,
                    currentIndex === index ? styles.activeImageWrap : null,
                  ]}>
                  <Image
                    style={styles.img}
                    source={{ uri: `file://${ele?.path}` }}
                  />

                  <View style={styles.imgCloseWrap}>
                    <TouchableOpacity
                      activeOpacity={1}
                      hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
                      onPress={() => handlePhotoDelete(index)}>
                      <Image source={imgClose} style={styles.imgClose} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    marginLeft: 16,
    paddingRight: 16,
  },
  imageView: {
    height: '100%',
    width: '100%',
  },
  imageWrap: {
    position: 'relative',
    width: 84,
    height: 84,
    padding: 4,
    marginRight: 8,
    borderRadius: 4,
  },
  activeImageWrap: {
    backgroundColor: '#fff',
  },
  img: {
    width: 76,
    height: 76,
    borderRadius: 4,
  },
  imgCloseWrap: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  imgClose: {
    height: 16,
    width: 16,
  },
  content: {
    flex: 1,
    position: 'relative',
  },

  defaultWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2e2e2e',
  },
  defaultImg: {
    width: 150,
    height: 150,
  },
  defaultText: {
    color: '#e4e5e8',
    lineHeight: 21,
  },
})

export default PhotoView
