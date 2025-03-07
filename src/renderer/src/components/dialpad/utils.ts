export const checkRouteIsMyCall = () => {
  const { pathname } = window.location
  return pathname === '/agent-my-call'
}
