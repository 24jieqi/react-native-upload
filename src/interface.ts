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
}
