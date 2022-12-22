// same as blockchain1 - with additional isValidate func to check that the block is validated. 

const SHA256=require('crypto-js/sha256')

class Block {
    constructor(index, time_stamp, data, previous_hash=" "){
        this.index=index
        this.time_stamp=time_stamp
        this.data=data
        this.previous_hash=previous_hash
        this.hash=this.calculate_hash()
    }
    calculate_hash(){
        return SHA256(this.index + this.previous_hash + this.time_stamp + JSON.stringify(this.data)).toString()
    }

}

class BlockChain {
    constructor(){
        this.chain=[this.createGenesisBlock()]
    }

    createGenesisBlock(){
        return new Block(0,"01/01/2009","genesisBlock","0")
    }
    
    getLatestBlock(){
        // the latest block is in -> index=len-1
        return this.chain[this.chain.length-1] 
    }

    addBlock(new_Block){
        // get a new block , calculate his has & push it into the chain 
        new_Block.previous_hash=this.getLatestBlock().hash
        new_Block.hash=new_Block.calculate_hash()
        this.chain.push(new_Block)
    }
    
    isValidate (){
        for(let i=1;i<this.chain.length;i++){
            const current_block=this.chain[i]
            const previous_block=this.chain[i-1]

            if (current_block.hash !== current_block.calculate_hash()){
                return false
            }
            if (current_block.previous_hash !== previous_block.hash){
                return false
            }
        }
        return true
    }

}

// exports the classes so we can require it in another module
module.exports.BlockChain=BlockChain
module.exports.Block=Block