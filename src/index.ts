import { AuthService } from './auth/auth.service';

const authService = new AuthService();

const server = Bun.serve({
  port: 3000,

  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === 'POST' && url.pathname === '/auth/nonce') {
      const body = await req.json();
      
      //@ts-ignore
      const nonce = authService.createNonce(body.address);

      return Response.json({
        nonce,
      });
    }

    return new Response('Not found', {
      status: 404,
    });
  },
});

console.log(`🚀 Pulsar Server started on http://localhost:${server.port}`);
