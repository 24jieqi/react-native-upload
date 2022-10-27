import { ActionSheet } from '@fruits-chain/react-native-xiaoshu'
import { Action } from '@fruits-chain/react-native-xiaoshu/lib/typescript/action-sheet/interface'
import { useMemo, useRef } from 'react'
import { MediaType } from '../interface'
import { UploadInstance } from '../_internal'

const useUploadTypeSelect = (mediaType: MediaType) => {
  const uploadInstance = useRef<UploadInstance>()
  const actions = useMemo(() => {
    const result: Action[] = [
      {
        name: '拍摄照片',
        callback() {
          uploadInstance.current.open({
            useCamera: true,
            multiple: false,
          })
        },
      },
      {
        name: '相册选择',
        callback() {
          uploadInstance.current.open({
            useCamera: false,
          })
        },
      },
      {
        name: '拍摄视频',
        callback() {
          uploadInstance.current.open({
            useCamera: true,
            multiple: false,
            mediaType: 'video',
          })
        },
      },
    ]
    if (mediaType === 'photo') {
      result.splice(2, 1)
    }
    if (mediaType === 'video') {
      result.splice(0, 1)
    }
    return result
  }, [mediaType])
  function handlePressAdd() {
    ActionSheet({
      cancelText: '取消',
      actions,
    })
      .then(({ item }) => {
        item.callback?.()
      })
      .catch(() => {})
  }
  return {
    uploadInstance,
    handlePressAdd,
  }
}

export default useUploadTypeSelect
