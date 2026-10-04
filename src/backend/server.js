import http from 'node:http';
import crypto from 'node:crypto';

const PORT = process.env.PORT || 3001;
const unlockTokens = new Map();

function jsonResponse(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 20_000) reject(new Error('Payload muito grande.'));
    });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); } catch { reject(new Error('JSON inválido.')); }
    });
  });
}

async function handleUnlockRequest(req, res) {
  const data = await readJson(req);
  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  const generic = { message: 'Se o endereço estiver cadastrado, enviaremos um link de desbloqueio.' };
  if (!email || !process.env.ADMIN_EMAIL || email !== process.env.ADMIN_EMAIL.trim().toLowerCase()) {
    jsonResponse(res, 200, generic);
    return;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 15 * 60 * 1000;
  unlockTokens.set(crypto.createHash('sha256').update(token).digest('hex'), expiresAt);
  const baseUrl = process.env.PUBLIC_APP_URL || `http://localhost:${PORT}`;
  const link = `${baseUrl}/admin?unlock=${token}`;

  if (process.env.ADMIN_UNLOCK_WEBHOOK_URL) {
    await fetch(process.env.ADMIN_UNLOCK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: email, subject: 'Desbloqueio do painel Nova Bll do Brasil', text: `Use este link uma única vez e em até 15 minutos: ${link}` }),
    });
  }
  jsonResponse(res, 200, generic);
}

function handleUnlock(req, res, url) {
  const token = url.searchParams.get('token') || '';
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = unlockTokens.get(hash);
  unlockTokens.delete(hash);
  if (!expiresAt || expiresAt < Date.now()) {
    jsonResponse(res, 400, { message: 'Link inválido ou expirado.' });
    return;
  }
  jsonResponse(res, 200, { message: 'Desbloqueio autorizado.' });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'POST' && url.pathname === '/api/admin/unlock-request') {
    handleUnlockRequest(req, res).catch(() => jsonResponse(res, 200, { message: 'Se o endereço estiver cadastrado, enviaremos um link de desbloqueio.' }));
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/admin/unlock') {
    handleUnlock(req, res, url);
    return;
  }

  if (req.method !== 'POST' || url.pathname !== '/api/contato') {
    jsonResponse(res, 404, { message: 'Rota não encontrada.' });
    return;
  }

  let body = '';

  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    try {
      const data = JSON.parse(body || '{}');

      if (!data.nome || !data.email || !data.telefone) {
        jsonResponse(res, 400, { message: 'Preencha nome, e-mail e telefone.' });
        return;
      }

      console.log('Novo contato recebido:', data);

      jsonResponse(res, 200, {
          message: 'Mensagem recebida com sucesso! Em breve entraremos em contato.',
          data,
        });
    } catch {
      jsonResponse(res, 400, { message: 'JSON inválido.' });
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Backend do formulário rodando em http://127.0.0.1:${PORT}`);
});
