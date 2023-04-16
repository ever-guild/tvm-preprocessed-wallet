# Demo usage TVM Preprocessed Wallet

- https://github.com/pyAndr3w/ton-preprocessed-wallet-v2

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
wallet=0:2024bd0b269c9d7f390815b45e37c79d127483b3f5f95a83ef8c58869f7afdf5
seqno=0
transfer trx=4792460fddf19c325e8f9b6dae7e38febdb3cc7dbdc713acfbc85f8946946e1c
termination trx=732f9a5adafb65617927312550e2273de7d6e63985031d55c643881e94a043f2
Done in 19.60s.
```

See in blockchain https://testnet.everscan.io/accounts/0:2024bd0b269c9d7f390815b45e37c79d127483b3f5f95a83ef8c58869f7afdf5
