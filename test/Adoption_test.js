const Adoption = artifacts.require("Adoption");

contract("Adoption", (accounts) => {
    let adoption;
    const expectedAdopter = accounts[0];

    before(async () => {
        adoption = await Adoption.deployed();
    });

    describe("adopting a pet and retrieving account addresses", async () => {
        before("adopt a pet using accounts[0]", async () => {
            await adoption.adopt(8, { from: expectedAdopter });
        });

        it("can fetch the address of an owner by pet id", async () => {
            const adopter = await adoption.adopters(8);
            assert.equal(adopter, expectedAdopter, "The owner of the adopted pet should be the first account");
        });

        it("can fetch the collection of all pet owners' addresses", async () => {
            const adopters = await adoption.getAdopters();
            assert.equal(adopters[8], expectedAdopter, "The owner of the adopted pet should be in the collection");
        });
    });

    describe("pet adoption edge cases", async () => {
        it("rejects invalid pet IDs (less than 0)", async () => {
            try {
                await adoption.adopt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF", { 
                from: accounts[1] });
                assert.fail("Should have reverted for pet ID < 0");
            } catch (error) {
                assert.include(error.message, "revert", "Expected revert for invalid pet ID");
            }
        });

        it("rejects invalid pet IDs (greater than 15)", async () => {
            try {
                await adoption.adopt(16, { from: accounts[1] });
                assert.fail("Should have reverted for pet ID > 15");
            } catch (error) {
                assert.include(error.message, "revert", "Expected revert for invalid pet ID");
            }
        });
    });

    describe("refunding a pet", async () => {
        before("adopt a pet first", async () => {
            await adoption.adopt(5, { from: accounts[2] });
        });

        it("allows the adopter to refund", async () => {
            await adoption.refund(5, { from: accounts[2] });
            const adopter = await adoption.adopters(5);
            assert.equal(adopter, "0x0000000000000000000000000000000000000000", "Adopter should be reset after refund");
        });

        it("rejects refund from non-adopter", async () => {
            try {
                await adoption.refund(5, { from: accounts[3] });
                assert.fail("Should have reverted when non-adopter tries to refund");
            } catch (error) {
                assert.include(error.message, "revert", "Expected revert when non-adopter tries to refund");
            }
        });

        it("rejects refund for invalid pet IDs", async () => {
            try {
                await adoption.refund(16, { from: accounts[2] });
                assert.fail("Should have reverted for invalid pet ID");
            } catch (error) {
                assert.include(error.message, "revert", "Expected revert for invalid pet ID");
            }
        });
    });
});