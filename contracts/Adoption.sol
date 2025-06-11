pragma solidity ^0.5.0;
 
contract Adoption {
    address[16] public adopters;
    address[16] public adopters_history;

    // Adopting a pet
    function adopt(uint petId) public returns (uint) {
        require(petId >= 0 && petId <= 15);
        adopters[petId] = msg.sender;
        return petId;
    }

    function refund(uint petId) public {
        require(petId >= 0 && petId <= 15, "Pet ID must be between 0 and 15");
        require(adopters[petId] == msg.sender, "Only the adopter can refund");

        adopters_history[petId]=adopters[petId];
        adopters[petId] = address(0); // Reset the adopter address to 0x0
    }

    // Retrieving the adopters
    function getAdopters() public view returns (address[16]  memory) {
        return adopters;
    }

    // Retrieving the adopters
    function getAdopters_history() public view returns (address[16]  memory) {
        return adopters_history;
    }
}