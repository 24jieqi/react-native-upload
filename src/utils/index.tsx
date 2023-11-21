import {
  ceilWith,
  div,
  isArray,
  isFunction,
  isType,
  mul,
  plus,
} from '@fruits-chain/utils'
import { Image } from 'react-native'
import type { ImageOrVideo } from 'react-native-image-crop-picker'
import type {
  ImageSource,
  PhotoBatchOperations,
  Point,
  TextOptions,
} from 'react-native-photo-manipulator'
import RNPhotoManipulator from 'react-native-photo-manipulator'
import { URL } from 'react-native-url-polyfill'

import type { FileVO, IUploadTempSource, UploadItem } from '../interface'

import { compress, buildUri } from './helper'

export function getThumbnailImageUrl(url = '', width = 80, height = 80) {
  if (!url || url.includes('.mp4')) {
    return url
  }
  return `${url}?x-image-process=image/resize,m_fill,h_${height},w_${width}`
}

export function isMp4(mimeType: string) {
  return mimeType.includes('video/mp4')
}

export function isImage(mimeType: string) {
  return mimeType.includes('image/')
}

export function isCompressSupportType(mimeType: string) {
  return isMp4(mimeType) || isImage(mimeType)
}

/**
 * 根据URL获取文件扩展名
 * @param filePath
 * @returns
 */
export function getFileExt(filePath: string) {
  const pathName = new URL(filePath).pathname
  return /.*(\..*)$/.exec(pathName)?.[1]
}

export function exec(
  func: ((...param: any) => any) | undefined,
  ...params: any[]
) {
  if (typeof func === 'function') {
    return func(...params)
  }
}

/**
 * 根据文档的mime类型，返回占位图标
 * @param type
 * @returns
 */
export function getDocumentPlaceholderIconByMimeType(type: string) {
  const mimeTypeIconMap = {
    'video/mp4': require('../images/video.png'),
    'application/pdf': require('../images/pdf.png'),
    'application/zip': require('../images/zip.png'),
    'text/csv': require('../images/csv.png'),
    'application/msword': require('../images/doc.png'),
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': require('../images/docx.png'),
    'application/vnd.ms-powerpoint': require('../images/ppt.png'),
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': require('../images/pptx.png'),
    'application/vnd.ms-excel': require('../images/xls.png'),
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': require('../images/xlsx.png'),
    '.mp4': require('../images/video.png'),
    '.pdf': require('../images/pdf.png'),
    '.zip': require('../images/zip.png'),
    '.csv': require('../images/csv.png'),
    '.doc': require('../images/doc.png'),
    '.docx': require('../images/docx.png'),
    '.ppt': require('../images/ppt.png'),
    '.pptx': require('../images/pptx.png'),
    '.xls': require('../images/xls.png'),
    '.xlsx': require('../images/xlsx.png'),
  }
  const sourceId = mimeTypeIconMap[type as keyof typeof mimeTypeIconMap]
  if (!sourceId) {
    return
  }
  const resolved = Image.resolveAssetSource(sourceId)
  return resolved.uri
}

let keyIndex = 1

/**
 * 生成资源唯一key
 * @returns
 */
export function getFileKey() {
  return `_upload_v2-${Date.now()}-${keyIndex++}`
}

/**
 * 上传列表格式化（一般用于远程资源列表在上传中回显）
 */
export function formatUploadList(list: FileVO[]) {
  return list.map(item => {
    const ext = getFileExt(item.fileUrl)
    const filePath = getDocumentPlaceholderIconByMimeType(ext)
    return {
      key: getFileKey(),
      filepath: filePath || item.fileUrl,
      previewPath: item.fileUrl,
      name: item.filename,
      status: 'done',
      origin: item,
      type: '',
    } as UploadItem
  })
}

/**
 * 图片、视频压缩
 * @param images
 * @param shouldCompress
 * @returns
 */
export async function compressImageOrVideo(
  images: Partial<ImageOrVideo>[],
  shouldCompress?: boolean,
) {
  const result: IUploadTempSource[] = []
  if (!images || !images.length) {
    return result
  }
  for (const image of images) {
    const parts = image.path.split('/')
    const uri = image.path
    const name = parts[parts.length - 1]
    const type = image.mime
    if (!isCompressSupportType(type)) {
      continue
    }
    if (!shouldCompress) {
      result.push({
        name,
        uri,
        type,
      })
    } else {
      const filepath = await compress(uri, type)
      result.push({
        name,
        uri: filepath,
        type,
      })
    }
  }
  return result
}

interface ImageSize {
  width: number
  height: number
}

type WatermarkText = string | TextOptions

type GetWatermarkMethod = (
  size?: ImageSize,
) => Promise<Array<WatermarkText> | WatermarkText>

interface Overlay {
  overlay: ImageSource
  position: Point
}

type GetOverlayMethod = (size?: ImageSize) => Promise<Array<Overlay> | Overlay>

export type WatermarkOperations = Array<
  WatermarkText | GetWatermarkMethod | Overlay | GetOverlayMethod
>

type WatermarkRawOperations = Array<WatermarkText | Overlay>

const isStr = isType('String')

function makeItemAsArray(item: any): any[] {
  return isArray(item) ? item : [item]
}

/**
 * 添加图片水印
 * @param image
 * @param watermark
 * @returns
 */
export async function printWatermark(
  image: ImageSource,
  watermark: WatermarkOperations = [],
  size?: ImageSize,
) {
  const heightSize = size?.height ? ceilWith(size.height * 0.1) : 30 // 10行
  const widthSize = size?.width ? ceilWith(size.width * 0.025) : 30 // 每行40个字（等宽字体）
  const adjustTextSize = Math.min(heightSize, widthSize) // 取最小值
  const rawOperations: WatermarkRawOperations = []
  for (const item of watermark) {
    if (isFunction(item)) {
      rawOperations.push(...makeItemAsArray(await item(size)))
    } else {
      rawOperations.push(item)
    }
  }
  let rawTextIndex = 0
  const operations: PhotoBatchOperations[] = rawOperations.map(item => {
    // 图片类型的水印
    if ((item as Overlay).overlay) {
      return {
        operation: 'overlay',
        ...(item as Overlay),
      }
    }
    // 纯文本类型的水印，记录信息
    if (isStr(item)) {
      return {
        operation: 'text',
        options: {
          position: {
            x: div(adjustTextSize, 2),
            y: plus(
              div(adjustTextSize, 2),
              mul(adjustTextSize, rawTextIndex++),
            ),
          },
          textSize: adjustTextSize,
          color: '#FFFFFF',
          text: item,
        } as TextOptions,
      }
    }
    return {
      operation: 'text',
      options: item as TextOptions,
    }
  })
  return await RNPhotoManipulator.batch(buildUri(image as string), operations, {
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
  })
}
