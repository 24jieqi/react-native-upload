/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import Upload, {
  FileVO,
  UploadActionParams,
  UploadItem,
} from '@fruits-chain/react-native-upload';
import {
  Card,
  Form,
  NoticeBar,
  Provider,
  Space,
} from '@fruits-chain/react-native-xiaoshu';
import axios from 'axios';
import React, {useState} from 'react';
import {SafeAreaView, ScrollView, StatusBar, Text} from 'react-native';
import PdfViewer from './src/components/pdf-viewer';

export function uploadImage({file}: UploadActionParams): Promise<FileVO> {
  const data = new FormData();
  data.append('file', file);
  return axios
    .request({
      url: 'http://192.168.10.233:3004/_files/upload', // 替换成你的上传地址
      timeout: 0,
      data,
      method: 'post',
      headers: {
        'content-type': 'multipart/form-data',
      },
    })
    .then(res => {
      return res.data;
    });
}

const MainComponent = () => {
  const [files, setFiles] = useState<UploadItem[]>([]);
  function handleUpdateFile(_files: UploadItem[]) {
    if (_files && _files.length) {
      _files[0].deletable = false;
    }
    setFiles(_files);
  }
  return (
    <SafeAreaView style={{backgroundColor: '#eceef1', flex: 1}}>
      <StatusBar barStyle="dark-content" />
      <ScrollView>
        <Form>
          <Space>
            <Card title="基础文件上传">
              <Form.Item name="files" valuePropName="list">
                <Upload uploadAction={uploadImage} />
              </Form.Item>
            </Card>
            <Card title="基础文件上传（自定义可删除）">
              <NoticeBar
                message="上传的第一个文件无法删除"
                style={{marginBottom: 8}}
              />
              <Upload
                uploadAction={uploadImage}
                list={files}
                onChange={handleUpdateFile}
              />
            </Card>
            <Card title="自定义PDF预览">
              <Form.Item name="document" valuePropName="list">
                <Upload
                  uploadAction={uploadImage}
                  mediaType="document"
                  customPreview={{pdf: PdfViewer}}
                />
              </Form.Item>
            </Card>
            <Card title="视频上传">
              <Form.Item name="videos" valuePropName="list">
                <Upload
                  uploadAction={uploadImage}
                  tipText="视频"
                  mediaType="video"
                />
              </Form.Item>
            </Card>
            <Card title="自定义上传">
              <Upload.Wrapper
                list={files}
                uploadAction={uploadImage}
                onChange={list => {
                  setFiles(list);
                }}>
                <Text style={{padding: 4, color: '#0065fe'}}>点击上传</Text>
              </Upload.Wrapper>
              {files.map(item => {
                return (
                  <Text key={item.key}>fileUrl: {item.origin?.fileUrl}</Text>
                );
              })}
            </Card>
            <Card title="图片查看">
              <Upload.Preview
                list={[
                  {
                    filename: 'xx.png',
                    fileUrl:
                      'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
                  },
                  {
                    filename: 'xx.png',
                    fileUrl:
                      'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
                  },
                ]}
              />
            </Card>
          </Space>
        </Form>
      </ScrollView>
    </SafeAreaView>
  );
};

const App = () => (
  <Provider>
    <MainComponent />
  </Provider>
);

export default App;
