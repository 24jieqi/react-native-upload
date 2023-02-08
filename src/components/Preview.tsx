import { Empty, Flex, Popup } from '@fruits-chain/react-native-xiaoshu'
import React, { forwardRef, PropsWithChildren, useImperativeHandle, useMemo, useState } from 'react'
import { UploadItem } from '../interface'
import VideoPreview from './VideoPreview'
import ImagePreview from './ImagePreview'

type PreviewComponent = React.ComponentType<{ uri: string }>

export interface CustomPreview {
  [key: string]: PreviewComponent
}

interface PreviewProps {
  customPreview?: CustomPreview
}

export interface PreviewInstance {
  preview: (file: UploadItem) => void
}

const _Preview: React.ForwardRefRenderFunction<PreviewInstance, PreviewProps> = ({ customPreview = {} }, ref) => {
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
  const Compnent = useMemo(() => {
    if (!currentFile?.filepath) {
      return
    }
    const mapper: {
      [key: string]: PreviewComponent
    } = {
      mp4: VideoPreview,
      png: ImagePreview,
      jpg: ImagePreview,
      jpeg: ImagePreview,
      ...customPreview,
    }
    for (const key of Object.keys(mapper)) {
      if (currentFile.filepath.endsWith(`.${key}`)) {
        return mapper[key]
      }
    }
  }, [currentFile, customPreview])
  return (
    <Popup.Page visible={visible} onPressOverlay={closeModal} destroyOnClosed round>
      <Popup.Header title={currentFile?.name} onClose={closeModal} />
      {Compnent ? (
        <Compnent uri={currentFile.filepath} />
      ) : (
        <Flex justify="center">
          <Empty text="此文件暂不支持预览" />
        </Flex>
      )}
    </Popup.Page>
  )
}

const Preview = forwardRef<PreviewInstance, PreviewProps>(_Preview) as (
  props: PropsWithChildren<PreviewProps> & { ref?: React.Ref<PreviewInstance> },
) => React.ReactElement

export default Preview
