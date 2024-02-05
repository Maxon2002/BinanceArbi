// const cluster = require('cluster');

const request = require('request')

const crypto = require('crypto');

const WebSocket = require('ws');

const pm2 = require('pm2')





const accountsObj = {
    zizeta49: {
        address: "0xea289b8f9ed70c52f4f6bdedd03e6d7d775359a1",
        secretKey: "fAKWJM5y9rqXntMbZ4B2Ai77551DKBTwAyWhRMvlVPyAW7vOSA8PBUD13ufoZD1h",
        publicKey: "fvjD6cn9y3CBuE1x2VPmz8iNzCDxm02HBao6xYFQ1NsL3fDIRDWebdL81lnoze58",
        id: null,
        index: 0
    },
    bonazek13: {
        address: "0x17913977bd43b8c5f627b4415dafa6c0343ca737",
        secretKey: "tiMenvZsQQsifpRx8lo6YTaT9yZqbhY5XVU8Ua0Kg03NoHF8lfVxtvq7MuXLcoT8",
        publicKey: "tiIr8NkIgxutRjGFS1pfhieLcqgqTfLEjjeFOysvENa2SQIon4yHO54tcXux0kCx",
        id: null,
        index: 1
    },
    Memekbaseh887: {
        address: "0x6f37ebeba16b04a282176633f0541ebbf891f027",
        secretKey: "UHuNOpRq2q4fyBVLiT0QAAgx6UDkInxKaN9XzrQzPDFStazneIAyNtslCosCiYg1",
        publicKey: "9ZpEO4hn2P8IDd6PTsIArHBK3GpxvP2u52cgajNuSThXQL80ki3yWXBiRlciTvQN",
        id: null,
        index: 2
    },
    eedfft176: {
        address: "0x67b2421737b0d877ba0597f7959bb2e0a21f6c00",
        secretKey: "hgUajZF5wRk1CMEpyZKVBP3BRkuHcBZfwMSsKBDglWkTt7rD9J9R1WaIQgI2pWkj",
        publicKey: "goiAEbfg8UI3wO22jp90VQphaThRp76zCtgHAEcGZJz4wpMFCBbqrS6H9h14hY3y",
        id: null,
        index: 3
    },
    bekaskunci35: {
        address: "0x358f62cd623cd022a56777f793e0d5b29faf767b",
        secretKey: "rrGx1r0h2wcA0HJ0dgGHEqt3t1FuJtU1W7vHF8f4QzqnFDoqKvMyvuti9ZenmvA1",
        publicKey: "G7WHvqoiQcPSeEmfmm0fCLC3fWrcT84xa1Bm6UoBsquDDokiaGkcffETkdbTxY0q",
        id: null,
        index: 4
    },
}





let mainAddress = '0x3a067152e876bbc10ac1bb3bb4fca7eb583a8f8f'


let fixAmountUsdt = 35

let maxCommissionAllMaster = 2

let maxCommissionAllSmall = 15

let amountFirstActive = 105//amountUsdt + (amountUsdt * 2)

let maxChangeProc = 0.1


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







let countBalanceUp = 0

let workerSayChange = false

let countUpAfterChange = 0
let indexUpdateBigChange = 0

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

                if (countUpAfterChange === howMuchAccounts){
                    countUpAfterChange = 0
                    indexUpdateBigChange = 0
                    workerSayChange = false
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
                            reRequest()
                        } else {

                            startPriceBtc = +body.asks[0][0]

                            for (let i = 0; i < workerIds.length; i++) {

                                let workerId = workerIds[i];


                                pm2.sendDataToProcessId({
                                    id: workerId,
                                    type: 'process:msg',
                                    data: {
                                        startPriceBtc
                                    },
                                    topic: 'startBtc'
                                }, (err, res) => {
                                    if (err) console.error(err);
                                    // else console.log(res);
                                });

                            }



                            let possibleAmount = amountFirstActive / +body.asks[0][0]

                            let factAmount = Math.trunc(possibleAmount * 1000) / 1000

                            baseBtc = +(factAmount + 0.001).toFixed(3)

                            hedgeForBtc = +(baseBtc * startPriceBtc * 0.15).toFixed(8)

                            baseBtcSmall = Math.trunc((baseBtc / howMuchAccounts) * 100000000) / 100000000

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
                            reRequest()
                        } else {
                            startPriceEth = +body.asks[0][0]

                            for (let i = 0; i < workerIds.length; i++) {

                                let workerId = workerIds[i];


                                pm2.sendDataToProcessId({
                                    id: workerId,
                                    type: 'process:msg',
                                    data: {
                                        startPriceEth
                                    },
                                    topic: 'startEth'
                                }, (err, res) => {
                                    if (err) console.error(err);
                                    // else console.log(res);
                                });

                            }

                            let possibleAmount = amountFirstActive / +body.asks[0][0]

                            let factAmount = Math.trunc(possibleAmount * 1000) / 1000

                            baseEth = +(factAmount + 0.001).toFixed(3)

                            // if (baseEth < 0.01) {
                            //     baseEth = 0.01
                            // }

                            hedgeForEth = +(baseEth * startPriceEth * 0.15).toFixed(8)


                            baseEthSmall = Math.trunc((baseEth / howMuchAccounts) * 10000000) / 10000000

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
                        reRequest()
                    } else {
                        resolve()
                    }
                }
            )
        })()
    })


    await new Promise((resolve, reject) => {
        (function reRequest() {
            let queryOrderBuyBnbUsdt = `symbol=BNBUSDT&side=BUY&type=MARKET&quoteOrderQty=5&timestamp=${Date.now()}`;
            let hashOrderBuyBnbUsdt = signature(queryOrderBuyBnbUsdt);

            request.post(
                {
                    url: `https://api.binance.com/api/v3/order?${queryOrderBuyBnbUsdt}&signature=${hashOrderBuyBnbUsdt}`,
                    headers: {
                        'X-MBX-APIKEY': publicKey
                    }
                },
                (err, response, body) => {
                    body = JSON.parse(body)
                    if (body.code) {
                        console.log("First buy BNB ", body.code)
                        reRequest()
                    } else {
                        amountBnb = +body.origQty

                        resolve()
                    }
                }
            )
        })()
    })


    await Promise.all([
        new Promise((resolve, reject) => {
            (function reRequest() {
                let queryOrderBuyBtcUsdt = `symbol=BTCUSDT&side=BUY&type=MARKET&quantity=${baseBtc}&timestamp=${Date.now()}`;
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
                            reRequest()
                        } else {

                            baseBtcInUsdt = +body.cummulativeQuoteQty

                            for (let j = 0; j < body.fills.length; j++) {
                                let fill = body.fills[j]

                                amountBnb -= +fill.commission
                            }
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
                            reRequest()
                        } else {
                            resolve()
                        }
                    }
                )
            })()
        }),
        new Promise((resolve, reject) => {
            (function reRequest() {
                let queryOrderBuyEthUsdt = `symbol=ETHUSDT&side=BUY&type=MARKET&quantity=${baseEth}&timestamp=${Date.now()}`;
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
                            reRequest()
                        } else {

                            baseEthInUsdt = +body.cummulativeQuoteQty

                            for (let j = 0; j < body.fills.length; j++) {
                                let fill = body.fills[j]

                                amountBnb -= +fill.commission
                            }

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
                            reRequest()
                        } else {
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
                            reRequest()
                        } else {
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
                        reRequest()
                    } else {
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
                        reRequest()
                    } else {
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

    

    let howNeedIndexUpdate = 4 * howMuchAccounts

    let howNeedIndexUpdateBigChange = 3 * howMuchAccounts

    function listen(data) {
        data = JSON.parse(data.toString())


        if (data.e === "balanceUpdate" && !workerSayChange) {
            indexUpdate++


            if (data.a === 'BTC') {
                let diff = +(+data.d - baseBtcSmall).toFixed(8)

                dirtBtc = +(dirtBtc + diff).toFixed(8)
            }

            if (data.a === 'BNB') {
                amountBnb = +(amountBnb + +data.d).toFixed(8)
            }


            console.log(data)
            if (indexUpdate === howNeedIndexUpdate) {

                console.log('баланс пополнен у мастера ', indexUpdate)


                dirtAmountGo = Math.trunc(dirtBtc * 100000) / 100000
                dirtBtc = +(dirtBtc - dirtAmountGo).toFixed(8)


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
            request.get(
                {
                    url: `https://api.binance.com/api/v3/depth?symbol=BNBUSDT&limit=5`,
                    headers: {
                        'X-MBX-APIKEY': publicKey
                    }
                },
                (err, response, body) => {
                    body = JSON.parse(body)
                    if (body.code) {
                        console.log("Depth BNB ", body.code)
                        reRequest()
                    } else {

                        let price = +body.bids[0][0]

                        let myBnbInUsdt = amountBnb * price

                        console.log('myBnbInUsdt у мастера ', myBnbInUsdt)

                        if (myBnbInUsdt < 3) {
                            (function reRequest() {
                                let queryOrderBuyBnbUsdt = `symbol=BNBUSDT&side=BUY&type=MARKET&quoteOrderQty=5&timestamp=${Date.now()}`;
                                let hashOrderBuyBnbUsdt = signature(queryOrderBuyBnbUsdt);

                                request.post(
                                    {
                                        url: `https://api.binance.com/api/v3/order?${queryOrderBuyBnbUsdt}&signature=${hashOrderBuyBnbUsdt}`,
                                        headers: {
                                            'X-MBX-APIKEY': publicKey
                                        }
                                    },
                                    (err, response, body) => {
                                        body = JSON.parse(body)
                                        if (body.code) {
                                            console.log("Buy BNB myBnbInUsdt in start small", body.code)
                                            reRequest()
                                        } else {
                                            amountBnb = +(+body.origQty + amountBnb).toFixed(8)


                                            // allMoney = +(allMoney - body.cummulativeQuoteQty).toFixed(8)

                                            resolve()
                                        }
                                    }
                                )
                            })()
                        } else {
                            let howNeedBnb = Math.trunc((5 / price) * 1000) / 1000

                            let clearAmountBnb = Math.trunc(amountBnb * 1000) / 1000

                            let howSellBnb = +(clearAmountBnb - howNeedBnb).toFixed(3)

                            if (howSellBnb * price > 5.5) {
                                (function reRequest() {
                                    let queryOrderSellBnbUsdt = `symbol=BNBUSDT&side=SELL&type=MARKET&quantity=${howSellBnb}&timestamp=${Date.now()}`;
                                    let hashOrderSellBnbUsdt = signature(queryOrderSellBnbUsdt);

                                    request.post(
                                        {
                                            url: `https://api.binance.com/api/v3/order?${queryOrderSellBnbUsdt}&signature=${hashOrderSellBnbUsdt}`,
                                            headers: {
                                                'X-MBX-APIKEY': publicKey
                                            }
                                        },
                                        (err, response, body) => {
                                            body = JSON.parse(body)
                                            if (body.code) {
                                                console.log("Sell лишний BNB ", body.code)
                                                reRequest()
                                            } else {
                                                amountBnb = +(amountBnb - howSellBnb).toFixed(8)


                                                console.log('amountBnb у мастера после продажи лишнего ', amountBnb)
                                                console.log('amountBnb в долларах у мастера после продажи лишнего ', amountBnb * price)


                                                resolve()
                                            }
                                        }
                                    )
                                })()
                            } else {
                                console.log('bnb недостаточно для продажи')

                                resolve()
                            }
                        }

                    }
                }
            )
        })()
    })





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
                        reRequest()
                    } else {
                        for (let i = 0; i < body.length; i++) {
                            if (body[i].asset === 'USDT') {

                                // смотреть чтобы хватало амаунта


                                let factMoney = +body[i].free

                                allMoney = factMoney

                                let some = +(factMoney - fixAmountUsdt).toFixed(8)

                                if (some <= 0) {
                                    amountUsdt = factMoney
                                    moneyForCommission = 0
                                } else {
                                    amountUsdt = fixAmountUsdt
                                    moneyForCommission = some
                                }

                                // moneyForCommission = +(+body[i].free - amountUsdt).toFixed(8)
                                break
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

                await Promise.all([
                    new Promise((resolve, reject) => {
                        (function reRequest() {
                            let queryOrderSellBtcUsdt = `symbol=BTCUSDT&side=SELL&type=MARKET&quantity=${+(baseBtc + dirtAmountGo).toFixed(5)}&timestamp=${Date.now()}`;
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
                                        reRequest()
                                    } else {
                                        for (let j = 0; j < body.fills.length; j++) {
                                            let fill = body.fills[j]
                                            amountBnb -= +fill.commission
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
                                        reRequest()
                                    } else {
                                        resolve()
                                    }
                                }
                            )
                        })()
                    }),
                    new Promise((resolve, reject) => {
                        (function reRequest() {
                            let queryOrderSellEthUsdt = `symbol=ETHUSDT&side=SELL&type=MARKET&quantity=${baseEth}&timestamp=${Date.now()}`;
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
                                        reRequest()
                                    } else {
                                        for (let j = 0; j < body.fills.length; j++) {
                                            let fill = body.fills[j]
                                            amountBnb -= +fill.commission
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
                                        reRequest()
                                    } else {
                                        resolve()
                                    }
                                }
                            )
                        })()
                    }),
                ])

                // посмотреть остаток bnb, если он меньше 5$, то докупить на 6$ и продать всё
                await new Promise((resolve, reject) => {


                    let clearAmountBnb = Math.trunc(amountBnb * 1000) / 1000
                    let sumBnb = clearAmountBnb * pricesBid.bnb.usdt

                    // console.log("clearAmountBnb ", clearAmountBnb)
                    if (sumBnb <= 5.5) {
                        (function reRequest() {
                            let queryOrderBuyBnbUsdt = `symbol=BNBUSDT&side=BUY&type=MARKET&quoteOrderQty=6&timestamp=${Date.now()}`;
                            let hashOrderBuyBnbUsdt = signature(queryOrderBuyBnbUsdt);

                            request.post(
                                {
                                    url: `https://api.binance.com/api/v3/order?${queryOrderBuyBnbUsdt}&signature=${hashOrderBuyBnbUsdt}`,
                                    headers: {
                                        'X-MBX-APIKEY': publicKey
                                    }
                                },
                                (err, response, body) => {
                                    body = JSON.parse(body)
                                    if (body.code) {
                                        console.log("End buy some BNB ", body.code)
                                        reRequest()
                                    } else {
                                        clearAmountBnb = +(+body.origQty + clearAmountBnb).toFixed(3);
                                        (function reRequest() {
                                            let queryOrderSellBnbUsdt = `symbol=BNBUSDT&side=SELL&type=MARKET&quantity=${clearAmountBnb}&timestamp=${Date.now()}`;
                                            let hashOrderSellBnbUsdt = signature(queryOrderSellBnbUsdt);
                                            request.post(
                                                {
                                                    url: `https://api.binance.com/api/v3/order?${queryOrderSellBnbUsdt}&signature=${hashOrderSellBnbUsdt}`,
                                                    headers: {
                                                        'X-MBX-APIKEY': publicKey
                                                    }
                                                },
                                                (err, response, body) => {
                                                    body = JSON.parse(body)
                                                    if (body.code) {
                                                        console.log("End sell after some BNB ", body.code)
                                                        reRequest()
                                                    } else {
                                                        resolve()
                                                    }
                                                }
                                            )
                                        })()
                                    }
                                }
                            )
                        })()
                    } else {
                        (function reRequest() {
                            let queryOrderSellBnbUsdt = `symbol=BNBUSDT&side=SELL&type=MARKET&quantity=${clearAmountBnb}&timestamp=${Date.now()}`;
                            let hashOrderSellBnbUsdt = signature(queryOrderSellBnbUsdt);
                            request.post(
                                {
                                    url: `https://api.binance.com/api/v3/order?${queryOrderSellBnbUsdt}&signature=${hashOrderSellBnbUsdt}`,
                                    headers: {
                                        'X-MBX-APIKEY': publicKey
                                    }
                                },
                                (err, response, body) => {
                                    body = JSON.parse(body)

                                    if (body.code) {
                                        console.log("End sell BNB ", body.code)
                                        reRequest()
                                    } else {
                                        resolve()
                                    }
                                }
                            )
                        })()
                    }
                })


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

                let wait = false

                if (amountUsdt > allMoney) {
                    wait = true

                    if (allMoney > 5) {
                        amountUsdt = allMoney
                    } else {
                        dontCom = true
                    }
                }

                if (usdtBtcEthIndex > 6 && !usdtBtcEthDeal && !generalDeal && !dontCom && !wait) {
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
                                                reRequest()
                                            } else {
                                                // console.log('4 ', body)
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
                                                reRequest()
                                            } else {
                                                // console.log('5 ', body)
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
                                                reRequest()
                                            } else {
                                                // console.log('6 ', body)
                                                resolve(body)
                                            }
                                        }
                                    )
                                })()
                            }),
                        ]).then(async (res) => {
                            let midComission = 0
                            for (let i = 0; i < res.length; i++) {
                                let deal = res[i]

                                for (let j = 0; j < deal.fills.length; j++) {
                                    let fill = deal.fills[j]

                                    let commissionInUsdt = +fill.commission * pricesAsk.bnb.usdt

                                    commissionAll += commissionInUsdt

                                    midComission += commissionInUsdt

                                    amountBnb -= +fill.commission
                                }

                                if (deal.symbol === 'ETHBTC') {
                                    let diff = +(amBuyBtcUsdt - deal.cummulativeQuoteQty).toFixed(8)

                                    dirtBtc = +(dirtBtc + diff).toFixed(8)

                                    dirtAmountGo = Math.trunc(dirtBtc * 100000) / 100000

                                    dirtBtc = +(dirtBtc - dirtAmountGo).toFixed(8)

                                }

                            }

                            if (commissionAll + midComission > maxCommissionAll) {

                                let lastCommission = +(maxCommissionAll - commissionAll).toFixed(8)

                                let howNeedAmount = +(lastCommission / 0.00225).toFixed(8)

                                if (howNeedAmount >= 6) {

                                    moneyForCommission = +(moneyForCommission + (amountUsdt - howNeedAmount)).toFixed(8)

                                    amountUsdt = howNeedAmount

                                    console.log('доп сделка будет ', amountUsdt)


                                } else {

                                    stopGame = true
                                    console.log("commissionAll ", commissionAll)
                                    console.log("dealsAm ", dealsAm)
                                    wsBin.close()
                                }
                            }

                            if (amountBnb * pricesAsk.bnb.usdt < 2 && !stopGame) {

                                let minusCom = false


                                if (moneyForCommission < 5) {

                                    minusCom = true

                                    let howMuchForCom = +(5 - moneyForCommission).toFixed(8)

                                    let amountUsdtMinus = +(amountUsdt - howMuchForCom).toFixed(8)
                                    if (amountUsdtMinus >= 7) {
                                        amountUsdt = amountUsdtMinus
                                        moneyForCommission = 5
                                    } else {
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
                                                                console.log("Check USDT for bnb usdtBtcEth ", body.code)
                                                                reRequest()
                                                            } else {
                                                                for (let i = 0; i < body.length; i++) {
                                                                    if (body[i].asset === 'USDT') {

                                                                        let factMoney = +body[i].free

                                                                        allMoney = factMoney

                                                                        let factMoneyAfter = +(factMoney - 5).toFixed(8)

                                                                        if (factMoneyAfter >= 7) {
                                                                            if (factMoneyAfter > fixAmountUsdt) {
                                                                                amountUsdt = fixAmountUsdt
                                                                                moneyForCommission = +(factMoney - amountUsdt).toFixed(8)
                                                                            } else {
                                                                                amountUsdt = factMoneyAfter
                                                                                moneyForCommission = 5
                                                                            }

                                                                        } else {
                                                                            dontCom = true
                                                                        }
                                                                        break
                                                                    }
                                                                }
                                                                resolve()
                                                            }
                                                        }
                                                    )
                                                })()
                                            }, 10000)
                                        })
                                    }
                                }



                                if (!dontCom) {
                                    (function reRequest() {
                                        let queryOrderBuyBnbUsdt = `symbol=BNBUSDT&side=BUY&type=MARKET&quoteOrderQty=5&timestamp=${Date.now()}`;
                                        let hashOrderBuyBnbUsdt = signature(queryOrderBuyBnbUsdt);

                                        request.post(
                                            {
                                                url: `https://api.binance.com/api/v3/order?${queryOrderBuyBnbUsdt}&signature=${hashOrderBuyBnbUsdt}`,
                                                headers: {
                                                    'X-MBX-APIKEY': publicKey
                                                }
                                            },
                                            (err, response, body) => {
                                                body = JSON.parse(body)
                                                if (body.code) {
                                                    console.log("Buy dop BNB usdtBtcEth ", body.code)
                                                    reRequest()
                                                } else {
                                                    amountBnb += +body.origQty

                                                    moneyForCommission = +(moneyForCommission - +body.cummulativeQuoteQty).toFixed(8)

                                                    allMoney = +(allMoney - +body.cummulativeQuoteQty).toFixed(8)

                                                    if (minusCom) {
                                                        amountUsdt = +(amountUsdt + moneyForCommission).toFixed(8)
                                                    }

                                                    generalDeal = false
                                                }

                                            }
                                        )
                                    })()
                                } else {
                                    generalDeal = true
                                }
                            } else {
                                generalDeal = false

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

                let wait = false

                if (amountUsdt > allMoney) {
                    wait = true

                    if (allMoney > 5) {
                        amountUsdt = allMoney
                    } else {
                        dontCom = true
                    }
                }


                if (usdtEthBtcIndex > 6 && !usdtEthBtcDeal && !generalDeal && !dontCom && !wait) {
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
                                                reRequest()
                                            } else {
                                                // console.log('1 ', body)
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
                                                reRequest()
                                            } else {
                                                // console.log('2 ', body)
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
                                                reRequest()
                                            } else {
                                                // console.log('3 ', body)
                                                resolve(body)
                                            }
                                        }
                                    )
                                })()
                            }),
                        ]).then(async (res) => {
                            let midComission = 0
                            for (let i = 0; i < res.length; i++) {
                                let deal = res[i]

                                for (let j = 0; j < deal.fills.length; j++) {
                                    let fill = deal.fills[j]

                                    let commissionInUsdt = +fill.commission * pricesAsk.bnb.usdt

                                    commissionAll += commissionInUsdt

                                    midComission += commissionInUsdt

                                    amountBnb -= +fill.commission
                                }

                                if (deal.symbol === 'ETHBTC') {
                                    let diff = +(deal.cummulativeQuoteQty - amSellBtcUsdt).toFixed(8)

                                    dirtBtc = +(dirtBtc + diff).toFixed(8)

                                    dirtAmountGo = Math.trunc(dirtBtc * 100000) / 100000

                                    dirtBtc = +(dirtBtc - dirtAmountGo).toFixed(8)

                                }

                            }

                            if (commissionAll + midComission > maxCommissionAll) {

                                let lastCommission = +(maxCommissionAll - commissionAll).toFixed(8)

                                let howNeedAmount = +(lastCommission / 0.00225).toFixed(8)

                                if (howNeedAmount >= 6) {

                                    moneyForCommission = +(moneyForCommission + (amountUsdt - howNeedAmount)).toFixed(8)

                                    amountUsdt = howNeedAmount

                                    console.log('доп сделка будет ', amountUsdt)


                                } else {
                                    stopGame = true
                                    console.log("commissionAll ", commissionAll)
                                    console.log("dealsAm ", dealsAm)
                                    wsBin.close()
                                }
                            }

                            if (amountBnb * pricesAsk.bnb.usdt < 2 && !stopGame) {

                                let minusCom = false

                                if (moneyForCommission < 5) {

                                    minusCom = true

                                    let howMuchForCom = +(5 - moneyForCommission).toFixed(8)

                                    let amountUsdtMinus = +(amountUsdt - howMuchForCom).toFixed(8)
                                    if (amountUsdtMinus >= 7) {
                                        amountUsdt = amountUsdtMinus
                                        moneyForCommission = 5
                                    } else {
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
                                                                console.log("Check USDT for bnb usdtEthBtc ", body.code)
                                                                reRequest()
                                                            } else {
                                                                for (let i = 0; i < body.length; i++) {
                                                                    if (body[i].asset === 'USDT') {

                                                                        let factMoney = +body[i].free

                                                                        allMoney = factMoney

                                                                        let factMoneyAfter = +(factMoney - 5).toFixed(8)

                                                                        if (factMoneyAfter >= 7) {
                                                                            if (factMoneyAfter > fixAmountUsdt) {
                                                                                amountUsdt = fixAmountUsdt
                                                                                moneyForCommission = +(factMoney - amountUsdt).toFixed(8)
                                                                            } else {
                                                                                amountUsdt = factMoneyAfter
                                                                                moneyForCommission = 5
                                                                            }

                                                                        } else {
                                                                            dontCom = true
                                                                        }
                                                                        break
                                                                    }
                                                                }
                                                                resolve()
                                                            }
                                                        }
                                                    )
                                                })()
                                            }, 10000)
                                        })
                                    }
                                }



                                if (!dontCom) {
                                    (function reRequest() {
                                        let queryOrderBuyBnbUsdt = `symbol=BNBUSDT&side=BUY&type=MARKET&quoteOrderQty=5&timestamp=${Date.now()}`;
                                        let hashOrderBuyBnbUsdt = signature(queryOrderBuyBnbUsdt);

                                        request.post(
                                            {
                                                url: `https://api.binance.com/api/v3/order?${queryOrderBuyBnbUsdt}&signature=${hashOrderBuyBnbUsdt}`,
                                                headers: {
                                                    'X-MBX-APIKEY': publicKey
                                                }
                                            },
                                            (err, response, body) => {
                                                body = JSON.parse(body)
                                                if (body.code) {
                                                    console.log("Buy dop BNB usdtEthBtc ", body.code)
                                                    reRequest()
                                                } else {
                                                    amountBnb += +body.origQty

                                                    moneyForCommission = +(moneyForCommission - +body.cummulativeQuoteQty).toFixed(8)

                                                    allMoney = +(allMoney - +body.cummulativeQuoteQty).toFixed(8)

                                                    if (minusCom) {
                                                        amountUsdt = +(amountUsdt + moneyForCommission).toFixed(8)
                                                    }

                                                    generalDeal = false
                                                }

                                            }
                                        )
                                    })()
                                } else {
                                    generalDeal = false
                                }
                            } else {
                                generalDeal = false

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
                                reRequest()
                            } else {

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

                                newBaseBtcInUsdt = +(newBaseBtc * newStartPriceBtc).toFixed(8)

                                let minimumPossibleAmount = notionalBtc / +body.asks[0][0]

                                minimumBuyBtc = Math.trunc((minimumPossibleAmount + 0.001) * 1000) / 1000

                                newHedgeForBtc = +(newBaseBtcInUsdt * 0.15).toFixed(8)



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
                                reRequest()
                            } else {

                                newStartPriceEth = +body.asks[0][0]

                                for (let i = 0; i < workerIds.length; i++) {

                                    let workerId = workerIds[i];


                                    pm2.sendDataToProcessId({
                                        id: workerId,
                                        type: 'process:msg',
                                        data: {
                                            startPriceEth: newStartPriceEth
                                        },
                                        topic: 'startEth'
                                    }, (err, res) => {
                                        if (err) console.error(err);
                                        // else console.log(res);
                                    });

                                }

                                let possibleAmount = amountFirstActive / +body.asks[0][0]

                                let factAmount = Math.trunc(possibleAmount * 1000) / 1000

                                newBaseEth = +(factAmount + 0.001).toFixed(3)


                                newBaseEthInUsdt = +(newBaseEth * newStartPriceEth).toFixed(8)


                                let minimumPossibleAmount = notionalEth / +body.asks[0][0]

                                minimumBuyEth = Math.trunc((minimumPossibleAmount + 0.002) * 1000) / 1000

                                newHedgeForEth = +(newBaseEthInUsdt * 0.15).toFixed(8)



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
                        reRequest()
                    } else {

                        buyCoinsEnd()

                    }
                }
            )
        })();





        async function buyCoinsEnd() {

            await new Promise((resolve, reject) => {
                (function reRequest() {
                    request.get(
                        {
                            url: `https://api.binance.com/api/v3/depth?symbol=BNBUSDT&limit=5`,
                            headers: {
                                'X-MBX-APIKEY': publicKey
                            }
                        },
                        (err, response, body) => {
                            body = JSON.parse(body)
                            if (body.code) {
                                console.log("Depth BNB after bigChange ", body.code)
                                reRequest()
                            } else {

                                let bnbInUsdt = amountBnb * +body.asks[0][0]

                                if (bnbInUsdt < 2) {
                                    (function reRequest() {
                                        let queryOrderBuyBnbUsdt = `symbol=BNBUSDT&side=BUY&type=MARKET&quoteOrderQty=5&timestamp=${Date.now()}`;
                                        let hashOrderBuyBnbUsdt = signature(queryOrderBuyBnbUsdt);

                                        request.post(
                                            {
                                                url: `https://api.binance.com/api/v3/order?${queryOrderBuyBnbUsdt}&signature=${hashOrderBuyBnbUsdt}`,
                                                headers: {
                                                    'X-MBX-APIKEY': publicKey
                                                }
                                            },
                                            (err, response, body) => {
                                                body = JSON.parse(body)
                                                if (body.code) {
                                                    console.log("Buy BNB bigChange if small ", body.code)
                                                    reRequest()
                                                } else {
                                                    amountBnb = +(+body.origQty + amountBnb).toFixed(8)

                                                    resolve()
                                                }
                                            }
                                        )
                                    })()
                                } else {
                                    resolve()
                                }

                            }
                        }
                    )
                })()
            })








            await Promise.all([
                new Promise((resolve, reject) => {
                    if (sideDealBtc) {

                        (function reRequest() {
                            let queryOrderBuyBtcUsdt = `symbol=BTCUSDT&side=${sideDealBtc}&type=MARKET&quantity=${diffBaseBtc}&timestamp=${Date.now()}`;
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
                                        reRequest()
                                    } else {


                                        for (let j = 0; j < body.fills.length; j++) {
                                            let fill = body.fills[j]

                                            amountBnb -= +fill.commission
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
                                            reRequest()
                                        } else {
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
                                            reRequest()
                                        } else {
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
                                                            reRequest()
                                                        } else {
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
                            let queryOrderBuyEthUsdt = `symbol=ETHUSDT&side=${sideDealEth}&type=MARKET&quantity=${diffBaseEth}&timestamp=${Date.now()}`;
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
                                        reRequest()
                                    } else {

                                        for (let j = 0; j < body.fills.length; j++) {
                                            let fill = body.fills[j]

                                            amountBnb -= +fill.commission
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
                                            reRequest()
                                        } else {
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
                                            reRequest()
                                        } else {
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
                                                            reRequest()
                                                        } else {
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

            baseBtcSmall = Math.trunc((baseBtc / howMuchAccounts) * 100000000) / 100000000
            baseEthSmall = Math.trunc((baseEth / howMuchAccounts) * 10000000) / 10000000

            hedgeForBtc = newHedgeForBtc
            hedgeForEth = newHedgeForEth





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
                                    reRequest()
                                } else {
                                    for (let i = 0; i < body.length; i++) {
                                        if (body[i].asset === 'USDT') {

                                            if (bigChange) {
                                                let factMoney = +body[i].free

                                                allMoney = factMoney

                                                let some = +(factMoney - fixAmountUsdt).toFixed(8)

                                                if (some <= 0) {
                                                    amountUsdt = factMoney
                                                    moneyForCommission = 0
                                                } else {
                                                    amountUsdt = fixAmountUsdt
                                                    moneyForCommission = some
                                                }
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
                                    reRequest()
                                } else {
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
                                    reRequest()
                                } else {
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
                                    reRequest()
                                } else {
                                    console.log(body)
                                }
                            }
                        )
                    })();
                }




            }





        }






    }













    let today = new Date().getUTCDate()

    setInterval(() => {
        if (new Date().getUTCDate() !== today) {
            today = new Date().getUTCDate();

            setTimeout(async () => {
                if (dontCom && !stopGame) {
                    await new Promise((resolve, reject) => {
                        (function reRequest() {
                            let queryOrderBuyBnbUsdt = `symbol=BNBUSDT&side=BUY&type=MARKET&quoteOrderQty=5&timestamp=${Date.now()}`;
                            let hashOrderBuyBnbUsdt = signature(queryOrderBuyBnbUsdt);

                            request.post(
                                {
                                    url: `https://api.binance.com/api/v3/order?${queryOrderBuyBnbUsdt}&signature=${hashOrderBuyBnbUsdt}`,
                                    headers: {
                                        'X-MBX-APIKEY': publicKey
                                    }
                                },
                                (err, response, body) => {
                                    body = JSON.parse(body)
                                    if (body.code) {
                                        console.log("Buy BNB next day after dont ", body.code)
                                        reRequest()
                                    } else {
                                        amountBnb += +body.origQty

                                        dontCom = false

                                        resolve()
                                    }

                                }
                            )
                        })()
                    })
                };

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
                                reRequest()
                            } else {
                                for (let i = 0; i < body.length; i++) {
                                    if (body[i].asset === 'USDT') {


                                        let factMoney = +body[i].free

                                        allMoney = factMoney

                                        let some = +(factMoney - fixAmountUsdt).toFixed(8)

                                        if (some <= 0) {
                                            amountUsdt = factMoney
                                            moneyForCommission = 0
                                        } else {
                                            amountUsdt = fixAmountUsdt
                                            moneyForCommission = some
                                        }

                                        if (!dontCom) {
                                            setTimeout(() => {
                                                dontCom = false
                                            }, 500)
                                        }

                                        // moneyForCommission = +(+body[i].free - amountUsdt).toFixed(8)

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