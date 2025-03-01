import { BrowserWindow, ipcMain } from 'electron'

export default (window: BrowserWindow) => {
  console.log('window--->', window)
  ipcMain.on('action-event', (_, action, phone) => {
    console.log('action--->', action, phone)
  })
}
