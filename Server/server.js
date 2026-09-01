/* ==========================================================
   BeHealthier - script.js
   Cada bloco só roda na página que tem os elementos certos
   (por isso os "if" no começo de cada bloco)
   ========================================================== */

   /*alterar quando trocar de maquina e baixar o node_modules*/
const API_URL = 'http://localhost:3000/api';

/* ---------- 1. Menu hambúrguer (todas as páginas) ---------- */
const menuToggle = document.getElementById('menuToggle');
const navbar = document.getElementById('navbar');
const navLinksEls = document.querySelectorAll('#navLinks a');

if (menuToggle && navbar) {
    function toggleMenu(forceState) {
        const isOpen = navbar.classList.toggle('open', forceState);
        menuToggle.classList.toggle('active', isOpen);
        menuToggle.setAttribute('aria-expanded', isOpen);
    }

    menuToggle.addEventListener('click', () => toggleMenu());

    navLinksEls.forEach(link => {
        link.addEventListener('click', () => toggleMenu(false));
    });

    document.addEventListener('click', (e) => {
        const clickedOutside = !navbar.contains(e.target) && !menuToggle.contains(e.target);
        if (navbar.classList.contains('open') && clickedOutside) {
            toggleMenu(false);
        }
    });
}

/* ---------- 2. Login / Cadastro (login.html) ---------- */
const loginCard = document.getElementById('loginCard');

if (loginCard) {
    const toCadastro = document.getElementById('toCadastro');
    const toLogin = document.getElementById('toLogin');
    const formLogin = document.getElementById('formLogin');
    const formCadastro = document.getElementById('formCadastro');

    toCadastro.addEventListener('click', (e) => {
        e.preventDefault();
        loginCard.classList.add('flipped');
    });

    toLogin.addEventListener('click', (e) => {
        e.preventDefault();
        loginCard.classList.remove('flipped');
    });

    function mostrarMensagem(elemento, texto, tipo) {
        elemento.textContent = texto;
        elemento.className = `mensagem ${tipo}`;
    }

    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const usuario = document.getElementById('usuario').value;
        const senha = document.getElementById('senha').value;
        const mensagemEl = document.getElementById('mensagemLogin');

        try {
            const resposta = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario, senha })
            });
            const dados = await resposta.json();

            if (!resposta.ok) {
                mostrarMensagem(mensagemEl, dados.erro, 'erro');
                return;
            }

            mostrarMensagem(mensagemEl, dados.mensagem, 'sucesso');
        } catch (err) {
            mostrarMensagem(mensagemEl, 'Não foi possível conectar ao servidor.', 'erro');
        }
    });

    formCadastro.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome').value;
        const senha = document.getElementById('senhaCadastro').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;
        const mensagemEl = document.getElementById('mensagemCadastro');

        if (senha !== confirmarSenha) {
            mostrarMensagem(mensagemEl, 'As senhas não coincidem.', 'erro');
            return;
        }

        try {
            const resposta = await fetch(`${API_URL}/cadastro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, senha })
            });
            const dados = await resposta.json();

            if (!resposta.ok) {
                mostrarMensagem(mensagemEl, dados.erro, 'erro');
                return;
            }

            mostrarMensagem(mensagemEl, dados.mensagem, 'sucesso');
            formCadastro.reset();
        } catch (err) {
            mostrarMensagem(mensagemEl, 'Não foi possível conectar ao servidor.', 'erro');
        }
    });
}

/* ---------- 3. Cardápio (cardapio.html) ---------- */
const diasLista = document.getElementById('diasLista');

if (diasLista) {
    const cardapioData = {
        segunda: {
            kcalTotal: 1300,
            refeicoes: {
                cafe:   { rotulo: 'Café',   kcal: 280, nome: 'Aveia com frutas e mel' },
                almoco: { rotulo: 'Almoço', kcal: 520, nome: 'Arroz integral, feijão e salada' },
                lanche: { rotulo: 'Lanche', kcal: 180, nome: 'Iogurte com granola caseira' },
                jantar: { rotulo: 'Jantar', kcal: 320, nome: 'Sopa de legumes cremosa' }
            },
            porcoesAlmoco: [
                { nome: 'Arroz integral', qtd: '4 col. sopa' },
                { nome: 'Frango grelhado', qtd: '120g' },
                { nome: 'Legumes cozidos', qtd: '1 xícara' },
                { nome: 'Frutas secas', qtd: '4 col. sopa' }
            ]
        },
        terca: {
            kcalTotal: 1210,
            refeicoes: {
                cafe:   { rotulo: 'Café',   kcal: 250, nome: 'Pão integral com ovos' },
                almoco: { rotulo: 'Almoço', kcal: 480, nome: 'Quinoa, frango e brócolis' },
                lanche: { rotulo: 'Lanche', kcal: 150, nome: 'Mix de castanhas' },
                jantar: { rotulo: 'Jantar', kcal: 330, nome: 'Omelete de legumes' }
            },
            porcoesAlmoco: [
                { nome: 'Quinoa cozida', qtd: '4 col. sopa' },
                { nome: 'Frango desfiado', qtd: '100g' },
                { nome: 'Brócolis cozido', qtd: '1 xícara' },
                { nome: 'Azeite', qtd: '1 col. chá' }
            ]
        },
        quarta: {
            kcalTotal: 1340,
            refeicoes: {
                cafe:   { rotulo: 'Café',   kcal: 300, nome: 'Vitamina de banana e aveia' },
                almoco: { rotulo: 'Almoço', kcal: 540, nome: 'Batata doce, peixe e salada' },
                lanche: { rotulo: 'Lanche', kcal: 170, nome: 'Iogurte com frutas vermelhas' },
                jantar: { rotulo: 'Jantar', kcal: 330, nome: 'Sopa de abóbora' }
            },
            porcoesAlmoco: [
                { nome: 'Batata doce', qtd: '1 unidade média' },
                { nome: 'Peixe grelhado', qtd: '120g' },
                { nome: 'Salada verde', qtd: '1 prato pequeno' },
                { nome: 'Azeite', qtd: '1 col. chá' }
            ]
        }
    };

    const botoesDia = diasLista.querySelectorAll('.dia-btn');
    const refeicoesGrid = document.getElementById('refeicoesGrid');
    const porcoesLista = document.getElementById('porcoesLista');

    function renderizarDia(dia) {
        const dados = cardapioData[dia];

        botoesDia.forEach(btn => {
            const diaBtn = btn.dataset.dia;
            btn.querySelector('.dia-kcal').textContent = `${cardapioData[diaBtn].kcalTotal} kcal totais`;
            btn.classList.toggle('ativo', diaBtn === dia);
        });

        refeicoesGrid.innerHTML = '';
        Object.values(dados.refeicoes).forEach(refeicao => {
            const card = document.createElement('div');
            card.className = 'refeicao-card';
            card.innerHTML = `
                <div class="refeicao-topo">
                    <span class="refeicao-badge">${refeicao.rotulo}</span>
                    <span class="refeicao-kcal">${refeicao.kcal} kcal</span>
                </div>
                <p class="refeicao-nome">${refeicao.nome}</p>
            `;
            refeicoesGrid.appendChild(card);
        });

        porcoesLista.innerHTML = '';
        dados.porcoesAlmoco.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${item.nome}</span><span>${item.qtd}</span>`;
            porcoesLista.appendChild(li);
        });
    }

    botoesDia.forEach(btn => {
        btn.addEventListener('click', () => renderizarDia(btn.dataset.dia));
    });

    renderizarDia('segunda');
}

/* ---------- 4. Receitas (receitas.html) ---------- */
const receitasGrid = document.getElementById('receitasGrid');

if (receitasGrid) {
    const filtrosContainer = document.getElementById('receitasFiltros');
    const btnVerMais = document.getElementById('btnVerMais');
    const modal = document.getElementById('receitaModal');
    const modalConteudo = document.getElementById('receitaModalConteudo');
    const fecharModalBtn = document.getElementById('fecharModal');
    const minhaListaItens = document.getElementById('minhaListaItens');
    const minhaListaDetalhe = document.getElementById('minhaListaDetalhe');
    const btnProcurarMais = document.getElementById('btnProcurarMais');

    const CHAVE_LISTA = 'behealthier_lista_receitas';
    const TAMANHO_PAGINA = 9;
    let todasReceitas = [];
    let categoriaAtual = 'Todas';
    let quantidadeVisivel = TAMANHO_PAGINA;

    function obterListaSalva() {
        try {
            return JSON.parse(localStorage.getItem(CHAVE_LISTA)) || [];
        } catch {
            return [];
        }
    }

    function salvarLista(ids) {
        localStorage.setItem(CHAVE_LISTA, JSON.stringify(ids));
    }

    function estaSalva(id) {
        return obterListaSalva().includes(id);
    }

    function alternarSalvo(id) {
        const lista = obterListaSalva();
        const indice = lista.indexOf(id);

        if (indice === -1) {
            lista.push(id);
        } else {
            lista.splice(indice, 1);
        }

        salvarLista(lista);
        renderizarMinhaLista();
        renderizarReceitas();
    }

    function formatarValor(valor, unidade) {
        return valor === null || valor === undefined ? '—' : `${valor}${unidade}`;
    }

    function renderizarMinhaLista() {
        const ids = obterListaSalva();

        if (ids.length === 0) {
            minhaListaItens.innerHTML = '<li class="minha-lista-vazio">Você ainda não salvou nenhuma receita.</li>';
            return;
        }

        minhaListaItens.innerHTML = '';
        ids.forEach(id => {
            const receita = todasReceitas.find(r => r.id === id);
            if (!receita) return;

            const li = document.createElement('li');
            li.className = 'minha-lista-item';
            li.dataset.id = id;
            li.innerHTML = `
                <span>${receita.nome}</span>
                <button type="button" data-id="${id}" aria-label="Remover">×</button>
            `;
            minhaListaItens.appendChild(li);
        });
    }

    function mostrarDetalheNaLista(id) {
        const receita = todasReceitas.find(r => r.id === id);
        if (!receita) return;

        document.querySelectorAll('.minha-lista-item').forEach(item => {
            item.classList.toggle('selecionada', Number(item.dataset.id) === id);
        });

        const listaIngredientes = (receita.ingredientes || '')
            .split('\n')
            .filter(item => item.trim() !== '')
            .map(item => `<li>${item.trim()}</li>`)
            .join('');

        const imagemHtml = receita.imagem ? `<img src="${receita.imagem}" alt="${receita.nome}">` : '';

        minhaListaDetalhe.innerHTML = `
            <span class="detalhe-badge">${receita.categoria}</span>
            <div class="detalhe-media">${imagemHtml}</div>
            <h3>${receita.nome}</h3>
            <div class="detalhe-macros">
                <div class="detalhe-macro"><strong>${formatarValor(receita.calorias, '')}</strong>kcal</div>
                <div class="detalhe-macro"><strong>${formatarValor(receita.proteinas, '')}</strong>g proteína</div>
                <div class="detalhe-macro"><strong>${formatarValor(receita.carboidratos, '')}</strong>g carbo</div>
            </div>
            <h4>Ingredientes</h4>
            <ul>${listaIngredientes}</ul>
            <h4>Modo de preparo</h4>
            <p class="detalhe-preparo">${receita.preparo && receita.preparo.trim() !== '' ? receita.preparo : 'Modo de preparo não informado.'}</p>
            <button type="button" class="btn-remover-lista" data-id="${receita.id}">Remover da lista 🗑</button>
        `;
    }

    minhaListaItens.addEventListener('click', (e) => {
        const botaoRemover = e.target.closest('button[aria-label="Remover"]');
        if (botaoRemover) {
            alternarSalvo(Number(botaoRemover.dataset.id));
            minhaListaDetalhe.innerHTML = '<p class="minha-lista-placeholder">Clique em uma receita salva na lista ao lado para ver os detalhes aqui.</p>';
            return;
        }

        const item = e.target.closest('.minha-lista-item');
        if (item) mostrarDetalheNaLista(Number(item.dataset.id));
    });

    minhaListaDetalhe.addEventListener('click', (e) => {
        const botaoRemover = e.target.closest('.btn-remover-lista');
        if (!botaoRemover) return;

        alternarSalvo(Number(botaoRemover.dataset.id));
        minhaListaDetalhe.innerHTML = '<p class="minha-lista-placeholder">Clique em uma receita salva na lista ao lado para ver os detalhes aqui.</p>';
    });

    btnProcurarMais.addEventListener('click', () => {
        filtrosContainer.scrollIntoView({ behavior: 'smooth' });
    });

    fetch('receitas.json')
        .then(resposta => resposta.json())
        .then(dados => {
            todasReceitas = dados;
            montarFiltros(dados);
            renderizarReceitas();
            renderizarMinhaLista();
        })
        .catch(() => {
            receitasGrid.innerHTML = '<p>Não foi possível carregar as receitas no momento.</p>';
        });

    function montarFiltros(dados) {
        const categorias = [...new Set(dados.map(r => r.categoria))];

        categorias.forEach(categoria => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'filtro-btn';
            btn.dataset.categoria = categoria;
            btn.textContent = categoria;
            filtrosContainer.appendChild(btn);
        });

        filtrosContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.filtro-btn');
            if (!btn) return;

            filtrosContainer.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('ativo'));
            btn.classList.add('ativo');

            categoriaAtual = btn.dataset.categoria;
            quantidadeVisivel = TAMANHO_PAGINA;
            renderizarReceitas();
        });
    }

    function renderizarReceitas() {
        const filtradas = categoriaAtual === 'Todas'
            ? todasReceitas
            : todasReceitas.filter(r => r.categoria === categoriaAtual);

        const visiveis = filtradas.slice(0, quantidadeVisivel);

        receitasGrid.innerHTML = '';
        visiveis.forEach(receita => {
            const salva = estaSalva(receita.id);
            const imagemHtml = receita.imagem ? `<img src="${receita.imagem}" alt="${receita.nome}">` : '';

            const card = document.createElement('article');
            card.className = 'receita-card';
            card.innerHTML = `
                <div class="receita-card__media">
                    ${imagemHtml}
                    <button type="button" class="btn-salvar ${salva ? 'salvo' : ''}" data-id="${receita.id}" aria-label="Salvar receita">${salva ? '♥' : '♡'}</button>
                </div>
                <div class="receita-card__topo">
                    <span class="receita-card__badge">${receita.categoria}</span>
                    <span class="receita-card__kcal">${formatarValor(receita.calorias, 'kcal')}</span>
                </div>
                <h3>${receita.nome}</h3>
                <div class="receita-card__macros">
                    <span>Proteínas: ${formatarValor(receita.proteinas, 'g')}</span>
                    <span>Carboidratos: ${formatarValor(receita.carboidratos, 'g')}</span>
                </div>
                <button type="button" class="receita-card__acao" data-id="${receita.id}">Ver receita +</button>
            `;
            receitasGrid.appendChild(card);
        });

        btnVerMais.classList.toggle('escondido', quantidadeVisivel >= filtradas.length);
    }

    btnVerMais.addEventListener('click', () => {
        quantidadeVisivel += TAMANHO_PAGINA;
        renderizarReceitas();
    });

    receitasGrid.addEventListener('click', (e) => {
        const botaoSalvar = e.target.closest('.btn-salvar');
        if (botaoSalvar) {
            alternarSalvo(Number(botaoSalvar.dataset.id));
            return;
        }

        const botaoVer = e.target.closest('.receita-card__acao');
        if (!botaoVer) return;

        const receita = todasReceitas.find(r => r.id === Number(botaoVer.dataset.id));
        if (!receita) return;

        const salva = estaSalva(receita.id);
        const listaIngredientes = (receita.ingredientes || '')
            .split('\n')
            .filter(item => item.trim() !== '')
            .map(item => `<li>${item.trim()}</li>`)
            .join('');

        const imagemHtml = receita.imagem ? `<img src="${receita.imagem}" alt="${receita.nome}">` : '';

        modalConteudo.innerHTML = `
            <div class="receita-modal__media">
                ${imagemHtml}
                <button type="button" class="btn-salvar ${salva ? 'salvo' : ''}" data-id="${receita.id}" aria-label="Salvar receita">${salva ? '♥' : '♡'}</button>
            </div>
            <h2>${receita.nome}</h2>
            <div class="receita-modal__macros">
                <div class="receita-modal__macro"><strong>${formatarValor(receita.calorias, '')}</strong>kcal</div>
                <div class="receita-modal__macro"><strong>${formatarValor(receita.proteinas, '')}</strong>g proteína</div>
                <div class="receita-modal__macro"><strong>${formatarValor(receita.carboidratos, '')}</strong>g carbo</div>
            </div>
            <h3>Ingredientes</h3>
            <ul>${listaIngredientes}</ul>
            <h3>Modo de preparo</h3>
            <p>${receita.preparo && receita.preparo.trim() !== '' ? receita.preparo : 'Modo de preparo não informado.'}</p>
        `;

        modal.classList.add('aberto');
    });

    modalConteudo.addEventListener('click', (e) => {
        const botaoSalvar = e.target.closest('.btn-salvar');
        if (!botaoSalvar) return;
        alternarSalvo(Number(botaoSalvar.dataset.id));

        const salva = estaSalva(Number(botaoSalvar.dataset.id));
        botaoSalvar.classList.toggle('salvo', salva);
        botaoSalvar.textContent = salva ? '♥' : '♡';
    });

    function fecharModal() {
        modal.classList.remove('aberto');
    }

    fecharModalBtn.addEventListener('click', fecharModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) fecharModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharModal(); });
}