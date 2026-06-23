import axios, { type AxiosRequestConfig, type Method } from 'axios'

export const apiBaseUrl = (import.meta.env.VITE_UGS_API_BASE as string) || ''

const apiTimeoutSec = 10

const ajax = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  timeout: apiTimeoutSec * 1000,
})

export async function $http<T = any>(method: Method, url: string, ...payload: any[]): Promise<T> {
  const requestData: AxiosRequestConfig = { url, method }

  if (method == 'get' || method == 'GET') {
    requestData.params = payload[0]
  } else {
    requestData.data = payload[0]
    requestData.params = payload[1]
  }

  try {
    const response = await ajax.request(requestData)
    return response.data
  } catch (err: any) {
    if (err.response) {
      throw err.response
    }
    throw err
  }
}

export function isResponseOK(err: any, result: any, alertError: boolean = false) {
  if (err && !result) {
    console.warn(err, result)
    if (err.status == 401) {
      console.log('未登入')
    }
    if (alertError) {
      const errData = err.data
      let message = ''
      if (typeof errData == 'string') {
        message = errData
      } else {
        message = errData.message
        try {
          Object.values(errData.errors || {}).forEach((e: any) => {
            message += `<br>${e[0]}`
          })
        } catch (err) {
          console.error(err)
        }
      }
      alert(message)
    }
    return false
  }
  return true
}

export function asyncDo<T, E = any>(promise: Promise<T>): Promise<[undefined, T] | [E, undefined]> {
  return promise.then<[undefined, T]>((res) => [undefined, res]).catch((err) => [err, undefined])
}
