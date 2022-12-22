const {BlockChain,Block, Transaction}=require('./blockchain4.js')
const EC = require('elliptic').ec 
const ec = new EC('secp256k1')

const my_key = ec.keyFromPrivate('695c7100b179d88ebe913ee64f09e0cf7247fbc96d81f8c7d771db2edabedd4d')

const my_wallet_address = my_key.getPublic('hex')

let JossefCoin = new BlockChain()

const tx1 = new Transaction(my_wallet_address,'address1',10)
tx1.sing_transaction(my_key)
JossefCoin.add_transaction(tx1)

JossefCoin.miningPendingTransaction(my_wallet_address)

const tx2 = new Transaction(my_wallet_address,'address2',20)
tx2.sing_transaction(my_key)
JossefCoin.add_transaction(tx2)

console.log()
console.log(`Balace of JossefCoin is ${JossefCoin.get_Balance_of_address(my_wallet_address)}`)