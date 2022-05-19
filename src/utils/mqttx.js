const mqtt = require("mqtt");
export class mqttx {
  constructor() {
    this.client = null;
    // TODO clientId 需要用户设置，这个设置可以作为middleserver进行数据读取的凭证
    this.clientId = "AoA-module-management";
    this.topic = "hello";
    this.url = "ws://localhost:9001";
  }
  // 连接并订阅
  connect() {
    this.client = mqtt.connect(this.url);
    this.client.on("connect", () => {
      this.subscribe(this.topic);
    });
    this.client.on("message", function (payload) {
      console.info(`message:${payload}`);
    });
  }
  // 断开连接
  disconnect() {
    this.client.end();
  }
  // 订阅
  subscribe(topic) {
    this.client.subscribe(topic, { qos: 0 }, function (error) {
      if (error) console.error("subscribe" + " failed");
      else console.info("subscribe" + " success");
    });
  }
}
