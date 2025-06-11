const Migrations = artifacts.require("Migrations");

contract("Migrations", (accounts) => {
  let migrations;
  const owner = accounts[0];
  const nonOwner = accounts[1];

  before(async () => {
    migrations = await Migrations.new();
  });

  describe("Deployment", () => {
    it("should set the correct owner", async () => {
      const contractOwner = await migrations.owner();
      assert.equal(contractOwner, owner, "Owner address mismatch");
    });

    it("should initialize last_completed_migration to 0", async () => {
      const lastMigration = await migrations.last_completed_migration();
      assert.equal(lastMigration.toNumber(), 0, "Initial migration should be 0");
    });
  });

  describe("setCompleted function", () => {
    const testMigrationNumber = 42;

    it("should allow owner to update last_completed_migration", async () => {
      await migrations.setCompleted(testMigrationNumber, { from: owner });
      const lastMigration = await migrations.last_completed_migration();
      assert.equal(
        lastMigration.toNumber(),
        testMigrationNumber,
        "Migration number not updated correctly"
      );
    });

    it("should reject non-owner attempts to update", async () => {
      try {
        await migrations.setCompleted(testMigrationNumber, { from: nonOwner });
        assert.fail("Non-owner should not be able to update");
      } catch (error) {
        assert.include(
          error.message,
          "revert",
          "Expected revert when non-owner calls setCompleted"
        );
      }
    });


  });

  describe("Edge cases", () => {
    it("should handle maximum uint value", async () => {
      const maxUint = web3.utils.toBN("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
      await migrations.setCompleted(maxUint, { from: owner });
      const lastMigration = await migrations.last_completed_migration();
      assert.equal(
        lastMigration.toString(),
        maxUint.toString(),
        "Should handle maximum uint value"
      );
    });

  });
});