import React, { FC } from 'react'
import UploadInternal, { UploadProps, UploadActionParams, UploadAction } from './_internal'
import UploadPreview from './Prev'
import UploadWrapper from './Wrapper'
import { UploadItem, FileVO, IUploadTempSource } from './interface'
import useUploadTypeSelect from './hooks/useUploadTypeSelect'
import { formatUploadList } from './utils'
import openPictureVisionPicker from './components/take-picture/open'
import { ImageInfo } from './components/take-picture/interface'

export interface ISource extends UploadItem {}
interface IUpload extends FC<Omit<UploadProps, 'useCamera' | 'onPressAdd'>> {
  Preview: typeof UploadPreview
  Wrapper: typeof UploadWrapper
}

const Upload: IUpload = (props) => {
  const { uploadInstance, handlePressAdd } = useUploadTypeSelect(props.mediaType)
  return <UploadInternal {...props} ref={uploadInstance} onPressAdd={handlePressAdd} />
}

Upload.Preview = UploadPreview
Upload.Wrapper = UploadWrapper
Upload.displayName = 'Upload'

export type { UploadItem, FileVO, UploadActionParams, UploadAction, IUploadTempSource, ImageInfo }
export { formatUploadList, openPictureVisionPicker }

export default Upload
