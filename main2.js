const {BlockChain,Block}=require('./blockchain2.js')

let JossefCoin = new BlockChain()

console.log("Mining block 1 ...")
JossefCoin.addBlock(new Block(1,"13/11/2022",{amount:4}))
console.log("Mining block 2 ...")
JossefCoin.addBlock(new Block(1,"13/11/2022",{amount:8}))

console.log(JSON.stringify(JossefCoin,null,4))

