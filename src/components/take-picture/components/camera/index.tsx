import { Dialog } from '@fruits-chain/react-native-xiaoshu'
import { Portal } from '@gorhom/portal'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Image, Linking, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import type { PinchGestureHandlerGestureEvent } from 'react-native-gesture-handler'
import { PinchGestureHandler } from 'react-native-gesture-handler'
import Reanimated, {
  Extrapolate,
  interpolate,
  useAnimatedGestureHandler,
  useAnimatedProps,
  useSharedValue,
} from 'react-native-reanimated'
import { Camera, frameRateIncluded, sortFormats, useCameraDevices } from 'react-native-vision-camera'
import type { CameraDeviceFormat, PhotoFile } from 'react-native-vision-camera'

import { useIsForeground } from '../../hooks/useIsForeground'
import type { ImageInfo } from '../../interface'

import CaptureButton from './capture-button'
import PhotoConfirm from './photo-confirm'
import styles from './styles'

const SCALE_FULL_ZOOM = 3
export const MAX_ZOOM_FACTOR = 20

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera)
Reanimated.addWhitelistedNativeProps({
  zoom: true,
})

interface CameraComProps {
  count: number
  maxCount: number
  existCount?: number
  onPhotoSubmit: (img: ImageInfo) => void
}

const CameraCom: React.FC<CameraComProps> = ({ onPhotoSubmit, count, maxCount, existCount }) => {
  const [isCameraInitialized, setIsCameraInitialized] = useState(false)
  const camera = useRef<Camera>(null)
  const [visible, setVisible] = useState<boolean>(false)
  const [flash, setFlash] = useState<'off' | 'on'>('off')

  const [currentPhoto, setCurrentPhoto] = useState<ImageInfo>()

  const initRef = useRef<boolean>(false)

  const zoom = useSharedValue(Platform.OS === 'ios' ? 1.5 : 1)

  // const isFocussed = useIsFocused()
  const isForeground = useIsForeground()

  const isActive = isForeground
  const devices = useCameraDevices()

  const device = devices?.back
  const supportsFlash = device?.hasFlash ?? false

  const minZoom = device?.minZoom ?? 1
  const maxZoom = Math.min(device?.maxZoom ?? 1, MAX_ZOOM_FACTOR)

  const onInitialized = useCallback(() => {
    setIsCameraInitialized(true)
  }, [])

  const onPinchGesture = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent, { startZoom?: number }>({
    onStart: (_, context) => {
      context.startZoom = zoom.value
    },
    onActive: (event, context) => {
      // we're trying to map the scale gesture to a linear zoom here
      const startZoom = context.startZoom ?? 0
      const scale = interpolate(
        event.scale,
        [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM],
        [-1, 0, 1],
        Extrapolate.CLAMP,
      )
      zoom.value = interpolate(scale, [-1, 0, 1], [minZoom, startZoom, maxZoom], Extrapolate.CLAMP)
    },
  })

  const onError = useCallback(() => {
    if (!initRef.current) {
      initRef.current = true
      Dialog({
        title: `相机权限未开启`,
        message: '请到设置中开启权限，允许星桥货柜访问您的摄像头和麦克风',
      }).then(async (action) => {
        if (action === 'confirm') {
          const permission = await Camera.requestCameraPermission()
          if (permission === 'denied') await Linking.openSettings()
        }
      })
    }
  }, [])
  const formats = useMemo<CameraDeviceFormat[]>(() => {
    if (!device?.formats) return []
    return device?.formats.sort(sortFormats)
  }, [device?.formats])

  const fps = useMemo(() => {
    const supports60Fps = formats?.some((f) => f.frameRateRanges.some((r) => frameRateIncluded(r, 60)))
    if (!supports60Fps) {
      return 30
    }
    return 60
  }, [formats])

  const onFlashPressed = useCallback(() => {
    setFlash((f) => (f === 'off' ? 'on' : 'off'))
  }, [])

  const cameraAnimatedProps = useAnimatedProps(() => {
    const z = Math.max(Math.min(zoom.value, maxZoom), minZoom)
    return {
      zoom: z,
    }
  }, [maxZoom, minZoom, zoom])

  const format = useMemo(() => {
    let result = formats

    return result.find((f) => f.frameRateRanges.some((r) => frameRateIncluded(r, fps)))
  }, [formats, fps])

  function onPhotoConfirm(photo: ImageInfo) {
    onPhotoSubmit(photo)
    setVisible(false)
  }

  const onMediaCaptured = useCallback(async (photo: PhotoFile) => {
    const reg = /(jpg|png|jpeg)/i
    const mime = `image/${photo.path.match(reg)[0]}`
    const info = {
      path: photo.path,
      mime,
    }
    setCurrentPhoto(info)
    setVisible(true)
  }, [])

  return (
    <View style={styles.container}>
      {device && (
        <PinchGestureHandler onGestureEvent={onPinchGesture} enabled={isActive}>
          <Reanimated.View style={styles.captureContent}>
            <ReanimatedCamera
              ref={camera}
              style={StyleSheet.absoluteFill}
              device={device}
              format={format}
              fps={fps}
              lowLightBoost={device?.supportsLowLightBoost}
              isActive={isActive}
              onInitialized={onInitialized}
              onError={onError}
              enableZoomGesture
              animatedProps={cameraAnimatedProps}
              photo
              orientation="portrait"
              frameProcessorFps={1}
            />
            <View style={styles.rightButton}>
              {supportsFlash ? (
                <TouchableOpacity activeOpacity={0.5} onPress={onFlashPressed}>
                  {flash === 'on' ? (
                    <Image style={styles.flashLightIcon} source={require('../../images/light.png')} />
                  ) : (
                    <Image style={styles.flashLightIcon} source={require('../../images/light_close.png')} />
                  )}
                </TouchableOpacity>
              ) : null}
            </View>
          </Reanimated.View>
        </PinchGestureHandler>
      )}

      <PhotoConfirm img={currentPhoto} visible={visible} onCancel={() => setVisible(false)} onSubmit={onPhotoConfirm} />

      <Portal hostName="capture-button">
        <CaptureButton
          camera={camera}
          onMediaCaptured={onMediaCaptured}
          cameraZoom={zoom}
          minZoom={minZoom}
          maxZoom={maxZoom}
          flash={supportsFlash ? flash : 'off'}
          enabled={isCameraInitialized && isActive}
          count={count}
          maxCount={maxCount}
          existCount={existCount}
        />
      </Portal>
    </View>
  )
}

export default CameraCom
