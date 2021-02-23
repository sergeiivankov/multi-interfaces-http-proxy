import { isMaster } from 'cluster';

await import(isMaster ? './lib/master.js' : './lib/worker.js');