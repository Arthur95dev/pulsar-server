export type WalletAddress = string;
export type Signature = string;
export type JwtToken = string;
export type Nonce = string;

export interface NonceEntry {
  nonce: Nonce;
  expiresAt: number;
}

export interface JwtPayload {
  sub: WalletAddress;
  iat: number;
  exp: number;
}

export interface VerifyWalletParams {
  address: WalletAddress;
  signature: Signature;
}
