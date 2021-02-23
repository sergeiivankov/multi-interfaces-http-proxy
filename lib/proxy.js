import { createServer, request } from 'http';
import { connect } from 'net';
import { parse as parseUrl } from 'url';
import { ALLOW_IPS, PORT } from '../config.js';

const startProxy = address => {
  const server = createServer();

  // Handle 'request' event for proxying single HTTP request
  server.on('request', (req, res) => {
    if(!ALLOW_IPS.includes(req.connection.remoteAddress)) {
      if(res.writable) res.statusCode = 401;
      return res.end();
    }

    // Parse requested url and create request from proxy
    const url = parseUrl(req.url);
    const proxyReq = request({
      hostname: url.hostname,
      port: url.port,
      method: req.method,
      path: url.path,
      headers: req.headers,
      localAddress: address
    });

    req.on('error', () => {
      proxyReq.end();
      if(res.writable) res.statusCode = 500;
      res.end();
    });

    proxyReq.on('response', proxyRes => {
      if(!res.writable) {
        proxyRes.destroy();
        proxyReq.end();
        return res.end();
      }

      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    req.pipe(proxyReq);
  });

  // Handle 'connect' event for proxying HTTPS and WebSocket connections
  server.on('connect', (req, socket, head) => {
    const httpHeaderPrefix = `HTTP/${req.httpVersion}`;

    if(!ALLOW_IPS.includes(socket.remoteAddress)) {
      if(socket.writable) socket.write(`${httpHeaderPrefix} 500 Connection error\r\n\r\n`);
      return socket.end();
    }

    let proxySocket = null;

    // Handle client socket errors
    socket.on('error', () => {
      if(proxySocket) proxySocket.end();
      if(socket.writable) socket.write(`${httpHeaderPrefix} 500 Connection error\r\n\r\n`);
      socket.end();
    });

    const url = parseUrl(`http://${req.url}`);
    proxySocket = connect({
      host: url.hostname,
      port: url.port,
      localAddress: address
    });

    // Handle proxy socket errors
    proxySocket.on('error', () => {
      proxySocket.end();
      if(socket.writable) socket.write(`${httpHeaderPrefix} 500 Connection error\r\n\r\n`);
      socket.end();
    });

    proxySocket.on('connect', () => {
      if(!proxySocket.writable || !socket.writable) {
        proxySocket.end();
        if(socket.writable) socket.write(`${httpHeaderPrefix} 500 Connection error\r\n\r\n`);
        return socket.end();
      }

      proxySocket.write(head);
      socket.write(`${httpHeaderPrefix} 200 Connection established\r\n\r\n`);

      proxySocket.pipe(socket);
    });

    socket.pipe(proxySocket);
  });

  server.listen(PORT, address);
};

export default startProxy;