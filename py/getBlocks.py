# import dependencies
from web3 import Web3
import config
from typing import *
import json

# instantiate a web3 remote provider
w3 = Web3(Web3.HTTPProvider(f'http://{config.host}:7545'))

# filter through blocks and look for transactions involving this address
blockchain_address = "0x438b828ee31b102f0ae7eaff78ebf07834830789"

# forge_NFT function selector
forge_NFT_selector = "0x3537f89e"

# bet function selector
bet_selector = "0x640238b4"

# pay4win function selector
pay4win_selector = "0x03262fcd"


def getTxData(start: int, end: int, function_selector: str, address: str = None) -> List[str]:
    '''
    Given a start and an end block, it returns a list of hashes of the transactions that are calls to the function with the given selector.
    If the address is not None, it returns only the hashes of the transactions that are calls to the function with the given selector and are sent by the given address.
    '''
    hashes = []
    # iterate through the blocks
    for x in range(start, end+1):
        # get xth block
        block = w3.eth.getBlock(x, True)
        # iterate through the transactions of the block
        for transaction in block.transactions:
            # if the transaction is a call to the function of the contract
            if transaction['input'][:10] == function_selector and transaction['to'].lower() == config.CONTRACT_ADDRESS.lower():
                # if the address is None, add the hash to the list regardless of the sender
                if address == None:
                    hash = "0x"+transaction['input'][10:74]
                    hashes.append([hash, transaction['from'].lower(), x])
                # otherwise, check if the sender is the given address
                elif transaction['from'] is not None and transaction['from'].lower() == address.lower():
                    # if the transaction is a call to the function
                    hash = "0x"+transaction['input'][10:74]
                    hashes.append(hash)
    return hashes


def filterAlreadyPayedBets(end: int, bet_blockchain: List[Tuple[str, str, str]]) -> List[Tuple[str, str, str]]:
    '''
    Given a list of bets, it returns a list of bets that are not payed yet (and are winning bets)
    '''
    hashes = []
    for bet_hash, bet_address, bet_block in bet_blockchain:
        # try to load the json of the bet
        try:
            with open("bets/"+bet_hash+".json", "r") as f:
                bet_json = json.load(f)
            # if the bet is already payed, skip it
            if bet_json.get("payed") is not None or bet_json.get("result") != 1:
                continue
            else:  # check if it is payed on the blockchain
                # get the list of the transactions of the bet
                bet_transactions = getTxData(
                    bet_block, end, pay4win_selector, config.CREATOR_ADDRESS)

                payed = False
                for hash in bet_transactions:
                    # if the bet is payed, skip it
                    if hash == bet_hash:
                        payed = True
                        break
                # if the bet is payed, skip it
                if payed:
                    # save the payed info in the json file
                    bet_json["payed"] = True
                    with open("bets/"+bet_hash+".json", "w") as f:
                        json.dump(bet_json, f)
                else:
                    hashes.append([bet_hash, bet_address, bet_block])
        except:
            continue

    return hashes
