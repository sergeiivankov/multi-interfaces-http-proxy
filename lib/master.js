import cluster from 'cluster';
import { cpus, networkInterfaces } from 'os';
import { splitArray, startWorker } from './helpers.js';

const externalIpAddresses = Object.values(networkInterfaces())
  .flat()
  .filter(nif => !nif.internal && nif.family != 'IPv6')
  .map(nif => nif.address);

const numCpus = cpus().length;
const addressesParts = splitArray(externalIpAddresses, numCpus);

// On disconnect or exit restart worker with same thread number
cluster.on('disconnect', worker => {
  startWorker(worker.threadNumber, addressesParts[worker.threadNumber]);
});
cluster.on('exit', worker => {
  startWorker(worker.threadNumber, addressesParts[worker.threadNumber]);
});

for(let threadNumber = 0; threadNumber < numCpus; threadNumber++) {
  startWorker(threadNumber, addressesParts[threadNumber]);
}