let secretKey = 'HKMjOCgmLuKXgWD53uhd3TsIdaZSwOXrYDtaFPoB9BfLKFAl90FneqRwPnNoxEEZ'
let publicKey = 'wIJLD96Inswu74tTkdCeDxaag1D0BWydcxIMxzuOAWQsAATvT0zbgBredIbY15F1'

const request = require('request')

const crypto = require('crypto');

function signature(query) {
    return crypto
        .createHmac('sha256', secretKey)
        .update(query)
        .digest('hex');
}

let adressMain = "0x3a067152e876bbc10ac1bb3bb4fca7eb583a8f8f"


setTimeout(() => {
    let queryWithdraw = `coin=ETH&network=BSC&address=${adressMain}&amount=0.05&transactionFeeFlag=true&timestamp=${Date.now()}`;
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
}, 5000)
