// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract DistributedBetting
{

    // the price of an entry token
    uint constant public PRICE = 1 * 1e15;

    // the creator of the contract 
    address payable internal creator;

    // these tokens can be bought with ether and can be used to bet
    mapping(address => uint) internal entryTokens;  

    // these tokens can be used to buy NFT and to bet
    // (they can only be obtained winning bettings)
    mapping(address => uint) internal superTokens;

    //TODO NFT

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

    function get_reward(uint stake) external
    {
        //TODO
    }

    function bet(uint stake, uint amount) external
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
        //TODO do we need to save the stake?
    }

    function buy_NFT(uint amount) external
    {
        require(superTokens[msg.sender] >= amount);
        //TODO
    }







}
