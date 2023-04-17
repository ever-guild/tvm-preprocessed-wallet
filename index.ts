import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { Buffer } from 'buffer'
import * as dotenv from 'dotenv'
import * as nacl from 'tweetnacl'
import { SignKeyPair } from 'tweetnacl'

dotenv.config()

function env(name: string): string {
  if (!process.env[name] && process.env[name] == '') {
    throw new Error(`Environment variable ${ name } is not set`)
  }
  return process.env[name]
}

function logError(error: unknown): void {
  if (error instanceof AxiosError) {
    console.log(error.response ? error.response.data.error : error.message)
  } else if (error instanceof Error) {
    console.log(error.message)
  } else {
    console.error(error)
  }
}

async function api(method: string, params: object, url?: string) {
  url = url || env('API_URL')
  const config: AxiosRequestConfig = { headers: { 'X-API-KEY': env('API_KEY') } }
  return axios.post(
    url,
    { id: '1', jsonrpc: '2.0', method, params },
    config,
  )
}

async function runGetMethod(method: string, address: string, stack: any, url?: string) {
  const result = await api(
    'runGetMethodFift',
    { address, method, params: stack },
    url,
  )
  return result.data.result
}

async function debot(method: string, params: Array<any>): Promise<Array<any>> {
  const address = `${ env('APP_WORKCHAIN') }:${ env('APP_DEBOT_ADDRESS') }`
  const result = await runGetMethod(method, address, params, env('API_URL_DEBOT'))
  return JSON.parse(result.result)
}

async function fetchState(address: string) {
  const result = await api('getAccount', { address })
  return result.data.result
}

async function send(boc: string): Promise<any | null> {
  try {
    const result = await api('sendAndWaitTransaction', { boc })
    return result.data.result
  } catch (e) {
    logError(e)
    return null
  }
}

async function getSeqno(address: string, checkBalance: boolean): Promise<number> {
  let out
  try {
    out = (await fetchState(address))
  } catch (_) {}
  if (checkBalance && (!out || out && out.balance == '0')) {
    throw new Error(`Account is empty for topup use: npx everdev ct -n devnet -a ${ address } -v 1T`)
  }
  if (!out || !out['data']) return 0
  return parseInt((await debot(
    'parse_storage',
    [
      { type: 'Cell', value: out.data },
    ],
  ))[1], 10)
}

async function getAddress(keyPair: SignKeyPair): Promise<string> {
  return env('APP_WORKCHAIN') + ':' + (await debot(
    'address_by_public_key',
    [
      '0x' + Buffer.from(keyPair.publicKey).toString('hex'),
    ],
  ))[0].slice(2)
}

async function makeTerminator(
  keyPair: SignKeyPair,
  seqno: number,
  dest: string,
): Promise<string> {
  return makeMessage(keyPair, seqno, dest, '0', 160)
}

async function makeMessage(
  keyPair: SignKeyPair,
  seqno: number,
  dest: string,
  value: string,
  flag = 3,
): Promise<string> {
  dest = `0x${ dest }`
  const out = await debot('pack_msg_inner',
    [
      ~~(Date.now() / 1000) + parseInt(env('APP_SEND_TIMEOUT'), 10),
      seqno,
      [[
        env('APP_WORKCHAIN'),
        dest,   // address
        value,  // value
        flag,   // flags
        0,      // bounce
        null,   // body
        null,   // stateInit
      ]],
    ],
  )
  const msg = {
    cell: out[0].value,
    hash: Uint8Array.from(Buffer.from(out[1].slice(2), 'hex')),
  }
  const sig = nacl.sign.detached(msg.hash, keyPair.secretKey)
  return pack(sig, msg.cell, 0, keyPair.publicKey, seqno)
}

async function pack(
  fuck: Uint8Array,
  cell: string,
  wc: number,
  publicKey: Uint8Array,
  seqno = 0,
): Promise<string> {
  const signature = Buffer.from(fuck).toString('hex')
  const out = await debot('pack_extmsg_with_sign_parts',
    [
      `0x${ signature.slice(0, 64) }`, // signature p0
      `0x${ signature.slice(64) }`,    // signature p1
      { type: 'Cell', value: cell },   // inner message
      env('APP_WORKCHAIN'),
      `0x${ Buffer.from(publicKey).toString('hex') }`,
      seqno == 0 ? -1: 0,              // flag exist state init
    ],
  )
  return out[0].value
}

async function main() {
  const keyPair = nacl.sign.keyPair.fromSeed(Buffer.from(env('APP_SEED'), 'hex'))
  const dest = env('APP_RECEIVER') // some destination
  const wallet = await getAddress(keyPair)
  console.log(`wallet=${ wallet }`)
  const seqno = await getSeqno(wallet, true)
  console.log(`seqno=${ seqno }`)
  let msg = await makeMessage(keyPair, seqno, dest, '0')
  let trx = await send(msg)
  console.log(`transfer trx=${ trx ? trx.transaction.id: 'error' }`)
  msg = await makeTerminator(keyPair, seqno + 1, dest)
  trx = await send(msg)
  console.log(`termination trx=${ trx ? trx.transaction.id: 'error' }`)
}

if (require.main === module) {
  main().catch((e) => {
    logError(e)
    process.exit(1)
  })
}
