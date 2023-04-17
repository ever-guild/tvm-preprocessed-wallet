# Demo usage TVM Preprocessed Wallet

- https://github.com/pyAndr3w/ton-preprocessed-wallet-v2

We use a DeBot (a special smart contract that is stored on the blockchain and executed locally) for generating messages for the wallet contract.

## Setup faucet

use https://t.me/everdev_giver_bot or https://t.me/testgiver_ton_bot
or setup your own faucet https://docs.everscale.network/develop/tutorial/everdev-sc/#configure-giver

## Run

```shell
yarn
cp .env.example .env
yarn start
```

## Expect out

```shell
$ yarn start
yarn run v1.22.5
$ ts-node index.ts
wallet=0:b8b85827ef206fa2c3a0f1f7e8988109ac3dec0c85136529badbd3f46d7d5247
seqno=0
transfer trx=cfe19aaaa778f9377b9e72637b095d9acc8b71e9f7bcc19c84f5c37ca2fc5b65
termination trx=31b3d1e65fe6920b56a8e0eddb8ca187d9f74d3eadde60b276b1299a4fb31350
```

See in blockchains:

- https://tonscan.org/address/EQC4uFgn7yBvosOg8ffomIEJrD3sDIUTZSm629P0bX1SRytu#source
- https://everscan.io/accounts/0:b8b85827ef206fa2c3a0f1f7e8988109ac3dec0c85136529badbd3f46d7d5247
- https://testnet.everscan.io/accounts/0:b8b85827ef206fa2c3a0f1f7e8988109ac3dec0c85136529badbd3f46d7d5247
