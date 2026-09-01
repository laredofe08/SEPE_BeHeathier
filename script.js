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
}

// Página de receitas — busca, filtro e modal
const receitasGrid = document.getElementById('receitasGrid');

if (receitasGrid) {
    const filtrosContainer = document.getElementById('receitasFiltros');
    const btnVerMais = document.getElementById('btnVerMais');
    const modal = document.getElementById('receitaModal');
    const modalConteudo = document.getElementById('receitaModalConteudo');
    const fecharModalBtn = document.getElementById('fecharModal');

    const TAMANHO_PAGINA = 9;
    let todasReceitas = [];
    let categoriaAtual = 'Todas';
    let quantidadeVisivel = TAMANHO_PAGINA;

    // Busca o banco de receitas
    fetch('receitas.json')
        .then(resposta => resposta.json())
        .then(dados => {
            todasReceitas = dados;
            montarFiltros(dados);
            renderizarReceitas();
        })
        .catch(() => {
            receitasGrid.innerHTML = '<p>Não foi possível carregar as receitas no momento.</p>';
        });

    // Cria os botões de categoria a partir dos dados reais
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

    // Filtra e desenha os cards na tela
    function renderizarReceitas() {
        const filtradas = categoriaAtual === 'Todas'
            ? todasReceitas
            : todasReceitas.filter(r => r.categoria === categoriaAtual);

        const visiveis = filtradas.slice(0, quantidadeVisivel);

        receitasGrid.innerHTML = '';
        visiveis.forEach(receita => {
            const card = document.createElement('article');
            card.className = 'receita-card';
            card.innerHTML = `
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

    function formatarValor(valor, unidade) {
        return valor === null || valor === undefined ? '—' : `${valor}${unidade}`;
    }

    btnVerMais.addEventListener('click', () => {
        quantidadeVisivel += TAMANHO_PAGINA;
        renderizarReceitas();
    });

    // Abre o modal ao clicar em "Ver receita"
    receitasGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.receita-card__acao');
        if (!btn) return;

        const receita = todasReceitas.find(r => r.id === Number(btn.dataset.id));
        if (!receita) return;

        const listaIngredientes = (receita.ingredientes || '')
            .split('\n')
            .filter(item => item.trim() !== '')
            .map(item => `<li>${item.trim()}</li>`)
            .join('');

        modalConteudo.innerHTML = `
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


// Cardápio personalizado — dados de exemplo (mock), depois vem do banco de receitas
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

const diasLista = document.getElementById('diasLista');

if (diasLista) {
    const botoesDia = diasLista.querySelectorAll('.dia-btn');
    const refeicoesGrid = document.getElementById('refeicoesGrid');
    const porcoesLista = document.getElementById('porcoesLista');

    function renderizarDia(dia) {
        const dados = cardapioData[dia];

        // Atualiza kcal total exibida em cada botão de dia
        botoesDia.forEach(btn => {
            const diaBtn = btn.dataset.dia;
            btn.querySelector('.dia-kcal').textContent = `${cardapioData[diaBtn].kcalTotal} kcal totais`;
            btn.classList.toggle('ativo', diaBtn === dia);
        });

        // Renderiza as 4 refeições
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

        // Renderiza porções individuais (referentes ao almoço)
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