import React from 'react'
import { View, StyleSheet } from 'react-native'

interface IProps {
  direction?: 'row' | 'column'
  margin?: number
  color?: string
}

const Divider: React.FC<IProps> = ({ direction = 'row', margin = 0, color = '#F5F5F5' }) => {
  const marginStyle = direction === 'row' ? 'marginVertical' : 'marginHorizontal'
  return <View style={[styles[`divider-${direction}`], { [marginStyle]: margin }, { backgroundColor: color }]}></View>
}

const styles = StyleSheet.create({
  'divider-row': {
    width: '100%',
    height: 1,
  },
  'divider-column': {
    width: 1,
    height: '100%',
  },
  dashLine: {
    width: '100%',
    height: 1,
  },
})

export default Divider
