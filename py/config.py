from pathlib import Path
from typing import *
import os
import sys

# paths
ROOT_DIR: Path = Path(os.path.dirname(os.path.abspath(__file__))).parent
BET_FOLDER: Path = ROOT_DIR.joinpath('bets')
UPLOAD_FOLDER: Path = ROOT_DIR.joinpath('img/NFTs')

# add paths to sys.path
sys.path.append(str(ROOT_DIR)+"/py")

# addresses
#CONTRACT_ADDRESS = "0xAcF4d6ca222805F88C7606e7fE67fD9c51D9798A"
#CREATOR_ADDRESS = "0x38fDDa8BAdf340848c5EA333393a27E5D822a6E7".lower()
CONTRACT_ADDRESS: str = "0x4575b1E9AA79f627a5F8B5409dB04407C7D99AA0"
CREATOR_ADDRESS: str = "0x5D5C360E8f5162EF4D177fc6ab12B62297aAa3de".lower()
