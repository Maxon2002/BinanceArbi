// const request = require('request')

let a = 0.024933594

let b = Math.trunc(a * 100000) / 100000

// console.log(b);

let c = 0.00000156

let maybeGo = Math.trunc(c * 100000) / 100000

if (maybeGo !== 0) {
    console.log(maybeGo)
}
let diff = +(0.00027342 - 0.00027).toFixed(8)

//Math.trunc((amountUsdt / pricesAsk.btc.usdt) * 100000) / 100000

let dirt = 0.003
let dirt2 = 0.024
let hd = dirt
// dirt ? +(0.00065 - dirt).toFixed(5) : 0.00065
// console.log(dirt + (dirt * 0.2))

let obj = {
    a: 1
};

// console.log(Boolean({}))


let inter = null

// setTimeout(() => {
//     process.exit()
// }, 10000)

// inter = setInterval(() => {
//     console.log('хуй')
// }, 1000)
// console.log(new Date().getUTCDate())

// (async () => {

//     Promise.all([
//         new Promise((resolve, reject) => setTimeout(() => resolve(1), 2000)),
//         new Promise((resolve, reject) => setTimeout(() => resolve(3), 3000)),
//         new Promise((resolve, reject) => setTimeout(() => resolve(5), 1000))
//     ]).then(console.log)



// })()


















// let stopGame = false


const WebSocket = require('ws');

// (async () => {
//     let wsBin = new WebSocket(`wss://stream.binance.com:9443/stream?streams=btcusdt@depth5@100ms`)

//     wsBin.on('open', () => console.log('Соединение Binance установлено в ' + new Date().toLocaleTimeString()))
//     wsBin.on('error', () => console.log('Ошибка!'))
//     wsBin.on('close', (data) => {
//         console.log(data)
//     })

//     wsBin.on('message', (data) => {
//         data = JSON.parse(data.toString())
//         console.log(data)

//     })
// })()






// const cluster = require('cluster');

// setTimeout(() => {
//     if (cluster.isMaster) {

//         setTimeout(() => {cluster.fork()},5000)


//         console.log(`Мастер ${process.pid}`)

//         setInterval(() => console.log('мастер'), 3000)

//         cluster.on('exit', (worker, code, signal) => {
//             console.log(`Воркер ${worker.process.pid} завершил работу`);

//         });




//         cluster.on('message', (worker, message, handle) => {

//             if (message.type === 'open') {
//                 console.log(cluster.workers)
//             }
//         });

//     } else {


//         process.send({type: 'open'})

//         console.log(`Воркер ${process.pid}`);



//         setInterval(() => console.log('воркер'), 2000);





//         // (async () => {
//         //     let wsBin = new WebSocket(`wss://stream.binance.com:9443/stream?streams=btcusdt@depth5@100ms`)

//         //     wsBin.on('open', () => console.log('Соединение Binance установлено в ' + new Date().toLocaleTimeString()))
//         //     wsBin.on('error', () => console.log('Ошибка!'))
//         //     wsBin.on('close', (data) => {
//         //         console.log(data)
//         //     })

//         //     wsBin.on('message', (data) => {
//         //         data = JSON.parse(data.toString())
//         //         console.log(data)

//         //     })
//         // })()
//     }
// }, 7000)





























const pm2 = require('pm2')
let ids = []
pm2.connect((err) => {
    if (err) {
        console.error(err);
        process.exit(2);
    }

    let workerId = null
    // Запуск воркера через PM2
    pm2.start({
        script: 'order.js',
        instances: 1,  // Указывает количество воркеров
        name: 'worker1' // Уникальное имя для процесса
    }, (err, apps) => {
        setTimeout(() => {
            console.log(apps)
        }, 3000)
        // workerId = apps[0].pm_id;
        pm2.disconnect();
        if (err) throw err;
    });


    setTimeout(() => {
        pm2.sendDataToProcessId({
            id: apps[0].pm2_env.pm_id,
            data: {
                message: 'Hello from master!',
            },
        }, (err, res) => {
            if (err) console.error(err);
            else console.log(res);
        });
    }, 6000)


    pm2.launchBus((err, bus) => {
        bus.on('work', (packet) => {
            console.log('Received message from worker:', packet.message);
        });
    });
});

setInterval(() => {
    console.log('Мастер ', process.pid)
}, 2000)