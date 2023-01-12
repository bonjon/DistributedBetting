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
# browser = "chrome"
CONTRACT_ADDRESS: str = "0xD4BfA1b87552bC1d1E5BCC9684A1aB1fFb81315b"
CREATOR_ADDRESS: str = "0xaCa3b1388AAA25927a48bBda6fE4DC85e37B6937".lower()
browser = "firefox"
host = "127.0.0.1"  # "192.168.1.116"  #
