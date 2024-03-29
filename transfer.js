let secretKey = 'rPUKuHOiFkvy4K4fI67jbVCuYGiP6qcwiLhhLWFxgjiFxXB7RXODtnJJ7t4z47dt'
let publicKey = 'MlPfT59J0LVQVXfbWk46sItd8eUhhsOC2RtOK7GkQtixNnOMTF0DxsTBKLTCdmj2'

const request = require('request')

const crypto = require('crypto');

function signature(query) {
    return crypto
        .createHmac('sha256', secretKey)
        .update(query)
        .digest('hex');
}

let adressMain = "0xd742ecbbc74093e2fb3fa34888aeb0eff24d8d87"

//[{"asset":"BTC","free":"0.00016633",,{"asset":"ETH","free":"0.00278924",o,{"asset":"USDT","free":"32.4029797",

// setTimeout(() => {
//     let queryWithdraw = `coin=USDT&network=BSC&address=${adressMain}&amount=32.4029797&transactionFeeFlag=true&timestamp=${Date.now()}`;
//     let hashWithdraw = signature(queryWithdraw);

//     request.post(
//         {
//             url: `https://api.binance.com/sapi/v1/capital/withdraw/apply?${queryWithdraw}&signature=${hashWithdraw}`,
//             headers: {
//                 'X-MBX-APIKEY': publicKey
//             }
//         },
//         (err, response, body) => {
//             body = JSON.parse(body)

//             console.log(body)
//         }
//     )
// }, 10000)


setTimeout(() => {
    let queryAsset = `timestamp=${Date.now()}`;
    let hashAsset = signature(queryAsset);

    request.post(
        {
            url: `https://api.binance.com/sapi/v3/asset/getUserAsset?${queryAsset}&signature=${hashAsset}`,
            headers: {
                'X-MBX-APIKEY': publicKey
            }
        },
        (err, response, body) => {
            console.log(body)
        }
    )
}, 10000)




