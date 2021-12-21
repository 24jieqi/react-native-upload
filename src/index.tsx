import React, { useRef, useState } from 'react'
import { Flex, Modal } from '@fruits-chain/react-native'
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native'
import Divider from './components/divider'
import UploadInternal, { OverrideOptions, UploadInstance, UploadProps, IUploadSource } from './_internal'
import UploadPreview from './Preview'

export interface ISource extends IUploadSource {}

interface IUpload extends React.FC<Omit<UploadProps, 'useCamera' | 'onPressAdd'>> {
  Preview: typeof UploadPreview
}

const Upload: IUpload = (props) => {
  const [visible, setVisible] = useState(false)
  const upload = useRef<UploadInstance>(null)
  function handleCancel() {
    setVisible(false)
  }
  function handlePressAdd() {
    setVisible(true)
  }
  function handleOpen(config?: OverrideOptions) {
    upload.current.open(config)
    setVisible(false)
  }
  return (
    <>
      <UploadInternal {...props} ref={upload} onPressAdd={handlePressAdd} />
      <Modal visible={visible} popup animationType="slide-up" onClose={handleCancel}>
        <View>
          <TouchableOpacity onPress={() => handleOpen({ useCamera: true, multiple: false })}>
            <Flex justify="center">
              <Text style={styles.text}>拍摄照片</Text>
            </Flex>
          </TouchableOpacity>
          <Divider />
          {props.mediaType === 'photo' ? null : (
            <>
              <TouchableOpacity onPress={() => handleOpen({ useCamera: true, multiple: false, mediaType: 'video' })}>
                <Flex justify="center">
                  <Text style={styles.text}>拍摄视频</Text>
                </Flex>
              </TouchableOpacity>
              <Divider />
            </>
          )}
          <TouchableOpacity onPress={() => handleOpen({ useCamera: false })}>
            <Flex justify="center">
              <Text style={styles.text}>相册选择</Text>
            </Flex>
          </TouchableOpacity>
          <View>
            <View style={styles.dividerBar} />
            <TouchableOpacity onPress={handleCancel}>
              <Flex justify="center">
                <Text style={styles.text}>取消</Text>
              </Flex>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  )
}

Upload.Preview = UploadPreview
Upload.displayName = 'Upload'

export default Upload

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
    lineHeight: 18,
    paddingVertical: 16,
    color: '#0065FE',
  },
  dividerBar: {
    height: 7,
    backgroundColor: '#E7E7ED',
  },
})
