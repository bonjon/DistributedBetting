/**
 * Function that gets the NFTs from the blockchain and displays them in the market
 * @param {int} i 
 */
function getIthNFT(i, type)
{
    var nft = nfts_blockchain[i];
    var extension = null;
    for(var j = 0; j < nfts_files.length; j++)
    {
        var name = nfts_files[j].split(".")[0];
        var ext = nfts_files[j].split(".")[1];
        if (name == nft)
        {
            extension = ext;
            break;
        }
    }
    contract.methods.NFTs(nft).call().then(function(res) 
    {
        var hash = res[0];
        var selling = res[1];
        var superprice = res[2];
        var ethprice = res[3];
        var owner = res[4];

        if(extension == null) // If the NFT is not in the folder img/NFTs
            fileName = "default.jpg";
        else
            fileName = hash + "." + extension;
        if (type == 0 && creatorAddress == owner.toLowerCase() && myAddress != creatorAddress)
            $("#getNftContainer").append("<div class='col-3'><div class='card'><img class='card-img-top' src='img/NFTs/" + fileName + "' alt='' width='200' height='200'><div class='card-body'><h5 class='card-title'>" + owner + "</h5><p class='card-text'>" + superprice + " Super Tokens</p><div id=\""+ hash + "\"  class='btn-group'><button class='btn btn-outline-dark' onclick='getNFT(\"" + hash + "\")'>Get</button></div></div></div></div>");
        else if (selling && type == 1 && creatorAddress != owner.toLowerCase() && myAddress != owner.toLowerCase() && myAddress != creatorAddress)
            $("#buyNftContainer").append("<div class='col-3'><div class='card'><img class='card-img-top' src='img/NFTs/" + fileName + "' alt='' width='200' height='200'><div class='card-body'><h5 class='card-title'>" + owner + "</h5><p class='card-text'>" + ethprice + " ETH</p><div id=\""+ hash + "\"  class='btn-group'><button class='btn btn-outline-dark' onclick='buyNFT(\""+hash+"\"," + ethprice+")'>Buy</button></div></div></div></div>");                
        else if (type == 2 && myAddress == owner.toLowerCase())
            {
                //if the NFt is not for sale
                if(myAddress == creatorAddress)
                    $("#myNftContainer").append("<div class='col-3'><div class='card'><img class='card-img-top' src='img/NFTs/" + fileName + "' alt='' width='200' height='200'><div class='card-body'><h5 class='card-title'>" + owner + "</h5><p class='card-text'>" + superprice + " Super Tokens</p><div id=\""+ hash + "\"  class='btn-group'></div></div></div></div>");
                else if(!selling)
                    $("#myNftContainer").append("<div class='col-3'><div class='card'><img class='card-img-top' src='img/NFTs/" + fileName + "' alt='' width='200' height='200'><div class='card-body'><h5 class='card-title'>" + owner + "</h5><p class='card-text'> - ETH</p><div id=\""+ hash + "\"  class='btn-group'><button class='btn btn-outline-dark' onclick='sellNFT(\"" + hash + "\")'>Sell</button></div></div></div></div>");
                else
                    $("#myNftContainer").append("<div class='col-3'><div class='card'><img class='card-img-top' src='img/NFTs/" + fileName + "' alt='' width='200' height='200'><div class='card-body'><h5 class='card-title'>" + owner + "</h5><p class='card-text'>"+ ethprice +" ETH</p><div id=\""+ hash + "\"  class='btn-group'><button class='btn btn-outline-dark' onclick='unsellNFT(\"" + hash + "\")'>Unsell</button></div></div></div></div>");
            }
        if (i < nfts_blockchain.length-1)
            getIthNFT(i+1,type);
    });
}

/**
 * Function for the on click button Get
 * @param {string} nftHash 
 */

function getNFT(nftHash)
{
    if (document.getElementById("input" + nftHash) == null)
    {
        var input = document.createElement("input");
        input.style.width = "70%";
        input.id = "input" + nftHash;
        input.placeholder = "How much ether?";
        input.style.textAlign = "center";
        input.style.fontSize = "15px";
        document.getElementById(nftHash).appendChild(input).setAttribute("type", "text");
    }
    else
    {
        var input = document.getElementById("input" + nftHash);
        quantity = input.value;
        if (quantity == "")
            quantity = 0;
        contract.methods.get_NFT(nftHash, quantity).send({from: myAddress}).then(function(res) 
        {
            alert("NFT bought!");
            location.reload();
        });
    }
}


function buyNFT(nftHash, ethPrice)
{
    contract.methods.buy_NFT(nftHash).send({from: myAddress, value: web3.utils.toWei(ethPrice.toString(), "ether")}).then(function(res) 
    {
        alert("NFT bought!");
        location.reload();
    });
}

function sellNFT(nftHash)
{
    if (document.getElementById("input" + nftHash) == null)
    {
        var input = document.createElement("input");
        input.style.width = "70%";
        input.id = "input" + nftHash;
        input.placeholder = "How much ether?";
        input.style.textAlign = "center";
        input.style.fontSize = "15px";
        document.getElementById(nftHash).appendChild(input).setAttribute("type", "text");
    }
    else
    {
        var input = document.getElementById("input" + nftHash);
        quantity = input.value;
        if (quantity == "")
            {
                alert("Please insert a price in ETH");
                return;
            }
        contract.methods.sell_NFT(nftHash, quantity).send({from: myAddress}).then(function(res) 
        {
            alert("Your NFT is now on the market!");
            location.reload();
        });
    }
}

function unsellNFT(nftHash)
{
    contract.methods.unsell_NFT(nftHash).send({from: myAddress}).then(function(res) 
    {
        alert("Your NFT is no longer on the market!");
        location.reload();
    });
}