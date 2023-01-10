from flask import Flask, render_template, request, redirect, url_for, session, flash, send_from_directory
import os
import json
from web3 import Web3
from selenium import webdriver

import py.config as config
import py.scraping as scraping
import py.getBlocks as getBlocks

from werkzeug.utils import secure_filename

variables_declarations = f"<script>var host='{config.host}';\nvar contractAddress='{config.CONTRACT_ADDRESS}';\nvar creatorAddress='{config.CREATOR_ADDRESS}';</script>"
app = Flask(__name__, template_folder=config.ROOT_DIR.joinpath(
    'templates'), static_folder=config.ROOT_DIR.joinpath('static'))

# connect to web3
w3 = Web3(Web3.HTTPProvider(f'http://{config.host}:7545'))

# load the abi of the contract
with open("ABI.json", "r") as a:
    ABI = json.load(a)

# get the contract object
contract = w3.eth.contract(address=config.CONTRACT_ADDRESS, abi=ABI)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = config.UPLOAD_FOLDER


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
            with open(config.BET_FOLDER.joinpath(hash+".json"), "w") as f:
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
    # request the latest block number
    ending_blocknumber = w3.eth.blockNumber
    # check only the last 100 blocks
    starting_blocknumber = max(0, ending_blocknumber - 100)
    bet_blockchain = getBlocks.getTxData(
        starting_blocknumber, ending_blocknumber, getBlocks.bet_selector)
    filtered_bets = getBlocks.filterAlreadyPayedBets(
        ending_blocknumber, bet_blockchain)
    with open('matches/results.json', 'r') as f:
        matches = json.load(f)
    script = f"<script>bets={filtered_bets};\nresults={matches};</script>"
    if request.method == 'POST':
        # check if the post request has the file part
        hash = request.form.get("hash")
        NFT_name = request.form.get("description")
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
                app.config['UPLOAD_FOLDER'], hash + "_" + NFT_name + "."+extension))

            return render_template('creator.html')+"<script>alert('File uploaded successfully')</script>"+variables_declarations+script

    else:
        return render_template('creator.html')+variables_declarations+script


@app.route('/market.html', methods=['GET', 'POST'])
def market():
    # request the latest block number
    ending_blocknumber = w3.eth.blockNumber
    starting_blocknumber = max(0, ending_blocknumber - 100)
    nfts_blockchain = getBlocks.getTxData(
        starting_blocknumber, ending_blocknumber, getBlocks.forge_NFT_selector, config.CREATOR_ADDRESS)
    nft_files = os.listdir(config.UPLOAD_FOLDER)
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
    # update the json files of the bets
    scraping.getBetsResult(bet_blockchain)
    # load the json files of match results
    with open('matches/results.json', 'r') as f:
        matches = json.load(f)
    return render_template('recap.html')+f"<script>bets={bet_blockchain};\nresults={matches};</script>"+variables_declarations


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
