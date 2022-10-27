import type {AxiosRequestConfig} from 'axios';
import axios from 'axios';

export type RequestOptions = AxiosRequestConfig & {
  url: string;
  body?: any;
  headers?: any;
};

export default async function request<T>(options: RequestOptions) {
  /** options and header config start */
  let headers = {};
  if (options) {
    headers = options.headers || {};
  }
  const defaultOptions = {
    headers: {
      ...headers,
    },
    credentials: 'include',
    timeout: 10000,
    withCredentials: true,
    validateStatus(status: any) {
      return status >= 200 && status < 300; // default
    },
  };
  if (options) {
    delete options.headers;
  }
  const newOptions: RequestOptions = {...defaultOptions, ...options};
  /** options and header config end */
  newOptions.data = newOptions.body; // body到data的映射
  delete newOptions.body;
  return axios
    .request<T>({
      ...newOptions,
    })
    .then(res => {
      return res.data;
    });
}
