import type { FC } from 'react'
import React from 'react'

import type { UploadProps, UploadActionParams, UploadAction } from './_internal'
import UploadInternal from './_internal'
import type { ImageInfo } from './components/take-picture/interface'
import openPictureVisionPicker from './components/take-picture/open'
import useUploadTypeSelect from './hooks/useUploadTypeSelect'
import type { UploadItem, FileVO, IUploadTempSource } from './interface'
import UploadPreview from './Prev'
import type { WatermarkOperations } from './utils'
import { formatUploadList } from './utils'
import type { CacheDirStat } from './utils/caches'
import { clearCache, cacheDirStat } from './utils/caches'
import { UPLOAD_CACHE_DIR } from './utils/helper'
import UploadWrapper from './Wrapper'

export interface ISource extends UploadItem {}
interface IUpload extends FC<Omit<UploadProps, 'useCamera' | 'onPressAdd'>> {
  Preview: typeof UploadPreview
  Wrapper: typeof UploadWrapper
}

const Upload: IUpload = props => {
  const { uploadInstance, handlePressAdd } = useUploadTypeSelect(
    props.pickerType,
    props.cropPickerMediaType,
  )
  return (
    <UploadInternal
      {...props}
      ref={uploadInstance}
      onPressAdd={handlePressAdd}
    />
  )
}

Upload.Preview = UploadPreview
Upload.Wrapper = UploadWrapper
Upload.displayName = 'Upload'

export type {
  UploadItem,
  FileVO,
  UploadActionParams,
  UploadAction,
  IUploadTempSource,
  ImageInfo,
  CacheDirStat,
  WatermarkOperations,
}
export {
  formatUploadList,
  openPictureVisionPicker,
  UPLOAD_CACHE_DIR,
  clearCache,
  cacheDirStat,
}

export default Upload
