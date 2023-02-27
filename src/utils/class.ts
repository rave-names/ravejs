import { RaveName }                                                          from '../types.d';
import { providers, Contract, Signer, utils, BigNumber, constants }          from 'ethers';
import { raveabi, externalabi, ravev1abi }                                   from '../abis';
import { log }                                                               from './logging';
import { contracts }                                                         from './contracts';
import { color, index }                                                      from './colors';

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
  v!: boolean;

  constructor(
    address: string = '0x14Ffd1Fa75491595c6FD22De8218738525892101',
    provider: providers.Provider = (new providers.JsonRpcProvider('https://rpc.ftm.tools')),
    externalRegistry: string = '0xaFa8da49b9c30AFDaf80A2DF5d01b36814c6d1ac',
    version: boolean = true,
  ) {
    this.v = version;
    if (version) {
      this.contract = new Contract(address, raveabi, provider);
    } else {
      this.contract = new Contract(address, ravev1abi, provider);
    }
    this.address = address;
    console.log(color('WARNING: RaveV2 does not support external registries yet!', index['yellow'], true));
    this.externalRegistry = externalRegistry;
    this.externalContract = new Contract(externalRegistry, externalabi, provider);
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
  public async resolveNameToAddress(name: RaveName): Promise<string> {
    return this.resolve(name.name)
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
   public async resolve(name: string): Promise<string> {
     if (!this.v) { // ravev1
       let isOwned = await this.contract.functions.isOwnedByMapping(name.toUpperCase());
       let resolution = await this.contract.functions.getOwnerOfName(name.toUpperCase());
       if (isOwned) return resolution[0];
       return Promise.resolve('0x0000000000000000000000000000000000000000');
     } else {
       let isOwned = await this.contract.functions.owned(name);
       let resolution = await this.contract.functions.getOwner(name);
       const isNotPlaceHolder = resolution.toLowerCase() === "0x98FEF8Da2e27984092B00D8d351b1e625B7E0492".toLowerCase()
       if (isOwned && isNotPlaceHolder) return resolution[0];
       return Promise.resolve('0x0000000000000000000000000000000000000000');
     }
   }

   /**
    * # Depracated - use `resolve()`
    * @param name The name to resolve
    * @returns The resolved address
    */
   public async resolveStringToAddress(name: string): Promise<string> {
    return await this.resolve(name);
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
   public async registerName(name: string, signer: Signer, price: number): Promise<any> {
     let contract = new Contract(this.address, (this.v ? raveabi : ravev1abi), signer);
     let transaction = await contract.functions.registerName(name.toUpperCase(), { value: utils.parseEther(s(price)) });
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
   public async reverse(address: string, index: number = 0): Promise<RaveName> {
      if (!this.v) { //ravev1
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
     } else {
       const name = (await this.contract.functions.getName(address, index))[0];
       const avatar = (await this.contract.functions.getAvatar(name))[0];
       const addresses = await this.contract.functions.getAddresses(name);

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
   public async reverseToName(address: string, index: number = 0): Promise<string | null> {
     if (!this.v) { // ravev1
       const name = (await this.contract.functions.getNameFromOwner(address))[0].toLowerCase();

       if (name == '') return null; // return null if name doesnt exist

       return name;
     } else {
       if (typeof index === 'undefined') throw new Error('No index value for RaveV2 call');
       const name = (await this.contract.functions.getName(address, index))[0];

       if (name == '') return null; // return null if name doesnt exist

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
   public restart(options: RestartOptions): boolean {
     if (options.provider) {
       this.contract = new Contract((options.address || this.address), (this.v ? raveabi : ravev1abi), options.provider);
       return true;
     } else {
       log("No options");
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
   public async getPrice(): Promise<BigNumber> {
      return (!this.v) ? ((await this.contract.FEE_AMT())[0]) : ((await this.contract.price())[0]);
   }

   /**
   * owns
   * ===========================================================================
   * Returns if an address holds a name
   *
   * @returns If the address owns a name
   */
   public async owns(address: string): Promise<boolean> {
      if (!this.v) { // ravev1
       log(address);

       if (address === constants.AddressZero) return false; // zero address cant be owner

       const name = (await this.contract.functions.getNameFromOwner(address))[0].toLowerCase();

       if (name.length === 0) {
         return false;
       } else {
         return true;
       }
     } else {
       log(address);

       if (address === constants.AddressZero) return false; // zero address cant be owner

       return (await this.contract.functions.balanceOf(address)) != 0;
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
   * @param name The name
   * 
   * @returns All the text records of the name, in form Record[]
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
   public async isOwned(name: string): Promise<boolean> {
     log(name)

     let isOwned = this.v ? (await this.contract.functions.owned(name)) : (await this.contract.functions.isOwnedByMapping(name.toUpperCase()));

     return isOwned;
   }
}
