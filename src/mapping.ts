import { BigInt, Address, log } from '@graphprotocol/graph-ts';
import { Transfer, NFT, Account } from '../generated/schema';
import { TransferSingle, TransferBatch } from '../generated/NFT/NFT';

function fetchAccount(id: string): Account {
  let account = Account.load(id);
  if (account == null) {
    account = new Account(id);
    account.address = id;
    account.save();
  }
  return account as Account;
}

function fetchNFT(id: string): NFT {
  let nft = NFT.load(id);
  if (nft == null) {
    nft = new NFT(id);
    nft.tokenId = BigInt.fromString(id);
    nft.minter = '0x0000000000000000000000000000000000000000';
    nft.owners = [];
    nft.values = [];
  }
  return nft as NFT;
}

export function handleTransferSingle(event: TransferSingle): void {
  let nft = fetchNFT(event.params.id.toString());
  let owners = nft.owners;
  let values = nft.values;
  let i = 0;

  // minted
  if (
    event.params.from.toHex() == '0x0000000000000000000000000000000000000000'
  ) {
    nft.minter = fetchAccount(event.params.to.toHex()).id;

    for (i = 0; i < owners.length; i++) {
      if (owners[i] == event.params.to.toHex()) {
        break;
      }
    }
    if(i == owners.length) {
      owners.push(fetchAccount(event.params.to.toHex()).id);
      values.push(BigInt.fromString('0'));
    }
    
    let val = values[i];
    val = val.plus(event.params.value);
    values[i] = val;
  }
  // transfered
  else {
    for (i = 0; i < owners.length; i++) {
      if (owners[i] == event.params.from.toHex()) {
        break;
      }
    }
    let val = values[i];
    val = val.minus(event.params.value);
    values[i] = val;

    for (i = 0; i < owners.length; i++) {
      if (owners[i] == event.params.to.toHex()) {
        break;
      }
    }
    if(i == owners.length) {
      owners.push(fetchAccount(event.params.to.toHex()).id);
      values.push(BigInt.fromString('0'));
    }
    
    val = values[i];
    val = val.plus(event.params.value);
    values[i] = val;
  }
  nft.owners = owners;
  nft.values = values;
  nft.save();

  let ts = new Transfer(event.transaction.hash.toHex());
  ts.timestamp = event.block.timestamp;
  ts.blockNumber = event.block.number;
  ts.operator = fetchAccount(event.params.operator.toHex()).id;
  ts.from = fetchAccount(event.params.from.toHex()).id;
  ts.to = fetchAccount(event.params.to.toHex()).id;
  ts.tokenId = event.params.id;
  ts.value = event.params.value;
  ts.save();
}

export function handleTransferBatch(event: TransferBatch): void {
  for (let k = 0; k < event.params.ids.length; k++) {
    let nft = fetchNFT(event.params.ids[k].toString());
    let owners = nft.owners;
    let values = nft.values;
    let i = 0;

    // minted
    if (
      event.params.from.toHex() == '0x0000000000000000000000000000000000000000'
    ) {
      nft.minter = fetchAccount(event.params.to.toHex()).id;
      for (i = 0; i < owners.length; i++) {
        if (owners[i] == event.params.to.toHex()) {
          break;
        }
      }
      if(i == owners.length) {
        owners.push(fetchAccount(event.params.to.toHex()).id);
        values.push(BigInt.fromString('0'));
      }

      let val = values[i];
      val = val.plus(event.params.values[k]);
      values[i] = val;
    }
    // transfered
    else {
      for (i = 0; i < owners.length; i++) {
        if (owners[i] == event.params.from.toHex()) {
          break;
        }
      }
      let val = values[i];
      val = val.minus(event.params.values[k]);
      values[i] = val;
      for (i = 0; i < owners.length; i++) {
        if (owners[i] == event.params.to.toHex()) {
          break;
        }
      }
      if(i == owners.length) {
        owners.push(fetchAccount(event.params.to.toHex()).id);
        values.push(BigInt.fromString('0'));
      }
      val = values[i];
      val = val.plus(event.params.values[k]);
      values[i] = val;
    }
    nft.owners = owners;
    nft.values = values;
    nft.save();

    let ts = new Transfer(event.transaction.hash.toHex());
    ts.timestamp = event.block.timestamp;
    ts.blockNumber = event.block.number;

    ts.operator = fetchAccount(event.params.operator.toHex()).id;
    ts.from = fetchAccount(event.params.from.toHex()).id;
    ts.to = fetchAccount(event.params.to.toHex()).id;
    ts.tokenId = event.params.ids[k];
    ts.value = event.params.values[k];
    ts.save();
  }
}
