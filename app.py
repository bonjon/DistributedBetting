from flask import Flask, render_template, request, redirect, url_for, session, flash, send_from_directory
import os
import json
import getBlocks
from web3 import Web3
from selenium import webdriver
import scraping
from werkzeug.utils import secure_filename

CONTRACT_ADDRESS = "0x16Cb0fA18D39c902cCa4F420Cf0d8581DA836BA3"
CREATOR_ADDRESS = "0x5D5C360E8f5162EF4D177fc6ab12B62297aAa3de".lower()
#CONTRACT_ADDRESS = "0xAcF4d6ca222805F88C7606e7fE67fD9c51D9798A"
#CREATOR_ADDRESS = "0x38fDDa8BAdf340848c5EA333393a27E5D822a6E7".lower()
variables_declarations = f"<script>var contractAddress='{CONTRACT_ADDRESS}';\nvar creatorAddress='{CREATOR_ADDRESS}';</script>"
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(ROOT_DIR, 'img/NFTs/')
BET_FOLDER = os.path.join(ROOT_DIR, 'bets/')
app = Flask(__name__)

# connect to web3
w3 = Web3(Web3.HTTPProvider('http://127.0.0.1:7545'))

# load the abi of the contract
with open("ABI.json", "r") as a:
    ABI = json.load(a)

# get the contract object
contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=ABI)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/', methods=['GET', 'POST'])
@app.route('/index.html', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        s = request.form.get("betJson")
        if s is not None:  # the user clicked on the button to place a bet
            # get the hash of the bet
            hash = request.form.get("betHash")
            # get the json of the bet
            try:
                js = json.loads(s)
            except json.decoder.JSONDecodeError:
                return render_template('index.html')+variables_declarations
            # get the amount of the bet
            amount = js["betTokens"]
            # save the bet in a file
            with open(BET_FOLDER+hash+".json", "w") as f:
                f.write(s)
            return render_template('index.html')+variables_declarations+f"<script>betHash='{hash}';\nbetAmount={amount}</script>"
        else:  # the user clicked on the button to update the matches
            scraping.do_scraping()
            return render_template('index.html')+variables_declarations+"<script>alert('You have now the latest matches');</script>"
    return render_template('index.html')+variables_declarations


@app.route('/ABI.json', methods=['GET'])
def send_json():
    return send_from_directory('.', 'ABI.json')


@app.route('/matches/<path:path>')
def send_matches(path):
    return send_from_directory('matches', path)


@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('js', path)


@app.route('/img/<path:path>')
def send_img(path):
    return send_from_directory('img', path)


@app.route('/css/<path:path>')
def send_css(path):
    return send_from_directory('css', path)


@app.route('/creator.html', methods=['POST', 'GET'])
def creator():
    if request.method == 'POST':
        # check if the post request has the file part
        hash = request.form.get("hash")
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # If the user does not select a file, the browser submits an
        # empty file without a filename.
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            extension = filename.rsplit('.', 1)[1].lower()
            file.save(os.path.join(
                app.config['UPLOAD_FOLDER'], hash+"."+extension))

            return render_template('creator.html')+"<script>alert('File uploaded successfully')</script>"+variables_declarations

    else:
        return render_template('creator.html')+variables_declarations


@app.route('/market.html', methods=['GET', 'POST'])
def market():
    # request the latest block number
    ending_blocknumber = w3.eth.blockNumber
    starting_blocknumber = max(0, ending_blocknumber - 100)
    nfts_blockchain = getBlocks.getTxData(
        starting_blocknumber, ending_blocknumber, getBlocks.forge_NFT_selector, CREATOR_ADDRESS)
    nft_files = os.listdir(UPLOAD_FOLDER)
    if nft_files is None:
        return render_template('market.html')+variables_declarations
    else:
        return render_template('market.html')+f"<script>nfts_files={nft_files};\nnfts_blockchain={nfts_blockchain};</script>"+variables_declarations


@app.route('/bets/<path:path>')
def send_bets(path):
    return send_from_directory('bets', path)


@app.route('/recap.html', methods=['GET', 'POST'])
def recap():
    # request the latest block number
    ending_blocknumber = w3.eth.blockNumber
    # check only the last 100 blocks
    starting_blocknumber = max(0, ending_blocknumber - 100)
    bet_blockchain = getBlocks.getTxData(
        starting_blocknumber, ending_blocknumber, getBlocks.bet_selector)
    # no bets
    if bet_blockchain is None:
        return render_template('index.html')+"<script>alert('There are no bets')</script>"+variables_declarations
    # create an iframe for each bet that has a json file
    bet_files = os.listdir(BET_FOLDER)
    betsIframes = ""
    driver = None
    for hash, _, _ in bet_blockchain:
        # if the bet is on the server, scrape the result (if not already done)
        if hash+".json" in bet_files:
            # get the json of the bet
            with open(BET_FOLDER+hash+".json", "r") as f:
                bet_json = json.load(f)
            # get the result of the bet (if exists)
            result = bet_json.get("result")
            # if the result is not already scraped, scrape it
            if result is None:
                if driver is None:
                    driver = webdriver.Firefox()
                result = scraping.checkBet(
                    BET_FOLDER+hash+".json", driver=driver)
                # save the result in the json file
                bet_json["result"] = result
                with open(BET_FOLDER+hash+".json", "w") as f:
                    json.dump(bet_json, f)
    if driver is not None:
        driver.close()
    # load the json files of match results
    with open('matches/results.json', 'r') as f:
        matches = json.load(f)
    return render_template('recap.html')+f"<script>bets={bet_blockchain};\nresults={matches};</script>"+variables_declarations+betsIframes
