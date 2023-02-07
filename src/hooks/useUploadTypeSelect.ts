import { ActionSheet } from '@fruits-chain/react-native-xiaoshu'
import { Action } from '@fruits-chain/react-native-xiaoshu/lib/typescript/action-sheet/interface'
import { useMemo, useRef } from 'react'
import { MediaType } from '../interface'
import { UploadInstance } from '../_internal'

interface ExtendedAction extends Action {
  onPress?: () => void
}

const useUploadTypeSelect = (mediaType: MediaType) => {
  const uploadInstance = useRef<UploadInstance>()
  const actions = useMemo(() => {
    let result: ExtendedAction[] = [
      {
        name: '拍摄照片',
        onPress() {
          uploadInstance.current.open({
            useCamera: true,
            multiple: false,
          })
        },
      },
      {
        name: '相册选择',
        onPress() {
          uploadInstance.current.open({
            useCamera: false,
          })
        },
      },
      {
        name: '拍摄视频',
        onPress() {
          uploadInstance.current.open({
            useCamera: true,
            multiple: false,
            mediaType: 'video',
          })
        },
      },
      {
        name: '选择文件',
        onPress() {
          uploadInstance.current.openDocument()
        },
      },
    ]
    switch (mediaType) {
      case 'photo':
        result = result.slice(0, 2)
        break
      case 'video':
        result = result.slice(1, 3)
      case 'document':
        result = result.slice(-1)
      default:
        break
    }
    return result
  }, [mediaType])
  function handlePressAdd() {
    ActionSheet({
      cancelText: '取消',
      actions,
    })
      .then(({ item }: { item: ExtendedAction }) => {
        item.onPress?.()
      })
      .catch(() => {})
  }
  return {
    uploadInstance,
    handlePressAdd,
  }
}

export default useUploadTypeSelect
