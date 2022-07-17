"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rave = void 0;
const ethers_1 = require("ethers");
const abis_1 = require("../abis");
const logging_1 = require("./logging");
function s(x) {
    return x.toString();
}
class Rave {
    constructor(address = '0x6A403FFbBF8545EE0d99a63A72e5f335dFCaE2Bd', provider = (new ethers_1.providers.JsonRpcProvider('https://rpc.ftm.tools')), externalRegistry = '0xaFa8da49b9c30AFDaf80A2DF5d01b36814c6d1ac') {
        this.contract = new ethers_1.Contract(address, abis_1.raveabi, provider);
        this.address = address;
        this.externalRegistry = externalRegistry;
        this.externalContract = new ethers_1.Contract(externalRegistry, abis_1.externalabi, provider);
    }
    /**
     * resolveNameToAddress
     * ===========================================================================
     * Find the address that a name resolves to
     *
     * %async%
     * [inputs]
     *  => {name} : RaveName; (Name to find the owner address of)
     *
     * [returns]
     *  => {address} : string; (Owner of name or zero address if resolution isnt a string)
     *
     */
    async resolveNameToAddress(name) {
        let isOwned = await this.contract.functions.isOwnedByMapping(name.name.toUpperCase());
        let resolution = await this.contract.functions.getOwnerOfName(name.name.toUpperCase());
        if (isOwned)
            return resolution[0];
        return Promise.resolve('0x0000000000000000000000000000000000000000');
    }
    /**
     * resolveStringToAddress
     * ===========================================================================
     * Find the address that a name resolves to
     *
     * %async%
     * [inputs]
     *  => {name} : string; (Name to find the owner address of)
     *
     * [returns]
     *  => {address} : string; (Owner of name or zero address if resolution isnt a string)
     *
     */
    async resolveStringToAddress(name) {
        let isOwned = await this.contract.functions.isOwnedByMapping(name.toUpperCase());
        let resolution = await this.contract.functions.getOwnerOfName(name.toUpperCase());
        if (isOwned)
            return resolution[0];
        return Promise.resolve('0x0000000000000000000000000000000000000000');
    }
    /**
    * registerName
    * ===========================================================================
    * Register a name
    *
    * %async%
    * [inputs]
    *  => {name} : string; (Name to find the owner address of)
    *  => {signer} : Signer; (Signer to execute the transaction)
    *  => {price} : number; (Price to pay to register a name, in Fantom)
    *
    */
    async registerName(name, signer, price) {
        let contract = new ethers_1.Contract(this.address, abis_1.raveabi, signer);
        let transaction = await contract.functions.registerName(name.toUpperCase(), { value: ethers_1.utils.parseEther(s(price)) });
    }
    /**
    * reverse
    * ===========================================================================
    * Get all info of a name
    *
    * %async%
    * [inputs]
    *  => {address} : string; (Name to find the owner address of)
    *
    * [returns]
    *  => {name} : RaveName; (RaveName type, containing everything)
    */
    async reverse(address) {
        const name = (await this.contract.functions.getNameFromOwner(address))[0];
        const avatar = (await this.contract.functions.getAvatar(name))[0];
        const addresses = await this.contract.functions.getAttrLink(name);
        if (name == '') {
            var zeroName = {
                name: '',
                isOwned: false,
            };
            return zeroName;
        }
        let addresses_parsed;
        try {
            addresses_parsed = JSON.parse(addresses);
        }
        catch (e) {
            addresses_parsed = {
                ftm: address
            };
        }
        const resolvedName = {
            name: name.toLowerCase(),
            isOwned: true,
            owner: address,
            avatar: avatar,
            addresses: addresses_parsed,
        };
        return resolvedName;
    }
    /**
    * reverseToName
    * ===========================================================================
    * Get only the owned by an address, made for faster resolution, especially
    * when RPCs are slow
    *
    * %async%
    * [inputs]
    *  => {address} : string; (Name to find the owner address of)
    *
    * [returns]
    *  => {name} : string; (The name)
    */
    async reverseToName(address) {
        const name = (await this.contract.functions.getNameFromOwner(address))[0].toLowerCase();
        if (name == '')
            return null; // return null if name doesnt exist
        return name;
    }
    /**
    * restart
    * ===========================================================================
    * Re-init the contract, for customisation on the fly
    *
    * [inputs]
    *  => {options} : object;
    *    -> {provider?} : ethers.Provider; (provider to use)
    *    -> {address?} : string; (The address of the new rave contract)
    *
    */
    restart(options) {
        if (options.provider) {
            this.contract = new ethers_1.Contract((options.address || this.address), abis_1.raveabi, options.provider);
            return true;
        }
        else {
            (0, logging_1.log)("No options");
            return false;
        }
    }
    /**
    * getPrice
    * ===========================================================================
    * get the price of minting a name
    * [returns]
    *  => {price} : number; (The price)
    */
    async getPrice() {
        return (await this.contract.FEE_AMT())[0];
    }
    /**
    * owns
    * ===========================================================================
    * Returns if an address holds a name
    *
    * [returns]
    *  => {owms} : boolean; (If the name is owned)
    */
    async owns(address) {
        (0, logging_1.log)(address);
        if (address === ethers_1.constants.AddressZero)
            return false; // zero address cant be owner
        const name = (await this.contract.functions.getNameFromOwner(address))[0].toLowerCase();
        if (name.length === 0) {
            return false;
        }
        else {
            return true;
        }
    }
    /**
    * getText
    * ===========================================================================
    * Returns the text record of a name
    *
    * [inputs]
    *  => {name} : string; (The name)
    *  => {key} : string; (The key to search for)
    *
    * [returns]
    *  => {record} : string | null; (The record)
    */
    async getText(name, key) {
        (0, logging_1.log)(name);
        (0, logging_1.log)(key);
        let value = null;
        try {
            value = (await this.externalContract.getText(name.toUpperCase(), key));
        }
        catch (e) {
            throw e;
        }
        ;
        return value;
    }
    /**
    * getTexts
    * ===========================================================================
    * Returns the text records of a name
    *
    * [inputs]
    *  => {name} : string; (The name)
    *
    * [returns]
    *  => {records} : string[]; (The records)
    */
    async getTexts(name) {
        (0, logging_1.log)(name);
        const records = (await this.externalContract.getRecords(name.toUpperCase()));
        let resolvedRecords = [];
        for (let key = 0; key < records.length; key++) {
            const value = (await this.externalContract.getText(name.toUpperCase(), records[key]));
            resolvedRecords.push({ key: records[key], value: (value || null) });
        }
        return resolvedRecords || null;
    }
}
exports.Rave = Rave;
