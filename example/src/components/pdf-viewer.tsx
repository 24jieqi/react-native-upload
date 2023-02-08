import React from 'react';
import {StyleSheet} from 'react-native';
import Pdf from 'react-native-pdf';

interface PdfViewerProps {
  uri: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({uri}) => {
  return <Pdf style={styles.pdf} source={{uri, cache: true}} />;
};

const styles = StyleSheet.create({
  pdf: {
    width: '100%',
    height: '100%',
    minHeight: 1, // android兼容
  },
});

export default PdfViewer;
