// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import { StringUtils } from "./libraries/StringUtils.sol";
import { Base64 } from "./libraries/Base64.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Domains is ERC721URIStorage  {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    string public tld;

    uint256 public price;

    address public owner;

    bool isPaused;

    // SVG for NFT images on chain
    string svgPartOne = '<svg xmlns="http://www.w3.org/2000/svg" width="270" height="270" fill="none"><path fill="url(#a)" d="M0 0h270v270H0z"/><defs><filter id="b" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse" height="270" width="270"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity=".225" width="200%" height="200%"/></filter></defs><path d="m143.756 72.81-7.519-7.579c-.405-3.229-2.505-13.96-12.895-20.23a.955.955 0 0 0-.14-.075 86.006 86.006 0 0 0-1.385-3.769 2.34 2.34 0 0 0-3.51-1.054c-.18.131-1.016.716-2.025 1.6-2.734-1.325-10.639-4.785-21.304-6.375a7.98 7.98 0 0 0-2.325-1.645c-2.78-1.305-7.915-1.665-13.939 1.245a4.23 4.23 0 0 0-.615.36c-13.841-2.67-26.28-2.905-36.98-.685-9.161 1.9-17.125 5.595-23.66 10.98C3.105 57.36 0 73.575 0 76.95c0 5.396 3.09 9.105 4.68 10.654-2.749 13.235-2.216 21.529-2.179 21.956a2.34 2.34 0 0 0 2.335 2.165h14.97a2.34 2.34 0 0 0 2.34-2.34c0-2.321-.675-4.005-1.53-5.175a207.605 207.605 0 0 0 7.339-8.8c.6 4.14 1.905 9.815 4.766 15.09a2.34 2.34 0 0 0 2.055 1.22h17.471a2.34 2.34 0 0 0 2.335-2.486 17.127 17.127 0 0 0-.941-4.399c-1.045-2.861-2.61-4.2-4.05-4.81v-8.194c4.875-.086 9.979-.645 14.535-2.066.33 10.354 3.185 19.77 3.349 20.299a2.34 2.34 0 0 0 2.235 1.65h17.471a2.34 2.34 0 0 0 2.34-2.246c.015-.326.075-3.214-1.98-5.355-.59-.619-1.515-1.32-2.861-1.725.495-3.139 2.13-8.014 4.474-13.185a92.599 92.599 0 0 1 1.095-2.325c3.17 6.28 9.755 18.064 16.905 23.58 1.054.821 2.381 1.256 3.8 1.256h13.66a2.34 2.34 0 0 0 2.34-2.385c-.06-2.82-1.92-6.96-6.765-7.271-1.645-1.8-5.111-10.691-7.729-18.956 2.64.3 4.976.66 6.566 1.08 7.19 1.905 15.06 2.546 15.39 2.565a2.34 2.34 0 0 0 2.055-.93l7.485-9.979a2.34 2.34 0 0 0-.21-3.05zm-27.105-24.6c.465-.78 1.19-1.585 1.935-2.295.375 1.065.77 2.265 1.054 3.315-.619.495-1.86 1.215-3.29 1.92-.12-1.145-.086-2.31.3-2.95zM15.585 102.825c-.555.605-.87 1.414-.63 2.205.225.765.72 1.325 1.485 1.545.09.06.274.195.465.476h-9.78c.011-1.369.06-3.36.274-5.875.39-4.68 1.41-12.195 4.03-21.375.21-.72.75-1.335 1.444-1.635 2.625-1.115 7.835-2.715 12.72-3.6 7.2-1.305 9.07-.289 9.345-.095-.015 5.25-11.87 20.175-19.35 28.354zm20.625 4.23c-3.334-6.88-3.945-14.441-4.06-16.845 2.79.64 7.45 1.34 12.765 1.571v10.125a2.34 2.34 0 0 0 2.34 2.34c1.085 0 1.785 1.41 2.19 2.805H36.21zM66.33 71.88a585.325 585.325 0 0 1-1.395 7.095c-.39 1.905-.63 3.87-.746 5.854-9.48 3.525-22.89 2.365-29.4 1.145 4.825-7.505 4.825-10.399 4.825-11.52 0-1.62-.76-3.011-2.13-3.915-5.575-3.679-22.23 1.519-26.45 3.32a7.194 7.194 0 0 0-4.11 4.655 135.045 135.045 0 0 0-.889 3.274c-.735-1.27-1.355-2.91-1.355-4.845 0-2.441 2.73-17.085 15.72-27.77 12.81-10.545 31.105-13.815 54.39-9.75-3.21 6.195-5.644 17.805-8.471 32.45zm13.53 32.595a2.34 2.34 0 0 0 2.34 2.265c.645 0 1.159.105 1.545.315H71.494c-1.175-4.46-4.05-17.1-1.98-27.135.435-2.1.904-4.55 1.41-7.155 1.294-6.72 2.905-15.09 4.725-21.821 2.78-10.271 4.71-11.645 5.07-11.82 3.645-1.755 7.725-2.26 9.93-1.22.941.44 1.5 1.129 1.76 2.175.255 1.02.69 2.415 1.185 4.02 2.16 6.964 6.66 21.465 1.93 26.195-6.975 6.975-15.9 26.45-15.66 34.17zm39.77 2.265c.645 0 1.095.12 1.429.315h-10.105c-.375 0-.716-.095-.945-.274-7.714-5.955-15.184-21.06-17.029-24.96 2.235.086 8.42.341 14.441.825.109.37 1.785 5.816 3.859 11.355 4.02 10.714 6.04 12.75 8.345 12.75zm13.89-24.761c-2.475-.255-8.145-.945-13.29-2.305-5.464-1.444-18.135-2.16-24.386-2.441 1.035-1.46 2.04-2.689 2.981-3.63 6.724-6.724 2.04-21.855-.765-30.889-.255-.821-.491-1.575-.69-2.246 7.13 1.385 12.701 3.56 15.57 4.84a10.92 10.92 0 0 0-.304.491c-2.006 3.334-.54 8.415-.225 9.405a2.34 2.34 0 0 0 3.109 1.455 50.43 50.43 0 0 0 4.12-1.935c1.85-.99 3.585-2.085 4.385-3.425 3.425 3.041 5.325 6.72 6.365 9.69 0 .06 0 .12.011.191.105 1.016-1.29 3.791-2.595 5.64a2.34 2.34 0 0 0 3.821 2.7 26.965 26.965 0 0 0 .904-1.369l6.47 6.525-5.49 7.32z" fill="#fff"/><defs><linearGradient id="a" x1="0" y1="0" x2="270" y2="270" gradientUnits="userSpaceOnUse"><stop stop-color="#FFF"/><stop offset="1" stop-opacity=".99"/></linearGradient></defs><text x="32.5" y="231" font-size="27" fill="#fff" filter="url(#b)" font-family="sans-serif,Noto Color Emoji, Apple Color Emoji" font-weight="bold">';
    string svgPartTwo = '</text></svg>';

    mapping(string => address) public domains;
    mapping(string => string) public twitter;

    constructor( uint256 _price) payable ERC721("Panda Name Service", "PNS") {
        tld = "panda";
        price = _price;
        owner = msg.sender;
        isPaused = true;
    }


    function updatePrice(uint256 newPrice) public payable {
        require(msg.sender == owner, "Only owner can change price");
        price = newPrice;
    }

    function register(string calldata name) public payable {
        require(!isPaused, "Contract is paused.");
        require(domains[name] == address(0), "Name already registered"); // Avoid to register a name already taken
        require(StringUtils.strlen(name) > 0, "Impossible to register this name");// Avoid to register a empty name
        require(msg.value >= price, "Not enough Matic paid");// Avoid to pay less than require

        // Combine the name passed into the function  with the TLD
        string memory _name = string(abi.encodePacked(name, ".", tld));
        // Create the SVG (image) for the NFT with the name
        string memory finalSvg = string(abi.encodePacked(svgPartOne, _name, svgPartTwo));
        uint256 newRecordId = _tokenIds.current();
        uint256 length = StringUtils.strlen(name);
        string memory strLen = Strings.toString(length);

        string memory json = Base64.encode(
            abi.encodePacked(
                '{"name": "',
                _name,
                '", "description": "A domain on the Panda name service", "image": "data:image/svg+xml;base64,',
                Base64.encode(bytes(finalSvg)),
                '","length":"',
                strLen,
                '"}'
            )
        );

        string memory finalTokenUri = string( abi.encodePacked("data:application/json;base64,", json));
        _safeMint(msg.sender, newRecordId);
        _setTokenURI(newRecordId, finalTokenUri);
        domains[name] = msg.sender;

        _tokenIds.increment();
    }

    function changeAddress(string calldata name, address newAddress) public {
        require(!isPaused, "Contract is paused.");
        require(domains[name] == msg.sender, "Only actual owner can change address");
        domains[name] = newAddress;
    }

    function getAddress(string calldata name) public view returns (address) {
        return domains[name];
    }

    function setTwitter(string calldata name, string calldata record) public {
        require(!isPaused, "Contract is paused.");
        require(domains[name] == msg.sender, "Only actual owner can set record");
        twitter[name] = record;
    }

    function getTwitter(string calldata name) public view returns(string memory) {
        return twitter[name];
    }

    function changeIsPausedStatus() public {
        require(msg.sender == owner, "Only actual owner can modify isPaused status");
        if (isPaused) {
            isPaused = false;
        } else {
            isPaused = true;
        }
    }
}
