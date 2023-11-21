import { plus } from '@fruits-chain/utils'
import type { ReactNativeBlobUtilStat } from 'react-native-blob-util'
import ReactNativeBlobUtil from 'react-native-blob-util'

import { UPLOAD_CACHE_DIR } from './helper'

interface ClearCacheResult {
  status: 'error' | 'done' | 'undo'
  message?: string
  fileCount: number
  fileSize: number
}

export interface CacheDirStat extends ReactNativeBlobUtilStat {
  fileCount: number
  size: number
}

const { fs } = ReactNativeBlobUtil

async function _cacheDirStat(
  traverse: (filePath: string) => Promise<void>,
): Promise<CacheDirStat> {
  const stat = await fs.stat(UPLOAD_CACHE_DIR)
  const result: CacheDirStat = {
    ...stat,
    fileCount: 0,
    size: 0,
  }
  const files = await fs.ls(UPLOAD_CACHE_DIR)
  await Promise.all(
    files.map(async file => {
      const filePath = `${UPLOAD_CACHE_DIR}/${file}`
      const fstat = await fs.stat(filePath)
      result.fileCount = plus(result.fileCount, 1)
      result.size = plus(result.size, fstat.size)
      await traverse(filePath)
    }),
  )
  return result
}

/**
 * 获取缓存文件夹的详细数据
 * @returns
 */
export async function cacheDirStat() {
  return await _cacheDirStat(async () => {})
}

/**
 * 清除文件上传缓存
 * @returns
 */
export async function clearCache() {
  const result: ClearCacheResult = {
    status: 'undo',
    fileCount: 0,
    fileSize: 0,
  }
  try {
    // 1. 检测目录是否存在
    const exist = await fs.exists(UPLOAD_CACHE_DIR)
    if (!exist) {
      result.message = `cache dir ${UPLOAD_CACHE_DIR} not exist`
      return result
    }
    // 2. 获取文件列表
    const files = await fs.ls(UPLOAD_CACHE_DIR)
    if (!files?.length) {
      result.message = `no cache file exist at dir ${UPLOAD_CACHE_DIR}`
      return result
    }
    // 3. 删除文件
    const stat = await _cacheDirStat(async filePath => {
      await fs.unlink(filePath)
    })
    result.fileCount = stat.fileCount
    result.fileSize = stat.size
    result.status = 'done'
  } catch (error) {
    result.status = 'error'
    result.message = error.message
  }
  return result
}
