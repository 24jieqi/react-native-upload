# react-native-upload2

> 一个图片/视频上传的 React-Native 组件

- 基于[react-native-image-crop-picker](https://github.com/ivpusic/react-native-image-crop-picker)
- 支持图片/视频压缩（Android & iOS）
- 支持资源多选，支持单个上传失败重试
- 支持多图片预览
- 支持视频预览

## 安装

1. 安装`react-native-upload2`

```bash
$ yarn add react-native-upload2
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
import Upload from 'react-native-upload2'
const UploadPage: React.FC = () => {
  const [images, setImages] = useState([])
  return (
    <View>
      <Upload tipText={langs.picsAndVideo} maxCount={10} list={images} onChange={(val) => setImages(val)} />
      <Upload.Preview list={images} />
    </View>
  )
}
```
