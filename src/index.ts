import { verifyMessage } from 'ethers';
import jwt from 'jsonwebtoken';

const nonces = new Map<string, string>();

function createNonce(): string {
  return crypto.randomUUID();
}

function createJwt(address: string): string {
  return jwt.sign(
    {
      sub: address.toLowerCase(),
    },
    JWT_SECRET,
    {
      expiresIn: '7d',
    },
  );
}

function getBearerToken(req: Request): string | null {
  const auth = req.headers.get('authorization');

  if (!auth?.startsWith('Bearer ')) {
    return null;
  }

  return auth.slice(7);
}

const server = Bun.serve({
  port: 3000,

  async fetch(req) {
    const url = new URL(req.url);

    // ----------------------------
    // GET /auth/nonce
    // ----------------------------
    if (req.method === 'GET' && url.pathname === '/auth/nonce') {
      const address = url.searchParams.get('address');

      if (!address) {
        return Response.json(
          {
            error: 'address is required',
          },
          {
            status: 400,
          },
        );
      }

      const nonce = createNonce();

      nonces.set(address.toLowerCase(), nonce);

      return Response.json({
        nonce,
      });
    }

    // ----------------------------
    // POST /auth/verify
    // ----------------------------
    if (req.method === 'POST' && url.pathname === '/auth/verify') {
      try {
        const body = await req.json();

        const { address, signature } = body;

        if (!address || !signature) {
          return Response.json(
            {
              error: 'address and signature required',
            },
            {
              status: 400,
            },
          );
        }

        const nonce = nonces.get(address.toLowerCase());

        if (!nonce) {
          return Response.json(
            {
              error: 'nonce not found',
            },
            {
              status: 400,
            },
          );
        }

        const message = `Pulsar Login\n\nNonce: ${nonce}`;

        const recoveredAddress = verifyMessage(message, signature);

        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
          return Response.json(
            {
              error: 'invalid signature',
            },
            {
              status: 401,
            },
          );
        }

        nonces.delete(address.toLowerCase());

        const token = createJwt(address);

        return Response.json({
          token,
          address,
        });
      } catch (error) {
        console.error(error);

        return Response.json(
          {
            error: 'verification failed',
          },
          {
            status: 500,
          },
        );
      }
    }

    // ----------------------------
    // GET /auth/me
    // ----------------------------
    if (req.method === 'GET' && url.pathname === '/auth/me') {
      const token = getBearerToken(req);

      if (!token) {
        return Response.json(
          {
            error: 'unauthorized',
          },
          {
            status: 401,
          },
        );
      }

      try {
        const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

        return Response.json({
          address: payload.sub,
        });
      } catch {
        return Response.json(
          {
            error: 'invalid token',
          },
          {
            status: 401,
          },
        );
      }
    }

    return Response.json(
      {
        error: 'not found',
      },
      {
        status: 404,
      },
    );
  },
});

console.log(`🚀 Pulsar Server started on http://localhost:${server.port}`);
