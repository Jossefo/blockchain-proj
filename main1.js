const {BlockChain,Block}=require('./blockchain1.js')

let JossefCoin = new BlockChain()

JossefCoin.addBlock(new Block(1,"13/11/2022",{amount:4}))
JossefCoin.addBlock(new Block(1,"13/11/2022",{amount:4}))

console.log('blockchain valid ? -> ' + JossefCoin.isValidate())

JossefCoin.chain[1].data={amount:100}
JossefCoin.chain[1].hash=JossefCoin.chain[1].calculate_hash()

//the change interrupts the hash and return false (not valid hash)
console.log('blockchain valid ? -> ' + JossefCoin.isValidate()) 

console.log(JSON.stringify(JossefCoin,null,4))

