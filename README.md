# DistributedBetting
Main repository that contains all the stuff of the "DBet" distributed application. Essentially this application allows user to bet on football events in the blockchain.

## Client requirements
The client needs to have metamask installed on his browser

## HTTP Server
For the server we're using python library Flask. The server logic is implemented in the file app.py.
 - To run the server you can simply run the app.py script
 - The libraries needed for the server are specified in the file environment.yml
 - In the config.py file (which is in the py/ folder), you have to set the interface that hosts the server, the creator and the contract address.
   Also, if you use a chrome instead of firefox for scraping, change the variable browser to "chrome".
Remember also to open your Ganache server.

