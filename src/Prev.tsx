import { Uploader } from '@fruits-chain/react-native-xiaoshu'
import React, { useRef } from 'react'
import { formatUploadList } from './utils'
import Preview, { CustomPreview, PreviewInstance } from './components/Preview'
import { FileVO, UploadItem } from './interface'
import { UploadProps } from './_internal'

interface IUploadPreview extends Pick<UploadProps, 'imagesPerRow'> {
  list: FileVO[]
  /**
   * 自定义预览实现 key: 文件名后缀 value:自定义预览组件
   */
  customPreview?: CustomPreview
}

const UploadPreview: React.FC<IUploadPreview> = ({ list = [], customPreview, imagesPerRow = 4 }) => {
  const previewRef = useRef<PreviewInstance>()
  function handlePreview(file: UploadItem) {
    previewRef.current.preview(file)
  }
  return (
    <>
      <Uploader
        colCount={imagesPerRow}
        onPressImage={handlePreview}
        showUpload={false}
        deletable={false}
        list={formatUploadList(list)}
      />
      <Preview customPreview={customPreview} ref={previewRef} />
    </>
  )
}

export default UploadPreview
