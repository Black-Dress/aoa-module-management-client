import * as mqtt from "mqtt";
export class mqttx {
  static options = {
    clientId: "AoA-module-management",
    clean: true,
    reconnectPeriod: 0,
    connectTimeout: 1000,
  };
  static topic = "hello";
  static url = "";
  static client = null;
  // 消息输出
  static output = {
    a: "a\na\na\n",
  };
  static res = "aaaaa";
  // 连接并订阅
  static connect(url = "ws://localhost:9001") {
    this.disconnect();
    this.url = url;
    this.client = mqtt.connect(this.url, this.options);
    // 连接失败
    if (this.client.connected == false) {
      this.res = "connect faild";
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
    this.client.on("message", (topic, message) => {
      this.output[topic] += message.toString() + "\n";
      this.res += this.output[topic];
    });
    this.res = "connect success";
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
}
