import { Empty, Flex, Popup } from '@fruits-chain/react-native-xiaoshu'
import type { PropsWithChildren } from 'react'
import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'
import { Text, StyleSheet } from 'react-native'
import { URL } from 'react-native-url-polyfill'

import type { UploadItem } from '../../interface'

import ImagePreview from './ImagePreview'
import type { BasicPreviewProps } from './interface'
import VideoPreview from './VideoPreview'

type PreviewComponent = React.ComponentType<BasicPreviewProps>

export interface CustomPreview {
  [key: string]: PreviewComponent
}

interface PreviewProps {
  customPreview?: CustomPreview
  list: UploadItem[]
}

export interface PreviewInstance {
  preview: (file: UploadItem) => void
}

const _Preview: React.ForwardRefRenderFunction<
  PreviewInstance,
  PreviewProps
> = ({ customPreview = {}, list }, ref) => {
  const [visible, setVisible] = useState(false)
  const [currentFile, setCurrentFile] = useState<UploadItem>()
  useImperativeHandle(ref, () => ({
    preview(file) {
      setCurrentFile(file)
      setVisible(true)
    },
  }))
  function closeModal() {
    setVisible(false)
  }
  function handleRequestPopupClose() {
    closeModal()
    return true
  }
  const Compnent = useMemo(() => {
    if (!currentFile) {
      return
    }
    const path = currentFile.previewPath
    const mapper: {
      [key: string]: PreviewComponent
    } = {
      mp4: VideoPreview,
      png: ImagePreview,
      jpg: ImagePreview,
      jpeg: ImagePreview,
      PNG: ImagePreview,
      JPG: ImagePreview,
      JPEG: ImagePreview,
      ...customPreview,
    }
    const pathName = new URL(path).pathname
    for (const key of Object.keys(mapper)) {
      if (pathName.endsWith(`.${key}`)) {
        return mapper[key]
      }
    }
  }, [currentFile, customPreview])
  return (
    <Popup.Page
      visible={visible}
      onPressOverlay={closeModal}
      destroyOnClosed
      round
      onRequestClose={handleRequestPopupClose}>
      <Popup.Header
        title={
          <Text
            style={styles.titleText}
            ellipsizeMode="middle"
            numberOfLines={1}>
            {currentFile?.name}
          </Text>
        }
        onClose={closeModal}
      />
      {Compnent ? (
        <Compnent
          onChangeCurrent={curr => setCurrentFile(curr)}
          target={currentFile}
          onClose={() => setVisible(false)}
          list={list}
        />
      ) : (
        <Flex style={styles.flex1} justify="center" align="center">
          <Empty text="此文件暂不支持预览" />
        </Flex>
      )}
    </Popup.Page>
  )
}

const Preview = forwardRef<PreviewInstance, PreviewProps>(_Preview) as (
  props: PropsWithChildren<PreviewProps> & { ref?: React.Ref<PreviewInstance> },
) => React.ReactElement

const styles = StyleSheet.create({
  titleText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#11151A',
    textAlign: 'center',
    marginRight: 28,
    fontWeight: 'bold',
  },
  flex1: {
    flex: 1,
  },
})

export default Preview
