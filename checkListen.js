const request = require('request')

const crypto = require('crypto');

const WebSocket = require('ws');

let secretKey = 'L4XBqDNAkv0nhulUwxhGC0u5lsqABtipxQxLAKOFeNkolhC9QFhF1tDm5QQbFtun'
let publicKey = 'Vw8awKzMN7wGzuNZ31KLZByVAHuPu4LtOcGWTwpBaKjWryJ7sXJEoPwF0hyYJnsa'

function signature(query) {
    return crypto
        .createHmac('sha256', secretKey)
        .update(query)
        .digest('hex');
};


let depoIndex = 0
let startTimeDepoIndex = Date.now()

let depositHistory = `startTime=${startTimeDepoIndex}&timestamp=${Date.now()}`;
let hashDepositHistory = signature(depositHistory);


request.get(
    {
        url: `https://api.binance.com/sapi/v1/capital/deposit/hisrec?${depositHistory}&signature=${hashDepositHistory}`,
        headers: {
            'X-MBX-APIKEY': publicKey
        }
    },
    (err, response, body) => {
        body = JSON.parse(body)
        console.log(body)

        depoIndex = body.length

        console.log("depoIndex ", depoIndex)
    }
);




(async () => {


    let listenKey


    await new Promise((resolve, reject) => {
        (function reRequest() {
            request.post(
                {
                    url: `https://api.binance.com/api/v3/userDataStream`,
                    headers: {
                        'X-MBX-APIKEY': publicKey
                    }
                },
                (err, response, body) => {
                    body = JSON.parse(body)


                    listenKey = body.listenKey
                    resolve()

                }
            )
        })()

    })


    setInterval(() => {
        (function reRequest() {
            request.put(
                {
                    url: `https://api.binance.com/api/v3/userDataStream?listenKey=${listenKey}`,
                    headers: {
                        'X-MBX-APIKEY': publicKey
                    }
                },
                (err, response, body) => {
                    if (!body || body.code) {
                        reRequest()
                    }
                }
            )
        })()
    }, 3000000)



    let closeListen = false

    let wsBin = new WebSocket(`wss://stream.binance.com:9443/ws/${listenKey}`)


    wsBin.on('open', () => console.log('Соединение мастер listenKey установлено в ' + new Date().toLocaleTimeString()))
    wsBin.on('error', (d) => {
        console.log('Ошибка!' + new Date().toLocaleTimeString())
        // d = JSON.parse(d.toString())
        console.log(d)

    })
    wsBin.on('close', function restart() {
        
    })

    wsBin.on('message', listen)
    wsBin.on('ping', data => {
        wsBin.pong(data)

    });

    

    function listen(data) {
        data = JSON.parse(data.toString())


        if (data.e === "balanceUpdate") {
            let depositHistory = `startTime=${startTimeDepoIndex}&timestamp=${Date.now()}`;
            let hashDepositHistory = signature(depositHistory);
            
            
            request.get(
                {
                    url: `https://api.binance.com/sapi/v1/capital/deposit/hisrec?${depositHistory}&signature=${hashDepositHistory}`,
                    headers: {
                        'X-MBX-APIKEY': publicKey
                    }
                },
                (err, response, body) => {
                    body = JSON.parse(body)
                    console.log(body)
                    
                    let newDepoIndex = 0

                    newDepoIndex = body.length

                    console.log("depoIndex ", depoIndex)

                    console.log('newDepoIndex ', newDepoIndex)


                    depoIndex = newDepoIndex
            
                    
                }
            );
        }

        

    }
})()