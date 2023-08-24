import { PhotoFile } from 'react-native-vision-camera'
import { Image } from 'react-native-image-crop-picker'
export interface FileVO {
  /** 文件ID */
  fileId?: string

  /** 文件上传时间时间戳 */
  fileUploadTime?: number

  /** 文件地址 */
  fileUrl?: string

  /** 文件名称 */
  filename?: string
}

export interface UploadItem {
  /**
   * 当前资源的唯一标识
   */
  key: string
  /**
   * 资源路径或者预览占位图标路径
   */
  filepath: string
  /**
   * 资源预览的路径
   */
  previewPath?: string
  /**
   * 资源名称
   */
  name?: string
  /**
   * 资源的mime类型
   */
  type?: string
  /**
   * 资源上传状态
   */
  status?: 'loading' | 'done' | 'error' // 资源状态
  /**
   * 上传对象
   */
  origin?: FileVO // 远程上传结果
  /**
   * 本地文件资源路径
   */
  uri?: string
  /**
   * 切分后的文件资源路径
   */
  sliceUri?: string
  /**
   * 文件大小
   */
  size?: number
  /**
   * 文件hash值
   */
  hash?: string
  /**
   * 当次文件偏移
   */
  offset?: number
  /**
   * 当前文件是否需要断点续传
   */
  resume?: boolean
  /**
   * 是否可删除
   * @default true
   */
  deletable?: boolean
}

export interface IUploadTempSource {
  uri: string
  name: string
  type: string
}

/**
 * crop mediaType
 */
export type CropMediaType = 'photo' | 'video' | 'any'

/**
 * 调用选择器类型
 */
export type PickerType = 'cropPicker' | 'cropCameraPhoto' | 'cropCameraVideo' | 'visionCamera' | 'documentPicker'

export type PrintWaterMarkFn = (
  image: Image | PhotoFile,
  pickerType: PickerType,
  cropMediaType?: CropMediaType,
) => boolean
