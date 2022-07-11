import * as mqtt from "mqtt";
export class mqttx {
  static options = {
    // TODO clientId 需要用户设置，这个设置可以作为middleserver进行数据读取的凭证
    // clientId: "AoA-module-management",
    clean: true,
    reconnectPeriod: 0,
    connectTimeout: 2000,
    clientId: "emqx_test",
    username: "emqx_test",
    password: "emqx_test",
  };
  static topic = "hello";
  static url = "";
  static client = null;
  // 连接并订阅
  static connect(url) {
    if (url != undefined || url != "") this.url = url;
    this.disconnect();
    console.log(this.url);
    this.client = mqtt.connect(this.url, this.options);
    this.client.on("connect", () => {
      this.subscribe(this.topic);
      console.log("connect success");
    });
    this.client.on("message", (payload) => {
      console.info(`message:${payload}`);
    });
    this.client.on("error", () => {
      console.error("client error ");
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
}
