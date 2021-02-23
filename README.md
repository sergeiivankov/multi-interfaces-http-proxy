# multi-interfaces-http-proxy

Node.js multithread HTTP proxy server with multiple network interfaces support and no use external NPM dependencies.

Proxy server using authorization by client IP address.

Can proxying single HTTP requests, HTTPS and WebSocket connections.

## Usage

Edit variables in config.js:
* ALLOW_IPS - array of IP addresses, who can connect;
* PORT - proxy server port.