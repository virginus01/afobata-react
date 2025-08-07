import { fetchDataWithConditions, upsert } from '@/app/api/database/mongodb';
import { generateWalletId } from '@/app/helpers/generateWalletId';
import * as bitcoin from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import { get_site_info } from '@/api/brand/brand';
import { encrypt } from '@/app/api/helper';
import { bcy_deposit_webhook } from '@/api/crypto/deposit_webhook';
import * as ecc from '@bitcoinerlab/secp256k1';
import { mode } from '@/app/src/constants';
import { invalid_response } from '@/app/helpers/invalid_response';
import { api_response } from '@/app/helpers/api_response';
import { isNull } from '@/app/helpers/isNull';
const ECPair = ECPairFactory(ecc);

export async function server_createcrypto_wallet({ data, context }: { data: any; context: any }) {
  try {
    const siteInfo = await get_site_info(context);

    if (
      [
        isNull(data.brandId),
        isNull(data.type),
        isNull(data.userId),
        isNull(data.currency),
      ].includes(true)
    ) {
      console.error('some fielts are missing in create wallet');
      return invalid_response('try again', 200);
    }

    const id = generateWalletId({
      brandId: data.brandId!,
      identifier: data.type!,
      userId: data.userId,
      currency: data.currency,
    });

    const [existingWallet] = await fetchDataWithConditions('wallets', { id });

    if (existingWallet) {
      return invalid_response('wallet already exist', 200);
    }

    let walletDetails = generateSegwitBitcoinWallet(
      mode === 'test' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin,
    );

    const encryptedPrivateKey = await encrypt(walletDetails.privateKey);

    const address = walletDetails.segwitAddress;

    const hookRes = await bcy_deposit_webhook({ address: address! });

    const walletData = {
      id,
      currency: data.currency,
      brandId: data.brandId!,
      identifier: data.type,
      userId: data.userId,
      address: address!,
      legacyAddress: walletDetails.legacyAddress,
      nestedSegwitAddress: walletDetails.nestedSegwitAddress,
      privateKey: encryptedPrivateKey,
      publicKey: walletDetails.publicKey,
      webhook: hookRes,
    };

    const response = await upsert(walletData, 'wallets', true, siteInfo);

    return api_response({
      status: true,
      data: response,
      msg: 'wallet created successfully',
    });
  } catch (error) {
    console.error(error);
    return invalid_response('error creating wallet');
  }
}

export function generateSegwitBitcoinWallet(network = bitcoin.networks.bitcoin) {
  // Generate a random key pair
  const keyPair = ECPair.makeRandom({ network });

  // Get private key in WIF format
  const privateKey = keyPair.toWIF();

  // Generate P2PKH address
  const { address } = bitcoin.payments.p2pkh({
    pubkey: keyPair.publicKey,
    network,
  });

  // Generate P2WPKH (Native SegWit) address
  const p2wpkh = bitcoin.payments.p2wpkh({
    pubkey: keyPair.publicKey,
    network,
  });

  // Generate P2SH-P2WPKH (Nested SegWit) address
  const p2sh = bitcoin.payments.p2sh({
    redeem: p2wpkh,
    network,
  });

  const walletDetails = {
    privateKey,
    publicKey: keyPair.publicKey.toString(),
    legacyAddress: address, // P2PKH address (legacy)
    segwitAddress: p2wpkh.address, // Native SegWit address (starts with tb1)
    nestedSegwitAddress: p2sh.address, // Nested SegWit address
  };

  return walletDetails;
}
