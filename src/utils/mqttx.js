import * as mqtt from "mqtt";

export class mqttx {
  static options = {
    // TODO clientId 需要用户设置，这个设置可以作为middleserver进行数据读取的凭证
    clientId: "AoA-module-management",
    clean: true,
    reconnectPeriod: 0,
    connectTimeout: 1000,
  };
  static topic = "hello";
  static url = "";
  static client = null;
  static res = "";
  // 连接并订阅
  static connect(
    url = "ws://localhost:9001",
    success = () => {
      console.log("success");
    },
    fialed = () => {
      console.log("fialed");
    }
  ) {
    this.disconnect();
    this.url = url;
    this.client = mqtt.connect(this.url, this.options);
    // 注册事件函数
    this.client.on("connect", () => {
      this.subscribe(this.topic);
      success();
    });
    this.client.on("error", () => {
      fialed();
    });
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
