import { Dialog, Flex, Popup } from '@fruits-chain/react-native-xiaoshu'
import { PortalHost } from '@gorhom/portal'
import type { ReactNode } from 'react'
import React, { useEffect, useRef, useState } from 'react'
import type { StatusBarProps } from 'react-native'
import { Platform, StatusBar, Text, TouchableOpacity, View, StyleSheet } from 'react-native'

import CameraCom from './components/camera'
import Header from './components/header'
import PhotoView from './components/photo-view'
import type { ImageInfo } from './interface'

export interface TakePictureViewProps {
  /**
   * 当前已存在资源数量
   */
  existCount?: number
  /**
   * 最大拍照数量
   */
  maxCount?: number
  /**
   * 自定义标题
   */
  title?: string | ReactNode
  /**
   * 提交事件
   * @param imageInfo
   * @returns
   */
  onSubmit?: (imageInfo: ImageInfo[]) => void
  /**
   * 关闭事件
   * @returns
   */
  onClosed?: () => void
}

const TakePictureView: React.FC<TakePictureViewProps> = ({ onSubmit, title, maxCount, existCount, onClosed }) => {
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
      }).then((action) => {
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
    setPhotoList((value) => {
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
    <Popup.Page visible={visible} safeAreaInsetTop={0} style={styles.page} onClosed={onClosed}>
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
        <Flex style={styles.tabWrap} justify="between">
          <TouchableOpacity activeOpacity={1} onPress={() => setState('picture')}>
            <View style={[styles.tabItem, state === 'picture' ? styles.activeTab : null]}>
              <Text style={[styles.tabText, state === 'picture' ? styles.activeText : null]}>已拍照片</Text>
              <View style={styles.tabCount}>
                <Text style={styles.tabCountText}>{photoList.length}</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={1} onPress={() => setState('photograph')}>
            <View style={[styles.tabItem, state === 'photograph' ? styles.activeTab : null]}>
              <Text style={[styles.tabText, state === 'photograph' ? styles.activeText : null]}>拍照</Text>
            </View>
          </TouchableOpacity>
        </Flex>
        <View>{state === 'photograph' ? <PortalHost name="capture-button" /> : <PortalHost name="photo-view" />}</View>
      </View>
    </Popup.Page>
  )
}

export default TakePictureView

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#000',
  },

  content: {
    flex: 1,
  },

  tabWrap: {
    width: 200,
    height: 40,
    borderRadius: 20,
    borderColor: '#fff',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 2,
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
    borderRadius: 17,
    height: 34,
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
    lineHeight: 22,
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
