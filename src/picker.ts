import { openPicker, Options, ImageOrVideo, openCamera } from 'react-native-image-crop-picker'
import { CropMediaType, IUploadTempSource, PickerType } from './interface'
import { UploadProps } from './_internal'
import DocumentPicker from 'react-native-document-picker'
import { Platform } from 'react-native'
import { getResolvedPath } from './utils/helper'
import openPictureVisionPicker from './components/take-picture/open'
import { compressImageOrVideo } from './utils'

export interface BasicUploadOptions extends Partial<Omit<UploadProps, 'pickerType'>> {
  /**
   * pickerType 为crop* mediaType
   */
  cropMediaType?: CropMediaType
  /**
   * 已经上传过的文件数量
   */
  currentCount?: number
  /**
   * 压缩开始时的回调
   * @returns
   */
  onStartCompress?: () => void
}

/**
 * crop 文件选择
 * @param _options
 * @returns
 */
export async function openCropPicker(_options: BasicUploadOptions) {
  const options: Options = {
    multiple: _options.multiple,
    maxFiles: _options.maxCount,
    width: _options.width,
    height: _options.height,
    includeBase64: true,
    cropping: _options.cropping,
    mediaType: _options.cropMediaType,
    cropperChooseText: '确认',
    cropperCancelText: '取消',
  }
  const filelist: ImageOrVideo | ImageOrVideo[] = await openPicker(options)
  let files = options.multiple ? [...(filelist as unknown as ImageOrVideo[])] : [filelist as ImageOrVideo]
  if (_options.currentCount + files.length > _options.maxCount) {
    files = files.slice(0, _options.maxCount - _options.currentCount)
  }
  _options.onStartCompress?.()
  return compressImageOrVideo(files, _options.compress)
}

/**
 * crop相机拍照
 * @param _options
 * @returns
 */
export async function openCropCamera(_options: BasicUploadOptions) {
  const options: Options = {
    multiple: false,
    maxFiles: _options.maxCount,
    width: _options.width,
    height: _options.height,
    includeBase64: true,
    cropping: _options.cropping,
    mediaType: _options.cropMediaType,
    cropperChooseText: '确认',
    cropperCancelText: '取消',
  }
  const file = await openCamera(options)
  _options.onStartCompress?.()
  return compressImageOrVideo([file], _options.compress)
}

const isAndroid = Platform.OS === 'android'

/**
 * 文档选择
 * @param options
 * @returns
 */
export async function openDocumentPicker(options: BasicUploadOptions) {
  // 1. 选择文件
  const files = await DocumentPicker.pick({
    allowMultiSelection: options.multiple,
  })
  // 2. 文件另存
  let resolvedFiles = await Promise.all(files.map((item) => (isAndroid ? getResolvedPath(item) : item)))
  // 3. 最大值切分
  if (options.currentCount + resolvedFiles.length > options.maxCount) {
    resolvedFiles = files.slice(0, options.maxCount - options.currentCount)
  }
  return resolvedFiles
}

/**
 * 特定相机拍照UI
 * @param options
 * @returns
 */
export async function openVisionCamera(options: BasicUploadOptions) {
  const images = await openPictureVisionPicker({
    maxCount: options.maxCount,
    existCount: options.currentCount,
    title: options.title,
  })
  options.onStartCompress?.()
  return compressImageOrVideo(images, options.compress)
}

export const composedPicker: {
  [key in PickerType]: (config: BasicUploadOptions) => Promise<IUploadTempSource[]>
} = {
  cropCamera: openCropCamera,
  cropPicker: openCropPicker,
  documentPicker: openDocumentPicker,
  visionCamera: openVisionCamera,
}
