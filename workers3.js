const cluster = require('cluster');

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



let startPriceBtc = 0
let startPriceEth = 0

let baseBtc = 0
let baseEth = 0

let commissionBtc = 0
let commissionEth = 0

let maxCommissionAll = 0
let comUpdate = false
let waitUpdate = false

let mainAddress = '0xd742ecbbc74093e2fb3fa34888aeb0eff24d8d87'

let fatalError = false
let indexError = 0

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
        baseBtc = +packet.data.baseBtcSmall
    }

    if (packet.topic === 'startEth') {
        startPriceEth = +packet.data.startPriceEth
        baseEth = +packet.data.baseEthSmall
    }

    if (packet.topic === 'comUpdate') {
        maxCommissionAll += +packet.data.morecom
        comUpdate = true

        if (waitUpdate) {
            waitUpdate = false
        }
    }

    if (packet.topic === 'updateComis') {
        maxCommissionAll += +packet.data.smallCom

        if (waitUpdate) {
            waitUpdate = false
        }
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

        let minNotionalEthbtc = 0
        let changeNotionalEthBtc = false


        let commissionAll = 0
        maxCommissionAll = packet.data.maxCommissionAllSmall
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


        let dopComissionBtc = 0
        let dopComissionEth = 0;

        let lastDeal = false;
        let howNeedAmountLast = 0;

        let depoIndex = 0
        let startTimeDepoIndex = Date.now()

        let indexUpdateBigChange = 0

        let globalStart = false
        let bigChangeStart = false


        let firstDeal = true;

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
                            if (body.code && indexError <= 5) {
                                if (body.code !== -1021) {
                                    indexError++
                                }

                                reRequest()
                            } else if (body.code && !fatalError) {
                                fatalError = true

                                messageBot = `Конечная у ${account.name}

                                Получение начального listenKey ${body.code}
                                
                                Заплаченная комиссия ${commissionAll}`

                                botMax.sendMessage(userChatId, messageBot);
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
                    // indexUpdate++
                    console.log(data);

                    (function reRequest() {

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

                                if (body.code && indexError <= 5) {
                                    console.log("Balance update depoHistory ", body.code)
                                    if (body.code !== -1021) {
                                        indexError++
                                    }

                                    reRequest()
                                } else if (body.code && !fatalError) {
                                    fatalError = true

                                    messageBot = `Конечная у ${account.name}
            
                                    Balance update depoHistory ${body.code}
                                    
                                    Заплаченная комиссия ${commissionAll}`

                                    botMax.sendMessage(userChatId, messageBot);
                                } else {
                                    if (indexError !== 0) {
                                        indexError = 0
                                    }

                                    let newDepoIndex = body.length


                                    if (newDepoIndex === 3 && !globalStart) {

                                        globalStart = true

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



                                    }

                                    if (bigChange && !stopGame) {

                                        if (newDepoIndex === indexUpdateBigChange && !bigChangeStart && bigChange) {

                                            bigChangeStart = true

                                            process.send({
                                                type: 'process:msg',
                                                data: {
                                                    type: 'upAfterChange'
                                                }
                                            });

                                            checkMoneyAfterBig();
                                        }
                                    }


                                    if (newDepoIndex === depoIndex) {
                                        if (!stopGame) {
                                            if (+data.d > 0) {
                                                firstDeal = true
                                                allMoney = +(allMoney + +data.d).toFixed(8)
                                            }
                                        } else {
                                            if (+data.d > 0) {

                                            
                                                messageBot = `Перевод из аккаунта ${account.name} на следующий день после конца

                                                Баланс ${data.d} USDT`


                                                botMax.sendMessage(userChatId, messageBot);
                                            }
                                        }
                                    }


                                    depoIndex = newDepoIndex

                                }

                            }
                        );
                    })()



                }

            }
        })();

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


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
                                console.log(`Старт exchangeInfo ${account.index} `, body.code)
                                if (body.code !== -1021) {
                                    indexError++
                                }

                                reRequest()
                            } else if (body.code && !fatalError) {
                                fatalError = true

                                messageBot = `Конечная у ${account.name}

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

                            // console.log('Body asset ', body)


                            if (body.code && indexError <= 5) {
                                console.log(`Check start USDT in ${account.index} `, body.code)
                                if (body.code !== -1021) {
                                    indexError++
                                }

                                reRequest()
                            } else if (body.code && !fatalError) {
                                fatalError = true

                                messageBot = `Конечная у ${account.name}

                                Check start USDT ${body.code}
                                
                                Заплаченная комиссия ${commissionAll}`

                                botMax.sendMessage(userChatId, messageBot);
                            } else {
                                if (indexError !== 0) {
                                    indexError = 0
                                }
                                for (let i = 0; i < body.length; i++) {
                                    if (body[i].asset === 'USDT') {

                                        allMoney = +body[i].free

                                        console.log(`allMoney в ${account.index} после чека `, allMoney)

                                        // moneyForCommission = +(+body[i].free - amountUsdt).toFixed(8)
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

                    process.send({
                        type: 'process:msg',
                        data: {
                            type: 'workerEnd'
                        }
                    });


                    messageBot = `Воркер закончил работу

                    Перевести деньги из ${account.name}`

                    setTimeout(() => {
                        botMax.sendMessage(userChatId, messageBot);
                    }, account.index * 3000);



                    console.log(`Дело сделано у ${account.name} ` + new Date().toLocaleTimeString())

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

                    if (!firstDeal) {
                        if (dopComissionBtc !== 0 && dopComissionEth !== 0) {

                            amountUsdt = +(allMoney - 2 - (dopComissionBtc * pricesAsk.btc.usdt) - (dopComissionEth * pricesAsk.eth.usdt)).toFixed(8)

                        } else if (dopComissionBtc !== 0 && dopComissionEth === 0) {

                            amountUsdt = +(allMoney - 1 - dopComissionBtc * pricesAsk.btc.usdt).toFixed(8)

                        } else if (dopComissionEth !== 0 && dopComissionBtc === 0) {

                            amountUsdt = +(allMoney - 1 - dopComissionEth * pricesAsk.eth.usdt).toFixed(8)

                        }
                    }

                    if (firstDeal && pricesAsk.btc.usdt !== 0 && pricesAsk.eth.usdt !== 0 && !generalDeal) {



                        if (allMoney < fixAmountUsdt) {
                            amountUsdt = allMoney
                        } else {
                            amountUsdt = fixAmountUsdt
                        }

                        console.log(`Комиссии начало commissionBtc ${commissionBtc} commissionEth ${commissionEth}`)

                        let needComBtc = (amountUsdt * 0.001 / pricesAsk.btc.usdt) - commissionBtc
                        let needComEth = (amountUsdt * 0.001 / pricesAsk.eth.usdt) - commissionEth

                        if (needComBtc > 0) {
                            dopComissionBtc = +((Math.trunc(needComBtc * 100000) / 100000) + 0.00001).toFixed(5)
                        } else {

                            let needMinusComBtc = Math.trunc(needComBtc * 100000) / 100000

                            if (needMinusComBtc < 0) {
                                dopComissionBtc = needMinusComBtc
                            }
                        }

                        if (needComEth > 0) {
                            dopComissionEth = +((Math.trunc(needComEth * 10000) / 10000) + 0.0001).toFixed(4)
                        } else {
                            let needMinusComEth = Math.trunc(needComEth * 10000) / 10000

                            if (needMinusComEth < 0) {
                                dopComissionEth = needMinusComEth
                            }
                        }
                        // dopComissionBtc = +((Math.trunc(((amountUsdt * 0.001 / pricesAsk.btc.usdt) - commissionBtc) * 100000) / 100000) + 0.00001).toFixed(5)
                        // // commissionBtc = +(commissionBtc + dopComissionBtc).toFixed(8)

                        // dopComissionEth = +((Math.trunc(((amountUsdt * 0.001 / pricesAsk.eth.usdt) - commissionEth) * 10000) / 10000) + 0.0001).toFixed(4)
                        // commissionEth = +(commissionEth + dopComissionEth).toFixed(8)



                        console.log(`Доп комиссии начало dopComissionBtc ${dopComissionBtc} dopComissionEth ${dopComissionEth}`)

                        if (dopComissionBtc !== 0 && dopComissionEth !== 0) {

                            amountUsdt = +(allMoney - 2 - (dopComissionBtc * pricesAsk.btc.usdt) - (dopComissionEth * pricesAsk.eth.usdt)).toFixed(8)

                        } else if (dopComissionBtc !== 0 && dopComissionEth === 0) {

                            amountUsdt = +(allMoney - 1 - dopComissionBtc * pricesAsk.btc.usdt).toFixed(8)

                        } else if (dopComissionEth !== 0 && dopComissionBtc === 0) {

                            amountUsdt = +(allMoney - 1 - dopComissionEth * pricesAsk.eth.usdt).toFixed(8)

                        }

                        // amountUsdt = +(allMoney - 2 - (dopComissionBtc * pricesAsk.btc.usdt) - (dopComissionEth * pricesAsk.eth.usdt)).toFixed(8)

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

                    let currentDopComissionBtc = dopComissionBtc
                    let currentDopComissionEth = dopComissionEth

                    let currentAmountUsdt = amountUsdt

                    let amBuyBtcUsdt = Math.trunc((currentAmountUsdt / pricesAsk.btc.usdt) * 100000) / 100000
                    let amBuyEthUsdt = Math.trunc((currentAmountUsdt / pricesAsk.eth.usdt) * 10000) / 10000


                    let amBuyEthBtc = Math.trunc((amBuyBtcUsdt / pricesAsk.eth.btc) * 10000) / 10000
                    let amSellEthBtc = amBuyEthUsdt


                    let amSellBtcUsdt = Math.trunc((amSellEthBtc * pricesBid.eth.btc) * 100000) / 100000
                    let amSellEthUsdt = amBuyEthBtc


                    let usdtBtcEth = currentAmountUsdt / pricesAsk.btc.usdt / pricesAsk.eth.btc * pricesBid.eth.usdt
                    let usdtEthBtc = currentAmountUsdt / pricesAsk.eth.usdt * pricesBid.eth.btc * pricesBid.btc.usdt



                    if (amountUsdt < 6.5 || amSellBtcUsdt < minNotionalEthbtc || amBuyBtcUsdt <= minNotionalEthbtc) {
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


                    // console.log('usdtBtcEth ', usdtBtcEth)
                    // console.log('usdtEthBtc ', usdtEthBtc)
                    // console.log('amountUsdt ', amountUsdt)
                    // console.log('dontCom ', dontCom)

                    if ((usdtBtcEth - currentAmountUsdt) / currentAmountUsdt > 0.00017 && usdtBtcEth !== Infinity && !stopGame) {

                        usdtBtcEthIndex++



                        if (usdtBtcEthIndex > 6 && !usdtBtcEthDeal && !generalDeal && !dontCom && !waitUpdate) {
                            usdtBtcEthDeal = true
                            // usdtEthBtcDeal = false
                            generalDeal = true

                            // console.log("Deal usdtBtcEth")
                            console.log("dealsAm ", ++dealsAm);


                            if (currentDopComissionBtc !== 0 && currentDopComissionEth === 0) {
                                amBuyBtcUsdt = +(amBuyBtcUsdt + currentDopComissionBtc).toFixed(5)

                            } else if (currentDopComissionEth !== 0) {
                                amBuyEthBtc = +(amBuyEthBtc + currentDopComissionEth).toFixed(4)

                                amBuyBtcUsdt = +((Math.trunc((amBuyEthBtc * pricesAsk.eth.btc) * 100000) / 100000) + 0.00001 + currentDopComissionBtc).toFixed(5)
                            };

                            if (currentAmountUsdt === amountUsdt && currentDopComissionBtc === dopComissionBtc && currentDopComissionEth === dopComissionEth) {

                                commissionBtc = +(commissionBtc + currentDopComissionBtc).toFixed(8)
                                commissionEth = +(commissionEth + currentDopComissionEth).toFixed(8);


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
                                                            console.log(`Buy BTC usdtBtcEth ${account.index} `, body.code)

                                                            if (body.code === -1013) {
                                                                changeNotionalEthBtc = true
                                                                resolve()
                                                            } else if (body.code !== -1021) {
                                                                indexError++
                                                            }

                                                            reRequest()
                                                        } else if (body.code && !fatalError) {
                                                            fatalError = true

                                                            messageBot = `Конечная у ${account.name}
                        
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
                                                            console.log(`Sell ETH usdtBtcEth ${account.index} `, body.code)

                                                            if (body.code === -1013) {
                                                                changeNotionalEthBtc = true
                                                                resolve()
                                                            } else if (body.code !== -1021) {
                                                                indexError++
                                                            }

                                                            reRequest()
                                                        } else if (body.code && !fatalError) {
                                                            fatalError = true

                                                            messageBot = `Конечная у ${account.name}
                        
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
                                                            console.log(`Buy ETH usdtBtcEth ${account.index} `, body.code)

                                                            if (body.code === -1013) {
                                                                changeNotionalEthBtc = true
                                                                resolve()
                                                            } else if (body.code !== -1021) {
                                                                indexError++
                                                            }

                                                            reRequest()
                                                        } else if (body.code && !fatalError) {
                                                            fatalError = true

                                                            messageBot = `Конечная у ${account.name}
                        
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
                                                    let diff = +(amBuyBtcUsdt - deal.cummulativeQuoteQty - currentDopComissionBtc).toFixed(8)

                                                    dirtBtc = +(dirtBtc + diff).toFixed(8)

                                                    dirtAmountGo = Math.trunc(dirtBtc * 100000) / 100000

                                                    dirtBtc = +(dirtBtc - dirtAmountGo).toFixed(8)

                                                }

                                            }

                                            dopComissionBtc = 0
                                            dopComissionEth = 0

                                            if (commissionAll + amountUsdt * 0.003 > maxCommissionAll) {

                                                if (comUpdate) {

                                                    let lastCommission = +(maxCommissionAll - commissionAll).toFixed(8)

                                                    if (lastDeal) {
                                                        lastDeal = false
                                                    }

                                                    howNeedAmountLast = +(lastCommission / 0.003).toFixed(8)

                                                    if (howNeedAmountLast >= 6) {


                                                        // moneyForCommission = +(moneyForCommission + (amountUsdt - howNeedAmount)).toFixed(8)

                                                        lastDeal = true

                                                        amountUsdt = howNeedAmountLast

                                                        console.log(`доп сделка в ${account.index} будет `, amountUsdt)

                                                    } else {

                                                        stopGame = true
                                                        console.log(`commissionAll in ${account.index} `, commissionAll)
                                                        console.log(`dealsAm in ${account.index} `, dealsAm)
                                                        wsBin.close()

                                                    }

                                                } else {
                                                    waitUpdate = true

                                                    messageBot = `${account.name} ждёт комиссию
                                
                                                    Заплаченная комиссия ${commissionAll}`

                                                    botMax.sendMessage(userChatId, messageBot);
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
                                                                console.log(`Change exchangeInfo ${account.index} `, body.code)
                                                                if (body.code !== -1021) {
                                                                    indexError++
                                                                }

                                                                reRequest()
                                                            } else if (body.code && !fatalError) {
                                                                fatalError = true

                                                                messageBot = `Конечная у ${account.name}
                            
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
                                                                    console.log(`Sell BTC usdtBtcEth notional ${account.index} `, body.code)

                                                                    if (body.code !== -1021) {
                                                                        indexError++
                                                                    }

                                                                    reRequest()
                                                                } else if (body.code && !fatalError) {
                                                                    fatalError = true

                                                                    messageBot = `Конечная у ${account.name}
                                
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
                                                                    console.log(`Buy ETH usdtBtcEth notional ${account.index} `, body.code)

                                                                    if (body.code !== -1021) {
                                                                        indexError++
                                                                    }

                                                                    reRequest()
                                                                } else if (body.code && !fatalError) {
                                                                    fatalError = true

                                                                    messageBot = `Конечная у ${account.name}
                                
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

                            }
                            //заходим в сделку
                        }
                        // console.log("usdtBtcEth ", usdtBtcEth, new Date(Date.now()))
                    } else {
                        if (usdtBtcEthIndex > 0) {
                            usdtBtcEthIndex = 0
                            usdtBtcEthDeal = false
                        }
                    }



                    if ((usdtEthBtc - currentAmountUsdt) / currentAmountUsdt > 0.00017 && usdtEthBtc !== Infinity && !stopGame) {
                        usdtEthBtcIndex++



                        if (usdtEthBtcIndex > 6 && !usdtEthBtcDeal && !generalDeal && !dontCom && !waitUpdate) {
                            usdtEthBtcDeal = true
                            // usdtBtcEthDeal = false
                            generalDeal = true
                            // console.log("Deal usdtEthBtc")
                            console.log("dealsAm ", ++dealsAm);


                            if (currentDopComissionEth !== 0 && currentDopComissionBtc === 0) {
                                amBuyEthUsdt = +(amBuyEthUsdt + currentDopComissionEth).toFixed(4)

                            } else if (currentDopComissionBtc !== 0) {
                                amSellEthBtc = +((Math.trunc(((amSellBtcUsdt + currentDopComissionBtc) / pricesBid.eth.btc) * 10000) / 10000) + 0.0001).toFixed(4)

                                amBuyEthUsdt = +(amSellEthBtc + currentDopComissionEth).toFixed(4)
                            };

                            if (currentAmountUsdt === amountUsdt && currentDopComissionBtc === dopComissionBtc && currentDopComissionEth === dopComissionEth) {

                                commissionBtc = +(commissionBtc + currentDopComissionBtc).toFixed(8)
                                commissionEth = +(commissionEth + currentDopComissionEth).toFixed(8);

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
                                                            console.log(`Buy ETH usdtEthBtc ${account.index} `, body.code)
                                                            if (body.code === -1013) {
                                                                changeNotionalEthBtc = true
                                                                resolve()
                                                            } else if (body.code !== -1021) {
                                                                indexError++
                                                            }

                                                            reRequest()
                                                        } else if (body.code && !fatalError) {
                                                            fatalError = true

                                                            messageBot = `Конечная у ${account.name}
                        
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
                                                            console.log(`Sell BTC usdtEthBtc ${account.index} `, body.code)

                                                            if (body.code === -1013) {
                                                                changeNotionalEthBtc = true
                                                                resolve()
                                                            } else if (body.code !== -1021) {
                                                                indexError++
                                                            }

                                                            reRequest()
                                                        } else if (body.code && !fatalError) {
                                                            fatalError = true

                                                            messageBot = `Конечная у ${account.name}
                        
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
                                                            console.log(`Sell ETH usdtEthBtc ${account.index} `, body.code)

                                                            if (body.code === -1013) {
                                                                changeNotionalEthBtc = true
                                                                resolve()
                                                            } else if (body.code !== -1021) {
                                                                indexError++
                                                            }

                                                            reRequest()
                                                        } else if (body.code && !fatalError) {
                                                            fatalError = true

                                                            messageBot = `Конечная у ${account.name}
                        
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
                                                    let diff = +(deal.cummulativeQuoteQty - amSellBtcUsdt - currentDopComissionBtc).toFixed(8)///////////

                                                    dirtBtc = +(dirtBtc + diff).toFixed(8)

                                                    dirtAmountGo = Math.trunc(dirtBtc * 100000) / 100000

                                                    dirtBtc = +(dirtBtc - dirtAmountGo).toFixed(8)

                                                }

                                            }

                                            dopComissionBtc = 0
                                            dopComissionEth = 0

                                            if (commissionAll + amountUsdt * 0.003 > maxCommissionAll) {

                                                if (comUpdate) {

                                                    let lastCommission = +(maxCommissionAll - commissionAll).toFixed(8)

                                                    if (lastDeal) {
                                                        lastDeal = false
                                                    }

                                                    howNeedAmountLast = +(lastCommission / 0.003).toFixed(8)

                                                    if (howNeedAmountLast >= 6) {

                                                        // moneyForCommission = +(moneyForCommission + (amountUsdt - howNeedAmount)).toFixed(8)

                                                        lastDeal = true

                                                        amountUsdt = howNeedAmountLast

                                                        console.log(`доп сделка в ${account.index} будет `, amountUsdt)

                                                    } else {

                                                        stopGame = true
                                                        console.log(`commissionAll in ${account.index} `, commissionAll)
                                                        console.log(`dealsAm in ${account.index} `, dealsAm)
                                                        wsBin.close()

                                                    }

                                                } else {
                                                    waitUpdate = true
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
                                                                console.log(`Change exchangeInfo ${account.index} `, body.code)
                                                                if (body.code !== -1021) {
                                                                    indexError++
                                                                }

                                                                reRequest()
                                                            } else if (body.code && !fatalError) {
                                                                fatalError = true

                                                                messageBot = `Конечная у ${account.name}
                            
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
                                                                    console.log(`Buy BTC usdtBtcEth notional ${account.index} `, body.code)

                                                                    if (body.code !== -1021) {
                                                                        indexError++
                                                                    }

                                                                    reRequest()
                                                                } else if (body.code && !fatalError) {
                                                                    fatalError = true

                                                                    messageBot = `Конечная у ${account.name}
                                
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
                                                                    console.log(`Sell ETH usdtBtcEth notional ${account.index} `, body.code)

                                                                    if (body.code !== -1021) {
                                                                        indexError++
                                                                    }

                                                                    reRequest()
                                                                } else if (body.code && !fatalError) {
                                                                    fatalError = true

                                                                    messageBot = `Конечная у ${account.name}
                                
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
                            }
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

                indexUpdateBigChange = depoIndex + 3


                process.send({
                    type: 'process:msg',
                    data: {
                        type: 'maxChange'
                    }
                });


            }




            let today = new Date().getUTCDate()

            setInterval(() => {
                if (new Date().getUTCDate() !== today) {
                    today = new Date().getUTCDate();

                    setTimeout(async () => {

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
                                        console.log(`After day exchangeInfo ${account.index} `, body.code)
                                        if (body.code !== -1021) {
                                            indexError++
                                        }

                                        reRequest()
                                    } else if (body.code && !fatalError) {
                                        fatalError = true

                                        messageBot = `Конечная у ${account.name}
        
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
                    }, 60000)
                }
            }, 300000)





        }


        function checkMoneyAfterBig() {
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
                            console.log(`Check после bigChange USDT ${account.index}`, body.code)
                            if (body.code !== -1021) {
                                indexError++
                            }

                            reRequest()
                        } else if (body.code && !fatalError) {
                            fatalError = true

                            messageBot = `Конечная у ${account.name}

                            Check после bigChange USDT ${body.code}
                            
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

                                    console.log(`allMoney после чека после bigChange ${account.index}`, allMoney)


                                }
                                if (body[i].asset === 'BTC') {

                                    commissionBtc = +(+body[i].free - baseBtc - (dirtBtc + dirtAmountGo)).toFixed(8)

                                    console.log(`All btc ${+body[i].free}, baseBtc ${baseBtc}`)

                                    console.log(`DirtBtc ${dirtBtc}, dirtAmountGo ${dirtAmountGo}`)
                                    console.log('commissionBtc ', commissionBtc)



                                }
                                if (body[i].asset === 'ETH') {

                                    commissionEth = +(+body[i].free - baseEth).toFixed(8)

                                    console.log(`All eth ${+body[i].free}, baseEth ${baseEth}`)
                                    console.log('commissionEth ', commissionEth)
                                }
                            }


                            bigChange = false
                            bigChangeStart = false

                        }
                    }
                )

            })()
        }



        setTimeout(() => {


            console.log(`Воркер ${process.pid} начал работу с аккаунтом: ${account.index}, ${account.name}`);
        }, 8000)

    }













});
