import { parse } from 'qs'

export const parseSipUrl = (url: string) => {
  return parse(url.split('sip://')[1])
}
