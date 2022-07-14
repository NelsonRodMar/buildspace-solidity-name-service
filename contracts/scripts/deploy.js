const main = async () => {
  // Deploy with Frame src : https://github.com/NomicFoundation/hardhat/issues/1159#issuecomment-789310120

  // Create a Frame connection
  const ethProvider = require('eth-provider') // eth-provider is a simple EIP-1193 provider
  const frame = ethProvider('frame') // Connect to Frame

  // Use `getDeployTransaction` instead of `deploy` to return deployment data
  const waveContractFactory = await ethers.getContractFactory('WavePortal')
  const waveContract = await waveContractFactory.getDeployTransaction()

  // Set `tx.from` to current Frame account
  waveContract.from = (await frame.request({ method: 'eth_requestAccounts' }))[0]

  // Sign and send the transaction using Frame
  await frame.request({ method: 'eth_sendTransaction', params: [waveContract] })
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