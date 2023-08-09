import { Dialog, Popup } from '@fruits-chain/react-native-xiaoshu'
import { ReactNode } from 'react'
import React, { useEffect, useRef, useState } from 'react'
import type { StatusBarProps } from 'react-native'
import { Platform, StatusBar, StyleSheet } from 'react-native'

import CameraCom from './components/camera'
import Header from './components/header'
import PhotoView from './components/photo-view'
import type { ImageInfo } from './interface'
import { WatermarkOperations } from '../../utils'
import { StateContext, StateType } from './context/state-context'

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
   * 关闭事件
   * @returns
   */
  onClosed?: (photoList: ImageInfo[]) => void
  /**
   * 图片水印相关配置
   */
  watermark?: WatermarkOperations
}

const TakePictureView: React.FC<TakePictureViewProps> = ({ title, maxCount, existCount, onClosed, watermark }) => {
  const [visible, setVisible] = useState<boolean>(false)

  const [photoList, setPhotoList] = useState<ImageInfo[]>([])

  const [state, setState] = useState<StateType>('photograph')

  const stackPropsRef = useRef<StatusBarProps>()
  /**
   * 确定按钮事件
   */
  const handleConfirm = () => {
    handleCancel(false)
  }
  /**
   * 关闭按钮事件
   */
  const handleClose = async () => {
    if (photoList.length > 0) {
      const action = await Dialog.confirm({
        title: `将删除已拍摄的${photoList.length}张图片`,
        confirmButtonColor: '#f92f2f',
        confirmButtonText: '删除',
      })
      if (action === 'confirm') {
        // 重设StatusBar 清空photoList 关闭UI
        handleCancel()
      }
    } else {
      handleCancel(false)
    }
  }
  const onPhotoSubmit = (photo: ImageInfo) => {
    setPhotoList((value) => {
      return [...value, photo]
    })
  }

  const handleCancel = (clear = true) => {
    StatusBar.popStackEntry(stackPropsRef.current)
    setVisible(false)
    if (clear) {
      setPhotoList([])
    }
  }

  useEffect(() => {
    stackPropsRef.current = StatusBar.pushStackEntry({
      barStyle: 'light-content',
      translucent: true,
    })
    Platform.OS === 'android' && StatusBar.setBackgroundColor('transparent')
  }, [])

  useEffect(() => {
    setVisible(true)
  }, [])
  return (
    <Popup.Page visible={visible} safeAreaInsetTop={0} style={styles.page} onClosed={() => onClosed(photoList)}>
      <Header title={title} onClose={handleClose} onSubmit={handleConfirm} />

      <StateContext.Provider value={{ state, setState }}>
        {state === 'photograph' ? (
          <CameraCom
            onPhotoSubmit={onPhotoSubmit}
            maxCount={maxCount}
            existCount={existCount}
            count={photoList?.length}
            watermark={watermark}
          />
        ) : (
          <PhotoView photoList={photoList} onChange={setPhotoList} />
        )}
      </StateContext.Provider>
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
