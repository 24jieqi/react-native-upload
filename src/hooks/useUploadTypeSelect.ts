import { ActionSheet } from '@fruits-chain/react-native-xiaoshu'
import { useMemo, useRef } from 'react'
import { MediaType } from '../interface'
import { UploadInstance } from '../_internal'

const useUploadTypeSelect = (mediaType: MediaType) => {
  const uploadInstance = useRef<UploadInstance>()
  const actions: string[] = useMemo(() => {
    const result = ['拍摄照片', '相册选择']
    if (mediaType !== 'photo') {
      result.push('拍摄视频')
    }
    return result
  }, [mediaType])
  function handlePressAdd() {
    ActionSheet({
      cancelText: '取消',
      title: '选择',
      actions,
    })
      .then(({ index }) => {
        switch (index) {
          case 0:
            uploadInstance.current.open({
              useCamera: true,
              multiple: false,
            })
            break
          case 1:
            uploadInstance.current.open({
              useCamera: false,
            })
          case 2:
            uploadInstance.current.open({
              useCamera: true,
              multiple: false,
              mediaType: 'video',
            })
          default:
            break
        }
      })
      .catch(() => {})
  }
  return {
    uploadInstance,
    handlePressAdd,
  }
}

export default useUploadTypeSelect
