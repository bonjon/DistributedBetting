/**
 * This function converts wei to ether
 * @param {float} wei 
 * @returns float
 */
function fromWei(wei) 
    { return wei / 1000000000000000000; }
   
/**
 * This function gets the number of entry tokens the user wants to buy and updates the price in ether
 */
function updateEthPrice()
{
    // the amount of entry tokens the user wants to buy
    var quantity = parseInt(document.getElementById("quantity").value);
    // the price of the entry tokens in wei
    var ethPrice = quantity * entryTokensPrice;
    // show the price in ether
    document.getElementById("entryEthPrice").value = fromWei(ethPrice);
}

/**
 * This function gets the number of entry tokens the user wants to buy and mints them
 * @returns 
 */
function mint()
{
    // the amount of entry tokens the user wants to buy
    var quantity = parseInt(document.getElementById("quantity").value);
    // the price of the entry tokens in wei
    var ethPrice = quantity * entryTokensPrice;
    updateEther();
    // check if the user has enough ether
    if(ethPrice > web3.utils.toWei(document.getElementById("ether").innerHTML, "ether"))
    {
        alert("Not enough ether");
        return;
    }
    else
    {
        // mint the entry tokens
        contract.methods.mint().send({from: myAddress, value: ethPrice}).then(function(result) {
        // update the entry tokens
        document.getElementById("entryTokens").innerHTML = parseInt(document.getElementById("entryTokens").innerHTML) + quantity;
        updateEther();
        alert("Congratulations! You have minted " + quantity + " entryTokens");
        });
    }
   
}

/**
 * This function gets the json objects of the matches
 */
async function getMatches()
{
    seriea = await LoadFileToJSON("serieah");
    bundesliga = await LoadFileToJSON("bundesligah");
    ligue1 = await LoadFileToJSON("ligue1h");
    premierleague = await LoadFileToJSON("premierleagueh");
    laliga = await LoadFileToJSON("laligah");
    eredivisie = await LoadFileToJSON("eredivisieh");
}

/**
 * This function shows the matches of the league selected by the user
 * @param {string} leagueId 
 */
function showMatches(leagueId) {
    ids = ["premierleague", "seriea", "laliga", "bundesliga"];
    // make active the button selected by the user
    if (leagueId == "premierleague") 
    {
        currentChampionship = premierleague;
        document.getElementById("premierButton").classList.add("active");
        document.getElementById("aButton").classList.remove("active");
        document.getElementById("laButton").classList.remove("active");
        document.getElementById("bunButton").classList.remove("active");
    } 
    else if (leagueId == "seriea")
    {
        currentChampionship = seriea;
        document.getElementById("aButton").classList.add("active");
        document.getElementById("premierButton").classList.remove("active");
        document.getElementById("laButton").classList.remove("active");
        document.getElementById("bunButton").classList.remove("active");
    }
    else if (leagueId == "laliga")
    {
        currentChampionship = laliga;
        document.getElementById("laButton").classList.add("active");
        document.getElementById("premierButton").classList.remove("active");
        document.getElementById("aButton").classList.remove("active");
        document.getElementById("bunButton").classList.remove("active");
    }
    else if (leagueId == "bundesliga")
    {
        currentChampionship = bundesliga;
        document.getElementById("bunButton").classList.add("active");
        document.getElementById("premierButton").classList.remove("active");
        document.getElementById("aButton").classList.remove("active");
        document.getElementById("laButton").classList.remove("active");
    }
    // load the matches only if they are not already loaded
    if((leagueId == "bundesliga" && !bundesligaCreated) || (leagueId == "laliga" && !laligaCreated) || (leagueId == "seriea" && !serieaCreated) || (leagueId == "premierleague" && !premierleagueCreated)) 
        {
            for(match in currentChampionship)
                {
                    var matchDiv = document.createElement("button");
                    matchDiv.className = "list-group-item btn-outline-light list-group-item-action";
                    matchDiv.style.backgroundColor = "#201e26";

                    var timeLabel = document.createElement("label");
                    timeLabel.style.color = "white";
                    timeLabel.style.display = "inline-block";
                    timeLabel.style.width = "300px";
                    timeLabel.style.textAlign = "left";
                    timeLabel.innerHTML = currentChampionship[match].date + "-" + currentChampionship[match].time;
                    var matchLabel = document.createElement("label");
                    matchLabel.style.color = "white";
                    matchLabel.style.display = "inline-block";
                    matchLabel.style.width = "300px";
                    matchLabel.style.textAlign = "center";

                    var odds = document.createElement("div");
                    odds.className = "btn-group";
                    odds.style.display = "inline-block";
                    odds.style.float = "right";
                    odds.style.width = "300px";
                    odds.style.textAlign = "right";
                    var homeOdds = document.createElement("button");
                    homeOdds.className = "btn btn-outline-light";
                    homeOdds.style.width = "100px";
                    homeOdds.innerHTML = currentChampionship[match].homeodds;
                    var drawOdds = document.createElement("button");
                    drawOdds.className = "btn btn-outline-light";
                    drawOdds.style.width = "100px";
                    drawOdds.innerHTML = currentChampionship[match].X;
                    var awayOdds = document.createElement("button");
                    awayOdds.style.width = "100px";
                    awayOdds.className = "btn btn-outline-light";
                    awayOdds.innerHTML = currentChampionship[match].awayodds;
                    odds.appendChild(homeOdds);
                    odds.appendChild(drawOdds);
                    odds.appendChild(awayOdds);

                    matchLabel.innerHTML = currentChampionship[match].home_team + " - " + currentChampionship[match].away_team;
                    matchDiv.appendChild(timeLabel);
                    matchDiv.appendChild(matchLabel);
                    matchDiv.appendChild(odds);
                    document.getElementById(leagueId).appendChild(matchDiv);
                }
            if(leagueId == "bundesliga")
                bundesligaCreated = true;
            else if(leagueId == "laliga")
                laligaCreated = true;
            else if(leagueId == "seriea")
                serieaCreated = true;
            else if(leagueId == "premierleague")
                premierleagueCreated = true;
        }
    // hide the matches of the other leagues and show the matches of the selected ones
    for(championship in ids)
        {
            if (ids[championship] != leagueId)
                document.getElementById(ids[championship]).style.display = "none";
            else
                document.getElementById(ids[championship]).style.display = "block";
        }
}