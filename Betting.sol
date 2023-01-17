// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

contract DistributedBetting
{

    /// @notice the price of an entry token
    uint constant public PRICE = 1 * 1e15;

    /// @notice the percentage of ETh given to the creator as a fee (when you buy NFTs)
    uint constant public FEE = 10;

    /// @notice the creator of the contract 
    address payable internal creator;

    /// @notice these tokens can be bought with ether and can be used to bet
    mapping(address => uint) public entryTokens;  

    /// @notice these tokens can be used to buy NFT and to bet (they can only be obtained winning bettings)
    mapping(address => uint) public superTokens;

    /// @notice Event emitted when a user wins a bet
    event BetPayed(address winner, bytes32 bet, uint amount);

    /// @notice An NFT is a card that can be obtained with superTokens and then sold for ether
    struct NFT
    {
        /// @notice the hash of the image of the card
        bytes32 imageHash;
        /// @notice whether the owner is selling the card
        bool selling;
        /// @notice the price in super tokens
        uint superTokenPrice;
        /// @notice the price in ether
        uint ethPrice;
        /// @notice the owner of the card
        address owner;
        /// @notice the hash of the description of the card
        bytes32 name;
        /// @notice the rarity of the card
        bytes1 rarity;
    }

    /// @notice stores all the NFTs using the hash of the image as a key
    mapping(bytes32 => NFT) public NFTs;

    /**
     * @notice Constructor of the contract, it sets the creator of the contract
     */
    constructor()
    {
        creator = payable(msg.sender);
    }

    /**
     * @notice this function is used to mint fresh entryTokens
     */
    function mint() external payable
    {
        // you need to send at least PRICE eth to buy entryTokens
        require(msg.value >= PRICE, "You're a jerk!");

        // "buy" entryTokens
        entryTokens[msg.sender] += msg.value / PRICE;

        // give the money to the creator
        creator.transfer(msg.value);
    }

    /**
     * @notice this function is used to bet on the blockchain.
     * @param stake the hash of the bet
     * @param amount the amount of tokens you want to bet
     */
    function bet(bytes32 stake, uint amount) external
    {
        // you need to have enough tokens to bet
        require(entryTokens[msg.sender] + superTokens[msg.sender] >= amount,"You're a jerk, again!");
        // remove the entryTokens from the user account
        if (entryTokens[msg.sender] >= amount)
            entryTokens[msg.sender] -= amount;
        else // if the entryTokens are not enough, for the rest remove the superTokens
        {
            uint remaining = amount - entryTokens[msg.sender];
            entryTokens[msg.sender] = 0;
            superTokens[msg.sender] -= remaining;
        }
    }

    /**
     * @notice this function is create a new NFT
     * @param NFT_hash the hash of the image of the NFT
     * @param superTokenPrice the price of the NFT in superTokens
     * @param NFT_desc_hash the hash of the description of the NFT
     * @param NFT_rarity the rarity of the NFT
     */
    function forge_NFT(bytes32 NFT_hash, uint superTokenPrice, bytes32 NFT_desc_hash, bytes1 NFT_rarity) external
    {
        require(msg.sender == creator, "You are not the contract owner");
        require(NFTs[NFT_hash].imageHash == 0, "The NFT already exists");
        NFTs[NFT_hash] = NFT(NFT_hash, false, superTokenPrice,0,creator,NFT_desc_hash,NFT_rarity);
    }

    /**
     * @notice this function is used to get an NFT. It can be called only if the NFT is not already owned by someone
     * @param NFT_hash the hash of the image of the NFT
     * @param ethPrice the price of the NFT in ether if you want to sell it, 0 otherwise
     */
    function get_NFT(bytes32 NFT_hash, uint ethPrice) external
    {   
        // the NFT has never been got by anyone (with superTokens)
        require(NFTs[NFT_hash].owner == creator,"the NFT has never been got by anyone (with superTokens)");
        // the sender has enough super tokens to get the NFT
        require(superTokens[msg.sender] >= NFTs[NFT_hash].superTokenPrice,"the sender has not enough super tokens to get the NFT");
        // decrease the super tokens from the sender account
        superTokens[msg.sender] -= NFTs[NFT_hash].superTokenPrice;
        // make the sender the new owner of the NFT
        NFTs[NFT_hash].owner = msg.sender;
        // if the ethPrice is greater than 0, start selling the NFT for ether
        NFTs[NFT_hash].selling = (ethPrice != 0);
        if (NFTs[NFT_hash].selling)
            NFTs[NFT_hash].ethPrice = ethPrice;
    }

    /**
     * @notice this function is used to put a NFT on sale. It can be called only if the NFT is owned by the sender
     * @param NFT_hash the hash of the image of the NFT
     * @param ethPrice the price of the NFT in ether
     */
    function sell_NFT(bytes32 NFT_hash, uint ethPrice) external
    {
        // you need to be the owner of the NFT
        require(msg.sender == NFTs[NFT_hash].owner,"you need to be the owner of the NFT");
        // set the price to what you decided and start selling it
        NFTs[NFT_hash].ethPrice = ethPrice;
        NFTs[NFT_hash].selling = true;
    }

    /**
     * @notice this function is used to stop selling a NFT. It can be called only if the NFT is owned by the sender
     * @param NFT_hash the hash of the image of the NFT
     */
    function unsell_NFT(bytes32 NFT_hash) external
    {
        // you need to be the owner of the NFT
        require(msg.sender == NFTs[NFT_hash].owner,"you need to be the owner of the NFT");
        // stop selling the NFT
        NFTs[NFT_hash].selling = false;
    }

    /**
     * @notice this function is used to buy a NFT. It can be called only if the NFT is being sold.
     * @param NFT_hash the hash of the image of the NFT
     */
    function buy_NFT(bytes32 NFT_hash) payable external
    {
        // the NFT is not being sold
        require(NFTs[NFT_hash].selling,"the NFT is not being sold");
        // you need enough ether to buy the NFT
        require(msg.value >= NFTs[NFT_hash].ethPrice,"you need enough ether to buy the NFT");
        // take the fee
        uint fee = msg.value * FEE / 100;
        creator.transfer(fee);
        // send the rest of the money to the old owner
        payable(NFTs[NFT_hash].owner).transfer(msg.value - fee);
        // the sender is now the new owner
        NFTs[NFT_hash].owner = msg.sender;
        // stop selling the NFT
        NFTs[NFT_hash].selling = false;
    }

    /**
     * @notice this function is used to pay the winner of a bet. It can be called only by the contract owner.
     * @param stake the hash of the bet (this bet has to be a winning bet)
     * @param winner the address of the winner
     * @param amount the amount of superTokens to pay
     */
    function pay4win(bytes32 stake, address winner, uint amount) external
    {
        // you need to be the contract owner
        require(msg.sender == creator, "You are not the contract owner");
        // pay the winner of the bet whose hash is stake
        superTokens[winner] += amount;
        // notify that the bet has been payed
        emit BetPayed(winner, stake, amount);
    }

    /**
     * @notice this function is used to kill the contract. It can be called only by the contract owner.
     */
    function kill() external
    {
        require(msg.sender == creator, "You are not the contract owner");
        selfdestruct(creator);
    }

}
