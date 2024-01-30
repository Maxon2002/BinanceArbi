let secretKey = 'HKMjOCgmLuKXgWD53uhd3TsIdaZSwOXrYDtaFPoB9BfLKFAl90FneqRwPnNoxEEZ'
let publicKey = 'wIJLD96Inswu74tTkdCeDxaag1D0BWydcxIMxzuOAWQsAATvT0zbgBredIbY15F1'

let adressMain = "0x3a067152e876bbc10ac1bb3bb4fca7eb583a8f8f"

let queryWithdraw = `coin=USDT&network=BSC&address=${adressMain}&amount=10&timestamp=${Date.now()}`;
let hashWithdraw = signature(queryWithdraw);

request.get(
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