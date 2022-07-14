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

    // Transaction failde because contract is not paused : egister an address
    try {
        let registerTxn = await domainContract.register("test", {value: hre.ethers.utils.parseEther('0.16')});
        await registerTxn.wait();
    } catch (e) {
        console.log("Transaction failed : ", e.message);
    }

    // Change isPaused status
    let changeIsPausedTxn = await domainContract.changeIsPausedStatus();
    await changeIsPausedTxn.wait();


    let registerTxn = await domainContract.register("test", {value: hre.ethers.utils.parseEther('0.16')});
    await registerTxn.wait();

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