import startProxy from './proxy.js';

process.env.addresses.split(',').forEach(address => {
  startProxy(address);
});