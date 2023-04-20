import cloneDeep from 'lodash/cloneDeep'
import React, { useEffect, useState } from 'react'
import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import type { ImageInfo } from '../../interface'
import TabBar from '../tab-bar'
import ImageViewCom from '../image-view'

interface PhotoViewProps {
  photoList: ImageInfo[]
  onChange: (photoList: ImageInfo[]) => void
}

const PhotoView: React.FC<PhotoViewProps> = ({ photoList, onChange }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0)

  const handlePhotoClick = (index: number) => {
    setCurrentIndex(index)
  }

  const handlePhotoDelete = (index: number) => {
    let tempPhotoList = cloneDeep(photoList)
    tempPhotoList.splice(index, 1)
    onChange(tempPhotoList)
  }

  useEffect(() => {
    const maxIndex = photoList.length - 1
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoList])

  const EmptyImage = () => {
    return (
      <View style={[styles.imageView, styles.defaultWrap]}>
        <Image source={require('../../images/default_photo.png')} style={styles.defaultImg} />
        <Text style={styles.defaultText}>暂无照片</Text>
      </View>
    )
  }
  const handleChangeView = (index: number) => {
    setTimeout(() => {
      setCurrentIndex(index)
    }, 200)
  }
  return (
    <View style={styles.container}>
      {photoList.length > 0 ? (
        <View style={styles.imageView}>
          <ImageViewCom onChange={handleChangeView} index={currentIndex} imageList={photoList} />
        </View>
      ) : (
        EmptyImage()
      )}

      <View style={styles.bottom}>
        <TabBar count={photoList?.length} state="picture" />

        <ScrollView horizontal contentContainerStyle={styles.wrap}>
          {photoList.map((ele, index) => {
            return (
              <TouchableOpacity activeOpacity={1} key={index} onPress={() => handlePhotoClick(index)}>
                <View style={[styles.imageWrap, currentIndex === index ? styles.activeImageWrap : null]}>
                  <Image style={styles.img} source={{ uri: `file://${ele?.path}` }} />
                  <View style={styles.imgCloseWrap}>
                    <TouchableOpacity
                      activeOpacity={1}
                      hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
                      onPress={() => handlePhotoDelete(index)}>
                      <Image source={require('../../images/img_close.png')} style={styles.imgClose} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
  },
  wrap: {
    marginLeft: 16,
    paddingRight: 16,
  },
  imageView: {
    flex: 1,
  },
  bottom: {
    marginTop: 16,
    alignItems: 'center',
    height: 180,
    backgroundColor: '#000',
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
