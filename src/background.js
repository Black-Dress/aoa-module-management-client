/* eslint-disable no-constant-condition */
"use strict";

import { app, protocol, BrowserWindow, ipcMain, Notification } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer";
import { mkdir, readdirSync, readFile, rm, statSync, writeFile } from "original-fs";
const isDevelopment = process.env.NODE_ENV !== "production";
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: "app", privileges: { secure: true, standard: true } }]);
async function createWindow() {
  const win = new BrowserWindow({
    width: 1300,
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

// 项目结束
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
      // await installExtension(VUEJS3_DEVTOOLS);
      // await installExtension({ id: "ljjemllljcmogpfapbkkighbhhppjdbg", electron: ">=1.2.1" });
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  //注册事件
  ipcMain.on("read", readHandle);
  ipcMain.on("write", writeHandle);
  ipcMain.on("delete", deleteHandle);
  ipcMain.on("start_serve", start_serve_handle);
  createWindow();
  // 启动项目的时候启动服务
  start_mosquitto();
});
// 程序退出前工作
app.on("before-quit", async () => {
  end("mosquitto", "1228");
  end("aoa_locator", "1228");
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
      readFile("./src/config/mqtt.json", (err, data) => event.sender.send("mqtt", JSON.parse(data)));
      break;
    case "stations":
      readFile("./src/config/stations.json", (err, data) => event.sender.send("stations", JSON.parse(data)));
      break;
    // 读取数据文件目录
    case "data": {
      let list = [];
      readFileList("./src/data", [], list);
      event.sender.send("data", list);
      break;
    }
    // 读数据文件细节
    case "data_detail":
      readFile(arg[1], (err, data) => {
        if (err) new Notification({ title: "file", body: "read file error" });
        else event.sender.send("data_details", data.buffer.byteLength != 0 ? JSON.parse(data) : {});
      });
      break;
    // 读取tag文件
    case "tags":
      readFile("./src/config/tags.json", (err, data) => event.sender.send("tags", JSON.parse(data)));
      break;
  }
}
// 写文件
function writeHandle(event, arg) {
  switch (arg[0]) {
    case "mqtt":
      writeFile("./src/config/mqtt.json", arg[1], () => {});
      break;
    case "stations":
      writeFile("./src/config/stations.json", arg[1], () => {});
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
    case "tags":
      write("./src/config/tags.json", arg[1], () => {});
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
// 删除文件
function deleteHandle(event, arg) {
  switch (arg[0]) {
    case "data":
      rm(arg[1], () => {
        new Notification({ title: "file", body: "delete success" }).show();
      });
      break;
  }
}
// 读取数据文件
function readFileList(dir, res, list) {
  const state = statSync(dir);
  if (!state.isDirectory()) {
    const a = dir.split("/");
    const item = {
      name: dir.slice(dir.lastIndexOf("/") + 1),
      size: state.size,
      time: state.ctime.toLocaleDateString(),
      path: dir,
      station: a[a.length - 2],
    };
    list.push(item);
    return item;
  }
  const files = readdirSync(dir);
  for (let index = 0; index < files.length; index++) {
    const element = files[index];
    res.push(readFileList(`${dir}/${element}`, [], list));
  }
  return res;
}
// 启动服务
function start_serve_handle(event, arg) {
  const res = start_locator(arg[1]);
  new Notification({ title: "start locator", body: res }).show();
}
// 启动mqtt
function start_mosquitto() {
  const exec = require("child_process").exec;
  const iconv = require("iconv-lite");
  var cmd = process.platform == "win32" ? ".\\mosquitto\\mosquitto.exe -c .\\mosquitto\\mosquitto.conf" : "mosquitto -c ./mosquitto/mosquitto.conf";
  // 启动mqtt
  exec(cmd, { encoding: "buffer" }, function (err, std, stderr) {
    if (err) console.log(iconv.decode(stderr, "cp936"));
    else console.log(iconv.decode(std, "cp936"));
  });
}
// 启动locator
function start_locator(ip) {
  const es = require("child_process").execSync;
  var cmd = `.\\aoa_locator\\exe\\aoa_locator.exe -t ${ip}`;
  return es(cmd).toString();
}
// 结束进程 name
function end(name, root_password) {
  const es = require("child_process").execSync;
  var cmd = process.platform == "win32" ? `tasklist | findstr ${name}` : `ps -aux | grep ${name}| grep -v grep`;
  var res = es(cmd).toString().split("\n");
  for (let index = 0; index < res.length; index++) {
    const element = res[index];
    if (element == undefined || element == "") continue;
    const pid = element.trim().split(/\s+/)[1];
    var cmd_kill = process.platform == "win32" ? `taskkill /pid ${pid} -f` : `echo ${root_password} | sudo kill ${pid}`;
    es(cmd_kill);
  }
}
