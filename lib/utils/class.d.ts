import { RaveName } from '../types.d';
import { providers, Contract, Signer, BigNumber } from 'ethers';
type RestartOptions = {
    provider?: any;
    address?: any;
};
export type Record = {
    key: string;
    value: string | null;
};
export declare class Rave {
    contract: Contract;
    address: string;
    externalRegistry: string;
    externalContract: Contract;
    v: boolean;
    constructor(address?: string, provider?: providers.Provider, externalRegistry?: string, version?: boolean);
    /**
     * Depracated - use `resolve(string)`
     * ===========================================================================
     *
     * #### `async` function
     * @param name - Name to resolve (RaveName type)
     * @returns Owner of `name` or the zero address if the name is unowned
     *
     */
    resolveNameToAddress(name: RaveName): Promise<string>;
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
    resolve(name: string): Promise<string>;
    /**
     * # Depracated - use `resolve()`
     * @param name The name to resolve
     * @returns The resolved address
     */
    resolveStringToAddress(name: string): Promise<string>;
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
    registerName(name: string, signer: Signer, price: number): Promise<any>;
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
    reverse(address: string, index?: number): Promise<RaveName>;
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
    reverseToName(address: string, index?: number): Promise<string | null>;
    /**
     * restart
     * ===========================================================================
     * Re-init the contract, for customisation on the fly
     *
     * @param options.provider ethers provider to use
     * @param options.address the address of the Rave contract
     *
     */
    restart(options: RestartOptions): boolean;
    /**
     * getPrice
     * ===========================================================================
     * Get the price of minting a name
     *
     * @returns The price of a name
     *
     */
    getPrice(): Promise<BigNumber>;
    /**
     * owns
     * ===========================================================================
     * Returns if an address holds a name
     *
     * @returns If the address owns a name
     */
    owns(address: string): Promise<boolean>;
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
    getText(name: string, key: string): Promise<string | null>;
    /**
     * getTexts
     * ===========================================================================
     * Returns the text records of a name
     *
     * @param name The name
     *
     * @returns All the text records of the name, in form Record[]
     */
    getTexts(name: string): Promise<Record[] | null>;
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
    isOwned(name: string): Promise<boolean>;
}
export {};
