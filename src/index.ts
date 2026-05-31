const server = Bun.serve({
  port: 3000,

  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === '/') {
      return new Response('Pulsar Server is running 🚀');
    }

    return new Response('Not found', { status: 404 });
  },
});

console.log(`🚀 Pulsar server started on http://localhost:${server.port}`);
