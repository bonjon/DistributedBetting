/**
 * This function displays the image selected by the user
 */
function displayImage()
    {
        document.getElementById("description").style.display = "block";
        document.getElementById("description").style.width = "200px";
        document.getElementById("radioContainer").style.display = "block";
        document.getElementById("superTokensContainer").style.display = "block";
        document.getElementById("loadNFTContainer").style.display = "block";
        var file = document.getElementById("file").files[0];
        var render = new FileReader();
        render.onload = function(e) {
            var img = document.getElementById("image");
            img.src = e.target.result;
            img.width = 200;
            img.height = 200;
            img.style.display = "block";
            imageHash = web3.utils.sha3(e.target.result);
        };
        render.readAsDataURL(file);
    }

/**
 * This function creates a new NFT on the contract
 */
async function forgeNFT() 
{
    // Take the rarity of the NFT
    var rarity = "0x0";
    if (document.getElementById("bronze").checked)
        rarity = "0x0";
    else if (document.getElementById("silver").checked)
        rarity = "0x01";
    else if (document.getElementById("gold").checked)
        rarity = "0x02";
    var zero = "0x0000000000000000000000000000000000000000000000000000000000000000";
    console.log("Uploaded image whose hash is: "+imageHash);
    var quantity = parseInt(document.getElementById("quantity").value);
    // Take the NFT name
    var descriptionNFT = document.getElementById("description").value;
    if (descriptionNFT == "" || !isValid(descriptionNFT))
    {   
        alert("Please insert a valid name for the NFT");
        return;
    }
    // Take the hash of the NFT name
    var desc_hash = web3.utils.sha3(descriptionNFT);
    // Check if the NFT already exists
    contract.methods.NFTs(imageHash).call().then(function(res) {
        console.log(res[0]);
        if (res[0] !== zero)
        {
            alert("NFT already forged");
            return;
        }
        else
        {
            // Forge the NFT
            console.log("Forging NFT")
            console.log("Quantity: "+quantity)
            console.log("My address: "+myAddress)
            console.log("Description Hash: "+desc_hash)
            console.log("Rarity: "+typeof(rarity))
            contract.methods.forge_NFT(imageHash, quantity, desc_hash, rarity).send({from: myAddress}).then(function() {
            alert("NFT forged");
            // the image is uploaded on the server with the hash as name
            document.getElementById("hash").value = imageHash;
            document.getElementById("form").submit();
            });
        }
    });
}

function isValid(str) {
    return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(str);
}

/**
 * Function that gets all the bets to be payed and displays them to the creator
 */
function getBets(b)
{
    // url of the server
    var url = "http://"+host+":5000/bets/";

    accordion = document.getElementById("accordion");
    // get the bet
    betHash = bets[b][0];
    // get the address of who made the bet
    address = bets[b][1];

    // get the block
    block = bets[b][2];

    //get the json of the bet via get request
    $.ajax({
        type: "GET",
        url: url + betHash + ".json",
        success: function (result) {
                //create the html for the bet
                var html = "<div class='card'><div class='card-header text-white' id='"+betHash+address+block+"' style='background-color:#201e26'>"
                html += "<div class='row'><div class='col-2' ><h6 class='mb-0' style='text-align: left;'> " + block + "</h5></div>";
                html += "<div class='col-8'><button class='btn btn-link' data-toggle='collapse' data-target='#"+betHash+address+block+"collapse' aria-expanded='true' aria-controls='"+betHash+address+block+"collapse' style='color: white;'>"
                html += betHash + "</button></div>";
                html += "<div class='col-2' style='text-align: right'><button id='"+betHash+address+block+"button' onclick='pay4win(\""+betHash+"\",\""+address+"\","+result.potentialWin+");' class='btn btn-outline-light' style='text-align: right;'>Pay</h5></div></div>";
                html += "<div id='"+betHash+address+block+"collapse' class='collapse' aria-labelledby='"+betHash+address+block+"' data-parent='#accordion'>";
                html += "<div class='card-body'>";
                html += "<div class='row'><div class='col-3'>Match</div><div class='col-2'>Bet</div><div class='col-2'>Odds</div><div class='col-1'>Result</div><div class='col-1'>Status</div></div>";
                oddsSum = 1;
                betTokens = result.betTokens;
                for(var i = 0; i < result.bets.length; i++)
                    {
                        // take the result from the results object (if it exists)
                        match_result = results[result.bets[i].match_id];
                        if(match_result == undefined)
                            {
                                match_result = "-";
                                img = "img/giallo.png";
                            }
                        else
                        {
                            home_score = parseInt(match_result.split("-")[0]);
                            away_score = parseInt(match_result.split("-")[1]);
                            if(home_score > away_score && result.bets[i].bet == "1")
                                img = "img/verde.png";
                            else if(home_score < away_score && result.bets[i].bet == "2")
                                img = "img/verde.png";
                            else if(home_score == away_score && result.bets[i].bet == "X")
                                img = "img/verde.png";
                            else
                                img = "img/rosso.png";
                        }
                        oddsSum *= parseFloat(result.bets[i].odds);
                        img_html = "<img src='"+img+"' width='20' height='20'>";
                        html += "<div class='row'><div class='col-3'>" + result.bets[i].home_team + "-" + result.bets[i].away_team + "</div><div class='col-2'>"+result.bets[i].bet+"</div><div class='col-2'>" + result.bets[i].odds + "</div><div class='col-1'>" + match_result + "</div><div class='col-1'>"+img_html+"</div></div>";
                    }
                oddsSum = oddsSum.toFixed(2);
                html += "<br>"
                html += "<div class='row'><div class='col-3'>Total Odds:</div><div class='col-2'></div><div class='col-2'>" + oddsSum + "</div><div class='col-1'></div><div class='col-1'></div></div>";
                html += "<div class='row'><div class='col-3'>Bet Tokens:</div><div class='col-2'></div><div class='col-2'>" + betTokens + "</div><div class='col-1'></div><div class='col-1'></div></div>";
                html += "<div class='row'><div class='col-3'>Potential Win:</div><div class='col-2'></div><div class='col-2'>" + Math.round((betTokens * oddsSum)) + "</div><div class='col-1'></div><div class='col-1'></div></div>";
                html += "</div></div></div>"
                //add the bet to the page
                accordion.innerHTML += html;
                if(b > 0)
                    getBets(b-1);
        },
        error: function (result) {
            if(b > 0)
            getBets(b-1);
        }
      });
}

function pay4win(betHash, address, amount)
{
    // pay the bet
    contract.methods.pay4win(betHash, address, amount).send({from: myAddress}).then(function()
    {
        // reload the page
        location.reload();
    });
}