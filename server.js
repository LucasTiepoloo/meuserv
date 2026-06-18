<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Mini API de Arquivos — 2DAT2</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
  <style>
    body { background: #f0f4f8; }
    .hero {
      background: linear-gradient(135deg, #1a3a5c 0%, #2e75b6 100%);
      color: #fff;
      padding: 2.5rem 2rem 2rem;
      border-radius: 0 0 1.5rem 1.5rem;
      margin-bottom: 2rem;
    }
    .card { border: none; border-radius: 1rem; box-shadow: 0 2px 12px rgba(0,0,0,.08); }
    .card-header { border-radius: 1rem 1rem 0 0 !important; font-weight: 600; font-size: 1.05rem; }
    .msg-item {
      background: #fff;
      border-left: 4px solid #2e75b6;
      border-radius: .5rem;
      padding: .6rem 1rem;
      margin-bottom: .5rem;
      font-size: .95rem;
    }
    .file-item {
      background: #fff;
      border-left: 4px solid #27ae60;
      border-radius: .5rem;
      padding: .5rem 1rem;
      margin-bottom: .4rem;
      font-family: monospace;
      font-size: .9rem;
      display: flex;
      justify-content: space-between;
    }
    .badge-size { background: #e8f5e9; color: #1b5e20; font-size: .78rem; padding: .2rem .6rem; border-radius: 999px; }
    #status-bar {
      position: fixed; bottom: 1rem; right: 1rem;
      min-width: 240px; z-index: 9999;
    }
    .spinner-border-sm { width: 1rem; height: 1rem; }
  </style>
</head>
<body>

<div class="hero text-center">
  <h1 class="fw-bold mb-1"><i class="bi bi-hdd-stack me-2"></i>Mini API de Arquivos</h1>
  <p class="mb-0 opacity-75">Backend 2DAT2 — Node.js + Express</p>
</div>

<div class="container pb-5" style="max-width:760px">

  <!-- Enviar mensagem -->
  <div class="card mb-4">
    <div class="card-header bg-primary text-white">
      <i class="bi bi-send me-2"></i>Enviar Mensagem
    </div>
    <div class="card-body">
      <div class="mb-3">
        <label class="form-label fw-semibold">Seu nome</label>
        <input id="autor" type="text" class="form-control" placeholder="Ex: João Silva" />
      </div>
      <div class="mb-3">
        <label class="form-label fw-semibold">Mensagem</label>
        <textarea id="texto" class="form-control" rows="3" placeholder="Digite sua mensagem..."></textarea>
      </div>
      <button class="btn btn-primary w-100" onclick="enviarMensagem()">
        <i class="bi bi-send-fill me-2"></i>Enviar
      </button>
    </div>
  </div>

  <!-- Histórico de mensagens -->
  <div class="card mb-4">
    <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
      <span><i class="bi bi-chat-left-text me-2"></i>Histórico de Mensagens</span>
      <button class="btn btn-sm btn-light" onclick="carregarMensagens()">
        <i class="bi bi-arrow-clockwise"></i> Atualizar
      </button>
    </div>
    <div class="card-body">
      <div id="mensagens">
        <p class="text-muted text-center py-3">Clique em Atualizar para carregar as mensagens.</p>
      </div>
    </div>
  </div>

  <!-- Arquivos na pasta -->
  <div class="card mb-4">
    <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
      <span><i class="bi bi-folder2-open me-2"></i>Arquivos na Pasta  /dados</span>
      <button class="btn btn-sm btn-light" onclick="carregarArquivos()">
        <i class="bi bi-arrow-clockwise"></i> Ver Arquivos
      </button>
    </div>
    <div class="card-body">
      <div id="arquivos">
        <p class="text-muted text-center py-3">Clique em "Ver Arquivos" para listar.</p>
      </div>
    </div>
  </div>

  <p class="text-center text-muted" style="font-size:.85rem">
    <i class="bi bi-info-circle me-1"></i>
    Este frontend está sendo servido pelo seu próprio servidor Node.js em <code>localhost:3000</code>
  </p>
</div>

<!-- Toast de status -->
<div id="status-bar"></div>

<script>
  function toast(msg, tipo = 'success') {
    const bar = document.getElementById('status-bar');
    const id = 'toast-' + Date.now();
    bar.innerHTML += `
      <div id="${id}" class="alert alert-${tipo} alert-dismissible fade show shadow" role="alert">
        ${msg}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>`;
    setTimeout(() => { const el = document.getElementById(id); if (el) el.remove(); }, 3500);
  }

  async function enviarMensagem() {
    const autor = document.getElementById('autor').value.trim();
    const texto = document.getElementById('texto').value.trim();
    if (!autor || !texto) { toast('<i class="bi bi-exclamation-triangle me-2"></i>Preencha nome e mensagem.', 'warning'); return; }

    try {
      const res = await fetch('/mensagem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autor, texto })
      });
      const data = await res.json();
      if (data.sucesso) {
        toast('<i class="bi bi-check-circle me-2"></i>Mensagem enviada!');
        document.getElementById('texto').value = '';
        carregarMensagens();
      } else {
        toast('<i class="bi bi-x-circle me-2"></i>Erro: ' + (data.erro || 'desconhecido'), 'danger');
      }
    } catch (e) {
      toast('<i class="bi bi-x-circle me-2"></i>Servidor não respondeu. Verifique se está rodando.', 'danger');
    }
  }

  async function carregarMensagens() {
    const el = document.getElementById('mensagens');
    el.innerHTML = '<div class="text-center py-3"><span class="spinner-border spinner-border-sm me-2"></span>Carregando...</div>';
    try {
      const res  = await fetch('/mensagem');
      const data = await res.json();
      if (!data.texto) {
        el.innerHTML = '<p class="text-muted text-center py-3">Nenhuma mensagem ainda. Seja o primeiro!</p>';
        return;
      }
      const linhas = data.texto.trim().split('\n').filter(Boolean).reverse();
      el.innerHTML = linhas.map(l => {
        const partes = l.split(': ');
        const autor  = partes.shift();
        const msg    = partes.join(': ');
        return `<div class="msg-item"><strong>${autor}</strong><span class="text-muted mx-2">›</span>${msg}</div>`;
      }).join('');
    } catch (e) {
      el.innerHTML = '<p class="text-danger text-center py-3"><i class="bi bi-x-circle me-2"></i>Erro ao carregar. Servidor rodando?</p>';
    }
  }

  async function carregarArquivos() {
    const el = document.getElementById('arquivos');
    el.innerHTML = '<div class="text-center py-3"><span class="spinner-border spinner-border-sm me-2"></span>Carregando...</div>';
    try {
      const res  = await fetch('/arquivos');
      const data = await res.json();
      if (!data.arquivos || data.arquivos.length === 0) {
        el.innerHTML = '<p class="text-muted text-center py-3">Nenhum arquivo na pasta ainda.</p>';
        return;
      }
      el.innerHTML = data.arquivos.map(f => {
        const kb = (f.tamanho / 1024).toFixed(1);
        return `<div class="file-item"><span><i class="bi bi-file-text me-2 text-success"></i>${f.nome}</span><span class="badge-size">${kb} KB</span></div>`;
      }).join('');
    } catch (e) {
      el.innerHTML = '<p class="text-danger text-center py-3"><i class="bi bi-x-circle me-2"></i>Erro ao carregar.</p>';
    }
  }

  // Carrega mensagens automaticamente ao abrir
  carregarMensagens();
</script>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
