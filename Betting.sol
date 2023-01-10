// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0 <0.9.0;

contract DistributedBetting
{

    // the price of an entry token
    uint constant public PRICE = 1 * 1e15;

    // the percentage of the creator's fee
    uint constant public FEE = 10;

    // the creator of the contract 
    address payable internal creator;

    // these tokens can be bought with ether and can be used to bet
    mapping(address => uint) public entryTokens;  

    // these tokens can be used to buy NFT and to bet
    // (they can only be obtained winning bettings)
    mapping(address => uint) public superTokens;

    // Pay4win event
    event BetPayed(address winner, bytes32 bet, uint amount);

    // The fields of the NFT
    struct NFT
    {
        bytes32 imageHash; // the hash of the image of the card
        bool selling; // whether the owner is selling the card
        uint superTokenPrice; // the price in super tokens
        uint ethPrice; // the price in ether
        address owner; // the owner of the NFT
        bytes32 name; // the name of the NFT
        bytes1 rarity; // the rarity of the NFT
    }

    mapping(bytes32 => NFT) public NFTs;

    constructor()
    {
        creator = payable(msg.sender);
    }

    function mint() external payable
    {
        // you need to send at least PRICE eth to buy entryTokens
        require(msg.value >= PRICE, "You're a jerk!");

        // "buy" entryTokens
        entryTokens[msg.sender] += msg.value / PRICE;

        // give the money to the creator
        creator.transfer(msg.value);
    }

    function bet(bytes32 stake, uint amount) external
    {
        require(entryTokens[msg.sender] + superTokens[msg.sender] >= amount,"You're a jerk, again!");
        if (entryTokens[msg.sender] >= amount)
            entryTokens[msg.sender] -= amount;
        else
        {
            uint remaining = amount - entryTokens[msg.sender];
            entryTokens[msg.sender] = 0;
            superTokens[msg.sender] -= remaining;
        }
    }

    function forge_NFT(bytes32 NFT_hash, uint superTokenPrice, bytes32 NFT_desc_hash, bytes1 NFT_rarity) external
    {
        require(msg.sender == creator, "You are not the contract owner");
        require(NFTs[NFT_hash].imageHash == 0, "The NFT already exists");
        NFTs[NFT_hash] = NFT(NFT_hash, false, superTokenPrice,0,creator,NFT_desc_hash,NFT_rarity);
    }

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

    function sell_NFT(bytes32 NFT_hash, uint ethPrice) external
    {
        // you need to be the owner of the NFT
        require(msg.sender == NFTs[NFT_hash].owner,"you need to be the owner of the NFT");
        // set the price to what you decided and start selling it
        NFTs[NFT_hash].ethPrice = ethPrice;
        NFTs[NFT_hash].selling = true;
    }

    function unsell_NFT(bytes32 NFT_hash) external
    {
        // you need to be the owner of the NFT
        require(msg.sender == NFTs[NFT_hash].owner,"you need to be the owner of the NFT");
        // stop selling the NFT
        NFTs[NFT_hash].selling = false;
    }

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

    function pay4win(bytes32 stake, address winner, uint amount) external
    {
        // you need to be the contract owner
        require(msg.sender == creator, "You are not the contract owner");
        // pay the winner of the bet whose hash is stake
        superTokens[winner] += amount;
        // notify that the bet has been payed
        emit BetPayed(winner, stake, amount);
    }

    //selfdestruct the contract
    function kill() external
    {
        require(msg.sender == creator, "You are not the contract owner");
        selfdestruct(creator);
    }

}
