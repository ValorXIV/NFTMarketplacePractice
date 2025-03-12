const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Marketplace", function () {
  let NFT;
  let nft;
  let Marketplace;
  let marketplace;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get the ContractFactories and Signers here.
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy Marketplace
    Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy();
    await marketplace.deployed();

    // Deploy NFT contract
    NFT = await ethers.getContractFactory("NFT");
    nft = await NFT.deploy(marketplace.address);
    await nft.deployed();
  });

  describe("Minting NFTs", function () {
    it("Should create and execute market sales", async function () {
      // Mint an NFT
      let tokenURI = "https://example.com/token/1";
      await nft.connect(addr1).createToken(tokenURI);
      
      const listingPrice = await marketplace.listingPrice();
      const auctionPrice = ethers.utils.parseUnits('1', 'ether');

      // Create market item
      await marketplace.connect(addr1).createMarketItem(
        nft.address,
        1,
        auctionPrice,
        { value: listingPrice }
      );

      // Create market sale
      await marketplace.connect(addr2).createMarketSale(
        nft.address,
        1,
        { value: auctionPrice }
      );

      // Verify the sale
      const items = await marketplace.fetchMyNFTs({ from: addr2.address });
      expect(items.length).to.equal(1);
      expect(items[0].sold).to.equal(true);
      expect(items[0].owner).to.equal(addr2.address);
    });
  });
}); 