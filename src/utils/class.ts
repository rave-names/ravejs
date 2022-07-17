import { RaveName }                                                          from '../types.d';
import { providers, Contract, Signer, utils, BigNumber, constants }          from 'ethers';
import { raveabi, externalabi }                                              from '../abis';
import { log }                                                               from './logging';
import { contracts }                                                         from './contracts';

function s(x: any) {
  return x.toString();
}

type RestartOptions = {
  provider?: any;
  address?: any;
}

export type Record = {
  key: string;
  value: string | null;
}

export class Rave {
  contract!: Contract;
  address!: string;
  externalRegistry!: string;
  externalContract!: Contract;

  constructor(
    address: string = '0x6A403FFbBF8545EE0d99a63A72e5f335dFCaE2Bd',
    provider: providers.Provider = (new providers.JsonRpcProvider('https://rpc.ftm.tools')),
    externalRegistry: string = '0xaFa8da49b9c30AFDaf80A2DF5d01b36814c6d1ac',
  ) {
    this.contract = new Contract(address, raveabi, provider);
    this.address = address;
    this.externalRegistry = externalRegistry;
    this.externalContract = new Contract(externalRegistry, externalabi, provider);
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
  public async resolveNameToAddress(name: RaveName): Promise<string> {
    let isOwned = await this.contract.functions.isOwnedByMapping(name.name.toUpperCase());
    let resolution = await this.contract.functions.getOwnerOfName(name.name.toUpperCase());
    if (isOwned) return resolution[0];
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
   public async resolveStringToAddress(name: string): Promise<string> {
     let isOwned = await this.contract.functions.isOwnedByMapping(name.toUpperCase());
     let resolution = await this.contract.functions.getOwnerOfName(name.toUpperCase());
     if (isOwned) return resolution[0];
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
   public async registerName(name: string, signer: Signer, price: number) {
     let contract = new Contract(this.address, raveabi, signer);
     let transaction = await contract.functions.registerName(name.toUpperCase(), { value: utils.parseEther(s(price)) });
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
   public async reverse(address: string): Promise<RaveName> {
     const name = (await this.contract.functions.getNameFromOwner(address))[0];
     const avatar = (await this.contract.functions.getAvatar(name))[0];
     const addresses = await this.contract.functions.getAttrLink(name);


     if (name == '') {
       var zeroName: RaveName = {
         name: '',
         isOwned: false,
       }
       return zeroName;
     }

     let addresses_parsed;
     try {
       addresses_parsed = JSON.parse(addresses)
     } catch (e) {
       addresses_parsed = {
         ftm: address
       }
     }

     const resolvedName: RaveName = {
       name: name.toLowerCase(),
       isOwned: true,
       owner: address,
       avatar: avatar,
       addresses: addresses_parsed,
     }

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
   public async reverseToName(address: string): Promise<string | null> {
     const name = (await this.contract.functions.getNameFromOwner(address))[0].toLowerCase();

     if (name == '') return null; // return null if name doesnt exist

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
   public restart(options: RestartOptions): boolean {
     if (options.provider) {
       this.contract = new Contract((options.address || this.address), raveabi, options.provider);
       return true;
     } else {
       log("No options");
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
   public async getPrice(): Promise<BigNumber> {
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
   public async owns(address: string): Promise<boolean> {
     log(address);

     if (address === constants.AddressZero) return false; // zero address cant be owner

     const name = (await this.contract.functions.getNameFromOwner(address))[0].toLowerCase();

     if (name.length === 0) {
       return false;
     } else {
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
   public async getText(name: string, key: string): Promise<string | null> {
     log(name); log(key);

     let value = null;

     try {
       value = (await this.externalContract.getText(name.toUpperCase(), key));
     } catch (e) { throw e };

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
   public async getTexts(name: string): Promise<Record[] | null> {
     log(name);

     const records = (await this.externalContract.getRecords(name.toUpperCase()));

     let resolvedRecords: Record[] = [];
     for (let key = 0; key < records.length; key++) {
       const value = (await this.externalContract.getText(name.toUpperCase(), records[key]));
       resolvedRecords.push({key: records[key], value: (value || null)} as Record);
     }

     return resolvedRecords || null;
   }
}
