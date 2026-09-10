const MAX_PROMPT_LENGTH = 1_200;
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
const WINDOW_MS = 12 * 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const THUMBNAIL_DIRECTION = `High-quality professional Fortnite thumbnail, no text, no logos.
Main subject: Realistic cutout seamlessly integrated with the scene's lighting. Subject close to the foreground. Direct eye contact with the camera. He is wearing a vibrant magenta T-shirt (#FF00FF); harsh shadows. He wears black fingerless gloves, with a texture consistent with the visual style of Fortnite. Facial shadows directed opposite to the rest of the scene. Decoupled facial lighting for high contrast. Soft facial shadows. Background: Fortnite 3D background, Unreal Engine 5, stunning clean render. Lighting & Composition: Perfect dynamic composition, dynamic off-center Dutch angle framing, rule of thirds, applied color theory. Color contrast. Format: YouTube thumbnail, 16:9 aspect ratio, clean render, no text, no logos, HD, High Quality.`;

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  const allowed = origin === env.ALLOWED_ORIGIN ? origin : env.ALLOWED_ORIGIN;
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

function json(request, env, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(request, env) }
  });
}

function readCookie(request, name) {
  const match = request.headers.get('Cookie')?.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function toBase64Url(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

async function visitorSignature(visitorId, secret) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  return toBase64Url(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(visitorId)));
}

async function getVisitor(request, env) {
  if (!env.VISITOR_COOKIE_SECRET) throw new Error('Falta la configuración de protección de visitantes.');
  const cookie = readCookie(request, 'nb_visitor');
  const [visitorId, signature] = cookie?.split('.') || [];
  if (visitorId && signature && signature === await visitorSignature(visitorId, env.VISITOR_COOKIE_SECRET)) {
    return { id: visitorId, cookie: null };
  }
  const id = crypto.randomUUID();
  const signed = `${id}.${await visitorSignature(id, env.VISITOR_COOKIE_SECRET)}`;
  return {
    id,
    cookie: `nb_visitor=${encodeURIComponent(signed)}; Max-Age=2592000; Path=/api/nano-banana; HttpOnly; Secure; SameSite=Lax`
  };
}

async function verifyTurnstile(token, request, env) {
  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET_KEY);
  form.append('response', token);
  form.append('remoteip', request.headers.get('CF-Connecting-IP') || '');
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST', body: form
  });
  const result = await response.json();
  return result.success && result.hostname === env.TURNSTILE_HOSTNAME;
}

function imagePart(data, mimeType) {
  if (!data) return null;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
    throw new Error('La referencia debe ser PNG, JPG o WEBP.');
  }
  if (Math.ceil(data.length * 0.75) > MAX_IMAGE_BYTES) {
    throw new Error('La imagen de referencia supera el límite de 6 MB.');
  }
  return { inline_data: { mime_type: mimeType, data } };
}

function fromBase64(data) {
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function imageExtension(mimeType) {
  return ({ 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/png': 'png' })[mimeType] || 'png';
}

async function fixedReferencePart(env) {
  const response = await fetch(env.REFERENCE_IMAGE_URL);
  if (!response.ok) throw new Error('No se pudo cargar la referencia visual.');
  const mimeType = response.headers.get('Content-Type')?.split(';')[0] || 'image/png';
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > MAX_IMAGE_BYTES) throw new Error('La referencia visual supera el límite permitido.');
  let binary = '';
  for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  return imagePart(btoa(binary), mimeType);
}

export class RateLimiter {
  constructor(state) { this.state = state; }

  async fetch() {
    const now = Date.now();
    let bucket = await this.state.storage.get('bucket');
    if (!bucket || bucket.resetAt <= now) bucket = { count: 0, resetAt: now + WINDOW_MS };
    if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
      return Response.json({ allowed: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) });
    }
    bucket.count += 1;
    await this.state.storage.put('bucket', bucket);
    return Response.json({ allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - bucket.count });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(request, env) });
    if (request.method === 'GET' && url.pathname === '/api/nano-banana/images') {
      const listing = await env.THUMBNAILS.list({ prefix: 'generated/', limit: 100 });
      const images = listing.objects.sort((a, b) => b.key.localeCompare(a.key)).map((object) => ({
        url: `${url.origin}/api/nano-banana/images/${object.key}`,
        created: object.uploaded
      }));
      return json(request, env, { images });
    }
    if (request.method === 'GET' && url.pathname.startsWith('/api/nano-banana/images/')) {
      const key = decodeURIComponent(url.pathname.slice('/api/nano-banana/images/'.length));
      const object = await env.THUMBNAILS.get(key);
      if (!object) return json(request, env, { error: 'Imagen no encontrada.' }, 404);
      return new Response(object.body, { headers: {
        'Content-Type': object.httpMetadata?.contentType || 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
        ...corsHeaders(request, env)
      } });
    }
    if (request.method !== 'POST') return json(request, env, { error: 'Método no permitido.' }, 405);
    if (request.headers.get('Origin') !== env.ALLOWED_ORIGIN) return json(request, env, { error: 'Origen no autorizado.' }, 403);

    try {
      const visitor = await getVisitor(request, env);
      const input = await request.json();
      if (typeof input.prompt !== 'string' || !input.prompt.trim() || input.prompt.length > MAX_PROMPT_LENGTH) {
        return json(request, env, { error: 'Escribe una instrucción de hasta 1,200 caracteres.' }, 400);
      }
      if (typeof input.turnstileToken !== 'string' || !(await verifyTurnstile(input.turnstileToken, request, env))) {
        return json(request, env, { error: 'No se pudo verificar la protección anti-bot. Inténtalo de nuevo.' }, 403);
      }

      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const [ipLimit, visitorLimit] = await Promise.all([ip, visitor.id].map(async (key) => {
        const limiter = env.RATE_LIMITER.get(env.RATE_LIMITER.idFromName(key));
        return (await limiter.fetch('https://rate-limiter/consume')).json();
      }));
      if (!ipLimit.allowed || !visitorLimit.allowed) {
        const retryAfter = Math.max(ipLimit.retryAfter || 0, visitorLimit.retryAfter || 0);
        return json(request, env, { error: `Límite alcanzado. Intenta de nuevo en ${retryAfter} segundos.` }, 429);
      }

      const parts = [
        { text: `${THUMBNAIL_DIRECTION}\n\nCreative direction from the visitor: ${input.prompt.trim()}` },
        await fixedReferencePart(env)
      ];
      const model = env.NANO_BANANA_MODEL || 'gemini-2.5-flash-image';
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { responseFormat: { image: { aspectRatio: '16:9' } } }
        })
      });
      const result = await response.json();
      if (!response.ok) return json(request, env, { error: result.error?.message || 'No se pudo generar la imagen.' }, 502);

      const part = result.candidates?.flatMap((candidate) => candidate.content?.parts || [])
        .find((candidate) => candidate.inlineData?.data || candidate.inline_data?.data);
      const image = part?.inlineData || part?.inline_data;
      if (!image?.data) return json(request, env, { error: 'La generación no devolvió una imagen.' }, 502);
      const mimeType = image.mimeType || image.mime_type || 'image/png';
      const key = `generated/${Date.now()}-${crypto.randomUUID()}.${imageExtension(mimeType)}`;
      await env.THUMBNAILS.put(key, fromBase64(image.data), { httpMetadata: { contentType: mimeType } });
      const output = json(request, env, { url: `${url.origin}/api/nano-banana/images/${key}` });
      if (visitor.cookie) output.headers.set('Set-Cookie', visitor.cookie);
      return output;
    } catch (error) {
      return json(request, env, { error: error.message || 'Error inesperado.' }, 500);
    }
  }
};
