import { UploadItem } from '../interface'

export interface BasicPreviewProps {
  list?: UploadItem[]
  uri: string // 预览资源地址
  onClose: () => void // 预览框关闭
  onChangeCurrent: (current: UploadItem) => void
}
