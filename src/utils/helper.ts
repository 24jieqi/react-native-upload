import { isDef } from '@fruits-chain/utils'
import ReactNativeBlobUtil from 'react-native-blob-util'
import { Image, Video } from 'react-native-compressor'
import type { DocumentPickerResponse } from 'react-native-document-picker'
import * as RNFS from 'react-native-fs'

import type { IUploadTempSource } from '../interface'

// path 是指 / 开头的文件路径
// uri 是指 file:// 开头的文件路径

const { fs } = ReactNativeBlobUtil

export const isImage = (t: string) => /image/.test(t)

let cacheDirExist: boolean

/**
 * 文件上传的压缩文件缓存目录
 */
export const UPLOAD_CACHE_DIR = `${fs.dirs.CacheDir}/upload`

export const buildCachePath = async (filename: string) => {
  const path = `${UPLOAD_CACHE_DIR}/${filename}`
  // 初始化检查一次
  if (!isDef(cacheDirExist)) {
    cacheDirExist = await fs.exists(UPLOAD_CACHE_DIR)
  }
  if (!cacheDirExist) {
    await fs.mkdir(UPLOAD_CACHE_DIR)
    cacheDirExist = true
  }
  return path
}

export const buildUri = (p: string) =>
  /^file:\/\//.test(p) ? p : `file://${p}`

export const normalizePath = (p: string) =>
  decodeURIComponent((p || '').replace(/^file:\/\//, ''))

const getMiniFilename = (filename: string) => {
  const filenames = filename.split('.')
  filenames.splice(-1, 0, 'mini')
  let newUrl = filenames.join('.')
  return newUrl
}

/**
 * 文件压缩
 * @param filePath 原始文件路径
 * @param clear 压缩完成后是否删除缓存
 * @param compressorFile 特定类型文件压缩动作
 * @returns
 */
const compressorAction = async (
  filePath: string,
  clear: boolean,
  compressorFile: () => Promise<string>,
) => {
  const _path = normalizePath(filePath)
  const hasFile = await fs.exists(_path)

  if (!hasFile) {
    throw `文件不存在 ${filePath}`
  }

  const originalInfo = await fs.stat(_path)
  const miniFilename = getMiniFilename(originalInfo.filename)
  const miniFilePath = await buildCachePath(miniFilename)
  const miniFileUri = buildUri(miniFilePath)
  // 是否已经压缩了
  const hasMiniFile = await fs.exists(miniFilePath)

  if (hasMiniFile) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('文件已压缩')
    }
    return miniFileUri
  }

  // 压缩
  const miniFileTmpPath = await compressorFile()
  // 移动文件
  await RNFS.moveFile(normalizePath(miniFileTmpPath), miniFilePath)
  if (__DEV__) {
    // 开发环境打印一些压缩数据
    const miniInfo = await fs.stat(miniFilePath)
    // eslint-disable-next-line no-console
    console.log(`
      原文件大小 => ${originalInfo.size}\n
      压缩后 => ${miniInfo.size}\n
      压缩后占比 => ${(miniInfo.size / originalInfo.size) * 100}%\n
      原文件地址 => ${originalInfo.path}\n
      压缩后地址 => ${miniFilePath}
    `)
  }

  if (clear) {
    fs.unlink(_path)
  }

  return miniFileUri
}

export const compressorImage = async (filePath: string, clear: boolean) => {
  return compressorAction(filePath, clear, () =>
    Image.compress(filePath, {
      compressionMethod: 'auto',
    }),
  )
}

export const compressorVideo = (filePath: string, clear: boolean) => {
  return compressorAction(filePath, clear, () =>
    Video.compress(filePath, {
      compressionMethod: 'auto',
    }),
  )
}

/**
 * 文档选择器文件另存操作
 * @param param0
 * @returns
 */
export const getResolvedPath = async ({
  uri,
  name,
  type,
}: DocumentPickerResponse): Promise<IUploadTempSource> => {
  const base64 = await fs.readFile(uri, 'base64')
  const path = await buildCachePath(name)
  await fs.writeFile(path, base64, 'base64')
  return { uri: `file://${path}`, name, type }
}

/**
 * 图片视频压缩
 * @param uri
 * @param type
 * @returns
 */
export async function compress(uri: string, type: string) {
  try {
    if (type.includes('video')) {
      return await compressorVideo(uri, true)
    } else {
      return await compressorImage(uri, true)
    }
  } catch (error) {}
}
