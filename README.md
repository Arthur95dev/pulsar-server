# Pulsar Server

Backend server for the Pulsar decentralized messaging network.

## Overview

Pulsar Server is the core backend responsible for:

* Wallet-based authentication (Ethereum / Web3)
* Signature verification (EIP-191)
* WebSocket real-time messaging
* User session management (JWT)
* Network coordination layer for future decentralized nodes

## Architecture

```
pulsar-web     → frontend client (Angular)
pulsar-server  → backend (Bun + TypeScript)
pulsar-core    → cryptographic & networking layer (Rust, planned)
```

## Current Features (MVP)

* Wallet login via signature verification
* Nonce-based authentication
* JWT session issuance
* Basic HTTP API

## Planned Features

* WebSocket messaging gateway
* End-to-end encryption (X25519 + ChaCha20-Poly1305)
* Distributed relay nodes
* P2P messaging layer
* Message persistence layer

## Tech Stack

* Bun
* TypeScript
* ethers.js
* JSON Web Tokens

## License

MIT

