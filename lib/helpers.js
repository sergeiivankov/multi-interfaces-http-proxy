import { fork } from 'cluster';

/**
 * Split array by parts number
 * @param  {Array}  arr      Original array
 * @param  {Number} numParts Need parts number
 * @return {Array}           Array of arrays
 */
export const splitArray = (arr, numParts) => {
  const parts = [];
  for(let p = 0; p < numParts; p++) {
    parts.push(arr.filter((_, i) => !((i - p) % numParts)));
  }
  return parts;
};

/**
 * Start new worker with passed thread number identifier and IP addresses list
 * @param {Number} threadNumber Worker thread number
 * @param {Array}  addresses    IP addresses to proxies start
 */
export const startWorker = (threadNumber, addresses) => {
  const worker = fork({
    addresses: addresses.join(',')
  });
  worker.threadNumber = threadNumber;
};