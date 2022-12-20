from web3 import Web3
import os
import json
from typing import *

# connect to web3
w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:7545'))
print(w3.eth.accounts[0])

# load the abi of the contract
with open("abi.txt", "r") as a:
    abi = json.load(a)

# contract and user address
contract_address = "0x345BA00ef8Fc882eE4caFb28faEbA40fA156e6B1"
me = "0x90206A346339BDBC8D7f7f293c7fDbcB51A4C560"

# obtain the contract object
betting = w3.eth.contract(address=contract_address, abi=abi)
# call a contract function
betting.functions.mint().transact({"from": me, "value": 20000000000000000000})
