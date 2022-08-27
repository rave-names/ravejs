"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rave = void 0;
const ethers_1 = require("ethers");
const abis_1 = require("../abis");
const logging_1 = require("./logging");
const colors_1 = require("./colors");
function s(x) {
    return x.toString();
}
class Rave {
    constructor(address = '0x14Ffd1Fa75491595c6FD22De8218738525892101', provider = (new ethers_1.providers.JsonRpcProvider('https://rpc.ftm.tools')), externalRegistry = '0xaFa8da49b9c30AFDaf80A2DF5d01b36814c6d1ac', version = true) {
        this.v = version;
        if (version) {
            this.contract = new ethers_1.Contract(address, abis_1.raveabi, provider);
        }
        else {
            this.contract = new ethers_1.Contract(address, abis_1.ravev1abi, provider);
        }
        this.address = address;
        console.log((0, colors_1.color)('WARNING: RaveV2 does not support external registries yet!', colors_1.index['yellow'], true));
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
        if (!this.v) { // ravev1
            let isOwned = await this.contract.functions.isOwnedByMapping(name.name.toUpperCase());
            let resolution = await this.contract.functions.getOwnerOfName(name.name.toUpperCase());
            if (isOwned)
                return resolution[0];
            return Promise.resolve('0x0000000000000000000000000000000000000000');
        }
        else {
            let isOwned = await this.contract.functions.owned(name.name);
            let resolution = await this.contract.functions.getOwner(name.name);
            if (isOwned)
                return resolution[0];
            return Promise.resolve('0x0000000000000000000000000000000000000000');
        }
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
        if (!this.v) { // ravev1
            let isOwned = await this.contract.functions.isOwnedByMapping(name.toUpperCase());
            let resolution = await this.contract.functions.getOwnerOfName(name.toUpperCase());
            if (isOwned)
                return resolution[0];
            return Promise.resolve('0x0000000000000000000000000000000000000000');
        }
        else {
            let isOwned = await this.contract.functions.owned(name);
            let resolution = await this.contract.functions.getOwner(name);
            if (isOwned)
                return resolution[0];
            return Promise.resolve('0x0000000000000000000000000000000000000000');
        }
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
        let contract = new ethers_1.Contract(this.address, (this.v ? abis_1.raveabi : abis_1.ravev1abi), signer);
        let transaction = await contract.functions.registerName(name.toUpperCase(), { value: ethers_1.utils.parseEther(s(price)) });
        return transaction;
    }
    /**
    * reverse
    * ===========================================================================
    * Get all info of a name
    *
    * %async%
    * [inputs]
    *  => {address} : string; (Name to find the owner address of)
    *  => {index = 0} : number; (Index of name)
    *
    * [returns]
    *  => {name} : RaveName; (RaveName type, containing everything)
    */
    async reverse(address, index = 0) {
        if (!this.v) { //ravev1
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
        else {
            if (typeof index === 'undefined')
                throw new Error('No index value for RaveV2 call');
            const name = (await this.contract.functions.getName(address, index))[0];
            const avatar = (await this.contract.functions.getAvatar(name))[0];
            const addresses = await this.contract.functions.getAddresses(name);
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
    *  => {index = 0} : {number} (Index of the name)
    *
    * [returns]
    *  => {name} : string; (The name)
    */
    async reverseToName(address, index = 0) {
        if (!this.v) { // ravev1
            const name = (await this.contract.functions.getNameFromOwner(address))[0].toLowerCase();
            if (name == '')
                return null; // return null if name doesnt exist
            return name;
        }
        else {
            if (typeof index === 'undefined')
                throw new Error('No index value for RaveV2 call');
            const name = (await this.contract.functions.getName(address, index))[0];
            if (name == '')
                return null; // return null if name doesnt exist
            return name;
        }
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
            this.contract = new ethers_1.Contract((options.address || this.address), (this.v ? abis_1.raveabi : abis_1.ravev1abi), options.provider);
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
        return (!this.v) ? ((await this.contract.FEE_AMT())[0]) : ((await this.contract.price())[0]);
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
        if (!this.v) { // ravev1
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
        else {
            (0, logging_1.log)(address);
            if (address === ethers_1.constants.AddressZero)
                return false; // zero address cant be owner
            return (await this.contract.functions.balanceOf(address)) != 0;
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
    /**
    * isOwned
    * ===========================================================================
    * Returns if a name is owned
    *
    * [inputs]
    *  => {name} : string; (The name)
    *
    * [returns]
    *  => {owned} : bool; (isOwned)
    */
    async isOwned(name) {
        (0, logging_1.log)(name);
        let isOwned = this.v ? (await this.contract.functions.owned(name)) : (await this.contract.functions.isOwnedByMapping(name.toUpperCase()));
        return isOwned;
    }
}
exports.Rave = Rave;
