export const parseSipUrl = (url: string): {
  protocol: string,
  user: string,
  host: string,
  port: string,
  params: string,
} => {
  const [protocol, user, host, port, params] = url.split(':')
  return {
    protocol,
    user,
    host,
    port,
    params,
  }
}
