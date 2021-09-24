declare module '*.png'

declare module 'react-native-video-helper' {
  interface ICompressConfig {
    startTime: number
    endTime: number
    quality: 'low' | 'medium' | 'high'
    defaultOrientation: number
  }
  export function compress(uri: string, config: Partial<ICompressConfig>): Promise<string>
}
