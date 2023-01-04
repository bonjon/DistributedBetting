/**
 * Function that gets the NFTs from the blockchain and displays them in the market
 * @param {int} i 
 */
function getIthNFT(i)
{
    var nft = nfts[i].split(".")[0];
    var bool = nfts[i].split(".")[1];
    contract.methods.NFTs(nft).call().then(function(res) 
    {
        console.log(res[0]);
        fileName = res[0] + "." + bool;
        console.log(fileName);
        if (creatorAddress == res[4].toLowerCase())
            $("#getNftContainer").append("<div class='col-3'><div class='card'><img class='card-img-top' src='img/NFTs/" + fileName + "' alt='' width='200' height='200'><div class='card-body'><h5 class='card-title'>" + res[4] + "</h5><p class='card-text'>" + res[2] + " Super Tokens</p><div id=\""+ res[0] + "\"  class='btn-group'><button class='btn btn-outline-dark' onclick='getNFT(\"" + res[0] + "\")'>Get</button></div></div></div></div>");                        
        if (i < nfts.length-1)
            getIthNFT(i+1);
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
