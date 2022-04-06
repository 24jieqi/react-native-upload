// eslint-disable-next-line import/no-named-as-default,import/namespace,import/no-named-as-default-member
import ReactNativeBlobUtil from 'react-native-blob-util'
import { Image, Video } from 'react-native-compressor'

// path 是指 / 开头的文件路径
// uri 是指 file:// 开头的文件路径

const { fs } = ReactNativeBlobUtil

export const isImage = (t: string) => /image/.test(t)

export const buildCachePath = (filename: string) => `${fs.dirs.CacheDir}/${filename}`

const getFileExtension = (filename: string) => {
  // eslint-disable-next-line no-bitwise
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
}

export const buildUri = (p: string) => (/^file:\/\//.test(p) ? p : `file://${p}`)

export const normalizePath = (p: string) => (p || '').replace(/^file:\/\//, '')

const getMiniFilename = (filename: string) => {
  const filenames = filename.split('.')

  filenames.splice(-1, 0, 'mini').join('.')

  return filenames.join('.')
}

export const copyFile = async (filePath: string) => {
  const _path = normalizePath(filePath)
  const fileHash = await fs.hash(_path, 'sha256')
  const extension = getFileExtension(filePath)
  const toFilePath = buildCachePath([fileHash, extension].join('.'))
  const toFileUri = buildUri(toFilePath)

  const hasCopyFile = await fs.exists(toFilePath)
  if (hasCopyFile) {
    return toFileUri
  }

  console.log('filePath => ', filePath)
  console.log('toFileUri => ', toFileUri)

  const v1 = await fs.exists(filePath)
  console.log('v1  => ', v1)
  const v2 = await fs.exists(toFileUri)
  console.log('v2  => ', v2)

  const copied = await fs.cp(filePath, toFileUri)
  if (!copied) {
    throw '复制失败'
  }

  if (__DEV__) {
    console.log('完成 cp')
  }

  return toFileUri
}

const compressorAction = async (filePath: string, removeOriginal: boolean, compressorFile: () => Promise<string>) => {
  const _path = normalizePath(filePath)
  const hasFile = await fs.exists(_path)

  if (!hasFile) {
    throw `文件不存在 ${filePath}`
  }

  const originalInfo = await fs.stat(_path)
  const miniFilename = getMiniFilename(originalInfo.filename)
  const miniFilePath = buildCachePath(miniFilename)
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
  await fs.mv(normalizePath(miniFileTmpPath), miniFilePath)

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

  if (removeOriginal) {
    fs.unlink(_path)
  }

  return miniFileUri
}

export const compressorImage = async (filePath: string, removeOriginal: boolean) => {
  const _path = normalizePath(filePath)
  const hasFile = await fs.exists(_path)

  if (!hasFile) {
    throw `文件不存在 ${filePath}`
  }

  const originalInfo = await fs.stat(_path)
  const miniFilename = getMiniFilename(originalInfo.filename)
  const miniFilePath = buildCachePath(miniFilename)
  const miniFileUri = buildUri(miniFilePath)

  // 是否已经压缩了
  const hasMiniFile = await fs.exists(miniFilePath)

  if (hasMiniFile) {
    return miniFileUri
  }

  // 压缩
  const miniFileTmpPath = await Image.compress(filePath, {
    compressionMethod: 'auto',
  })
  // 移动文件
  await fs.mv(normalizePath(miniFileTmpPath), miniFilePath)

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

  if (removeOriginal) {
    fs.unlink(_path)
  }

  return miniFileUri
}

export const compressorVideo = (filePath: string, removeOriginal: boolean) => {
  return compressorAction(filePath, removeOriginal, () =>
    Video.compress(filePath, {
      compressionMethod: 'auto',
    }),
  )
}
