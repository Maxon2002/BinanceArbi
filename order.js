// const tls = require('tls')
const request = require('request')

const WebSocket = require('ws');

const crypto = require('crypto');

// // let secretKey = 'qauOJPVzeJrXwZ5whQlRkQ3em0PaDJHSwI8b39njdqrINLJZl2rQLKSYzJRs76gw'
// // let publicKey = 'xfZZma9C73PyUNd4JP6FlHQaS5gzYZmaaVyL2yrbFKxFrb2it2uMn1VOgwDzVjfA'
// let secretKey = 'qauOJPVzeJrXwZ5whQlRkQ3em0PaDJHSwI8b39njdqrINLJZl2rQLKSYzJRs76gw'
// let publicKey = 'xfZZma9C73PyUNd4JP6FlHQaS5gzYZmaaVyL2yrbFKxFrb2it2uMn1VOgwDzVjfA'

// function signature(query) {
//     return crypto
//         .createHmac('sha256', secretKey)
//         .update(query)
//         .digest('hex');
// }







// console.log('start ', Date.now())

// let queryOrderBuyBtcUsdt = `symbol=BTCUSDT&side=BUY&type=MARKET&quantity=0.00025&timestamp=${Date.now()}`;
// let hashOrderBuyBtcUsdt = signature(queryOrderBuyBtcUsdt);

// let queryOrderBuyEthBtc = `symbol=ETHBTC&side=BUY&type=MARKET&quantity=0.0049&timestamp=${Date.now()}`;
// let hashOrderBuyEthBtc = signature(queryOrderBuyEthBtc);

// let queryOrderSellEthUsdt = `symbol=ETHUSDT&side=SELL&type=MARKET&quantity=0.0049&timestamp=${Date.now()}`;
// let hashOrderSellEthUsdt = signature(queryOrderSellEthUsdt);



// let queryOrderBuyEthUsdt = `symbol=ETHUSDT&side=BUY&type=MARKET&quantity=0.00025&timestamp=${Date.now()}`;
// let hashOrderBuyEthUsdt = signature(queryOrderBuyEthUsdt);

// let queryOrderSellEthBtc = `symbol=ETHBTC&side=SELL&type=MARKET&quantity=0.0049&timestamp=${Date.now()}`;
// let hashOrderSellEthBtc = signature(queryOrderSellEthBtc);

// let queryOrderSellBtcUsdt = `symbol=BTCUSDT&side=BUY&type=MARKET&quantity=0.00025&timestamp=${Date.now()}`;
// let hashOrderSellBtcUsdt = signature(queryOrderSellBtcUsdt);





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
//         url: `https://api.binance.com/api/v3/order?${queryOrderBuyBtcUsdt}&signature=${hashOrderBuyBtcUsdt}`,
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
//         url: `https://api.binance.com/api/v3/exchangeInfo`,
//         headers: {
//             'X-MBX-APIKEY': publicKey
//         }
//     },
//     (err, response, body) => {
//         body = JSON.parse(body)

//         console.log(body)
//     }
// )



process.on('message', (packet) => {

    console.log('Воркер получил ', packet.data.message)

    // setTimeout(() => {
    //     process.send({
    //         type: 'custom',
    //         topic: 'work',
    //         message: 'Hello from worker!',
    //     })
    // }, 5000)
})

setTimeout(() => {
    process.send({
        type: 'process:msg',
        data: {
            open: true
        },
    })
}, 5000)

setInterval(() => {
    console.log('Воркер ', process.pid)
}, 2000)








































// let queryOpenOrders = `symbol=BTCUSDT&timestamp=${Date.now()}`;

// let hashOpenOrders = signature(queryOpenOrders)

// request.get(
//     {
//         url: `https://api.binance.com/api/v3/allOrders?${queryOpenOrders}&signature=${hashOpenOrders}`,
//         headers: {
//             'X-MBX-APIKEY': publicKey
//         }
//     },
//     (err, response, body) => {
//         body = JSON.parse(body)
//         console.log(body)
//         // console.log(Date.now() - time)

//     }
// )











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