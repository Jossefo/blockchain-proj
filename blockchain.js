
//----------------------------------IMPORTS-----------------------------------------
const SHA256=require('crypto-js/sha256')
const EC = require('elliptic').ec
const ec = new EC('secp256k1')
const { BloomFilter } = require("bloom-filters")
const { MerkleTree } = require("merkletreejs")

//-----------------------------------TRANSACTION----------------------------------------
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
        console.log("Validating transaction")
        if(this.fromAddress === null) {
            return true
        }

        if(!this.signature || this.signature.length === 0 ){
            throw new Error('No signature in this transaction')
        } 

        const public_key = ec.keyFromPublic(this.fromAddress,'hex')
        return public_key.verify(this.calculate_hash(),this.signature)
    }
}


//-----------------------------------BLOCK----------------------------------------
class Block {
    constructor(time_stamp, transactions, previous_hash=" "){
        this.time_stamp=time_stamp
        this.transactions=transactions
        this.previous_hash=previous_hash
        this.hash=this.calculate_hash()
        this.nonce=0
        //bloomfilter(m,k) : m = num of bits (size of the filter) , k = num of hash funcs 
        this.BloomFilter = new BloomFilter(10,4)
        this.initializeMerkleTree(transactions)

    }

    initializeMerkleTree(transactions){
        //first lets map the transactions 
        const leaves = Object.entries(transactions).map((x) => SHA256(x.signature))
        // now lets build the merkle tree 
        this.merkletree = new MerkleTree(leaves,SHA256)
        this.root = this.merkletree.getRoot().toString('hex')
    }

    initializeBloomFilter(transactions){
        for (const tx of transactions){
            if (tx.fromAddress != null){
                this.BloomFilter.add(tx.signature)
            }
        }
    }
    
    foundInBF(signature){
        // is the signature can be found in the bloom filter 
        //return Bool
        return this.BloomFilter.has(signature)
    }

    foundInMT(signature){
        // is the signature can be verified by merkle tree 
        // return Bool
        const leaf = SHA256(signature)
        const proof = this.merkletree.getProof(leaf)
        return this.merkletree.verify(proof, leaf, this.root)
    }

    calculate_hash(){
        return SHA256(this.previous_hash + this.time_stamp + JSON.stringify(this.transactions) + this.nonce).toString()
        
    }

    mine_block(difficulty){
        // Check num of zeros that the hash starts with
        while(this.hash.substring(0,difficulty) !== Array(difficulty + 1).join('0')){
            // 
            this.nonce++
            this.hash=this.calculate_hash()
        }
        console.log('Block mined - Num of Nonce needed -> ' +this.nonce)
            
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

//-----------------------------------BLOCKCHAIN----------------------------------------
class BlockChain {
    constructor(){
        this.chain=[this.createGenesisBlock()]
        this.difficulty=2
        this.pending_transactions=[]
        this.mining_reward=100
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
        // new transactions array 
        this.block_transactions = []
        // every block has 4 transactions 
        for(let i=0;i<3;i++){
            if(this.pending_transactions[i] != undefined){
                //if the transaction is defined 
                this.block_transactions.push(this.pending_transactions[i])
            }
            else{
                break
            }
        }
        console.log(this.block_transactions)
        this.block_transactions.push(reward_tx)
        const block = new Block(Date.now(),this.block_transactions,this.getLatestBlock().hash)
        block.mine_block(this.difficulty)
        block.initializeBloomFilter(this.block_transactions)
        block.initializeMerkleTree(this.block_transactions)
        console.log("##### Block successfuly minded ######")
        this.chain.push(block)
        // slicing the pending transactions to 4 
        this.pending_transactions=this.pending_transactions.slice(3,this.pending_transactions.length)
    }

    lookForTransactionInBlockChain(transaction){
        valid_transaction = false
        block_num = 0
        // for each block in the blockhcain - we first try to found the transaction in the BLOOMFILTER , once it is validated we check in the MERKLETREE 
        //FALSE - if didnt found the transaction and TRUE if it is found
        this.chain.forEach((block) => {
            if(block.foundInBF(transaction)){
                if(block.foundInMT(transaction)){
                    console.log("The transaction is in the block. Block :" + i + "- is confirmed.")
                    valid_transaction = true
                }
            }
            block_num ++ 
        })
        if(!valid_transaction){
            console.log("The transaction is invalid ! Cant be found in the block")
        }
    }

    add_transaction(transaction){
        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('No from addr OR to addr - transaction Failed!')
        }

        if(!transaction.is_valid()){
            throw new Error('No valid - transaction Failed!')
        }

        if(transaction.amount <= 0){
            throw new Error('Trasnaction amount should be greater then 0 - transaction Failed!')
        }

        const curr_balance = this.get_Balance_of_address(transaction.fromAddress)
        if (curr_balance < transaction.amount){
            throw new Error('You dont have enough balance in your account - transaction Failed!')
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

    minedCoins(){
        // counts the amount of mined coins and return the amount
        mined_coins = 0 
        for (const block of this.chain){
            for(const transaction of block.transactions){
                if (transaction.fromAddress === null)
                {
                    this.mined_coins+=transaction.amount
                }
            }
        }
        return mined_coins
    }

    burnedCoins(){
        // counts the amount of burned coins and return the amount 
        burned_coins = 0 
        for (const block of this.chain){
            for(const transaction of block.transactions){
                if (transaction.toAddress === "INSERT_BURN_COINS_WALLET_ADDR_HERE")
                {
                    this.burned_coins+=transaction.amount
                }
            }
        }
        return burned_coins
    }

    isValidate (){
        // validates the chain of blocks 
        console.log("Valdating blocks")
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

    transactionsForWallet(address){
        // gathers and return a list of transaction per address 
        transactions_for_this_wallet = []
        for(const block of this.chain){
            for (const transaction of block.transactions){
                if (transaction.fromAddress === address || transaction.toAddress === address){
                    transactions_for_this_wallet.push(transaction)
                }
            }
        }
        return transactions_for_this_wallet
    }
}

// exports the classes so we can require it in another module
module.exports.BlockChain=BlockChain
module.exports.Block=Block
module.exports.Transaction=Transaction