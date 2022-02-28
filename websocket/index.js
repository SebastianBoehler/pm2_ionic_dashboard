const pm2 = require('pm2');
const fs = require('fs');

const port = process.env.port || 6556;
const socket = require('http').createServer();

const io = require('socket.io')(socket, {
  cors: {
    origin: '*'
  }
});

//pm2 connect and then pm2 desribe process 0
pm2.connect((err) => {
  if (err) console.error(err)
  else console.log('pm2 connected')
})

let connections = 0

io.on('connection', (socket) => {
  console.log('a user connected', socket['id'])
  connections++
  //socket.emit('connected', 'connected')

  socket.on('data', async () => {
    console.log('requested data', connections)
    let data = await new Promise((resolve, reject) => {
      pm2.list(function (err2, list) {
        if (err2) {
          //console.error(err2);
          reject(err2)
        }
        resolve(list)
      });
    })

    data = data.map(item => {

      let log = fs.readFileSync(item.pm2_env.pm_out_log_path, 'utf8') //may not work if log file size is too big
      log = log.split('\n')
      log = log.slice(log.length - 50, log.length)
      log = log.map(item => {
        if (item.length > 50) {
          item = item.slice(0, 100)
        }
        return item
      })
      log = log.join('\n')

      let errorLog = fs.readFileSync(item.pm2_env.pm_err_log_path, 'utf8') //may not work if log file size is too big
      errorLog = errorLog.split('\n')
      errorLog = errorLog.slice(errorLog.length - 50, errorLog.length)
      errorLog = errorLog.map(item => {
        if (item.length > 50) {
          item = item.slice(0, 100)
        }
        return item
      })
      errorLog = errorLog.join('\n')

      return {
        name: item.name,
        pid: item.pid,
        cpu: item.monit.cpu,
        memory: item.monit.memory,
        status: item.pm2_env.status,
        //restart: item.pm2_env.restart_time,
        watching: item.pm2_env.watch,
        unable: item.pm2_env.unable_restart,
        uptime: item.pm2_env.pm_uptime,
        memory_percentage: item.monit.memory_percentage,
        cpu_percentage: item.monit.cpu_percentage,
        restart_time: item.pm2_env.restart_time,
        uptime_formatted: item.pm2_env.pm_uptime_formatted,
        pm_id: item.pm2_env.pm_id,
        pm_exec_path: item.pm2_env.pm_exec_path,
        pm_out_log_path: item.pm2_env.pm_out_log_path,
        pm_err_log_path: item.pm2_env.pm_err_log_path,
        monit: item.monit,
        log,
        errorLog,
        version: item.pm2_env.version,
      }
    })

    //console.log(data)

    socket.emit('data', data)
  });

  socket.on('restart', async (name) => {
    console.log('restart instance', name)
    if (!name) return //todo return error to app
    pm2.restart(name, (err, proc) => {
      if (err) console.error(err)
      else {
        console.log(proc)
        socket.emit('restarted', name)
      }
    })
  })

  socket.on("disconnect", (data) => {
    connections--
    console.log('user disconnected')
  })
})

socket.listen(port, async () => {
  console.log(`socket listening on port ${port}`)
})