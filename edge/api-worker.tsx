export interface Env {
  CACHE: KVNamespace;
  API_ORIGIN: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Edge caching for GET requests
    if (request.method === 'GET') {
      const cacheKey = `cache:${path}:${request.url}`;
      const cached = await env.CACHE.get(cacheKey);
      
      if (cached) {
        return new Response(cached, {
          headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'HIT',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }
    
    // Forward to origin
    const originUrl = `${env.API_ORIGIN}${path}${url.search}`;
    const originRequest = new Request(originUrl, request);
    
    const response = await fetch(originRequest);
    
    // Cache successful GET responses
    if (request.method === 'GET' && response.ok) {
      const cacheKey = `cache:${path}:${request.url}`;
      const clonedResponse = response.clone();
      const body = await clonedResponse.text();
      await env.CACHE.put(cacheKey, body, { expirationTtl: 3600 });
    }
    
    const modifiedResponse = new Response(response.body, response);
    modifiedResponse.headers.set('X-Cache', 'MISS');
    modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
    
    return modifiedResponse;
  },
};
