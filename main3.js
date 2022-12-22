const {BlockChain,Block, Transaction}=require('./blockchain3.js')

let JossefCoin = new BlockChain()

JossefCoin.create_transaction(new Transaction('address1','address2',100))
JossefCoin.create_transaction(new Transaction('address2','Bob-Address',40))
JossefCoin.create_transaction(new Transaction('address2','Bob-Address',40))
console.log('##############')
console.log("Mining block 1 ...")
JossefCoin.miningPendingTransaction('Bob-Address')
console.log('Bob-Address balance : ' + JossefCoin.get_Balance_of_address('Bob-Address'))


//console.log(JSON.stringify(JossefCoin,null,4))

