# import dependencies
from web3 import Web3
from typing import *

# instantiate a web3 remote provider
w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:7545'))

# request the latest block number
ending_blocknumber = w3.eth.blockNumber

# latest block number minus 100 blocks
# TODO decides the right number
starting_blocknumber = max(0, ending_blocknumber - 100)

# filter through blocks and look for transactions involving this address
blockchain_address = "0x438b828ee31b102f0ae7eaff78ebf07834830789"


def getBets(start: int, end: int, address: str) -> List[str]:
    bet_selector = "0x640238b4"
    bet_hashes = []
    for x in range(start, end+1):
        block = w3.eth.getBlock(x, True)
        for transaction in block.transactions:
            if transaction['from'] is not None and transaction['from'].lower() == address:
                # print(transaction['input'][:10])
                if transaction['input'][:10] == bet_selector:  # if the transaction is a bet
                    bet_hash = transaction['input'][10:74]
                    bet_hashes.append(bet_hash)
    return bet_hashes
