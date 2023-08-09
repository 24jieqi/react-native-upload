import { Dialog, Toast } from '@fruits-chain/react-native-xiaoshu'
import type { ToastMethods } from '@fruits-chain/react-native-xiaoshu/lib/typescript/toast/interface'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import type { ViewProps } from 'react-native'
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import Reanimated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated'
import type { Camera, PhotoFile, TakePhotoOptions, TakeSnapshotOptions } from 'react-native-vision-camera'
import { WatermarkOperations, printWatermark } from '../../../../utils'

/**
 * 拍照按钮，动态变化小尺寸
 */
const CAPTURE_BUTTON_SIZE = 72

/**
 * 拍照按钮，动态变化大尺寸
 */
const CAPTURE_BUTTON_BG_SIZE = 88

let toastKey: ToastMethods

interface Props extends ViewProps {
  camera: React.RefObject<Camera>
  onMediaCaptured: (media: PhotoFile) => void

  minZoom: number
  maxZoom: number
  cameraZoom: Reanimated.SharedValue<number>

  flash: 'off' | 'on'
  enabled: boolean
  // 当前拍照数量
  count: number

  // 最大允许拍照数量
  maxCount: number

  // 外部已存在照片数量
  existCount: number

  /**
   * 图片水印相关配置
   */
  watermark?: WatermarkOperations
}

const _CaptureButton: React.FC<Props> = ({
  camera,
  onMediaCaptured,
  flash,
  enabled,
  style,
  count,
  maxCount,
  existCount,
  watermark,
  ...props
}): React.ReactElement => {
  const [loading, setLoading] = useState<boolean>(false)
  const takePhotoOptions = useMemo<TakePhotoOptions & TakeSnapshotOptions>(
    () => ({
      qualityPrioritization: 'speed',
      flash: flash,
      quality: 90,
      skipMetadata: true,
    }),
    [flash],
  )
  const isPressingButton = useSharedValue(false)

  const takePhoto = useCallback(async () => {
    try {
      toastKey = Toast.loading({
        message: '拍摄中...',
        duration: 0,
      })
      if (camera.current === null) throw new Error('Camera ref is null!')
      let photo: PhotoFile

      // 当环境为安卓时，启用安卓的快速拍照
      if (Platform.OS === 'ios') {
        photo = await camera.current.takePhoto(takePhotoOptions)
      } else {
        photo = await camera.current.takeSnapshot(takePhotoOptions)
      }
      // 在此加上水印
      photo.path = await printWatermark(photo.path, watermark, { width: photo.width, height: photo.height })
      onMediaCaptured(photo)
    } catch (e) {
      setTimeout(() => {
        toastKey.setMessage('拍摄失败')
      }, 0)
    } finally {
      setTimeout(() => {
        toastKey?.close()
      }, 200)
      enableTakePhoto()
    }
  }, [camera, onMediaCaptured, takePhotoOptions])

  const handlePress = async () => {
    if (loading) return
    // 先进行数量判断，再禁用按钮
    if (maxCount - existCount <= count) {
      Dialog({
        title: `${existCount > 0 ? `已上传${existCount}个图片或视频，` : ''} 最多拍${maxCount - existCount}张`,
      }).then(() => {})
      return
    }
    disableTakePhoto()
    isPressingButton.value = true
    try {
      await takePhoto()
    } finally {
      isPressingButton.value = false
      enableTakePhoto()
    }
    enableTakePhoto()
  }

  const buttonStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          scale: withSpring(isPressingButton.value ? 0.9 : 1, {
            mass: 0.5,
            damping: 60,
            stiffness: 1000,
          }),
        },
      ],
    }),
    [isPressingButton],
  )

  const enableTakePhoto = () => {
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }

  const disableTakePhoto = () => {
    setLoading(true)
  }

  useEffect(() => {
    return () => {
      toastKey?.close()
    }
  }, [])

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1} disabled={!enabled || loading}>
      <Reanimated.View {...props} style={style}>
        <Reanimated.View style={styles.flex}>
          <View style={styles.shadow} />
          <Reanimated.View style={[styles.button, buttonStyle]} />
        </Reanimated.View>
      </Reanimated.View>
    </TouchableOpacity>
  )
}

export default _CaptureButton

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  shadow: {
    position: 'absolute',
    width: CAPTURE_BUTTON_BG_SIZE,
    height: CAPTURE_BUTTON_BG_SIZE,
    borderRadius: CAPTURE_BUTTON_BG_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  button: {
    width: CAPTURE_BUTTON_SIZE,
    height: CAPTURE_BUTTON_SIZE,
    borderRadius: CAPTURE_BUTTON_SIZE / 2,
    backgroundColor: '#fff',
    margin: 8,
  },
})
