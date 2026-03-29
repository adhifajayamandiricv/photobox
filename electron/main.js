const { app, BrowserWindow } = require("electron")

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,

    // 🔥 FULLSCREEN KIOSK
    fullscreen: true,
    autoHideMenuBar: true,
    frame: false,

    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // 🔥 LOAD NEXT.JS
  mainWindow.loadURL("http://localhost:3000")

  // OPTIONAL: disable devtools
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.key === "F12") {
      event.preventDefault()
    }
  })
}

app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})