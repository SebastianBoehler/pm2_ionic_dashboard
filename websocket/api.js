const io = require('@pm2/io');

const users = io.metric({
  name: 'Realtime user',
});
users.set(10)

setInterval(() => {
    console.log('test', new Date().toLocaleString())
}, 1000);