import { ActionSheet } from '@fruits-chain/react-native-xiaoshu'
import { Action } from '@fruits-chain/react-native-xiaoshu/lib/typescript/action-sheet/interface'
import { isType } from '@fruits-chain/utils'
import { useMemo, useRef } from 'react'
import { CropMediaType, PickerType } from '../interface'
import { UploadInstance } from '../_internal'

interface ExtendedAction extends Action {
  onPress?: () => void
}

const useUploadTypeSelect = (
  pickerType: PickerType | PickerType[] = ['cropCamera', 'cropPicker'],
  cropMediaType: CropMediaType = 'any',
) => {
  const uploadInstance = useRef<UploadInstance>()
  const actions = useMemo(() => {
    // 选择文档、拍照、拍摄视频
    const selectorActionMap: {
      [key in PickerType]: ExtendedAction
    } = {
      cropPicker: {
        name: '相册选择',
        onPress() {
          uploadInstance.current.open({
            pickerType: 'cropPicker',
            cropMediaType,
          })
        },
      },
      documentPicker: {
        name: '选择文件',
        onPress() {
          uploadInstance.current.open({
            pickerType: 'documentPicker',
          })
        },
      },
      cropCamera: {
        name: '相机拍摄',
        onPress() {
          uploadInstance.current.open({
            pickerType: 'cropCamera',
            cropMediaType,
            multiple: false,
          })
        },
      },
      visionCamera: {
        name: '照片拍摄',
        onPress() {
          uploadInstance.current.open({
            pickerType: 'visionCamera',
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
