const cluster = require('cluster');

const request = require('request')

const crypto = require('crypto');

const WebSocket = require('ws');





const accountsObj = {
    ramdantunis8: {
        address: "0x2f2bcf7fbd8575222706aa618f0f2b6c8d8d36df",
        secretKey: "HKMjOCgmLuKXgWD53uhd3TsIdaZSwOXrYDtaFPoB9BfLKFAl90FneqRwPnNoxEEZ",
        publicKey: "wIJLD96Inswu74tTkdCeDxaag1D0BWydcxIMxzuOAWQsAATvT0zbgBredIbY15F1",
        id: null,
        index: 0
    }
}





let mainAddress = '0x3a067152e876bbc10ac1bb3bb4fca7eb583a8f8f'


let fixAmountUsdt = 60

let maxCommissionAllMaster = 7

let maxCommissionAllSmall = 5


let amountUsdt = fixAmountUsdt

let amountFirstActive = 105//amountUsdt + (amountUsdt * 2)

let baseBtc = 0
let baseEth = 0
let baseUsdt = 0

let fixAmountUsdtSmall = +(amountUsdt / Object.keys(accountsObj).length).toFixed(8)
let amountUsdtSmall = fixAmountUsdtSmall
let baseBtcSmall = 0
let baseEthSmall = 0
let baseUsdtSmall = 0





if (cluster.isMaster) {
    // Мастер процесс, создает воркеров для каждого аккаунта

    let countBalanceUp = 0
    let howNeedCountBalanceUp = Object.keys(accountsObj).length

    // let countTrueWith = 0
    // let countEndWorkers = 0
    // let howNeedCountEndWorkers = Object.keys(accountsObj).length

    cluster.on('message', (worker, message, handle) => {

        // message = JSON.stringify(message)

        if (message.type === 'balanceUp') {
            countBalanceUp++

            if (countBalanceUp === howNeedCountBalanceUp) {
                setTimeout(() => {
                    console.log("Мастер лисен гоу")
                    startGlobalListen()
                }, 5000)
            }
        }

        // if (message.type === 'trueWith') {
        //     countTrueWith++
        // }

        // console.log(`${worker.process.pid} пишет: ${JSON.stringify(message)}`);
    });




    cluster.on('exit', (worker, code, signal) => {
        console.log(`Воркер ${worker.process.pid} завершил работу`);

        // countEndWorkers++

        // if (countEndWorkers === howNeedCountEndWorkers) {

        // }
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

    const WebSocket = require('ws');


    (async () => {


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

                                let possibleAmount = amountFirstActive / +body.asks[0][0]

                                let factAmount = Math.trunc(possibleAmount * 1000) / 1000

                                baseBtc = +(factAmount + 0.001).toFixed(3)


                                baseBtcSmall = Math.trunc((baseBtc / Object.keys(accountsObj).length) * 100000000) / 100000000

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

                                let possibleAmount = amountFirstActive / +body.asks[0][0]

                                let factAmount = Math.trunc(possibleAmount * 100) / 100

                                baseEth = +(factAmount + 0.01).toFixed(2)

                                baseEthSmall = Math.trunc((baseEth / Object.keys(accountsObj).length) * 10000000) / 10000000

                                resolve()
                            }
                        }
                    )
                })()
            })
        ])


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

                                    baseUsdtSmall = Math.trunc((baseUsdt / Object.keys(accountsObj).length) * 100000000) / 100000000

                                    break
                                }
                            }
                            resolve()
                        }
                    }
                )

            })()
        })




        for (let account of Object.keys(accountsObj)) {

            let worker = cluster.fork();

            accountsObj[account].id = worker.id

            worker.send(accountsObj[account]);




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




    })();








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
                console.log('Соединение мастер listenKey закрыто в ' + new Date().toLocaleTimeString())
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

        let howNeedIndexUpdate = 4 * Object.keys(accountsObj).length

        function listen(data) {
            data = JSON.parse(data.toString())


            if (data.e === "balanceUpdate") {
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


                    global();

                    // (function reRequest() {
                    //     request.delete(
                    //         {
                    //             url: `https://api.binance.com/api/v3/userDataStream?listenKey=${listenKey}`,
                    //             headers: {
                    //                 'X-MBX-APIKEY': publicKey
                    //             }
                    //         },
                    //         (err, response, body) => {
                    //             if (!body || body.code) {
                    //                 reRequest()
                    //             } else {
                    //                 console.log(body)
                    //                 console.log('key delete')
                    //             }
                    //         }
                    //     )
                    // })()
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
                                                console.log("First buy BNB ", body.code)
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
                                                    console.log("First buy BNB ", body.code)
                                                    reRequest()
                                                } else {
                                                    amountBnb = +(amountBnb - howSellBnb).toFixed(8)


                                                    console.log('amountBnb у мастера после продажи лишнего ', amountBnb)
                                                    console.log('amountBnb в долларах у мастера после продажи ', amountBnb * price)


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
                console.log('Соединение Binance закрыто в ' + new Date().toLocaleTimeString())
                setTimeout(() => {
                    wsBinUser = new WebSocket(`wss://stream.binance.com:9443/stream?streams=btcusdt@depth5@100ms/ethusdt@depth5@100ms/ethbtc@depth5@100ms/bnbusdt@depth5@100ms`)

                    wsBinUser.on('error', () => console.log('Ошибка!' + new Date().toLocaleTimeString()))

                    wsBinUser.on('open', () => console.log('Соединение Binance установлено в ' + new Date().toLocaleTimeString()))
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

                if (usdtBtcEthIndex > 7 && !usdtBtcEthDeal && !generalDeal && !dontCom && !wait) {
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

                                    console.log('доп сделка ', amountUsdt)


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


                if (usdtEthBtcIndex > 7 && !usdtEthBtcDeal && !generalDeal && !dontCom && !wait) {
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

                                    console.log('доп сделка ', amountUsdt)


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












        // нужно будет закрывать интервал

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
                                    console.log("Check start USDT ", body.code)
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



















} else {


    // Код для воркер/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    process.on('message', (account) => {


        let secretKey = account.secretKey
        let publicKey = account.publicKey




        function signature(query) {
            return crypto
                .createHmac('sha256', secretKey)
                .update(query)
                .digest('hex');
        };





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


        let fixAmountUsdt = fixAmountUsdtSmall

        let amountUsdt = fixAmountUsdt


        let dirtBtc = 0
        let dirtAmountGo = 0


        let amountBnb = 0


        let commissionAll = 0
        let maxCommissionAll = maxCommissionAllSmall
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

        let dontCom = false;







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


            let listenInterval = setInterval(() => {
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


            wsBin.on('open', () => console.log('Соединение дочка listenKey установлено в ' + new Date().toLocaleTimeString()))
            wsBin.on('error', (d) => {
                console.log('Ошибка!' + new Date().toLocaleTimeString())
                // d = JSON.parse(d.toString())
                console.log(d)

            })
            wsBin.on('close', function restart() {
                if (!closeListen) {
                    console.log('Соединение дочка listenKey закрыто в ' + new Date().toLocaleTimeString())
                    setTimeout(() => {
                        wsBinUser = new WebSocket(`wss://stream.binance.com:9443/ws/${listenKey}`)

                        wsBinUser.on('error', () => console.log('Ошибка!' + new Date().toLocaleTimeString()))

                        wsBinUser.on('open', () => console.log('Соединение Binance установлено в ' + new Date().toLocaleTimeString()))
                        wsBinUser.on('message', listen)
                        wsBinUser.on('ping', data => {
                            wsBinUser.pong(data)
                        })
                        wsBinUser.on('close', restart)
                    }, 500)
                } else {
                    console.log('listenKey дочка закрыт')
                }
            })

            wsBin.on('message', listen)
            wsBin.on('ping', data => {
                wsBin.pong(data)

            });

            let indexUpdate = 0

            function listen(data) {
                data = JSON.parse(data.toString())


                if (data.e === "balanceUpdate") {
                    indexUpdate++
                    console.log(data)
                    if (indexUpdate > 2) {
                        console.log('баланс пополнен ', indexUpdate)


                        process.send({ type: 'balanceUp' })

                        global();

                        (function reRequest() {
                            request.delete(
                                {
                                    url: `https://api.binance.com/api/v3/userDataStream?listenKey=${listenKey}`,
                                    headers: {
                                        'X-MBX-APIKEY': publicKey
                                    }
                                },
                                (err, response, body) => {
                                    if (!body || body.code) {
                                        reRequest()
                                    } else {
                                        console.log(body)
                                        console.log('key delete')
                                        closeListen = true
                                        clearInterval(listenInterval)
                                        wsBin.close()
                                    }
                                }
                            )
                        })()
                    }
                }

            }
        })();

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


        async function global() {


            await new Promise((resolve, reject) => {
                (function reRequest() {
                    let queryOrderBuyBnbUsdt = `symbol=BNBUSDT&side=BUY&type=MARKET&quoteOrderQty=7&timestamp=${Date.now()}`;
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

                                        allMoney = +body[i].free

                                        moneyForCommission = +(+body[i].free - amountUsdt).toFixed(8)
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


            wsBin.on('open', () => console.log('Соединение дочка Binance установлено в ' + new Date().toLocaleTimeString()))
            wsBin.on('error', (d) => {
                console.log('Ошибка!' + new Date().toLocaleTimeString())
                // d = JSON.parse(d.toString())
                console.log(d)

            })
            wsBin.on('close', function restart() {

                if (!stopGame) {
                    console.log('Соединение дочка Binance закрыто в ' + new Date().toLocaleTimeString())
                    setTimeout(() => {
                        wsBinUser = new WebSocket(`wss://stream.binance.com:9443/stream?streams=btcusdt@depth5@100ms/ethusdt@depth5@100ms/ethbtc@depth5@100ms/bnbusdt@depth5@100ms`)

                        wsBinUser.on('error', () => console.log('Ошибка!' + new Date().toLocaleTimeString()))

                        wsBinUser.on('open', () => console.log('Соединение Binance установлено в ' + new Date().toLocaleTimeString()))
                        wsBinUser.on('message', whyNotYou)
                        wsBinUser.on('ping', data => {
                            wsBinUser.pong(data)
                        })
                        wsBinUser.on('close', restart)
                    }, 1000)
                } else {
                    (async () => {

                        let restBTC = 0
                        let restETH = 0
                        let restBNB = 0
                        let restUSDT = 0

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
                                                if (body[i].asset === 'BTC') {

                                                    restBTC = +body[i].free
                                                }
                                                if (body[i].asset === 'ETH') {

                                                    restETH = +body[i].free
                                                }
                                                if (body[i].asset === 'BNB') {

                                                    restBNB = +body[i].free
                                                }
                                                if (body[i].asset === 'USDT') {

                                                    restUSDT = +body[i].free
                                                }
                                            }
                                            resolve()
                                        }
                                    }
                                )

                            })()
                        });



                        (function reRequest() {

                            let queryWithdrawUSDT = `coin=USDT&network=BSC&address=${mainAddress}&amount=${restUSDT}&transactionFeeFlag=true&timestamp=${Date.now()}`;
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
                                        console.log(`With USDT after end from ${account.index} `, body.code)
                                        reRequest()
                                    } else {
                                        console.log(body)
                                    }
                                }
                            )
                        })();



                        (function reRequest() {

                            let queryWithdrawBTC = `coin=BTC&network=BSC&address=${mainAddress}&amount=${restBTC}&transactionFeeFlag=true&timestamp=${Date.now()}`;
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
                                        console.log(`With BTC after end from ${account.index} `, body.code)
                                        reRequest()
                                    } else {
                                        console.log(body)
                                    }
                                }
                            )

                        })();

                        (function reRequest() {

                            let queryWithdrawETH = `coin=ETH&network=BSC&address=${mainAddress}&amount=${restETH}&transactionFeeFlag=true&timestamp=${Date.now()}`;
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
                                        console.log(`With ETH after end from ${account.index} `, body.code)
                                        reRequest()
                                    } else {
                                        console.log(body)
                                    }
                                }
                            )
                        })();


                        (function reRequest() {

                            let queryWithdrawBNB = `coin=BNB&network=BSC&address=${mainAddress}&amount=${restBNB}&transactionFeeFlag=true&timestamp=${Date.now()}`;
                            let hashWithdrawBNB = signature(queryWithdrawBNB);

                            request.post(
                                {
                                    url: `https://api.binance.com/sapi/v1/capital/withdraw/apply?${queryWithdrawBNB}&signature=${hashWithdrawBNB}`,
                                    headers: {
                                        'X-MBX-APIKEY': publicKey
                                    }
                                },
                                (err, response, body) => {
                                    body = JSON.parse(body)
                                    if (body.code) {
                                        console.log(`With BNB after end from ${account.index} `, body.code)
                                        reRequest()
                                    } else {
                                        console.log(body)
                                    }
                                }
                            )

                        })();

                        // сделать вывод стредств обратно в главный аккаунт


                        console.log('Дело сделано ' + new Date().toLocaleTimeString())
                    })()
                }
            })

            wsBin.on('message', whyNotYou)
            wsBin.on('ping', data => {
                wsBin.pong(data)

            })

            let indexData = 0
            function whyNotYou(data) {

                // console.log(`${++indexData} в ${Date.now()}`)

                data = JSON.parse(data.toString())
                if (data.stream === 'btcusdt@depth5@100ms') {
                    let bid = data.data.bids[0][0]
                    let ask = data.data.asks[0][0]

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

                let currentAmountUsdt = amountUsdt

                let amBuyBtcUsdt = Math.trunc((currentAmountUsdt / pricesAsk.btc.usdt) * 100000) / 100000
                let amBuyEthUsdt = Math.trunc((currentAmountUsdt / pricesAsk.eth.usdt) * 10000) / 10000


                let amBuyEthBtc = Math.trunc((amBuyBtcUsdt / pricesAsk.eth.btc) * 10000) / 10000
                let amSellEthBtc = amBuyEthUsdt


                let amSellBtcUsdt = Math.trunc((amSellEthBtc * pricesBid.eth.btc) * 100000) / 100000
                let amSellEthUsdt = amBuyEthBtc




                let usdtBtcEth = currentAmountUsdt / pricesAsk.btc.usdt / pricesAsk.eth.btc * pricesBid.eth.usdt
                let usdtEthBtc = currentAmountUsdt / pricesAsk.eth.usdt * pricesBid.eth.btc * pricesBid.btc.usdt


                // console.log('usdtBtcEth ', usdtBtcEth)
                // console.log('usdtEthBtc ', usdtEthBtc)

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

                    // console.log('usdtBtcEth ', usdtBtcEth)
                    // console.log('usdtBtcEthIndex ', usdtBtcEthIndex)
                    // console.log('usdtBtcEthDeal ', usdtBtcEthDeal)
                    // console.log('generalDeal ', generalDeal)
                    // console.log('dontCom ', dontCom)
                    // console.log('wait ', wait)

                    if (usdtBtcEthIndex > 7 && !usdtBtcEthDeal && !generalDeal && !dontCom && !wait) {
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

                                        console.log('доп сделка ', amountUsdt)

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


                    // console.log('usdtEthBtc ', usdtEthBtc)
                    // console.log('usdtEthBtcIndex ', usdtEthBtcIndex)
                    // console.log('usdtEthBtcDeal ', usdtEthBtcDeal)
                    // console.log('generalDeal ', generalDeal)
                    // console.log('dontCom ', dontCom)
                    // console.log('wait ', wait)

                    if (usdtEthBtcIndex > 7 && !usdtEthBtcDeal && !generalDeal && !dontCom && !wait) {
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

                                        console.log('доп сделка ', amountUsdt)

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
                                        console.log("Check start USDT ", body.code)
                                        reRequest()
                                    } else {
                                        for (let i = 0; i < body.length; i++) {
                                            if (body[i].asset === 'USDT') {


                                                let factMoney = +body[i].free




                                                if (!stopGame) {

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
                                                } else if (stopGame && factMoney > 0.00000001) {




                                                    (function reRequest() {
                                                        let queryWithdrawUSDT = `coin=USDT&network=BSC&address=${mainAddress}&amount=${factMoney}&transactionFeeFlag=true&timestamp=${Date.now()}`;
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
                                                                    console.log(`With USDT next day from ${account.index} `, body.code)
                                                                    reRequest()
                                                                } else {
                                                                    console.log(body)

                                                                    // убить процесс
                                                                    process.send({ type: 'trueWith' })

                                                                    process.exit()

                                                                }
                                                            }
                                                        )
                                                    })()



                                                } else {
                                                    process.exit()
                                                }
                                                // moneyForCommission = +(+body[i].free - amountUsdt).toFixed(8)

                                                break
                                            }
                                        }
                                    }
                                }
                            )

                        })()
                    }, 60000)
                }
            }, 300000)












        }



























        // Используйте account для работы с конкретным аккаунтом Binance
        console.log(`Воркер ${process.pid} начал работу с аккаунтом: ${account}`);
        // Ваш код для торговли с использованием API Binance

    });
}