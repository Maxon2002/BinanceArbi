const request = require('request')

const crypto = require('crypto');

const WebSocket = require('ws');

const pm2 = require('pm2')



const accountsObj = {
    a1: {
        address: "0x40125acedd1dddfb4e1039c137475c6ee866ffd7",
        secretKey: "kVSvIuMc9OlyLNNwczXX0ATJwOMjleFGFe3AL2CFcUzpd4hlKQ7hzbaxlWqLiqfa",
        publicKey: "tX0dI7xejbDJWIvP2v5wfSgfru0MtxuSQluyCIjjqvPmzgXFgHugVkl4z3eB41B1",
        id: null,
        index: 0,
        name: 'brusco',
        comAll: 91.36,
        waitUpdate: false
    },
    a2: {
        address: "0x74b051df3fcd8a1d955c6fc7dd2111b509ab800d",
        secretKey: "Jb5SCKEvmdNvdD44455g3H7o8EmbchFHZ3iq99R0RM5zJ14130NAAwvT6MVz6JZM",
        publicKey: "rdVcK8yA6AIjRe6XbZrtc6LZ75rs0hWDwdlzKskBAvbrO5N1dDmaddoHJuJ0VhbF",
        id: null,
        index: 1,
        name: 'vanek',
        comAll: 91.35,
        waitUpdate: false
    },
    a3: {
        address: "0x3981ceb32473d2596d45c4576a4d8cc63edc3aa6",
        secretKey: "GzNpwTVhVCTapVhj3JPQlS0p8caFZzxN2f1Ph1mWbotRlX9luryPIOH4bZp98oYq",
        publicKey: "WPCsCp8SUWXNEbBKJwEi0p2flJafoMRaVW5eBTvp2HY1HLPS4OteqanulJoHtLYt",
        id: null,
        index: 2,
        name: 'boris',
        comAll: 91.13,
        waitUpdate: true
    },
    a4: {
        address: "0x9cf05c644fe34bce87e88812bf8fe512c332be0c",
        secretKey: "0aYSlQqEoSeJ4d61m0SkcJXmsUJqyrOu1laE04H2AG4snjlMj7yAGgPQ2PmcMTjk",
        publicKey: "3xJ8yuG5tU0mrY4iKQsjUIGOUdTGmvYgcbtgGDRTxSzOIPYir5e0tSDtPBbIVnkf",
        id: null,
        index: 3,
        name: 'paul',
        comAll: 91.32,
        waitUpdate: false
    },
    a5: {
        address: "0xf53ceeee03abd7cba905596102c0a74d1cbae758",
        secretKey: "yAuEYmAVvOZoVwGk4KO80Ec1Ck9cMmEAidfwT3fkgVs9mlDNbId73bcehxpoDDqE",
        publicKey: "XPnTSmnKjyaJTpfu19rcOHnobnHWqN6am0dqhVFwLFBKCrAOTjyWPL91pnaxyjFh",
        id: null,
        index: 4,
        name: 'vinsent',
        comAll: 91.28,
        waitUpdate: true
    },
    a6: {
        address: "0xafcca28ca27699da3bf6209dc8723bc6ad43b070",
        secretKey: "KLgjbUF6npQPTBQVdidLgw19GFTZg1c8KTEc3mnDC8EUrvBZwIveeiNSaoNEfqIL",
        publicKey: "kKpq6xwa356p8nPSrKL5vdSmmpiMdBpnZyqT4HeKwa8UuGLa6RNYh7vaMRmHVskj",
        id: null,
        index: 5,
        name: 'rando',
        comAll: 91.39,
        waitUpdate: false
    },
    a7: {
        address: "0x2b2e8b9d6dfa22533aa103a83603d5cbe395fadf",
        secretKey: "9EAStqmgGLZJ49eVTTdI2V1VEwZNZztwTgR5tc8eZVY5QsEsdYWRiLJojbg5TkXQ",
        publicKey: "3pPx0nsdcZruqCDUJmdm9TOibZVAj5itZh1MlzB1dHep7Xmb4w5yZy78ARO2OSij",
        id: null,
        index: 6,
        name: 'kihat',
        comAll: 91.46,
        waitUpdate: false
    },
    a8: {
        address: "0x06b2828f3f92718a308d134839053d17d9770771",
        secretKey: "59eYPoWUeL94BHfJR81CYz22fPFBfPh5jQlVqG01E5Po63klXcLpe1SwICA9Kpjl",
        publicKey: "pbrDcx9cedbBNXiRvgt3qSI4tNr7RCGlI3j3kSFN2gFq8hSw04KJJoxvjO7C3p2E",
        id: null,
        index: 7,
        name: 'hank',
        comAll: 91.09,
        waitUpdate: false
    },
    a9: {
        address: "0xf3386c4289e0a56966297e090a590745f0861083",
        secretKey: "rPUKuHOiFkvy4K4fI67jbVCuYGiP6qcwiLhhLWFxgjiFxXB7RXODtnJJ7t4z47dt",
        publicKey: "MlPfT59J0LVQVXfbWk46sItd8eUhhsOC2RtOK7GkQtixNnOMTF0DxsTBKLTCdmj2",
        id: null,
        index: 8,
        name: 'tron',
        comAll: 91.18,
        waitUpdate: false
    },
    a10: {
        address: "0x9a247d4c46343aaeab117067cbb4f107ccf549d2",
        secretKey: "nJpW6eisNu4ANNq0Xn4cH7UTVIQX4lUkTxaAprHHICOjFVxVdHhlgKFz5yAadLij",
        publicKey: "msklQDczEqVQ1ab6wcTnM2YpK1ppWcwOLBqU8XB2L1KYdQ5byRcQJK7xVC6X0vXg",
        id: null,
        index: 9,
        name: 'lonson',
        comAll: 91.14,
        waitUpdate: false
    },
    a11: {
        address: "0x9a247d4c46343aaeab117067cbb4f107ccf549d2",
        secretKey: "8VMNyDSgUjViMkzoeQrg8dPpIzsTiZP5GJgRaGWk3g3wdheOq4nVPlOvF2LsfktG",
        publicKey: "CAwA4cC1Ohray1hcg0p7Jou3ZQWFvn0WwrXZhJY9IQA23i44rx9yu8XVm8FuXpMc",
        id: null,
        index: 9,
        name: 'klaus',
        comAll: 91.14,
        waitUpdate: false
    },
    a12: {
        address: "0x9a247d4c46343aaeab117067cbb4f107ccf549d2",
        secretKey: "o48YmTkoKe36mG801X8EyBpVx1aFNtSkHr9q2VSXlmXCekIE7MXBKEO29c120Dxt",
        publicKey: "MauL5WB8rQwdUOuY112ov23xSaTcsgV907YFlqrOn5y7raw0sdYx3fYzilGXyFlU",
        id: null,
        index: 9,
        name: 'dado',
        comAll: 91.13,
        waitUpdate: false
    },
    a13: {
        address: "0x9a247d4c46343aaeab117067cbb4f107ccf549d2",
        secretKey: "ylvT6NQ67IvXQTeFeHcU44GW2j5SWQxWJy1m9LaowLgJ98gpqBpDDlS2LZkwoI4e",
        publicKey: "xeKM97KgegG44NfoIGMxn5XCrR6fz4CcKKIpLa2MsFCyXdjwu4Qzqzg0C6iRbvrd",
        id: null,
        index: 9,
        name: 'malmo',
        comAll: 91.34,
        waitUpdate: false
    },
    a14: {
        address: "0x9a247d4c46343aaeab117067cbb4f107ccf549d2",
        secretKey: "psAsVQbDmOARIXIgaSzVAUqnuyqqdbOl6cgiRIKsCtdaHssMQbEBUeVHVZF195RT",
        publicKey: "r3pxoa0PXzIXkeg9iYU2MybaHNKzrPWJ5V7z7eeNAdDL4OEA2VmiuwrQIIMa2ocD",
        id: null,
        index: 9,
        name: 'emelin',
        comAll: 91.41,
        waitUpdate: false
    }
}

let howMuchAccounts = Object.keys(accountsObj).length

let workerIds = []

pm2.connect((err) => {
    if (err) {
        console.error(err);
        process.exit(2);
    }

    let workerId = null
    // Запуск воркера через PM2
    pm2.start({
        script: 'workerRestCom.js',
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
                                account
                            },
                            topic: 'startWork'
                        }, (err, res) => {
                            if (err) console.error(err);
                            // else console.log(res);
                        });

                    }



                }
            }


            
            // отслеживать закрытия воркеров и если все закрылись, то сделать дисконект pm2

        });
    });
});