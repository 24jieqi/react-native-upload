import type { UploadItem } from '../../interface'

export interface BasicPreviewProps {
  list?: UploadItem[]
  target: UploadItem // 当前需要预览的资源
  onClose: () => void // 预览框关闭
  onChangeCurrent: (current: UploadItem) => void
}
