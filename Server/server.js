/* ==========================================================
   BeHealthier - server.js
   API do site: cadastro/login com sessão, perfil de saúde,
   receitas salvas e cardápio semanal por usuário.
   ========================================================== */

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcrypt');

const PORTA = 3000;
const SALT_ROUNDS = 10;
const DIAS_SEMANA = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

const CAMINHO_USUARIOS = path.join(__dirname, 'data', 'usuarios.json');
const CAMINHO_RECEITAS = path.join(__dirname, '..', 'receitas.json');

const app = express();

app.use(cors({
    origin: true,       // reflete a origem que fez a requisição (dev local, várias portas)
    credentials: true   // necessário para o cookie de sessão ir junto
}));
app.use(express.json());
app.use(session({
    secret: 'behealthier-segredo-dev', // trocar por variável de ambiente em produção
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,     // true somente quando o site rodar em https
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 // 1 dia
    }
}));

/* ---------- Utilidades de leitura/gravação ---------- */

function lerUsuarios() {
    if (!fs.existsSync(CAMINHO_USUARIOS)) return [];
    const conteudo = fs.readFileSync(CAMINHO_USUARIOS, 'utf-8').trim();
    return conteudo === '' ? [] : JSON.parse(conteudo);
}

function salvarUsuarios(usuarios) {
    fs.writeFileSync(CAMINHO_USUARIOS, JSON.stringify(usuarios, null, 2));
}

function lerReceitas() {
    const conteudo = fs.readFileSync(CAMINHO_RECEITAS, 'utf-8');
    return JSON.parse(conteudo);
}

function cardapioVazio() {
    const cardapio = {};
    DIAS_SEMANA.forEach(dia => { cardapio[dia] = []; });
    return cardapio;
}

// Garante que usuários criados antes de alguma mudança de estrutura
// continuem funcionando (evita "undefined" em campos novos).
function normalizarUsuario(usuario) {
    if (!usuario.perfil) usuario.perfil = null;
    if (!usuario.receitasSalvas) usuario.receitasSalvas = [];
    if (!usuario.cardapio) usuario.cardapio = cardapioVazio();
    DIAS_SEMANA.forEach(dia => {
        if (!usuario.cardapio[dia]) usuario.cardapio[dia] = [];
    });
    return usuario;
}

function encontrarPorNome(usuarios, nome) {
    return usuarios.find(u => u.nome.toLowerCase() === nome.toLowerCase());
}

function encontrarPorId(usuarios, id) {
    return usuarios.find(u => u.id === id);
}

function usuarioPublico(usuario) {
    return { id: usuario.id, nome: usuario.nome };
}

/* ---------- Middleware de autenticação ---------- */

function exigirLogin(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ erro: 'É preciso estar logado.' });
    }
    next();
}

// Busca o usuário logado a partir da sessão e já normaliza a estrutura.
function usuarioDaSessao(req) {
    const usuarios = lerUsuarios();
    const usuario = encontrarPorId(usuarios, req.session.userId);
    if (!usuario) return { usuarios, usuario: null };
    normalizarUsuario(usuario);
    return { usuarios, usuario };
}

/* ---------- Recomendação de receitas por perfil ---------- */
/* Regra simples baseada nas macros que o receitas.json já tem
   (proteinas/carboidratos). Sem tags de dieta na base ainda,
   então não dá pra filtrar por "vegetariano" etc. por enquanto. */

function calcularPontuacao(receita, perfil) {
    const proteinas = receita.proteinas || 0;
    const carboidratos = receita.carboidratos || 0;
    const ativoOuIntenso = ['moderado', 'intenso'].includes(perfil.nivelAtividade);

    let pesoProteina = 1;
    let pesoCarboidrato = 0.3;

    if (perfil.objetivo === 'emagrecer') {
        pesoProteina = 1.5;
        pesoCarboidrato = -1;
    } else if (perfil.objetivo === 'ganhar_massa' || ativoOuIntenso) {
        pesoProteina = 1.5;
        pesoCarboidrato = 1;
    }

    return proteinas * pesoProteina + carboidratos * pesoCarboidrato;
}

function marcarRecomendadas(receitas, perfil) {
    if (!perfil) {
        return receitas.map(r => ({ ...r, recomendada: false }));
    }

    const comPontuacao = receitas.map(r => ({ receita: r, pontuacao: calcularPontuacao(r, perfil) }));
    const ordenadas = [...comPontuacao].sort((a, b) => b.pontuacao - a.pontuacao);
    const limite = Math.max(6, Math.ceil(receitas.length * 0.15));
    const idsRecomendados = new Set(ordenadas.slice(0, limite).map(item => item.receita.id));

    return receitas.map(r => ({ ...r, recomendada: idsRecomendados.has(r.id) }));
}

/* ---------- Autenticação (cadastro já inclui o perfil de saúde) ---------- */

const NIVEIS_ATIVIDADE = ['sedentario', 'leve', 'moderado', 'intenso'];
const OBJETIVOS = ['emagrecer', 'manter', 'ganhar_massa'];

app.post('/api/cadastro', (req, res) => {
    const {
        nome, senha,
        altura, peso, idade, sexo, nivelAtividade, objetivo,
        preferenciasAlimentares, restricoes
    } = req.body;

    if (!nome || !nome.trim() || !senha) {
        return res.status(400).json({ erro: 'Preencha nome e senha.' });
    }
    if (senha.length < 6) {
        return res.status(400).json({ erro: 'A senha precisa ter pelo menos 6 caracteres.' });
    }
    if (!altura || !peso || !idade) {
        return res.status(400).json({ erro: 'Preencha altura, peso e idade.' });
    }
    if (!NIVEIS_ATIVIDADE.includes(nivelAtividade)) {
        return res.status(400).json({ erro: 'Nível de atividade inválido.' });
    }
    if (!OBJETIVOS.includes(objetivo)) {
        return res.status(400).json({ erro: 'Objetivo inválido.' });
    }

    const usuarios = lerUsuarios();
    if (encontrarPorNome(usuarios, nome.trim())) {
        return res.status(409).json({ erro: 'Esse nome de usuário já está em uso.' });
    }

    const senhaHash = bcrypt.hashSync(senha, SALT_ROUNDS);
    const novoUsuario = {
        id: Date.now(),
        nome: nome.trim(),
        senhaHash,
        perfil: {
            altura: Number(altura),
            peso: Number(peso),
            idade: Number(idade),
            sexo: sexo || null,
            nivelAtividade,
            objetivo,
            preferenciasAlimentares: Array.isArray(preferenciasAlimentares) ? preferenciasAlimentares : [],
            restricoes: restricoes || ''
        },
        receitasSalvas: [],
        cardapio: cardapioVazio()
    };

    usuarios.push(novoUsuario);
    salvarUsuarios(usuarios);

    req.session.userId = novoUsuario.id;
    res.status(201).json({ mensagem: 'Cadastro realizado com sucesso!', usuario: usuarioPublico(novoUsuario) });
});

app.post('/api/login', (req, res) => {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
        return res.status(400).json({ erro: 'Preencha usuário e senha.' });
    }

    const usuarios = lerUsuarios();
    const encontrado = encontrarPorNome(usuarios, usuario.trim());

    // Mensagem genérica de propósito: não revela se o erro foi o nome ou a senha.
    if (!encontrado || !bcrypt.compareSync(senha, encontrado.senhaHash)) {
        return res.status(401).json({ erro: 'Usuário ou senha inválidos.' });
    }

    req.session.userId = encontrado.id;
    res.json({ mensagem: 'Login realizado com sucesso!', usuario: usuarioPublico(encontrado) });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ mensagem: 'Sessão encerrada.' });
    });
});

app.get('/api/me', (req, res) => {
    if (!req.session.userId) return res.json({ logado: false });

    const usuarios = lerUsuarios();
    const usuario = encontrarPorId(usuarios, req.session.userId);
    if (!usuario) return res.json({ logado: false });

    res.json({ logado: true, usuario: usuarioPublico(usuario) });
});

/* ---------- Perfil de saúde (editar depois do cadastro) ---------- */

app.get('/api/perfil', exigirLogin, (req, res) => {
    const { usuario } = usuarioDaSessao(req);
    res.json(usuario.perfil);
});

app.post('/api/perfil', exigirLogin, (req, res) => {
    const { altura, peso, idade, sexo, nivelAtividade, objetivo, preferenciasAlimentares, restricoes } = req.body;

    if (!altura || !peso || !idade) {
        return res.status(400).json({ erro: 'Preencha altura, peso e idade.' });
    }
    if (!NIVEIS_ATIVIDADE.includes(nivelAtividade)) {
        return res.status(400).json({ erro: 'Nível de atividade inválido.' });
    }
    if (!OBJETIVOS.includes(objetivo)) {
        return res.status(400).json({ erro: 'Objetivo inválido.' });
    }

    const { usuarios, usuario } = usuarioDaSessao(req);
    usuario.perfil = {
        altura: Number(altura),
        peso: Number(peso),
        idade: Number(idade),
        sexo: sexo || null,
        nivelAtividade,
        objetivo,
        preferenciasAlimentares: Array.isArray(preferenciasAlimentares) ? preferenciasAlimentares : [],
        restricoes: restricoes || ''
    };

    salvarUsuarios(usuarios);
    res.json({ mensagem: 'Perfil salvo com sucesso!', perfil: usuario.perfil });
});

/* ---------- Receitas (com marcação de recomendadas) ---------- */

app.get('/api/receitas', (req, res) => {
    const receitas = lerReceitas();

    if (!req.session.userId) {
        return res.json(marcarRecomendadas(receitas, null));
    }

    const { usuario } = usuarioDaSessao(req);
    res.json(marcarRecomendadas(receitas, usuario ? usuario.perfil : null));
});

/* ---------- Receitas salvas ("minha lista") ---------- */

app.get('/api/minha-lista', exigirLogin, (req, res) => {
    const { usuario } = usuarioDaSessao(req);
    res.json(usuario.receitasSalvas);
});

app.post('/api/minha-lista/:id', exigirLogin, (req, res) => {
    const id = Number(req.params.id);
    const { usuarios, usuario } = usuarioDaSessao(req);

    const indice = usuario.receitasSalvas.indexOf(id);
    if (indice === -1) {
        usuario.receitasSalvas.push(id);
    } else {
        usuario.receitasSalvas.splice(indice, 1);
    }

    salvarUsuarios(usuarios);
    res.json({ receitasSalvas: usuario.receitasSalvas });
});

/* ---------- Cardápio semanal ---------- */

app.get('/api/cardapio', exigirLogin, (req, res) => {
    const { usuario } = usuarioDaSessao(req);
    res.json(usuario.cardapio);
});

app.post('/api/cardapio/:dia', exigirLogin, (req, res) => {
    const { dia } = req.params;
    const idReceita = Number(req.body.idReceita);

    if (!DIAS_SEMANA.includes(dia)) {
        return res.status(400).json({ erro: 'Dia da semana inválido.' });
    }
    if (!idReceita) {
        return res.status(400).json({ erro: 'idReceita é obrigatório.' });
    }

    const { usuarios, usuario } = usuarioDaSessao(req);
    if (!usuario.cardapio[dia].includes(idReceita)) {
        usuario.cardapio[dia].push(idReceita);
    }

    salvarUsuarios(usuarios);
    res.json({ dia, receitas: usuario.cardapio[dia] });
});

app.delete('/api/cardapio/:dia/:idReceita', exigirLogin, (req, res) => {
    const { dia } = req.params;
    const idReceita = Number(req.params.idReceita);

    if (!DIAS_SEMANA.includes(dia)) {
        return res.status(400).json({ erro: 'Dia da semana inválido.' });
    }

    const { usuarios, usuario } = usuarioDaSessao(req);
    usuario.cardapio[dia] = usuario.cardapio[dia].filter(id => id !== idReceita);

    salvarUsuarios(usuarios);
    res.json({ dia, receitas: usuario.cardapio[dia] });
});

app.listen(PORTA, () => {
    console.log(`Servidor BeHealthier rodando em http://localhost:${PORTA}`);
});
