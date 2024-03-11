const request = require('request')

const crypto = require('crypto');

const WebSocket = require('ws');

const pm2 = require('pm2')



const accountsObj = {
    a1: {
        address: "0x40125acedd1dddfb4e1039c137475c6ee866ffd7",
        secretKey: "I7Vi2AvDHANOZcQHQTFXD2iF0kgixds06wxke7JX5IHirTqLC8OO5z4AM6gBrfNp",
        publicKey: "snqsC85xakRLvAfSbgBOgVRe1Ke005JVCfEdP9hZLD1PwSfTq52BZg400sFDKebW",
        id: null,
        index: 0,
        name: 'filimon',
        comAll: 100
    },
    a2: {
        address: "0x74b051df3fcd8a1d955c6fc7dd2111b509ab800d",
        secretKey: "SDNJwmYi7B5pCGGX3LixkmZ1ra7brkfZg3ZqgQZuFAjtNIs2sEAop2HAB5PCB4b3",
        publicKey: "uLI3b77nXb5HRM1VrF9BZlBLPJ5wGiFdbOjceTMjBWb2NcmkdW4GRYimq9bIzO11",
        id: null,
        index: 1,
        name: 'kiril',
        comAll: 100
    },
    a3: {
        address: "0x3981ceb32473d2596d45c4576a4d8cc63edc3aa6",
        secretKey: "lMDlG9tUorQw6guCdr8WbG0hxlH2yLDylQDoSVNQ8HwCHyFr7iVdBQhctxWOgG5g",
        publicKey: "LrLcedUKH8spAemCZ5PRl1pIFLAmRGN15amnTaUmC801JeEWxDasdnpXWE49ALh5",
        id: null,
        index: 2,
        name: 'ginger',
        comAll: 100
    },
    a4: {
        address: "0x9cf05c644fe34bce87e88812bf8fe512c332be0c",
        secretKey: "Fl4b0hn09twPokXAV9VjhysSM3fOgrKBOGPufBUETyFm39zQs9x1vCYqNk9HMzBi",
        publicKey: "5j84ZxdtbplIh410dNd7KNK5VF66LyVUlewcHvn8Z1YSG71b2J4C2ANXBKVq2xTM",
        id: null,
        index: 3,
        name: 'bronson',
        comAll: 80
    },
    a5: {
        address: "0xf53ceeee03abd7cba905596102c0a74d1cbae758",
        secretKey: "DNYWcnHJIb5K2aWmsrVrx7pXk4svFj4owzts1xTacXxveiqUGZhBN5mjg0NNOews",
        publicKey: "HWJBtOwXS7LBHaqm0yjnkb8SD4dR16VgJWeuybgQjuC3v8JKahVemVNoVLFDkw3l",
        id: null,
        index: 4,
        name: 'roman',
        comAll: 80
    },
    a6: {
        address: "0xafcca28ca27699da3bf6209dc8723bc6ad43b070",
        secretKey: "fldf97H4svHzpL5IEbiovY6RS5M3vVMjwF3aKR9q2IeeKo9ezuwDGBfgTG3nwReF",
        publicKey: "zc9SbJOLvfiamR8Y2I3y2S0q9JYdb0qIltwX4KYs9wZqcaisUaVayocE48FDnqSL",
        id: null,
        index: 5,
        name: 'robert',
        comAll: 100
    },
    a7: {
        address: "0x2b2e8b9d6dfa22533aa103a83603d5cbe395fadf",
        secretKey: "d8vq1FkiWrK2ULnEmRdpZSBQaieGzlJJYqXpQwBTooGj47lAKTIwMKbPciHUkHOp",
        publicKey: "aw50JlBVPxgFxjQYyAJNO52qqSOFcoCOm3kTzFW7PhyM52CQrHfn7H5mvcJ8PyWL",
        id: null,
        index: 6,
        name: 'philip',
        comAll: 100
    },
    a8: {
        address: "0x06b2828f3f92718a308d134839053d17d9770771",
        secretKey: "7BQa8Xc2PuQN7DzU066jWkLTS1pAfRm2JOrNyZK8AuRMMf3EZ6mGRH8HV7RBODah",
        publicKey: "y6nm84UziXPXXvrN1WliGvi9xjoTQwJW9r2MAP8b3SedhJWGFdXtM10EHwzaDs0o",
        id: null,
        index: 7,
        name: 'luisio',
        comAll: 100
    },
    a9: {
        address: "0xf3386c4289e0a56966297e090a590745f0861083",
        secretKey: "55cWFhvQkZ328JgSdxzIs24d4jr0my11Niu59qi3ogEqR1zNXPhp1Pa8RcX7fC8u",
        publicKey: "O1YnA4OC0cr0VIAsJvaq4sLfOxz7STyv9XUidKufFlWHVJuAXwbbMnBEZggCW3Y7",
        id: null,
        index: 8,
        name: 'wiliam',
        comAll: 100
    },
    a10: {
        address: "0x9a247d4c46343aaeab117067cbb4f107ccf549d2",
        secretKey: "XQyWWQIskGL1HiaYnMmXVjfoyexUdVyGVXcIb9GtnRzqovx8jsoAa0JWGo4SuSfX",
        publicKey: "PzDaktX88krW98Kd09QYUdiDe0NcDg0YZGqMtvZcuzSYwMntrLiFcZjLis7MyJTb",
        id: null,
        index: 9,
        name: 'timati',
        comAll: 100
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