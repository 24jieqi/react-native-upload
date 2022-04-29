import { Selector } from '@fruits-chain/react-native-xiaoshu'
import React, { useMemo, useRef } from 'react'
import { Insets, StyleProp, TouchableOpacity, ViewStyle } from 'react-native'
import UploadInternal, { UploadInstance, UploadProps } from './_internal'

interface UploadWrapperProps extends Omit<UploadProps, 'useCamera' | 'onPressAdd' | 'showUi'> {
  wrapperStyle?: StyleProp<ViewStyle>
  hitSlop?: Insets
  activeOpacity?: number
}

const UploadWrapper: React.FC<UploadWrapperProps> = ({
  children,
  wrapperStyle = {},
  hitSlop,
  activeOpacity = 0.2,
  ...props
}) => {
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
  return (
    <TouchableOpacity hitSlop={hitSlop} activeOpacity={activeOpacity} style={wrapperStyle} onPress={handlePressAdd}>
      {children}
      <UploadInternal {...props} showUi={false} ref={upload} />
    </TouchableOpacity>
  )
}

export default UploadWrapper
