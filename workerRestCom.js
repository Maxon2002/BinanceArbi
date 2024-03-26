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



process.send({
    type: 'process:msg',
    data: {
        type: 'open'
    }
})


process.on('message', (packet) => {






    if (packet.topic === 'startWork') {

        setTimeout(() => {




            let account = packet.data.account

            let secretKey = account.secretKey
            let publicKey = account.publicKey


            console.log(`Воркер ${process.pid} начал работу с аккаунтом: ${account.index}, ${account.name}`);

            function signature(query) {
                return crypto
                    .createHmac('sha256', secretKey)
                    .update(query)
                    .digest('hex');
            };



            let startD = +new Date(2024, 2, 26, 5);

            (async () => {

                let dealArr = []


                await new Promise((resolve, reject) => {
                    let allOrd = `symbol=ETHBTC&startTime=${startD}&limit=1000&timestamp=${Date.now()}`;
                    let hashAllOrd = signature(allOrd);


                    request.get(
                        {
                            url: `https://api.binance.com/api/v3/allOrders?${allOrd}&signature=${hashAllOrd}`,
                            headers: {
                                'X-MBX-APIKEY': publicKey
                            }
                        },
                        (err, response, body) => {
                            body = JSON.parse(body)

                            dealArr = dealArr.concat(body)
                            resolve()
                        }
                    )
                })
                await new Promise((resolve, reject) => {
                    let allOrd = `symbol=ETHUSDT&startTime=${startD}&limit=1000&timestamp=${Date.now()}`;
                    let hashAllOrd = signature(allOrd);


                    request.get(
                        {
                            url: `https://api.binance.com/api/v3/allOrders?${allOrd}&signature=${hashAllOrd}`,
                            headers: {
                                'X-MBX-APIKEY': publicKey
                            }
                        },
                        (err, response, body) => {
                            body = JSON.parse(body)

                            dealArr = dealArr.concat(body)
                            resolve()
                        }
                    )
                })
                await new Promise((resolve, reject) => {
                    let allOrd = `symbol=BTCUSDT&startTime=${startD}&limit=1000&timestamp=${Date.now()}`;
                    let hashAllOrd = signature(allOrd);


                    request.get(
                        {
                            url: `https://api.binance.com/api/v3/allOrders?${allOrd}&signature=${hashAllOrd}`,
                            headers: {
                                'X-MBX-APIKEY': publicKey
                            }
                        },
                        (err, response, body) => {
                            body = JSON.parse(body)

                            dealArr = dealArr.concat(body)
                            resolve()
                        }
                    )
                })

                dealArr.sort((a, b) => a.updateTime - b.updateTime)

                let factDealArr = []
                let oneDeal = []
                for (let i = 0; i < dealArr.length; i++) {
                    let deal = dealArr[i]
                    if ((i + 1) % 3 !== 0) {
                        oneDeal.push(deal)
                    } else {

                        oneDeal.push(deal)
                        factDealArr.push(oneDeal)

                        oneDeal = []
                    }
                }



                for (let i = 0; i < factDealArr.length; i++) {
                    let factDeal = factDealArr[i];


                    for (let j = 0; j < factDeal.length; j++) {
                        let oneDeal = factDeal[j]

                        if (oneDeal.symbol === 'ETHBTC') {
                            let ethbtc = factDeal.splice(j, 1)[0]
                            factDeal.push(ethbtc)
                        }
                    }

                }

                let commissionAll = 0

                for (let i = 0; i < factDealArr.length; i++) {
                    let factDeal = factDealArr[i];


                    for (let j = 0; j < factDeal.length; j++) {
                        let oneDeal = factDeal[j]

                        let btcPrice = 0

                        if (oneDeal.symbol === 'BTCUSDT') {

                            commissionAll = (commissionAll + +oneDeal.cummulativeQuoteQty * 0.001)

                            btcPrice = +oneDeal.cummulativeQuoteQty / +oneDeal.executedQty
                        }

                        if (oneDeal.symbol === 'ETHUSDT') {
                            commissionAll = (commissionAll + +oneDeal.cummulativeQuoteQty * 0.001)

                        }

                        if (oneDeal.symbol === 'ETHBTC') {
                            commissionAll = (commissionAll + +oneDeal.cummulativeQuoteQty * 0.001 * btcPrice)

                        }

                    }

                }

                console.log(commissionAll)

                let restC = account.comAll - commissionAll
                console.log(restC)


                console.log(factDealArr.length)

                messageBot = `Комссия у ${account.name} ${restC}`

                botMax.sendMessage(userChatId, messageBot);

            })()
        }, 8000)
    }

})