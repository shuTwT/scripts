/**
 * 点点用能公众号获取电费
 */
import { objToUrlEncoded } from './utils.js'

var url="https://www.sunriseyny.cn/ems-wpa-personal-api/statBill/queryCurMonthBill"

var userAgent = "Mozilla/5.0 (Linux; Android 14; HUAWEI ALN-AL00 Build/HUAWEIALN-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36 MicroMessenger/8.0.50(0x18003231) NetType/WIFI Language/zh_CN"

// 这里填写微信 openId
var openId = ""

var referer= "https://www.sunriseyny.cn/ems-wpa-personal/month-bill.html"

/**
 * 构建请求体,这里填写顾客 id 和用能类型 
 * @param {number} customerId - 顾客 id
 * @param {number} energyType - 用能类型 1是电费
 */
var bodyObj = {
    "customerId":undefined,
    "energyType":undefined
}

var headers = {
                "Content-Type":"application/x-www-form-urlencoded",
                "User-Agent":userAgent,
                "openId":openId,
                "source":"2"
            }

function sendRequest (){
    return new Promise((resolve,reject)=>{
        console.log(headers)
        fetch(url,{
            method:"POST",
            headers:headers,
            body:objToUrlEncoded(bodyObj)
        }).then(res=>res.json()).then(data=>{
            resolve(data)
        }).catch(err=>{
            reject(err)
        })
    })
}

function main(){
    sendRequest().then(data=>{
        console.log(data)
    }).catch(err=>{
        console.log(err)
    })
}

main()