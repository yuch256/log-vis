import axios, {AxiosResponse} from 'axios'

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:3000/v2',
  timeout: 200000,
})

interface ServerRes {
  success?: string,
  msg?: string,
}

// 响应拦截器
axiosInstance.interceptors.response.use((response: ServerRes & AxiosResponse) => {
  const {data} = response
  if (data.success) {
    return Promise.resolve(data.data)
  }
  return Promise.reject(response)
}, error => {
  console.error('错误响应', error.response)
  // 这里的错误均为网络错误
  if (error.response) {
    return Promise.reject(error.response)
  }
  return Promise.reject(new Error('请求超时, 请刷新重试'))
})

export const $get = (url: string, params = {}, config = {}) => {
  return new Promise(resolve => {
    axiosInstance({
      method: 'get',
      url,
      params,
      ...config,
    }).then((resData: ServerRes & AxiosResponse) => {
      resolve(resData)
    }).catch(response => {
      if (response && response.status === 401) {
        console.info(response.data.msg, 1)
      } else {
        console.error(response)
      }
    })
  })
}

export const $post = (
  url: string,
  data = {},
  method: 'post' | 'put' = 'post',
  config = {},
) => {
  return new Promise(resolve => {
    axiosInstance({
      method,
      url,
      data,
      ...config,
    }).then((resData: ServerRes & AxiosResponse) => {
      resolve(resData)
    }).catch(response => {
      if (response && response.status === 401) {
        console.info(response.data.msg, 1)
      } else {
        console.error(response.data.msg, 1)
      }
    })
  })
}
