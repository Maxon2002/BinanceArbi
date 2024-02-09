// const cluster = require('cluster');

const request = require('request')

const crypto = require('crypto');

const WebSocket = require('ws');

const pm2 = require('pm2')





const accountsObj = {
    kulitsarung47: {
        address: "0x8f597dd0d455ffc24dcaf3ca02df19e0b8ec03f6",
        secretKey: "yzB9uxcdR08VPUtdcC8gNrqM4hiJ55e4Ffzs9pHbjuLdAco7AuQ88W4wjvvbNvuR",
        publicKey: "D5XElPAcZxPh8B0mrdktH2DaeItoHzd8Ne6wX9N3w4O43liA15PzVfR9dxKJw8l3",
        id: null,
        index: 0
    },
    apilareno: {
        address: "0x62ddc3c161fc6fe9c49ea1c183bdbf02161b2a46",
        secretKey: "4vFCUUpYC3cqzunklMoVSPTswkUI8DMbTkbnZEsZOEng4I1T6B2LWcCtJ3Xk9Uri",
        publicKey: "YvO1jZ6WNyCgOls9urqrzyOaAwXVmZ4SuCTnXFsIGsBfrJcJLLYATRFqg04VH9Sk",
        id: null,
        index: 1
    },
    jonomalio8: {
        address: "0x641a5d3f2872cf33549ea77a4dd7b35839e448f5",
        secretKey: "zeYIPQeaDfIgSGBoOgt4cHm8cmthhL98aCrjdkTtPoS0S8uxY7Ub9S9Tjv3rxaEd",
        publicKey: "gDDG23h7OHibUSNc4PlX05jThivGTBVVcSaczdiGbC3DEPRoVnqROYZNqc0V5Hlz",
        id: null,
        index: 2
    }
}





let howMuchAccounts = Object.keys(accountsObj).length









let countBalanceUp = 0

let workerSayChange = false


let workerIds = []

pm2.connect((err) => {
    if (err) {
        console.error(err);
        process.exit(2);
    }

    let workerId = null
    // Запуск воркера через PM2
    pm2.start({
        script: 'workers.js',
        instances: howMuchAccounts,  // Указывает количество воркеров
        name: 'worker' // Уникальное имя для процесса
    }, (err, apps) => {
        // workerId = apps[0].pm_id;
        // pm2.disconnect();
        if (err) throw err;
    });





    pm2.launchBus((err, bus) => {

        bus.on('process:msg', (packet) => {

            // console.log(packet)

            if (packet.data.type === 'open') {
                workerIds.push(packet.process.pm_id)

                if (workerIds.length === howMuchAccounts) {

                    for (let i = 0; i < workerIds.length; i++) {

                        let workerId = workerIds[i];

                        let account = accountsObj[Object.keys(accountsObj)[i]]

                        account.id = workerId

                        pm2.sendDataToProcessId({
                            id: workerId,
                            type: 'process:msg',
                            data: {
                                account
                            },
                            topic: 'startWork'
                        }, (err, res) => {
                            if (err) console.error(err);
                            // else console.log(res);
                        });

                    }

                    setTimeout(() => startWorkers(), 10000)
                    


                }
            }



            if (packet.data.type === 'balanceUp') {
                countBalanceUp++

                if (countBalanceUp === howMuchAccounts) {
                    setTimeout(() => {
                        console.log("Мастер лисен гоу")
                        startGlobalListen()
                    }, 5000)
                }
            }


        
            // отслеживать закрытия воркеров и если все закрылись, то сделать дисконект pm2

        });
    });
});






let secretKey = 'qauOJPVzeJrXwZ5whQlRkQ3em0PaDJHSwI8b39njdqrINLJZl2rQLKSYzJRs76gw'
let publicKey = 'xfZZma9C73PyUNd4JP6FlHQaS5gzYZmaaVyL2yrbFKxFrb2it2uMn1VOgwDzVjfA'

function signature(query) {
    return crypto
        .createHmac('sha256', secretKey)
        .update(query)
        .digest('hex');
}




async function startWorkers() {


    for (let i = 0; i < Object.keys(accountsObj).length; i++) {
        let account = Object.keys(accountsObj)[i];




        (function reRequest() {


            let queryWithdrawUSDT = `coin=USDT&network=BSC&address=${accountsObj[account].address}&amount=2&transactionFeeFlag=true&timestamp=${Date.now()}`;
            let hashWithdrawUSDT = signature(queryWithdrawUSDT);

            request.post(
                {
                    url: `https://api.binance.com/sapi/v1/capital/withdraw/apply?${queryWithdrawUSDT}&signature=${hashWithdrawUSDT}`,
                    headers: {
                        'X-MBX-APIKEY': publicKey
                    }
                },
                (err, response, body) => {
                    body = JSON.parse(body)
                    if (body.code) {
                        console.log(`With start USDT to ${accountsObj[account].index} `, body.code)
                        reRequest()
                    } else {
                        console.log(body)
                    }
                }
            )

        })();


        (function reRequest() {

            let queryWithdrawBTC = `coin=BTC&network=BSC&address=${accountsObj[account].address}&amount=0.0001&transactionFeeFlag=true&timestamp=${Date.now()}`;
            let hashWithdrawBTC = signature(queryWithdrawBTC);

            request.post(
                {
                    url: `https://api.binance.com/sapi/v1/capital/withdraw/apply?${queryWithdrawBTC}&signature=${hashWithdrawBTC}`,
                    headers: {
                        'X-MBX-APIKEY': publicKey
                    }
                },
                (err, response, body) => {
                    body = JSON.parse(body)
                    if (body.code) {
                        console.log(`With start BTC to ${accountsObj[account].index} `, body.code)
                        reRequest()
                    } else {
                        console.log(body)
                    }
                }
            )
        })();


        (function reRequest() {

            let queryWithdrawETH = `coin=ETH&network=BSC&address=${accountsObj[account].address}&amount=0.002&transactionFeeFlag=true&timestamp=${Date.now()}`;
            let hashWithdrawETH = signature(queryWithdrawETH);

            request.post(
                {
                    url: `https://api.binance.com/sapi/v1/capital/withdraw/apply?${queryWithdrawETH}&signature=${hashWithdrawETH}`,
                    headers: {
                        'X-MBX-APIKEY': publicKey
                    }
                },
                (err, response, body) => {
                    body = JSON.parse(body)
                    if (body.code) {
                        console.log(`With start ETH to ${accountsObj[account].index} `, body.code)
                        reRequest()
                    } else {
                        console.log(body)
                    }
                }
            )
        })();
    }





};








//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function startGlobalListen() {


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
                    if (body.code) {
                        reRequest()
                    } else {
                        listenKey = body.listenKey
                        resolve()
                    }
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
        if (!closeListen) {
            console.log('Соединение мастер listenKey закрыто из-за ошибки в ' + new Date().toLocaleTimeString())
            setTimeout(() => {
                wsBinUser = new WebSocket(`wss://stream.binance.com:9443/ws/${listenKey}`)

                wsBinUser.on('error', () => console.log('Ошибка!' + new Date().toLocaleTimeString()))

                wsBinUser.on('open', () => console.log('Соединение мастер listenKey установлено в ' + new Date().toLocaleTimeString()))
                wsBinUser.on('message', listen)
                wsBinUser.on('ping', data => {
                    wsBinUser.pong(data)
                })
                wsBinUser.on('close', restart)
            }, 500)
        } else {
            console.log('listenKey мастер закрыт')
        }
    })

    wsBin.on('message', listen)
    wsBin.on('ping', data => {
        wsBin.pong(data)

    });

    let indexUpdate = 0

    

    let howNeedIndexUpdate = 3 * howMuchAccounts


    function listen(data) {
        data = JSON.parse(data.toString())


        if (data.e === "balanceUpdate" && !workerSayChange) {
            indexUpdate++


            console.log(data)
            if (indexUpdate === howNeedIndexUpdate) {

                console.log('баланс пополнен у мастера ', indexUpdate)


                process.exit()

                
            }
        }


    }
}

