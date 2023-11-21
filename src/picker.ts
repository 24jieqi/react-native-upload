import { isFunction } from '@fruits-chain/utils'
import { Platform } from 'react-native'
import { pick } from 'react-native-document-picker'
import type { Options, ImageOrVideo } from 'react-native-image-crop-picker'
import { openPicker, openCamera } from 'react-native-image-crop-picker'

import type { UploadProps } from './_internal'
import openPictureVisionPicker from './components/take-picture/open'
import type { CropMediaType, IUploadTempSource, PickerType } from './interface'
import { compressImageOrVideo, isImage, printWatermark } from './utils'
import { getResolvedPath } from './utils/helper'

export interface BasicUploadOptions
  extends Partial<Omit<UploadProps, 'pickerType'>> {
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
    // tips: 降低选取文件质量，以免在大文件报错
    compressImageQuality: isAndroid ? 0.6 : 0.8,
  }
  const filelist: ImageOrVideo | ImageOrVideo[] = await openPicker(options)
  let files = options.multiple
    ? [...(filelist as unknown as ImageOrVideo[])]
    : [filelist as ImageOrVideo]
  if (_options.currentCount + files.length > _options.maxCount) {
    files = files.slice(0, _options.maxCount - _options.currentCount)
  }
  if (files && files.length) {
    _options.onStartCompress?.()
  }
  // 为图片添加水印
  for (const file of files) {
    if (isImage(file.mime)) {
      const shouldPrintWatermark = _options.shouldPrintWatermark
      const shouldPrint = isFunction(shouldPrintWatermark)
        ? shouldPrintWatermark(file, 'cropPicker', _options.cropMediaType)
        : shouldPrintWatermark
      if (!shouldPrint || !_options.watermark.length) {
        continue
      }
      file.path = await printWatermark(file.path, _options.watermark, {
        width: file.width,
        height: file.height,
      })
    }
  }
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
  if (file) {
    _options.onStartCompress?.()
    // 为图片添加水印
    if (isImage(file.mime)) {
      const shouldPrintWatermark = _options.shouldPrintWatermark
      const shouldPrint = isFunction(shouldPrintWatermark)
        ? shouldPrintWatermark(
            file,
            _options.cropMediaType === 'photo'
              ? 'cropCameraPhoto'
              : 'cropCameraVideo',
          )
        : shouldPrintWatermark
      if (shouldPrint && _options.watermark.length) {
        file.path = await printWatermark(file.path, _options.watermark, {
          width: file.width,
          height: file.height,
        })
      }
    }
  }
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
  const files = await pick({
    allowMultiSelection: options.multiple,
  })
  // 2. 文件另存
  let resolvedFiles = await Promise.all(
    files.map(item => (isAndroid ? getResolvedPath(item) : item)),
  )
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
    watermark: options.watermark,
    shouldPrintWatermark: options.shouldPrintWatermark,
  })
  if (images && images.length) {
    options.onStartCompress?.()
  }
  return compressImageOrVideo(images, options.compress)
}

export const composedPicker: {
  [key in PickerType]: (
    config: BasicUploadOptions,
  ) => Promise<IUploadTempSource[]>
} = {
  cropCameraPhoto: openCropCamera,
  cropCameraVideo: openCropCamera,
  cropPicker: openCropPicker,
  documentPicker: openDocumentPicker,
  visionCamera: openVisionCamera,
}
