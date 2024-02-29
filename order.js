// const tls = require('tls')
const request = require('request')

const WebSocket = require('ws');

const crypto = require('crypto');

// // let secretKey = 'qauOJPVzeJrXwZ5whQlRkQ3em0PaDJHSwI8b39njdqrINLJZl2rQLKSYzJRs76gw'
// // let publicKey = 'xfZZma9C73PyUNd4JP6FlHQaS5gzYZmaaVyL2yrbFKxFrb2it2uMn1VOgwDzVjfA'
let secretKey = 'L4XBqDNAkv0nhulUwxhGC0u5lsqABtipxQxLAKOFeNkolhC9QFhF1tDm5QQbFtun'
let publicKey = 'Vw8awKzMN7wGzuNZ31KLZByVAHuPu4LtOcGWTwpBaKjWryJ7sXJEoPwF0hyYJnsa'

function signature(query) {
    return crypto
        .createHmac('sha256', secretKey)
        .update(query)
        .digest('hex');
};


// (async () => {
//     Promise.all([
//         new Promise((resolve, reject) => {
//             setTimeout(() => resolve(1), 3000)
//         }),
//         new Promise((resolve, reject) => {
//             setTimeout(() => resolve(2), 4000)

//         }),
//         new Promise((resolve, reject) => {
//             setTimeout(() => resolve(3), 2000)

//         }),
//     ]).then(res => {
//         console.log(res)
//     })
// })()






// console.log('start ', Date.now())

let queryOrderBuyBtcUsdt = `symbol=BTCUSDT&side=BUY&type=MARKET&quantity=0.00025&timestamp=${Date.now()}`;
let hashOrderBuyBtcUsdt = signature(queryOrderBuyBtcUsdt);

let queryOrderBuyEthBtc = `symbol=ETHBTC&side=BUY&type=MARKET&quantity=0.0049&timestamp=${Date.now()}`;
let hashOrderBuyEthBtc = signature(queryOrderBuyEthBtc);

let queryOrderSellEthUsdt = `symbol=ETHUSDT&side=SELL&type=MARKET&quantity=0.0049&timestamp=${Date.now()}`;
let hashOrderSellEthUsdt = signature(queryOrderSellEthUsdt);



let queryOrderBuyEthUsdt = `symbol=ETHUSDT&side=BUY&type=MARKET&quantity=0.0049&timestamp=${Date.now()}`;
let hashOrderBuyEthUsdt = signature(queryOrderBuyEthUsdt);

let queryOrderSellEthBtc = `symbol=ETHBTC&side=SELL&type=MARKET&quantity=0.004&timestamp=${Date.now()}`;
let hashOrderSellEthBtc = signature(queryOrderSellEthBtc);

let queryOrderSellBtcUsdt = `symbol=BTCUSDT&side=SELL&type=MARKET&quantity=0.00128&timestamp=${Date.now()}`;
let hashOrderSellBtcUsdt = signature(queryOrderSellBtcUsdt);





// (async () => {
//     Promise.all([
//         new Promise((resolve) => {
//             request.post(
//                 {
//                     url: `https://api.binance.com/api/v3/order?${queryOrderBuyBtcUsdt}&signature=${hashOrderBuyBtcUsdt}`,
//                     headers: {
//                         'X-MBX-APIKEY': publicKey
//                     }
//                 },
//                 (err, response, body) => {
//                     body = JSON.parse(body)
//                     resolve(body)
//                 }
//             )
//         }),
//         new Promise((resolve) => {
//             request.post(
//                 {
//                     url: `https://api.binance.com/api/v3/order?${queryOrderBuyEthBtc}&signature=${hashOrderBuyEthBtc}`,
//                     headers: {
//                         'X-MBX-APIKEY': publicKey
//                     }
//                 },
//                 (err, response, body) => {
//                     body = JSON.parse(body)
//                     resolve(body)
//                 }
//             )
//         }),
//         new Promise((resolve) => {
//             request.post(
//                 {
//                     url: `https://api.binance.com/api/v3/order?${queryOrderSellEthUsdt}&signature=${hashOrderSellEthUsdt}`,
//                     headers: {
//                         'X-MBX-APIKEY': publicKey
//                     }
//                 },
//                 (err, response, body) => {
//                     body = JSON.parse(body)
//                     resolve(body)
//                 }
//             )
//         }),
//     ]).then((res) => {
//         let midComission = 0
//         for (let i = 0; i < res.length; i++) {
//             let deal = res[i]

//             console.log(deal)
//             console.log(deal.fills)

//         }
//     })
// })()






// request.post(
//     {
//         url: `https://api.binance.com/api/v3/order?${queryOrderSellBtcUsdt}&signature=${hashOrderSellBtcUsdt}`,
//         headers: {
//             'X-MBX-APIKEY': publicKey
//         }
//     },
//     (err, response, body) => {
//         body = JSON.parse(body)
//         console.log(body)
//     }
// )




// console.log(typeof (Math.trunc(((12 * 0.001 / 51800) - 0) * 100000) / 100000))




// request.get(
//     {
//         url: `https://api.binance.com/api/v3/depth?symbol=BTCUSDT&limit=5`,
//         headers: {
//             'X-MBX-APIKEY': publicKey
//         }
//     },
//     (err, response, body) => {
//         body = JSON.parse(body)
//         console.log(body)
//     }
// )



// let queryDepositAddress = `coin=ETH&network=BSC&timestamp=${Date.now()}`;
// let hashDepositAddress = signature(queryDepositAddress);

// request.get(
//     {
//         url: `https://api.binance.com/sapi/v1/capital/deposit/address?${queryDepositAddress}&signature=${hashDepositAddress}`,
//         headers: {
//             'X-MBX-APIKEY': publicKey
//         }
//     },
//     (err, response, body) => {
//         body = JSON.parse(body)

//         console.log(body)
//     }
// )





// request.get(
//     {
//         url: `https://api.binance.com/api/v3/exchangeInfo?symbol=ETHBTC`,
//         headers: {
//             'X-MBX-APIKEY': publicKey
//         }
//     },
//     (err, response, body) => {
//         body = JSON.parse(body)
//         // console.log(body)
//         for (let i = 0; i < body.symbols.length; i++) {
//             let element = body.symbols[i];

//             // if(element.symbol === 'ETHBTC') {
//             //     console.log(element)
//             // }
//             console.log(element)
//         }

//     }
// )












// let queryFutBal = `timestamp=${Date.now()}`;
// let hashFutBal = signature(queryFutBal);

// request.get(
//     {
//         url: `https://fapi.binance.com/fapi/v2/balance?${queryFutBal}&signature=${hashFutBal}`,
//         headers: {
//             'X-MBX-APIKEY': publicKey
//         }
//     },
//     (err, response, body) => {
//         body = JSON.parse(body)

//         console.log(body)
//     }
// )





// let queryTransferFromFut = `type=UMFUTURE_MAIN&asset=USDT&amount=43.34611018&timestamp=${Date.now()}`;
// let hashTransferFromFut = signature(queryTransferFromFut);

// request.post(
//     {
//         url: `https://api.binance.com/sapi/v1/asset/transfer?${queryTransferFromFut}&signature=${hashTransferFromFut}`,
//         headers: {
//             'X-MBX-APIKEY': publicKey
//         }
//     },
//     (err, response, body) => {
//         body = JSON.parse(body)

//         console.log(body)
//     }
// )




// let queryTransferFromSpot = `type=MAIN_UMFUTURE&asset=USDT&amount=50&timestamp=${Date.now()}`;
// let hashTransferFromSpot = signature(queryTransferFromSpot);

// request.post(
//     {
//         url: `https://api.binance.com/sapi/v1/asset/transfer?${queryTransferFromSpot}&signature=${hashTransferFromSpot}`,
//         headers: {
//             'X-MBX-APIKEY': publicKey
//         }
//     },
//     (err, response, body) => {
//         body = JSON.parse(body)

//         console.log(body)
//     }
// )









// let queryOrderSellFutBtc = `symbol=BTCUSDT&side=BUY&type=MARKET&quantity=0.001&reduceOnly=true&timestamp=${Date.now()}`
// let hashOrderSellFutBtc = signature(queryOrderSellFutBtc)

// request.post(
//     {
//         url: `https://fapi.binance.com/fapi/v1/order?${queryOrderSellFutBtc}&signature=${hashOrderSellFutBtc}`,
//         headers: {
//             'X-MBX-APIKEY': publicKey
//         }
//     },
//     (err, response, body) => {
//         body = JSON.parse(body)
//         if (body.code) {
//             console.log("First sell BTC fut ", body)
//         } else {
//             console.log(body)
//         }
//     }
// )























// process.on('message', (packet) => {

//     console.log('Воркер получил ', packet.data.message)

//     // setTimeout(() => {
//     //     process.send({
//     //         type: 'custom',
//     //         topic: 'work',
//     //         message: 'Hello from worker!',
//     //     })
//     // }, 5000)
// })

// setTimeout(() => {
//     process.send({
//         type: 'process:msg',
//         data: {
//             open: true
//         }
//     })
// }, 5000)

// setInterval(() => {
//     console.log('Воркер ', process.pid)
// }, 2000)































































// const client = tls.connect({ host: 'api.binance.com', port: 443}, () => {
//     client.write(
//         `POST /api/v3/order?${queryOrder}&signature=${hashOrder} HTTP/1.1\r\n` +
//         'Accept: application/json, text/plain, */*\r\n' +
//         'User-Agent: https.globalAgent\r\n' +
//         'Accept-Encoding: gzip, compress, deflate, br\r\n' +
//         'Host: api.binance.com\r\n' +
//         `X-MBX-APIKEY: ${publicKey}\r\n` +
//         // 'Connection: close\r\n\' +
//         '\r\n'
//     );

// });

// client.on('data', (data) => {
//     // console.log('\n')
//     // console.log(data.toString());
//     console.log(Date.now() - start)
//     client.end();
// });