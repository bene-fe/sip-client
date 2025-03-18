import { app, shell, BrowserWindow, Menu, Tray, nativeImage } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { sipAction } from './action/sip-schema-action'
import { utilsAction } from './action/utils-schema-aciton'
import actionListener from './action/index'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 850,
    show: false,
    autoHideMenuBar: true,
    icon,
    webPreferences: {
      webSecurity: false,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      allowRunningInsecureContent: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    if (import.meta.env.DEV) {
      mainWindow.webContents.openDevTools()
    }
  })

  mainWindow.on('close', (e: any) => {
    mainWindow.hide()
    e.preventDefault()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  Menu.setApplicationMenu(null)

  // vire tray content and icon
  const tray = new Tray(nativeImage.createFromPath(icon).resize({ width: 16, height: 16 }))
  tray.setToolTip('dcs ai client')
  tray.on('double-click', () => {
    mainWindow.show()
  })
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'show',
      type: 'normal',
      click: (): void => mainWindow.show()
    },
    {
      label: 'exit',
      type: 'normal',
      click: (): void => {
        app.exit()
      }
    }
  ])
  tray.setContextMenu(contextMenu)

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.setAsDefaultProtocolClient('sip')
  app.on('open-url', (_, url) => {
    if (url.includes('action=call')) {
      sipAction(BrowserWindow.getAllWindows()[0].webContents, url)
    }

    if (url.includes('action=login')) {
      utilsAction(BrowserWindow.getAllWindows()[0].webContents, url)
    }
  })

  // for windows system
  app.on('second-instance', () => {
    if (BrowserWindow.getAllWindows()[0]) {
      if (BrowserWindow.getAllWindows()[0].isMinimized()) BrowserWindow.getAllWindows()[0].restore()
      BrowserWindow.getAllWindows()[0].focus()
    }
  })

  // IPC Action Listenner
  actionListener(BrowserWindow.getAllWindows()[0])

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
