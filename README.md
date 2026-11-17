# La Listita

Lista de compras compartida para cinco perfiles. Los avatares identifican a quien agrega cada producto. Cualquiera que tenga el enlace puede acceder y editar la lista.

## Desarrollo local

```powershell
npm ci
npm test
npm run build
npm run db:local
npm run preview
```

Abrí http://127.0.0.1:8787. Para probar la API con una lista local vacía, ejecutá `node tests/api.integration.mjs` en otra terminal.

## Publicación en Cloudflare

1. Iniciá sesión con `npx wrangler login` en la cuenta elegida, con permisos de Workers y D1.
2. Creá la base con `npx wrangler d1 create listita` y copiá su ID en `wrangler.json`.
3. Ejecutá `npm run db:remote` y luego `npm run deploy`.
4. Compartí la URL HTTPS que muestra Wrangler. Desde Safari en iPhone, elegí **Compartir → Agregar a inicio**.
