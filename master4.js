const http = require('http');

const request = require('request')

const crypto = require('crypto');

const WebSocket = require('ws');

const pm2 = require('pm2')


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


const accountsObj = {
    a1: {
        address: "0x40125acedd1dddfb4e1039c137475c6ee866ffd7",
        secretKey: "riseQF3UCCzTB1lRhrnZ9RoFoLTlqWnC8Aue4n476DMhJsN7gLNQHNKIgcxGQ1rF",
        publicKey: "uL6vqk6VK0RQpFA3326CKzgtNhHsDptxHXGEh38zyQEb3Qjh5Fcy2h9QZrVorrec",
        id: null,
        index: 0,
        name: 'julios',
        comAll: 100,
        waitUpdate: false
    },
    a2: {
        address: "0x74b051df3fcd8a1d955c6fc7dd2111b509ab800d",
        secretKey: "zDbD9dsTNwI7yJbZRQ1YxqyE6wxOYrHbD1VzHV6nFy5gJK08Lo6exktm4gKxcoGq",
        publicKey: "MKYRwaDGnHx2hVqyqPUZ5SmdngjMA2iZ8uTPlhOcdnPoJXhbqqMh5cotNQCpx1xp",
        id: null,
        index: 1,
        name: 'krid',
        comAll: 100,
        waitUpdate: false
    },
    a3: {
        address: "0x3981ceb32473d2596d45c4576a4d8cc63edc3aa6",
        secretKey: "v4F4Ff1AzPBmKrgTDrY6hldpHNq0QBvmuBg1j8o2uRgF2yXSqSXWPBW9jyrmn2GD",
        publicKey: "sThECYcirRNIxKaQqLBGXTCJq44EJDji6DHXWQT72VgBQueHzZUcZ8guFdScTpnc",
        id: null,
        index: 2,
        name: 'yuron',
        comAll: 100,
        waitUpdate: false
    },
    a4: {
        address: "0x9cf05c644fe34bce87e88812bf8fe512c332be0c",
        secretKey: "tHfZbPR2w9TJndtQrNGplzBlam3AfwgwKF8PsokD1CA7Hmo12WXP4bOcwJx2YRbW",
        publicKey: "125dK8KvayE53vhnUfQzJgKOtTOOSt2fCVsRoERsDFYdcVAmoICeY3PLHO6GPuI3",
        id: null,
        index: 3,
        name: 'honk',
        comAll: 100,
        waitUpdate: false
    },
    a5: {
        address: "0xf53ceeee03abd7cba905596102c0a74d1cbae758",
        secretKey: "7bfjCupnKBhQ0j8J9pyXKJ5hMYHYIFiyU8hbwChkswgCErsUuI2UNrqGEg6KVN0x",
        publicKey: "jBZugINvmJM8XvzU0rs5Giby3tTC6bERnBsKA11ClzXGtWPHstOU2a6JmtWMCB9i",
        id: null,
        index: 4,
        name: 'riskon',
        comAll: 100,
        waitUpdate: false
    },

}





let mainAddress = '0xd742ecbbc74093e2fb3fa34888aeb0eff24d8d87'


let fixAmountUsdt = 200

let maxCommissionAll = 38.14 * 1.25

let maxCommissionAllSmall = 100

let amountFirstActive = fixAmountUsdt * 1.15

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


let fatalError = false
let indexError = 0

let minNotionalEthbtc = 0
let changeNotionalEthBtc = false

let firstSaleEthAmount = 0
let firstSaleEth = false

let countBalanceUp = 0

let workerSayChange = false

let countUpAfterChange = 0
let indexUpdateBigChange = 0

let countWorkerEnds = 0

let howNeedIndexUpdate = 0

let howNeedIndexUpdateBigChange = 0



let globalStart = true ///////////////////////////////////////////////////////////////////////////////////////////////
let bigChangeWorkerStart = false

let workerEnds = true /////////////////////////////////////////////////////////////////////////////////

let workerIds = []

// pm2.connect((err) => {
//     if (err) {
//         console.error(err);
//         process.exit(2);
//     }

//     let workerId = null
//     // Запуск воркера через PM2
//     pm2.start({
//         script: 'workers3.js',
//         instances: howMuchAccounts,  // Указывает количество воркеров
//         name: 'worker' // Уникальное имя для процесса
//     }, (err, apps) => {
//         // workerId = apps[0].pm_id;
//         // pm2.disconnect();
//         if (err) throw err;
//     });





//     pm2.launchBus((err, bus) => {

//         bus.on('process:msg', (packet) => {

//             // console.log(packet)

//             if (packet.data.type === 'open') {
//                 workerIds.push(packet.process.pm_id)

//                 if (workerIds.length === howMuchAccounts) {

//                     for (let i = 0; i < workerIds.length; i++) {

//                         let workerId = workerIds[i];

//                         let account = accountsObj[Object.keys(accountsObj)[i]]

//                         account.id = workerId

//                         pm2.sendDataToProcessId({
//                             id: workerId,
//                             type: 'process:msg',
//                             data: {
//                                 account,
//                                 maxCommissionAllSmall: account.comAll,
//                                 fixAmountUsdtSmall,
//                                 maxChangeProc
//                             },
//                             topic: 'startWork'
//                         }, (err, res) => {
//                             if (err) console.error(err);
//                             // else console.log(res);
//                         });

//                     }

//                     startWorkers()


//                 }
//             }



//             if (packet.data.type === 'balanceUp') {
//                 countBalanceUp++

//                 if (countBalanceUp === howMuchAccounts) {
//                     setTimeout(() => {
//                         console.log("Мастер лисен гоу")
//                         startGlobalListen()
//                     }, 5000)
//                 }
//             }


//             if (packet.data.type === 'maxChange') {

//                 if (!workerSayChange) {

//                     howNeedIndexUpdateBigChange = depoIndex + 3 * howMuchAccounts

//                     workerSayChange = true


//                     messageBot = `Котировки слишком изменились

//                     Перевести по: ${baseBtcSmall} BTC, ${baseEthSmall} ETH и весь USDT`

//                     botMax.sendMessage(userChatId, messageBot);
//                 }
//             }


//             if (packet.data.type === 'upAfterChange') {

//                 countUpAfterChange++

//                 if (countUpAfterChange === howMuchAccounts) {
//                     countUpAfterChange = 0
//                     indexUpdateBigChange = 0
//                     workerSayChange = false
//                     bigChangeWorkerStart = false
//                 }
//             }

//             if (packet.data.type === 'workerEnd') {

//                 countWorkerEnds++

//                 if (countWorkerEnds === howMuchAccounts) {
//                     howNeedIndexUpdate = depoIndex + 3 * howMuchAccounts
//                     workerEnds = true
//                 }
//             }


//             // отслеживать закрытия воркеров и если все закрылись, то сделать дисконект pm2

//         });
//     });
// });


let freezMoney = false


const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/dataBinArbi') {
        // Обрабатываем POST запросы на корневом пути
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            let postData = 0

            try {

                postData = JSON.parse(body);

                if (postData.comis) {
                    for (let i = 0; i < workerIds.length; i++) {

                        let workerId = workerIds[i];


                        pm2.sendDataToProcessId({
                            id: workerId,
                            type: 'process:msg',
                            data: {
                                morecom: postData.comis
                            },
                            topic: 'comUpdate'
                        }, (err, res) => {
                            if (err) console.error(err);
                            // else console.log(res);
                        });

                    }
                }

                if (postData.smallComis) {
                    for (let i = 0; i < postData.workers.length; i++) {

                        let workerId = postData.workers[i];


                        pm2.sendDataToProcessId({
                            id: workerId,
                            type: 'process:msg',
                            data: {
                                smallCom: postData.smallComis
                            },
                            topic: 'updateComis'
                        }, (err, res) => {
                            if (err) console.error(err);
                            // else console.log(res);
                        });

                    }
                }

                if (postData.deleteAccount) {
                    howMuchAccounts -= +postData.deleteAccount
                }

                if (postData.comisMain) {
                    maxCommissionAll -= +postData.comisMain
                }

                if (postData.changeWorkersArr) {
                    for (let i = 0; i < workerIds.length; i++) {
                        let workerId = workerIds[i];

                        if (workerId === +postData.deleteWork) {
                            workerId.splice(i, 1, workerId.addWork)
                            break
                        }
                    }
                }

                if (postData.refreezMoney) {
                    freezMoney = false

                    if (globalStart) {
                        firstDeal = true
                        allMoney = +(allMoney + 60).toFixed(8)
                    }
                }

                console.log(postData)

            } catch (error) {
                console.log('Ошибка на получении у сервера')
            }

            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(`Received data: `);
        });
    } else {
        // Возвращаем ошибку 404 для запросов по другим путям
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

// Задаем порт, на котором сервер будет слушать запросы
const port = 3000;

// Запускаем сервер на заданном порту
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});





let secretKey = 'ZfnNUtvL3GNAFz8jrNLC27QEX2s0KeJudytOmlN8N37qnEPd9ZJAWtTsuay4mMRr'
let publicKey = 'ttNTnSDBy8s5NXgBMdnR3EWwEA8SsgxZzIaucK693hL7V2wGWlJhvrBeSN4HDH5f'

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
// let maxCommissionAll = maxCommissionAllMaster
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

let notDontCom = false

let depoIndex = 0
let startTimeDepoIndex = Date.now()

let transferToFutIndex = 1
let transferToSpotIndex = 0


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
                        try {

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

                        } catch (error) {
                            reRequest()
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
                        try {

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
                        } catch (error) {
                            reRequest()
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

                    try {

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
                    } catch (error) {
                        reRequest()
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

                        try {

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
                        } catch (error) {
                            reRequest()
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
                        try {

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
                        } catch (error) {
                            reRequest()
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
                        try {
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
                        } catch (error) {
                            reRequest()
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
                        try {
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
                        } catch (error) {
                            reRequest()
                        }
                    }
                )
            })()
        })
    ])

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
                        try {
                            body = JSON.parse(body)

                            if (body.code && indexError <= 5) {
                                console.log("Check start USDT для запуска ", body.code)
                                if (body.code !== -1021) {
                                    indexError++
                                }

                                reRequest()
                            } else if (body.code && !fatalError) {
                                fatalError = true

                                messageBot = `Конечная у мастера
    
                            Check start USDT для запуска  ${body.code}
                            
                            Заплаченная комиссия ${commissionAll}`

                                botMax.sendMessage(userChatId, messageBot);
                            } else {
                                if (indexError !== 0) {
                                    indexError = 0
                                }
                                for (let i = 0; i < body.length; i++) {
                                    if (body[i].asset === 'USDT') {

                                        baseUsdt = +body[i].free

                                        if (freezMoney) {
                                            baseUsdt -= 60
                                        }

                                        baseUsdtSmall = Math.trunc((baseUsdt / howMuchAccounts) * 100000000) / 100000000


                                    }
                                    if (body[i].asset === 'BTC') {

                                        restBtcSmall = Math.trunc((+body[i].free / howMuchAccounts) * 100000000) / 100000000

                                    }
                                    if (body[i].asset === 'ETH') {

                                        restEthSmall = Math.trunc((+body[i].free / howMuchAccounts) * 100000000) / 100000000


                                    }
                                }
                                resolve()
                            }
                        } catch (error) {
                            reRequest()
                        }
                    }
                )

            })()
        }, 15000)
    })




    messageBot = `Стартовый перевод

    Перевести по: ${baseUsdtSmall} USDT, ${restBtcSmall} BTC, ${restEthSmall} ETH`

    botMax.sendMessage(userChatId, messageBot);

};

startWorkers() ////////////////////////////////////////////////////







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
                    try {

                        body = JSON.parse(body)
                        if (body.code && indexError <= 5) {
                            if (body.code !== -1021) {
                                indexError++
                            }

                            reRequest()
                        } else if (body.code && !fatalError) {
                            fatalError = true

                            messageBot = `Конечная у мастера

                        Глобальный listenKey ${body.code}
                        
                        Заплаченная комиссия ${commissionAll}`

                            botMax.sendMessage(userChatId, messageBot);
                        } else {
                            if (indexError !== 0) {
                                indexError = 0
                            }
                            listenKey = body.listenKey
                            resolve()
                        }
                    } catch (error) {
                        reRequest()
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
                    try {
                        body = JSON.parse(body)

                        if (!body || body.code) {
                            reRequest()
                        }
                    } catch (error) {
                        reRequest()
                    }
                }
            )
        })()
    }, 3000000)



    let closeListen = false

    let wsBinListen = new WebSocket(`wss://stream.binance.com:9443/ws/${listenKey}`)


    wsBinListen.on('open', () => console.log('Соединение мастер listenKey установлено в ' + new Date().toLocaleTimeString()))
    wsBinListen.on('error', (d) => {
        console.log('Ошибка!' + new Date().toLocaleTimeString())
        // d = JSON.parse(d.toString())
        console.log(d)

    })
    wsBinListen.on('close', function restart() {
        if (!closeListen) {
            console.log('Соединение мастер listenKey закрыто из-за ошибки в ' + new Date().toLocaleTimeString())
            setTimeout(() => {
                wsBinListen = new WebSocket(`wss://stream.binance.com:9443/ws/${listenKey}`)

                wsBinListen.on('error', () => console.log('Ошибка!' + new Date().toLocaleTimeString()))

                wsBinListen.on('open', () => console.log('Соединение мастер listenKey установлено в ' + new Date().toLocaleTimeString()))
                wsBinListen.on('message', listen)
                wsBinListen.on('ping', data => {
                    wsBinListen.pong(data)
                })
                wsBinListen.on('close', restart)
            }, 500)
        } else {
            console.log('listenKey мастер закрыт')
        }
    })

    wsBinListen.on('message', listen)
    wsBinListen.on('ping', data => {
        wsBinListen.pong(data)

    });

    let indexUpdate = 0
    /////// ПОДУМАТЬ ОБ ЭТОМ


    // let howNeedIndexUpdate = depoIndex + 3 * howMuchAccounts

    // let howNeedIndexUpdateBigChange = depoIndex + 3 * howMuchAccounts

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
                        try {
                            body = JSON.parse(body)

                            if (body.code && indexError <= 5) {
                                console.log("Start depoHistory ", body.code)
                                if (body.code !== -1021) {
                                    indexError++
                                }

                                reRequest()
                            } else if (body.code && !fatalError) {
                                fatalError = true

                                messageBot = `Конечная у мастера
    
                            Start depoHistory ${body.code}
                            
                            Заплаченная комиссия ${commissionAll}`

                                botMax.sendMessage(userChatId, messageBot);
                            } else {
                                if (indexError !== 0) {
                                    indexError = 0
                                }

                                let newDepoIndex = body.length


                                if (workerEnds) {
                                    console.log("howNeedIndexUpdate ", howNeedIndexUpdate)
                                    console.log("newDepoIndex ", newDepoIndex)

                                    if (newDepoIndex === howNeedIndexUpdate && !globalStart) {

                                        globalStart = true

                                        console.log('баланс пополнен у мастера ', depoIndex)

                                        setTimeout(() => {
                                            global();
                                        }, 15000);

                                    }

                                    if (newDepoIndex !== depoIndex && newDepoIndex > howNeedIndexUpdate && globalStart) {

                                        allMoney = +(allMoney + +data.d).toFixed(8)

                                        if (allMoney < fixAmountUsdt) {
                                            amountUsdt = allMoney
                                        } else {
                                            amountUsdt = fixAmountUsdt
                                        }


                                    }
                                }


                                if (workerSayChange && !workerEnds) {
                                    // indexUpdateBigChange++
                                    console.log("howNeedIndexUpdateBigChange ", howNeedIndexUpdateBigChange)
                                    console.log("newDepoIndex ", newDepoIndex)
                                    if (newDepoIndex === howNeedIndexUpdateBigChange && !bigChangeWorkerStart && workerSayChange) {

                                        bigChangeWorkerStart = true

                                        setTimeout(() => {
                                            smoothMoney()
                                        }, 5000)

                                    }
                                }




                                if (newDepoIndex === depoIndex) {
                                    (function reRequest() {

                                        let transferToFutHistory = `type=MAIN_UMFUTURE&startTime=${startTimeDepoIndex}&timestamp=${Date.now()}`;
                                        let hashtransferToFutHistory = signature(transferToFutHistory);


                                        request.get(
                                            {
                                                url: `https://api.binance.com/sapi/v1/asset/transfer?${transferToFutHistory}&signature=${hashtransferToFutHistory}`,
                                                headers: {
                                                    'X-MBX-APIKEY': publicKey
                                                }
                                            },
                                            (err, response, body) => {
                                                try {
                                                    body = JSON.parse(body)

                                                    if (body.code && indexError <= 5) {
                                                        console.log("Start depoHistory ", body.code)
                                                        if (body.code !== -1021) {
                                                            indexError++
                                                        }

                                                        reRequest()
                                                    } else if (body.code && !fatalError) {
                                                        fatalError = true

                                                        messageBot = `Конечная у мастера
                        
                                                        Start depoHistory ${body.code}
                                                
                                                        Заплаченная комиссия ${commissionAll}`

                                                        botMax.sendMessage(userChatId, messageBot);
                                                    } else {
                                                        if (indexError !== 0) {
                                                            indexError = 0
                                                        }
                                                        // console.log(body)

                                                        // console.log(body.rows.length)
                                                        let newTransferToFutIndex = +body.total

                                                        if (newTransferToFutIndex === transferToFutIndex) {



                                                            (function reRequest() {

                                                                let transferToSpotHistory = `type=UMFUTURE_MAIN&startTime=${startTimeDepoIndex}&timestamp=${Date.now()}`;
                                                                let hashtransferToSpotHistory = signature(transferToSpotHistory);


                                                                request.get(
                                                                    {
                                                                        url: `https://api.binance.com/sapi/v1/asset/transfer?${transferToSpotHistory}&signature=${hashtransferToSpotHistory}`,
                                                                        headers: {
                                                                            'X-MBX-APIKEY': publicKey
                                                                        }
                                                                    },
                                                                    (err, response, body) => {
                                                                        try {
                                                                            body = JSON.parse(body)

                                                                            if (body.code && indexError <= 5) {
                                                                                console.log("Start depoHistory ", body.code)
                                                                                if (body.code !== -1021) {
                                                                                    indexError++
                                                                                }

                                                                                reRequest()
                                                                            } else if (body.code && !fatalError) {
                                                                                fatalError = true

                                                                                messageBot = `Конечная у мастера
                                            
                                                                            Start depoHistory ${body.code}
                                                                    
                                                                            Заплаченная комиссия ${commissionAll}`

                                                                                botMax.sendMessage(userChatId, messageBot);
                                                                            } else {
                                                                                if (indexError !== 0) {
                                                                                    indexError = 0
                                                                                }
                                                                                // console.log(body)

                                                                                // console.log(body.rows.length)
                                                                                let newTransferToSpotIndex = +body.total

                                                                                if (newTransferToSpotIndex === transferToSpotIndex) {
                                                                                    if (+data.d > 0) {

                                                                                        allMoney = +(allMoney + +data.d).toFixed(8)

                                                                                        if (allMoney < fixAmountUsdt) {
                                                                                            amountUsdt = allMoney
                                                                                        } else {
                                                                                            amountUsdt = fixAmountUsdt
                                                                                        }
                                                                                    }

                                                                                    if (+data.d < 0) {
                                                                                        if (workerEnds && globalStart) {

                                                                                            allMoney = +(allMoney + +data.d).toFixed(8)

                                                                                            if (allMoney < fixAmountUsdt) {
                                                                                                amountUsdt = allMoney
                                                                                            } else {
                                                                                                amountUsdt = fixAmountUsdt
                                                                                            }
                                                                                        }
                                                                                    }

                                                                                }


                                                                                transferToSpotIndex = newTransferToSpotIndex

                                                                            }
                                                                        } catch (error) {
                                                                            reRequest()
                                                                        }
                                                                    }
                                                                )
                                                            })()


                                                        }


                                                        transferToFutIndex = newTransferToFutIndex

                                                    }
                                                } catch (error) {
                                                    reRequest()
                                                }
                                            }
                                        )
                                    })()
                                }


                                depoIndex = newDepoIndex

                            }
                        } catch (error) {
                            reRequest()
                        }
                    }
                );
            })()

        }

    }
}

setTimeout(() => {
    startGlobalListen()
}, 10000); /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let wsStartClose = false;

setTimeout(() => {
    global();
}, 15000); /////////////////////////////////////////////////////////////////////////////////////////

async function global() {

    console.log('global запущен')

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

                    try {

                        body = JSON.parse(body)
                        if (body.code && indexError <= 5) {
                            console.log(`Старт чек мастер `, body.code)
                            if (body.code !== -1021) {
                                indexError++
                            }

                            reRequest()
                        } else if (body.code && !fatalError) {
                            fatalError = true

                            messageBot = `Конечная у мастер

                            Старт чек ${body.code}
                        
                            Заплаченная комиссия ${commissionAll}`

                            botMax.sendMessage(userChatId, messageBot);
                        } else {
                            if (indexError !== 0) {
                                indexError = 0
                            }
                            for (let i = 0; i < body.length; i++) {
                                if (body[i].asset === 'USDT') {

                                    // смотреть чтобы хватало амаунта


                                    let factMoney = +body[i].free

                                    allMoney = factMoney


                                    break
                                }

                                if (body[i].asset === 'BNB') {
                                    amountBnb = +body[i].free
                                }

                                if (body[i].asset === 'BTC') {
                                    let diff = +(+body[i].free - baseBtc).toFixed(8)

                                    dirtBtc = +(dirtBtc + diff).toFixed(8)

                                    dirtAmountGo = Math.trunc(dirtBtc * 100000) / 100000

                                    dirtBtc = +(dirtBtc - dirtAmountGo).toFixed(8)

                                }

                                if (body[i].asset === 'ETH') {
                                    let diff = +(+body[i].free - baseEth).toFixed(8)

                                    firstSaleEthAmount = Math.trunc(diff * 10000) / 10000

                                    if (firstSaleEthAmount > 0) {
                                        firstSaleEth = true
                                    }
                                }
                            }
                            resolve()
                        }
                    } catch (error) {
                        reRequest()
                    }
                }
            )

        })()
    })


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
                    try {
                        body = JSON.parse(body)

                        if (body.code && indexError <= 5) {
                            console.log("Старт стакан BNB ", body.code)
                            if (body.code !== -1021) {
                                indexError++
                            }

                            reRequest()
                        } else if (body.code && !fatalError) {
                            fatalError = true

                            messageBot = `Конечная у мастера

                            Старт стакан BNB ${body.code}
                        
                            Заплаченная комиссия ${commissionAll}`

                            botMax.sendMessage(userChatId, messageBot);
                        } else {
                            if (indexError !== 0) {
                                indexError = 0
                            }
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
                                            try {
                                                body = JSON.parse(body)

                                                if (body.code && indexError <= 5) {
                                                    console.log("Старт покупка BNB < 3 ", body.code)
                                                    if (body.code !== -1021) {
                                                        indexError++
                                                    }

                                                    reRequest()
                                                } else if (body.code && !fatalError) {
                                                    fatalError = true

                                                    messageBot = `Конечная у мастера

                                                    Старт покупка BNB < 3 ${body.code}
                        
                                                    Заплаченная комиссия ${commissionAll}`

                                                    botMax.sendMessage(userChatId, messageBot);
                                                } else {
                                                    if (indexError !== 0) {
                                                        indexError = 0
                                                    }
                                                    amountBnb = +(+body.origQty + amountBnb).toFixed(8)

                                                    for (let j = 0; j < body.fills.length; j++) {
                                                        let fill = body.fills[j]

                                                        amountBnb -= +fill.commission
                                                    }


                                                    allMoney = +(allMoney - body.cummulativeQuoteQty).toFixed(8)

                                                    if (allMoney < fixAmountUsdt) {
                                                        amountUsdt = allMoney
                                                    } else {
                                                        amountUsdt = fixAmountUsdt
                                                    }

                                                    resolve()
                                                }
                                            } catch (error) {
                                                reRequest()
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

                                                try {

                                                    body = JSON.parse(body)

                                                    if (body.code && indexError <= 5) {
                                                        console.log("Старт продажа BNB ", body.code)
                                                        if (body.code !== -1021) {
                                                            indexError++
                                                        }

                                                        reRequest()
                                                    } else if (body.code && !fatalError) {
                                                        fatalError = true

                                                        messageBot = `Конечная у мастера

                                                        Старт продажа BNB ${body.code}
                        
                                                        Заплаченная комиссия ${commissionAll}`

                                                        botMax.sendMessage(userChatId, messageBot);
                                                    } else {
                                                        if (indexError !== 0) {
                                                            indexError = 0
                                                        }
                                                        amountBnb = +(amountBnb - howSellBnb).toFixed(8)

                                                        for (let j = 0; j < body.fills.length; j++) {
                                                            let fill = body.fills[j]

                                                            amountBnb -= +fill.commission
                                                        }


                                                        allMoney = +(allMoney + body.cummulativeQuoteQty).toFixed(8)

                                                        if (allMoney < fixAmountUsdt) {
                                                            amountUsdt = allMoney
                                                        } else {
                                                            amountUsdt = fixAmountUsdt
                                                        }


                                                        console.log('amountBnb у мастера после продажи лишнего ', amountBnb)
                                                        console.log('amountBnb в долларах у мастера после продажи лишнего ', amountBnb * price)


                                                        resolve()
                                                    }
                                                } catch (error) {
                                                    reRequest()
                                                }
                                            }
                                        )
                                    })()
                                } else {
                                    console.log('bnb недостаточно для продажи')

                                    if (allMoney < fixAmountUsdt) {
                                        amountUsdt = allMoney
                                    } else {
                                        amountUsdt = fixAmountUsdt
                                    }

                                    resolve()
                                }
                            }

                        }
                    } catch (error) {
                        reRequest()
                    }
                }
            )
        })()
    })


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
                    try {

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
                    } catch (error) {
                        reRequest()
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
            console.log(`Вебсокет успешно закрыт у мастера ` + new Date().toLocaleTimeString())
        }
    })

    wsBin.on('message', whyNotYou)
    wsBin.on('ping', data => {
        wsBin.pong(data)

    })


    function whyNotYou(data) {

        if (!stopGame) {

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



                if (currentAmountUsdt < 7 || amSellBtcUsdt < minNotionalEthbtc || amBuyBtcUsdt <= minNotionalEthbtc) {
                    dontCom = true

                    notDontCom = true

                    if (lastDeal) {
                        stopGame = true

                    }
                } else {
                    if (dontCom) {

                        if (!notDontCom) {
                            let howMon = allMoney - 5

                            if (howMon > 7) {
                                dontCom = false
                            }
                        } else {
                            if (amountUsdt > 7) {
                                dontCom = false
                                notDontCom = false
                            }
                        }

                    }
                }


                if ((usdtBtcEth - currentAmountUsdt) / currentAmountUsdt > 0.00017 && usdtBtcEth !== Infinity && !stopGame && currentAmountUsdt === amountUsdt) {

                    usdtBtcEthIndex++



                    if (usdtBtcEthIndex > 6 && !usdtBtcEthDeal && !generalDeal && !dontCom) {
                        usdtBtcEthDeal = true
                        // usdtEthBtcDeal = false
                        generalDeal = true

                        // console.log("Deal usdtBtcEth")
                        console.log("dealsAm ", ++dealsAm);

                        if (firstSaleEth) {
                            firstSaleEth = false
                            amSellEthUsdt = +(amSellEthUsdt + firstSaleEthAmount).toFixed(4)
                        }


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
                                                try {
                                                    body = JSON.parse(body)
                                                    if (body.code && indexError <= 5) {
                                                        console.log("Buy BTC usdtBtcEth ", body.code)

                                                        if (body.code === -1013) {
                                                            changeNotionalEthBtc = true
                                                            // resolve()
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
                                                } catch (error) {
                                                    reRequest()
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
                                                try {
                                                    body = JSON.parse(body)
                                                    if (body.code && indexError <= 5) {
                                                        console.log("Sell ETH usdtBtcEth ", body.code)

                                                        if (body.code === -1013) {
                                                            changeNotionalEthBtc = true
                                                            // resolve()
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
                                                } catch (error) {
                                                    reRequest()
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
                                                try {
                                                    body = JSON.parse(body)
                                                    if (body.code && indexError <= 5) {
                                                        console.log("Buy ETH usdtBtcEth ", body.code)

                                                        if (body.code === -1013) {
                                                            changeNotionalEthBtc = true
                                                            // resolve()
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
                                                } catch (error) {
                                                    reRequest()
                                                }
                                            }
                                        )
                                    })()
                                }),
                            ]).then(async (res) => {
                                let midComission = 0
                                for (let i = 0; i < res.length; i++) {
                                    let deal = res[i]

                                    if (deal.symbol === 'BTCUSDT') {
                                        allMoney = +(allMoney - deal.cummulativeQuoteQty).toFixed(8)

                                        let commissionInUsdt = +deal.cummulativeQuoteQty * 0.00075

                                        commissionAll += commissionInUsdt

                                        // midComission += commissionInUsdt
                                    }

                                    if (deal.symbol === 'ETHUSDT') {
                                        allMoney = +(allMoney + +deal.cummulativeQuoteQty).toFixed(8)

                                        let commissionInUsdt = +deal.cummulativeQuoteQty * 0.00075

                                        commissionAll += commissionInUsdt

                                        // midComission += commissionInUsdt
                                    }


                                    for (let j = 0; j < deal.fills.length; j++) {
                                        let fill = deal.fills[j]

                                        if (deal.symbol === 'BTCUSDT' || deal.symbol === 'ETHUSDT') {
                                            amountBnb -= +fill.commission
                                        } else {
                                            let commissionInUsdt = +fill.commission * pricesAsk.bnb.usdt

                                            commissionAll += commissionInUsdt

                                            // midComission += commissionInUsdt

                                            amountBnb -= +fill.commission
                                        }

                                    }

                                    if (deal.symbol === 'ETHBTC') {
                                        let diff = +(amBuyBtcUsdt - deal.cummulativeQuoteQty).toFixed(8)

                                        dirtBtc = +(dirtBtc + diff).toFixed(8)

                                        dirtAmountGo = Math.trunc(dirtBtc * 100000) / 100000

                                        dirtBtc = +(dirtBtc - dirtAmountGo).toFixed(8)

                                    }

                                }

                                if (commissionAll + amountUsdt * 0.00225 > maxCommissionAll) {

                                    let lastCommission = +(maxCommissionAll - commissionAll).toFixed(8)

                                    if (lastDeal) {
                                        lastDeal = false
                                    }

                                    howNeedAmountLast = +(lastCommission / 0.00225).toFixed(8)

                                    if (howNeedAmountLast >= 7) {

                                        lastDeal = true

                                        // moneyForCommission = +(moneyForCommission + (amountUsdt - howNeedAmountLast)).toFixed(8)

                                        amountUsdt = howNeedAmountLast

                                        console.log('доп сделка будет ', amountUsdt)


                                    } else {

                                        stopGame = true

                                    }
                                }

                                if (amountBnb * pricesAsk.bnb.usdt < 2 && !stopGame) {

                                    let minusCom = false


                                    // if (moneyForCommission < 5) {

                                    //     minusCom = true

                                    //     let howMuchForCom = +(5 - moneyForCommission).toFixed(8)

                                    //     let amountUsdtMinus = +(amountUsdt - howMuchForCom).toFixed(8)
                                    //     if (amountUsdtMinus >= 7) {


                                    //         amountUsdt = amountUsdtMinus
                                    //         moneyForCommission = 5


                                    //     } else {
                                    //         dontCom = true

                                    //         if (lastDeal) {
                                    //             stopGame = true
                                    //         }
                                    //     }
                                    // }

                                    if (allMoney - amountUsdt < 5) {

                                        let amountUsdtMinus = +(allMoney - 5).toFixed(8)

                                        if (amountUsdtMinus >= 7) {

                                            amountUsdt = amountUsdtMinus

                                        } else {
                                            dontCom = true

                                            if (lastDeal) {
                                                stopGame = true
                                            }
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
                                                    try {
                                                        body = JSON.parse(body)

                                                        if (body.code && indexError <= 5) {
                                                            console.log("Докуп BNB в usdtBtcEth ", body.code)
                                                            if (body.code !== -1021) {
                                                                indexError++
                                                            }

                                                            reRequest()
                                                        } else if (body.code && !fatalError) {
                                                            fatalError = true

                                                            messageBot = `Конечная у мастера

                                                            Докуп BNB в usdtBtcEth ${body.code}
                        
                                                            Заплаченная комиссия ${commissionAll}`

                                                            botMax.sendMessage(userChatId, messageBot);
                                                        } else {
                                                            if (indexError !== 0) {
                                                                indexError = 0
                                                            }
                                                            amountBnb += +(+body.origQty + amountBnb).toFixed(8)

                                                            for (let j = 0; j < body.fills.length; j++) {
                                                                let fill = body.fills[j]

                                                                amountBnb -= +fill.commission
                                                            }

                                                            let commissionInUsdt = +body.cummulativeQuoteQty * 0.00075

                                                            commissionAll += commissionInUsdt

                                                            // moneyForCommission = +(moneyForCommission - +body.cummulativeQuoteQty).toFixed(8)

                                                            allMoney = +(allMoney - +body.cummulativeQuoteQty).toFixed(8)

                                                            // if (minusCom) {
                                                            //     amountUsdt = +(amountUsdt + moneyForCommission).toFixed(8)
                                                            // }

                                                            generalDeal = false
                                                        }
                                                    } catch (error) {
                                                        reRequest()
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
                                                try {
                                                    body = JSON.parse(body)
                                                    if (body.code && indexError <= 5) {
                                                        console.log("Buy ETH usdtEthBtc ", body.code)

                                                        if (body.code === -1013) {
                                                            changeNotionalEthBtc = true
                                                            // resolve()
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
                                                } catch (error) {
                                                    reRequest()
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
                                                try {
                                                    body = JSON.parse(body)
                                                    if (body.code && indexError <= 5) {
                                                        console.log("Sell BTC usdtEthBtc ", body.code)

                                                        if (body.code === -1013) {
                                                            changeNotionalEthBtc = true
                                                            // resolve()
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
                                                } catch (error) {
                                                    reRequest()
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
                                                try {
                                                    body = JSON.parse(body)
                                                    if (body.code && indexError <= 5) {
                                                        console.log("Sell ETH usdtEthBtc ", body.code)

                                                        if (body.code === -1013) {
                                                            changeNotionalEthBtc = true
                                                            // resolve()
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
                                                } catch (error) {
                                                    reRequest()
                                                }
                                            }
                                        )
                                    })()
                                }),
                            ]).then(async (res) => {
                                let midComission = 0
                                for (let i = 0; i < res.length; i++) {
                                    let deal = res[i]


                                    if (deal.symbol === 'ETHUSDT') {
                                        allMoney = +(allMoney - +deal.cummulativeQuoteQty).toFixed(8)

                                        let commissionInUsdt = +deal.cummulativeQuoteQty * 0.00075

                                        commissionAll += commissionInUsdt

                                        // midComission += commissionInUsdt
                                    }

                                    if (deal.symbol === 'BTCUSDT') {
                                        allMoney = +(allMoney + +deal.cummulativeQuoteQty).toFixed(8)

                                        let commissionInUsdt = +deal.cummulativeQuoteQty * 0.00075

                                        commissionAll += commissionInUsdt

                                        // midComission += commissionInUsdt
                                    }



                                    for (let j = 0; j < deal.fills.length; j++) {
                                        let fill = deal.fills[j]

                                        if (deal.symbol === 'BTCUSDT' || deal.symbol === 'ETHUSDT') {
                                            amountBnb -= +fill.commission
                                        } else {

                                            let commissionInUsdt = +fill.commission * pricesAsk.bnb.usdt

                                            commissionAll += commissionInUsdt

                                            // midComission += commissionInUsdt

                                            amountBnb -= +fill.commission
                                        }
                                    }

                                    if (deal.symbol === 'ETHBTC') {
                                        let diff = +(deal.cummulativeQuoteQty - amSellBtcUsdt).toFixed(8)

                                        dirtBtc = +(dirtBtc + diff).toFixed(8)

                                        dirtAmountGo = Math.trunc(dirtBtc * 100000) / 100000

                                        dirtBtc = +(dirtBtc - dirtAmountGo).toFixed(8)

                                    }

                                }

                                if (commissionAll + amountUsdt * 0.00225 > maxCommissionAll) {

                                    let lastCommission = +(maxCommissionAll - commissionAll).toFixed(8)

                                    if (lastDeal) {
                                        lastDeal = false
                                    }

                                    howNeedAmountLast = +(lastCommission / 0.00225).toFixed(8)

                                    if (howNeedAmountLast >= 7) {

                                        lastDeal = true

                                        // moneyForCommission = +(moneyForCommission + (amountUsdt - howNeedAmountLast)).toFixed(8)

                                        amountUsdt = howNeedAmountLast

                                        console.log('доп сделка будет ', amountUsdt)


                                    } else {

                                        stopGame = true

                                    }
                                }

                                if (amountBnb * pricesAsk.bnb.usdt < 2 && !stopGame) {

                                    let minusCom = false


                                    if (allMoney - amountUsdt < 5) {

                                        let amountUsdtMinus = +(allMoney - 5).toFixed(8)

                                        if (amountUsdtMinus >= 7) {

                                            amountUsdt = amountUsdtMinus

                                        } else {
                                            dontCom = true

                                            if (lastDeal) {
                                                stopGame = true
                                            }
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
                                                    try {
                                                        body = JSON.parse(body)

                                                        if (body.code && indexError <= 5) {
                                                            console.log("Докуп BNB в usdtEthBtc ", body.code)
                                                            if (body.code !== -1021) {
                                                                indexError++
                                                            }

                                                            reRequest()
                                                        } else if (body.code && !fatalError) {
                                                            fatalError = true

                                                            messageBot = `Конечная у мастера

                                                            Докуп BNB в usdtEthBtc ${body.code}
                        
                                                            Заплаченная комиссия ${commissionAll}`

                                                            botMax.sendMessage(userChatId, messageBot);
                                                        } else {
                                                            if (indexError !== 0) {
                                                                indexError = 0
                                                            }

                                                            amountBnb += +(+body.origQty + amountBnb).toFixed(8)

                                                            for (let j = 0; j < body.fills.length; j++) {
                                                                let fill = body.fills[j]

                                                                amountBnb -= +fill.commission
                                                            }

                                                            let commissionInUsdt = +body.cummulativeQuoteQty * 0.00075

                                                            commissionAll += commissionInUsdt

                                                            // moneyForCommission = +(moneyForCommission - +body.cummulativeQuoteQty).toFixed(8)

                                                            allMoney = +(allMoney - +body.cummulativeQuoteQty).toFixed(8)

                                                            // if (minusCom) {
                                                            //     amountUsdt = +(amountUsdt + moneyForCommission).toFixed(8)
                                                            // }

                                                            generalDeal = false
                                                        }
                                                    } catch (error) {
                                                        reRequest()
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
        } else {
            if (!wsStartClose) {
                wsStartClose = true

                setTimeout(async () => {

                    console.log("commissionAll ", commissionAll)
                    console.log("dealsAm ", dealsAm);






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
                                        try {
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
                                        } catch (error) {
                                            reRequest()
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
                                        try {
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

                                                for (let j = 0; j < body.fills.length; j++) {
                                                    let fill = body.fills[j]
                                                    amountBnb -= +fill.commission
                                                }

                                                resolve()
                                            }
                                        } catch (error) {
                                            reRequest()
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
                                        try {
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
                                        } catch (error) {
                                            reRequest()
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
                                        try {
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

                                                for (let j = 0; j < body.fills.length; j++) {
                                                    let fill = body.fills[j]
                                                    amountBnb -= +fill.commission
                                                }

                                                resolve()
                                            }
                                        } catch (error) {
                                            reRequest()
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
                                        try {
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
                                        } catch (error) {
                                            reRequest()
                                        }
                                    }
                                )
                            })()
                        }),
                    ])

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

                    messageBot = `Мастер закончил работу
                                    
                        Заплаченная комиссия ${commissionAll}`

                    botMax.sendMessage(userChatId, messageBot);



                    wsBin.close()
                }, 5000)
            }
        }

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
                            try {
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
                            } catch (error) {
                                reRequest()
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
                    try {
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
                    } catch (error) {
                        reRequest()
                    }

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
                        try {
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
                        } catch (error) {
                            reRequest()
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
                        try {
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
                        } catch (error) {
                            reRequest()
                        }
                    }
                )
            })()
        })
    ])


    let sideMinusBtc = null

    let changeBtcProc = (startPriceBtc - newStartPriceBtc) / startPriceBtc

    // if (changeBtcProc > 0) {
    //     sideMinusBtc = 'spot'
    // } else {
    //     sideMinusBtc = 'fut'
    // }

    let howChangeBtc = baseBtcInUsdt * changeBtcProc

    let diffHedgeBtc = +(hedgeForBtc - newHedgeForBtc).toFixed(8)


    let sideMinusEth = null

    let changeEthProc = (startPriceEth - newStartPriceEth) / startPriceEth

    // if (changeEthProc > 0) {
    //     sideMinusEth = 'spot'
    // } else {
    //     sideMinusEth = 'fut'
    // }

    let howChangeEth = baseEthInUsdt * changeEthProc

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

    let sumChanges = howChangeBtc + howChangeEth + diffHedgeBtc + diffHedgeEth

    if (sumChanges > 0) {
        typeTransfer = 'UMFUTURE_MAIN'
    } else if (sumChanges < 0) {
        typeTransfer = 'MAIN_UMFUTURE'
    }

    howTransfer = Math.abs(sumChanges)
    // if (sideMinusBtc === 'spot' && sideMinusEth === 'spot') {

    //     howTransfer = +(howChangeBtc + howChangeEth + diffHedgeBtc + diffHedgeEth).toFixed(8);

    //     typeTransfer = 'UMFUTURE_MAIN'
    // } else if (sideMinusBtc === 'fut' && sideMinusEth === 'fut') {
    //     howTransfer = +(howChangeBtc + howChangeEth - diffHedgeBtc - diffHedgeEth).toFixed(8);

    //     typeTransfer = 'MAIN_UMFUTURE'
    // };
    if (typeTransfer) {
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
                    try {
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
                    } catch (error) {
                        reRequest()
                    }
                }
            )
        })();
    } else {
        buyCoinsEnd()
    }





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
                                try {
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

                                        for (let j = 0; j < body.fills.length; j++) {
                                            let fill = body.fills[j]

                                            amountBnb -= +fill.commission
                                        }

                                        resolve()
                                    }
                                } catch (error) {
                                    reRequest()
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
                                    try {
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
                                    } catch (error) {
                                        reRequest()
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
                                    try {
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
                                                        try {
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
                                                        } catch (error) {
                                                            reRequest()
                                                        }
                                                    }
                                                )
                                            })()
                                        }
                                    } catch (error) {
                                        reRequest()
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
                                    try {
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

                                            for (let j = 0; j < body.fills.length; j++) {
                                                let fill = body.fills[j]

                                                amountBnb -= +fill.commission
                                            }

                                            resolve()
                                        }
                                    } catch (error) {
                                        reRequest()
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
                                    try {
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

                                            for (let j = 0; j < body.fills.length; j++) {
                                                let fill = body.fills[j]

                                                amountBnb -= +fill.commission
                                            }

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
                                                        try {
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

                                                                for (let j = 0; j < body.fills.length; j++) {
                                                                    let fill = body.fills[j]

                                                                    amountBnb -= +fill.commission
                                                                }

                                                                resolve()
                                                            }
                                                        } catch (error) {
                                                            reRequest()
                                                        }
                                                    }
                                                )
                                            })()

                                        }
                                    } catch (error) {
                                        reRequest()
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
                                    try {
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
                                    } catch (error) {
                                        reRequest()
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
                                    try {
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
                                                        try {
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
                                                        } catch (error) {
                                                            reRequest()
                                                        }
                                                    }
                                                )
                                            })()
                                        }
                                    } catch (error) {
                                        reRequest()
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

        }//\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\\

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

        }//\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\\

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
                            try {
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

                                                allMoney = factMoney

                                                if (freezMoney) {
                                                    allMoney -= 60
                                                }

                                                if (allMoney < fixAmountUsdt) {
                                                    amountUsdt = allMoney
                                                } else {
                                                    amountUsdt = fixAmountUsdt
                                                }



                                            } else if (workerSayChange) {

                                                baseUsdt = +body[i].free

                                                if (freezMoney) {
                                                    baseUsdt -= 60
                                                }

                                                baseUsdtSmall = Math.trunc((baseUsdt / howMuchAccounts) * 100000000) / 100000000
                                            }


                                        }
                                        if (body[i].asset === 'BTC') {
                                            if (workerSayChange) {
                                                restBtcSmall = Math.trunc((+body[i].free / howMuchAccounts) * 100000000) / 100000000
                                            }
                                        }
                                        if (body[i].asset === 'ETH') {
                                            if (workerSayChange) {
                                                restEthSmall = Math.trunc((+body[i].free / howMuchAccounts) * 100000000) / 100000000
                                            }
                                        }
                                    }
                                    resolve()
                                }
                            } catch (error) {
                                reRequest()
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