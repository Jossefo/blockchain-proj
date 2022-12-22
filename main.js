const {BlockChain,Block}=require('./blockchain.js')

let JossefCoin = new BlockChain()

JossefCoin.addBlock(new Block(1,"13/11/2022",{amount:4}))
JossefCoin.addBlock(new Block(1,"13/11/2022",{amount:4}))
console.log(JSON.stringify(JossefCoin,null,4))

