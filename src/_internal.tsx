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
import {
  Options,
  Image as ImageType,
  Video as VideoType,
  ImageOrVideo,
  openCamera,
  openPicker,
} from 'react-native-image-crop-picker'
import DocumentPicker from 'react-native-document-picker'
import { Toast, Uploader } from '@fruits-chain/react-native-xiaoshu'
import { ToastMethods } from '@fruits-chain/react-native-xiaoshu/lib/typescript/toast/interface'
import { cloneDeep } from 'lodash'
import { compressorImage, compressorVideo } from './utils/helper'
import { exec, isVideo } from './utils'
import { FileVO, ImageMediaType, IUploadTempSource, MediaType, UploadItem } from './interface'
import useUploadResume, { getFileKey } from './hooks/useUploadResume'
import { ISource } from '.'
import { RegularCount } from '@fruits-chain/react-native-xiaoshu/lib/typescript/uploader/interface'
import Preview, { CustomPreview, PreviewInstance } from './components/Preview'

export interface UploadInstance {
  open: (config?: OverrideOptions) => void
  openDocument: () => void
}

export interface UploadActionParams {
  data: FormData
  file: IUploadTempSource
  resume: boolean
}

export type UploadAction = ({ data, file }: UploadActionParams) => Promise<FileVO>

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
  mediaType?: MediaType
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
  onPressAdd?: () => void
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
  /**
   * 是否支持续传（false: 不使用 true: 任何情况下都是用 number: 只有压缩后大于number MB的文件才使用）
   */
  allowResume?: boolean | number
  /**
   * 获取上传当前图片上传进度动作
   */
  progressAction?: (fileHash: string) => Promise<{
    fileUrl: string
    size: number
  }>
  /**
   * 是否开启压缩
   */
  compress?: boolean
  /**
   * 是否显示UI
   */
  showUi?: boolean
  /**
   * 每行显示的图片数 default: 4
   */
  imagesPerRow?: number
  /**
   * regular模式下，设置固定上传个数及文案
   */
  count?: number | RegularCount[]
  /**
   * 自定义预览实现 key: 文件名后缀 value:自定义预览组件
   */
  customPreview?: CustomPreview
}

export type OverrideOptions = Pick<UploadProps, 'useCamera' | 'multiple'> & {
  mediaType?: ImageMediaType
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
const _UploadInternal: ForwardRefRenderFunction<UploadInstance, UploadProps> = (
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
    allowResume = false,
    progressAction,
    compress = true,
    showUi = true,
    imagesPerRow = 4,
    count,
    customPreview,
  },
  ref,
) => {
  const previewRef = useRef<PreviewInstance>()
  const { getFileBeforeUpload, uploadFile } = useUploadResume({
    uploadAction,
    progressAction,
    allowResume,
  })
  const [value, setValue] = useState<UploadItem[]>(typeof list === 'undefined' ? defaultList : list)
  const valueCopy = useRef<UploadItem[]>([]) // 组件内资源备份
  // 对外暴露接口
  useImperativeHandle(ref, () => ({
    open: chooseImageAndUpload,
    openDocument: chooseDocumentAndUpload,
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
      setValue(cloneDeep(value))
    }
  }
  function removeImage(item: UploadItem) {
    const results = valueCopy.current.filter((it) => it.key !== item.key)
    valueCopy.current = results
    setValueIfNeeded(results)
    onChange && onChange(results)
  }
  async function _compress(uri: string, type: string) {
    try {
      if (isVideo(type)) {
        return await compressorVideo(uri, false)
      } else {
        return await compressorImage(uri, false)
      }
    } catch (error) {}
  }
  async function compressWork(images: ImageOrVideo[]) {
    const result: IUploadTempSource[] = []
    if (!images || !images.length) {
      return result
    }
    toastKey = Toast.loading({
      message: '处理中...',
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
      if (!compress) {
        result.push({
          name,
          uri,
          type,
        })
      } else {
        const filepath = await _compress(uri, type)
        // 需要在这里做操作
        result.push({
          name,
          uri: filepath,
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
      width,
      height,
      includeBase64: true,
      cropping,
      cropperChooseText: '确认',
      cropperCancelText: '取消',
      mediaType: mediaType as ImageMediaType,
      ...config,
    }
    const optionAction = isCamera ? openCamera : openPicker
    optionAction(options)
      .then((i: ImageType | ImageType[] | VideoType) => {
        // 文件压缩
        const images = multiple && !isCamera ? [...(i as ImageType[])] : [i as ImageType | VideoType]
        let result = images
        if (value.length + images.length > maxCount) {
          result = result.slice(0, maxCount - value.length)
        }
        return compressWork(result)
      })
      .then(async (res) => {
        // 断点续传逻辑
        const res1 = await Promise.all(res.map((item) => getFileBeforeUpload(item)))
        return res1
      })
      .then((files: UploadItem[]) => {
        setTimeout(() => {
          toastKey.close()
        }, 0)
        valueCopy.current = [...value, ...files]
        setValueIfNeeded(valueCopy.current)
        exec(onChange, cloneDeep(valueCopy.current))
        return valueCopy.current.filter((f) => f.status === 'loading')
      })
      .then(async (filesToUpload) => {
        for (const file of filesToUpload) {
          const uploadRes = await uploadFile(file)
          if (uploadRes.status === 'error') {
            exec(onUploadError, '文件上传失败')
          }
          const idx = valueCopy.current.findIndex((file) => file.key === uploadRes.key)
          if (~idx) {
            valueCopy.current[idx] = uploadRes
          }
          setValueIfNeeded(valueCopy.current)
          exec(onChange, cloneDeep(valueCopy.current))
        }
      })
      .catch((e) => {
        // 用户手动取消提示错误
        if (e?.code && e?.code === 'E_PICKER_CANCELLED') {
          return
        }
        Toast('文件上传失败！')
      })
  }
  async function chooseDocumentAndUpload() {
    try {
      // 1. 选择文件
      const files = await DocumentPicker.pick({
        allowMultiSelection: multiple,
      })
      //2. 断点续传
      const result = await Promise.all(files.map((item) => getFileBeforeUpload(item)))
      valueCopy.current = [...value, ...result]
      setValueIfNeeded(valueCopy.current)
      exec(onChange, cloneDeep(valueCopy.current))
      const filesToUpload = valueCopy.current.filter((f) => f.status === 'loading')
      // 2. 文件上传
      for (const file of filesToUpload) {
        const uploadRes = await uploadFile(file)
        if (uploadRes.status === 'error') {
          exec(onUploadError, '文件上传失败')
        }
        const idx = valueCopy.current.findIndex((file) => file.key === uploadRes.key)
        if (~idx) {
          valueCopy.current[idx] = uploadRes
        }
        setValueIfNeeded(valueCopy.current)
        exec(onChange, cloneDeep(valueCopy.current))
      }
    } catch (err) {
      // 用户手动取消
      if (err?.code === 'DOCUMENT_PICKER_CANCELED') {
        return
      }
      Toast('文件上传失败！')
    }
  }
  function handlePressAdd() {
    onPressAdd()
  }
  function handlePress(item: ISource) {
    if (item.status === 'done') {
      previewRef.current.preview(item)
    }
  }
  async function handleReupload(item: ISource) {
    const currIndex = valueCopy.current.findIndex((one) => one.key === item.key)
    if (!~currIndex) {
      return
    }
    const res = await getFileBeforeUpload({
      uri: valueCopy.current[currIndex].uri,
      name: '',
      type: valueCopy.current[currIndex].type,
    })
    valueCopy.current[currIndex] = res
    setValueIfNeeded(valueCopy.current)
    exec(onChange, cloneDeep(valueCopy.current))
    if (res.status === 'done') {
      return
    }
    const uploadRes = await uploadFile(res)
    if (uploadRes.status === 'error') {
      exec(onUploadError, '文件上传失败')
    }
    valueCopy.current[currIndex] = uploadRes
    setValueIfNeeded(valueCopy.current)
    exec(onChange, cloneDeep(valueCopy.current))
  }
  return showUi ? (
    <>
      {typeof count === 'undefined' ? (
        <Uploader
          onPressImage={handlePress}
          maxCount={maxCount}
          onPressDelete={(item) => removeImage(item)}
          onPressUpload={handlePressAdd}
          onPressError={handleReupload}
          list={value}
          uploadText={tipText}
          colCount={imagesPerRow}
        />
      ) : (
        <Uploader.Regular
          onPressImage={handlePress}
          count={count}
          onPressDelete={(item) => removeImage(item)}
          onPressUpload={handlePressAdd}
          onPressError={handleReupload}
          list={value}
          colCount={imagesPerRow}
        />
      )}
      <Preview customPreview={customPreview} ref={previewRef} />
    </>
  ) : null
}

const UploadInternal = forwardRef<any, UploadProps>(_UploadInternal) as (
  props: PropsWithChildren<UploadProps> & { ref?: React.Ref<any> },
) => React.ReactElement

export default UploadInternal
