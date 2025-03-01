import { BrowserWindow, ipcMain } from 'electron'

export default (window: BrowserWindow) => {
  console.log('window--->', window)
  ipcMain.on('sip-action', (_, action, phone) => {
    console.log('action--->', action, phone)
  })
}
