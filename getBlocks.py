# import dependencies
from web3 import Web3
from typing import *

# instantiate a web3 remote provider
w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:7545'))

# filter through blocks and look for transactions involving this address
blockchain_address = "0x438b828ee31b102f0ae7eaff78ebf07834830789"

# forge_NFT function selector
forge_NFT_selector = "0x26a88685"

# bet function selector
bet_selector = "0x640238b4"


def getTxData(start: int, end: int, function_selector: str, address: str) -> List[str]:
    hashes = []
    for x in range(start, end+1):
        block = w3.eth.getBlock(x, True)
        for transaction in block.transactions:
            if transaction['from'] is not None and transaction['from'].lower() == address:
                # if the transaction is a call to the function
                if transaction['input'][:10] == function_selector:
                    hash = "0x"+transaction['input'][10:74]
                    hashes.append(hash)
    return hashes
