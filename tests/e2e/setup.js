import { rm } from 'node:fs/promises';
import path from 'node:path';

export default async function setup() {
  const dataDir=path.resolve('.e2e-data');
  await rm(dataDir, { recursive: true, force: true });
  process.env.JARVIS_DATA_DIR=dataDir;
  const { app }=await import('../../server.js');
  const server=await new Promise(resolve=>{const value=app.listen(4174,'127.0.0.1',()=>resolve(value))});
  return async()=>new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
}
