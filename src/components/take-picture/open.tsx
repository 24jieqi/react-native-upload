import { Portal } from '@fruits-chain/react-native-xiaoshu'
import React from 'react'

import type { ImageInfo } from './interface'

import type { TakePictureProps } from './index'
import TakePicture from './index'

export type OpenOptions = Omit<TakePictureProps, 'onSubmit'>

function openTakePicture(options: OpenOptions): Promise<ImageInfo[]> {
  return new Promise(resolve => {
    const id = Portal.add(
      <TakePicture
        {...options}
        onSubmit={photoList => {
          resolve(photoList)
          setTimeout(() => {
            Portal.remove(id)
          }, 1000)
        }}
      />,
    )
  })
}

export default openTakePicture
