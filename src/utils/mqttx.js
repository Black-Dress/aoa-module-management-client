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
  static output = {};
  static res = "";
  // 连接并订阅
  static connect(url = "ws://localhost:9001") {
    this.disconnect();
    this.url = url;
    this.client = mqtt.connect(this.url, this.options);
    // 连接失败
    setTimeout(() => {
      if (this.client == undefined || this.client.connected == false) {
        return false;
      }
    }, 2000);
    this.client.subscribe(this.topic);
    while (this.client == null) {
      console.log("conneting");
    }
    // 注册事件函数
    this.client.on("connect", () => {
      this.subscribe(this.topic);
    });
    this.client.on("error", (err) => {
      console.log("client error", err);
    });
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
  // 设置信息到达处理函数
  static setMessage(m) {
    this.client.on("message", (topic, message) => {
      this.output[topic] += message.toString() + "\n";
      m(topic, message);
      console.log(this, this.output);
    });
  }
}
