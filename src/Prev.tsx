import { Uploader } from '@fruits-chain/react-native-xiaoshu'
import React, { useRef } from 'react'

import type { UploadProps } from './_internal'
import type {
  CustomPreview,
  PreviewInstance,
} from './components/preview/Preview'
import Preview from './components/preview/Preview'
import type { FileVO, UploadItem } from './interface'
import { formatUploadList } from './utils'

interface IUploadPreview extends Pick<UploadProps, 'imagesPerRow'> {
  list: FileVO[]
  /**
   * 自定义预览实现 key: 文件名后缀 value:自定义预览组件
   */
  customPreview?: CustomPreview
}

const UploadPreview: React.FC<IUploadPreview> = ({
  list = [],
  customPreview,
  imagesPerRow = 4,
}) => {
  const previewRef = useRef<PreviewInstance>()
  function handlePreview(file: UploadItem) {
    previewRef.current.preview(file)
  }
  const fileList = formatUploadList(list)
  return (
    <>
      <Uploader
        colCount={imagesPerRow}
        onPressImage={handlePreview}
        showUpload={false}
        deletable={false}
        list={fileList}
      />
      <Preview list={fileList} customPreview={customPreview} ref={previewRef} />
    </>
  )
}

export default UploadPreview
