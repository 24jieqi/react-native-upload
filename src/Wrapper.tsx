import React, { PropsWithChildren } from 'react'
import { Insets, StyleProp, TouchableOpacity, ViewStyle } from 'react-native'
import useUploadTypeSelect from './hooks/useUploadTypeSelect'
import UploadInternal, { UploadProps } from './_internal'

interface UploadWrapperProps extends Omit<UploadProps, 'useCamera' | 'onPressAdd' | 'showUi'> {
  wrapperStyle?: StyleProp<ViewStyle>
  hitSlop?: Insets
  activeOpacity?: number
}

const UploadWrapper: React.FC<PropsWithChildren<UploadWrapperProps>> = ({
  children,
  wrapperStyle = {},
  hitSlop,
  activeOpacity = 0.2,
  ...props
}) => {
  const { uploadInstance, handlePressAdd } = useUploadTypeSelect(props.pickerType, props.cropMediaType)
  return (
    <TouchableOpacity hitSlop={hitSlop} activeOpacity={activeOpacity} style={wrapperStyle} onPress={handlePressAdd}>
      {children}
      <UploadInternal {...props} showUi={false} ref={uploadInstance} />
    </TouchableOpacity>
  )
}

export default UploadWrapper
