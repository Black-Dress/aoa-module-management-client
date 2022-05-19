const mqtt = require("mqtt");
export class mqttx {
  client = null;
  mqttStatus = false;
  options = {
    host: "ws://127.0.0.1",
    port: "9001",
    reconnectPeriod: 1000,
    connectTimeout: 10 * 1000,
  };
  constructor(host = this.options.host, port = this.options.port) {
    this.options.host = host;
    this.options.port = port;
    this.client = mqtt.connect(this.options);
    this.client.on("connected", this.connected);
    this.client.on("message", this.message);
    this.client.on("close", this.close);
  }
  connected() {
    console.log("connect success");
  }
  close() {
    console.log("connect closed");
  }
  publish(topic, message) {
    this.client.publish(topic, message, (error) =>
      this.callback(error, "publish")
    );
  }
  subscribe(topic) {
    this.client.subscribe(topic, { qos: 0 }, (error) =>
      this.callback(error, "subscribe")
    );
  }
  unsubscribe(topic) {
    this.client.unsubscribe(topic, (error) =>
      this.callback(error, "unsubscribe")
    );
  }
  message(topic, payload, packet) {
    console.log(
      `Topic: ${topic}, Message: ${payload.toString()}, QoS: ${packet.qos}`
    );
  }
  callback(error, message) {
    if (error) console.error(message + "failed");
    else console.info(message + "success");
  }
}
