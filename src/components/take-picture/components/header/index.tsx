import { Flex } from '@fruits-chain/react-native-xiaoshu'
import type { ReactNode } from 'react'
import React from 'react'
import { Image, Platform, Text, TouchableNativeFeedback, View, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#000',
  },
  titleWrap: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    color: '#fff',
    textAlign: 'center',
  },
  btn: {
    backgroundColor: '#0065fe',
    paddingHorizontal: 12,
    borderRadius: 50,
    height: 32,
  },
  btnText: {
    lineHeight: 31,
    fontSize: 16,
    color: '#fff',
  },
  closeBtn: {
    width: 32,
    height: 32,
  },
})
