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



            console.log(`Дело сделано у ${account.index} ` + new Date().toLocaleTimeString())

            setTimeout(() => process.exit(), 10000)


        }



        console.log(`Воркер ${process.pid} начал работу с аккаунтом: ${account.index}`);

    }













});
