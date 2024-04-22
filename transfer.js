let secretKey = 'ZfnNUtvL3GNAFz8jrNLC27QEX2s0KeJudytOmlN8N37qnEPd9ZJAWtTsuay4mMRr'
let publicKey = 'ttNTnSDBy8s5NXgBMdnR3EWwEA8SsgxZzIaucK693hL7V2wGWlJhvrBeSN4HDH5f'

const request = require('request')

const crypto = require('crypto');

function signature(query) {
    return crypto
        .createHmac('sha256', secretKey)
        .update(query)
        .digest('hex');
}

let adressMain = "0xd742ecbbc74093e2fb3fa34888aeb0eff24d8d87"

//958.12333201

setTimeout(() => {
    let queryWithdraw = `coin=USDT&network=BSC&address=${adressMain}&amount=958.12333201&transactionFeeFlag=true&timestamp=${Date.now()}`;
    let hashWithdraw = signature(queryWithdraw);

    request.post(
        {
            url: `https://api.binance.com/sapi/v1/capital/withdraw/apply?${queryWithdraw}&signature=${hashWithdraw}`,
            headers: {
                'X-MBX-APIKEY': publicKey
            }
        },
        (err, response, body) => {
            body = JSON.parse(body)

            console.log(body)
        }
    )
}, 1000)


// setTimeout(() => {
//     let queryAsset = `timestamp=${Date.now()}`;
//     let hashAsset = signature(queryAsset);

//     request.post(
//         {
//             url: `https://api.binance.com/sapi/v3/asset/getUserAsset?${queryAsset}&signature=${hashAsset}`,
//             headers: {
//                 'X-MBX-APIKEY': publicKey
//             }
//         },
//         (err, response, body) => {
//             console.log(body)
//         }
//     )
// }, 10000)






