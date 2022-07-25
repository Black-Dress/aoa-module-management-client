"use strict";

import { app, protocol, BrowserWindow, ipcMain, Notification } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer";
import { mkdir, readdir, readdirSync, readFile, writeFile } from "original-fs";

const isDevelopment = process.env.NODE_ENV !== "production";
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 750,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }
  // Menu.setApplicationMenu(null)
}

app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  //注册事件
  ipcMain.on("read", readHandle);
  ipcMain.on("write", writeHandle);
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
// 处理函数
// 读文件
function readHandle(event, arg) {
  switch (arg[0]) {
    case "mqtt":
      readFile("./src/config/mqtt.json", (err, data) =>
        event.sender.send("mqtt", JSON.parse(data))
      );
      break;
    case "station":
      readFile("./src/config/station.json", (err, data) =>
        event.sender.send("station", JSON.parse(data))
      );
      break;
    // 读取数据文件
    case "data":
      readdir("./src/data", (err, files) => {
        if (err) console.log(err);
        else console.log(files);
      });
      break;
  }
}
// 写文件
function writeHandle(event, arg) {
  switch (arg[0]) {
    case "mqtt":
      writeFile("./src/config/mqtt.json", arg[1], () => {});
      break;
    case "station":
      writeFile("./src/config/station.json", arg[1], () => {});
      break;
    case "data":
      write("./src/data/" + arg[1], arg[2], (err) => {
        const message = { title: "file", body: "save success" };
        if (err) {
          new Notification({ title: "error", body: err.toString() }).show();
          return;
        }
        new Notification(message).show();
      });
      break;
  }
}
// 写文件，自动创建文件
function write(path, buffer, callback) {
  let last_path = path.substring(0, path.lastIndexOf("/"));
  mkdir(last_path, { recursive: true }, (err) => {
    if (err) return callback(err);
    writeFile(path, buffer, callback);
  });
}
//TODO 递归读取文件，并且读取文件信息
function readFileList(dir, fileList) {
  const files = readdirSync(dir);
  console.log(files);
}
