import { Image } from 'react-native'
import { ImageOrVideo } from 'react-native-image-crop-picker'
import { FileVO, IUploadTempSource, UploadItem } from '../interface'
import { compress } from './helper'
import { ImageSource, TextOptions } from 'react-native-photo-manipulator'
import RNPhotoManipulator from 'react-native-photo-manipulator'
import { ceilWith, div, isFunction, isType, mul, plus } from '@fruits-chain/utils'
import { buildUri } from './helper'

export function getThumbnailImageUrl(url: string = '', width = 80, height = 80) {
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

export function getFileExt(mimeType: string) {
  const typeArr = mimeType.split('.')
  return '.' + typeArr[typeArr.length - 1]
}

export function exec(func: ((...param: any) => any) | undefined, ...params: any[]) {
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
    'video/mp4': require('../images/audio.png'),
    'application/pdf': require('../images/pdf.png'),
    'application/zip': require('../images/zip.png'),
    'text/csv': require('../images/csv.png'),
    'application/msword': require('../images/doc.png'),
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': require('../images/docx.png'),
    'application/vnd.ms-powerpoint': require('../images/ppt.png'),
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': require('../images/pptx.png'),
    'application/vnd.ms-excel': require('../images/xls.png'),
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': require('../images/xlsx.png'),
    '.mp4': require('../images/audio.png'),
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
  return list.map((item) => {
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
export async function compressImageOrVideo(images: Partial<ImageOrVideo>[], shouldCompress?: boolean) {
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

export type WatermarkText = string[] | TextOptions[]

export type GetWatermarkMethod = (size?: ImageSize) => Promise<WatermarkText>

/**
 * 添加图片水印
 * @param image
 * @param watermark
 * @returns
 */
export async function printWatermark(
  image: ImageSource,
  watermark: WatermarkText | GetWatermarkMethod,
  size?: ImageSize,
) {
  const adjustTextSize = size?.height ? ceilWith(size.height * 0.05) : 30
  let rawTexts: WatermarkText
  if (isFunction(rawTexts)) {
    rawTexts = await (watermark as GetWatermarkMethod)(size)
  } else {
    rawTexts = watermark as WatermarkText
  }
  const texts = rawTexts.map((item, index) => {
    if (isType('String')(item)) {
      return {
        position: {
          x: div(adjustTextSize, 2),
          y: plus(div(adjustTextSize, 2), mul(adjustTextSize, index)),
        },
        textSize: adjustTextSize,
        color: '#FFFFFF',
        text: item,
      } as TextOptions
    }
    return item as TextOptions
  })
  return await RNPhotoManipulator.printText(buildUri(image as string), texts)
}
