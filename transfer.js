let secretKey = 'zaybhkHWGKW9ng3HFZay9fD4aE7kt4lbEi115NS40lE5Dm84x4PVMSQTQV1cdvnS'
let publicKey = 'BDc6eAfMaG8wI46Uxr0z48gseiLjPureZkNjUSe9CquIfzJRw2Zd8caBEe6POesw'

const request = require('request')

const crypto = require('crypto');

function signature(query) {
    return crypto
        .createHmac('sha256', secretKey)
        .update(query)
        .digest('hex');
}

let adressMain = "0x303b4b7a7dc9038c0510af81031918e304410ada"

//958.12333201

// setTimeout(() => {
//     let queryWithdraw = `coin=USDT&network=BSC&address=${adressMain}&amount=50.7&transactionFeeFlag=true&timestamp=${Date.now()}`;
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
// }, 1000)


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
// }, 1000)


// setTimeout(() => {
//     let queryAsset = `timestamp=${Date.now()}`;
//     let hashAsset = signature(queryAsset);

//     request.get(
//         {
//             url: `https://fapi.binance.com/fapi/v2/account?${queryAsset}&signature=${hashAsset}`,
//             headers: {
//                 'X-MBX-APIKEY': publicKey
//             }
//         },
//         (err, response, body) => {
//             console.log(body)
//         }
//     )
// }, 1000)



//46.90034654




setTimeout(() => {
    let queryTransferFromFut = `type=UMFUTURE_MAIN&asset=USDT&amount=46.90034654&timestamp=${Date.now()}`;
    let hashTransferFromFut = signature(queryTransferFromFut);

    request.post(
        {
            url: `https://api.binance.com/sapi/v1/asset/transfer?${queryTransferFromFut}&signature=${hashTransferFromFut}`,
            headers: {
                'X-MBX-APIKEY': publicKey
            }
        },
        (err, response, body) => {
            console.log(body)
        }
    )
}, 1000)