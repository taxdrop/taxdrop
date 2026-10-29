// TaxDrop — comportamento mínimo do site (v4). Tudo funciona sem JS; isto só melhora.
(function () {
  document.documentElement.classList.add('js');

  // Fio na barra só depois que a página rola
  var barra = document.querySelector('.barra');
  if (barra) {
    var marcar = function () { barra.classList.toggle('rolou', window.scrollY > 8); };
    window.addEventListener('scroll', marcar, { passive: true });
    marcar();
  }

  // Página de agradecimento da enquete: mostra só a linha da resposta escolhida (?r=…). Não guarda nem envia nada.
  var resposta = new URLSearchParams(window.location.search).get('r');
  if (resposta && /^[a-z-]{1,40}$/.test(resposta)) {
    document.querySelectorAll('[data-r]').forEach(function (el) {
      if (el.getAttribute('data-r') === resposta) el.hidden = false;
    });
  }

  // Inscrição no Kit: tenta sem sair da página; se não der, envia o formulário normalmente.
  document.querySelectorAll('form[data-kit]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      if (form.dataset.enviando === 'nativo') return;
      e.preventDefault();
      var botao = form.querySelector('button[type="submit"]');
      var retorno = form.querySelector('.retorno');
      if (botao) { botao.disabled = true; botao.textContent = 'Enviando…'; }
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .then(function (dados) {
          if (!dados || dados.status !== 'success') throw new Error('sem sucesso');
          form.querySelectorAll('.campo, .atividade, .miuda').forEach(function (el) { el.hidden = true; });
          if (retorno) { retorno.hidden = false; retorno.focus(); }
        })
        .catch(function () {
          form.dataset.enviando = 'nativo';
          form.submit();
        });
    });
  });
})();
