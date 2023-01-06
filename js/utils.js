/**
 * This function updates the account information on the page
 * @param {string} address 
 */
function updateAccountInfo(address)
    {
        // Set the global variable
        myAddress = address;
        // Show the new address on the page
        document.getElementById("address").innerHTML = myAddress;
        // Update the entry tokens
        contract.methods.entryTokens(myAddress).call().then(function(result) 
        {
            document.getElementById("entryTokens").innerHTML = result;
        });
        // Update the super tokens
        contract.methods.superTokens(myAddress).call().then(function(result)
        {
        document.getElementById("superTokens").innerHTML = result;
        });
        // Update the ether
        web3.eth.getBalance(myAddress).then(function(result) 
        {
        document.getElementById("ether").innerHTML = web3.utils.fromWei(result, "ether");
        });
        // If i'm the creator, show the creator section
        if(myAddress == creatorAddress)
            document.getElementById("creatorSection").style.display = "block";
        // if the creator section exists, hide it
        else if(document.getElementById("creatorSection") != null)
            document.getElementById("creatorSection").style.display = "none";
    }

/**
 * This function gets the ethereum address of the user and updates the page accordingly
 */
async function getAddress()
{
    await window.ethereum.request({ method: 'eth_requestAccounts' }).then(function(result) 
    {
        if (result.length == 0)
        {
            alert("You need to have metamask installed and connected to the blockchain");
            return;
        }
        updateAccountInfo(result[0]);
    });
}

/**
 * This function updates the balance of the user in ether
 */
function updateEther()
    {
        web3.eth.getBalance(myAddress).then(function(result) {
            document.getElementById("ether").innerHTML = web3.utils.fromWei(result, "ether");
            });
    }

/**
 * This function loads a file into a JSON object. The file is loaded from an iframe
 * @param {string} id 
 * @returns 
 */
async function LoadFileToJSON(id) 
{
    // Get the contents of the iframe
    var frame = document.getElementById(id);
    var rawContents = frame.contentWindow.document.body.childNodes[0].innerHTML;
    while (rawContents.indexOf("\r") >= 0)
        rawContents = rawContents.replace("\r", "");
    var lines = rawContents.split("\n");
    var str = "";
    for (var i = 0; i < lines.length; i++)
        str = str + lines[i];
    // Parse the JSON
    json = await JSON.parse(str);
    // return the JSON
    return json;
}

async function getContract()
    {
        // Load the contract abi
        ABI = await LoadFileToJSON("ABIframe");
        // Load the contract
        contract = new web3.eth.Contract(ABI, contractAddress);
        // Get the price of the entry tokens
        contract.methods.PRICE().call().then(function(result) {
        entryTokensPrice = result;
        // show the price (only if the user is on the buy page)
        var entryEthPrice = document.getElementById("entryEthPrice");
        if(entryEthPrice != null)
            {
                document.getElementById("entryEthPrice").value = web3.utils.fromWei(result, "ether");
                document.getElementById("entryEthPrice").min = web3.utils.fromWei(result, "ether");         
            }
        });
    }