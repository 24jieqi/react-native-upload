import { ActionSheet } from '@fruits-chain/react-native-xiaoshu'
import { Action } from '@fruits-chain/react-native-xiaoshu/lib/typescript/action-sheet/interface'
import { useMemo, useRef } from 'react'
import { MediaType, MediaSelectorType } from '../interface'
import { UploadInstance } from '../_internal'

interface ExtendedAction extends Action {
  onPress?: () => void
}

function getMediaSelectorType(mediaType: MediaType): MediaSelectorType[] {
  if (!mediaType || mediaType === 'any') {
    return ['video', 'photo', 'document']
  }
  return mediaType
}

const useUploadTypeSelect = (mediaType: MediaType) => {
  const uploadInstance = useRef<UploadInstance>()
  const actions = useMemo(() => {
    // 相册选择
    const albumAction: ExtendedAction = {
      name: '相册选择',
      onPress() {
        uploadInstance.current.open({
          useCamera: false,
        })
      },
    }
    // 选择文档、拍照、拍摄视频
    const selectorActionMap: {
      [key in MediaSelectorType]: ExtendedAction
    } = {
      document: {
        name: '选择文件',
        onPress() {
          uploadInstance.current.openDocument()
        },
      },
      photo: {
        name: '拍摄照片',
        onPress() {
          uploadInstance.current.open({
            useCamera: true,
            multiple: false,
          })
        },
      },
      video: {
        name: '拍摄视频',
        onPress() {
          uploadInstance.current.open({
            useCamera: true,
            multiple: false,
            mediaType: 'video',
          })
        },
      },
    }
    const selectorTypeList = getMediaSelectorType(mediaType)
    const result: ExtendedAction[] = []
    // 把对应类型的选项加入进来
    for (const selectorType of selectorTypeList) {
      result.push(selectorActionMap[selectorType])
    }
    // 如果是图片/视频类型，则把相册选择加入
    if (selectorTypeList.includes('photo') || selectorTypeList.includes('video')) {
      result.push(albumAction)
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
