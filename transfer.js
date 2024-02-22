let secretKey = 'wWrKKmoPoaJrQTsh3vkDpfesj2LPuP1rOxulX6ort4l3MIUsZ0KWL4XbATtHJsfo'
let publicKey = 'UGrmATKOAK7fWhhW1i5x1QbhOoAHXFxFLhQMWZZ26FcyNKyC0JOAYeyMx3zL8aSN'

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
    let queryWithdraw = `coin=USDT&network=BSC&address=${adressMain}&amount=24.33214379&transactionFeeFlag=false&timestamp=${Date.now()}`;
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
}, 10000)


