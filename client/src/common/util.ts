/* eslint-disable no-bitwise */
/* eslint-disable no-multi-assign */
// import * as Clipboard from 'clipboard'
import queryString from 'query-string'

// 随机字符串字符集
const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'

// 创建随机字符串
export function random(n = 6) {
  let string = ''
  for (let i = 0; i < n; i++) {
    string += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return string
}

export function uuid() {
  const s = []
  const hexDigits = '0123456789abcdef'
  for (let i = 0; i < 32; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr(((Number(s[19]) || 0) & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-'
  const str = s.join('')
  return str
}

// 复制到粘贴板
// export const copy = (v: any) => {
//   const div = document.createElement('div')
//   const copyLink = new Clipboard(div, {text: () => v})
//   copyLink.on('success', () => console.log('复制成功'))
//   div.click()
// }

/**
 * 是个有效值
 * @param v
 */
export function isDef(v: any) {
  return v !== undefined && v !== null
}

export function isBoolean(v: any) {
  return typeof v === 'boolean'
}

export function isString(v: any) {
  return typeof v === 'string'
}

export function isFunction(v: any) {
  return typeof v === 'function'
}

export function isNumber(v: any) {
  return typeof v === 'number'
}

export function isWindow(v: any) {
  return v !== null && v === v.window
}

export function isObject(v: any) {
  return typeof v === 'object' && v !== null
}

// 判断是否开发环境
export const isDev = process.env.NODE_ENV === 'dev'

// 参考了zepto
export function isPlainObject(v: any) {
  return v !== null && isObject(v) && !isWindow(v) && Object.getPrototypeOf(v) === Object.prototype
}

export function isEmptyObject(v: any) {
  return Object.keys(v).length === 0
}

export function isArray(v: any) {
  return Object.prototype.toString.call(v) === '[object Array]'
}

export const getUrlQuery = (key: string) => {
  const queries = queryString.parse(window.location.search)
  return isDef(key) ? queries[key] : queries
}
