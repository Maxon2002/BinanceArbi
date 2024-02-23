// const cluster = require('cluster');

const request = require('request')

const crypto = require('crypto');

const WebSocket = require('ws');

const pm2 = require('pm2')





const accountsObj = {
    gilangsky183: {
        address: "0xff9837e2baa4570e9b71d19bde7279d959c8acfd",
        secretKey: "BBKsZLYpbealxXH3yLYBaSzz1l3kOJpoowa0eDjntuq6bvrSpsqSrYmL8e3I9YV4",
        publicKey: "dGI55mC4Y8yBNYhG6jgGgMW4hBaBJjMf8SVuqMX77vlRxGNO1EQd6a4f1LsrY9Ch",
        id: null,
        index: 0
    },
    gaskuy809: {
        address: "0x7d41701ab2c42e1b56ad5de3d5591ba9faf8867e",
        secretKey: "mMspCI4gGKq755PJz0J9vaXUhHDBilPjW1vL3JmMOWroH27mO2jq9kRS6FqNfFG7",
        publicKey: "epbSzRAF20foJjXgxTQjaGDjaFiR2HERfDXAXWuA8dLeAcehm2IIUR4o1GgD4ugX",
        id: null,
        index: 1
    },
    adipangestu0905: {
        address: "0x35214ac926d9652afd31c0009d7670eeee02eccd",
        secretKey: "enuWvg5XZZt52FGhfBIFSaTqYYMTDYsEvrC2r6cvgs9xbTxmYWxyRfmpNxjpHrIE",
        publicKey: "aoOrf78vZ2YBeXCAtTixdVAPXjJS3xbX7lnwALEk81up2KbXcFzMsZsPYlkGD92c",
        id: null,
        index: 2
    },
    n2512086: {
        address: "0xd56e80da921ff76583c0fefa95d81dbb3c05f587",
        secretKey: "wIOLesFaxSq6QxWC2oyn4ErkSVrXq63FVtbceKNghubk8P6kx06YoYmWPJRaR4Fq",
        publicKey: "Ibex81efMAPPjKO3GjJoCmvR1XHzqjHUJENYaxrRmg13eMLh9wem2cp9vlTjHPGv",
        id: null,
        index: 3
    },
    yayatkoesmayadi1: {
        address: "0x78a0e01ad327a9c3e650bff496ab67486fd9cfa2",
        secretKey: "qCiIjtVeBsXErkEmqfIpKbVgsVX9od71OrTjbUyOYlsO2C78edOc2GLfGWWoEWDt",
        publicKey: "BIwl24NI5Dk0RDXAY7BiCP6QMOeJe7pwEULOS5c1E14dYu3vJXa61I9W8qabnIDK",
        id: null,
        index: 4
    },
}





let mainAddress = '0xd742ecbbc74093e2fb3fa34888aeb0eff24d8d87'


let fixAmountUsdt = 60

let maxCommissionAllMaster = 2

let maxCommissionAllSmall = 5

let amountFirstActive = 100//amountUsdt + (amountUsdt * 2)

let maxChangeProc = 0.015


let amountUsdt = fixAmountUsdt

let howMuchAccounts = Object.keys(accountsObj).length

let baseBtc = 0
let baseEth = 0
let baseUsdt = 0

let fixAmountUsdtSmall = +(fixAmountUsdt / howMuchAccounts).toFixed(8)
let amountUsdtSmall = fixAmountUsdtSmall
let baseBtcSmall = 0
let baseEthSmall = 0
let baseUsdtSmall = 0



let indexError = 0




let countBalanceUp = 0

let workerSayChange = false

let countUpAfterChange = 0
let indexUpdateBigChange = 0

let workerEnds = false

let workerIds = []

pm2.connect((err) => {
    if (err) {
        console.error(err);
        process.exit(2);
    }

    let workerId = null
    // Запуск воркера через PM2
    pm2.start({
        script: 'workers2.js',
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
                                account,
                                maxCommissionAllSmall,
                                fixAmountUsdtSmall,
                                maxChangeProc
                            },
                            topic: 'startWork'
                        }, (err, res) => {
                            if (err) console.error(err);
                            // else console.log(res);
                        });

                    }

                    startWorkers()


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


            if (packet.data.type === 'maxChange') {

                if (!workerSayChange) {
                    workerSayChange = true
                }
            }


            if (packet.data.type === 'upAfterChange') {

                countUpAfterChange++

                if (countUpAfterChange === howMuchAccounts) {
                    countUpAfterChange = 0
                    indexUpdateBigChange = 0
                    workerSayChange = false
                }
            }

            if (packet.data.type === 'workerEnd') {

                if (!workerEnds) {
                    workerEnds = true
                }
            }
            // отслеживать закрытия воркеров и если все закрылись, то сделать дисконект pm2

        });
    });
});






let secretKey = 'L4XBqDNAkv0nhulUwxhGC0u5lsqABtipxQxLAKOFeNkolhC9QFhF1tDm5QQbFtun'
let publicKey = 'Vw8awKzMN7wGzuNZ31KLZByVAHuPu4LtOcGWTwpBaKjWryJ7sXJEoPwF0hyYJnsa'

function signature(query) {
    return crypto
        .createHmac('sha256', secretKey)
        .update(query)
        .digest('hex');
}


let pricesBid = {
    btc: {
        usdt: 0
    },
    eth: {
        usdt: 0,
        btc: 0
    },
    bnb: {
        usdt: 0
    }
}
let pricesAsk = {
    btc: {
        usdt: 0
    },
    eth: {
        usdt: 0,
        btc: 0,
    },
    bnb: {
        usdt: 0
    }
}


let dirtBtc = 0
let dirtAmountGo = 0


let amountBnb = 0


let commissionAll = 0
let maxCommissionAll = maxCommissionAllMaster
let stopGame = false


let generalDeal = false

let usdtBtcEthIndex = 0
let usdtBtcEthDeal = false

let usdtEthBtcIndex = 0
let usdtEthBtcDeal = false


let dealsAm = 0

let startPriceBtc = 0
let startPriceEth = 0

let allMoney = 0

let moneyForCommission = 0

let dontCom = false

let bigChange = false

let baseBtcInUsdt = 0
let baseEthInUsdt = 0

let hedgeForBtc = 0
let hedgeForEth = 0

let commissionBtc = 0
let commissionEth = 0

let dopComissionBtc = 0
let dopComissionEth = 0;

let lastDeal = false;
let howNeedAmountLast = 0;

let firstComBtc = 0
let firstComEth = 0


let firstDeal = true;

async function startWorkers() {


    await Promise.all([

        new Promise((resolve, reject) => {
            (function reRequest() {
                request.get(
                    {
                        url: `https://api.binance.com/api/v3/depth?symbol=BTCUSDT&limit=5`,
                        headers: {
                            'X-MBX-APIKEY': publicKey
                        }
                    },
                    (err, response, body) => {
                        body = JSON.parse(body)
                        if (body.code) {
                            console.log("Depth BTC ", body.code)
                            indexError++
                            if (indexError > 5) {
                                process.exit()
                            }
                            reRequest()
                        } else {
                            if (indexError !== 0) {
                                indexError = 0
                            }

                            startPriceBtc = +body.asks[0][0]



                            let possibleAmount = amountFirstActive / +body.asks[0][0]

                            let factAmount = Math.trunc(possibleAmount * 1000) / 1000

                            baseBtc = +(factAmount + 0.001).toFixed(3)

                            firstComBtc = +((Math.trunc(baseBtc * 0.0011 * 100000) / 100000) + 0.00001).toFixed(5)

                            commissionBtc = +(firstComBtc - (+(baseBtc + firstComBtc).toFixed(5) * 0.001)).toFixed(8)

                            baseBtcInUsdt = +(baseBtc * startPriceBtc).toFixed(8)


                            hedgeForBtc = +(baseBtcInUsdt * 0.15).toFixed(8)

                            baseBtcSmall = Math.trunc((baseBtc / howMuchAccounts) * 100000000) / 100000000

                            for (let i = 0; i < workerIds.length; i++) {

                                let workerId = workerIds[i];


                                pm2.sendDataToProcessId({
                                    id: workerId,
                                    type: 'process:msg',
                                    data: {
                                        startPriceBtc,
                                        baseBtcSmall
                                    },
                                    topic: 'startBtc'
                                }, (err, res) => {
                                    if (err) console.error(err);
                                    // else console.log(res);
                                });

                            }

                            resolve()
                        }
                    }
                )
            })()
        }),
        new Promise((resolve, reject) => {
            (function reRequest() {
                request.get(
                    {
                        url: `https://api.binance.com/api/v3/depth?symbol=ETHUSDT&limit=5`,
                        headers: {
                            'X-MBX-APIKEY': publicKey
                        }
                    },
                    (err, response, body) => {
                        body = JSON.parse(body)
                        if (body.code) {
                            console.log("Depth ETH ", body.code)
                            indexError++
                            if (indexError > 5) {
                                process.exit()
                            }
                            reRequest()
                        } else {
                            if (indexError !== 0) {
                                indexError = 0
                            }
                            startPriceEth = +body.asks[0][0]



                            let possibleAmount = amountFirstActive / +body.asks[0][0]

                            let factAmount = Math.trunc(possibleAmount * 1000) / 1000

                            baseEth = +(factAmount + 0.001).toFixed(3)

                            firstComEth = +((Math.trunc(baseEth * 0.0011 * 10000) / 10000) + 0.0001).toFixed(4)

                            commissionEth = +(firstComEth - (+(baseEth + firstComEth).toFixed(4) * 0.001)).toFixed(8)

                            baseEthInUsdt = +(baseEth * startPriceEth).toFixed(8)


                            hedgeForEth = +(baseEthInUsdt * 0.15).toFixed(8)


                            baseEthSmall = Math.trunc((baseEth / howMuchAccounts) * 10000000) / 10000000


                            for (let i = 0; i < workerIds.length; i++) {

                                let workerId = workerIds[i];


                                pm2.sendDataToProcessId({
                                    id: workerId,
                                    type: 'process:msg',
                                    data: {
                                        startPriceEth,
                                        baseEthSmall
                                    },
                                    topic: 'startEth'
                                }, (err, res) => {
                                    if (err) console.error(err);
                                    // else console.log(res);
                                });

                            }

                            resolve()
                        }
                    }
                )
            })()
        })
    ])

    await new Promise((resolve, reject) => {
        (function reRequest() {

            let howTransfer = +(hedgeForBtc + hedgeForEth).toFixed(8)

            let queryTransferFromSpot = `type=MAIN_UMFUTURE&asset=USDT&amount=${howTransfer}&timestamp=${Date.now()}`;
            let hashTransferFromSpot = signature(queryTransferFromSpot);

            request.post(
                {
                    url: `https://api.binance.com/sapi/v1/asset/transfer?${queryTransferFromSpot}&signature=${hashTransferFromSpot}`,
                    headers: {
                        'X-MBX-APIKEY': publicKey
                    }
                },
                (err, response, body) => {
                    body = JSON.parse(body)
                    if (body.code) {
                        console.log("First transfer to fut ", body.code)
                        indexError++
                        if (indexError > 5) {
                            process.exit()
                        }
                        reRequest()
                    } else {
                        if (indexError !== 0) {
                            indexError = 0
                        }
                        resolve()
                    }
                }
            )
        })()
    })



    await Promise.all([
        new Promise((resolve, reject) => {
            (function reRequest() {
                let queryOrderBuyBtcUsdt = `symbol=BTCUSDT&side=BUY&type=MARKET&quantity=${(baseBtc + firstComBtc).toFixed(5)}&timestamp=${Date.now()}`;
                let hashOrderBuyBtcUsdt = signature(queryOrderBuyBtcUsdt);

                request.post(
                    {
                        url: `https://api.binance.com/api/v3/order?${queryOrderBuyBtcUsdt}&signature=${hashOrderBuyBtcUsdt}`,
                        headers: {
                            'X-MBX-APIKEY': publicKey
                        }
                    },
                    (err, response, body) => {
                        body = JSON.parse(body)
                        if (body.code) {
                            console.log("First buy BTC ", body.code)
                            indexError++
                            if (indexError > 5) {
                                process.exit()
                            }
                            reRequest()
                        } else {
                            if (indexError !== 0) {
                                indexError = 0
                            }

                            // baseBtcInUsdt = +body.cummulativeQuoteQty


                            resolve()
                        }
                    }
                )
            })()
        }),
        new Promise((resolve, reject) => {
            (function reRequest() {
                let queryOrderSellFutBtc = `symbol=BTCUSDT&side=SELL&type=MARKET&quantity=${baseBtc}&timestamp=${Date.now()}`
                let hashOrderSellFutBtc = signature(queryOrderSellFutBtc)

                request.post(
                    {
                        url: `https://fapi.binance.com/fapi/v1/order?${queryOrderSellFutBtc}&signature=${hashOrderSellFutBtc}`,
                        headers: {
                            'X-MBX-APIKEY': publicKey
                        }
                    },
                    (err, response, body) => {
                        body = JSON.parse(body)
                        if (body.code) {
                            console.log("First sell BTC fut ", body.code)
                            indexError++
                            if (indexError > 5) {
                                process.exit()
                            }
                            reRequest()
                        } else {
                            if (indexError !== 0) {
                                indexError = 0
                            }
                            resolve()
                        }
                    }
                )
            })()
        }),
        new Promise((resolve, reject) => {
            (function reRequest() {
                let queryOrderBuyEthUsdt = `symbol=ETHUSDT&side=BUY&type=MARKET&quantity=${(baseEth + firstComEth).toFixed(4)}&timestamp=${Date.now()}`;
                let hashOrderBuyEthUsdt = signature(queryOrderBuyEthUsdt);

                request.post(
                    {
                        url: `https://api.binance.com/api/v3/order?${queryOrderBuyEthUsdt}&signature=${hashOrderBuyEthUsdt}`,
                        headers: {
                            'X-MBX-APIKEY': publicKey
                        }
                    },
                    (err, response, body) => {
                        body = JSON.parse(body)
                        if (body.code) {
                            console.log("First buy ETH ", body.code)
                            indexError++
                            if (indexError > 5) {
                                process.exit()
                            }
                            reRequest()
                        } else {
                            if (indexError !== 0) {
                                indexError = 0
                            }

                            // baseEthInUsdt = +body.cummulativeQuoteQty



                            resolve()
                        }
                    }
                )
            })()
        }),
        new Promise((resolve, reject) => {
            (function reRequest() {
                let queryOrderSellFutEth = `symbol=ETHUSDT&side=SELL&type=MARKET&quantity=${baseEth}&timestamp=${Date.now()}`
                let hashOrderSellFutEth = signature(queryOrderSellFutEth)

                request.post(
                    {
                        url: `https://fapi.binance.com/fapi/v1/order?${queryOrderSellFutEth}&signature=${hashOrderSellFutEth}`,
                        headers: {
                            'X-MBX-APIKEY': publicKey
                        }
                    },
                    (err, response, body) => {
                        body = JSON.parse(body)
                        if (body.code) {
                            console.log("First sell ETH fut ", body.code)
                            indexError++
                            if (indexError > 5) {
                                process.exit()
                            }
                            reRequest()
                        } else {
                            if (indexError !== 0) {
                                indexError = 0
                            }
                            resolve()
                        }
                    }
                )
            })()
        })
    ])


    await new Promise((resolve, reject) => {
        setTimeout(() => {
            (function reRequest() {
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
                        body = JSON.parse(body)

                        if (body.code) {
                            console.log("Check start USDT ", body.code)
                            indexError++
                            if (indexError > 5) {
                                process.exit()
                            }
                            reRequest()
                        } else {
                            if (indexError !== 0) {
                                indexError = 0
                            }
                            for (let i = 0; i < body.length; i++) {
                                if (body[i].asset === 'USDT') {

                                    baseUsdt = +body[i].free

                                    baseUsdtSmall = Math.trunc((baseUsdt / howMuchAccounts) * 100000000) / 100000000

                                    break
                                }
                            }
                            resolve()
                        }
                    }
                )

            })()
        }, 15000)
    })





    for (let i = 0; i < Object.keys(accountsObj).length; i++) {
        let account = Object.keys(accountsObj)[i];



        setTimeout(() => {
            (function reRequest() {


                let queryWithdrawUSDT = `coin=USDT&network=BSC&address=${accountsObj[account].address}&amount=${baseUsdtSmall}&transactionFeeFlag=true&timestamp=${Date.now()}`;
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
                            indexError++
                            if (indexError > 5) {
                                process.exit()
                            }
                            reRequest()
                        } else {
                            if (indexError !== 0) {
                                indexError = 0
                            }
                            console.log(body)
                        }
                    }
                )

            })();


            (function reRequest() {

                let queryWithdrawBTC = `coin=BTC&network=BSC&address=${accountsObj[account].address}&amount=${baseBtcSmall}&transactionFeeFlag=true&timestamp=${Date.now()}`;
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
                            indexError++
                            if (indexError > 5) {
                                process.exit()
                            }
                            reRequest()
                        } else {
                            if (indexError !== 0) {
                                indexError = 0
                            }
                            console.log(body)
                        }
                    }
                )
            })();


            (function reRequest() {

                let queryWithdrawETH = `coin=ETH&network=BSC&address=${accountsObj[account].address}&amount=${baseEthSmall}&transactionFeeFlag=true&timestamp=${Date.now()}`;
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
                            indexError++
                            if (indexError > 5) {
                                process.exit()
                            }
                            reRequest()
                        } else {
                            if (indexError !== 0) {
                                indexError = 0
                            }
                            console.log(body)
                        }
                    }
                )
            })();
        }, accountsObj[account].index * 2000)
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
                        indexError++
                        if (indexError > 5) {
                            process.exit()
                        }
                        reRequest()
                    } else {
                        if (indexError !== 0) {
                            indexError = 0
                        }
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
    /////// ПОДУМАТЬ ОБ ЭТОМ


    let howNeedIndexUpdate = 3 * howMuchAccounts

    let howNeedIndexUpdateBigChange = 3 * howMuchAccounts

    function listen(data) {
        data = JSON.parse(data.toString())


        if (data.e === "balanceUpdate" && !workerSayChange && workerEnds) {
            indexUpdate++


            // if (data.a === 'BTC') {
            //     let diff = +(+data.d - baseBtcSmall).toFixed(8)

            //     dirtBtc = +(dirtBtc + diff).toFixed(8)
            // }

            // if (data.a === 'BNB') {
            //     amountBnb = +(amountBnb + +data.d).toFixed(8)
            // }


            console.log(data)
            if (indexUpdate === howNeedIndexUpdate) {

                console.log('баланс пополнен у мастера ', indexUpdate)


                // dirtAmountGo = Math.trunc(dirtBtc * 100000) / 100000
                // dirtBtc = +(dirtBtc - dirtAmountGo).toFixed(8)


                setTimeout(() => {
                    global();
                }, 15000);


            }
        }

        if (data.e === "balanceUpdate" && workerSayChange) {
            indexUpdateBigChange++

            if (indexUpdateBigChange === howNeedIndexUpdateBigChange) {
                smoothMoney()
            }
        }

    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


async function global() {


    await new Promise((resolve, reject) => {
        (function reRequest() {
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
                    body = JSON.parse(body)

                    if (body.code) {
                        console.log("Check start USDT ", body.code)
                        indexError++
                        if (indexError > 5) {
                            process.exit()
                        }
                        reRequest()
                    } else {
                        if (indexError !== 0) {
                            indexError = 0
                        }
                        for (let i = 0; i < body.length; i++) {
                            if (body[i].asset === 'USDT') {

                                let factMoney = +body[i].free

                                allMoney = factMoney

                            }
                            if (body[i].asset === 'BTC') {

                                commissionBtc = +(+body[i].free - baseBtc).toFixed(8)

                            }
                            if (body[i].asset === 'ETH') {

                                commissionEth = +(+body[i].free - baseEth).toFixed(8)

                            }
                        }
                        resolve()
                    }
                }
            )

        })()
    })

    let wsBin = new WebSocket(`wss://stream.binance.com:9443/stream?streams=btcusdt@depth5@100ms/ethusdt@depth5@100ms/ethbtc@depth5@100ms/bnbusdt@depth5@100ms`)


    wsBin.on('open', () => console.log('Соединение мастер Binance установлено в ' + new Date().toLocaleTimeString()))
    wsBin.on('error', (d) => {
        console.log('Ошибка!' + new Date().toLocaleTimeString())
        // d = JSON.parse(d.toString())
        console.log(d)

    })
    wsBin.on('close', function restart() {

        if (!stopGame) {
            console.log('Соединение мастер Binance закрыто из-за ошибки в ' + new Date().toLocaleTimeString())
            setTimeout(() => {
                wsBinUser = new WebSocket(`wss://stream.binance.com:9443/stream?streams=btcusdt@depth5@100ms/ethusdt@depth5@100ms/ethbtc@depth5@100ms/bnbusdt@depth5@100ms`)

                wsBinUser.on('error', () => console.log('Ошибка!' + new Date().toLocaleTimeString()))

                wsBinUser.on('open', () => console.log('Соединение мастер Binance установлено в ' + new Date().toLocaleTimeString()))
                wsBinUser.on('message', whyNotYou)
                wsBinUser.on('ping', data => {
                    wsBinUser.pong(data)
                })
                wsBinUser.on('close', restart)
            }, 1000)
        } else {
            (async () => {


                //// проще смотреть сколько у меня всего осталось и продать всё


                let restBTC = 0
                let restETH = 0

                await new Promise((resolve, reject) => {
                    setTimeout(() => {
                        (function reRequest() {
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
                                    body = JSON.parse(body)

                                    if (body.code) {
                                        console.log(`Check end assets in ${account.index} `, body.code)
                                        indexError++
                                        if (indexError > 5) {
                                            process.exit()
                                        }
                                        reRequest()
                                    } else {
                                        if (indexError !== 0) {
                                            indexError = 0
                                        }
                                        for (let i = 0; i < body.length; i++) {
                                            if (body[i].asset === 'BTC') {

                                                restBTC = +body[i].free
                                            }
                                            if (body[i].asset === 'ETH') {

                                                restETH = +body[i].free
                                            }
                                        }
                                        resolve()
                                    }
                                }
                            )

                        })()
                    }, 15000)
                });

                restBTC = Math.trunc(restBTC * 100000) / 100000
                restETH = Math.trunc(restETH * 10000) / 10000


                await Promise.all([
                    new Promise((resolve, reject) => {
                        (function reRequest() {
                            let queryOrderSellBtcUsdt = `symbol=BTCUSDT&side=SELL&type=MARKET&quantity=${restBTC}&timestamp=${Date.now()}`;
                            let hashOrderSellBtcUsdt = signature(queryOrderSellBtcUsdt);

                            request.post(
                                {
                                    url: `https://api.binance.com/api/v3/order?${queryOrderSellBtcUsdt}&signature=${hashOrderSellBtcUsdt}`,
                                    headers: {
                                        'X-MBX-APIKEY': publicKey
                                    }
                                },
                                (err, response, body) => {
                                    body = JSON.parse(body)
                                    if (body.code) {
                                        console.log("End sell BTC ", body.code)
                                        indexError++
                                        if (indexError > 5) {
                                            process.exit()
                                        }
                                        reRequest()
                                    } else {
                                        if (indexError !== 0) {
                                            indexError = 0
                                        }

                                        resolve()
                                    }
                                }
                            )
                        })()
                    }),
                    new Promise((resolve, reject) => {
                        (function reRequest() {
                            let queryOrderBuyFutBtc = `symbol=BTCUSDT&side=BUY&type=MARKET&quantity=${baseBtc}&timestamp=${Date.now()}`
                            let hashOrderBuyFutBtc = signature(queryOrderBuyFutBtc)

                            request.post(
                                {
                                    url: `https://fapi.binance.com/fapi/v1/order?${queryOrderBuyFutBtc}&signature=${hashOrderBuyFutBtc}`,
                                    headers: {
                                        'X-MBX-APIKEY': publicKey
                                    }
                                },
                                (err, response, body) => {
                                    body = JSON.parse(body)
                                    if (body.code) {
                                        console.log("End buy BTC fut ", body.code)
                                        indexError++
                                        if (indexError > 5) {
                                            process.exit()
                                        }
                                        reRequest()
                                    } else {
                                        if (indexError !== 0) {
                                            indexError = 0
                                        }
                                        resolve()
                                    }
                                }
                            )
                        })()
                    }),
                    new Promise((resolve, reject) => {
                        (function reRequest() {
                            let queryOrderSellEthUsdt = `symbol=ETHUSDT&side=SELL&type=MARKET&quantity=${restETH}&timestamp=${Date.now()}`;
                            let hashOrderSellEthUsdt = signature(queryOrderSellEthUsdt);

                            request.post(
                                {
                                    url: `https://api.binance.com/api/v3/order?${queryOrderSellEthUsdt}&signature=${hashOrderSellEthUsdt}`,
                                    headers: {
                                        'X-MBX-APIKEY': publicKey
                                    }
                                },
                                (err, response, body) => {
                                    body = JSON.parse(body)
                                    if (body.code) {
                                        console.log("End sell ETH ", body.code)
                                        indexError++
                                        if (indexError > 5) {
                                            process.exit()
                                        }
                                        reRequest()
                                    } else {
                                        if (indexError !== 0) {
                                            indexError = 0
                                        }

                                        resolve()
                                    }
                                }
                            )
                        })()
                    }),
                    new Promise((resolve, reject) => {
                        (function reRequest() {
                            let queryOrderBuyFutEth = `symbol=ETHUSDT&side=BUY&type=MARKET&quantity=${baseEth}&timestamp=${Date.now()}`
                            let hashOrderBuyFutEth = signature(queryOrderBuyFutEth)

                            request.post(
                                {
                                    url: `https://fapi.binance.com/fapi/v1/order?${queryOrderBuyFutEth}&signature=${hashOrderBuyFutEth}`,
                                    headers: {
                                        'X-MBX-APIKEY': publicKey
                                    }
                                },
                                (err, response, body) => {
                                    body = JSON.parse(body)
                                    if (body.code) {
                                        console.log("End buy ETH fut ", body.code)
                                        indexError++
                                        if (indexError > 5) {
                                            process.exit()
                                        }
                                        reRequest()
                                    } else {
                                        if (indexError !== 0) {
                                            indexError = 0
                                        }
                                        resolve()
                                    }
                                }
                            )
                        })()
                    }),
                ])


                console.log('Дело сделано ' + new Date().toLocaleTimeString())

                process.exit()
            })()
        }
    })

    wsBin.on('message', whyNotYou)
    wsBin.on('ping', data => {
        wsBin.pong(data)

    })


    function whyNotYou(data) {
        data = JSON.parse(data.toString())
        if (data.stream === 'btcusdt@depth5@100ms') {
            let bid = data.data.bids[0][0]
            let ask = data.data.asks[0][0]

            let change = (startPriceBtc - bid) / startPriceBtc

            if (Math.abs(change) > maxChangeProc && !bigChange) {
                bigChange = true

                smoothMoney(change, 'BTC')
            }



            if (data.data.bids[0][1] < 1000) {
                for (let i = 1; i < data.data.bids.length; i++) {
                    let b = data.data.bids

                    if (b[i][1] + b[0][1] > 1000) {
                        bid = (b[i][0] + bid) / (i + 1)
                        break
                    }
                }
            }
            if (data.data.asks[0][1] < 1000) {
                for (let i = 1; i < data.data.asks.length; i++) {
                    let a = data.data.asks

                    if (a[i][1] + a[0][1] > 1000) {
                        ask = (a[i][0] + ask) / (i + 1)
                        break
                    }
                }
            }

            pricesBid.btc.usdt = bid
            pricesAsk.btc.usdt = ask
        } else if (data.stream === 'ethusdt@depth5@100ms') {

            let bid = data.data.bids[0][0]
            let ask = data.data.asks[0][0]

            let change = (startPriceEth - bid) / startPriceEth

            if (Math.abs(change) > maxChangeProc && !bigChange) {
                bigChange = true

                smoothMoney(change, 'ETH')
            }

            if (data.data.bids[0][1] < 1000) {
                for (let i = 1; i < data.data.bids.length; i++) {
                    let b = data.data.bids

                    if (b[i][1] + b[0][1] > 1000) {
                        bid = (b[i][0] + bid) / (i + 1)
                        break
                    }
                }
            }
            if (data.data.asks[0][1] < 1000) {
                for (let i = 1; i < data.data.asks.length; i++) {
                    let a = data.data.asks

                    if (a[i][1] + a[0][1] > 1000) {
                        ask = (a[i][0] + ask) / (i + 1)
                        break
                    }
                }
            }

            pricesBid.eth.usdt = bid
            pricesAsk.eth.usdt = ask
        } else if (data.stream === 'ethbtc@depth5@100ms') {

            let bid = data.data.bids[0][0]
            let ask = data.data.asks[0][0]

            if (data.data.bids[0][1] < 1000 / pricesAsk.btc.usdt) {
                for (let i = 1; i < data.data.bids.length; i++) {
                    let b = data.data.bids

                    if (b[i][1] + b[0][1] > 1000 / pricesAsk.btc.usdt) {
                        bid = (b[i][0] + bid) / (i + 1)
                        break
                    }
                }
            }
            if (data.data.asks[0][1] < 1000 / pricesAsk.btc.usdt) {
                for (let i = 1; i < data.data.asks.length; i++) {
                    let a = data.data.asks

                    if (a[i][1] + a[0][1] > 1000 / pricesAsk.btc.usdt) {
                        ask = (a[i][0] + ask) / (i + 1)
                        break
                    }
                }
            }

            pricesBid.eth.btc = bid
            pricesAsk.eth.btc = ask
        } else if (data.stream === 'bnbusdt@depth5@100ms') {

            pricesBid.bnb.usdt = data.data.bids[0][0]
            pricesAsk.bnb.usdt = data.data.asks[0][0]
        }

        if (!bigChange) {

            if (!firstDeal) {
                if (dopComissionBtc !== 0) {

                    amountUsdt = +(allMoney - 1 - dopComissionBtc * pricesAsk.btc.usdt).toFixed(8)

                    commissionBtc = +(commissionBtc + dopComissionBtc).toFixed(8)

                }

                if (dopComissionEth !== 0) {
                    amountUsdt = +(allMoney - 1 - dopComissionEth * pricesAsk.eth.usdt).toFixed(8)

                    commissionEth = +(commissionEth + dopComissionEth).toFixed(8)

                }
            }

            if (firstDeal && pricesAsk.btc.usdt !== 0 && pricesAsk.eth.usdt !== 0) {
                // dopComissionBtc = ((Math.trunc(midComissionBtc * 100000) / 100000) + 0.00001).toFixed(5)

                if (allMoney < fixAmountUsdt) {
                    amountUsdt = allMoney
                } else {
                    amountUsdt = fixAmountUsdt
                }

                dopComissionBtc = +((Math.trunc(((amountUsdt * 0.001 / pricesAsk.btc.usdt) - commissionBtc) * 100000) / 100000) + 0.00001).toFixed(5)
                commissionBtc = +(commissionBtc + dopComissionBtc).toFixed(8)

                dopComissionEth = +((Math.trunc(((amountUsdt * 0.001 / pricesAsk.eth.usdt) - commissionEth) * 10000) / 10000) + 0.0001).toFixed(4)
                commissionEth = +(commissionEth + dopComissionEth).toFixed(8)

                amountUsdt = +(allMoney - 1 - dopComissionBtc * pricesAsk.btc.usdt).toFixed(8)
                amountUsdt = +(allMoney - 1 - dopComissionEth * pricesAsk.eth.usdt).toFixed(8)

                firstDeal = false
            }



            if (amountUsdt > fixAmountUsdt) {
                amountUsdt = fixAmountUsdt
            }

            if (lastDeal) {
                if (amountUsdt > howNeedAmountLast) {
                    amountUsdt = howNeedAmountLast
                }
            }

            if (amountUsdt < 6) {
                dontCom = true

                if (lastDeal) {
                    stopGame = true

                    console.log(`commissionAll in ${account.index} `, commissionAll)
                    console.log(`dealsAm in ${account.index} `, dealsAm)
                    wsBin.close()
                }
            } else {
                if (dontCom) {
                    dontCom = false
                }
            }



            let currentAmountUsdt = amountUsdt

            let amBuyBtcUsdt = Math.trunc((currentAmountUsdt / pricesAsk.btc.usdt) * 100000) / 100000
            let amBuyEthUsdt = Math.trunc((currentAmountUsdt / pricesAsk.eth.usdt) * 10000) / 10000


            let amBuyEthBtc = Math.trunc((amBuyBtcUsdt / pricesAsk.eth.btc) * 10000) / 10000
            let amSellEthBtc = amBuyEthUsdt


            let amSellBtcUsdt = Math.trunc((amSellEthBtc * pricesBid.eth.btc) * 100000) / 100000
            let amSellEthUsdt = amBuyEthBtc




            let usdtBtcEth = currentAmountUsdt / pricesAsk.btc.usdt / pricesAsk.eth.btc * pricesBid.eth.usdt
            let usdtEthBtc = currentAmountUsdt / pricesAsk.eth.usdt * pricesBid.eth.btc * pricesBid.btc.usdt




            if ((usdtBtcEth - currentAmountUsdt) / currentAmountUsdt > 0.00017 && usdtBtcEth !== Infinity && !stopGame && currentAmountUsdt === amountUsdt) {

                usdtBtcEthIndex++

                // let wait = false

                // if (amountUsdt > allMoney) {
                //     wait = true

                //     if (allMoney > 5) {
                //         amountUsdt = allMoney
                //     } else {
                //         dontCom = true
                //     }
                // }

                if (dopComissionBtc !== 0 && dopComissionEth === 0) {
                    amBuyBtcUsdt = +(amBuyBtcUsdt + dopComissionBtc).toFixed(5)

                } else if (dopComissionEth !== 0) {
                    amBuyEthBtc = +(amBuyEthBtc + dopComissionEth).toFixed(4)

                    amBuyBtcUsdt = +((Math.trunc((amBuyEthBtc * pricesAsk.eth.btc) * 100000) / 100000) + 0.00001 + dopComissionBtc).toFixed(5)
                }

                if (usdtBtcEthIndex > 6 && !usdtBtcEthDeal && !generalDeal && !dontCom) {
                    usdtBtcEthDeal = true
                    // usdtEthBtcDeal = false
                    generalDeal = true

                    console.log("Deal usdtBtcEth")
                    console.log("dealsAm ", ++dealsAm);




                    (async () => {
                        Promise.all([
                            new Promise((resolve) => {
                                (function reRequest() {
                                    let queryOrderBuyBtcUsdt = `symbol=BTCUSDT&side=BUY&type=MARKET&quantity=${(amBuyBtcUsdt - dirtAmountGo).toFixed(5)}&timestamp=${Date.now()}`;
                                    let hashOrderBuyBtcUsdt = signature(queryOrderBuyBtcUsdt);

                                    request.post(
                                        {
                                            url: `https://api.binance.com/api/v3/order?${queryOrderBuyBtcUsdt}&signature=${hashOrderBuyBtcUsdt}`,
                                            headers: {
                                                'X-MBX-APIKEY': publicKey
                                            }
                                        },
                                        (err, response, body) => {
                                            body = JSON.parse(body)
                                            if (body.code) {
                                                console.log("Buy BTC usdtBtcEth ", body.code)
                                                indexError++
                                                if (indexError > 5) {
                                                    process.exit()
                                                }
                                                reRequest()
                                            } else {
                                                if (indexError !== 0) {
                                                    indexError = 0
                                                }
                                                // console.log('4 ', body)
                                                resolve(body)
                                            }
                                        }
                                    )
                                })()
                            }),

                            new Promise((resolve) => {
                                (function reRequest() {
                                    let queryOrderSellEthUsdt = `symbol=ETHUSDT&side=SELL&type=MARKET&quantity=${amSellEthUsdt}&timestamp=${Date.now()}`;
                                    let hashOrderSellEthUsdt = signature(queryOrderSellEthUsdt);

                                    request.post(
                                        {
                                            url: `https://api.binance.com/api/v3/order?${queryOrderSellEthUsdt}&signature=${hashOrderSellEthUsdt}`,
                                            headers: {
                                                'X-MBX-APIKEY': publicKey
                                            }
                                        },
                                        (err, response, body) => {
                                            body = JSON.parse(body)
                                            if (body.code) {
                                                console.log("Sell ETH usdtBtcEth ", body.code)
                                                indexError++
                                                if (indexError > 5) {
                                                    process.exit()
                                                }
                                                reRequest()
                                            } else {
                                                if (indexError !== 0) {
                                                    indexError = 0
                                                }
                                                // console.log('6 ', body)
                                                resolve(body)
                                            }
                                        }
                                    )
                                })()
                            }),
                            new Promise((resolve) => {
                                (function reRequest() {
                                    let queryOrderBuyEthBtc = `symbol=ETHBTC&side=BUY&type=MARKET&quantity=${amBuyEthBtc}&timestamp=${Date.now()}`;
                                    let hashOrderBuyEthBtc = signature(queryOrderBuyEthBtc);

                                    request.post(
                                        {
                                            url: `https://api.binance.com/api/v3/order?${queryOrderBuyEthBtc}&signature=${hashOrderBuyEthBtc}`,
                                            headers: {
                                                'X-MBX-APIKEY': publicKey
                                            }
                                        },
                                        (err, response, body) => {
                                            body = JSON.parse(body)
                                            if (body.code) {
                                                console.log("Buy ETH usdtBtcEth ", body.code)
                                                indexError++
                                                if (indexError > 5) {
                                                    process.exit()
                                                }
                                                reRequest()
                                            } else {
                                                if (indexError !== 0) {
                                                    indexError = 0
                                                }
                                                // console.log('5 ', body)
                                                resolve(body)
                                            }
                                        }
                                    )
                                })()
                            }),
                        ]).then(async (res) => {

                            let midComissionBtc = 0

                            let midComissionEth = 0

                            let ethPrice = 0

                            for (let i = 0; i < res.length; i++) {
                                let deal = res[i]

                                if (deal.symbol === 'BTCUSDT') {
                                    allMoney = +(allMoney - deal.cummulativeQuoteQty).toFixed(8)
                                }

                                if (deal.symbol === 'ETHUSDT') {
                                    allMoney = +(allMoney + +deal.cummulativeQuoteQty).toFixed(8)
                                }


                                for (let j = 0; j < deal.fills.length; j++) {
                                    let fill = deal.fills[j]

                                    if (fill.commissionAsset === 'BTC') {
                                        commissionBtc = +(commissionBtc - +fill.commission).toFixed(8)

                                        midComissionBtc = +(midComissionBtc + +fill.commission).toFixed(8)

                                        commissionAll = +(commissionAll - +fill.commission * +fill.price).toFixed(8)
                                    }

                                    if (fill.commissionAsset === 'USDT') {
                                        ethPrice = +fill.price
                                        commissionAll = +(commissionAll - +fill.commission).toFixed(8)

                                        allMoney = +(allMoney - +fill.commission).toFixed(8)
                                    }

                                    if (fill.commissionAsset === 'ETH') {
                                        commissionEth = +(commissionEth - +fill.commission).toFixed(8)

                                        midComissionEth = +(midComissionEth + +fill.commission).toFixed(8)

                                        commissionAll = +(commissionAll - +fill.commission * ethPrice).toFixed(8)
                                    }
                                }

                                if (deal.symbol === 'ETHBTC') {
                                    let diff = +(amBuyBtcUsdt - deal.cummulativeQuoteQty - dopComissionBtc - midComissionBtc).toFixed(8)

                                    dirtBtc = +(dirtBtc + diff).toFixed(8)

                                    dirtAmountGo = Math.trunc(dirtBtc * 100000) / 100000

                                    dirtBtc = +(dirtBtc - dirtAmountGo).toFixed(8)

                                }

                            }

                            dopComissionBtc = 0
                            dopComissionEth = 0

                            if (commissionAll + amountUsdt * 0.003 > maxCommissionAll) {

                                let lastCommission = +(maxCommissionAll - commissionAll).toFixed(8)

                                howNeedAmountLast = +(lastCommission / 0.003).toFixed(8)

                                if (howNeedAmountLast >= 6) {

                                    lastDeal = true

                                    amountUsdt = howNeedAmountLast

                                    console.log(`доп сделка в ${account.index} будет `, amountUsdt)


                                } else {

                                    stopGame = true
                                    console.log("commissionAll ", commissionAll)
                                    console.log("dealsAm ", dealsAm)
                                    wsBin.close()
                                }
                            }

                            if (commissionBtc - midComissionBtc * 1.05 <= 0) {
                                dopComissionBtc = +((Math.trunc(midComissionBtc * 1.05 * 100000) / 100000) + 0.00001).toFixed(5)

                            }

                            if (commissionEth - midComissionEth * 1.05 <= 0) {
                                dopComissionEth = +((Math.trunc(midComissionEth * 1.05 * 10000) / 10000) + 0.0001).toFixed(4)

                            }

                        })
                    })()


                    //заходим в сделку
                }
                // console.log("usdtBtcEth ", usdtBtcEth, new Date(Date.now()))
            } else {
                if (usdtBtcEthIndex > 0) {
                    usdtBtcEthIndex = 0
                    usdtBtcEthDeal = false
                }
            }



            if ((usdtEthBtc - currentAmountUsdt) / currentAmountUsdt > 0.00017 && usdtEthBtc !== Infinity && !stopGame && currentAmountUsdt === amountUsdt) {
                usdtEthBtcIndex++

                // let wait = false

                // if (amountUsdt > allMoney) {
                //     wait = true

                //     if (allMoney > 5) {
                //         amountUsdt = allMoney
                //     } else {
                //         dontCom = true
                //     }
                // }


                if (dopComissionEth !== 0 && dopComissionBtc === 0) {
                    amBuyEthUsdt = +(amBuyEthUsdt + dopComissionEth).toFixed(4)

                } else if (dopComissionBtc !== 0) {
                    amSellEthBtc = +((Math.trunc(((amSellBtcUsdt + dopComissionBtc) / pricesBid.eth.btc) * 10000) / 10000) + 0.0001).toFixed(4)

                    amBuyEthUsdt = +(amSellEthBtc + dopComissionEth).toFixed(4)
                }

                if (usdtEthBtcIndex > 6 && !usdtEthBtcDeal && !generalDeal && !dontCom) {
                    usdtEthBtcDeal = true
                    // usdtBtcEthDeal = false
                    generalDeal = true
                    console.log("Deal usdtEthBtc")
                    console.log("dealsAm ", ++dealsAm);



                    (async () => {
                        Promise.all([
                            new Promise((resolve) => {
                                (function reRequest() {
                                    let queryOrderBuyEthUsdt = `symbol=ETHUSDT&side=BUY&type=MARKET&quantity=${amBuyEthUsdt}&timestamp=${Date.now()}`;
                                    let hashOrderBuyEthUsdt = signature(queryOrderBuyEthUsdt);

                                    request.post(
                                        {
                                            url: `https://api.binance.com/api/v3/order?${queryOrderBuyEthUsdt}&signature=${hashOrderBuyEthUsdt}`,
                                            headers: {
                                                'X-MBX-APIKEY': publicKey
                                            }
                                        },
                                        (err, response, body) => {
                                            body = JSON.parse(body)
                                            if (body.code) {
                                                console.log("Buy ETH usdtEthBtc ", body.code)
                                                indexError++
                                                if (indexError > 5) {
                                                    process.exit()
                                                }
                                                reRequest()
                                            } else {
                                                if (indexError !== 0) {
                                                    indexError = 0
                                                }
                                                // console.log('1 ', body)
                                                resolve(body)
                                            }
                                        }
                                    )
                                })()
                            }),

                            new Promise((resolve) => {
                                (function reRequest() {
                                    let queryOrderSellBtcUsdt = `symbol=BTCUSDT&side=SELL&type=MARKET&quantity=${(amSellBtcUsdt + dirtAmountGo).toFixed(5)}&timestamp=${Date.now()}`;
                                    let hashOrderSellBtcUsdt = signature(queryOrderSellBtcUsdt);

                                    request.post(
                                        {
                                            url: `https://api.binance.com/api/v3/order?${queryOrderSellBtcUsdt}&signature=${hashOrderSellBtcUsdt}`,
                                            headers: {
                                                'X-MBX-APIKEY': publicKey
                                            }
                                        },
                                        (err, response, body) => {
                                            body = JSON.parse(body)
                                            if (body.code) {
                                                console.log("Sell BTC usdtEthBtc ", body.code)
                                                indexError++
                                                if (indexError > 5) {
                                                    process.exit()
                                                }
                                                reRequest()
                                            } else {
                                                if (indexError !== 0) {
                                                    indexError = 0
                                                }
                                                // console.log('3 ', body)
                                                resolve(body)
                                            }
                                        }
                                    )
                                })()
                            }),
                            new Promise((resolve) => {
                                (function reRequest() {
                                    let queryOrderSellEthBtc = `symbol=ETHBTC&side=SELL&type=MARKET&quantity=${amSellEthBtc}&timestamp=${Date.now()}`;
                                    let hashOrderSellEthBtc = signature(queryOrderSellEthBtc);

                                    request.post(
                                        {
                                            url: `https://api.binance.com/api/v3/order?${queryOrderSellEthBtc}&signature=${hashOrderSellEthBtc}`,
                                            headers: {
                                                'X-MBX-APIKEY': publicKey
                                            }
                                        },
                                        (err, response, body) => {
                                            body = JSON.parse(body)
                                            if (body.code) {
                                                console.log("Sell ETH usdtEthBtc ", body.code)
                                                indexError++
                                                if (indexError > 5) {
                                                    process.exit()
                                                }
                                                reRequest()
                                            } else {
                                                if (indexError !== 0) {
                                                    indexError = 0
                                                }
                                                // console.log('2 ', body)
                                                resolve(body)
                                            }
                                        }
                                    )
                                })()
                            }),
                        ]).then(async (res) => {

                            let midComissionBtc = 0

                            let midComissionEth = 0

                            let btcPrice = 0

                            for (let i = 0; i < res.length; i++) {
                                let deal = res[i]

                                for (let j = 0; j < deal.fills.length; j++) {
                                    let fill = deal.fills[j]

                                    if (fill.commissionAsset === 'ETH') {
                                        commissionEth = +(commissionEth - +fill.commission).toFixed(8)

                                        midComissionEth = +(midComissionEth + +fill.commission).toFixed(8)

                                        commissionAll = +(commissionAll - +fill.commission * +fill.price).toFixed(8)
                                    }

                                    if (fill.commissionAsset === 'USDT') {
                                        btcPrice = +fill.price
                                        commissionAll = +(commissionAll - +fill.commission).toFixed(8)

                                        allMoney = +(allMoney - +fill.commission).toFixed(8)
                                    }


                                    if (fill.commissionAsset === 'BTC') {
                                        commissionBtc = +(commissionBtc - +fill.commission).toFixed(8)

                                        midComissionBtc = +(midComissionBtc + +fill.commission).toFixed(8)

                                        commissionAll = +(commissionAll - +fill.commission * btcPrice).toFixed(8)
                                    }
                                }

                                if (deal.symbol === 'ETHBTC') {
                                    let diff = +(deal.cummulativeQuoteQty - amSellBtcUsdt - dopComissionBtc - midComissionBtc).toFixed(8)

                                    dirtBtc = +(dirtBtc + diff).toFixed(8)

                                    dirtAmountGo = Math.trunc(dirtBtc * 100000) / 100000

                                    dirtBtc = +(dirtBtc - dirtAmountGo).toFixed(8)

                                }

                            }

                            if (commissionAll + amountUsdt * 0.003 > maxCommissionAll) {

                                let lastCommission = +(maxCommissionAll - commissionAll).toFixed(8)

                                howNeedAmountLast = +(lastCommission / 0.003).toFixed(8)

                                if (howNeedAmountLast >= 6) {

                                    lastDeal = true

                                    amountUsdt = howNeedAmountLast

                                    console.log(`доп сделка в ${account.index} будет `, amountUsdt)

                                } else {
                                    stopGame = true
                                    console.log("commissionAll ", commissionAll)
                                    console.log("dealsAm ", dealsAm)
                                    wsBin.close()
                                }
                            }

                            if (commissionBtc - midComissionBtc * 1.05 <= 0) {
                                dopComissionBtc = +((Math.trunc(midComissionBtc * 1.05 * 100000) / 100000) + 0.00001).toFixed(5)

                            }

                            if (commissionEth - midComissionEth * 1.05 <= 0) {
                                dopComissionEth = +((Math.trunc(midComissionEth * 1.05 * 10000) / 10000) + 0.0001).toFixed(4)

                            }

                        })
                    })()

                    //заходим в сделку
                }
                // console.log("usdtEthBtc ", usdtEthBtc, new Date(Date.now()))
            } else {
                if (usdtEthBtcIndex > 0) {
                    usdtEthBtcIndex = 0
                    usdtEthBtcDeal = false
                }
            }
        }

    }














    async function smoothMoney(change) {
        // логика

        let newStartPriceBtc = 0
        let newStartPriceEth = 0

        let newBaseBtc = 0
        let newBaseEth = 0

        let newBaseBtcInUsdt = 0
        let newBaseEthInUsdt = 0

        let notionalBtc = 0
        let notionalEth = 0

        let minimumBuyBtc = 0
        let minimumBuyEth = 0

        let newHedgeForBtc = 0
        let newHedgeForEth = 0

        let newBaseBtcSmall = 0
        let newBaseEthSmall = 0


        await new Promise((resolve, reject) => {
            (function reRequest() {
                request.get(
                    {
                        url: `https://fapi.binance.com/fapi/v1/exchangeInfo`,
                        headers: {
                            'X-MBX-APIKEY': publicKey
                        }
                    },
                    (err, response, body) => {
                        body = JSON.parse(body)

                        for (let i = 0; i < body.symbols.length; i++) {
                            let element = body.symbols[i];

                            if (element.symbol === 'BTCUSDT') {
                                notionalBtc = +element.filters[5].notional ? +element.filters[5].notional : 100
                            }

                            if (element.symbol === 'ETHUSDT') {
                                notionalEth = +element.filters[5].notional ? +element.filters[5].notional : 20
                            }

                        }
                        resolve()
                    }
                )
            })()
        })


        await Promise.all([

            new Promise((resolve, reject) => {
                (function reRequest() {
                    request.get(
                        {
                            url: `https://api.binance.com/api/v3/depth?symbol=BTCUSDT&limit=5`,
                            headers: {
                                'X-MBX-APIKEY': publicKey
                            }
                        },
                        (err, response, body) => {
                            body = JSON.parse(body)
                            if (body.code) {
                                console.log("Depth BTC after bigChange ", body.code)
                                indexError++
                                if (indexError > 5) {
                                    process.exit()
                                }
                                reRequest()
                            } else {
                                if (indexError !== 0) {
                                    indexError = 0
                                }

                                newStartPriceBtc = +body.asks[0][0]

                                for (let i = 0; i < workerIds.length; i++) {

                                    let workerId = workerIds[i];


                                    pm2.sendDataToProcessId({
                                        id: workerId,
                                        type: 'process:msg',
                                        data: {
                                            startPriceBtc: newStartPriceBtc
                                        },
                                        topic: 'startBtc'
                                    }, (err, res) => {
                                        if (err) console.error(err);
                                        // else console.log(res);
                                    });

                                }



                                let possibleAmount = amountFirstActive / +body.asks[0][0]

                                let factAmount = Math.trunc(possibleAmount * 1000) / 1000

                                newBaseBtc = +(factAmount + 0.001).toFixed(3)

                                newBaseBtcSmall = Math.trunc((newBaseBtc / howMuchAccounts) * 100000000) / 100000000


                                newBaseBtcInUsdt = +(newBaseBtc * newStartPriceBtc).toFixed(8)

                                let minimumPossibleAmount = notionalBtc / +body.asks[0][0]

                                minimumBuyBtc = Math.trunc((minimumPossibleAmount + 0.001) * 1000) / 1000

                                newHedgeForBtc = +(newBaseBtcInUsdt * 0.15).toFixed(8)

                                for (let i = 0; i < workerIds.length; i++) {

                                    let workerId = workerIds[i];


                                    pm2.sendDataToProcessId({
                                        id: workerId,
                                        type: 'process:msg',
                                        data: {
                                            startPriceBtc: newStartPriceBtc,
                                            baseBtcSmall: newBaseBtcSmall
                                        },
                                        topic: 'startBtc'
                                    }, (err, res) => {
                                        if (err) console.error(err);
                                        // else console.log(res);
                                    });

                                }

                                resolve()
                            }
                        }
                    )
                })()
            }),
            new Promise((resolve, reject) => {
                (function reRequest() {
                    request.get(
                        {
                            url: `https://api.binance.com/api/v3/depth?symbol=ETHUSDT&limit=5`,
                            headers: {
                                'X-MBX-APIKEY': publicKey
                            }
                        },
                        (err, response, body) => {
                            body = JSON.parse(body)
                            if (body.code) {
                                console.log("Depth ETH after bigChange ", body.code)
                                indexError++
                                if (indexError > 5) {
                                    process.exit()
                                }
                                reRequest()
                            } else {
                                if (indexError !== 0) {
                                    indexError = 0
                                }

                                newStartPriceEth = +body.asks[0][0]



                                let possibleAmount = amountFirstActive / +body.asks[0][0]

                                let factAmount = Math.trunc(possibleAmount * 1000) / 1000

                                newBaseEth = +(factAmount + 0.001).toFixed(3)

                                newBaseEthSmall = Math.trunc((newBaseEth / howMuchAccounts) * 10000000) / 10000000


                                newBaseEthInUsdt = +(newBaseEth * newStartPriceEth).toFixed(8)


                                let minimumPossibleAmount = notionalEth / +body.asks[0][0]

                                minimumBuyEth = Math.trunc((minimumPossibleAmount + 0.002) * 1000) / 1000

                                newHedgeForEth = +(newBaseEthInUsdt * 0.15).toFixed(8)

                                for (let i = 0; i < workerIds.length; i++) {

                                    let workerId = workerIds[i];


                                    pm2.sendDataToProcessId({
                                        id: workerId,
                                        type: 'process:msg',
                                        data: {
                                            startPriceEth: newStartPriceEth,
                                            baseEthSmall: newBaseEthSmall
                                        },
                                        topic: 'startEth'
                                    }, (err, res) => {
                                        if (err) console.error(err);
                                        // else console.log(res);
                                    });

                                }

                                resolve()
                            }
                        }
                    )
                })()
            })
        ])


        let sideMinusBtc = null

        let changeBtcProc = (startPriceBtc - newStartPriceBtc) / startPriceBtc

        if (changeBtcProc > 0) {
            sideMinusBtc = 'spot'
        } else {
            sideMinusBtc = 'fut'
        }

        let howChangeBtc = Math.abs(baseBtcInUsdt * changeBtcProc)

        let diffHedgeBtc = +(hedgeForBtc - newHedgeForBtc).toFixed(8)


        let sideMinusEth = null

        let changeEthProc = (startPriceEth - newStartPriceEth) / startPriceEth

        if (changeEthProc > 0) {
            sideMinusEth = 'spot'
        } else {
            sideMinusEth = 'fut'
        }

        let howChangeEth = Math.abs(baseEthInUsdt * changeEthProc)

        let diffHedgeEth = +(hedgeForEth - newHedgeForEth).toFixed(8)


        let sideDealBtc = null
        let sideDealBtcFut = null

        let dopMinimumBtc = null

        let diffBaseBtc = +(baseBtc - newBaseBtc).toFixed(3)

        if (diffBaseBtc < 0) {

            sideDealBtc = 'BUY'

            sideDealBtcFut = 'SELL'

            diffBaseBtc = Math.abs(diffBaseBtc)

            if (diffBaseBtc < minimumBuyBtc) {
                dopMinimumBtc = +(minimumBuyBtc - diffBaseBtc).toFixed(3)
            }

        } else if (diffBaseBtc > 0) {
            sideDealBtc = 'SELL'

            sideDealBtcFut = 'BUY'


            diffBaseBtc = Math.abs(diffBaseBtc)
        }


        let sideDealEth = null
        let sideDealEthFut = null

        let dopMinimumEth = null

        let diffBaseEth = +(baseEth - newBaseEth).toFixed(3)

        if (diffBaseEth < 0) {

            sideDealEth = 'BUY'

            sideDealEthFut = 'SELL'

            diffBaseEth = Math.abs(diffBaseEth)

            if (diffBaseEth < minimumBuyEth) {
                dopMinimumEth = +(minimumBuyEth - diffBaseEth).toFixed(3)
            }

        } else if (diffBaseEth > 0) {
            sideDealEth = 'SELL'

            sideDealEthFut = 'BUY'

            diffBaseEth = Math.abs(diffBaseEth)
        }


        let howTransfer = 0
        let typeTransfer = null

        if (sideMinusBtc === 'spot' && sideMinusEth === 'spot') {

            howTransfer = +(howChangeBtc + howChangeEth + diffHedgeBtc + diffHedgeEth).toFixed(8);

            typeTransfer = 'UMFUTURE_MAIN'
        } else if (sideMinusBtc === 'fut' && sideMinusEth === 'fut') {
            howTransfer = +(howChangeBtc + howChangeEth - diffHedgeBtc - diffHedgeEth).toFixed(8);

            typeTransfer = 'MAIN_UMFUTURE'
        };

        (function reRequest() {
            let queryTransferFromFut = `type=${typeTransfer}&asset=USDT&amount=${howTransfer}&timestamp=${Date.now()}`;
            let hashTransferFromFut = signature(queryTransferFromFut);

            request.post(
                {
                    url: `https://api.binance.com/sapi/v1/asset/transfer?${queryTransferFromFut}&signature=${hashTransferFromFut}`,
                    headers: {
                        'X-MBX-APIKEY': publicKey
                    }
                },
                (err, response, body) => {
                    body = JSON.parse(body)
                    if (body.code) {
                        console.log(`Trans ${typeTransfer} after bigChange `, body.code)
                        indexError++
                        if (indexError > 5) {
                            process.exit()
                        }
                        reRequest()
                    } else {
                        if (indexError !== 0) {
                            indexError = 0
                        }

                        buyCoinsEnd()

                    }
                }
            )
        })();



        // firstComBtc = +((Math.trunc(baseBtc * 0.0011 * 100000) / 100000) + 0.00001).toFixed(5)

        let smallDopComBtc = 0
        let smallDopComEth = 0

        if (sideDealBtc === 'BUY') {
            if (diffBaseBtc * 0.001 < commissionBtc) {
                commissionBtc = +(commissionBtc - diffBaseBtc * 0.001).toFixed(8)
            } else {
                smallDopComBtc = +((Math.trunc(diffBaseBtc * 0.0011 * 100000) / 100000) + 0.00001).toFixed(5)
                // commissionBtc = +(firstComBtc - (+(baseBtc + firstComBtc).toFixed(5) * 0.001)).toFixed(8)

                let restDopComBtc = +(smallDopComBtc - (+(diffBaseBtc + smallDopComBtc).toFixed(5) * 0.001)).toFixed(8)

                commissionBtc = +(commissionBtc + restDopComBtc).toFixed(8)
            }
        }

        if (sideDealEth === 'BUY') {
            if (diffBaseEth * 0.001 < commissionEth) {
                commissionEth = +(commissionEth - diffBaseEth * 0.001).toFixed(8)
            } else {
                smallDopComEth = +((Math.trunc(diffBaseEth * 0.0011 * 10000) / 10000) + 0.0001).toFixed(4)

                let restDopComEth = +(smallDopComEth - (+(diffBaseEth + smallDopComEth).toFixed(4) * 0.001)).toFixed(8)

                commissionEth = +(commissionEth + restDopComEth).toFixed(8)
            }
        }

        async function buyCoinsEnd() {




            await Promise.all([
                new Promise((resolve, reject) => {
                    if (sideDealBtc) {

                        (function reRequest() {
                            let queryOrderBuyBtcUsdt = `symbol=BTCUSDT&side=${sideDealBtc}&type=MARKET&quantity=${(diffBaseBtc + smallDopComBtc).toFixed(5)}&timestamp=${Date.now()}`;
                            let hashOrderBuyBtcUsdt = signature(queryOrderBuyBtcUsdt);

                            request.post(
                                {
                                    url: `https://api.binance.com/api/v3/order?${queryOrderBuyBtcUsdt}&signature=${hashOrderBuyBtcUsdt}`,
                                    headers: {
                                        'X-MBX-APIKEY': publicKey
                                    }
                                },
                                (err, response, body) => {
                                    body = JSON.parse(body)
                                    if (body.code) {
                                        console.log(`${sideDealBtc} BTC bigChange `, body.code)
                                        indexError++
                                        if (indexError > 5) {
                                            process.exit()
                                        }
                                        reRequest()
                                    } else {
                                        if (indexError !== 0) {
                                            indexError = 0
                                        }


                                        resolve()
                                    }
                                }
                            )
                        })()
                    }
                }),
                new Promise((resolve, reject) => {
                    if (sideDealBtc) {

                        if (!dopMinimumBtc) {

                            let reduce = false

                            if (sideDealBtcFut === 'BUY') {
                                reduce = true
                            }

                            (function reRequest() {
                                let queryOrderSellFutBtc = `symbol=BTCUSDT&side=${sideDealBtcFut}&type=MARKET&quantity=${diffBaseBtc}&reduceOnly=${reduce}&timestamp=${Date.now()}`
                                let hashOrderSellFutBtc = signature(queryOrderSellFutBtc)

                                request.post(
                                    {
                                        url: `https://fapi.binance.com/fapi/v1/order?${queryOrderSellFutBtc}&signature=${hashOrderSellFutBtc}`,
                                        headers: {
                                            'X-MBX-APIKEY': publicKey
                                        }
                                    },
                                    (err, response, body) => {
                                        body = JSON.parse(body)
                                        if (body.code) {
                                            console.log(`${sideDealBtcFut} BTC fut bigChange `, body.code)
                                            indexError++
                                            if (indexError > 5) {
                                                process.exit()
                                            }
                                            reRequest()
                                        } else {
                                            if (indexError !== 0) {
                                                indexError = 0
                                            }
                                            resolve()
                                        }
                                    }
                                )
                            })()
                        } else {
                            (function reRequest() {
                                let queryOrderSellFutBtc = `symbol=BTCUSDT&side=${sideDealBtc}&type=MARKET&quantity=${dopMinimumBtc}&reduceOnly=true&timestamp=${Date.now()}`
                                let hashOrderSellFutBtc = signature(queryOrderSellFutBtc)

                                request.post(
                                    {
                                        url: `https://fapi.binance.com/fapi/v1/order?${queryOrderSellFutBtc}&signature=${hashOrderSellFutBtc}`,
                                        headers: {
                                            'X-MBX-APIKEY': publicKey
                                        }
                                    },
                                    (err, response, body) => {
                                        body = JSON.parse(body)
                                        if (body.code) {
                                            console.log("Buy BTC fut for dopMinus ", body.code)
                                            indexError++
                                            if (indexError > 5) {
                                                process.exit()
                                            }
                                            reRequest()
                                        } else {
                                            if (indexError !== 0) {
                                                indexError = 0
                                            }
                                            (function reRequest() {
                                                let queryOrderSellFutBtc = `symbol=BTCUSDT&side=${sideDealBtcFut}&type=MARKET&quantity=${minimumBuyBtc}&timestamp=${Date.now()}`
                                                let hashOrderSellFutBtc = signature(queryOrderSellFutBtc)

                                                request.post(
                                                    {
                                                        url: `https://fapi.binance.com/fapi/v1/order?${queryOrderSellFutBtc}&signature=${hashOrderSellFutBtc}`,
                                                        headers: {
                                                            'X-MBX-APIKEY': publicKey
                                                        }
                                                    },
                                                    (err, response, body) => {
                                                        body = JSON.parse(body)
                                                        if (body.code) {
                                                            console.log("Sell BTC fut after dopMinus ", body.code)
                                                            indexError++
                                                            if (indexError > 5) {
                                                                process.exit()
                                                            }
                                                            reRequest()
                                                        } else {
                                                            if (indexError !== 0) {
                                                                indexError = 0
                                                            }
                                                            resolve()
                                                        }
                                                    }
                                                )
                                            })()
                                        }
                                    }
                                )
                            })()
                        }
                    }
                }),
                new Promise((resolve, reject) => {
                    if (sideDealEth) {


                        (function reRequest() {
                            let queryOrderBuyEthUsdt = `symbol=ETHUSDT&side=${sideDealEth}&type=MARKET&quantity=${(diffBaseEth + smallDopComEth).toFixed(4)}&timestamp=${Date.now()}`;
                            let hashOrderBuyEthUsdt = signature(queryOrderBuyEthUsdt);

                            request.post(
                                {
                                    url: `https://api.binance.com/api/v3/order?${queryOrderBuyEthUsdt}&signature=${hashOrderBuyEthUsdt}`,
                                    headers: {
                                        'X-MBX-APIKEY': publicKey
                                    }
                                },
                                (err, response, body) => {
                                    body = JSON.parse(body)
                                    if (body.code) {
                                        console.log(`${sideDealEth} ETH bigChange `, body.code)
                                        indexError++
                                        if (indexError > 5) {
                                            process.exit()
                                        }
                                        reRequest()
                                    } else {
                                        if (indexError !== 0) {
                                            indexError = 0
                                        }



                                        resolve()
                                    }
                                }
                            )
                        })()
                    }
                }),
                new Promise((resolve, reject) => {
                    if (sideDealEth) {

                        if (!dopMinimumEth) {

                            let reduce = false

                            if (sideDealEthFut === 'BUY') {
                                reduce = true
                            }

                            (function reRequest() {
                                let queryOrderSellFutEth = `symbol=ETHUSDT&side=${sideDealEthFut}&type=MARKET&quantity=${diffBaseEth}&reduceOnly=${reduce}&timestamp=${Date.now()}`
                                let hashOrderSellFutEth = signature(queryOrderSellFutEth)

                                request.post(
                                    {
                                        url: `https://fapi.binance.com/fapi/v1/order?${queryOrderSellFutEth}&signature=${hashOrderSellFutEth}`,
                                        headers: {
                                            'X-MBX-APIKEY': publicKey
                                        }
                                    },
                                    (err, response, body) => {
                                        body = JSON.parse(body)
                                        if (body.code) {
                                            console.log(`${sideDealEthFut} ETH fut bigChange `, body.code)
                                            indexError++
                                            if (indexError > 5) {
                                                process.exit()
                                            }
                                            reRequest()
                                        } else {
                                            if (indexError !== 0) {
                                                indexError = 0
                                            }
                                            resolve()
                                        }
                                    }
                                )
                            })()
                        } else {
                            (function reRequest() {
                                let queryOrderSellFutEth = `symbol=ETHUSDT&side=${sideDealEth}&type=MARKET&quantity=${dopMinimumEth}&reduceOnly=true&timestamp=${Date.now()}`
                                let hashOrderSellFutEth = signature(queryOrderSellFutEth)

                                request.post(
                                    {
                                        url: `https://fapi.binance.com/fapi/v1/order?${queryOrderSellFutEth}&signature=${hashOrderSellFutEth}`,
                                        headers: {
                                            'X-MBX-APIKEY': publicKey
                                        }
                                    },
                                    (err, response, body) => {
                                        body = JSON.parse(body)
                                        if (body.code) {
                                            console.log("Buy ETH fut for dopMinus ", body.code)
                                            indexError++
                                            if (indexError > 5) {
                                                process.exit()
                                            }
                                            reRequest()
                                        } else {
                                            if (indexError !== 0) {
                                                indexError = 0
                                            }
                                            (function reRequest() {
                                                let queryOrderSellFutEth = `symbol=ETHUSDT&side=${sideDealEthFut}&type=MARKET&quantity=${minimumBuyEth}&timestamp=${Date.now()}`
                                                let hashOrderSellFutEth = signature(queryOrderSellFutEth)

                                                request.post(
                                                    {
                                                        url: `https://fapi.binance.com/fapi/v1/order?${queryOrderSellFutEth}&signature=${hashOrderSellFutEth}`,
                                                        headers: {
                                                            'X-MBX-APIKEY': publicKey
                                                        }
                                                    },
                                                    (err, response, body) => {
                                                        body = JSON.parse(body)
                                                        if (body.code) {
                                                            console.log("Sell ETH fut after dopMinus ", body.code)
                                                            indexError++
                                                            if (indexError > 5) {
                                                                process.exit()
                                                            }
                                                            reRequest()
                                                        } else {
                                                            if (indexError !== 0) {
                                                                indexError = 0
                                                            }
                                                            resolve()
                                                        }
                                                    }
                                                )
                                            })()
                                        }
                                    }
                                )
                            })()
                        }
                    }
                })
            ])



            startPriceBtc = newStartPriceBtc
            startPriceEth = newStartPriceEth

            baseBtc = newBaseBtc
            baseEth = newBaseEth

            baseBtcSmall = newBaseBtcSmall
            baseEthSmall = newBaseEthSmall

            hedgeForBtc = newHedgeForBtc
            hedgeForEth = newHedgeForEth

            baseBtcInUsdt = newBaseBtcInUsdt
            baseEthInUsdt = newBaseEthInUsdt


            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    (function reRequest() {
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
                                body = JSON.parse(body)

                                if (body.code) {
                                    console.log("Check bigChange USDT ", body.code)
                                    indexError++
                                    if (indexError > 5) {
                                        process.exit()
                                    }
                                    reRequest()
                                } else {
                                    if (indexError !== 0) {
                                        indexError = 0
                                    }
                                    for (let i = 0; i < body.length; i++) {
                                        if (body[i].asset === 'USDT') {

                                            if (bigChange) {
                                                let factMoney = +body[i].free
                                                firstDeal = true
                                                allMoney = factMoney




                                            } else if (workerSayChange) {

                                                baseUsdt = +body[i].free

                                                baseUsdtSmall = Math.trunc((baseUsdt / howMuchAccounts) * 100000000) / 100000000
                                            }

                                            break
                                        }
                                    }
                                    resolve()
                                }
                            }
                        )

                    })()
                }, 15000)
            })



            if (bigChange) {
                bigChange = false

            } else if (workerSayChange) {


                for (let i = 0; i < Object.keys(accountsObj).length; i++) {
                    let account = Object.keys(accountsObj)[i];

                    setTimeout(() => {
                        (function reRequest() {


                            let queryWithdrawUSDT = `coin=USDT&network=BSC&address=${accountsObj[account].address}&amount=${baseUsdtSmall}&transactionFeeFlag=true&timestamp=${Date.now()}`;
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
                                        console.log(`With bigChange USDT to ${accountsObj[account].index} `, body.code)
                                        indexError++
                                        if (indexError > 5) {
                                            process.exit()
                                        }
                                        reRequest()
                                    } else {
                                        if (indexError !== 0) {
                                            indexError = 0
                                        }
                                        console.log(body)
                                    }
                                }
                            )

                        })();


                        (function reRequest() {

                            let queryWithdrawBTC = `coin=BTC&network=BSC&address=${accountsObj[account].address}&amount=${baseBtcSmall}&transactionFeeFlag=true&timestamp=${Date.now()}`;
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
                                        console.log(`With bigChange BTC to ${accountsObj[account].index} `, body.code)
                                        indexError++
                                        if (indexError > 5) {
                                            process.exit()
                                        }
                                        reRequest()
                                    } else {
                                        if (indexError !== 0) {
                                            indexError = 0
                                        }
                                        console.log(body)
                                    }
                                }
                            )
                        })();


                        (function reRequest() {

                            let queryWithdrawETH = `coin=ETH&network=BSC&address=${accountsObj[account].address}&amount=${baseEthSmall}&transactionFeeFlag=true&timestamp=${Date.now()}`;
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
                                        console.log(`With bigChange ETH to ${accountsObj[account].index} `, body.code)
                                        indexError++
                                        if (indexError > 5) {
                                            process.exit()
                                        }
                                        reRequest()
                                    } else {
                                        if (indexError !== 0) {
                                            indexError = 0
                                        }
                                        console.log(body)
                                    }
                                }
                            )
                        })();
                    }, accountsObj[account].index * 2000)
                }




            }





        }






    }













    let today = new Date().getUTCDate()

    setInterval(() => {
        if (new Date().getUTCDate() !== today) {
            today = new Date().getUTCDate();

            setTimeout(async () => {

                (function reRequest() {
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
                            body = JSON.parse(body)

                            if (body.code) {
                                console.log("Check USDT after day ", body.code)
                                indexError++
                                if (indexError > 5) {
                                    process.exit()
                                }
                                reRequest()
                            } else {
                                if (indexError !== 0) {
                                    indexError = 0
                                }
                                for (let i = 0; i < body.length; i++) {
                                    if (body[i].asset === 'USDT') {


                                        let factMoney = +body[i].free
                                        firstDeal = true
                                        allMoney = factMoney




                                        break
                                    }
                                }
                            }
                        }
                    )

                })()
            }, 900000)
        }
    }, 300000)

















}









///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////