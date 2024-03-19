const pm2 = require('pm2')

pm2.connect((err) => {


    // pm2.sendDataToProcessId({
    //     id: 15,
    //     type: 'process:msg',
    //     data: {
    //         morecom: 100
    //     },
    //     topic: 'comUpdate'
    // }, (err, res) => {
    //     if (err) console.error(err);
    //     // else console.log(res);
    // });



    pm2.sendDataToProcessId({
        id: 11,
        type: 'process:msg',
        data: {
            smallCom: 50
        },
        topic: 'updateComis'
    }, (err, res) => {
        if (err) console.error(err);
        // else console.log(res);
    });



    // pm2.sendDataToProcessId({
    //     id: 15,
    //     type: 'process:msg',
    //     data: {
    //         startPriceBtc: 45244,
    //         baseBtcSmall: 3343
    //     },
    //     topic: 'startBtc'
    // }, (err, res) => {
    //     if (err) console.error(err);
    //     // else console.log(res);
    // });




    // pm2.sendDataToProcessId({
    //     id: 15,
    //     type: 'process:msg',
    //     data: {
    //         startPriceEth: 35343,
    //         baseEthSmall: 34343
    //     },
    //     topic: 'startEth'
    // }, (err, res) => {
    //     if (err) console.error(err);
    //     // else console.log(res);
    // });


})