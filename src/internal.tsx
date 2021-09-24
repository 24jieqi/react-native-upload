import React, {
  forwardRef,
  ForwardRefRenderFunction,
  PropsWithChildren,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { Dimensions, Image, Platform, Text, TouchableOpacity, View, StyleSheet } from 'react-native'
import ImagePicker, { Options, Image as ImageType, Video, ImageOrVideo } from 'react-native-image-crop-picker'
import images from './images'
import { Toast } from '@fruits-chain/react-native'
import FullImage from './components/ImagePreview'
import VideoPlay from './components/VideoPreview'
import RNVideoHelper from 'react-native-video-helper'
import Items from './item'
import { ISource } from '.'
import { FileVO } from './preview'

export interface IUploadSource {
  key: string // 当前资源的唯一标识
  path?: string // 本地资源路径
  name?: string // 名称
  type?: string // 类型
  status?: 'loading' | 'done' | 'error' // 资源状态
  origin?: FileVO // 远程上传结果
}

interface IUploadTempSource {
  uri: string
  name: string
  type: string
}

export interface UploadInstance {
  open: (config?: OverrideOptions) => void
}

type UploadAction = ({ data }: { data: FormData }) => Promise<FileVO>

export interface UploadProps {
  list?: IUploadSource[]
  defaultList?: IUploadSource[]
  /**
   * @description onChange在异步过程中被多次调用，如果onChange有props或依赖，需要注意，见：https://overreacted.io/zh-hans/a-complete-guide-to-useeffect/
   */
  onChange?: (list: IUploadSource[]) => void
  onUploadError?: (msg?: any) => void
  maxCount?: number
  tipText?: string
  cropping?: boolean
  /**
   * @deprecated
   */
  previewOnly?: boolean
  mediaType?: 'photo' | 'video' | 'any'
  multiple?: boolean
  useCamera?: boolean
  onPressAdd: () => void
  uploadAction: UploadAction
}

export interface OverrideOptions {
  mediaType?: 'photo' | 'video' | 'any'
  multiple?: boolean
  useCamera?: boolean
}

function isValidVideo(type: string) {
  return type.includes('video') && type.includes('mp4')
}

let keyIndex = 1
let toastKey: number
// 除去边距后每行显示四个元素
const itemWidth = (Dimensions.get('screen').width - 64) / 4

function getFileKey() {
  return `_upload_v2-${Date.now()}-${keyIndex++}`
}

export function formatUploadList(list: FileVO[]) {
  return list.map((item) => {
    return {
      key: getFileKey(),
      path: item.fileUrl,
      name: item.filename,
      status: 'done',
      origin: item,
    } as IUploadSource
  })
}

/**
 * internal upload component, do not use it!
 * @private
 */
const _UploadInternal: ForwardRefRenderFunction<unknown, UploadProps> = (
  {
    list,
    onChange,
    onUploadError,
    maxCount = 10,
    tipText,
    cropping = false,
    mediaType = 'any',
    defaultList = [],
    useCamera = false,
    multiple = true,
    onPressAdd,
    uploadAction,
  },
  ref,
) => {
  const [showImagePreview, setShowImagePreview] = useState(false) // 图片预览与否
  const [currImageIndex, setCurrImageIndex] = useState(0) // 当前预览图片的索引
  const [showVideoPreview, setShowVideoPreview] = useState(false) // 视频预览与否
  const [videoUrl, setVideoUrl] = useState('') // 当前预览图片的url
  const prev = useRef(list) // 受控情形下对外传入的资源列表拷贝
  const [value, setValue] = useState<IUploadSource[]>(typeof list === 'undefined' ? defaultList : list)
  const valueCopy = useRef<IUploadSource[]>([]) // 组件内资源备份
  const [loading, setLoading] = useState(false) // 是否正在上传准备中
  // 对外暴露接口
  useImperativeHandle(ref, () => ({
    open: chooseImageAndUpload,
  }))
  // 受控情形下的内外数据同步
  useEffect(() => {
    if (prev.current === list) {
      return
    }
    setValue(list)
    valueCopy.current = list
    prev.current = list
  }, [list])
  // 受控模式下不再设置内部value
  function setValueIfNeeded(value: IUploadSource[]) {
    if (typeof list === 'undefined') {
      setValue(value)
    }
  }
  function removeImage(item: IUploadSource) {
    const results = valueCopy.current.filter((it) => it.key !== item.key)
    valueCopy.current = results
    setValueIfNeeded(results)
    onChange && onChange(results)
  }
  function upload(data: FormData, key: string, uploadAction: UploadAction) {
    uploadAction({
      data,
    })
      .then((result) => {
        // 文件上传成功
        const current = valueCopy.current.find((file) => file.key === key)
        if (current) {
          current.origin = result
          if (!result?.fileUrl) {
            current.status = 'error'
          } else {
            current.status = 'done'
          }
        }
        setValueIfNeeded(valueCopy.current)
        onChange && onChange(valueCopy.current)
      })
      .catch((msg) => {
        onUploadError && onUploadError(msg)
        const current = valueCopy.current.find((file) => file.key === key)
        if (current) {
          current.status = 'error'
        }
        setValueIfNeeded(valueCopy.current)
        onChange && onChange(valueCopy.current)
      })
  }
  async function compressVideo(uri: string, name: string, type: string) {
    try {
      const compressedUri = await RNVideoHelper.compress(uri, {
        quality: 'high',
      })
      return { uri: `file://${compressedUri}`, name, type }
    } catch (e) {
      Toast.info('视频压缩失败！', 1)
      return {
        uri,
        name,
        type,
      }
    }
  }
  async function workBeforeUpload(images: ImageOrVideo[]) {
    const result: IUploadTempSource[] = []
    if (!images || !images.length) {
      return result
    }
    for (const image of images) {
      const parts = image.path.split('/')
      const uri = image.path
      const name = parts[parts.length - 1]
      const type = image.mime
      if (type.includes('video') && !type.includes('mp4')) {
        Toast.info('上传视频只支持mp4格式', 1.5)
        continue
      }
      if (Platform.OS === 'android' && isValidVideo(type)) {
        result.push(await compressVideo(uri, name, type))
      } else {
        result.push({
          uri,
          name,
          type,
        })
      }
    }
    return result
  }

  function chooseImageAndUpload(config: OverrideOptions) {
    const isCamera = typeof config.useCamera === 'undefined' ? useCamera : config.useCamera
    const options: Options = {
      multiple: isCamera ? false : multiple,
      maxFiles: maxCount,
      width: 300,
      height: 300,
      includeBase64: true,
      cropping,
      cropperChooseText: '确认',
      cropperCancelText: '取消',
      mediaType,
      compressVideoPreset: 'MediumQuality',
      compressImageMaxWidth: 1280,
      compressImageMaxHeight: 1280,
      compressImageQuality: 0.5,
      ...config,
    }
    const optionAction = isCamera ? ImagePicker.openCamera : ImagePicker.openPicker
    optionAction(options)
      .then((i: ImageType | ImageType[] | Video) => {
        setLoading(true)
        const images = multiple && !isCamera ? [...(i as ImageType[])] : [i as ImageType | Video]
        return workBeforeUpload(images)
      })
      .then((files: IUploadTempSource[]) => {
        setLoading(false)
        // 上传文件数量限制
        let currentFiles = [...files]
        if (files.length + value.length > maxCount) {
          currentFiles = currentFiles.slice(0, maxCount - value.length)
        }
        const nextFiles: IUploadSource[] = [] // 设置图片
        for (const file of currentFiles) {
          const fileKey = getFileKey()
          nextFiles.push({ key: fileKey, name: file.name, path: file.uri, type: file.type, status: 'loading' })
          const body = new FormData()
          body.append('file', file as any)
          upload(body, fileKey, uploadAction)
        }
        valueCopy.current = [...value, ...nextFiles]
        setValueIfNeeded(valueCopy.current)
        onChange && onChange(valueCopy.current)
      })
      .catch((e) => {
        // 用户手动取消提示错误
        if (e.code && e.code === 'E_PICKER_CANCELLED') {
          return
        }
        Toast.info('文件上传失败！', 1)
      })
  }
  function handlePressAdd() {
    onPressAdd()
  }
  function handlePress(item: ISource, index: number) {
    if (item.status === 'done') {
      // 预览逻辑
      const isVideo = item.path && item.path.endsWith('.mp4')
      if (isVideo) {
        setVideoUrl(item.path)
        setShowVideoPreview(true)
      } else {
        setCurrImageIndex(index)
        setShowImagePreview(true)
      }
    } else if (item.status === 'error') {
      // 上传重试逻辑
      const current = valueCopy.current.find((one) => one.key === item.key)
      if (current) {
        current.status = 'loading'
        setValueIfNeeded(valueCopy.current)
        onChange && onChange(valueCopy.current)
        const formData = new FormData()
        formData.append('file', { name: current.name, uri: current.path, type: current.type } as any)
        upload(formData, current.key, uploadAction)
      }
    }
  }
  const itemList = value.map((item, index) => {
    const { status } = item
    const Comp = Items[status]
    // 图片类型所在的文本
    const imgIndex = value.filter((source) => !source.path.includes('.mp4')).findIndex((one) => one.key === item.key)
    return (
      <View style={[styles.marginStyle]} key={index}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.flex, styles.deleteIconWrapper]}
          onPress={() => removeImage(item)}>
          <Image source={images.DeleteIcon} style={styles.deleteIcon} />
        </TouchableOpacity>
        <Comp item={item} index={imgIndex} onPress={handlePress} />
      </View>
    )
  })
  const isFull = value.length >= maxCount
  const uploadIcon = (
    <TouchableOpacity style={[styles.flex, styles.marginStyle, styles.bgcolor, styles.item]} onPress={handlePressAdd}>
      <Image source={images.AddIcon} style={styles.addIcon} />
      <Text style={styles.tipText}>{tipText || '图片/视频'}</Text>
    </TouchableOpacity>
  )
  const imageUrls = value
    .filter((source) => !source.path.includes('.mp4'))
    .map((item) => ({ url: item.path, id: item.key }))
  useEffect(() => {
    if (loading) {
      toastKey = Toast.info('视频压缩中...', 0) // 设置为0表示不自动清除
    } else if (toastKey) {
      Toast.remove(toastKey)
    }
  }, [loading])
  return (
    <>
      <View style={[styles.flexWrapper]}>
        {itemList}
        {isFull ? null : uploadIcon}
      </View>
      <FullImage
        index={currImageIndex}
        visible={showImagePreview}
        onVisibleChange={(visible) => setShowImagePreview(visible)}
        photos={imageUrls}
      />
      <VideoPlay videoUrl={videoUrl} show={showVideoPreview} setShow={(show?: boolean) => setShowVideoPreview(show)} />
    </>
  )
}

const UploadInternal = forwardRef<any, UploadProps>(_UploadInternal) as (
  props: PropsWithChildren<UploadProps> & { ref?: React.Ref<any> },
) => React.ReactElement

export default UploadInternal

const styles = StyleSheet.create({
  bgcolor: { backgroundColor: '#F7F7F7' },
  videoView: {
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  item: {
    width: itemWidth,
    height: itemWidth,
    borderRadius: 5,
  },
  flexWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  onlyUploadIcon: {
    justifyContent: 'center',
  },
  flex: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  marginStyle: {
    marginRight: 8,
    marginBottom: 8,
  },
  addIcon: {
    width: 24,
    height: 24,
  },
  loadingContainer: {
    width: 24,
    height: 24,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  tipText: {
    marginTop: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#999999',
    textAlign: 'center',
  },
  deleteIconWrapper: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  deleteIcon: {
    width: 16,
    height: 16,
  },
  loadingText: {
    fontSize: 12,
    lineHeight: 17,
    color: '#5D626B',
    marginTop: 10,
  },
})
