import React from 'react'
import { Flex, ActivityIndicator } from '@fruits-chain/react-native'
import { Image, Text, View, ImageBackground, Platform, Dimensions, StyleSheet } from 'react-native'
import FastImage from 'react-native-fast-image'
import { TouchableOpacity } from 'react-native'
import { IUploadSource } from './_internal'

const itemWidth = (Dimensions.get('screen').width - 64) / 4

export const ItemLoading: React.FC<IItemProps> = ({ item }) => {
  return (
    <ImageBackground source={{ uri: item.path }} style={styles.item} imageStyle={styles.borderRadius}>
      <Flex direction="column" justify="center" style={styles.loadingContent}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#fff" />
        </View>
        <Text style={styles.loadingText}>上传</Text>
      </Flex>
    </ImageBackground>
  )
}
interface IItemProps {
  item: IUploadSource
  onPress?: (item: IUploadSource, index: number) => void
  index?: number
}

export const ItemError: React.FC<IItemProps> = ({ item, onPress, index }) => {
  return (
    <TouchableOpacity onPress={() => onPress(item, index)}>
      <ImageBackground source={{ uri: item.path }} style={styles.item} imageStyle={styles.borderRadius}>
        <Flex direction="column" justify="center" style={styles.loadingContent}>
          <Text style={styles.errorText}>上传失败</Text>
          <Text style={styles.errorText}>重试</Text>
        </Flex>
      </ImageBackground>
    </TouchableOpacity>
  )
}

export const ItemDone: React.FC<IItemProps> = ({ item, onPress, index }) => {
  const isVideo = item.path && item.path.endsWith('.mp4')
  return (
    <TouchableOpacity onPress={() => onPress(item, index)}>
      <FastImage
        source={{ uri: item.path }}
        style={[styles.item as any, Platform.OS === 'ios' ? styles.itemWithBg : null]}
      />
      {isVideo ? (
        <Flex justify="center" align="center" style={[styles.playIconWrapper]}>
          <Image source={require('./images/icon_play.png')} style={styles.playIcon} />
        </Flex>
      ) : null}
    </TouchableOpacity>
  )
}

export default {
  loading: ItemLoading,
  error: ItemError,
  done: ItemDone,
}

const styles = StyleSheet.create({
  loadingContent: {
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 5,
  },
  borderRadius: {
    borderRadius: 5,
  },
  loadingContainer: {
    width: 24,
    height: 24,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    lineHeight: 17,
    color: '#FFFFFF',
    marginTop: 10,
  },
  item: {
    width: itemWidth,
    height: itemWidth,
    borderRadius: 5,
  },
  itemWithBg: {
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  errorText: {
    fontSize: 12,
    lineHeight: 17,
    color: '#fff',
  },
  playIconWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  playIcon: {
    width: 24,
    height: 24,
  },
})
