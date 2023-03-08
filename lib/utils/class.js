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
    constructor(address = '0x14Ffd1Fa75491595c6FD22De8218738525892101', provider = new ethers_1.providers.JsonRpcProvider('https://rpc.ftm.tools'), externalRegistry = '0xaFa8da49b9c30AFDaf80A2DF5d01b36814c6d1ac', version = true) {
        this.v = version;
        this.contract = version ? new ethers_1.Contract(address, abis_1.raveabi, provider) : new ethers_1.Contract(address, abis_1.ravev1abi, provider);
        this.address = address;
        // console.log(color('WARNING: RaveV2 does not support external registries yet!', index['yellow'], true));
        this.externalRegistry = externalRegistry;
        this.externalContract = new ethers_1.Contract(externalRegistry, abis_1.externalabi, provider);
    }
    /**
     * Depracated - use `resolve(string)`
     * ===========================================================================
     *
     * #### `async` function
     * @param name - Name to resolve (RaveName type)
     * @returns Owner of `name` or the zero address if the name is unowned
     *
     */
    async resolveNameToAddress(name) {
        return this.resolve(name.name);
    }
    /**
     * Resolve
     * ===========================================================================
     * ### Find the address that a name resolves to
     *
     * #### `async` function
     * @param name - Name to resolve
     * @returns Owner of `name` or the zero address if the name is unowned
     *
     */
    async resolve(name) {
        if (!this.v) {
            // ravev1
            const isOwned = await this.contract.functions.isOwnedByMapping(name.toUpperCase());
            const resolution = await this.contract.functions.getOwnerOfName(name.toUpperCase());
            if (isOwned)
                return resolution[0];
            return Promise.resolve('0x0000000000000000000000000000000000000000');
        }
        else {
            const isOwned = await this.contract.functions.owned(name);
            const resolution = await this.contract.functions.getOwner(name);
            const isNotPlaceHolder = resolution.toLowerCase() === '0x98FEF8Da2e27984092B00D8d351b1e625B7E0492'.toLowerCase();
            if (isOwned && isNotPlaceHolder)
                return resolution[0];
            return Promise.resolve('0x0000000000000000000000000000000000000000');
        }
    }
    /**
     * # Depracated - use `resolve()`
     * @param name The name to resolve
     * @returns The resolved address
     */
    async resolveStringToAddress(name) {
        return this.resolve(name);
    }
    /**
     * registerName
     * ===========================================================================
     * ### Register a name
     *
     * @param name Name to register
     * @param signer An ethers signer to execute the transaction
     * @param price The price of a name (in FTM)
     *
     * @returns The transaction's object as given by ethers
     */
    async registerName(name, signer, price) {
        const contract = new ethers_1.Contract(this.address, this.v ? abis_1.raveabi : abis_1.ravev1abi, signer);
        const transaction = await contract.functions.registerName(name.toUpperCase(), { value: ethers_1.utils.parseEther(s(price)) });
        return transaction;
    }
    /**
     * reverse
     * ===========================================================================
     * ### Get all info of an addresses name
     *
     * @param address The owner address
     * @param index The index of the name (default: 0)
     *
     * @returns A RaveName of the resolved data
     *
     */
    async reverse(address, index = 0) {
        if (!this.v) {
            // ravev1
            const name = (await this.contract.functions.getNameFromOwner(address))[0];
            const avatar = (await this.contract.functions.getAvatar(name))[0];
            const addresses = await this.contract.functions.getAttrLink(name);
            if (name === '') {
                const zeroName = {
                    name: '',
                    isOwned: false,
                };
                return zeroName;
            }
            let addressesParsed;
            try {
                addressesParsed = JSON.parse(addresses);
            }
            catch (e) {
                addressesParsed = {
                    ftm: address,
                };
            }
            const resolvedName = {
                name: name.toLowerCase(),
                isOwned: true,
                owner: address,
                avatar,
                addresses: addressesParsed,
            };
            return resolvedName;
        }
        else {
            const name = (await this.contract.functions.getName(address, index))[0];
            const avatar = (await this.contract.functions.getAvatar(name))[0];
            const addresses = await this.contract.functions.getAddresses(name);
            if (name === '') {
                const zeroName = {
                    name: '',
                    isOwned: false,
                };
                return zeroName;
            }
            let addressesParsed;
            try {
                addressesParsed = JSON.parse(addresses);
            }
            catch (e) {
                addressesParsed = {
                    ftm: address,
                };
            }
            const resolvedName = {
                name: name.toLowerCase(),
                isOwned: true,
                owner: address,
                avatar,
                addresses: addressesParsed,
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
     * @param address the address
     * @param index the index of the name
     *
     * @returns the name of index `index` owned by `address`
     */
    async reverseToName(address, index = 0) {
        if (!this.v) {
            // ravev1
            const name = (await this.contract.functions.getNameFromOwner(address))[0].toLowerCase();
            if (name === '')
                return null; // return null if name doesnt exist
            return name;
        }
        else {
            if (typeof index === 'undefined')
                throw new Error('No index value for RaveV2 call');
            const name = (await this.contract.functions.getName(address, index))[0];
            if (name === '')
                return null; // return null if name doesnt exist
            return name;
        }
    }
    /**
     * restart
     * ===========================================================================
     * Re-init the contract, for customisation on the fly
     *
     * @param options.provider ethers provider to use
     * @param options.address the address of the Rave contract
     *
     */
    restart(options) {
        if (options.provider) {
            this.contract = new ethers_1.Contract(options.address || this.address, this.v ? abis_1.raveabi : abis_1.ravev1abi, options.provider);
            return true;
        }
        else {
            (0, logging_1.log)('No options');
            return false;
        }
    }
    /**
     * getPrice
     * ===========================================================================
     * Get the price of minting a name
     *
     * @returns The price of a name
     *
     */
    async getPrice() {
        return !this.v ? (await this.contract.FEE_AMT())[0] : (await this.contract.price())[0];
    }
    /**
     * owns
     * ===========================================================================
     * Returns if an address holds a name
     *
     * @returns If the address owns a name
     */
    async owns(address) {
        if (!this.v) {
            // ravev1
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
            return (await this.contract.functions.balanceOf(address)) !== 0;
        }
    }
    /**
     * getText
     * ===========================================================================
     * Returns the text record of a name
     *
     * @param name The name to look up
     * @param key The text record key to search for
     *
     *
     * @returns The text record
     */
    async getText(name, key) {
        (0, logging_1.log)(name);
        (0, logging_1.log)(key);
        let value = null;
        try {
            value = await this.externalContract.getText(name.toUpperCase(), key);
        }
        catch (e) {
            throw e;
        }
        return value;
    }
    /**
     * getTexts
     * ===========================================================================
     * Returns the text records of a name
     *
     * @param name The name
     *
     * @returns All the text records of the name, in form Record[]
     */
    async getTexts(name) {
        (0, logging_1.log)(name);
        const records = await this.externalContract.getRecords(name.toUpperCase());
        const resolvedRecords = [];
        // tslint:disable-next-line
        for (let key = 0; key < records.length; key++) {
            const value = await this.externalContract.getText(name.toUpperCase(), records[key]);
            resolvedRecords.push({ key: records[key], value: value || null });
        }
        return resolvedRecords || null;
    }
    /**
     * isOwned
     * ===========================================================================
     * Returns if a name is owned
     *
     * @param name The name to lookup
     *
     * @returns If the name is owned
     *
     */
    async isOwned(name) {
        (0, logging_1.log)(name);
        const isOwned = this.v
            ? await this.contract.functions.owned(name)
            : await this.contract.functions.isOwnedByMapping(name.toUpperCase());
        return isOwned;
    }
}
exports.Rave = Rave;
