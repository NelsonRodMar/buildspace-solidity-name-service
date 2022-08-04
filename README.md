# Build a Domain Service App with Solidity on Polygon - [Buildspace Course](https://buildspace.so/p/CO1f8c72fd-67a3-4f99-90b8-79879c5da1eb)

### **Basic solidity contract !**

This project is a basic contract to learn Solidity.
This contract let you pay some native currency to register a domain service as ER721, but to mint you need to validate the captcha before
The NFT generated will have the domain name and a picture of a panda
Only the owner of the contract can change the price
Only the owner of the contract can withdraw the funds
The contract use Ownable and Pausable OpenZeppelin contracts
> 📇The contract is deployed on Goerli : [0x4b6702765facc6a5411bc9cf2307462bf217281e](https://goerli.etherscan.io/address/0x4b6702765facc6a5411bc9cf2307462bf217281e) <br />
> 🌐 The front is avaible at this address [ens-algoz.nelsonrodmar.surge.sh](http://ens-algoz.nelsonrodmar.surge.sh/).

### **Environement variables contract**

* `URL_ALCHEMY=` : Used for deployement if you work with [Alchemy](https://www.alchemy.com/)
* `URL_POKT=` : Called for deployement if you want to used [Pokt](https://www.pokt.network/) as a node provider
* `ETHERSCAN_API_KEY=` : To verify the contract on [Etherscan](https://hardhat.org/hardhat-runner/plugins/nomiclabs-hardhat-etherscan)

### **Environement variables front**

* `REACT_APP_SITE_KEY=` : Used for [Algoz](https://algoz.xyz/)
* `REACT_APP_APPLICATION_ID=` : Used for [Algoz](https://algoz.xyz/)
