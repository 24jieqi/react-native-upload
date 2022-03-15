# @fruits-chain/react-native-upload

> 一个图片/视频上传的 React-Native 组件

- 基于[react-native-image-crop-picker](https://github.com/ivpusic/react-native-image-crop-picker)
- 支持图片/视频压缩（Android & iOS）使用[react-native-compressor](https://github.com/Shobbak/react-native-compressor)
- 支持资源多选，支持单个上传失败重试
- 支持多图片预览
- 支持视频预览

## 安装

1. 安装`@fruits-chain/react-native-upload`

```bash
$ yarn add @fruits-chain/react-native-upload
```

2. `iOS`

```bash
cd ios
pod install
```

3. 根据[react-native-image-crop-picker](https://github.com/ivpusic/react-native-image-crop-picker/blob/master/README.md#step-3)进行相关设置

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
    </View>
  )
}
```

### 使用效果如下

<video src="./example.mp4" width="288px" height="640px" controls="controls"></video>

### API

> `？`表示可选参数

| 参数           | 类型                              | 说明                              |
| -------------- | --------------------------------- | --------------------------------- |
| list?          | `IUploadSource`[]                 | 当前上传的文件列表                |
| defaultList?   | `IUploadSource`[]                 | 默认上传的文件列表                |
| onChange?      | (list: `IUploadSource`[]) => void | 上传文件变更/状态变更时调用此方法 |
| onUploadError? | (msg?: any) => void               | 上传出错时的回调                  |
| maxCount?      | number                            | 最大可上传数量                    |
| tipText?       | string                            | 上传提示文本                      |
| mediaType?     | string                            | 支持`photo`、`video`、`any`       |
| multiple?      | boolean                           | 是否支持多选上传                  |
| uploadAction?  | `UploadAction`                    | 上传接口封装的函数                |

```ts
interface IUploadSource {
  key: string // 当前资源的唯一标识
  path?: string // 本地资源路径
  name?: string // 名称
  type?: string // 类型
  status?: 'loading' | 'done' | 'error' // 资源状态
  origin?: FileVO // 远程上传结果
}

type UploadAction = ({ data }: { data: FormData }) => Promise<FileVO>

interface FileVO {
  /** 文件ID */
  fileId?: string

  /** 文件上传时间 */
  fileUploadTime?: string

  /** 文件地址 */
  fileUrl?: string

  /** 文件名称 */
  filename?: string
}
```
