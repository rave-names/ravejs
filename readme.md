# ![rave.js](https://fns-old.fantoms.art/rave.js.png)

Integrate Rave Names to it's fullest potential in your apps!

### rave.js is under development and is subject to change!

## Installation

```sh
npm i @rave-names/rave
# or with yarn
yarn install @rave-names/rave
```

## Getting Started

You're almost there! All you need to do now is create a Rave instance!

```js
import { Rave } from '@rave-names/rave';

const rave = new Rave();
```

This will initialize a Fantom mainnet instance of Rave using [rpc.ftm.tools](https://rpc.ftm.tools). To customize this, you can initialize rave like this:

```js
import { Rave } from '@rave-names/rave';
import { providers } from 'ethers';

const YOUR_PROVIDER = new providers.JsonRpcProvider('RPC_URL'); //JSON-RPC provider
const YOUR_RAVE_ADDRESS = "0x0000000000000000000000000000000000000000"; //Rave Names contract address
const YOUR_TEXT_RECORD_REGISTRY = "0x0000000000000000000000000000000000000001"; // Custom text registry

const rave = new Rave(YOUR_RAVE_ADDRESS,YOUR_PROVIDER,YOUR_TEXT_RECORD_REGISTRY);
```

## The `RaveName` type
The RaveName type is used globally across rave.js, and represents a name with its attributes.
```ts
type RaveName = {
  name: string;
  isOwned: boolean;
  owner?: string;
  avatar?: string;
  addresses?: object;
};
```

## Write Transactions

Some functions are write transactions and require a Signer to execute them.

## Functions
What rave.js can do!

### `resolveNameToAddress(name)`

Gets the address that owns `name`.

Input:

- `name`: RaveName type
  - The RaveName object that you want to query the name of.

Output:

- `address`: string
  - Resolved address. If `address` is 0x0000000000000000000000000000000000000000, that means the name isn't owned.

### `resolveStringToAddress(name)`

Gets the address that owns `name`.

Input:

- `name`: string
  - Target name

Output:

- `owner`: string
  - Owner of the name.

### `reverse(address)`

Reverse searches the address to get a fully-populated RaveName object.

Input:

- `address`: string
  - Target address

Output:

- `ravename`: RaveName
  - Matching records from input
  - `name`: string
    - The name owned by `address`
  - `isOwned`: boolean

  - `owner`: string
    - The address passed, or null if the name is unowned
  - `avatar`: sting
    - The avatar link for the name
  - `addresses`: string
    - Multichain addresses

### `reverseToName(address)`

Reverse searches the address to get only the name (not the avatar, etc.)

Input:

- `address`: string

Output:

- `name`: string

### `restart(options)`

Allows you to modify the provider and address for the contract.

```js
type RestartOptions = {
  provider?: any;
  address?: any;
}
```

Input:

- `options`: RestartOptions
  - `provider`: any
    - The new provider
  - `address`: any
    - The new contract address


### `getPrice()`

Gets the price in parsed ether to register 1 Rave Name.

Output:

- `price` number
  - The price of 1 Rave Name.

### `owns()`

Check if an address owns a Rave Name.

Input:

- `address` string
  - The address

Output:

- `owns` boolean
  - If the address owns a name.

### `getText()`

Get the external registry value assigned to a name.

Input:

 - `name` string
   - The name to lookup
 - `key` string
   - The key of the record you want to find

Output:

  - `record` string | null
    - The record

### `getTexts()`

Get the external registry values assigned to a name.

Input:

 - `name` string
   - The name to lookup

Output:

 - `records` Record[]
   - The records

### `isOwned()`

Check if an address owns a Rave Name.

Input:

  - `name` string

Output:

  - `owned` boolean
    - If the name is owned.

## The utilities

### Contracts
An object of the official Rave Names contract address for chains.
```ts
const contracts = {
  250: ["0x6A403FFbBF8545EE0d99a63A72e5f335dFCaE2Bd", 'https://rpc.ftm.tools'],
  "0xFA": ["0x6A403FFbBF8545EE0d99a63A72e5f335dFCaE2Bd", 'https://rpc.ftm.tools'],
  "Fantom": ["0x6A403FFbBF8545EE0d99a63A72e5f335dFCaE2Bd", 'https://rpc.ftm.tools'],
  "FTM": ["0x6A403FFbBF8545EE0d99a63A72e5f335dFCaE2Bd", 'https://rpc.ftm.tools'],
}
```

### exampleName
An example RaveName object for you to play around with.

```ts
const exampleName: RaveName = {
  name: 'z.ftm',
  isOwned: true,
  owner: '0x3e522051a9b1958aa1e828ac24afba4a551df37d',
  avatar: 'https://cyber.fantoms.art/Opr.png',
  addresses: JSON.parse(addys),
}
```


## Thanks for reading!
