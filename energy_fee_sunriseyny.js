/**
 * 青龙面板专用：点点用能获取电费（ESM模块版 + axios + MQTT）
 * 使用说明：
 * 1. 青龙面板添加任务时，脚本类型选择「JavaScript (ESM)」
 * 2. 安装依赖：npm install mqtt axios
 * 3. 填写下方配置项
 */

// ===================== 配置项（必须修改）=====================
const CONFIG = {
  // 点点用能配置
  openId: "", // 你的微信openId
  customerId: "", // 顾客ID
  energyType: 1, // 1=电费（固定）
  // MQTT配置
  mqtt: {
    host: "你的MQTT服务器IP",
    port: 1883,
    username: "MQTT用户名",
    password: "MQTT密码",
    topic: "homeassistant/sensor/electricity/state",
  },
};

// ===================== 引入依赖（ESM格式）=====================
const axios = require("axios");
const mqtt = require("mqtt");
const querystring = require("node:querystring"); // ESM方式引入内置模块

async function getConfig() {
  const [res1,res2] = await Promise.all([
    QLAPI.getEnvs({
      searchValue: "mqtt",
    }),
    QLAPI.getEnvs({
      searchValue: "sunriseyny",
    }),
  ])
  res1.data.forEach((item) => {
    if (item.name === "mqtt_broker") {
      CONFIG.mqtt.host = item.value;
    } else if (item.name === "mqtt_user") {
      CONFIG.mqtt.username = item.value;
    } else if (item.name === "mqtt_pwd") {
      CONFIG.mqtt.password = item.value;
    }
  });
  res2.data.forEach((item) => {
    if (item.name === "sunriseyny_openId") {
      CONFIG.openId = item.value;
    } else if (item.name === "sunriseyny_customerId") {
      CONFIG.customerId = item.value;
    }
  });
}

// ===================== 核心配置 =====================
const url =
  "https://www.sunriseyny.cn/ems-wpa-personal-api/statBill/queryCurMonthBill";
const userAgent =
  "Mozilla/5.0 (Linux; Android 14; HUAWEI ALN-AL00 Build/HUAWEIALN-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36 MicroMessenger/8.0.50(0x18003231) NetType/WIFI Language/zh_CN";
const referer = "https://www.sunriseyny.cn/ems-wpa-personal/month-bill.html";

// 构建请求头和请求体
const headers = {
  "Content-Type": "application/x-www-form-urlencoded",
  "User-Agent": userAgent,
  openId: CONFIG.openId,
  source: "2",
  Referer: referer,
};

const bodyObj = {
  customerId: CONFIG.customerId,
  energyType: CONFIG.energyType,
};

// ===================== 功能函数 =====================
/**
 * 获取电费数据（axios版）
 */
async function getElectricityCost() {
  try {
    console.log("开始请求电费API...");

    const response = await axios({
      method: "post",
      url: url,
      headers: headers,
      data: querystring.stringify(bodyObj),
      timeout: 10000,
    });

    const data = response.data;
    console.log("电费API返回数据：", JSON.stringify(data, null, 2));

    // 数据有效性校验
    if (!data || data.code !== 0) {
      throw new Error(`电费数据异常：${data?.msg || "无返回信息"}`);
    }

    // 组装MQTT发送数据（根据实际返回字段调整）
    const electricityData = {
      daily_cost: data?.data?.dayCost || 0,
      monthly_cost: data?.data?.monthCost || 0,
      balance: data?.data?.balance || 0,
      update_time: new Date().toLocaleString("zh-CN"),
      status: "success",
    };

    return electricityData;
  } catch (error) {
    let errorMsg = "";
    if (error.response) {
      errorMsg = `API返回错误：状态码${error.response.status}，数据${JSON.stringify(error.response.data)}`;
    } else if (error.request) {
      errorMsg = `API请求超时/无响应：${error.message}`;
    } else {
      errorMsg = `请求配置错误：${error.message}`;
    }
    console.error("获取电费失败：", errorMsg);

    return {
      daily_cost: 0,
      monthly_cost: 0,
      update_time: new Date().toLocaleString("zh-CN"),
      status: `failed: ${errorMsg}`,
    };
  }
}

/**
 * 发送数据到MQTT（ESM版）
 */
async function sendToMQTT(data) {
  const client = mqtt.connect({
    host: CONFIG.mqtt.host,
    port: CONFIG.mqtt.port,
    username: CONFIG.mqtt.username,
    password: CONFIG.mqtt.password,
    keepalive: 60,
    connectTimeout: 5000,
  });

  return new Promise((resolve, reject) => {
    client.on("connect", () => {
      console.log("MQTT连接成功，开始发送数据...");
      client.publish(
        CONFIG.mqtt.topic,
        JSON.stringify(data, null, 2),
        { qos: 0, retain: true },
        (err) => {
          client.end();
          if (err) {
            reject(new Error(`MQTT发送失败：${err.message}`));
          } else {
            resolve("MQTT发送成功");
          }
        },
      );
    });

    client.on("error", (err) => {
      client.end();
      reject(new Error(`MQTT连接失败：${err.message}`));
    });
  });
}

/**
 * 主函数
 */
async function main() {
  try {
    await getConfig();
    const electricityData = await getElectricityCost();
    const mqttResult = await sendToMQTT(electricityData);
    console.log("任务完成：", mqttResult);
  } catch (error) {
    console.error("任务失败：", error.message);
    throw error; // 触发青龙面板通知
  }
}

// 执行主函数
main();
