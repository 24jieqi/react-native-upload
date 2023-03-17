import { Flex } from '@fruits-chain/react-native-xiaoshu'
import type { ReactNode } from 'react'
import React from 'react'
import { Image, Platform, Text, TouchableNativeFeedback, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import styles from './styles'
interface IProps {
  title?: string | ReactNode
  onClose: () => void
  onSubmit: () => void
}

const Header: React.FC<IProps> = ({ title, onClose, onSubmit }) => {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.container, { marginTop: Platform.OS === 'ios' ? insets.top : insets.top + 16 }]}>
      <Flex justify="between" align="center">
        <TouchableNativeFeedback onPress={onClose}>
          <Image style={styles.closeBtn} source={require('../../images/close.png')} />
        </TouchableNativeFeedback>
        <View style={styles.titleWrap}>
          <Text style={styles.title} ellipsizeMode="tail" numberOfLines={1}>
            {title}
          </Text>
        </View>

        <TouchableNativeFeedback onPress={onSubmit}>
          <View style={styles.btn}>
            <Text style={styles.btnText}>完成</Text>
          </View>
        </TouchableNativeFeedback>
      </Flex>
    </View>
  )
}

export default Header
