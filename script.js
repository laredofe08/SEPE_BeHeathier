/*alterar quando trocar de maquina e baixar o node_modules*/
const API_URL = 'http://localhost:3000/api';

/*==== nav-bar ====*/
const menuToggle = document.getElementById('menuToggle');
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('#navLinks a');

function toggleMenu(forceState) {
    const isOpen = navbar.classList.toggle('open', forceState);
    menuToggle.classList.toggle('active', isOpen);
    menuToggle.setAttribute('aria-expanded', isOpen);
}

menuToggle.addEventListener('click', () => toggleMenu());

// Fecha o menu ao clicar em um link
navLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
});

// Fecha o menu ao clicar fora dele
document.addEventListener('click', (e) => {
    const clickedOutside = !navbar.contains(e.target) && !menuToggle.contains(e.target);
    if (navbar.classList.contains('open') && clickedOutside) {
        toggleMenu(false);
    }
});

/*==== estado de login (link "Login"/"Sair" no menu, todas as páginas) ====*/
const linkLogin = document.querySelector('.nav-login a');

if (linkLogin) {
    fetch(`${API_URL}/me`, { credentials: 'include' })
        .then(resposta => resposta.json())
        .then(dados => {
            if (!dados.logado) return;

            linkLogin.textContent = 'Sair';
            linkLogin.classList.remove('atual');
            linkLogin.href = '#';
            linkLogin.addEventListener('click', async (e) => {
                e.preventDefault();
                await fetch(`${API_URL}/logout`, { method: 'POST', credentials: 'include' });
                window.location.href = 'index.html';
            });
        })
        .catch(() => {
            // Se o servidor estiver fora do ar, mantém o link "Login" normal.
        });
}

// Usada nas páginas de login/cadastro e de perfil pra mostrar erro/sucesso
function mostrarMensagem(elemento, texto, tipo) {
    elemento.textContent = texto;
    elemento.className = `mensagem ${tipo}`;
}

/*==== login ====*/

// Flip do card de login/cadastro
const loginCard = document.getElementById('loginCard');
const toCadastro = document.getElementById('toCadastro');
const toLogin = document.getElementById('toLogin');

if (loginCard) {
    toCadastro.addEventListener('click', (e) => {
        e.preventDefault();
        loginCard.classList.add('flipped');
    });

    toLogin.addEventListener('click', (e) => {
        e.preventDefault();
        loginCard.classList.remove('flipped');
    });

    // Envio dos formulários pro servidor
    const formLogin = document.getElementById('formLogin');
    const formCadastro = document.getElementById('formCadastro');

    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const usuario = document.getElementById('usuario').value;
        const senha = document.getElementById('senha').value;
        const mensagemEl = document.getElementById('mensagemLogin');

        try {
            const resposta = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ usuario, senha })
            });
            const dados = await resposta.json();

            if (!resposta.ok) {
                mostrarMensagem(mensagemEl, dados.erro, 'erro');
                return;
            }

            mostrarMensagem(mensagemEl, dados.mensagem, 'sucesso');
            setTimeout(() => { window.location.href = 'index.html'; }, 800);
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
                credentials: 'include',
                body: JSON.stringify({ nome, senha })
            });
            const dados = await resposta.json();

            if (!resposta.ok) {
                mostrarMensagem(mensagemEl, dados.erro, 'erro');
                return;
            }

            mostrarMensagem(mensagemEl, dados.mensagem, 'sucesso');
            setTimeout(() => { window.location.href = 'dieta.html'; }, 800);
        } catch (err) {
            mostrarMensagem(mensagemEl, 'Não foi possível conectar ao servidor.', 'erro');
        }
    });
}

/*==== perfil (dieta.html) ====*/
const formPerfil = document.getElementById('formPerfil');

if (formPerfil) {
    const mensagemPerfilEl = document.getElementById('mensagemPerfil');

    function preencherFormulario(perfil) {
        formPerfil.altura.value = perfil.altura;
        formPerfil.peso.value = perfil.peso;
        formPerfil.idade.value = perfil.idade;
        formPerfil.sexo.value = perfil.sexo || '';
        formPerfil.nivelAtividade.value = perfil.nivelAtividade;
        formPerfil.objetivo.value = perfil.objetivo;
        formPerfil.restricoes.value = perfil.restricoes || '';

        formPerfil.querySelectorAll('input[name="preferenciasAlimentares"]').forEach(checkbox => {
            checkbox.checked = perfil.preferenciasAlimentares.includes(checkbox.value);
        });
    }

    // Só faz sentido preencher perfil estando logado
    fetch(`${API_URL}/me`, { credentials: 'include' })
        .then(resposta => resposta.json())
        .then(dados => {
            if (!dados.logado) {
                window.location.href = 'login.html';
                return null;
            }
            return fetch(`${API_URL}/perfil`, { credentials: 'include' }).then(r => r.json());
        })
        .then(perfil => {
            if (perfil) preencherFormulario(perfil);
        })
        .catch(() => {});

    formPerfil.addEventListener('submit', async (e) => {
        e.preventDefault();

        const dadosForm = new FormData(formPerfil);
        const corpo = {
            altura: dadosForm.get('altura'),
            peso: dadosForm.get('peso'),
            idade: dadosForm.get('idade'),
            sexo: dadosForm.get('sexo'),
            nivelAtividade: dadosForm.get('nivelAtividade'),
            objetivo: dadosForm.get('objetivo'),
            preferenciasAlimentares: dadosForm.getAll('preferenciasAlimentares'),
            restricoes: dadosForm.get('restricoes')
        };

        try {
            const resposta = await fetch(`${API_URL}/perfil`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(corpo)
            });
            const resultado = await resposta.json();

            if (!resposta.ok) {
                mostrarMensagem(mensagemPerfilEl, resultado.erro, 'erro');
                return;
            }

            mostrarMensagem(mensagemPerfilEl, resultado.mensagem, 'sucesso');
            setTimeout(() => { window.location.href = 'receitas.html'; }, 800);
        } catch (err) {
            mostrarMensagem(mensagemPerfilEl, 'Não foi possível conectar ao servidor.', 'erro');
        }
    });
}

// Página de receitas — busca, filtro, salvar, adicionar ao cardápio e modal
const receitasGrid = document.getElementById('receitasGrid');

if (receitasGrid) {
    const filtrosContainer = document.getElementById('receitasFiltros');
    const btnVerMais = document.getElementById('btnVerMais');
    const modal = document.getElementById('receitaModal');
    const modalConteudo = document.getElementById('receitaModalConteudo');
    const fecharModalBtn = document.getElementById('fecharModal');

    const TAMANHO_PAGINA = 9;
    const DIAS_SEMANA = [
        { chave: 'segunda', rotulo: 'Segunda' },
        { chave: 'terca', rotulo: 'Terça' },
        { chave: 'quarta', rotulo: 'Quarta' },
        { chave: 'quinta', rotulo: 'Quinta' },
        { chave: 'sexta', rotulo: 'Sexta' },
        { chave: 'sabado', rotulo: 'Sábado' },
        { chave: 'domingo', rotulo: 'Domingo' }
    ];

    let todasReceitas = [];
    let receitasSalvasIds = new Set();
    let usuarioLogado = false;
    let categoriaAtual = 'Todas';
    let quantidadeVisivel = TAMANHO_PAGINA;

    // Busca se está logado, a lista de salvas (se estiver) e as receitas (com recomendação já calculada pelo servidor)
    async function iniciarReceitas() {
        try {
            const respostaMe = await fetch(`${API_URL}/me`, { credentials: 'include' });
            const dadosMe = await respostaMe.json();
            usuarioLogado = dadosMe.logado;

            if (usuarioLogado) {
                const respostaLista = await fetch(`${API_URL}/minha-lista`, { credentials: 'include' });
                receitasSalvasIds = new Set(await respostaLista.json());
            }

            const respostaReceitas = await fetch(`${API_URL}/receitas`, { credentials: 'include' });
            todasReceitas = await respostaReceitas.json();

            montarFiltros(todasReceitas);
            renderizarReceitas();
        } catch (err) {
            receitasGrid.innerHTML = '<p>Não foi possível carregar as receitas no momento.</p>';
        }
    }

    iniciarReceitas();

    // Cria os botões de categoria (+ "Recomendadas", se estiver logado) a partir dos dados reais
    function montarFiltros(dados) {
        if (usuarioLogado) {
            const btnRecomendadas = document.createElement('button');
            btnRecomendadas.type = 'button';
            btnRecomendadas.className = 'filtro-btn';
            btnRecomendadas.dataset.categoria = '__recomendadas__';
            btnRecomendadas.textContent = 'Recomendadas pra você ⭐';
            filtrosContainer.appendChild(btnRecomendadas);
        }

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

    function estaSalva(id) {
        return receitasSalvasIds.has(id);
    }

    function formatarValor(valor, unidade) {
        return valor === null || valor === undefined ? '—' : `${valor}${unidade}`;
    }

    function popoverDiasHtml(idReceita) {
        return DIAS_SEMANA.map(dia => `
            <li><button type="button" class="dia-popover-btn" data-dia="${dia.chave}" data-id="${idReceita}">${dia.rotulo}</button></li>
        `).join('');
    }

    function botaoCardapioHtml(idReceita) {
        return `
            <div class="cardapio-popover-container">
                <button type="button" class="btn-add-cardapio" data-id="${idReceita}">Adicionar ao cardápio 📅</button>
                <ul class="cardapio-popover">${popoverDiasHtml(idReceita)}</ul>
            </div>
        `;
    }

    // Filtra e desenha os cards na tela
    function renderizarReceitas() {
        let filtradas;
        if (categoriaAtual === 'Todas') {
            filtradas = todasReceitas;
        } else if (categoriaAtual === '__recomendadas__') {
            filtradas = todasReceitas.filter(r => r.recomendada);
        } else {
            filtradas = todasReceitas.filter(r => r.categoria === categoriaAtual);
        }

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
                ${receita.recomendada ? '<span class="receita-card__recomendada">Recomendado pra você ⭐</span>' : ''}
                <h3>${receita.nome}</h3>
                <div class="receita-card__macros">
                    <span>Proteínas: ${formatarValor(receita.proteinas, 'g')}</span>
                    <span>Carboidratos: ${formatarValor(receita.carboidratos, 'g')}</span>
                </div>
                <div class="receita-card__acoes">
                    <button type="button" class="receita-card__acao" data-id="${receita.id}">Ver receita +</button>
                    ${botaoCardapioHtml(receita.id)}
                </div>
            `;
            receitasGrid.appendChild(card);
        });

        btnVerMais.classList.toggle('escondido', quantidadeVisivel >= filtradas.length);
    }

    btnVerMais.addEventListener('click', () => {
        quantidadeVisivel += TAMANHO_PAGINA;
        renderizarReceitas();
    });

    /* ---- Salvar receita (♥) ---- */

    function atualizarBotoesSalvar(id) {
        const salva = estaSalva(id);
        document.querySelectorAll(`.btn-salvar[data-id="${id}"]`).forEach(botao => {
            botao.classList.toggle('salvo', salva);
            botao.textContent = salva ? '♥' : '♡';
        });
    }

    async function alternarSalvo(id) {
        if (!usuarioLogado) {
            alert('Faça login para salvar receitas.');
            return;
        }

        try {
            const resposta = await fetch(`${API_URL}/minha-lista/${id}`, { method: 'POST', credentials: 'include' });
            const resultado = await resposta.json();
            receitasSalvasIds = new Set(resultado.receitasSalvas);
            atualizarBotoesSalvar(id);
        } catch (err) {
            alert('Não foi possível conectar ao servidor.');
        }
    }

    /* ---- Adicionar ao cardápio ---- */

    function fecharPopoversCardapio(exceto) {
        document.querySelectorAll('.cardapio-popover.aberto').forEach(popover => {
            if (popover !== exceto) popover.classList.remove('aberto');
        });
    }

    async function adicionarAoCardapio(dia, idReceita, botaoClicado) {
        if (!usuarioLogado) {
            alert('Faça login para adicionar receitas ao cardápio.');
            return;
        }

        try {
            const resposta = await fetch(`${API_URL}/cardapio/${dia}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ idReceita })
            });

            if (!resposta.ok) {
                alert('Não foi possível adicionar ao cardápio.');
                return;
            }

            const popover = botaoClicado.closest('.cardapio-popover');
            const textoOriginal = botaoClicado.textContent;
            botaoClicado.textContent = 'Adicionado ✓';
            setTimeout(() => {
                botaoClicado.textContent = textoOriginal;
                popover.classList.remove('aberto');
            }, 900);
        } catch (err) {
            alert('Não foi possível conectar ao servidor.');
        }
    }

    // Trata os cliques que existem tanto no grid quanto no modal (salvar e adicionar ao cardápio)
    function tratarCliqueAcoesReceita(e) {
        const btnSalvar = e.target.closest('.btn-salvar');
        if (btnSalvar) {
            alternarSalvo(Number(btnSalvar.dataset.id));
            return true;
        }

        const btnAddCardapio = e.target.closest('.btn-add-cardapio');
        if (btnAddCardapio) {
            const popover = btnAddCardapio.nextElementSibling;
            fecharPopoversCardapio(popover);
            popover.classList.toggle('aberto');
            return true;
        }

        const btnDia = e.target.closest('.dia-popover-btn');
        if (btnDia) {
            adicionarAoCardapio(btnDia.dataset.dia, Number(btnDia.dataset.id), btnDia);
            return true;
        }

        return false;
    }

    // Fecha qualquer popover de cardápio aberto ao clicar fora dele
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.cardapio-popover-container')) {
            fecharPopoversCardapio(null);
        }
    });

    /* ---- Modal "Ver receita" ---- */

    function abrirModalReceita(id) {
        const receita = todasReceitas.find(r => r.id === id);
        if (!receita) return;

        const salva = estaSalva(receita.id);
        const imagemHtml = receita.imagem ? `<img src="${receita.imagem}" alt="${receita.nome}">` : '';
        const listaIngredientes = (receita.ingredientes || '')
            .split('\n')
            .filter(item => item.trim() !== '')
            .map(item => `<li>${item.trim()}</li>`)
            .join('');

        modalConteudo.innerHTML = `
            <div class="receita-modal__media">
                ${imagemHtml}
                <button type="button" class="btn-salvar ${salva ? 'salvo' : ''}" data-id="${receita.id}" aria-label="Salvar receita">${salva ? '♥' : '♡'}</button>
            </div>
            <h2>${receita.nome}</h2>
            ${receita.recomendada ? '<span class="receita-card__recomendada">Recomendado pra você ⭐</span>' : ''}
            <div class="receita-modal__macros">
                <div class="receita-modal__macro"><strong>${formatarValor(receita.calorias, '')}</strong>kcal</div>
                <div class="receita-modal__macro"><strong>${formatarValor(receita.proteinas, '')}</strong>g proteína</div>
                <div class="receita-modal__macro"><strong>${formatarValor(receita.carboidratos, '')}</strong>g carbo</div>
            </div>
            ${botaoCardapioHtml(receita.id)}
            <h3>Ingredientes</h3>
            <ul>${listaIngredientes}</ul>
            <h3>Modo de preparo</h3>
            <p>${receita.preparo && receita.preparo.trim() !== '' ? receita.preparo : 'Modo de preparo não informado.'}</p>
        `;

        modal.classList.add('aberto');
    }

    // Abre o modal ao clicar em "Ver receita" (e trata salvar/cardápio dentro do próprio grid)
    receitasGrid.addEventListener('click', (e) => {
        if (tratarCliqueAcoesReceita(e)) return;

        const btnVer = e.target.closest('.receita-card__acao');
        if (!btnVer) return;

        abrirModalReceita(Number(btnVer.dataset.id));
    });

    // Salvar/adicionar ao cardápio a partir de dentro do modal
    modalConteudo.addEventListener('click', tratarCliqueAcoesReceita);

    function fecharModal() {
        modal.classList.remove('aberto');
    }

    fecharModalBtn.addEventListener('click', fecharModal);

    // Fecha ao clicar fora do painel
    modal.addEventListener('click', (e) => {
        if (e.target === modal) fecharModal();
    });

    // Fecha com a tecla Esc
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') fecharModal();
    });
}

/*==== cardápio (cardapio.html) ====*/
const diasLista = document.getElementById('diasLista');

if (diasLista) {
    const refeicoesGrid = document.getElementById('refeicoesGrid');
    const DIAS_SEMANA = [
        { chave: 'segunda', rotulo: 'Segunda' },
        { chave: 'terca', rotulo: 'Terça' },
        { chave: 'quarta', rotulo: 'Quarta' },
        { chave: 'quinta', rotulo: 'Quinta' },
        { chave: 'sexta', rotulo: 'Sexta' },
        { chave: 'sabado', rotulo: 'Sábado' },
        { chave: 'domingo', rotulo: 'Domingo' }
    ];
    const CHAVE_POR_INDICE_JS = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

    let receitasPorId = new Map();
    let cardapioUsuario = null;
    let diaAtual = CHAVE_POR_INDICE_JS[new Date().getDay()];

    function formatarValor(valor, unidade) {
        return valor === null || valor === undefined ? '—' : `${valor}${unidade}`;
    }

    // Busca o cardápio salvo do usuário + os dados completos das receitas
    async function iniciarCardapio() {
        try {
            const respostaMe = await fetch(`${API_URL}/me`, { credentials: 'include' });
            const dadosMe = await respostaMe.json();

            if (!dadosMe.logado) {
                diasLista.innerHTML = '';
                refeicoesGrid.innerHTML = '<p class="cardapio-vazio">Faça <a href="login.html">login</a> para ver seu cardápio da semana.</p>';
                return;
            }

            const [respostaCardapio, respostaReceitas] = await Promise.all([
                fetch(`${API_URL}/cardapio`, { credentials: 'include' }),
                fetch(`${API_URL}/receitas`, { credentials: 'include' })
            ]);

            cardapioUsuario = await respostaCardapio.json();
            const receitas = await respostaReceitas.json();
            receitasPorId = new Map(receitas.map(r => [r.id, r]));

            montarDias();
            renderizarDia();
        } catch (err) {
            refeicoesGrid.innerHTML = '<p>Não foi possível carregar o cardápio no momento.</p>';
        }
    }

    iniciarCardapio();

    function montarDias() {
        diasLista.innerHTML = '';
        DIAS_SEMANA.forEach(dia => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'dia-btn';
            if (dia.chave === diaAtual) btn.classList.add('ativo');
            btn.dataset.dia = dia.chave;
            btn.textContent = dia.rotulo;
            diasLista.appendChild(btn);
        });
    }

    diasLista.addEventListener('click', (e) => {
        const btn = e.target.closest('.dia-btn');
        if (!btn) return;

        diasLista.querySelectorAll('.dia-btn').forEach(b => b.classList.remove('ativo'));
        btn.classList.add('ativo');
        diaAtual = btn.dataset.dia;
        renderizarDia();
    });

    function renderizarDia() {
        const idsDoDia = cardapioUsuario[diaAtual] || [];

        if (idsDoDia.length === 0) {
            refeicoesGrid.innerHTML = '<p class="cardapio-vazio">Nenhuma receita adicionada nesse dia ainda. Vá em <a href="receitas.html">Receitas</a> e clique em "Adicionar ao cardápio".</p>';
            return;
        }

        refeicoesGrid.innerHTML = '';
        idsDoDia.forEach(id => {
            const receita = receitasPorId.get(id);
            if (!receita) return;

            const imagemHtml = receita.imagem ? `<img src="${receita.imagem}" alt="${receita.nome}">` : '';

            const card = document.createElement('article');
            card.className = 'receita-card';
            card.innerHTML = `
                <div class="receita-card__media">
                    ${imagemHtml}
                    <button type="button" class="btn-remover-cardapio" data-id="${receita.id}" aria-label="Remover do cardápio">✕</button>
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
            `;
            refeicoesGrid.appendChild(card);
        });
    }

    refeicoesGrid.addEventListener('click', async (e) => {
        const btn = e.target.closest('.btn-remover-cardapio');
        if (!btn) return;

        const id = Number(btn.dataset.id);

        try {
            const resposta = await fetch(`${API_URL}/cardapio/${diaAtual}/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const resultado = await resposta.json();
            cardapioUsuario[diaAtual] = resultado.receitas;
            renderizarDia();
        } catch (err) {
            alert('Não foi possível remover a receita do cardápio.');
        }
    });
}

/*==== equilíbrio (equilibrio.html) ====*/
const progressoCarboidratos = document.getElementById('progressoCarboidratos');

if (progressoCarboidratos) {
    const progressoProteinas = document.getElementById('progressoProteinas');
    const progressoCalorias = document.getElementById('progressoCalorias');
    const percCarboidratosEl = document.getElementById('percCarboidratos');
    const percProteinasEl = document.getElementById('percProteinas');
    const percCaloriasEl = document.getElementById('percCalorias');
    const detalheCarboidratosEl = document.getElementById('detalheCarboidratos');
    const detalheProteinasEl = document.getElementById('detalheProteinas');
    const detalheCaloriasEl = document.getElementById('detalheCalorias');

    // Mesma meta de 2.000kcal já usada no card "Meta diária" da página,
    // com a distribuição recomendada de 55% carboidrato / 20% proteína.
    const META_CALORIAS = 2000;
    const META_CARBOIDRATOS_G = Math.round((META_CALORIAS * 0.55) / 4); // 4kcal por grama
    const META_PROTEINAS_G = Math.round((META_CALORIAS * 0.20) / 4);
    const CHAVE_DIA_POR_INDICE_JS = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const diaDeHojeEquilibrio = CHAVE_DIA_POR_INDICE_JS[new Date().getDay()];

    function atualizarBarra(elementoProgresso, elementoTexto, valor, meta) {
        const percentual = Math.min(100, Math.round((valor / meta) * 100));
        elementoProgresso.value = percentual;
        elementoTexto.textContent = `${percentual}%`;
    }

    function mostrarEquilibrioVazio(mensagem) {
        [progressoCarboidratos, progressoProteinas, progressoCalorias].forEach(p => { p.value = 0; });
        [percCarboidratosEl, percProteinasEl, percCaloriasEl].forEach(p => { p.textContent = '—'; });
        detalheCarboidratosEl.textContent = mensagem;
        detalheProteinasEl.textContent = '';
        detalheCaloriasEl.textContent = '';
    }

    async function iniciarEquilibrio() {
        try {
            const respostaMe = await fetch(`${API_URL}/me`, { credentials: 'include' });
            const dadosMe = await respostaMe.json();

            if (!dadosMe.logado) {
                mostrarEquilibrioVazio('Faça login para ver seu progresso do dia.');
                return;
            }

            const [respostaCardapio, respostaReceitas] = await Promise.all([
                fetch(`${API_URL}/cardapio`, { credentials: 'include' }),
                fetch(`${API_URL}/receitas`, { credentials: 'include' })
            ]);

            const cardapio = await respostaCardapio.json();
            const receitas = await respostaReceitas.json();
            const receitasPorId = new Map(receitas.map(r => [r.id, r]));

            const idsDeHoje = cardapio[diaDeHojeEquilibrio] || [];
            if (idsDeHoje.length === 0) {
                mostrarEquilibrioVazio('Nenhuma receita adicionada no cardápio de hoje ainda.');
                return;
            }

            const totais = idsDeHoje.reduce((acumulado, id) => {
                const receita = receitasPorId.get(id);
                if (!receita) return acumulado;
                acumulado.calorias += receita.calorias || 0;
                acumulado.proteinas += receita.proteinas || 0;
                acumulado.carboidratos += receita.carboidratos || 0;
                return acumulado;
            }, { calorias: 0, proteinas: 0, carboidratos: 0 });

            atualizarBarra(progressoCarboidratos, percCarboidratosEl, totais.carboidratos, META_CARBOIDRATOS_G);
            atualizarBarra(progressoProteinas, percProteinasEl, totais.proteinas, META_PROTEINAS_G);
            atualizarBarra(progressoCalorias, percCaloriasEl, totais.calorias, META_CALORIAS);

            detalheCarboidratosEl.textContent = `${Math.round(totais.carboidratos)}g de ${META_CARBOIDRATOS_G}g recomendados hoje`;
            detalheProteinasEl.textContent = `${Math.round(totais.proteinas)}g de ${META_PROTEINAS_G}g recomendados hoje`;
            detalheCaloriasEl.textContent = `${Math.round(totais.calorias)}kcal de ${META_CALORIAS}kcal (meta diária)`;
        } catch (err) {
            mostrarEquilibrioVazio('Não foi possível carregar seus dados agora.');
        }
    }

    iniciarEquilibrio();
}
