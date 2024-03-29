import * as mqtt from "mqtt";
import {upload_aoa_raw_data} from "@/api/client";

const ipcRenderer = window.require("electron").ipcRenderer;
const MAX_LEN = 100000;

export class mqttx {
    static options = {
        clientId: "aoa_client",
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
    /**
     * 启动的基站数量
     * @type {number}
     */
    static active_station_num = 2;
    /**
     * 每个基站应该能够存储的数据数量，达到这个数据量之后上传数据
     * @type {number}
     */
    static msg_station_size = 2;
    /**
     * 存储采集的数据，上传至服务器
     * @type {[]}
     */
    static msgs = [];
    /**
     * 按照基站id进行存储
     * @type {*}
     */
    static stations = new Map();
    /**
     * 按照tag id 进行存储
     * @type {*}
     */
    static tags = new Map();
    /**
     * 激活的 tag id,能够发送数据的 tag id
     * @type {*}
     */
    static active_tag = mqttx.tag_list[0].id
    /**
     * 当前的定位精度
     * @type {number}
     */
    static percision = 1
    // 默认回调函数
    static messages = function (topic, message) {
        console.log(topic, message);
    };

    /**
     * mqtt 连接服务器函数
     * @param url{string} 连接地质
     * @param s{function} 连接成功回调
     * @param f{function} 连接失败回调
     */
    static connect(
        url = "ws://localhost:9001",
        s = function () {
        },
        f = function () {
        }
    ) {
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
     * 睡眠函数，睡眠time时间后执行代码
     * @param time 单位ms
     * @returns {Promise<unknown>}延迟函数
     */
    static sleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    /**
     * 断开连接,重置所有的aoa_locator
     * @param callback 断开连接成功的回调
     */
    static disconnect(callback) {
        mqttx.station_list.forEach(station => station.status = false)
        if (mqttx.client === null || !mqttx.client.connected) return
        this.client.end(true, {}, callback);
        ipcRenderer.send("end_server")
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
        // 获取topic中包含的stationId 和 tagId
        const s = topic.split("/");
        const stationsId = s[s.length - 2];
        const tagId = s[s.length - 1];
        // 初始化
        if (!mqttx.stations.has(stationsId)) mqttx.stations.set(stationsId, []);
        if (!mqttx.tags.has(tagId)) mqttx.tags.set(tagId, []);
        // 存储消息
        const i = JSON.parse(message.toString());
        i["cId"] = mqttx.options.clientId;
        // console.log(mqttx.station_map);
        i["x"] = mqttx.station_map[stationsId]["position"].x;
        i["y"] = mqttx.station_map[stationsId]["position"].y;
        i["z"] = mqttx.station_map[stationsId]["position"].z;
        mqttx.stations.get(stationsId).push(i);
        mqttx.tags.get(tagId).push(i);
        // 只能够存储激活的tag数据
        if (tagId === mqttx.active_tag) mqttx.msgs.push(i);
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
        if (mqttx.msgs.length >= 6) {
            upload_aoa_raw_data(mqttx.msgs,(res)=>{this.percision = res.data.data});
            console.log(mqttx.msgs);
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

    // 默认订阅
    static defaultSubscribe(callback) {
        this.subscribe(`${this.defaultTopic()}/#`, callback);
    }

    /**
     * 改变基站状态，启动基站服务
     * @param index{number} 基站序列号
     * @param status{boolean} 状态
     */
    static station_status_ctl(index, status) {
        if (status && !mqttx.station_list[index].status) mqttx.active_station_num += 1;
        else mqttx.active_station_num -= 1;
        mqttx.active_station_num = mqttx.active_station_num < 0 ? 0 : mqttx.active_station_num;
        mqttx.station_list[index].status = status;
        ipcRenderer.send("locator_ctl", [mqttx.station_list[index].net, status]);
    }

    /**
     * 通过id 改变基站状态
     * @param id 基站id
     * @param status 状态
     */
    static station_status_ctl_by_id(id, status) {
        let index = this.station_list.findIndex((item) => item.id === id)
        this.station_status_ctl(index, status)
    }
}
