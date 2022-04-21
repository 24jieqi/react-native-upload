import ReactNativeBlobUtil from 'react-native-blob-util'
import { buildCachePath, buildUri, normalizePath } from './utils/helper'
import { IUploadTempSource, UploadItem } from './interface'
import { UploadAction } from './_internal'
import { getFileExt } from './utils'

const { fs } = ReactNativeBlobUtil
interface UploadResumeProps {
  allowResume?: boolean | number
  uploadAction?: UploadAction
  progressAction?: (fileHash: string) => Promise<{
    fileUrl: string
    size: number
  }>
}

let keyIndex = 1

export function getFileKey() {
  return `_upload_v2-${Date.now()}-${keyIndex++}`
}

function fileShouldResume(size: number, allowResume: number | boolean) {
  if (typeof allowResume === 'boolean') {
    return allowResume
  }
  return size > (allowResume as number)
}

const useUploadResume = ({ progressAction, uploadAction, allowResume = false }: UploadResumeProps) => {
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
      uploadedInfo = await progressAction(`${file.hash}${getFileExt(file.name)}`)
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
        fileUploadTime: '',
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
    file.sliceUri = buildUri(buildCachePath(`_${file.name}`))
    file.status = 'loading'
    await fs.slice(file.uri, file.sliceUri, file.offset, file.size)
    return file
  }
  async function uploadFile(file: UploadItem) {
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
