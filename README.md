# DistributedBetting
Main repository that contains all the stuff of the "DBet" distributed application. Essentially this application allows user to bet on football events in the blockchain.

## Client requirements
The client needs to have metamask installed on his browser

## HTTP Server
For the server we're using python library Flask. The server logic is implemented in the file app.py.
 - To run the server you can use the command flask --debug run
 - The libraries needed for the server are specified in the file environment.yml

## TODO list
 - Add a check on the bet() function (you cannot bet on past events or events happening now)
 - Add time to JSON bet and check locally if the bet is over

