/* eslint-disable @typescript-eslint/no-shadow */
import React, {
  forwardRef,
  ForwardRefRenderFunction,
  PropsWithChildren,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import ImagePicker, {
  Options,
  Image as ImageType,
  Video as VideoType,
  ImageOrVideo,
} from 'react-native-image-crop-picker'
import { Image, Video } from 'react-native-compressor'
import { Toast, Uploader } from '@fruits-chain/react-native-xiaoshu'
import { ToastMethods } from '@fruits-chain/react-native-xiaoshu/lib/typescript/toast/interface'
import ImagePreview from './components/ImagePreview'
import { exec, isVideo } from './utils'
import VideoPreview from './components/VideoPreview'
import { FileVO, UploadItem } from './interface'
import { ISource } from '.'

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
  list?: UploadItem[]
  defaultList?: UploadItem[]
  /**
   * @description onChange在异步过程中被多次调用，如果onChange有props或依赖，需要注意，见：https://overreacted.io/zh-hans/a-complete-guide-to-useeffect/
   */
  onChange?: (list: UploadItem[]) => void
  /**
   * 上传出错时的回调
   */
  onUploadError?: (msg?: any) => void
  /**
   * 最大上传数量
   */
  maxCount?: number
  /**
   * 上传可点击组件文本
   */
  tipText?: string
  /**
   * 是否进行裁剪
   */
  cropping?: boolean
  /**
   * 上传文件类型
   */
  mediaType?: 'photo' | 'video' | 'any'
  /**
   * 是否支持多选上传
   */
  multiple?: boolean
  /**
   * 是否使用相机拍摄
   */
  useCamera?: boolean
  /**
   * 点击新增
   */
  onPressAdd: () => void
  /**
   * 上传地址（需要封装成UploadAction的形式）
   */
  uploadAction: UploadAction
  /**
   * cropping模式下选取图片的宽度（默认300）
   */
  width?: number
  /**
   * cropping模式下选取图片的高度（默认300）
   */
  height?: number
}

export type OverrideOptions = Pick<UploadProps, 'mediaType' | 'useCamera' | 'multiple'>

let keyIndex = 1

function getFileKey() {
  return `_upload_v2-${Date.now()}-${keyIndex++}`
}

let toastKey: ToastMethods

export function formatUploadList(list: FileVO[]) {
  return list.map((item) => {
    return {
      key: getFileKey(),
      filepath: item.fileUrl,
      name: item.filename,
      status: 'done',
      origin: item,
      type: '',
    } as UploadItem
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
    width = 300,
    height = 300,
  },
  ref,
) => {
  const [showImagePreview, setShowImagePreview] = useState(false) // 图片预览与否
  const [currImageIndex, setCurrImageIndex] = useState(0) // 当前预览图片的索引
  const [showVideoPreview, setShowVideoPreview] = useState(false) // 视频预览与否
  const [videoUrl, setVideoUrl] = useState('') // 当前预览图片的url
  const [value, setValue] = useState<UploadItem[]>(typeof list === 'undefined' ? defaultList : list)
  const valueCopy = useRef<UploadItem[]>([]) // 组件内资源备份
  // 对外暴露接口
  useImperativeHandle(ref, () => ({
    open: chooseImageAndUpload,
  }))
  // 受控情形下的内外数据同步
  useEffect(() => {
    if (typeof list !== 'undefined') {
      setValue(list)
      valueCopy.current = list
    }
  }, [list])
  // 受控模式下不再设置内部value
  function setValueIfNeeded(value: UploadItem[]) {
    if (typeof list === 'undefined') {
      setValue(value)
    }
  }
  function removeImage(item: UploadItem) {
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
        exec(onChange, valueCopy.current)
      })
      .catch((msg) => {
        exec(onUploadError, msg)
        const current = valueCopy.current.find((file) => file.key === key)
        if (current) {
          current.status = 'error'
        }
        setValueIfNeeded(valueCopy.current)
        exec(onChange, valueCopy.current)
      })
  }
  async function compressVideo(uri: string, type: string) {
    try {
      if (isVideo(type)) {
        return await Video.compress(uri, { compressionMethod: 'auto' })
      } else {
        return await Image.compress(uri, { compressionMethod: 'auto' })
      }
    } catch (error) {}
  }
  async function workBeforeUpload(images: ImageOrVideo[]) {
    const result: IUploadTempSource[] = []
    if (!images || !images.length) {
      return result
    }
    toastKey = Toast.loading({
      message: '压缩中...',
      duration: 0,
    })
    for (const image of images) {
      const parts = image.path.split('/')
      const uri = image.path
      const name = parts[parts.length - 1]
      const type = image.mime
      if (type.includes('video') && !type.includes('mp4')) {
        Toast('只支持mp4格式的视频')
        continue
      }
      const filepath = await compressVideo(uri, type)
      result.push({
        name,
        uri: filepath,
        type,
      })
    }
    return result
  }

  function chooseImageAndUpload(config: OverrideOptions) {
    const isCamera = typeof config.useCamera === 'undefined' ? useCamera : config.useCamera
    const options: Options = {
      multiple: isCamera ? false : multiple,
      maxFiles: maxCount,
      width,
      height,
      includeBase64: true,
      cropping,
      cropperChooseText: '确认',
      cropperCancelText: '取消',
      mediaType,
      ...config,
    }
    const optionAction = isCamera ? ImagePicker.openCamera : ImagePicker.openPicker
    optionAction(options)
      .then((i: ImageType | ImageType[] | VideoType) => {
        const images = multiple && !isCamera ? [...(i as ImageType[])] : [i as ImageType | VideoType]
        return workBeforeUpload(images)
      })
      .then((files: IUploadTempSource[]) => {
        setTimeout(() => {
          toastKey.close()
        }, 0)
        // 上传文件数量限制
        let currentFiles = [...files]
        if (files.length + value.length > maxCount) {
          currentFiles = currentFiles.slice(0, maxCount - value.length)
        }
        const nextFiles: UploadItem[] = [] // 设置图片
        for (const file of currentFiles) {
          const fileKey = getFileKey()
          nextFiles.push({
            key: fileKey,
            name: file.name,
            filepath: file.uri,
            type: file.type,
            status: 'loading',
          })
          const body = new FormData()
          body.append('file', file as any)
          upload(body, fileKey, uploadAction)
        }
        valueCopy.current = [...value, ...nextFiles]
        setValueIfNeeded(valueCopy.current)
        exec(onChange, valueCopy.current)
      })
      .catch((e) => {
        // 用户手动取消提示错误
        if (e.code && e.code === 'E_PICKER_CANCELLED') {
          return
        }
        Toast('文件上传失败！')
      })
  }
  function handlePressAdd() {
    onPressAdd()
  }
  function handlePress(item: ISource, index: number) {
    if (item.status === 'done') {
      // 预览逻辑
      const isVideo = item.filepath && item.filepath.endsWith('.mp4')
      if (isVideo) {
        setVideoUrl(item.filepath)
        setShowVideoPreview(true)
      } else {
        setCurrImageIndex(index)
        setShowImagePreview(true)
      }
    }
  }
  function handleReupload(item: ISource) {
    // 上传重试逻辑
    const current = valueCopy.current.find((one) => one.key === item.key)
    if (current) {
      current.status = 'loading'
      setValueIfNeeded(valueCopy.current)
      exec(onChange, valueCopy.current)
      const formData = new FormData()
      formData.append('file', {
        name: current.name,
        uri: current.filepath,
        type: current.type,
      } as any)
      upload(formData, current.key, uploadAction)
    }
  }
  const imageUrls = value
    .filter((source) => !source.filepath.includes('.mp4'))
    .map((item) => ({ url: item.filepath, id: item.key }))
  return (
    <>
      <Uploader
        onPressImage={handlePress}
        maxCount={maxCount}
        onPressDelete={(item) => removeImage(item)}
        onPressUpload={handlePressAdd}
        onPressError={handleReupload}
        list={value}
        uploadText={tipText}
      />
      <ImagePreview
        index={currImageIndex}
        visible={showImagePreview}
        onVisibleChange={(visible) => setShowImagePreview(visible)}
        photos={imageUrls}
      />
      <VideoPreview
        videoUrl={videoUrl}
        show={showVideoPreview}
        setShow={(show?: boolean) => setShowVideoPreview(show)}
      />
    </>
  )
}

const UploadInternal = forwardRef<any, UploadProps>(_UploadInternal) as (
  props: PropsWithChildren<UploadProps> & { ref?: React.Ref<any> },
) => React.ReactElement

export default UploadInternal
