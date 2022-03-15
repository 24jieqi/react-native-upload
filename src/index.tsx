import React, { useMemo, useRef, FC } from 'react'
import { Selector } from '@fruits-chain/react-native-xiaoshu'
import UploadInternal, { UploadInstance, UploadProps, formatUploadList } from './_internal'
import UploadPreview from './Preview'
import { UploadItem, FileVO } from './interface'

export interface ISource extends UploadItem {}
interface IUpload extends FC<Omit<UploadProps, 'useCamera' | 'onPressAdd'>> {
  Preview: typeof UploadPreview
}

const Upload: IUpload = (props) => {
  const upload = useRef<UploadInstance>(null)
  const options = useMemo(() => {
    const result = [
      {
        label: '拍摄照片',
        value: 'photo',
      },
      {
        label: '相册选择',
        value: 'album',
      },
    ]
    if (props.mediaType !== 'photo') {
      result.push({
        label: '拍摄视频',
        value: 'video',
      })
    }
    return result
  }, [props.mediaType])
  function handlePressAdd() {
    Selector({
      title: '选择',
      options,
    }).then((type) => {
      switch (type) {
        case 'album':
          upload.current.open({
            useCamera: false,
          })
          break
        case 'photo':
          upload.current.open({
            useCamera: true,
            multiple: false,
          })
          break
        case 'video':
          upload.current.open({
            useCamera: true,
            multiple: false,
            mediaType: 'video',
          })
      }
    })
  }
  return <UploadInternal {...props} ref={upload} onPressAdd={handlePressAdd} />
}

Upload.Preview = UploadPreview
Upload.displayName = 'Upload'

export type { UploadItem, FileVO }
export { formatUploadList }

export default Upload
