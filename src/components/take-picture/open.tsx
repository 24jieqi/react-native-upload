import { Portal } from '@fruits-chain/react-native-xiaoshu'
import React from 'react'

import type { ImageInfo } from './interface'

import type { TakePictureViewProps } from './index'
import TakePictureView from './index'

export type OpenOptions = Omit<TakePictureViewProps, 'onSubmit'>

/**
 * 打开特定拍照UI（多张拍照、照片管理）
 * @param options
 * @returns
 */
function openPictureVisionPicker(options: OpenOptions): Promise<ImageInfo[]> {
  return new Promise((resolve) => {
    const id = Portal.add(
      <TakePictureView
        {...options}
        onSubmit={(photoList) => {
          resolve(photoList)
        }}
        onClosed={() => {
          Portal.remove(id)
        }}
      />,
    )
  })
}

export default openPictureVisionPicker
