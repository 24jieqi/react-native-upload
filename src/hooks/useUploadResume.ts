import ReactNativeBlobUtil from 'react-native-blob-util'

import type { UploadAction } from '../_internal'
import type { IUploadTempSource, UploadItem } from '../interface'
import {
  getDocumentPlaceholderIconByMimeType,
  getFileExt,
  getFileKey,
} from '../utils'
import { buildCachePath, buildUri, normalizePath } from '../utils/helper'

const { fs } = ReactNativeBlobUtil
interface UploadResumeProps {
  allowResume?: boolean | number
  uploadAction?: UploadAction
  progressAction?: (fileHash: string) => Promise<{
    fileUrl: string
    size: number
  }>
}

function fileShouldResume(size: number, allowResume: number | boolean) {
  if (typeof allowResume === 'boolean') {
    return allowResume
  }
  return size > (allowResume as number)
}

const useUploadResume = ({
  progressAction,
  uploadAction,
  allowResume = false,
}: UploadResumeProps) => {
  async function getFileBeforeUpload(f: IUploadTempSource) {
    const file: UploadItem = {
      key: getFileKey(),
      uri: f.uri,
      filepath: f.uri,
      type: f.type,
    }
    const filePath = normalizePath(file.uri)
    const fileInfo = await fs.stat(filePath)
    file.size = fileInfo.size
    file.resume = fileShouldResume(file.size, allowResume)
    file.name = fileInfo.filename
    file.hash = await fs.hash(filePath, 'sha256')
    let uploadedInfo: {
      fileUrl: string
      size: number
    }
    // 请求上传进度，如果请求失败，则当作新文件重新上传
    try {
      uploadedInfo = await progressAction(
        `${file.hash}${getFileExt(file.name)}`,
      )
    } catch (error) {
      uploadedInfo = {
        fileUrl: '',
        size: 0,
      }
    }
    file.offset = uploadedInfo.size
    // 远程文件已存在，直接上传成功
    if (file.size === file.offset) {
      file.status = 'done'
      file.origin = {
        fileId: file.hash,
        fileUploadTime: null,
        filename: file.name,
        fileUrl: uploadedInfo.fileUrl,
      }
      return file
    }
    // 文件未上传或者不满足断点续传的条件
    if (file.offset === 0 || !file.resume) {
      file.sliceUri = f.uri
      file.status = 'loading'
      return file
    }
    // 需要断点续传
    file.sliceUri = buildUri(
      await buildCachePath(`_${file.offset}_${file.name}`),
    )
    file.status = 'loading'
    await fs.slice(file.uri, file.sliceUri, file.offset, file.size)
    return file
  }
  async function uploadFile(file: UploadItem, backUpload: boolean) {
    if (file.status && file.status === 'done') {
      return file
    }
    const data = new FormData()
    const fileObj: any = {
      uri: file.sliceUri,
      name: file.name,
      type: file.type,
    }
    data.append(`${file.hash}.${file.size}.${file.offset}`, fileObj)
    file.previewPath = file.filepath
    const placeholderIcon = getDocumentPlaceholderIconByMimeType(file.type)
    // 把本地资源路径拷贝至previewPath用于预览，使用placeholderIcon替换本地资源路径展示缩略图
    if (placeholderIcon) {
      file.filepath = placeholderIcon
    }
    if (backUpload) return file
    try {
      const res = await uploadAction({
        data,
        file: fileObj,
        resume: file.resume,
      })
      file.status = 'done'
      file.origin = res
      return file
    } catch (error) {
      file.status = 'error'
      return file
    }
  }
  return {
    getFileBeforeUpload,
    uploadFile,
  }
}

export default useUploadResume
