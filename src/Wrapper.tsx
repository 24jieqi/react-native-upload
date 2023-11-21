import type { PropsWithChildren } from 'react'
import React from 'react'
import type { Insets, StyleProp, ViewStyle } from 'react-native'
import { TouchableOpacity } from 'react-native'

import type { UploadProps } from './_internal'
import UploadInternal from './_internal'
import useUploadTypeSelect from './hooks/useUploadTypeSelect'

interface UploadWrapperProps
  extends Omit<UploadProps, 'useCamera' | 'onPressAdd' | 'showUi'> {
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
  const { uploadInstance, handlePressAdd } = useUploadTypeSelect(
    props.pickerType,
    props.cropPickerMediaType,
  )
  return (
    <TouchableOpacity
      hitSlop={hitSlop}
      activeOpacity={activeOpacity}
      style={wrapperStyle}
      onPress={() => handlePressAdd()}>
      {children}
      <UploadInternal {...props} showUi={false} ref={uploadInstance} />
    </TouchableOpacity>
  )
}

export default UploadWrapper
