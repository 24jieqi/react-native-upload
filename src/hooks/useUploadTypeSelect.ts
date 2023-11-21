import { ActionSheet } from '@fruits-chain/react-native-xiaoshu'
import type { Action } from '@fruits-chain/react-native-xiaoshu/lib/typescript/action-sheet/interface'
import { isType } from '@fruits-chain/utils'
import { useMemo, useRef } from 'react'

import type { UploadInstance } from '../_internal'
import type { CropMediaType, PickerType } from '../interface'

interface ExtendedAction extends Action {
  onPress?: (index?: number) => void
}

const useUploadTypeSelect = (
  pickerType: PickerType | PickerType[] = ['cropPicker', 'visionCamera'],
  cropPickerMediaType: CropMediaType = 'any',
) => {
  const uploadInstance = useRef<UploadInstance>()
  const actions = useMemo(() => {
    // 选择文档、拍照、拍摄视频
    const selectorActionMap: {
      [key in PickerType]: ExtendedAction
    } = {
      cropPicker: {
        name: '相册选择',
        onPress(index?: number) {
          uploadInstance.current.open({
            pickerType: 'cropPicker',
            cropMediaType: cropPickerMediaType,
            index,
          })
        },
      },
      documentPicker: {
        name: '文件选择',
        onPress(index?: number) {
          uploadInstance.current.open({
            pickerType: 'documentPicker',
            index,
          })
        },
      },
      cropCameraPhoto: {
        name: '系统相机拍摄',
        onPress(index?: number) {
          uploadInstance.current.open({
            pickerType: 'cropCameraPhoto',
            cropMediaType: 'photo',
            multiple: false,
            index,
          })
        },
      },
      cropCameraVideo: {
        name: '视频拍摄',
        onPress(index?: number) {
          uploadInstance.current.open({
            pickerType: 'cropCameraVideo',
            cropMediaType: 'video',
            multiple: false,
            index,
          })
        },
      },
      visionCamera: {
        name: '照片拍摄',
        onPress(index?: number) {
          uploadInstance.current.open({
            pickerType: 'visionCamera',
            index,
          })
        },
      },
    }
    const selectorTypeList = isType('String')(pickerType)
      ? [pickerType as PickerType]
      : [...(pickerType as PickerType[])]
    const result: ExtendedAction[] = []
    // 把对应类型的选项加入进来
    for (const selectorType of selectorTypeList) {
      result.push(selectorActionMap[selectorType])
    }
    return result
  }, [pickerType])
  function handlePressAdd(index?: number) {
    ActionSheet({
      cancelText: '取消',
      actions,
    })
      .then(({ item }: { item: ExtendedAction }) => {
        // tip: 因为Uploader会传出来event实例，这里做兼容性调整
        item.onPress?.(isType('Number')(index) ? index : undefined)
      })
      .catch(() => {})
  }
  return {
    uploadInstance,
    handlePressAdd,
  }
}

export default useUploadTypeSelect
