import { ImageMediaType, MediaType } from '../interface'

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
