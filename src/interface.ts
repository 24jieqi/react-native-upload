export interface FileVO {
  /** 文件ID */
  fileId?: string

  /** 文件上传时间 */
  fileUploadTime?: string

  /** 文件地址 */
  fileUrl?: string

  /** 文件名称 */
  filename?: string
}

export interface UploadItem {
  key: string // 当前资源的唯一标识
  filepath: string // 本地资源路径
  name?: string // 名称
  type?: string // 类型
  status?: 'loading' | 'done' | 'error' // 资源状态
  origin?: FileVO // 远程上传结果
  /**
   * 本地文件资源路径
   */
  uri?: string
  /**
   * 切分后的文件资源路径
   */
  sliceUri?: string
  /**
   * 文件大小
   */
  size?: number
  /**
   * 文件hash值
   */
  hash?: string
  /**
   * 当次文件偏移
   */
  offset?: number
}

export interface IUploadTempSource {
  uri: string
  name: string
  type: string
}
