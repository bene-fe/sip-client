export const useCheckRouteIsMyCall = () => {
  const { pathname } = window.location
  return pathname === '/agent-my-call'
}
