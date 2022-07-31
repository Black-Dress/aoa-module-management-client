import * as mqtt from "mqtt";
const ipcRenderer = window.require("electron").ipcRenderer;
const MAXLEN = 1000000;
export class mqttx {
  static options = {
    clientId: "AoA-module-management",
    clean: true,
    reconnectPeriod: 0,
    connectTimeout: 1000,
  };
  static url = "ws://localhost:9001";
  // 订阅的主题，#后面是tag的标签id
  static topic = "silabs/aoa/angle/#";
  static client = null;
  // 消息输出，按照基站id进行存储
  static output = {
    a: ["a\na\na\n"],
  };
  static res = [];
  // 回调函数
  static messages = function () {};
  // 连接并订阅
  static connect(
    url = "ws://localhost:9001",
    s = (msg) => {
      console.log(msg);
    },
    f = (msg) => {
      console.log(msg);
    }
  ) {
    this.disconnect();
    this.url = url;
    this.client = mqtt.connect(this.url, this.options);
    // 连接失败
    if (this.client.connected == false) {
      f("connect faild");
      return false;
    }
    // 订阅
    this.client.subscribe(this.topic);
    // 注册事件函数
    this.client.on("connect", () => {
      this.subscribe(this.topic);
    });
    this.client.on("error", (err) => {
      console.log("client error", err);
    });
    this.client.on("message", this.message);
    s("connect success");
    return true;
  }
  // 断开连接
  static disconnect() {
    if (this.client && !this.client.disconnected) {
      this.client.end();
    }
  }
  // 订阅
  static subscribe(topic) {
    this.client.subscribe(topic, { qos: 0 }, function (error) {
      if (error) console.error("subscribe" + " failed");
      else console.info("subscribe" + " success");
    });
  }
  // 重新连接
  static reconnect() {
    this.client.reconnect(this.options);
  }
  // 重新设置clientID
  static setId(id = "default-id") {
    this.options.clientId = id;
    if (this.client && this.client.connected) this.connect();
  }
  // 注册消息函数回调
  static set_message_callback(m) {
    this.messages = m;
  }
  // 消息到达时执行函数
  static message(topic, message) {
    if (this.output[topic] == undefined) {
      this.output[topic] = [];
    }
    this.output[topic].push(message.toString());
    this.res.push(message.toString());
    // 执行注册的函数
    this.messages(topic, message.toString());
    // 存储数据
    if (this.output[topic].length >= MAXLEN) {
      this.save(
        JSON.stringify(this.output[topic]),
        `${topic}-${new Date().toLocaleDateString()}.json`
      );
      this.output[topic] = [];
    }
  }
  // 存储数据
  static save(data, name) {
    ipcRenderer.send("write", ["data", name, data]);
  }
}
