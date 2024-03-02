// const cluster = require('cluster');

const request = require('request')

const crypto = require('crypto');

const WebSocket = require('ws');



let messageBot = null

let botKey = "7176718080:AAHk5RzYR7uL9BmeqQNrJ3B_sxA6Ucnu_aM"

const TelegramBot = require('node-telegram-bot-api');

const botMax = new TelegramBot(botKey, { polling: true });


const userChatId = 647607874;

botMax.on('polling_error', (error) => {
    // console.error('Ошибка опроса:', error.code); // Логируем ошибку
    if (error.code === 'ECONNRESET') {
        console.error('Соединение было неожиданно разорвано'); // Дополнительные действия для этой ошибки

        setTimeout(() => {
            botMax.sendMessage(userChatId, messageBot);

        }, 5000);
    }
});

process.on('unhandledRejection', (reason, promise) => {
    setTimeout(() => {
        botMax.sendMessage(userChatId, messageBot);

    }, 5000);
});








let mainAddress = '0xd742ecbbc74093e2fb3fa34888aeb0eff24d8d87'


let fixAmountUsdt = 100

let maxCommissionAllMaster = 261.682

let maxCommissionAllSmall = 52.1

let amountFirstActive = fixAmountUsdt * 1.15

let maxChangeProc = 0.1


let amountUsdt = fixAmountUsdt

let howMuchAccounts = 5

let baseBtc = 0
let baseEth = 0
let baseUsdt = 0

let fixAmountUsdtSmall = +(fixAmountUsdt / howMuchAccounts).toFixed(8)
let amountUsdtSmall = fixAmountUsdtSmall
let baseBtcSmall = 0
let baseEthSmall = 0
let baseUsdtSmall = 0


let fatalError = false
let indexError = 0

let minNotionalEthbtc = 0
let changeNotionalEthBtc = false


let countBalanceUp = 0

let workerSayChange = false

let countUpAfterChange = 0
let indexUpdateBigChange = 0

let workerEnds = false








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
                        if (body.code && indexError <= 5) {
                            console.log("Depth BTC ", body.code)
                            if (body.code !== -1021) {
                                indexError++
                            }

                            reRequest()
                        } else if (body.code && !fatalError) {
                            fatalError = true

                            messageBot = `Конечная у мастера

                            Depth BTC ${body.code}
                            
                            Заплаченная комиссия ${commissionAll}`

                            botMax.sendMessage(userChatId, messageBot);
                        } else {
                            if (indexError !== 0) {
                                indexError = 0
                            }

                            startPriceBtc = +body.asks[0][0]



                            let possibleAmount = amountFirstActive / +body.asks[0][0]

                            let factAmount = Math.trunc(possibleAmount * 1000) / 1000

                            baseBtc = +(factAmount + 0.001).toFixed(3)

                            // firstComBtc = +((Math.trunc(baseBtc * 0.0011 * 100000) / 100000) + 0.00001).toFixed(5)

                            // commissionBtc = +(firstComBtc - (+(baseBtc + firstComBtc).toFixed(5) * 0.001)).toFixed(8)

                            baseBtcInUsdt = +(baseBtc * startPriceBtc).toFixed(8)


                            hedgeForBtc = +(baseBtcInUsdt * 0.15).toFixed(8)

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
                        if (body.code && indexError <= 5) {
                            console.log("Depth ETH ", body.code)
                            if (body.code !== -1021) {
                                indexError++
                            }

                            reRequest()
                        } else if (body.code && !fatalError) {
                            fatalError = true

                            messageBot = `Конечная у мастера

                            Depth ETH ${body.code}
                            
                            Заплаченная комиссия ${commissionAll}`

                            botMax.sendMessage(userChatId, messageBot);
                        } else {
                            if (indexError !== 0) {
                                indexError = 0
                            }
                            startPriceEth = +body.asks[0][0]



                            let possibleAmount = amountFirstActive / +body.asks[0][0]

                            let factAmount = Math.trunc(possibleAmount * 1000) / 1000

                            baseEth = +(factAmount + 0.001).toFixed(3)

                            // firstComEth = +((Math.trunc(baseEth * 0.0011 * 10000) / 10000) + 0.0001).toFixed(4)

                            // commissionEth = +(firstComEth - (+(baseEth + firstComEth).toFixed(4) * 0.001)).toFixed(8)

                            baseEthInUsdt = +(baseEth * startPriceEth).toFixed(8)


                            hedgeForEth = +(baseEthInUsdt * 0.15).toFixed(8)


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
                    if (body.code && indexError <= 5) {
                        console.log("First transfer to fut ", body.code)
                        if (body.code !== -1021) {
                            indexError++
                        }

                        reRequest()
                    } else if (body.code && !fatalError) {
                        fatalError = true

                        messageBot = `Конечная у мастера

                        First transfer to fut ${body.code}
                        
                        Заплаченная комиссия ${commissionAll}`

                        botMax.sendMessage(userChatId, messageBot);
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
                        if (body.code && indexError <= 5) {
                            console.log("First buy BTC ", body.code)
                            if (body.code !== -1021) {
                                indexError++
                            }

                            reRequest()
                        } else if (body.code && !fatalError) {
                            fatalError = true

                            messageBot = `Конечная у мастера
    
                            First buy BTC ${body.code}
                            
                            Заплаченная комиссия ${commissionAll}`

                            botMax.sendMessage(userChatId, messageBot);
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
                        if (body.code && indexError <= 5) {
                            console.log("First sell BTC fut ", body.code)
                            if (body.code !== -1021) {
                                indexError++
                            }

                            reRequest()
                        } else if (body.code && !fatalError) {
                            fatalError = true

                            messageBot = `Конечная у мастера
    
                            First sell BTC fut ${body.code}
                            
                            Заплаченная комиссия ${commissionAll}`

                            botMax.sendMessage(userChatId, messageBot);
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
                        if (body.code && indexError <= 5) {
                            console.log("First buy ETH ", body.code)
                            if (body.code !== -1021) {
                                indexError++
                            }

                            reRequest()
                        } else if (body.code && !fatalError) {
                            fatalError = true

                            messageBot = `Конечная у мастера
    
                            First buy ETH ${body.code}
                            
                            Заплаченная комиссия ${commissionAll}`

                            botMax.sendMessage(userChatId, messageBot);
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
                        if (body.code && indexError <= 5) {
                            console.log("First sell ETH fut ", body.code)
                            if (body.code !== -1021) {
                                indexError++
                            }

                            reRequest()
                        } else if (body.code && !fatalError) {
                            fatalError = true

                            messageBot = `Конечная у мастера
    
                            First sell ETH fut ${body.code}
                            
                            Заплаченная комиссия ${commissionAll}`

                            botMax.sendMessage(userChatId, messageBot);
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


    setTimeout(() => {
        global();
    }, 15000);

})()




//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



async function global() {

    await new Promise((resolve, reject) => {
        (function reRequest() {
            request.get(
                {
                    url: `https://api.binance.com/api/v3/exchangeInfo?symbol=ETHBTC`,
                    headers: {
                        'X-MBX-APIKEY': publicKey
                    }
                },
                (err, response, body) => {
                    body = JSON.parse(body)
                    if (body.code && indexError <= 5) {
                        console.log(`Старт exchangeInfo мастер `, body.code)
                        if (body.code !== -1021) {
                            indexError++
                        }

                        reRequest()
                    } else if (body.code && !fatalError) {
                        fatalError = true

                        messageBot = `Конечная у мастер

                        Старт exchangeInfo ${body.code}
                        
                        Заплаченная комиссия ${commissionAll}`

                        botMax.sendMessage(userChatId, messageBot);
                    } else {
                        if (indexError !== 0) {
                            indexError = 0
                        }

                        let symbol = body.symbols[0]

                        for (let i = 0; i < symbol.filters.length; i++) {
                            let filter = symbol.filters[i]

                            if (filter.filterType === "NOTIONAL") {
                                minNotionalEthbtc = +filter.minNotional
                            }

                        }

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

                    if (body.code && indexError <= 5) {
                        console.log("Check start USDT ", body.code)
                        if (body.code !== -1021) {
                            indexError++
                        }

                        reRequest()
                    } else if (body.code && !fatalError) {
                        fatalError = true

                        messageBot = `Конечная у мастера

                        Check start USDT ${body.code}
                        
                        Заплаченная комиссия ${commissionAll}`

                        botMax.sendMessage(userChatId, messageBot);
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

                                    if (body.code && indexError <= 5) {
                                        console.log(`Check end assets in master `, body.code)
                                        if (body.code !== -1021) {
                                            indexError++
                                        }

                                        reRequest()
                                    } else if (body.code && !fatalError) {
                                        fatalError = true

                                        messageBot = `Конечная у мастера
                
                                        Check end assets ${body.code}
                                        
                                        Заплаченная комиссия ${commissionAll}`

                                        botMax.sendMessage(userChatId, messageBot);
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
                                    if (body.code && indexError <= 5) {
                                        console.log("End sell BTC ", body.code)
                                        if (body.code !== -1021) {
                                            indexError++
                                        }

                                        reRequest()
                                    } else if (body.code && !fatalError) {
                                        fatalError = true

                                        messageBot = `Конечная у мастера
                
                                        End sell BTC ${body.code}
                                        
                                        Заплаченная комиссия ${commissionAll}`

                                        botMax.sendMessage(userChatId, messageBot);
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
                                    if (body.code && indexError <= 5) {
                                        console.log("End buy BTC fut ", body.code)
                                        if (body.code !== -1021) {
                                            indexError++
                                        }

                                        reRequest()
                                    } else if (body.code && !fatalError) {
                                        fatalError = true

                                        messageBot = `Конечная у мастера
                
                                        End buy BTC fut ${body.code}
                                        
                                        Заплаченная комиссия ${commissionAll}`

                                        botMax.sendMessage(userChatId, messageBot);
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
                                    if (body.code && indexError <= 5) {
                                        console.log("End sell ETH ", body.code)
                                        if (body.code !== -1021) {
                                            indexError++
                                        }

                                        reRequest()
                                    } else if (body.code && !fatalError) {
                                        fatalError = true

                                        messageBot = `Конечная у мастера
                
                                        End sell ETH ${body.code}
                                        
                                        Заплаченная комиссия ${commissionAll}`

                                        botMax.sendMessage(userChatId, messageBot);
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
                                    if (body.code && indexError <= 5) {
                                        console.log("End buy ETH fut ", body.code)
                                        if (body.code !== -1021) {
                                            indexError++
                                        }

                                        reRequest()
                                    } else if (body.code && !fatalError) {
                                        fatalError = true

                                        messageBot = `Конечная у мастера
                
                                        End buy ETH fut ${body.code}
                                        
                                        Заплаченная комиссия ${commissionAll}`

                                        botMax.sendMessage(userChatId, messageBot);
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

                messageBot = `Мастер закончил работу
                            
                Заплаченная комиссия ${commissionAll}`

                botMax.sendMessage(userChatId, messageBot);

                // process.exit()
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
                if (dopComissionBtc !== 0 && dopComissionEth !== 0) {

                    amountUsdt = +(allMoney - 2 - (dopComissionBtc * pricesAsk.btc.usdt) - (dopComissionEth * pricesAsk.eth.usdt)).toFixed(8)

                } else if (dopComissionBtc !== 0 && dopComissionEth === 0) {

                    amountUsdt = +(allMoney - 1 - dopComissionBtc * pricesAsk.btc.usdt).toFixed(8)

                } else if (dopComissionEth !== 0 && dopComissionBtc === 0) {

                    amountUsdt = +(allMoney - 1 - dopComissionEth * pricesAsk.eth.usdt).toFixed(8)

                }
            }

            if (firstDeal && pricesAsk.btc.usdt !== 0 && pricesAsk.eth.usdt !== 0) {



                if (allMoney < fixAmountUsdt) {
                    amountUsdt = allMoney
                } else {
                    amountUsdt = fixAmountUsdt
                }

                dopComissionBtc = +((Math.trunc(((amountUsdt * 0.001 / pricesAsk.btc.usdt) - commissionBtc) * 100000) / 100000) + 0.00001).toFixed(5)
                // commissionBtc = +(commissionBtc + dopComissionBtc).toFixed(8)

                dopComissionEth = +((Math.trunc(((amountUsdt * 0.001 / pricesAsk.eth.usdt) - commissionEth) * 10000) / 10000) + 0.0001).toFixed(4)
                // commissionEth = +(commissionEth + dopComissionEth).toFixed(8)

                amountUsdt = +(allMoney - 2 - (dopComissionBtc * pricesAsk.btc.usdt) - (dopComissionEth * pricesAsk.eth.usdt)).toFixed(8)

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





            let currentAmountUsdt = amountUsdt

            let amBuyBtcUsdt = Math.trunc((currentAmountUsdt / pricesAsk.btc.usdt) * 100000) / 100000
            let amBuyEthUsdt = Math.trunc((currentAmountUsdt / pricesAsk.eth.usdt) * 10000) / 10000


            let amBuyEthBtc = Math.trunc((amBuyBtcUsdt / pricesAsk.eth.btc) * 10000) / 10000
            let amSellEthBtc = amBuyEthUsdt


            let amSellBtcUsdt = Math.trunc((amSellEthBtc * pricesBid.eth.btc) * 100000) / 100000
            let amSellEthUsdt = amBuyEthBtc




            let usdtBtcEth = currentAmountUsdt / pricesAsk.btc.usdt / pricesAsk.eth.btc * pricesBid.eth.usdt
            let usdtEthBtc = currentAmountUsdt / pricesAsk.eth.usdt * pricesBid.eth.btc * pricesBid.btc.usdt


            if (amountUsdt < 6 || amSellBtcUsdt < minNotionalEthbtc || amBuyBtcUsdt <= minNotionalEthbtc) {
                dontCom = true

                if (lastDeal) {
                    stopGame = true

                    console.log(`commissionAll in master `, commissionAll)
                    console.log(`dealsAm in master `, dealsAm)
                    wsBin.close()
                }
            } else {
                if (dontCom) {
                    dontCom = false
                }
            }


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



                if (usdtBtcEthIndex > 6 && !usdtBtcEthDeal && !generalDeal && !dontCom) {
                    usdtBtcEthDeal = true
                    // usdtEthBtcDeal = false
                    generalDeal = true

                    // console.log("Deal usdtBtcEth")
                    console.log("dealsAm ", ++dealsAm);






                    if (dopComissionBtc !== 0 && dopComissionEth === 0) {
                        amBuyBtcUsdt = +(amBuyBtcUsdt + dopComissionBtc).toFixed(5)

                    } else if (dopComissionEth !== 0) {
                        amBuyEthBtc = +(amBuyEthBtc + dopComissionEth).toFixed(4)

                        amBuyBtcUsdt = +((Math.trunc((amBuyEthBtc * pricesAsk.eth.btc) * 100000) / 100000) + 0.00001 + dopComissionBtc).toFixed(5)
                    };

                    commissionBtc = +(commissionBtc + dopComissionBtc).toFixed(8)
                    commissionEth = +(commissionEth + dopComissionEth).toFixed(8);

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
                                            if (body.code && indexError <= 5) {
                                                console.log("Buy BTC usdtBtcEth ", body.code)

                                                if (body.code === -1013) {
                                                    changeNotionalEthBtc = true
                                                    resolve()
                                                } else if (body.code !== -1021) {
                                                    indexError++
                                                }

                                                reRequest()
                                            } else if (body.code && !fatalError) {
                                                fatalError = true

                                                messageBot = `Конечная у мастера
                        
                                                Buy BTC usdtBtcEth ${body.code}
                                                
                                                Заплаченная комиссия ${commissionAll}`

                                                botMax.sendMessage(userChatId, messageBot);
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
                                            if (body.code && indexError <= 5) {
                                                console.log("Sell ETH usdtBtcEth ", body.code)

                                                if (body.code === -1013) {
                                                    changeNotionalEthBtc = true
                                                    resolve()
                                                } else if (body.code !== -1021) {
                                                    indexError++
                                                }

                                                reRequest()
                                            } else if (body.code && !fatalError) {
                                                fatalError = true

                                                messageBot = `Конечная у мастера
                        
                                                Sell ETH usdtBtcEth ${body.code}
                                                
                                                Заплаченная комиссия ${commissionAll}`

                                                botMax.sendMessage(userChatId, messageBot);
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
                                            if (body.code && indexError <= 5) {
                                                console.log("Buy ETH usdtBtcEth ", body.code)

                                                if (body.code === -1013) {
                                                    changeNotionalEthBtc = true
                                                    resolve()
                                                } else if (body.code !== -1021) {
                                                    indexError++
                                                }

                                                reRequest()
                                            } else if (body.code && !fatalError) {
                                                fatalError = true

                                                messageBot = `Конечная у мастера
                        
                                                Buy ETH usdtBtcEth ${body.code}
                                                
                                                Заплаченная комиссия ${commissionAll}`

                                                botMax.sendMessage(userChatId, messageBot);
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

                            if (!changeNotionalEthBtc) {

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

                                            commissionAll = +(commissionAll + +fill.commission * +fill.price).toFixed(8)
                                        }

                                        if (fill.commissionAsset === 'USDT') {
                                            ethPrice = +fill.price
                                            commissionAll = +(commissionAll + +fill.commission).toFixed(8)

                                            allMoney = +(allMoney - +fill.commission).toFixed(8)
                                        }

                                        if (fill.commissionAsset === 'ETH') {
                                            commissionEth = +(commissionEth - +fill.commission).toFixed(8)

                                            midComissionEth = +(midComissionEth + +fill.commission).toFixed(8)

                                            commissionAll = +(commissionAll + +fill.commission * ethPrice).toFixed(8)
                                        }
                                    }

                                    if (deal.symbol === 'ETHBTC') {
                                        let diff = +(amBuyBtcUsdt - deal.cummulativeQuoteQty - dopComissionBtc).toFixed(8)

                                        dirtBtc = +(dirtBtc + diff).toFixed(8)

                                        dirtAmountGo = Math.trunc(dirtBtc * 100000) / 100000

                                        dirtBtc = +(dirtBtc - dirtAmountGo).toFixed(8)

                                    }

                                }

                                dopComissionBtc = 0
                                dopComissionEth = 0

                                if (commissionAll + amountUsdt * 0.003 > maxCommissionAll) {

                                    let lastCommission = +(maxCommissionAll - commissionAll).toFixed(8)

                                    if (lastDeal) {
                                        lastDeal = false
                                    }

                                    howNeedAmountLast = +(lastCommission / 0.003).toFixed(8)

                                    if (howNeedAmountLast >= 6) {

                                        lastDeal = true

                                        amountUsdt = howNeedAmountLast

                                        console.log(`доп сделка в master будет `, amountUsdt)


                                    } else {

                                        stopGame = true
                                        console.log("commissionAll ", commissionAll)
                                        console.log("dealsAm ", dealsAm)
                                        wsBin.close()
                                    }
                                }

                                if (commissionBtc - midComissionBtc <= 0) {
                                    dopComissionBtc = +((Math.trunc((midComissionBtc - commissionBtc) * 100000) / 100000) + 0.00001).toFixed(5)

                                }

                                if (commissionEth - midComissionEth <= 0) {
                                    dopComissionEth = +((Math.trunc((midComissionEth - commissionEth) * 10000) / 10000) + 0.0001).toFixed(4)

                                }

                                generalDeal = false
                            } else {



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


                                            commissionAll = +(commissionAll + +fill.commission * +fill.price).toFixed(8)
                                        }

                                        if (fill.commissionAsset === 'USDT') {
                                            commissionAll = +(commissionAll + +fill.commission).toFixed(8)

                                            allMoney = +(allMoney - +fill.commission).toFixed(8)
                                        }

                                    }
                                }

                                dopComissionBtc = 0
                                dopComissionEth = 0

                                await new Promise((resolve, reject) => {
                                    (function reRequest() {
                                        request.get(
                                            {
                                                url: `https://api.binance.com/api/v3/exchangeInfo?symbol=ETHBTC`,
                                                headers: {
                                                    'X-MBX-APIKEY': publicKey
                                                }
                                            },
                                            (err, response, body) => {
                                                body = JSON.parse(body)
                                                if (body.code && indexError <= 5) {
                                                    console.log(`Change exchangeInfo мастер `, body.code)
                                                    if (body.code !== -1021) {
                                                        indexError++
                                                    }

                                                    reRequest()
                                                } else if (body.code && !fatalError) {
                                                    fatalError = true

                                                    messageBot = `Конечная у мастер
                    
                                                    Change exchangeInfo ${body.code}
                                                    
                                                    Заплаченная комиссия ${commissionAll}`

                                                    botMax.sendMessage(userChatId, messageBot);
                                                } else {
                                                    if (indexError !== 0) {
                                                        indexError = 0
                                                    }

                                                    let symbol = body.symbols[0]

                                                    for (let i = 0; i < symbol.filters.length; i++) {
                                                        let filter = symbol.filters[i]

                                                        if (filter.filterType === "NOTIONAL") {
                                                            minNotionalEthbtc = +filter.minNotional
                                                        }

                                                    }

                                                    resolve()
                                                }

                                            }
                                        )
                                    })()
                                })

                                Promise.all([
                                    new Promise((resolve) => {
                                        (function reRequest() {
                                            let queryOrderBuyBtcUsdt = `symbol=BTCUSDT&side=SELL&type=MARKET&quantity=${(amBuyBtcUsdt - dirtAmountGo).toFixed(5)}&timestamp=${Date.now()}`;
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
                                                    if (body.code && indexError <= 5) {
                                                        console.log(`Sell BTC usdtBtcEth notional мастер `, body.code)

                                                        if (body.code !== -1021) {
                                                            indexError++
                                                        }

                                                        reRequest()
                                                    } else if (body.code && !fatalError) {
                                                        fatalError = true

                                                        messageBot = `Конечная у мастер
                        
                                                        Sell BTC usdtBtcEth notional ${body.code}
                                                        
                                                        Заплаченная комиссия ${commissionAll}`

                                                        botMax.sendMessage(userChatId, messageBot);
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
                                            let queryOrderSellEthUsdt = `symbol=ETHUSDT&side=BUY&type=MARKET&quantity=${amSellEthUsdt}&timestamp=${Date.now()}`;
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
                                                    if (body.code && indexError <= 5) {
                                                        console.log(`Buy ETH usdtBtcEth notional мастер `, body.code)

                                                        if (body.code !== -1021) {
                                                            indexError++
                                                        }

                                                        reRequest()
                                                    } else if (body.code && !fatalError) {
                                                        fatalError = true

                                                        messageBot = `Конечная у мастер
                        
                                                        Buy ETH usdtBtcEth notional ${body.code}
                                                        
                                                        Заплаченная комиссия ${commissionAll}`

                                                        botMax.sendMessage(userChatId, messageBot);
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

                                ]).then((res) => {


                                    for (let i = 0; i < res.length; i++) {
                                        let deal = res[i]

                                        if (deal.symbol === 'ETHUSDT') {
                                            allMoney = +(allMoney - deal.cummulativeQuoteQty).toFixed(8)
                                        }

                                        if (deal.symbol === 'BTCUSDT') {
                                            allMoney = +(allMoney + +deal.cummulativeQuoteQty).toFixed(8)
                                        }

                                        for (let j = 0; j < deal.fills.length; j++) {
                                            let fill = deal.fills[j]

                                            if (fill.commissionAsset === 'ETH') {
                                                commissionEth = +(commissionEth - +fill.commission).toFixed(8)


                                                commissionAll = +(commissionAll + +fill.commission * +fill.price).toFixed(8)
                                            }

                                            if (fill.commissionAsset === 'USDT') {
                                                commissionAll = +(commissionAll + +fill.commission).toFixed(8)

                                                allMoney = +(allMoney - +fill.commission).toFixed(8)
                                            }


                                        }

                                    }

                                    dopComissionBtc = 0
                                    dopComissionEth = 0

                                    dontCom = true

                                    changeNotionalEthBtc = false

                                    generalDeal = false
                                })
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




                if (usdtEthBtcIndex > 6 && !usdtEthBtcDeal && !generalDeal && !dontCom) {
                    usdtEthBtcDeal = true
                    // usdtBtcEthDeal = false
                    generalDeal = true
                    // console.log("Deal usdtEthBtc")
                    console.log("dealsAm ", ++dealsAm);




                    if (dopComissionEth !== 0 && dopComissionBtc === 0) {
                        amBuyEthUsdt = +(amBuyEthUsdt + dopComissionEth).toFixed(4)

                    } else if (dopComissionBtc !== 0) {
                        amSellEthBtc = +((Math.trunc(((amSellBtcUsdt + dopComissionBtc) / pricesBid.eth.btc) * 10000) / 10000) + 0.0001).toFixed(4)

                        amBuyEthUsdt = +(amSellEthBtc + dopComissionEth).toFixed(4)
                    };

                    commissionBtc = +(commissionBtc + dopComissionBtc).toFixed(8)
                    commissionEth = +(commissionEth + dopComissionEth).toFixed(8);

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
                                            if (body.code && indexError <= 5) {
                                                console.log("Buy ETH usdtEthBtc ", body.code)

                                                if (body.code === -1013) {
                                                    changeNotionalEthBtc = true
                                                    resolve()
                                                } else if (body.code !== -1021) {
                                                    indexError++
                                                }

                                                reRequest()
                                            } else if (body.code && !fatalError) {
                                                fatalError = true

                                                messageBot = `Конечная у мастера
                        
                                                Buy ETH usdtEthBtc ${body.code}
                                                
                                                Заплаченная комиссия ${commissionAll}`

                                                botMax.sendMessage(userChatId, messageBot);
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
                                            if (body.code && indexError <= 5) {
                                                console.log("Sell BTC usdtEthBtc ", body.code)

                                                if (body.code === -1013) {
                                                    changeNotionalEthBtc = true
                                                    resolve()
                                                } else if (body.code !== -1021) {
                                                    indexError++
                                                }

                                                reRequest()
                                            } else if (body.code && !fatalError) {
                                                fatalError = true

                                                messageBot = `Конечная у мастера
                        
                                                Sell BTC usdtEthBtc ${body.code}
                                                
                                                Заплаченная комиссия ${commissionAll}`

                                                botMax.sendMessage(userChatId, messageBot);
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
                                            if (body.code && indexError <= 5) {
                                                console.log("Sell ETH usdtEthBtc ", body.code)

                                                if (body.code === -1013) {
                                                    changeNotionalEthBtc = true
                                                    resolve()
                                                } else if (body.code !== -1021) {
                                                    indexError++
                                                }

                                                reRequest()
                                            } else if (body.code && !fatalError) {
                                                fatalError = true

                                                messageBot = `Конечная у мастера
                        
                                                Sell ETH usdtEthBtc ${body.code}
                                                
                                                Заплаченная комиссия ${commissionAll}`

                                                botMax.sendMessage(userChatId, messageBot);
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

                            if (!changeNotionalEthBtc) {

                                let midComissionBtc = 0

                                let midComissionEth = 0

                                let btcPrice = 0

                                for (let i = 0; i < res.length; i++) {
                                    let deal = res[i]

                                    if (deal.symbol === 'ETHUSDT') {
                                        allMoney = +(allMoney - deal.cummulativeQuoteQty).toFixed(8)
                                    }

                                    if (deal.symbol === 'BTCUSDT') {
                                        allMoney = +(allMoney + +deal.cummulativeQuoteQty).toFixed(8)
                                    }

                                    for (let j = 0; j < deal.fills.length; j++) {
                                        let fill = deal.fills[j]

                                        if (fill.commissionAsset === 'ETH') {
                                            commissionEth = +(commissionEth - +fill.commission).toFixed(8)

                                            midComissionEth = +(midComissionEth + +fill.commission).toFixed(8)

                                            commissionAll = +(commissionAll + +fill.commission * +fill.price).toFixed(8)
                                        }

                                        if (fill.commissionAsset === 'USDT') {
                                            btcPrice = +fill.price
                                            commissionAll = +(commissionAll + +fill.commission).toFixed(8)

                                            allMoney = +(allMoney - +fill.commission).toFixed(8)
                                        }


                                        if (fill.commissionAsset === 'BTC') {
                                            commissionBtc = +(commissionBtc - +fill.commission).toFixed(8)

                                            midComissionBtc = +(midComissionBtc + +fill.commission).toFixed(8)

                                            commissionAll = +(commissionAll + +fill.commission * btcPrice).toFixed(8)
                                        }
                                    }

                                    if (deal.symbol === 'ETHBTC') {
                                        let diff = +(deal.cummulativeQuoteQty - amSellBtcUsdt - dopComissionBtc).toFixed(8)

                                        dirtBtc = +(dirtBtc + diff).toFixed(8)

                                        dirtAmountGo = Math.trunc(dirtBtc * 100000) / 100000

                                        dirtBtc = +(dirtBtc - dirtAmountGo).toFixed(8)

                                    }

                                }

                                dopComissionBtc = 0
                                dopComissionEth = 0

                                if (commissionAll + amountUsdt * 0.003 > maxCommissionAll) {

                                    let lastCommission = +(maxCommissionAll - commissionAll).toFixed(8)

                                    if (lastDeal) {
                                        lastDeal = false
                                    }

                                    howNeedAmountLast = +(lastCommission / 0.003).toFixed(8)

                                    if (howNeedAmountLast >= 6) {

                                        lastDeal = true

                                        amountUsdt = howNeedAmountLast

                                        console.log(`доп сделка в master будет `, amountUsdt)

                                    } else {
                                        stopGame = true
                                        console.log("commissionAll ", commissionAll)
                                        console.log("dealsAm ", dealsAm)
                                        wsBin.close()
                                    }
                                }

                                if (commissionBtc - midComissionBtc <= 0) {
                                    dopComissionBtc = +((Math.trunc((midComissionBtc - commissionBtc) * 100000) / 100000) + 0.00001).toFixed(5)

                                }

                                if (commissionEth - midComissionEth <= 0) {
                                    dopComissionEth = +((Math.trunc((midComissionEth - commissionEth) * 10000) / 10000) + 0.0001).toFixed(4)

                                }

                                generalDeal = false
                            } else {


                                for (let i = 0; i < res.length; i++) {
                                    let deal = res[i]

                                    if (deal.symbol === 'ETHUSDT') {
                                        allMoney = +(allMoney - deal.cummulativeQuoteQty).toFixed(8)
                                    }

                                    if (deal.symbol === 'BTCUSDT') {
                                        allMoney = +(allMoney + +deal.cummulativeQuoteQty).toFixed(8)
                                    }

                                    for (let j = 0; j < deal.fills.length; j++) {
                                        let fill = deal.fills[j]

                                        if (fill.commissionAsset === 'ETH') {
                                            commissionEth = +(commissionEth - +fill.commission).toFixed(8)


                                            commissionAll = +(commissionAll + +fill.commission * +fill.price).toFixed(8)
                                        }

                                        if (fill.commissionAsset === 'USDT') {
                                            commissionAll = +(commissionAll + +fill.commission).toFixed(8)

                                            allMoney = +(allMoney - +fill.commission).toFixed(8)
                                        }


                                    }

                                }



                                dopComissionBtc = 0
                                dopComissionEth = 0

                                await new Promise((resolve, reject) => {
                                    (function reRequest() {
                                        request.get(
                                            {
                                                url: `https://api.binance.com/api/v3/exchangeInfo?symbol=ETHBTC`,
                                                headers: {
                                                    'X-MBX-APIKEY': publicKey
                                                }
                                            },
                                            (err, response, body) => {
                                                body = JSON.parse(body)
                                                if (body.code && indexError <= 5) {
                                                    console.log(`Change exchangeInfo мастер `, body.code)
                                                    if (body.code !== -1021) {
                                                        indexError++
                                                    }

                                                    reRequest()
                                                } else if (body.code && !fatalError) {
                                                    fatalError = true

                                                    messageBot = `Конечная у мастер
                    
                                                    Change exchangeInfo ${body.code}
                                                    
                                                    Заплаченная комиссия ${commissionAll}`

                                                    botMax.sendMessage(userChatId, messageBot);
                                                } else {
                                                    if (indexError !== 0) {
                                                        indexError = 0
                                                    }

                                                    let symbol = body.symbols[0]

                                                    for (let i = 0; i < symbol.filters.length; i++) {
                                                        let filter = symbol.filters[i]

                                                        if (filter.filterType === "NOTIONAL") {
                                                            minNotionalEthbtc = +filter.minNotional
                                                        }

                                                    }

                                                    resolve()
                                                }

                                            }
                                        )
                                    })()
                                })

                                Promise.all([
                                    new Promise((resolve) => {
                                        (function reRequest() {
                                            let queryOrderBuyBtcUsdt = `symbol=BTCUSDT&side=BUY&type=MARKET&quantity=${(amBuyBtcUsdt + dirtAmountGo).toFixed(5)}&timestamp=${Date.now()}`;
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
                                                    if (body.code && indexError <= 5) {
                                                        console.log(`Buy BTC usdtBtcEth notional мастер `, body.code)

                                                        if (body.code !== -1021) {
                                                            indexError++
                                                        }

                                                        reRequest()
                                                    } else if (body.code && !fatalError) {
                                                        fatalError = true

                                                        messageBot = `Конечная у мастер
                        
                                                        Buy BTC usdtBtcEth notional ${body.code}
                                                        
                                                        Заплаченная комиссия ${commissionAll}`

                                                        botMax.sendMessage(userChatId, messageBot);
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
                                                    if (body.code && indexError <= 5) {
                                                        console.log(`Sell ETH usdtBtcEth notional мастер `, body.code)

                                                        if (body.code !== -1021) {
                                                            indexError++
                                                        }

                                                        reRequest()
                                                    } else if (body.code && !fatalError) {
                                                        fatalError = true

                                                        messageBot = `Конечная у мастер
                        
                                                        Sell ETH usdtBtcEth notional ${body.code}
                                                        
                                                        Заплаченная комиссия ${commissionAll}`

                                                        botMax.sendMessage(userChatId, messageBot);
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

                                ]).then((res) => {


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


                                                commissionAll = +(commissionAll + +fill.commission * +fill.price).toFixed(8)
                                            }

                                            if (fill.commissionAsset === 'USDT') {
                                                commissionAll = +(commissionAll + +fill.commission).toFixed(8)

                                                allMoney = +(allMoney - +fill.commission).toFixed(8)
                                            }

                                        }
                                    }

                                    dopComissionBtc = 0
                                    dopComissionEth = 0

                                    dontCom = true

                                    changeNotionalEthBtc = false

                                    generalDeal = false
                                })
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

                            if (body.code && indexError <= 5) {
                                console.log("Check USDT after day ", body.code)
                                if (body.code !== -1021) {
                                    indexError++
                                }

                                reRequest()
                            } else if (body.code && !fatalError) {
                                fatalError = true

                                messageBot = `Конечная у мастера
        
                                Check USDT after day ${body.code}
                                
                                Заплаченная комиссия ${commissionAll}`

                                botMax.sendMessage(userChatId, messageBot);
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

                })();


                (function reRequest() {
                    request.get(
                        {
                            url: `https://api.binance.com/api/v3/exchangeInfo?symbol=ETHBTC`,
                            headers: {
                                'X-MBX-APIKEY': publicKey
                            }
                        },
                        (err, response, body) => {
                            body = JSON.parse(body)
                            if (body.code && indexError <= 5) {
                                console.log(`After day exchangeInfo мастер `, body.code)
                                if (body.code !== -1021) {
                                    indexError++
                                }

                                reRequest()
                            } else if (body.code && !fatalError) {
                                fatalError = true

                                messageBot = `Конечная у мастер

                                After day exchangeInfo ${body.code}
                                
                                Заплаченная комиссия ${commissionAll}`

                                botMax.sendMessage(userChatId, messageBot);
                            } else {
                                if (indexError !== 0) {
                                    indexError = 0
                                }

                                let symbol = body.symbols[0]

                                for (let i = 0; i < symbol.filters.length; i++) {
                                    let filter = symbol.filters[i]

                                    if (filter.filterType === "NOTIONAL") {
                                        minNotionalEthbtc = +filter.minNotional
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

    let minimumSpotEth = 0


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
                        if (body.code && indexError <= 5) {
                            console.log("Depth BTC after bigChange ", body.code)
                            if (body.code !== -1021) {
                                indexError++
                            }

                            reRequest()
                        } else if (body.code && !fatalError) {
                            fatalError = true

                            messageBot = `Конечная у мастера
    
                            Depth BTC after bigChange ${body.code}
                            
                            Заплаченная комиссия ${commissionAll}`

                            botMax.sendMessage(userChatId, messageBot);
                        } else {
                            if (indexError !== 0) {
                                indexError = 0
                            }

                            newStartPriceBtc = +body.asks[0][0]



                            let possibleAmount = amountFirstActive / +body.asks[0][0]

                            let factAmount = Math.trunc(possibleAmount * 1000) / 1000

                            newBaseBtc = +(factAmount + 0.001).toFixed(3)

                            newBaseBtcSmall = Math.trunc((newBaseBtc / howMuchAccounts) * 100000000) / 100000000


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
                        if (body.code && indexError <= 5) {
                            console.log("Depth ETH after bigChange ", body.code)
                            if (body.code !== -1021) {
                                indexError++
                            }

                            reRequest()
                        } else if (body.code && !fatalError) {
                            fatalError = true

                            messageBot = `Конечная у мастера
    
                            Depth ETH after bigChange ${body.code}
                            
                            Заплаченная комиссия ${commissionAll}`

                            botMax.sendMessage(userChatId, messageBot);
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

                            let minimumPossibleAmountSpot = 5 / +body.asks[0][0]

                            minimumSpotEth = Math.trunc((minimumPossibleAmountSpot + 0.0002) * 10000) / 10000

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
    let dopMinimumSpotEth = null

    let diffBaseEth = +(baseEth - newBaseEth).toFixed(3)

    if (diffBaseEth < 0) {

        sideDealEth = 'BUY'//\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\\

        sideDealEthFut = 'SELL'

        diffBaseEth = Math.abs(diffBaseEth)

        if (diffBaseEth < minimumBuyEth) {
            dopMinimumEth = +(minimumBuyEth - diffBaseEth).toFixed(3)
        }

        if (diffBaseEth < minimumSpotEth) {
            dopMinimumSpotEth = true
        }

    } else if (diffBaseEth > 0) {
        sideDealEth = 'SELL'//\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\\

        sideDealEthFut = 'BUY'

        if (diffBaseEth < minimumSpotEth) {
            dopMinimumSpotEth = true
        }

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
                if (body.code && indexError <= 5) {
                    console.log(`Trans ${typeTransfer} after bigChange `, body.code)
                    if (body.code !== -1021) {
                        indexError++
                    }

                    reRequest()
                } else if (body.code && !fatalError) {
                    fatalError = true

                    messageBot = `Конечная у мастера

                    Trans ${typeTransfer} after bigChange ${body.code}
                    
                    Заплаченная комиссия ${commissionAll}`

                    botMax.sendMessage(userChatId, messageBot);
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

    // let smallDopComBtc = 0
    // let smallDopComEth = 0

    // if (sideDealBtc === 'BUY') {
    //     if (diffBaseBtc * 0.001 < commissionBtc) {
    //         commissionBtc = +(commissionBtc - diffBaseBtc * 0.001).toFixed(8)///////////////////////////////
    //     } else {
    //         smallDopComBtc = +((Math.trunc(diffBaseBtc * 0.0011 * 100000) / 100000) + 0.00001).toFixed(5)
    //         // commissionBtc = +(firstComBtc - (+(baseBtc + firstComBtc).toFixed(5) * 0.001)).toFixed(8)

    //         let restDopComBtc = +(smallDopComBtc - (+(diffBaseBtc + smallDopComBtc).toFixed(5) * 0.001)).toFixed(8)

    //         commissionBtc = +(commissionBtc + restDopComBtc).toFixed(8)////////////////////////////////////
    //     }
    // }////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // if (sideDealEth === 'BUY') {
    //     if (diffBaseEth * 0.001 < commissionEth) {
    //         commissionEth = +(commissionEth - diffBaseEth * 0.001).toFixed(8)//////////////
    //     } else {
    //         smallDopComEth = +((Math.trunc(diffBaseEth * 0.0011 * 10000) / 10000) + 0.0001).toFixed(4)

    //         let restDopComEth = +(smallDopComEth - (+(diffBaseEth + smallDopComEth).toFixed(4) * 0.001)).toFixed(8)

    //         commissionEth = +(commissionEth + restDopComEth).toFixed(8)//////////////////////////
    //     }
    // }////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async function buyCoinsEnd() {




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
                                if (body.code && indexError <= 5) {
                                    console.log(`${sideDealBtc} BTC bigChange `, body.code)
                                    if (body.code !== -1021) {
                                        indexError++
                                    }

                                    reRequest()
                                } else if (body.code && !fatalError) {
                                    fatalError = true

                                    messageBot = `Конечная у мастера
                
                                    ${sideDealBtc} BTC bigChange ${body.code}
                                    
                                    Заплаченная комиссия ${commissionAll}`

                                    botMax.sendMessage(userChatId, messageBot);
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
                    resolve()
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
                                    if (body.code && indexError <= 5) {
                                        console.log(`${sideDealBtcFut} BTC fut bigChange `, body.code)
                                        if (body.code !== -1021) {
                                            indexError++
                                        }

                                        reRequest()
                                    } else if (body.code && !fatalError) {
                                        fatalError = true

                                        messageBot = `Конечная у мастера
                    
                                        ${sideDealBtcFut} BTC fut bigChange ${body.code}
                                        
                                        Заплаченная комиссия ${commissionAll}`

                                        botMax.sendMessage(userChatId, messageBot);
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
                                    if (body.code && indexError <= 5) {
                                        console.log("Buy BTC fut for dopMinus ", body.code)
                                        if (body.code !== -1021) {
                                            indexError++
                                        }

                                        reRequest()
                                    } else if (body.code && !fatalError) {
                                        fatalError = true

                                        messageBot = `Конечная у мастера
                    
                                        Buy BTC fut for dopMinus ${body.code}
                                        
                                        Заплаченная комиссия ${commissionAll}`

                                        botMax.sendMessage(userChatId, messageBot);
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
                                                    if (body.code && indexError <= 5) {
                                                        console.log("Sell BTC fut after dopMinus ", body.code)
                                                        if (body.code !== -1021) {
                                                            indexError++
                                                        }

                                                        reRequest()
                                                    } else if (body.code && !fatalError) {
                                                        fatalError = true

                                                        messageBot = `Конечная у мастера
                                    
                                                        Sell BTC fut after dopMinus ${body.code}
                                                        
                                                        Заплаченная комиссия ${commissionAll}`

                                                        botMax.sendMessage(userChatId, messageBot);
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
                } else {
                    resolve()
                }
            }),
            new Promise((resolve, reject) => {
                if (sideDealEth) {

                    if (!dopMinimumSpotEth) {

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
                                    if (body.code && indexError <= 5) {
                                        console.log(`${sideDealEth} ETH bigChange `, body.code)
                                        if (body.code !== -1021) {
                                            indexError++
                                        }

                                        reRequest()
                                    } else if (body.code && !fatalError) {
                                        fatalError = true

                                        messageBot = `Конечная у мастера
                    
                                        ${sideDealEth} ETH bigChange ${body.code}
                                        
                                        Заплаченная комиссия ${commissionAll}`

                                        botMax.sendMessage(userChatId, messageBot);
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
                            let queryOrderBuyEthUsdt = `symbol=ETHUSDT&side=${sideDealEth}&type=MARKET&quantity=${(diffBaseEth + minimumSpotEth).toFixed(4)}&timestamp=${Date.now()}`;
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
                                    if (body.code && indexError <= 5) {
                                        console.log(`${sideDealEth} 1 ETH bigChange dopMinimumSpotEth `, body.code)
                                        if (body.code !== -1021) {
                                            indexError++
                                        }

                                        reRequest()
                                    } else if (body.code && !fatalError) {
                                        fatalError = true

                                        messageBot = `Конечная у мастера
                    
                                        ${sideDealEth} 1 ETH bigChange dopMinimumSpotEth ${body.code}
                                        
                                        Заплаченная комиссия ${commissionAll}`

                                        botMax.sendMessage(userChatId, messageBot);
                                    } else {
                                        if (indexError !== 0) {
                                            indexError = 0
                                        };

                                        (function reRequest() {
                                            let queryOrderBuyEthUsdt = `symbol=ETHUSDT&side=${sideDealEthFut}&type=MARKET&quantity=${minimumSpotEth}&timestamp=${Date.now()}`;
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
                                                    if (body.code && indexError <= 5) {
                                                        console.log(`${sideDealEthFut} 2 ETH bigChange dopMinimumSpotEth `, body.code)
                                                        if (body.code !== -1021) {
                                                            indexError++
                                                        }

                                                        reRequest()
                                                    } else if (body.code && !fatalError) {
                                                        fatalError = true

                                                        messageBot = `Конечная у мастера
                                    
                                                        ${sideDealEthFut} 2 ETH bigChange dopMinimumSpotEth ${body.code}
                                                        
                                                        Заплаченная комиссия ${commissionAll}`

                                                        botMax.sendMessage(userChatId, messageBot);
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
                } else {
                    resolve()
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
                                    if (body.code && indexError <= 5) {
                                        console.log(`${sideDealEthFut} ETH fut bigChange `, body.code)
                                        if (body.code !== -1021) {
                                            indexError++
                                        }

                                        reRequest()
                                    } else if (body.code && !fatalError) {
                                        fatalError = true

                                        messageBot = `Конечная у мастера
                    
                                        ${sideDealEthFut} ETH fut bigChange ${body.code}
                                        
                                        Заплаченная комиссия ${commissionAll}`

                                        botMax.sendMessage(userChatId, messageBot);
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
                                    if (body.code && indexError <= 5) {
                                        console.log("Buy ETH fut for dopMinus ", body.code)
                                        if (body.code !== -1021) {
                                            indexError++
                                        }

                                        reRequest()
                                    } else if (body.code && !fatalError) {
                                        fatalError = true

                                        messageBot = `Конечная у мастера
                    
                                        Buy ETH fut for dopMinus ${body.code}
                                        
                                        Заплаченная комиссия ${commissionAll}`

                                        botMax.sendMessage(userChatId, messageBot);
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
                                                    if (body.code && indexError <= 5) {
                                                        console.log("Sell ETH fut after dopMinus ", body.code)
                                                        if (body.code !== -1021) {
                                                            indexError++
                                                        }

                                                        reRequest()
                                                    } else if (body.code && !fatalError) {
                                                        fatalError = true

                                                        messageBot = `Конечная у мастера
                                    
                                                        Sell ETH fut after dopMinus ${body.code}
                                                        
                                                        Заплаченная комиссия ${commissionAll}`

                                                        botMax.sendMessage(userChatId, messageBot);
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
                } else {
                    resolve()
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







        let restBtcSmall = 0
        let restEthSmall = 0

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

                            if (body.code && indexError <= 5) {
                                console.log("Check bigChange USDT ", body.code)
                                if (body.code !== -1021) {
                                    indexError++
                                }

                                reRequest()
                            } else if (body.code && !fatalError) {
                                fatalError = true

                                messageBot = `Конечная у мастера
            
                                Check bigChange USDT ${body.code}
                                
                                Заплаченная комиссия ${commissionAll}`

                                botMax.sendMessage(userChatId, messageBot);
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


                                    }
                                    if (body[i].asset === 'BTC') {
                                        if (bigChange) {
                                            commissionBtc = +(+body[i].free - baseBtc - (dirtBtc + dirtAmountGo)).toFixed(8)
                                        } else if (workerSayChange) {
                                            restBtcSmall = Math.trunc((+body[i].free / howMuchAccounts) * 100000000) / 100000000
                                        }
                                    }
                                    if (body[i].asset === 'ETH') {
                                        if (bigChange) {
                                            commissionEth = +(+body[i].free - baseEth).toFixed(8)
                                        } else if (workerSayChange) {
                                            restEthSmall = Math.trunc((+body[i].free / howMuchAccounts) * 100000000) / 100000000
                                        }
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




            messageBot = `Перевод после bigChange

            Перевести по: ${baseUsdtSmall} USDT, ${restBtcSmall} BTC, ${restEthSmall} ETH`

            botMax.sendMessage(userChatId, messageBot);
        }





    }




}




///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////