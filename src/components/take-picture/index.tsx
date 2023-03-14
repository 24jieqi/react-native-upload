import { Dialog, Popup } from '@fruits-chain/react-native-xiaoshu'
import { PortalHost } from '@gorhom/portal'
import type { ReactNode } from 'react'
import React, { useEffect, useRef, useState } from 'react'
import type { StatusBarProps } from 'react-native'
import {
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native'

import CameraCom from './components/camera'
import Header from './components/header'
import PhotoView from './components/photo-view'
import type { ImageInfo } from './interface'

export interface TakePictureProps {
  existCount?: number
  maxCount?: number
  title?: string | ReactNode
  onSubmit?: (imageInfo: ImageInfo[]) => void
}

const TakePicture: React.FC<TakePictureProps> = ({
  onSubmit,
  title,
  maxCount,
  existCount,
}) => {
  const [visible, setVisible] = useState<boolean>(true)

  const [photoList, setPhotoList] = useState<ImageInfo[]>([])

  const [state, setState] = useState<'picture' | 'photograph'>('photograph')

  const stackPropsRef = useRef<StatusBarProps>()

  const handleSubmit = () => {
    onSubmit(photoList)
    handleCancel()
  }

  const handleClose = () => {
    if (photoList.length > 0) {
      Dialog.confirm({
        title: `将删除已拍摄的${photoList.length}张图片`,
        confirmButtonColor: '#f92f2f',
        confirmButtonText: '删除',
      }).then(action => {
        if (action === 'confirm') {
          handleCancel()
          onSubmit([])
        }
      })
    } else {
      handleCancel()
      onSubmit([])
    }
  }

  const handleCameraSubmit = (photo: ImageInfo) => {
    setPhotoList(value => {
      return [...value, photo]
    })
  }

  const handleCancel = () => {
    StatusBar.popStackEntry(stackPropsRef.current)
    setPhotoList([])
    setVisible(false)
  }

  useEffect(() => {
    stackPropsRef.current = StatusBar.pushStackEntry({
      barStyle: 'light-content',
      translucent: true,
    })
    Platform.OS === 'android' && StatusBar.setBackgroundColor('transparent')
  }, [])

  return (
    <Popup.Page visible={visible} safeAreaInsetTop={0} style={styles.page}>
      <Header title={title} onClose={handleClose} onSubmit={handleSubmit} />

      <View style={styles.content}>
        {state === 'photograph' ? (
          <CameraCom
            onPhotoSubmit={handleCameraSubmit}
            maxCount={maxCount}
            existCount={existCount}
            count={photoList?.length}
          />
        ) : (
          <PhotoView photoList={photoList} onChange={setPhotoList} />
        )}
      </View>

      <View style={styles.bottom}>
        <View style={styles.tabWrap}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setState('picture')}>
            <View
              style={[
                styles.tabItem,
                state === 'picture' ? styles.activeTab : null,
              ]}>
              <Text
                style={[
                  styles.tabText,
                  state === 'picture' ? styles.activeText : null,
                ]}>
                已拍照片
              </Text>
              <View style={styles.tabCount}>
                <Text style={styles.tabCountText}>{photoList.length}</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setState('photograph')}>
            <View
              style={[
                styles.tabItem,
                state === 'photograph' ? styles.activeTab : null,
              ]}>
              <Text
                style={[
                  styles.tabText,
                  state === 'photograph' ? styles.activeText : null,
                ]}>
                拍照
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View>
          {state === 'photograph' ? (
            <PortalHost name="capture-button" />
          ) : (
            <PortalHost name="photo-view" />
          )}
        </View>
      </View>
    </Popup.Page>
  )
}

export default TakePicture

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#000',
  },

  content: {
    flex: 1,
  },

  tabWrap: {
    borderRadius: 21,
    width: 200,
    height: 42,
    borderColor: '#fff',
    borderWidth: 1,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  bottom: {
    marginTop: 16,
    alignItems: 'center',
    height: 180,
    backgroundColor: '#000',
  },
  activeTab: {
    backgroundColor: '#fff',
  },
  activeText: {
    color: '#000',
  },
  tabItem: {
    borderRadius: 20,
    height: 40,
    paddingHorizontal: 6,
    textAlign: 'center',
    minWidth: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 36,
  },
  tabCount: {
    backgroundColor: '#0065fe',
    paddingHorizontal: 7,
    height: 16,
    lineHeight: 16,
    borderRadius: 16,
    color: '#fff',
  },
  tabCountText: {
    color: '#fff',
    fontSize: 12,
  },
})
