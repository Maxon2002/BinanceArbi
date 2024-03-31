let secretKey = 'rPUKuHOiFkvy4K4fI67jbVCuYGiP6qcwiLhhLWFxgjiFxXB7RXODtnJJ7t4z47dt'
let publicKey = 'MlPfT59J0LVQVXfbWk46sItd8eUhhsOC2RtOK7GkQtixNnOMTF0DxsTBKLTCdmj2'

const request = require('request')

const crypto = require('crypto');

function signature(query) {
    return crypto
        .createHmac('sha256', secretKey)
        .update(query)
        .digest('hex');
}

let adressMain = "0xd742ecbbc74093e2fb3fa34888aeb0eff24d8d87"

//[{"asset":"BTC","free":"0.00016249",{"asset":"ETH","free":"0.00280164",,{"asset":"USDT","free":"32.66583473"

// setTimeout(() => {
//     let queryWithdraw = `coin=USDT&network=BSC&address=${adressMain}&amount=32.66583473&transactionFeeFlag=true&timestamp=${Date.now()}`;
//     let hashWithdraw = signature(queryWithdraw);

//     request.post(
//         {
//             url: `https://api.binance.com/sapi/v1/capital/withdraw/apply?${queryWithdraw}&signature=${hashWithdraw}`,
//             headers: {
//                 'X-MBX-APIKEY': publicKey
//             }
//         },
//         (err, response, body) => {
//             body = JSON.parse(body)

//             console.log(body)
//         }
//     )
// }, 10000)


// setTimeout(() => {
//     let queryAsset = `timestamp=${Date.now()}`;
//     let hashAsset = signature(queryAsset);

//     request.post(
//         {
//             url: `https://api.binance.com/sapi/v3/asset/getUserAsset?${queryAsset}&signature=${hashAsset}`,
//             headers: {
//                 'X-MBX-APIKEY': publicKey
//             }
//         },
//         (err, response, body) => {
//             console.log(body)
//         }
//     )
// }, 10000)






const accountsObj = {
    a1: {
        address: "0x40125acedd1dddfb4e1039c137475c6ee866ffd7",
        secretKey: "kVSvIuMc9OlyLNNwczXX0ATJwOMjleFGFe3AL2CFcUzpd4hlKQ7hzbaxlWqLiqfa",
        publicKey: "tX0dI7xejbDJWIvP2v5wfSgfru0MtxuSQluyCIjjqvPmzgXFgHugVkl4z3eB41B1",
        id: null,
        index: 0,
        name: 'brusco',
        comAll: 84.113066,
        waitUpdate: false
    },
    a2: {
        address: "0x74b051df3fcd8a1d955c6fc7dd2111b509ab800d",
        secretKey: "Jb5SCKEvmdNvdD44455g3H7o8EmbchFHZ3iq99R0RM5zJ14130NAAwvT6MVz6JZM",
        publicKey: "rdVcK8yA6AIjRe6XbZrtc6LZ75rs0hWDwdlzKskBAvbrO5N1dDmaddoHJuJ0VhbF",
        id: null,
        index: 1,
        name: 'vanek',
        comAll: 84.133958,
        waitUpdate: false
    },
    a3: {
        address: "0x3981ceb32473d2596d45c4576a4d8cc63edc3aa6",
        secretKey: "GzNpwTVhVCTapVhj3JPQlS0p8caFZzxN2f1Ph1mWbotRlX9luryPIOH4bZp98oYq",
        publicKey: "WPCsCp8SUWXNEbBKJwEi0p2flJafoMRaVW5eBTvp2HY1HLPS4OteqanulJoHtLYt",
        id: null,
        index: 2,
        name: 'boris',
        comAll: 83.85191,
        waitUpdate: false
    },
    a4: {
        address: "0x9cf05c644fe34bce87e88812bf8fe512c332be0c",
        secretKey: "0aYSlQqEoSeJ4d61m0SkcJXmsUJqyrOu1laE04H2AG4snjlMj7yAGgPQ2PmcMTjk",
        publicKey: "3xJ8yuG5tU0mrY4iKQsjUIGOUdTGmvYgcbtgGDRTxSzOIPYir5e0tSDtPBbIVnkf",
        id: null,
        index: 3,
        name: 'paul',
        comAll: 84.03796,
        waitUpdate: false
    },
    a5: {
        address: "0xf53ceeee03abd7cba905596102c0a74d1cbae758",
        secretKey: "yAuEYmAVvOZoVwGk4KO80Ec1Ck9cMmEAidfwT3fkgVs9mlDNbId73bcehxpoDDqE",
        publicKey: "XPnTSmnKjyaJTpfu19rcOHnobnHWqN6am0dqhVFwLFBKCrAOTjyWPL91pnaxyjFh",
        id: null,
        index: 4,
        name: 'vinsent',
        comAll: 83.998677,
        waitUpdate: false
    },
    a6: {
        address: "0xafcca28ca27699da3bf6209dc8723bc6ad43b070",
        secretKey: "KLgjbUF6npQPTBQVdidLgw19GFTZg1c8KTEc3mnDC8EUrvBZwIveeiNSaoNEfqIL",
        publicKey: "kKpq6xwa356p8nPSrKL5vdSmmpiMdBpnZyqT4HeKwa8UuGLa6RNYh7vaMRmHVskj",
        id: null,
        index: 5,
        name: 'rando',
        comAll: 84.184562,
        waitUpdate: false
    },
    a7: {
        address: "0x2b2e8b9d6dfa22533aa103a83603d5cbe395fadf",
        secretKey: "9EAStqmgGLZJ49eVTTdI2V1VEwZNZztwTgR5tc8eZVY5QsEsdYWRiLJojbg5TkXQ",
        publicKey: "3pPx0nsdcZruqCDUJmdm9TOibZVAj5itZh1MlzB1dHep7Xmb4w5yZy78ARO2OSij",
        id: null,
        index: 6,
        name: 'kihat',
        comAll: 84.254875,
        waitUpdate: false
    },
    a8: {
        address: "0x06b2828f3f92718a308d134839053d17d9770771",
        secretKey: "59eYPoWUeL94BHfJR81CYz22fPFBfPh5jQlVqG01E5Po63klXcLpe1SwICA9Kpjl",
        publicKey: "pbrDcx9cedbBNXiRvgt3qSI4tNr7RCGlI3j3kSFN2gFq8hSw04KJJoxvjO7C3p2E",
        id: null,
        index: 7,
        name: 'hank',
        comAll: 83.764696,
        waitUpdate: false
    },
    a9: {
        address: "0xf3386c4289e0a56966297e090a590745f0861083",
        secretKey: "rPUKuHOiFkvy4K4fI67jbVCuYGiP6qcwiLhhLWFxgjiFxXB7RXODtnJJ7t4z47dt",
        publicKey: "MlPfT59J0LVQVXfbWk46sItd8eUhhsOC2RtOK7GkQtixNnOMTF0DxsTBKLTCdmj2",
        id: null,
        index: 8,
        name: 'tron',
        comAll: 83.883654,
        waitUpdate: false
    },
    a10: {
        address: "0x9a247d4c46343aaeab117067cbb4f107ccf549d2",
        secretKey: "nJpW6eisNu4ANNq0Xn4cH7UTVIQX4lUkTxaAprHHICOjFVxVdHhlgKFz5yAadLij",
        publicKey: "msklQDczEqVQ1ab6wcTnM2YpK1ppWcwOLBqU8XB2L1KYdQ5byRcQJK7xVC6X0vXg",
        id: null,
        index: 9,
        name: 'lonson',
        comAll: 83.864863,
        waitUpdate: false
    },
    a11: {
        address: "0x9a247d4c46343aaeab117067cbb4f107ccf549d2",
        secretKey: "8VMNyDSgUjViMkzoeQrg8dPpIzsTiZP5GJgRaGWk3g3wdheOq4nVPlOvF2LsfktG",
        publicKey: "CAwA4cC1Ohray1hcg0p7Jou3ZQWFvn0WwrXZhJY9IQA23i44rx9yu8XVm8FuXpMc",
        id: null,
        index: 9,
        name: 'klaus',
        comAll: 83.826231,
        waitUpdate: false
    },
    a12: {
        address: "0x9a247d4c46343aaeab117067cbb4f107ccf549d2",
        secretKey: "o48YmTkoKe36mG801X8EyBpVx1aFNtSkHr9q2VSXlmXCekIE7MXBKEO29c120Dxt",
        publicKey: "MauL5WB8rQwdUOuY112ov23xSaTcsgV907YFlqrOn5y7raw0sdYx3fYzilGXyFlU",
        id: null,
        index: 9,
        name: 'dado',
        comAll: 83.817633,
        waitUpdate: false
    },
    a13: {
        address: "0x9a247d4c46343aaeab117067cbb4f107ccf549d2",
        secretKey: "ylvT6NQ67IvXQTeFeHcU44GW2j5SWQxWJy1m9LaowLgJ98gpqBpDDlS2LZkwoI4e",
        publicKey: "xeKM97KgegG44NfoIGMxn5XCrR6fz4CcKKIpLa2MsFCyXdjwu4Qzqzg0C6iRbvrd",
        id: null,
        index: 9,
        name: 'malmo',
        comAll: 84.060748,
        waitUpdate: false
    },
    a14: {
        address: "0x9a247d4c46343aaeab117067cbb4f107ccf549d2",
        secretKey: "psAsVQbDmOARIXIgaSzVAUqnuyqqdbOl6cgiRIKsCtdaHssMQbEBUeVHVZF195RT",
        publicKey: "r3pxoa0PXzIXkeg9iYU2MybaHNKzrPWJ5V7z7eeNAdDL4OEA2VmiuwrQIIMa2ocD",
        id: null,
        index: 9,
        name: 'emelin',
        comAll: 84.128306,
        waitUpdate: false
    }

}

console.log('go')

for (account in accountsObj) {
    function signature(query) {
        return crypto
            .createHmac('sha256', accountsObj[account].secretKey)
            .update(query)
            .digest('hex');
    }

    let adressMain = "0xd742ecbbc74093e2fb3fa34888aeb0eff24d8d87"

    //[{"asset":"BTC","free":"0.00016249",{"asset":"ETH","free":"0.00280164",,{"asset":"USDT","free":"32.66583473"

    let queryAsset = `timestamp=${Date.now()}`;
    let hashAsset = signature(queryAsset);

    request.post(
        {
            url: `https://api.binance.com/sapi/v3/asset/getUserAsset?${queryAsset}&signature=${hashAsset}`,
            headers: {
                'X-MBX-APIKEY': accountsObj[account].publicKey
            }
        },
        (err, response, body) => {

            body = JSON.parse(body)

            let mon = 0

            for (let i = 0; i < body.length; i++) {
                const element = body[i];

                if (element.asset === "USDT") {
                    console.log({
                        name: accountsObj[account].name,
                        usdt: element.free

                    })
                }
            }


        }
    )
}