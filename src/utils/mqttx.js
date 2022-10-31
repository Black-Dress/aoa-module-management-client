import * as mqtt from "mqtt";
import {ElMessage} from "element-plus";
import {upload_aoa_raw_data} from "@/api/client";

const ipcRenderer = window.require("electron").ipcRenderer;
const MAX_LEN = 1000000;

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
            position: {
                x: 1,
                y: 1,
                z: 1,
            },
            status: false,
            net: "192.168.1.101",
        },
    ];

    static active_station_num = 0;
    static msg_station_size = 2;
    // 用于发送middle server的数据
    static msgs = [];
    // 消息输出，按照基站id进行存储
    static stations = new Map();
    // 消息输出，按照tag id 进行存储
    static tags = new Map();
    // 默认回调函数
    static messages = function (topic, message) {
        console.log(topic, message);
    };

    // 连接
    /**
     * mqtt 连接服务器函数
     * @param url 连接地质
     * @param s 连接成功回调
     * @param f 连接失败回调
     */
    static connect(url = "ws://localhost:9001", s, f) {
        mqttx.url = url;
        mqttx.client = mqtt.connect(mqttx.url, mqttx.options)
        mqttx.client.on("connect", () => {
            s();
            this.client.on("message", mqttx.message);
        });
        mqttx.client.on("error", (err) => {
            console.log("client error", err);
        });
        mqttx.sleep(300).then(() => {
            if (mqttx.client.connected === false) {
                f()
                // 重新启动 mosquitto
                ipcRenderer.send("mosquitto_ctl", [true])
            }
        })
    }

    /**
     * 睡眠函数，水面time时间后执行代码
     * @param time 单位ms
     * @returns {Promise<unknown>}延迟函数
     */
    static sleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    // 断开连接
    static disconnect(callback) {
        if (this.client && !this.client.disconnected) {
            this.client.end(true, {}, callback);
        }
    }

    // 订阅
    static subscribe(topics, callback) {
        if (this.client && this.client.connected) this.client.subscribe(topics, {qos: 0}, callback);
    }

    // 取消订阅
    static unsubscribe(topics) {
        if (!this.client || !this.client.connected) return;
        this.client.unsubscribe(topics, (err, packet) => {
            if (err) console.log("unsubscribe error: " + err);
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
        // if (this.stations[topic] == undefined) {
        //   this.stations[topic] = [];
        // }
        // 获取topic中包含的stationId 和 tagId
        const s = topic.split("/");
        const stationsId = s[s.length - 2];
        const tagId = s[s.length - 1];
        // 初始化
        if (!mqttx.stations.has(stationsId)) mqttx.stations.set(stationsId, []);
        if (!mqttx.tags.has(tagId)) mqttx.tags.set(tagId, []);
        // 存储消息
        mqttx.stations.get(stationsId).push(message.toString());
        mqttx.tags.get(tagId).push(message.toString());
        mqttx.msgs.push(message.toString());
        // 执行注册的函数
        mqttx.messages(topic, `${stationsId}:${tagId} -> ${message.toString()}`);
        // 存储数据,按照id作为文件夹进行划分
        if (mqttx.stations.get(stationsId).length >= MAX_LEN) {
            mqttx.save(mqttx.stations.get(stationsId), `${stationsId}/${new Date().toLocaleDateString()}.json`);
            mqttx.stations.set(stationsId, []);
        }
        if (mqttx.tags.get(tagId).length >= MAX_LEN) {
            mqttx.save(mqttx.tags.get(tagId), `${tagId}/${new Date().toLocaleDateString()}.json`);
            mqttx.tags.set(tagId, []);
        }
        // 判断是否需要发送数据
        if (mqttx.msgs.length >= mqttx.active_station_num * mqttx.msg_station_size) {
            upload_aoa_raw_data(mqttx.msgs, () => {
            }, (err) => {
                ElMessage({type: "error", message: `upload data failed:${err.message}`})
            })
            mqttx.msgs = [];
        }
    }

    // 存储数据
    static save(data, name) {
        ipcRenderer.send("write", ["data", name, data]);
    }

    // 默认主题
    static defaultTopic() {
        return "silabs/aoa/angle";
    }

    // 订阅tag
    static subscribeTag(tagId, callback = () => {
    }) {
        let topic = `${this.defaultTopic()}/+/${tagId}`;
        this.subscribe(topic, callback);
    }

    // 取消订阅tag
    static unsubscribeTag(tagId, callback = () => {
    }) {
        let topic = `${this.defaultTopic()}/+/${tagId}`;
        this.unsubscribe(topic, callback);
    }

    // 默认订阅
    static defaultSubscribe(callback) {
        this.subscribe(`${this.defaultTopic()}/#`, callback);
    }

    // 订阅基站
    static subscribeStation(stationId, callback = () => {
    }) {
        let topic = `${this.defaultTopic()}/${stationId}/+`;
        this.subscribe(topic, callback);
    }

    // 取消订阅基站
    static unSubscribeStation(stationId, callback = () => {
    }) {
        let topic = `${this.defaultTopic()}/${stationId}/+`;
        this.unsubscribe(topic, callback);
    }

    // 基站状态改变函数
    static station_status_ctl(index, status) {
        if (status && !mqttx.station_list[index].status) mqttx.active_station_num += 1;
        else mqttx.active_station_num -= 1;
        mqttx.station_list[index].status = status;
        ipcRenderer.send("locator_ctl", [mqttx.station_list[index].net, status]);
    }

}
