//same as blockchain3 - with Additional transactions 
const SHA256=require('crypto-js/sha256')
const EC = require('elliptic').ec
const ec = new EC('secp256k1')


class Transaction {
    constructor(fromAddress , toAddress , amount){
        this.fromAddress=fromAddress
        this.toAddress=toAddress
        this.amount=amount
        this.time_stamp=Date.now()
    }

    calculate_hash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount + this.time_stamp).toString()
    }

    sing_transaction(singing_key){
        if (singing_key.getPublic('hex') !== this.fromAddress){
            throw new Error('Can not sign transaction for another wallet')
        }

        const hash_tx = this.calculate_hash()
        //sing hex
        const sig = singing_key.sign(hash_tx,'base64') 
        this.signature = sig.toDER('hex')
    }

    is_valid(){
        if(this.fromAddress === null) {
            return true
        }

        if(!this.signature || this.signature.length === 0 ){
            throw new Error('No signature in this transaction ')
        } 

        const public_key = ec.keyFromPublic(this.fromAddress,'hex')
        return public_key.verify(this.calculate_hash(),this.signature)
    }
}

class Block {
    constructor(time_stamp, transactions, previous_hash=" "){
        this.time_stamp=time_stamp
        this.transactions=transactions
        this.previous_hash=previous_hash
        this.hash=this.calculate_hash()
        this.nonce=0
    }
    
    calculate_hash(){
        return SHA256(this.previous_hash + this.time_stamp + JSON.stringify(this.transactions) + this.nonce).toString()
    }

    mine_block(difficulty){
        // Check num of zeros that the hash starts with
        while(this.hash.substring(0,difficulty) !== Array(difficulty+1).join('0')){
            // 
            this.nonce++
            this.hash=this.calculate_hash()
        }
        console.log('Block mined - Congrads ! -> \n Num of Nonce needed -> ' +this.nonce)
            
    }

    has_valid_transaction(){
        for (const tx of this.transactions){
            if(!tx.is_valid()){
                return false
            }
        }
        return true
    }
}

class BlockChain {
    constructor(){
        this.chain=[this.createGenesisBlock()]
        this.difficulty=2
        this.pending_transactions=[]
        this.mining_reward=90
    }

    createGenesisBlock(){
        return new Block("01/01/2009","genesisBlock","0")
    }
    
    getLatestBlock(){
        // the latest block is in -> index=len-1
        return this.chain[this.chain.length-1] 
    }

    // addBlock(new_Block){
    //     // get a new block , calculate his has & push it into the chain 
    //     new_Block.previous_hash=this.getLatestBlock().hash
    //     new_Block.mine_block(this.difficulty)
    //     this.chain.push(new_Block)

    // }
    
    miningPendingTransaction(mining_reward_addr){
        const reward_tx = new Transaction(null,mining_reward_addr,this.mining_reward)
        this.pending_transactions.push(reward_tx)
        let block = new Block(Date.now(),this.pending_transactions,this.getLatestBlock().hash)
        block.mine_block(this.difficulty)
        console.log("#####Block successfuly minded ######")
        this.chain.push(block)
        this.pending_transactions=[]
    }

    // create_transaction(transaction){
    //     this.pending_transactions.push(transaction)
    // }

    add_transaction(transaction){
        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('No from addr OR to addr - transaction Failed!')
        }

        if(!transaction.is_valid()){
            throw new Error('No valid - transaction Failed!')
        }

        this.pending_transactions.push(transaction)
    }

    get_Balance_of_address (address){
        let balance=0
        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddress === address){
                    balance-=trans.amount
                }
                if(trans.toAddress === address){
                    balance+=trans.amount
                }
            }
        }
        return balance
    }

    isValidate (){
        for(let i=1;i<this.chain.length;i++){
            const current_block=this.chain[i]
            const previous_block=this.chain[i-1]
            if(!current_block.has_valid_transaction()){
                return false 
            }

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
module.exports.Transaction=Transaction