/* eslint-disable no-constant-condition */
"use strict";

import {app, BrowserWindow, ipcMain, Notification, protocol} from "electron";
import {createProtocol} from "vue-cli-plugin-electron-builder/lib";
// import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer";
import {mkdir, readdirSync, readFile, rm, statSync, writeFile} from "original-fs";
import {decode} from "iconv-lite";
import {Menu} from "electron";

const isDevelopment = process.env.NODE_ENV !== "production";
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{scheme: "app", privileges: {secure: true, standard: true}}]);

async function createWindow() {
    const win = new BrowserWindow({
        width: 1300,
        height: 800,
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
        await win.loadURL("app://./index.html");
    }
    Menu.setApplicationMenu(null)
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
    if (BrowserWindow.getAllWindows().length === 0) createWindow().then(() => {
    });
});

app.on("ready", async () => {
    //注册事件
    ipcMain.on("read", readHandle);
    ipcMain.on("write", writeHandle);
    ipcMain.on("delete", deleteHandle);
    ipcMain.on("locator_ctl", locator_ctl);
    ipcMain.on("mosquitto_ctl", mosquitto_ctl_handle);
    ipcMain.on("end_server", () => {
        end(["mosquitto"]);
        end(["aoa_locator"]);
    });
    await createWindow();
    // 启动项目的时候启动服务
    start_mosquitto();
});
// 程序退出前工作
app.on("before-quit", async () => {
    end(["mosquitto"]);
    end(["aoa_locator"]);
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
            readFile("./src/config/mqtt.json", (err, data) => event.sender.send("mqtt", JSON.parse(data.toString("utf-8"))));
            break;
        case "stations":
            readFile("./src/config/stations.json", (err, data) => event.sender.send("stations", JSON.parse(data.toString("utf-8"))));
            break;
        // 读取数据文件目录
        case "data": {
            let res = readFileList("./src/data", []);
            event.sender.send("data", res);
            break;
        }
        // 读数据文件细节
        case "data_detail":
            readFile(arg[1], (err, data) => {
                if (err) new Notification({title: "file", body: "read file error"});
                else event.sender.send("data_details", data.buffer.byteLength !== 0 ? JSON.parse(data.toString("utf-8")) : {});
            });
            break;
        // 读取tag文件
        case "tags":
            readFile("./src/config/tags.json", (err, data) => event.sender.send("tags", JSON.parse(data.toString("utf-8"))));
            break;
        // 读取误差修正存在的文件，通过arg[1] 指定基站名称进行读取
        case "error_files": {
            let res = readFileList("./src/error/" + arg[1], [])
            event.sender.send("data", res)
            break
        }

    }
}

// 写文件
function writeHandle(event, arg) {
    switch (arg[0]) {
        case "mqtt":
            writeFile("./src/config/mqtt.json", arg[1], () => {
            });
            break;
        case "stations":
            writeFile("./src/config/stations.json", arg[1], () => {
            });
            break;
        case "data":
            write("./src/data/" + arg[1], arg[2], (err) => {
                const message = {title: "file", body: "save success"};
                if (err) {
                    new Notification({title: "error", body: err.toString()}).show();
                    return;
                }
                new Notification(message).show();
            });
            break;
        case "tags":
            write("./src/config/tags.json", arg[1], () => {
            });
            break;
        case "error":
            write("./src/config/errors.json", arg[1], () => {
            });
            break;
    }
}

// 写文件，自动创建文件
function write(path, buffer, callback) {
    let last_path = path.substring(0, path.lastIndexOf("/"));
    mkdir(last_path, {recursive: true}, (err) => {
        if (err) return callback(err);
        writeFile(path, buffer, callback);
    });
}

// 删除文件
function deleteHandle(event, arg) {
    switch (arg[0]) {
        case "data":
            rm(arg[1], () => {
                new Notification({title: "file", body: "delete success"}).show();
            });
            break;
    }
}

// 读取数据文件
function readFileList(dir, res) {
    if (!require("fs").existsSync(dir)) return res
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
        res.push(item);
        return res;
    }
    const files = readdirSync(dir);
    for (let index = 0; index < files.length; index++) {
        const element = files[index];
        res = res.concat(readFileList(`${dir}/${element}`, []))
    }
    return res;
}

/**
 * mosquitto 服务管理函数，用于启动和停止mosquitto服务
 * @param event 事件发送者
 * @param args 参数
 */
function mosquitto_ctl_handle(event, args) {
    if (args[0]) start_mosquitto();
    else end(["mosquitto"]);
}

/**
 * 启动 mosquitto 服务
 */
function start_mosquitto() {
    console.log("start mosquitto");
    const exec = require("child_process").exec;
    const cmd = process.platform === "win32" ? ".\\mosquitto\\mosquitto.exe -c .\\mosquitto\\mosquitto.conf" : "mosquitto -c ./mosquitto/mosquitto.conf";
    // 启动mqtt
    exec(cmd, {encoding: "buffer"}, function (err, std, stderr) {
        if (err) console.log(decode(stderr, "cp936"));
    });
}

/**
 * 管理基站监听程序
 * @param event 消息
 * @param args 参数数组
 * @returns {string} 基站状态
 */
function locator_ctl(event, args) {
    const ip = args[0],
        status = args[1];
    if (status) {
        console.log(`aoa_locator ${ip} start`);
        const exec = require("child_process").exec;
        let cmd = "./aoa_locator/exe/aoa_locator ";
        if (process.platform === "win32") cmd = ".\\aoa_locator\\exe\\aoa_locator.exe ";
        cmd += `-t ${ip}`;
        exec(cmd, function (a, b, c) {
            if (a) console.error(c);
        });
    } else {
        end(["aoa_locator", ip]);
    }
}

/**
 * 检查进程状态
 * @param args 进程关键字
 * @returns {[string]} string数组
 */
function check_status(args) {
    try {
        const es = require("child_process").execSync;
        // 当该指令查询不到指定进程时，会返回失败
        let ctl = "grep";
        let cmd = "ps -aux | grep -v grep";
        if (process.platform === "win32") {
            ctl = "findstr";
            cmd = "tasklist";
        }
        args.forEach((element) => {
            cmd += `| ${ctl} ${element}`;
        });
        const res = es(cmd).toString();
        return res.split("\n");
    } catch (e) {
        console.error(decode(e.stderr, "cp936"));
    }
    return [];
}

/**
 * 结束进程，通过关键字
 * @param args 关键字数组
 */
function end(args) {
    console.log(`end server ${args}`);
    try {
        const es = require("child_process").execSync;
        const res = check_status(args);
        for (let index = 0; index < res.length; index++) {
            const element = res[index];
            if (element === undefined || element === "") continue;
            const pid = element.trim().split(/\s+/)[1];
            const cmd_kill = process.platform === "win32" ? `taskkill /pid ${pid} -f` : `kill ${pid}`;
            es(cmd_kill);
        }
    } catch (err) {
        console.error(err);
    }
}
