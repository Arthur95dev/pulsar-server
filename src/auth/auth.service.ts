import type {
  JwtPayload,
  JwtToken,
  Nonce,
  VerifyWalletParams,
  WalletAddress,
} from './auth.types.ts';
import jwt from 'jsonwebtoken';
import { verifyMessage } from 'ethers';

const JWT_SECRET =
  process.env.JWT_SECRET ??
  (() => {
    throw new Error('JWT_SECRET is not configured');
  })();

export class AuthService {
  #nonces = new Map<WalletAddress, Nonce>();

  createNonce(address: WalletAddress): Nonce {
    const nonce = crypto.randomUUID();
    this.#nonces.set(this.#normalize(address), nonce);
    return nonce;
  }

  verifyWallet({ address, signature }: VerifyWalletParams): JwtToken {
    const key = this.#normalize(address);
    const nonce = this.#nonces.get(key);

    if (!nonce) {
      throw new Error('Nonce not found');
    }

    const message = `Pulsar Login\n\nNonce: ${nonce}`;

    const recovered = verifyMessage(message, signature);

    if (this.#normalize(recovered) !== key) {
      throw new Error('Invalid signature');
    }

    this.#nonces.delete(key);

    return this.#createJwt(key);
  }

  verifyJwt(token: JwtToken): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  }

  #createJwt(address: WalletAddress): JwtToken {
    return jwt.sign(
      {
        sub: address,
      },
      JWT_SECRET,
      {
        expiresIn: '7d',
      },
    );
  }

  #normalize(address: WalletAddress): WalletAddress {
    return address.toLowerCase();
  }
}
