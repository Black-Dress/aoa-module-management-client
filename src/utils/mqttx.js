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
  static client = null;
  // 存储所有的tag，station 对象
  static tag_list = [
    {
      name: "aa",
      id: "aa-id",
      status: false,
    },
    {
      name: "aa",
      id: "aa-id",
      status: false,
    },
  ];
  static station_list = [
    {
      id: "a",
      name: "别称",
      positon: {
        x: 1,
        y: 1,
        z: 1,
      },
      status: false,
      net: "192.168.1.101",
    },
  ];
  // 消息输出，按照基站id进行存储
  static stations = {
    a: ["a\na\na\n"],
  };
  // 消息输出，按照tag id 进行存储
  static tags = {
    a: [],
    b: [],
  };
  static res = [];
  // 回调函数
  static messages = function () {};
  // 连接
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
    while (this.client.connected == false) {
      f("connect faild");
      return false;
    }
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
  static subscribe(topics, callback) {
    if (this.client.connected) this.client.subscribe(topics, { qos: 0 }, callback);
  }
  // 取消订阅
  static unsubscribe(topics) {
    if (!this.client.connected) return;
    this.client.unsubscribe(topics, (err, packet) => {
      if (err) console.log("unsubscrib error: " + err);
      else console.info("unsubscribe success: " + packet);
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
    if (this.stations[topic] == undefined) {
      this.stations[topic] = [];
    }
    // 获取topic中包含的stationId 和 tagId
    const s = topic.split("/");
    const stationsId = s[s.length - 2];
    const tagId = s[s.length - 1];
    // 存储消息
    this.stations[stationsId].push(message.toString());
    this.tags[tagId].push(message.toString());
    this.res.push(message.toString());
    // 执行注册的函数
    this.messages(topic, message.toString());
    // 存储数据,按照id作为文件夹进行划分
    if (this.stations[stationsId].length >= MAXLEN) {
      this.save(JSON.stringify(this.stations[stationsId]), `${stationsId}/${new Date().toLocaleDateString()}.json`);
      this.stations[stationsId] = [];
    }
    if (this.tags[tagId].length >= MAXLEN) {
      this.save(JSON.stringify(this.tags[tagId]), `${tagId}/${new Date().toLocaleDateString()}.json`);
      this.tags[stationsId] = [];
    }
  }
  // 存储数据
  static save(data, name) {
    ipcRenderer.send("write", ["data", name, data]);
  }
  static defaultTopic() {
    let topic = "silabs/aoa/angle";
    return topic;
  }
  static subscribeTag(tagId, callback = () => {}) {
    let topic = `${this.defaultTopic()}/+/${tagId}`;
    this.subscribe(topic, callback);
  }
  static unsubscribeTag(tagId, callback = () => {}) {
    let topic = `${this.defaultTopic()}/+/${tagId}`;
    this.unsubscribe(topic, callback);
  }
  static defaultSubscribe(callback = () => {}) {
    let topics = [];
    this.tag_list.forEach((t) => {
      if (t.status) topics.push(`${this.defaultTopic()}/+/${t.id}`);
    });
    this.subscribe(topics, callback);
  }
}
