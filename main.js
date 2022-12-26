const {BlockChain,Block, Transaction}=require('./blockchain.js')
const EC = require('elliptic').ec 
const ec = new EC('secp256k1')

// main wallet
const my_key = ec.keyFromPrivate('695c7100b179d88ebe913ee64f09e0cf7247fbc96d81f8c7d771db2edabedd4d')
// 2 cold wallets
const key_2 = ec.keyFromPrivate('322da765c25fb2ed297081a88599c0aee39aea982247c5776ff070f377e6d3a3')
const key_3 = ec.keyFromPrivate('f84d63bbe04136c21bd5a1c8ba8edf4bb272f1e740bf059fe55037822a223132')

// main pub address
const my_wallet_address = my_key.getPublic('hex')
// cold pub addresses 
const address_2 = key_2.getPublic('hex')
const address_3 = key_3.getPublic('hex')

// lets initilize the blockchain and mine first block
let JossefCoin = new BlockChain()
JossefCoin.miningPendingTransaction(my_wallet_address)

// tx - 1
const tx1 = new Transaction(my_wallet_address, address_2, 50)
tx1.sing_transaction(my_key)
JossefCoin.add_transaction(tx1)

// mine block
JossefCoin.miningPendingTransaction(my_wallet_address)

// tx - 2
const tx2 = new Transaction(address_2, address_3, 25)
tx2.sing_transaction(key_2) 
JossefCoin.add_transaction(tx2)

// mine block
JossefCoin.miningPendingTransaction(my_wallet_address)

// tx - 3 
const tx3 = new Transaction(my_wallet_address, 'address_3', 50)
tx3.sing_transaction(my_key)
JossefCoin.add_transaction(tx3)

console.log('--------------')
console.log("Balace of MyWallet is " + JossefCoin.get_Balance_of_address(my_wallet_address))
console.log('--------------')
console.log("Balace of addr2 is " + JossefCoin.get_Balance_of_address(address_2))
console.log('--------------')
console.log("Balace of addr3 is " + JossefCoin.get_Balance_of_address(address_3))
console.log('--------------')
console.log("Chain is valid ? " + JossefCoin.isValidate() ? 'Yes' : 'No')
console.log()
