import {UploadItem} from '@fruits-chain/react-native-upload';
import React from 'react';
import {StyleSheet} from 'react-native';
import Pdf from 'react-native-pdf';

interface PdfViewerProps {
  target: UploadItem;
}

const PdfViewer: React.FC<PdfViewerProps> = ({target}) => {
  return (
    <Pdf style={styles.pdf} source={{uri: target.previewPath, cache: true}} />
  );
};

const styles = StyleSheet.create({
  pdf: {
    width: '100%',
    height: '100%',
    minHeight: 1, // android兼容
  },
});

export default PdfViewer;
