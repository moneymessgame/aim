// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NFTRecommendations {
    address public owner;
    string[] private recommendations;

    event RecommendationAdded(string recommendation);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can add recommendations");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addRecommendation(string memory _recommendation) public onlyOwner {
        recommendations.push(_recommendation);
        emit RecommendationAdded(_recommendation);
    }

    function getRecommendations() public view returns (string[] memory) {
        return recommendations;
    }
}
