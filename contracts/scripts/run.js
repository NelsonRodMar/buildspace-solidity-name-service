const main = async () => {
    const [owner, randomPerson] = await hre.ethers.getSigners();
    const domainContractFactory = await hre.ethers.getContractFactory('Domains');

    const domainContract = await domainContractFactory.deploy(hre.ethers.utils.parseEther("0.15"));
    await domainContract.deployed();
    console.log("Contract deployed to:", domainContract.address);
    console.log("Contract deployed by:", owner.address);

    // Contract Balance
    let balance = await hre.ethers.provider.getBalance(domainContract.address);
    console.log("Contract balance:", hre.ethers.utils.formatEther(balance));

    // Transaction fail because contract is not paused : register an address
    try {
        let registerTxn = await domainContract.register("test", {value: hre.ethers.utils.parseEther('0.16')});
        await registerTxn.wait();
    } catch (e) {
        console.log("Transaction failed : ", e.message);
    }

    // Change isPaused status
    let changeIsPausedTxn = await domainContract.unpause();
    await changeIsPausedTxn.wait();


    let registerTxn = await domainContract.register("test", {value: hre.ethers.utils.parseEther('0.16')});
    await registerTxn.wait();

    console.log("Transaction completed domain minted");

    // Contract Balance
    balance = await hre.ethers.provider.getBalance(domainContract.address);
    console.log("Contract balance:", hre.ethers.utils.formatEther(balance));

    //Get an address
    let getAddress = await domainContract.getAddress("test");
    console.log("Actual address for test : " + getAddress);

    // Trying to set a Twitter that doesn't belong to me
    try {
        txn = await domainContract.connect(randomPerson).setTwitter("test", "Haha my domain now!");
        await txn.wait();
    } catch (e) {
        console.log("Transaction failed : ", e.message);
    }

    // Change an address
    await domainContract.changeAddress("test", "0x770569f85346B971114e11E4Bb5F7aC776673469");

    // Get new address
    let getNewAddressTxn = await domainContract.getAddress("test");
    console.log("New address for test : " + getNewAddressTxn);

    // Contract Balance
    balance = await hre.ethers.provider.getBalance(domainContract.address);
    console.log("Contract balance:", hre.ethers.utils.formatEther(balance));

    // Try rob fund of Contract
    try {
        txn = await domainContract.connect(randomPerson).withdraw(randomPerson.address);
        await txn.wait();
    } catch(error){
        console.log("Could not rob contract");
    }

    // Let's look in their wallet so we can compare later
    let ownerBalance = await hre.ethers.provider.getBalance(owner.address);
    console.log("Balance of owner before withdrawal:", hre.ethers.utils.formatEther(ownerBalance));

    // Try withdraw fund of Contract
    try {
        txn = await domainContract.connect(owner).withdraw(owner.address);
        await txn.wait();
    } catch(error){
        console.log("Could not rob contract");
    }


    // Balance of owner after withdrawal
    ownerBalance = await hre.ethers.provider.getBalance(owner.address);
    console.log("Balance of owner before withdrawal:", hre.ethers.utils.formatEther(ownerBalance));

    // Contract Balance after withdrawal
    balance = await hre.ethers.provider.getBalance(domainContract.address);
    console.log("Contract balance:", hre.ethers.utils.formatEther(balance));

};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();