let secretKey = 'qauOJPVzeJrXwZ5whQlRkQ3em0PaDJHSwI8b39njdqrINLJZl2rQLKSYzJRs76gw'
let publicKey = 'xfZZma9C73PyUNd4JP6FlHQaS5gzYZmaaVyL2yrbFKxFrb2it2uMn1VOgwDzVjfA'

const request = require('request')

const crypto = require('crypto');
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

let amountUsdt = 100

let amountFirstActive = amountUsdt + (amountUsdt * 0.1)

let baseBtc = 0
let baseEth = 0

// купить биткоин +20% к amountUsdt и сразу купить обратные фьючерсы на эту сумму
// купить эфириум +20% к amountUsdt и сразу купить обратные фьючерсы на эту сумму

// купить bnb и записать сумму bnb в переменную

let dirtBtc = 0
let dirtAmountGo = 0


let amountBnb = 0


let commissionAll = 0
let maxCommissionAll = 60
let stopGame = false


let generalDeal = false

let usdtBtcEthIndex = 0
let usdtBtcEthDeal = false

let usdtEthBtcIndex = 0
let usdtEthBtcDeal = false


let dealsAm = 0

let startPriceBtc = 0
let startPriceEth = 0

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

                            resolve()
                        }
                    }
                )
            })()
        })
    ])

    await new Promise((resolve, reject) => {
        (function reRequest() {
            let queryOrderBuyBnbUsdt = `symbol=BNBUSDT&side=BUY&type=MARKET&quoteOrderQty=8&timestamp=${Date.now()}`;
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


    let wsBin = new WebSocket(`wss://stream.binance.com:9443/stream?streams=btcusdt@depth5@100ms/ethusdt@depth5@100ms/ethbtc@depth5@100ms/bnbusdt@depth5@100ms`)


    wsBin.on('open', () => console.log('Соединение Binance установлено в ' + new Date().toLocaleTimeString()))
    wsBin.on('error', (d) => {
        console.log('Ошибка!' + new Date().toLocaleTimeString())
        // d = JSON.parse(d.toString())
        console.log(d)

    })
    wsBin.on('close', function restart() {

        if (!stopGame) {
            console.log('Соединение Binance закрыто в ' + new Date().toLocaleTimeString())
            setTimeout(() => {
                wsBinUser = new WebSocket(`wss://stream.binance.com:9443/stream?streams=
                btcusdt@depth5@100ms/
                ethusdt@depth5@100ms/
                ethbtc@depth5@100ms/
                bnbusdt@depth5@100ms`)

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
                // продать биткоин и эфириум и их фьючерсы
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
                let clearAmountBnb = Math.trunc(amountBnb * 1000) / 1000
                let sumBnb = clearAmountBnb * pricesBid.bnb.usdt

                // console.log("clearAmountBnb ", clearAmountBnb)
                if (sumBnb <= 5.2) {
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
                                    clearAmountBnb = +(+body.origQty + clearAmountBnb).toFixed(3)
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
                                }
                            }
                        )
                    })()
                }
                console.log('Дело сделано ' + new Date().toLocaleTimeString())
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



        let amBuyBtcUsdt = Math.trunc((amountUsdt / pricesAsk.btc.usdt) * 100000) / 100000
        let amBuyEthUsdt = Math.trunc((amountUsdt / pricesAsk.eth.usdt) * 10000) / 10000


        let amBuyEthBtc = Math.trunc((amBuyBtcUsdt / pricesAsk.eth.btc) * 10000) / 10000
        let amSellEthBtc = amBuyEthUsdt


        let amSellBtcUsdt = Math.trunc((amSellEthBtc * pricesBid.eth.btc) * 100000) / 100000
        let amSellEthUsdt = amBuyEthBtc




        let usdtBtcEth = amountUsdt / pricesAsk.btc.usdt / pricesAsk.eth.btc * pricesBid.eth.usdt
        let usdtEthBtc = amountUsdt / pricesAsk.eth.usdt * pricesBid.eth.btc * pricesBid.btc.usdt




        if ((usdtBtcEth - amountUsdt) / amountUsdt > 0.00017 && usdtBtcEth !== Infinity && !stopGame) {

            usdtBtcEthIndex++
            if (usdtBtcEthIndex > 7 && !usdtBtcEthDeal && !generalDeal) {
                usdtBtcEthDeal = true
                // usdtEthBtcDeal = false
                generalDeal = true

                console.log("Deal usdtBtcEth")
                dealsAm++




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
                                            console.log('4 ', body)
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
                                            console.log('5 ', body)
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
                                            console.log('6 ', body)
                                            resolve(body)
                                        }
                                    }
                                )
                            })()
                        }),
                    ]).then((res) => {
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
                            stopGame = true
                            console.log("commissionAll ", commissionAll)
                            console.log("dealsAm ", dealsAm)
                            wsBin.close()
                        }

                        if (amountBnb * pricesAsk.bnb.usdt < 2 && !stopGame) {
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

                                            generalDeal = false
                                        }

                                    }
                                )
                            })()
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



        if ((usdtEthBtc - amountUsdt) / amountUsdt > 0.00017 && usdtEthBtc !== Infinity && !stopGame) {
            usdtEthBtcIndex++
            if (usdtEthBtcIndex > 7 && !usdtEthBtcDeal && !generalDeal) {
                usdtEthBtcDeal = true
                // usdtBtcEthDeal = false
                generalDeal = true
                console.log("Deal usdtEthBtc")
                dealsAm++



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
                                            console.log('1 ', body)
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
                                            console.log('2 ', body)
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
                                            console.log('3 ', body)
                                            resolve(body)
                                        }
                                    }
                                )
                            })()
                        }),
                    ]).then((res) => {
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
                            stopGame = true
                            console.log("commissionAll ", commissionAll)
                            console.log("dealsAm ", dealsAm)
                            wsBin.close()
                        }

                        if (amountBnb * pricesAsk.bnb.usdt < 2 && !stopGame) {
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

                                            generalDeal = false
                                        }

                                    }
                                )
                            })()
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

})()


