import { RaveName }                                               from '../types.d';
import { providers, Contract, Signer, utils, BigNumber }          from 'ethers';
import { raveabi }                                                from '../abis/Rave.abi';
import { log }                                                    from './logging';
import { contracts }                                              from './contracts';

function s(x: any) {
  return x.toString();
}

type RestartOptions = {
  provider?: any;
  address?: any;
}

export class Rave {
  contract!: Contract;
  address!: string;

  constructor(
    address: string = '0x6A403FFbBF8545EE0d99a63A72e5f335dFCaE2Bd',
    provider: providers.Provider = (new providers.JsonRpcProvider('https://rpc.ftm.tools'))
  ) {
    this.contract = new Contract(address, raveabi, provider);
    this.address = address;
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

     const resolvedName: RaveName = {
       name: name.toLowerCase(),
       isOwned: true,
       owner: address,
       avatar: avatar,
       addresses: JSON.parse(addresses),
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
}
