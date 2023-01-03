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
function showMatches(leagueId) 
{
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
                    // create the div that contains the match
                    var matchDiv = document.createElement("button");
                    // set some style to the div
                    matchDiv.className = "list-group-item btn-outline-light list-group-item-action";
                    matchDiv.style.backgroundColor = "#201e26";
                    // create the labels that contain the match information such as date and time
                    var timeLabel = document.createElement("label");
                    timeLabel.style.color = "white";
                    timeLabel.style.display = "inline-block";
                    timeLabel.style.width = "300px";
                    timeLabel.style.textAlign = "left";
                    timeLabel.innerHTML = currentChampionship[match].date + "-" + currentChampionship[match].time;
                    // create the labels that contain home team and away team
                    var matchLabel = document.createElement("label");
                    matchLabel.style.color = "white";
                    matchLabel.style.display = "inline-block";
                    matchLabel.style.width = "300px";
                    matchLabel.style.textAlign = "center";
                    // create the div for the odds
                    var odds = document.createElement("div");
                    odds.className = "btn-group";
                    odds.style.display = "inline-block";
                    odds.style.float = "right";
                    odds.style.width = "300px";
                    odds.style.textAlign = "right";
                    // create the button for the home odds
                    var odd1 = currentChampionship[match].homeodds;
                    var oddX = currentChampionship[match].X;
                    var odd2 = currentChampionship[match].awayodds;
                    var newodds = removeMargin(odd1, oddX, odd2);
                    var homeOdds = document.createElement("button");
                    homeOdds.name = "homeOdds";
                    homeOdds.id = match+"-1";
                    homeOdds.className = "btn btn-outline-light";
                    homeOdds.style.width = "100px";
                    homeOdds.innerHTML = "1";
                    var homeOddsLabel = document.createElement("label");
                    homeOddsLabel.style.color = "white";
                    homeOddsLabel.style.display = "inline-block";
                    homeOddsLabel.style.width = "100px";
                    homeOddsLabel.style.textAlign = "center";
                    homeOddsLabel.innerHTML = newodds[0];
                    // create the button for the draw odds
                    var drawOdds = document.createElement("button");
                    drawOdds.name = "drawOdds";
                    drawOdds.id = match+"-X";
                    drawOdds.className = "btn btn-outline-light";
                    drawOdds.style.width = "100px";
                    drawOdds.innerHTML = "X";
                    var drawOddsLabel = document.createElement("label");
                    drawOddsLabel.style.color = "white";
                    drawOddsLabel.style.display = "inline-block";
                    drawOddsLabel.style.width = "100px";
                    drawOddsLabel.style.textAlign = "center";
                    drawOddsLabel.innerHTML = newodds[1];
                    // create the button for the away odds
                    var awayOdds = document.createElement("button");
                    awayOdds.name = "awayOdds";
                    awayOdds.id = match+"-2";
                    awayOdds.style.width = "100px";
                    awayOdds.className = "btn btn-outline-light";
                    awayOdds.innerHTML = "2";
                    var awayOddsLabel = document.createElement("label");
                    awayOddsLabel.style.color = "white";
                    awayOddsLabel.style.display = "inline-block";
                    awayOddsLabel.style.width = "100px";
                    awayOddsLabel.style.textAlign = "center";
                    awayOddsLabel.innerHTML = newodds[2];
                    // append the elements to the div
                    odds.appendChild(homeOdds);
                    odds.appendChild(drawOdds);
                    odds.appendChild(awayOdds);
                    odds.appendChild(homeOddsLabel);
                    odds.appendChild(drawOddsLabel);
                    odds.appendChild(awayOddsLabel);
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
    // take the list of buttons
    var homeOddsButtons = document.getElementsByName("homeOdds");
    var drawOddsButtons = document.getElementsByName("drawOdds");
    var awayOddsButtons = document.getElementsByName("awayOdds"); 
    //define the onlick event for the buttons
    var onlickfun = function(buttontype)
    {
        return function()
        {
            this.blur();
            var match_id = this.id.split("-")[0];
            var match = currentChampionship[match_id];
            var newodds = removeMargin(match.homeodds, match.X, match.awayodds);
            var success;
            if(buttontype == 0)
                success = betList("1", match.home_team, match.away_team, newodds[0],match_id);
            else if(buttontype == 1)
                success = betList("X", match.home_team, match.away_team, newodds[1],match_id);
            else if(buttontype == 2)
                success = betList("2", match.home_team, match.away_team, newodds[2],match_id);
            if (success == 0)
                if(this.className == "btn btn-outline-light")
                    this.className = "btn btn-outline-success";
                else
                    this.className = "btn btn-outline-light";
        }
    }
    // add the onclick event to the buttons
    for(var i = 0; i < homeOddsButtons.length; i++)
    {
        homeOddsButtons[i].onclick = onlickfun(0);
        drawOddsButtons[i].onclick = onlickfun(1);
        awayOddsButtons[i].onclick = onlickfun(2);
    }
}

/**
 * This function creates and display the list of the bets
 * @param {string} bet 
 * @param {string} home_team 
 * @param {string} away_team 
 * @param {string} odds 
 * @param {string} match_id
 * @returns 0 on success, -1 on error
 */
function betList(bet, home_team, away_team, odds, match_id)
{
    // change the visibility of the input and the buttons
    var betTokens = document.getElementById("betTokens");
    var eraseButton = document.getElementById("btnErase");
    var betBtn = document.getElementById("btnBet");
    var oddsSum = document.getElementById("oddsSum");
    betTokens.className = "d-block";
    betBtn.className = "btn btn-outline-light text-align-center d-block";
    eraseButton.className = "btn btn-outline-light text-align-center d-block";
    document.getElementById("betHeader").style.display = "block";
    document.getElementById("oddsSummary").style.display = "block";
    document.getElementById("winSummary").style.display = "block";

    var betUl = document.getElementById("betslist");
    // check if the bet is already in the list by checking the home team
    if (betUl.childElementCount > 0)
    {
        for(var i = 0; i < betUl.childElementCount; i++)
        {
            var li = betUl.children[i];
            var liId = li.id.split("-")[0];
            if (liId == match_id)
            {
                var betValue = li.children[0].innerHTML;
                console.log(betValue, bet);
                if (betValue != bet)
                    {
                        alert("You have already bet on this match");
                        return -1;
                    }
                else
                    {
                        betUl.removeChild(li);
                        //update the odds sum
                        oddsSum.innerHTML = parseFloat(oddsSum.innerHTML) / parseFloat(odds);
                        //update the win sum
                        updateWinSum();


                        if (betUl.childElementCount == 4)
                        {
                            betTokens.className = "d-none";
                            betBtn.className = "btn btn-outline-light text-align-center d-none";
                            eraseButton.className = "btn btn-outline-light text-align-center d-none";
                            document.getElementById("betHeader").style.display = "none";
                            document.getElementById("oddsSummary").style.display = "none";
                            document.getElementById("winSummary").style.display = "none";
                        }
                        return 0;
                    }
            }
        }
    }
    // create the list item
    var betLi = document.createElement("li");
    betLi.className = "list-group-item";
    betLi.id = match_id + "-li";
    betLi.style.color = "white";
    betLi.style.backgroundColor = "transparent";
    betLi.style.fontSize = "13px";
    betLi.style.width = "100%";
    betLi.style.marginBottom = "5px";
    betLi.style.padding = "5px";
    betLi.style.borderRadius = "5px";

    labelodds = document.createElement("label");
    labelodds.className = "float-right";
    labelodds.style.color = "white";
    labelodds.style.fontSize = "13px";
    labelodds.style.width = "20%";
    labelodds.style.textAlign = "center";
    labelMatch = document.createElement("label");
    labelMatch.className = "float-center";
    labelMatch.style.color = "white";
    labelMatch.style.textAlign = "center";
    labelMatch.style.fontSize = "13px";
    labelMatch.style.width = "60%";
    labelResult = document.createElement("label");
    labelResult.className = "float-left";
    labelResult.style.color = "white";
    labelResult.style.fontSize = "13px";
    labelResult.style.width = "20%";
    labelResult.style.textAlign = "center";
    
    labelodds.innerHTML = odds;
    labelMatch.innerHTML = home_team + " - " + away_team;
    labelResult.innerHTML = bet;

    betLi.appendChild(labelResult);
    betLi.appendChild(labelMatch);
    betLi.appendChild(labelodds);

    //update the odds sum
    oddsSum.innerHTML = (parseFloat(oddsSum.innerHTML) * parseFloat(odds)).toFixed(2);
    //update the win sum
    updateWinSum();


    var childCount = betUl.childElementCount;
    betUl.insertBefore(betLi, betUl.children[childCount - 3]);
    
    return 0;
}

/**
 * This function is used to erase the list of the bets
 * 
 */
function removeList()
{
    var ul = document.getElementById("betslist");
    // remove only <li> elements
    while(ul.childElementCount > 4)
    {
        var li = ul.firstChild;
        // while the first child is not a <li> element, go to the next one
        while(li.tagName != "LI" || li.id.slice(-3) != "-li")
            li = li.nextSibling;
        // disable the buttons
        var match_id = li.id.split("-")[0];
        var btn1 = document.getElementById(match_id+"-1");
        var btnX = document.getElementById(match_id+"-X");
        var btn2 = document.getElementById(match_id+"-2");
        btn1.className = "btn btn-outline-light";
        btnX.className = "btn btn-outline-light";
        btn2.className = "btn btn-outline-light";
        // remove the <li> element
        ul.removeChild(li);
    }
    // change the visibility of the input and the buttons
    var betTokens = document.getElementById("betTokens");
    var eraseButton = document.getElementById("btnErase");
    var betBtn = document.getElementById("btnBet");
    betBtn.className = "btn btn-outline-light text-align-center d-none";
    betTokens.className = "d-none";
    eraseButton.className = "btn btn-outline-light text-align-center d-none";
    document.getElementById("betHeader").style.display = "none";
    document.getElementById("oddsSummary").style.display = "none";
    document.getElementById("winSummary").style.display = "none";
}

/**
 * This function is used to refresh the progress bar when the user wants to scrape the data
 */
function refreshProgress() 
{
    progbar = document.getElementById("progress-bar");
    progbar.style.display = "block";
    var value = 0;
    function update() 
    {
        if (value >= 171)
        {
            clearInterval(id);
            progbar.style.display = "none";
            document.getElementById("scrapeForm").submit();
        }
        else 
        {
            progbar.style.width = value + "%";
            progbar.setAttribute("aria-valuenow", value);
            value += 1.71;
        }
    }
    var id = setInterval(update, 2600);
}

function updateWinSum()
{
    var amount = document.getElementById("betTokens").value;
    var oddsSum = document.getElementById("oddsSum").innerHTML;
    var winSum = document.getElementById("winAmount");
    winSum.innerHTML = (parseFloat(oddsSum) * parseFloat(amount)).toFixed(2);
}

/**
 * This function computes the margin of profit from the odds
 * @param {float} odd1 
 * @param {float} oddX 
 * @param {float} odd2 
 */
function computeMargin(odd1, oddX, odd2)
{
    var prob1 = 1 / odd1;
    var probX = 1 / oddX;
    var prob2 = 1 / odd2;
    return (prob1 + probX + prob2) - 1;
}

/**
 * This function removes the margin of profit from the odds
 * @param {float} odd1 
 * @param {float} oddX 
 * @param {float} odd2 
 * @returns 
 */
function removeMargin(odd1,oddX,odd2)
{
    var margin = computeMargin(odd1,oddX,odd2);
    var newOdd1 = (3*odd1 / (3-(odd1 * margin))).toFixed(2);
    var newOddX = (3*oddX / (3-(oddX * margin))).toFixed(2);
    var newOdd2 = (3*odd2 / (3-(odd2 * margin))).toFixed(2);
    return [newOdd1, newOddX, newOdd2];
}