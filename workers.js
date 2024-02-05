const cluster = require('cluster');

const request = require('request')

const crypto = require('crypto');

const WebSocket = require('ws');


let startPriceBtc = 0
let startPriceEth = 0


let mainAddress = '0x3a067152e876bbc10ac1bb3bb4fca7eb583a8f8f'



process.send({
    type: 'process:msg',
    data: {
        type: 'open'
    }
})

// Код для воркер/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
process.on('message', (packet) => {


    if (packet.topic === 'startBtc') {
        startPriceBtc = +packet.data.startPriceBtc
    }

    if (packet.topic === 'startEth') {
        startPriceEth = +packet.data.startPriceEth
    }



    if (packet.topic === 'startWork') {

        let account = packet.data.account

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


        let fixAmountUsdt = packet.data.fixAmountUsdtSmall

        let amountUsdt = fixAmountUsdt

        let maxChangeProc = packet.data.maxChangeProc

        let dirtBtc = 0
        let dirtAmountGo = 0


        let amountBnb = 0


        let commissionAll = 0
        let maxCommissionAll = packet.data.maxCommissionAllSmall
        let stopGame = false


        let generalDeal = false

        let usdtBtcEthIndex = 0
        let usdtBtcEthDeal = false

        let usdtEthBtcIndex = 0
        let usdtEthBtcDeal = false


        let dealsAm = 0



        let allMoney = 0
        let moneyForCommission = 0

        let dontCom = false;


        let bigChange = false;





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


            wsBin.on('open', () => console.log(`Соединение ${account.index} listenKey установлено в ` + new Date().toLocaleTimeString()))
            wsBin.on('error', (d) => {
                console.log(`Ошибка! ${account.index}` + new Date().toLocaleTimeString())
                // d = JSON.parse(d.toString())
                console.log(d)

            })
            wsBin.on('close', function restart() {
                if (!closeListen) {
                    console.log(`Соединение ${account.index} listenKey закрыто из-за ошибки в ` + new Date().toLocaleTimeString())
                    setTimeout(() => {
                        wsBinUser = new WebSocket(`wss://stream.binance.com:9443/ws/${listenKey}`)

                        wsBinUser.on('error', () => console.log(`Ошибка! ${account.index}` + new Date().toLocaleTimeString()))

                        wsBinUser.on('open', () => console.log(`Соединение ${account.index} listenKey установлено в ` + new Date().toLocaleTimeString()))
                        wsBinUser.on('message', listen)
                        wsBinUser.on('ping', data => {
                            wsBinUser.pong(data)
                        })
                        wsBinUser.on('close', restart)
                    }, 500)
                } else {
                    console.log(`начальный listenKey ${account.index} закрыт`)
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
                    if (indexUpdate === 3) {
                        console.log(`начальный баланс пополнен у ${account.index} `, indexUpdate)


                        process.send({
                            type: 'process:msg',
                            data: {
                                type: 'balanceUp'
                            }
                        })

                        setTimeout(() => {
                            global();
                        }, 15000);


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
                                        console.log(`first key delete in ${account.index}`)
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
                                console.log(`First buy BNB in ${account.index} `, body.code)
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

                            // console.log('Body asset ', body)


                            if (body.code) {
                                console.log(`Check start USDT in ${account.index} `, body.code)
                                reRequest()
                            } else {
                                for (let i = 0; i < body.length; i++) {
                                    if (body[i].asset === 'USDT') {


                                        allMoney = +body[i].free

                                        console.log(`allMoney в ${account.index} после чека `, allMoney)

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


            wsBin.on('open', () => console.log(`Соединение ${account.index} Binance установлено в ` + new Date().toLocaleTimeString()))
            wsBin.on('error', (d) => {
                console.log(`Ошибка! ${account.index}` + new Date().toLocaleTimeString())
                // d = JSON.parse(d.toString())
                console.log(d)

            })
            wsBin.on('close', function restart() {

                if (!stopGame) {
                    console.log(`Соединение ${account.index} Binance закрыто из-за ошибки в ` + new Date().toLocaleTimeString())
                    setTimeout(() => {
                        wsBinUser = new WebSocket(`wss://stream.binance.com:9443/stream?streams=btcusdt@depth5@100ms/ethusdt@depth5@100ms/ethbtc@depth5@100ms/bnbusdt@depth5@100ms`)

                        wsBinUser.on('error', () => console.log(`Ошибка! ${account.index}` + new Date().toLocaleTimeString()))

                        wsBinUser.on('open', () => console.log(`Соединение ${account.index} Binance установлено в ` + new Date().toLocaleTimeString()))
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
                            }, 15000)
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


                        console.log(`Дело сделано у ${account.index} ` + new Date().toLocaleTimeString())
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


                    let change = (startPriceBtc - bid) / startPriceBtc

                    if (Math.abs(change) > maxChangeProc && !bigChange && startPriceBtc !== 0) {
                        bigChange = true

                        startPriceBtc = 0

                        smoothMoney(change)
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

                    if (Math.abs(change) > maxChangeProc && !bigChange && startPriceEth !== 0) {
                        bigChange = true

                        startPriceEth = 0


                        smoothMoney(change)
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


                    // console.log('usdtBtcEth ', usdtBtcEth)
                    // console.log('usdtEthBtc ', usdtEthBtc)

                    if ((usdtBtcEth - currentAmountUsdt) / currentAmountUsdt > 0.00017 && usdtBtcEth !== Infinity && !stopGame && currentAmountUsdt === amountUsdt) {

                        usdtBtcEthIndex++

                        let wait = false

                        if (amountUsdt > allMoney) {
                            wait = true

                            console.log(`amountUsdt > all ${account.index} `, amountUsdt)
                            console.log(`allMoney > all ${account.index} `, allMoney)

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

                        if (usdtBtcEthIndex > 6 && !usdtBtcEthDeal && !generalDeal && !dontCom && !wait) {
                            usdtBtcEthDeal = true
                            // usdtEthBtcDeal = false
                            generalDeal = true

                            // console.log("Deal usdtBtcEth")
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
                                                        console.log(`Buy BTC usdtBtcEth ${account.index} `, body.code)
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
                                                        console.log(`Buy ETH usdtBtcEth ${account.index} `, body.code)
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
                                                        console.log(`Sell ETH usdtBtcEth ${account.index} `, body.code)
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

                                            console.log(`доп сделка в ${account.index} будет `, amountUsdt)

                                        } else {

                                            stopGame = true
                                            console.log(`commissionAll in ${account.index} `, commissionAll)
                                            console.log(`dealsAm in ${account.index} `, dealsAm)
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
                                                                        console.log(`Check USDT for bnb usdtBtcEth ${account.index} `, body.code)
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
                                                            console.log(`Buy dop BNB usdtBtcEth ${account.index} `, body.code)
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

                            console.log(`amountUsdt > all in ${account.index} `, amountUsdt)
                            console.log(`allMoney > all in ${account.index} `, allMoney)

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

                        if (usdtEthBtcIndex > 6 && !usdtEthBtcDeal && !generalDeal && !dontCom && !wait) {
                            usdtEthBtcDeal = true
                            // usdtBtcEthDeal = false
                            generalDeal = true
                            // console.log("Deal usdtEthBtc")
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
                                                        console.log(`Buy ETH usdtEthBtc ${account.index} `, body.code)
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
                                                        console.log(`Sell ETH usdtEthBtc ${account.index} `, body.code)
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
                                                        console.log(`Sell BTC usdtEthBtc ${account.index} `, body.code)
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

                                            console.log(`доп сделка в ${account.index} будет `, amountUsdt)

                                        } else {
                                            stopGame = true
                                            console.log(`commissionAll in ${account.index} `, commissionAll)
                                            console.log(`dealsAm in ${account.index} `, dealsAm)
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
                                                                        console.log(`Check USDT for bnb usdtEthBtc ${account.index}`, body.code)
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
                                                            console.log(`Buy dop BNB usdtEthBtc ${account.index}`, body.code)
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










            async function smoothMoney() {

                process.send({
                    type: 'process:msg',
                    data: {
                        type: 'maxChange'
                    }
                });





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


                wsBin.on('open', () => {

                    setTimeout(() => {
                        buybuyMoney()
                    }, 1000)

                    console.log(`Соединение ${account.index} listenKey после bigChange установлено в ` + new Date().toLocaleTimeString())

                })
                wsBin.on('error', (d) => {
                    console.log(`Ошибка! ${account.index}` + new Date().toLocaleTimeString())
                    // d = JSON.parse(d.toString())
                    console.log(d)

                })
                wsBin.on('close', function restart() {
                    if (!closeListen) {
                        console.log(`Соединение ${account.index} listenKey bigCnahge закрыто из-за ошибки в ` + new Date().toLocaleTimeString())
                        setTimeout(() => {
                            wsBinUser = new WebSocket(`wss://stream.binance.com:9443/ws/${listenKey}`)

                            wsBinUser.on('error', () => console.log('Ошибка!' + new Date().toLocaleTimeString()))

                            wsBinUser.on('open', () => console.log(`Соединение ${account.index} listenKey после bigChange установлено в ` + new Date().toLocaleTimeString()))
                            wsBinUser.on('message', listen)
                            wsBinUser.on('ping', data => {
                                wsBinUser.pong(data)
                            })
                            wsBinUser.on('close', restart)
                        }, 500)
                    } else {
                        console.log(`listenKey ${account.index} закрыт после bigChange`)
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
                        if (indexUpdate === 6) {
                            console.log(`баланс пополнен после bigChange ${account.index}`, indexUpdate)




                            setTimeout(() => {


                                process.send({
                                    type: 'process:msg',
                                    data: {
                                        type: 'upAfterChange'
                                    }
                                });

                                checkMoney();
                            }, 15000);


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
                                            console.log(`key delete after bigCnahge ${account.index}`)
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


                async function buybuyMoney() {



                    let restBTC = 0
                    let restETH = 0
                    let restUSDT = 0

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
                                            console.log(`Check bihChange assets ${account.index}`, body.code)
                                            reRequest()
                                        } else {
                                            for (let i = 0; i < body.length; i++) {
                                                if (body[i].asset === 'BTC') {

                                                    restBTC = +body[i].free
                                                }
                                                if (body[i].asset === 'ETH') {

                                                    restETH = +body[i].free
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
                        }, 15000)
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
                                    console.log(`With USDT after bigChange from ${account.index} `, body.code)
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
                                    console.log(`With BTC after bigChange from ${account.index} `, body.code)
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
                                    console.log(`With ETH after bigChange from ${account.index} `, body.code)
                                    reRequest()
                                } else {
                                    console.log(body)
                                }
                            }
                        )
                    })();


                }


                function checkMoney() {
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
                                    console.log(`Check после bigChange USDT ${account.index}`, body.code)
                                    reRequest()
                                } else {
                                    for (let i = 0; i < body.length; i++) {
                                        if (body[i].asset === 'USDT') {

                                            let factMoney = +body[i].free


                                            allMoney = factMoney

                                            console.log(`allMoney после чека после bigChange ${account.index}`, allMoney)

                                            // проверять, чтобы amountUsdt не был меньше 5

                                            let some = +(factMoney - fixAmountUsdt).toFixed(8)

                                            if (some <= 0) {
                                                amountUsdt = factMoney

                                                if (amountUsdt < 6) {
                                                    dontCom = true
                                                }

                                                moneyForCommission = 0
                                            } else {
                                                amountUsdt = fixAmountUsdt
                                                moneyForCommission = some
                                            }



                                            break
                                        }
                                    }

                                    bigChange = false

                                    resolve()
                                }
                            }
                        )

                    })()
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
                                                console.log(`Buy BNB next day after dont ${account.index}`, body.code)
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
                                        console.log(`Check USDT after day ${account.index}`, body.code)
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
                                                                    // process.send({ type: 'trueWith' })

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



        console.log(`Воркер ${process.pid} начал работу с аккаунтом: ${account.index}`);

    }













});
