let secretKey = 'kqp1DijGGJUMuXurWk12lF88HBvzs0zQ9IBgd8yCGe0aPIAGDPEtMZj4n7QJ78pW'
let publicKey = 'TC1URH0VmFYIStq27gs4JkFSGqxR0oU4kxgZnC2zmOVYwyjc3FpibdprzryEwaL3'

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
}, 1000)






