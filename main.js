const { randomInt } = require('bloom-filters/dist/utils.js')
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

// lets initilize the blockchain and mine first block -- Every wallet has 100 base coins
let JCoin = new BlockChain()
JCoin.miningPendingTransaction(my_wallet_address)
JCoin.miningPendingTransaction(address_2)
JCoin.miningPendingTransaction(address_3)

keys_arr = [my_key,key_2,key_3]
wallet_addr_arr =[my_wallet_address,address_2,address_3]

for(let i=0;i<31;i++){
    rand_from = randomInt(0,2)
    rand_to = randomInt(0,2)
    rand_ammount = randomInt(1,5)
    const tx = new Transaction(wallet_addr_arr[rand_from], wallet_addr_arr[rand_to],rand_ammount)
    tx.sing_transaction(keys_arr[rand_from])
    JCoin.add_transaction(tx)
}

JCoin.miningPendingTransaction(my_wallet_address)

console.log('------- Balaces of all wallets ------')
console.log("Balace of 'MyWallet' (Main Wallet) is " + JCoin.get_Balance_of_address(my_wallet_address))
console.log('--------------')
console.log("Balace of 'addr2' (Node1 Wallet) is " + JCoin.get_Balance_of_address(address_2))
console.log('--------------')
console.log("Balace of 'addr3' (Node3 Wallet) is " + JCoin.get_Balance_of_address(address_3))
console.log('--------------')
console.log("Balace of all the coins in the blockchain "+ (JCoin.get_Balance_of_address(my_wallet_address) + JCoin.get_Balance_of_address(address_2) + 
                                                            JCoin.get_Balance_of_address(address_3)+JCoin.get_Balance_of_address('burning_wallet')))
console.log('--------------')

console.log('-------BlockChain Chain is valid ?-------')
console.log(JCoin.isValidate() ? 'Yes' : 'No')

console.log("Balace of 'burning_wallet' is " + JCoin.get_Balance_of_address('burning_wallet'))
console.log("Num of coins that burned : " + JCoin.burnedCoins())
console.log("Num of coins that mined : " + JCoin.minedCoins())
console.log("######################################################################")

console.log("BloomFilter validation answer -> " + JCoin.getLatestBlock().foundInBF(JCoin.pending_transactions[6]['signature']))
console.log("MerkleTree validation answer -> " +JCoin.getLatestBlock().foundInMT(JCoin.pending_transactions[6]['signature']))




