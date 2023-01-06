/**
 * Function that gets the user bets from the blockchain and displays them
 */
function getBets(b)
{
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
        url: "http://localhost:5000/bets/" + betHash + ".json",
        success: function (result) {
            if(address == myAddress)
            {
                //create the html for the bet
                var html = "<div class='card'><div class='card-header text-white' id='"+betHash+"' style='background-color:#201e26'>"
                html += "<div class='row'><div class='col-2' ><h6 class='mb-0' style='text-align: left;'> " + block + "</h5></div>";
                html += "<div class='col-8'><button class='btn btn-link' data-toggle='collapse' data-target='#"+betHash+"collapse' aria-expanded='true' aria-controls='"+betHash+"collapse' style='color: white;'>"
                html += betHash + "</button></div>";
                bet_result = result.result;
                if(bet_result == "1")
                    bet_result = "VINTO";
                else if(bet_result == "0")
                    bet_result = "PERSO";
                else
                    bet_result = "IN CORSO";
                html += "<div class='col-2'><h6 class='mb-0' style='text-align: right;'>"+bet_result+"</h5></div></div>";
                html += "<div id='"+betHash+"collapse' class='collapse' aria-labelledby='"+betHash+"' data-parent='#accordion'>";
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
                html += "<div class='row'><div class='col-3'>Potential Win:</div><div class='col-2'></div><div class='col-2'>" + (betTokens * oddsSum).toFixed(2) + "</div><div class='col-1'></div><div class='col-1'></div></div>";
                html += "</div></div></div>"
                //add the bet to the page
                accordion.innerHTML += html;
                if(b > 0)
                    getBets(b-1);
    
            }
        },
        error: function (result) {
            if(address == myAddress)
            {
                //create the html for the bet
                var html = "<div class='card'><div class='card-header text-white' id='"+betHash+"' style='background-color:#720a10'>"
                html += "<div class='row'><div class='col-2' ><h6 class='mb-0' style='text-align: left;'> " + block + "</h5></div>";
                html += "<div class='col-8'><button class='btn btn-link' data-toggle='collapse' data-target='#"+betHash+"collapse' aria-expanded='true' aria-controls='"+betHash+"collapse' style='color: white;'>"
                html += betHash + "</button></div>";
                html += "<div class='col-2'><h6 class='mb-0' style='text-align: right;'> - </h5></div></div>";
                html += "<div id='"+betHash+"collapse' class='collapse' aria-labelledby='"+betHash+"' data-parent='#accordion'>";
                html += "<div class='card-body'>";
                html += "<div class='row'><div class='col-6'>Errore</div><div class='col-6'>Sorry, the bet is not in our server, please contact us to get it again.</div></div>";
                html += "</div></div></div>"
                //add the bet to the page
                accordion.innerHTML += html;
                if(b > 0)
                    getBets(b-1);

            }
        }
      });
   
}
