const pm2 = require('pm2')

pm2.connect((err) => {


    // pm2.sendDataToProcessId({
    //     id: 16,
    //     type: 'process:msg',
    //     data: {
    //         morecom: 100
    //     },
    //     topic: 'comUpdate'
    // }, (err, res) => {
    //     if (err) console.error(err);
    //     // else console.log(res);
    // });



    // pm2.sendDataToProcessId({
    //     id: 11,
    //     type: 'process:msg',
    //     data: {
    //         smallCom: 50
    //     },
    //     topic: 'updateComis'
    // }, (err, res) => {
    //     if (err) console.error(err);
    //     // else console.log(res);
    // });



    pm2.sendDataToProcessId({
        id: 16,
        type: 'process:msg',
        data: {
            startPriceBtc: 66945,
            baseBtcSmall: 0.00021429
        },
        topic: 'startBtc'
    }, (err, res) => {
        if (err) console.error(err);
        // else console.log(res);
    });




    pm2.sendDataToProcessId({
        id: 16,
        type: 'process:msg',
        data: {
            startPriceEth: 3455.98,
            baseEthSmall: 0.00335714
        },
        topic: 'startEth'
    }, (err, res) => {
        if (err) console.error(err);
        // else console.log(res);
    });


})