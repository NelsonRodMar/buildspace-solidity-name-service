const main = async () => {
  // Deploy with Frame src : https://github.com/NomicFoundation/hardhat/issues/1159#issuecomment-789310120

  // Create a Frame connection
  const ethProvider = require('eth-provider') // eth-provider is a simple EIP-1193 provider
  const frame = ethProvider('frame') // Connect to Frame

  // Use `getDeployTransaction` instead of `deploy` to return deployment data
  const domainsContractFactory = await ethers.getContractFactory('Domains')
  const domainsContract = await domainsContractFactory.getDeployTransaction(ethers.utils.parseEther("0.015"))

  // Set `tx.from` to current Frame account
  domainsContract.from = (await frame.request({ method: 'eth_requestAccounts' }))[0]

  // Sign and send the transaction using Frame
  const result = await frame.request({ method: 'eth_sendTransaction', params: [domainsContract] })

  console.log("Transaction deployement : ", result);
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