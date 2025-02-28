import md5 from 'blueimp-md5'
import { sortBy, isNil } from 'lodash-es'

export function getNonce() {
  return String(Math.round(Math.random() * 99999999))
}

export function getTimestamp() {
  return String(Math.round(Date.now() / 1000))
}

export function getMd5Sign(data: object, key: string): string {
  const payload = data_processing(data) + key?.trim()
  return md5(payload)
}

function data_processing(params: object) {
  const items = sortBy(Object.entries(params))
  const query_str = items
    .map(([k, v]) => {
      if (isNil(v)) {
        v = ''
      }
      return `${k}=${v}`
    })
    .join('&')
  return query_str
}
