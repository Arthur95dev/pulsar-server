export type WalletAddress = string;
export type Signature = string;
export type JwtToken = string;
export type Nonce = string;

export interface JwtPayload {
  sub: string;
}

export interface VerifyWalletParams {
  address: WalletAddress;
  signature: Signature;
}