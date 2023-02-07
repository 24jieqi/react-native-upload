# @fruits-chain/react-native-upload

> 一个图片/视频上传的 React-Native 组件

- 基于[react-native-image-crop-picker](https://github.com/ivpusic/react-native-image-crop-picker)
- 支持图片/视频压缩（Android & iOS）使用[react-native-compressor](https://github.com/Shobbak/react-native-compressor)
- 支持资源多选，支持上传失败重试
- 支持断点续传
- 支持多图片&视频预览
- 可单独作为图片&视频的预览组件使用
- 自定义上传 UI

## 安装

1. 安装 `@fruits-chain/react-native-upload`

```bash
$ yarn add @fruits-chain/react-native-upload
```

2. 安装依赖库

   \*[react-native-blob-util](https://github.com/RonRadtke/react-native-blob-util) 基础文件操作

   [react-native-fs](https://github.com/itinance/react-native-fs) 文件操作（计算 hash 值）

   [react-native-compressor](https://github.com/Shobbak/react-native-compressor) 图片&视频压缩

   \*[react-native-image-crop-picker](https://github.com/ivpusic/react-native-image-crop-picker) 图片&视频拍摄、选择

   [react-native-video](https://github.com/react-native-video/react-native-video) 视频播放组件

   [react-native-fast-image](https://github.com/DylanVann/react-native-fast-image) 高效图片组件

   ⭐️[@fruits-chain/react-native-xiaoshu](https://github.com/hjfruit/react-native-xiaoshu) RN 基础组件库，提供模式选择器和图片列表渲染等组件

3. 根据依赖库指引进行设置，带“\*”的表示需要设置配置权限

## 使用

```js
import React, { Component } from 'react'
import { render } from 'react-dom'
import Upload from '@fruits-chain/react-native-upload'
const UploadPage: React.FC = () => {
  const [images, setImages] = useState([])
  return (
    <View>
      <Upload uploadAction={...} tipText={langs.picsAndVideo} maxCount={10} list={images} onChange={(val) => setImages(val)} />
      <Upload.Preview list={images} />
      // tip: 使用`Upload.Wrapper`的方式不会渲染默认操作UI，可进行自定义显示
      <Upload.Wrapper uploadAction={...} tipText={langs.picsAndVideo} maxCount={10} list={images} onChange={(val) => setImages(val)} >
        <Text>上传文件</Text>
      </Upload.Wrapper>
      <View>
        {
          images.map(image => ...)
        }
      </View>
    </View>
  )
}
```

### 屏幕截图

<div style="display: flex; flex-wrap: no-wrap">
  <img alt="默认" src="./case-1.png" width=200 height=433 />
  <img alt="模式选择" src="./case-2.png" width=200 height=433 />
  <img alt="包含照片" src="./case-3.png" width=200 height=433/>
  <img alt="图片预览" src="./case-4.png" width=200 height=433 />
</div>

### 可运行的 Demo

见[example](./example)目录

> 注意：正常运行前需要使用各自的上传接口

## API

> `？`表示可选参数

| 参数            | 类型                                                           | 说明                                                                         | 默认值 | 版本  |
| --------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------ | ----- |
| list?           | `IUploadSource`[]                                              | 当前上传的文件列表                                                           | -      | -     |
| defaultList?    | `IUploadSource`[]                                              | 默认上传的文件列表                                                           | []     | -     |
| onChange?       | (list:`IUploadSource`[]) => void                               | 上传文件变更/状态变更时调用此方法                                            | -      | -     |
| onUploadError?  | (msg?: any) => void                                            | 上传出错时的回调                                                             | -      | -     |
| maxCount?       | number                                                         | 最大可上传数量                                                               | 10     | -     |
| tipText?        | string                                                         | 上传提示文本                                                                 | -      | -     |
| mediaType?      | string                                                         | 支持 `photo`、`video`、`any`                                                 | `any`  | -     |
| multiple?       | boolean                                                        | 是否支持多选上传                                                             | true   | -     |
| uploadAction?   | `UploadAction`                                                 | 上传接口封装的函数                                                           | -      | -     |
| cropping?       | boolean                                                        | 是否进行裁剪                                                                 | false  | -     |
| width?          | number                                                         | cropping 模式下选取图片的宽度                                                | 300    | -     |
| height?         | number                                                         | cropping 模式下选取图片的高度                                                | 300    | -     |
| allowResume?    | `boolean or number`                                            | 是否支持续传（传入 `number`时表示只有压缩后大于 `number`字节的文件会开启续传 | false  | 1.2.0 |
| progressAction? | (fileHash: string) => Promise<{fileUrl: string; size: number}> | 获取上传当前图片上传进度                                                     | -      | 1.2.0 |
| compress?       | boolean                                                        | 是否开启压缩                                                                 | true   | 1.2.0 |
| showUi?         | boolean                                                        | 是否显示 UI                                                                  | true   | 1.3.0 |

```ts
interface UploadItem {
  key: string // 当前资源的唯一标识
  path?: string // 本地资源路径
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
  /**
   * 当前文件是否需要断点续传
   */
  resume?: boolean
  /**
   * 是否可删除
   * @default true
   */
  deletable?: boolean
}

export type UploadAction = ({ data, file }: UploadActionParams) => Promise<FileVO>

interface FileVO {
  /** 文件ID */
  fileId?: string

  /** 文件上传时间戳 */
  fileUploadTime?: number

  /** 文件地址 */
  fileUrl?: string

  /** 文件名称 */
  filename?: string
}
```
