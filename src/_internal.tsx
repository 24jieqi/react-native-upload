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
import { Toast, Uploader } from '@fruits-chain/react-native-xiaoshu'
import { ToastMethods } from '@fruits-chain/react-native-xiaoshu/lib/typescript/toast/interface'
import { cloneDeep } from 'lodash'
import { exec } from './utils'
import { CropMediaType, FileVO, IUploadTempSource, PickerType, UploadItem } from './interface'
import useUploadResume from './hooks/useUploadResume'
import { ISource } from '.'
import { RegularCount } from '@fruits-chain/react-native-xiaoshu/lib/typescript/uploader/interface'
import Preview, { CustomPreview, PreviewInstance } from './components/preview/Preview'
import { BasicUploadOptions, composedPicker } from './picker'
import { isDef } from '@fruits-chain/utils'

interface OverrideUploadConfig {
  pickerType: PickerType
  cropMediaType?: CropMediaType
  multiple?: boolean
}

export interface UploadInstance {
  open: (config?: OverrideUploadConfig) => void
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
   * 是否支持多选上传
   */
  multiple?: boolean
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
  /**
   * 选择器类型
   */
  pickerType?: PickerType | PickerType[]
  /**
   * pickerType 为crop* mediaType
   */
  cropMediaType?: CropMediaType
  /**
   * 用于VisionCamera的标题
   */
  title?: string
}

let toastKey: ToastMethods

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
    defaultList = [],
    onPressAdd,
    uploadAction,
    width = 300,
    height = 300,
    allowResume = false,
    progressAction,
    compress = true,
    showUi = true,
    imagesPerRow = 4,
    multiple = true,
    count,
    customPreview,
    title,
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
    open: chooseResourceAndUpload,
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
  /**
   * 删除文件
   * @param item
   */
  function removeImage(item: UploadItem) {
    const results = valueCopy.current.filter((it) => it.key !== item.key)
    valueCopy.current = results
    setValueIfNeeded(results)
    onChange && onChange(results)
  }
  /**
   * 文件选择
   * @param config
   * @returns
   */
  async function chooseResourceAndUpload(config: OverrideUploadConfig) {
    try {
      const action = composedPicker[config.pickerType]
      const options: BasicUploadOptions = {
        multiple: isDef(config.multiple) ? config.multiple : multiple,
        maxCount,
        width,
        height,
        cropping,
        cropMediaType: config.cropMediaType,
        currentCount: value.length,
        title,
        compress,
        onStartCompress() {
          toastKey = Toast.loading({
            message: '处理中...',
            duration: 0,
          })
        },
      }
      const files = await action(options)
      const filesResumed = await Promise.all(files.map((item) => getFileBeforeUpload(item)))
      setTimeout(() => {
        toastKey?.close?.()
      }, 0)
      valueCopy.current = [...value, ...filesResumed]
      setValueIfNeeded(valueCopy.current)
      exec(onChange, cloneDeep(valueCopy.current))
      const filesToUpload = valueCopy.current.filter((f) => f.status === 'loading')
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
    } catch (e) {
      // 用户手动取消提示错误
      if (e?.code && e?.code === 'E_PICKER_CANCELLED') {
        return
      }
      // 关闭处理中提示框，如果有必要的话
      toastKey?.close?.()
      Toast('文件上传失败！')
    }
  }
  /**
   * 点击上传UI
   * @returns
   */
  function handlePressAdd() {
    if (value.length >= maxCount) {
      Toast('已达到最大上传数量！')
      return
    }
    onPressAdd()
  }
  /**
   * 点击已上传文件预览
   * @param item
   */
  function handlePress(item: ISource) {
    if (item.status === 'done') {
      previewRef.current.preview(item)
    }
  }
  /**
   * 失败重传
   * @param item
   * @returns
   */
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
      <Preview list={value} customPreview={customPreview} ref={previewRef} />
    </>
  ) : null
}

const UploadInternal = forwardRef<any, UploadProps>(_UploadInternal) as (
  props: PropsWithChildren<UploadProps> & { ref?: React.Ref<any> },
) => React.ReactElement

export default UploadInternal
