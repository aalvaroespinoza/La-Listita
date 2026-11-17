import { emojiFor, field, normalize, profileIds } from './domain';
interface Env { DB: D1Database; ASSETS: Fetcher }
const json = (data: unknown, status=200) => Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export default {
 async fetch(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
  try {
   if (request.method === 'GET' && url.pathname === '/api/state') {
    const results = await env.DB.batch([
     env.DB.prepare('SELECT i.*,p.name,p.emoji FROM items i JOIN products p ON p.id=i.product_id ORDER BY i.done,i.created_at DESC'),
     env.DB.prepare('SELECT * FROM products ORDER BY uses DESC,last_added DESC,name LIMIT 500')
    ]);
    return json({items:results[0].results,products:results[1].results});
   }
   if (!['POST','PATCH','DELETE'].includes(request.method)) return json({error:'No encontrado.'},404);
   if (request.headers.get('Origin') !== url.origin) return json({error:'Origen no permitido.'},403);
   if (!(request.headers.get('Content-Type') || '').startsWith('application/json')) return json({error:'Formato no válido.'},415);
   const raw = await request.text();
   if (raw.length > 2048) return json({error:'El texto es demasiado largo.'},413);
   const body = JSON.parse(raw);
   if (!body || typeof body !== 'object' || Array.isArray(body)) return json({error:'Datos no válidos.'},400);
   if (request.method === 'POST' && url.pathname === '/api/items') {
    const name=field(body.name,80,true), quantity=field(body.quantity ?? '',40), note=field(body.note ?? '',160);
    const profile=field(body.profile,20,true), id=field(body.id,60,true);
    if (!profileIds.includes(profile) || !/^[a-zA-Z0-9-]{1,60}$/.test(id)) return json({error:'Perfil o identificador no válido.'},400);
    const normalized=normalize(name), productId=crypto.randomUUID();
    // The request ledger keeps retries idempotent even after a purchased row is cleared.
    const result = await env.DB.batch([
     env.DB.prepare('INSERT OR IGNORE INTO products(id,name,normalized,emoji) VALUES(?,?,?,?)').bind(productId,name,normalized,emojiFor(name)),
     env.DB.prepare('INSERT OR IGNORE INTO items(id,product_id,profile_id,quantity,note) SELECT ?,id,?,?,? FROM products WHERE normalized=? AND NOT EXISTS(SELECT 1 FROM requests WHERE id=?)').bind(id,profile,quantity,note,normalized,id),
     env.DB.prepare("UPDATE products SET uses=uses+1,last_added=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE normalized=? AND changes()=1").bind(normalized),
     env.DB.prepare('INSERT OR IGNORE INTO requests(id) VALUES(?)').bind(id)
    ]);
    if (!result[1].meta.changes) {
     const existing=await env.DB.prepare('SELECT i.id FROM items i JOIN products p ON p.id=i.product_id WHERE p.normalized=? AND i.done=0').bind(normalized).first();
     return json({duplicate:true,existingId:existing?.id});
    }
    return json({id},201);
   }
   if (request.method === 'DELETE' && url.pathname === '/api/completed') {
    await env.DB.prepare('DELETE FROM items WHERE done=1').run(); return json({ok:true});
   }
   const match=url.pathname.match(/^\/api\/items\/([a-zA-Z0-9-]{1,60})$/);
   if (!match) return json({error:'No encontrado.'},404);
   if (request.method === 'DELETE') {await env.DB.prepare('DELETE FROM items WHERE id=?').bind(match[1]).run(); return json({ok:true});}
   if (request.method !== 'PATCH') return json({error:'No encontrado.'},404);
   if ('done' in body) {
    if (typeof body.done !== 'boolean') return json({error:'Estado no válido.'},400);
    await env.DB.prepare("UPDATE items SET done=?,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?").bind(Number(body.done),match[1]).run();
   } else {
    const quantity=field(body.quantity ?? '',40), note=field(body.note ?? '',160);
    await env.DB.prepare("UPDATE items SET quantity=?,note=?,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?").bind(quantity,note,match[1]).run();
   }
   return json({ok:true});
  } catch (error) {
   const message=String(error);
   if (message.includes('UNIQUE constraint')) return json({error:'Este producto ya está en pendientes.'},409);
   if (error instanceof SyntaxError || message.includes('Revisá los datos')) return json({error:'Revisá los datos del producto.'},400);
   console.error('API error',message);
   return json({error:'No pudimos guardar. Intentá de nuevo en un momento.'},503);
  }
 }
} satisfies ExportedHandler<Env>;
