import { Flex } from '@fruits-chain/react-native-xiaoshu'
import React, { useContext } from 'react'
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native'

import { StateContext } from '../../context/state-context'

interface IProps {
  count: number
  state: 'picture' | 'photograph'
}

const TabBar: React.FC<IProps> = ({ count, state }) => {
  const { setState } = useContext(StateContext)
  return (
    <Flex style={styles.tabWrap} justify="between">
      <TouchableOpacity activeOpacity={1} onPress={() => setState('picture')}>
        <View
          style={[
            styles.tabItem,
            state === 'picture' ? styles.activeTab : null,
          ]}>
          <Text
            style={[
              styles.tabText,
              state === 'picture' ? styles.activeText : null,
            ]}>
            已拍照片
          </Text>
          <View style={styles.tabCount}>
            <Text style={styles.tabCountText}>{count}</Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setState('photograph')}>
        <View
          style={[
            styles.tabItem,
            state === 'photograph' ? styles.activeTab : null,
          ]}>
          <Text
            style={[
              styles.tabText,
              state === 'photograph' ? styles.activeText : null,
            ]}>
            拍照
          </Text>
        </View>
      </TouchableOpacity>
    </Flex>
  )
}
export default TabBar

const styles = StyleSheet.create({
  tabWrap: {
    width: 200,
    height: 40,
    borderRadius: 20,
    borderColor: '#fff',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 2,
  },

  activeTab: {
    backgroundColor: '#fff',
  },
  activeText: {
    color: '#000',
  },
  tabItem: {
    borderRadius: 17,
    height: 34,
    paddingHorizontal: 6,
    textAlign: 'center',
    minWidth: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  tabCount: {
    backgroundColor: '#0065fe',
    paddingHorizontal: 7,
    height: 16,
    lineHeight: 16,
    borderRadius: 16,
    color: '#fff',
  },
  tabCountText: {
    color: '#fff',
    fontSize: 12,
  },
})
