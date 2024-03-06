const http = require('http');

// Создаем HTTP сервер
const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/dataBinArbi') {
    // Обрабатываем POST запросы на корневом пути
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      let postData = 0 

      try {
        postData = JSON.parse(body);
        console.log(postData)

      } catch (error) {
        console.log(postData)
      }
      

      // console.log(postData)

      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end(`Received data: кул`);
    });
  } else {
    // Возвращаем ошибку 404 для запросов по другим путям
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('404 Not Found');
  }
});

// Задаем порт, на котором сервер будет слушать запросы
const port = 3000;

// Запускаем сервер на заданном порту
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});