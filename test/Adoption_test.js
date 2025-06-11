const Adoption = artifacts.require("Adoption");

contract("Adoption", function(accounts) {
    let adoption;
    const [owner, adopter1, adopter2] = accounts;

    before(async () => {
        adoption = await Adoption.new();
    });

    it("should initialize with empty adopters", async () => {
        const adopters = await adoption.getAdopters();
        const zeroAddress = "0x0000000000000000000000000000000000000000";
        
        for (let i = 0; i < 16; i++) {
            assert.equal(adopters[i], zeroAddress, `Pet ${i} should not be adopted initially`);
        }
    });

    describe("adopt()", () => {
        it("should allow adoption of a pet", async () => {
            const petId = 0;
            await adoption.adopt(petId, {from: adopter1});
            
            const adopters = await adoption.getAdopters();
            assert.equal(adopters[petId], adopter1, "Adopter address should be recorded");
        });

        it("should reject invalid pet IDs", async () => {
            try {
                await adoption.adopt(16, {from: adopter1});
                assert.fail("Should have reverted for invalid pet ID");
            } catch (error) {
                assert.include(error.message, "revert", "Should revert for invalid pet ID");
            }
        });

        it("should allow different accounts to adopt different pets", async () => {
            await adoption.adopt(1, {from: adopter1});
            await adoption.adopt(2, {from: adopter2});
            
            const adopters = await adoption.getAdopters();
            assert.equal(adopters[1], adopter1, "Adopter1 should own pet 1");
            assert.equal(adopters[2], adopter2, "Adopter2 should own pet 2");
        });
    });

    describe("refund()", () => {
        before(async () => {
            await adoption.adopt(3, {from: adopter1});
        });

        it("should allow refund by the adopter", async () => {
            await adoption.refund(3, {from: adopter1});
            
            const adopters = await adoption.getAdopters();
            const zeroAddress = "0x0000000000000000000000000000000000000000";
            assert.equal(adopters[3], zeroAddress, "Pet should be available after refund");
        });

        it("should record refunded address in history", async () => {
            await adoption.adopt(4, {from: adopter1});
            await adoption.refund(4, {from: adopter1});
            
            const history = await adoption.getAdopters_history();
            assert.equal(history[4], adopter1, "History should record previous adopter");
        });

        it("should reject refund by non-adopter", async () => {
            await adoption.adopt(5, {from: adopter1});
            
            try {
                await adoption.refund(5, {from: adopter2});
                assert.fail("Should have reverted for non-adopter");
            } catch (error) {
                assert.include(error.message, "revert", "Should revert for non-adopter");
            }
        });

        it("should reject refund for invalid pet IDs", async () => {
            try {
                await adoption.refund(16, {from: adopter1});
                assert.fail("Should have reverted for invalid pet ID");
            } catch (error) {
                assert.include(error.message, "revert", "Should revert for invalid pet ID");
            }
        });
    });

    describe("getAdopters() and getAdopters_history()", () => {
        it("should return correct arrays", async () => {
            await adoption.adopt(6, {from: adopter1});
            await adoption.refund(6, {from: adopter1});
            
            const adopters = await adoption.getAdopters();
            const history = await adoption.getAdopters_history();
            
            const zeroAddress = "0x0000000000000000000000000000000000000000";
            assert.equal(adopters[6], zeroAddress, "Current adopter should be empty");
            assert.equal(history[6], adopter1, "History should show previous adopter");
        });
    });
});