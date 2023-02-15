import { Image } from 'react-native'
import { FileVO, ImageMediaType, MediaType, UploadItem } from '../interface'

export function getThumbnailImageUrl(url: string = '', width = 80, height = 80) {
  if (!url || url.includes('.mp4')) {
    return url
  }
  return `${url}?x-image-process=image/resize,m_fill,h_${height},w_${width}`
}

export function isVideo(mimeType: string) {
  return mimeType.includes('video')
}

export function isValidVideo(mimeType: string) {
  return isVideo(mimeType) && mimeType.includes('mp4')
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
 * 获取imageCropPicker支持的mediaType
 * @param mediaType
 * @returns
 */
export function getImagePickerMediaType(mediaType: MediaType): ImageMediaType {
  if (mediaType === 'any' || (mediaType.includes('photo') && mediaType.includes('video'))) {
    return 'any'
  }
  if (mediaType.includes('photo')) {
    return 'photo'
  }
  return 'video'
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
