import type {
  JwtPayload,
  JwtToken,
  Nonce,
  NonceEntry,
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

const NONCE_TTL_MS = 5 * 60 * 1000;


export class AuthService {
  #nonces = new Map<WalletAddress, NonceEntry>();

  createNonce(address: WalletAddress): Nonce {
    const nonce = crypto.randomUUID();
    this.#nonces.set(this.#normalize(address), {
      nonce,
      expiresAt: Date.now() + NONCE_TTL_MS,
    });

    return nonce;
  }

  verifyWallet({ address, signature }: VerifyWalletParams): JwtToken {
    const key = this.#normalize(address);
    const entry = this.#nonces.get(key);

    if (!entry) {
      throw new Error('Nonce not found');
    }

    const now = Date.now();

    if (entry.expiresAt < now) {
      this.#nonces.delete(key);
      throw new Error('Nonce expired');
    }

    const nonce = entry.nonce;
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
