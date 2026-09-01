console.log('Iniciando o servidor...');
const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const CAMINHO_DB = path.join(__dirname, 'data', 'usuarios.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

function lerUsuarios() {
    const conteudo = fs.readFileSync(CAMINHO_DB, 'utf-8');
    return JSON.parse(conteudo || '[]');
}

function salvarUsuarios(usuarios) {
    fs.writeFileSync(CAMINHO_DB, JSON.stringify(usuarios, null, 2));
}

app.post('/api/cadastro', async (req, res) => {
    const { nome, senha } = req.body;

    if (!nome || !senha) {
        return res.status(400).json({ erro: 'Nome e senha são obrigatórios.' });
    }

    const usuarios = lerUsuarios();
    const jaExiste = usuarios.some(u => u.nome.toLowerCase() === nome.toLowerCase());
    if (jaExiste) {
        return res.status(409).json({ erro: 'Esse nome de usuário já existe.' });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);
    usuarios.push({ nome, senha: senhaCriptografada });
    salvarUsuarios(usuarios);

    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
});

app.post('/api/login', async (req, res) => {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
        return res.status(400).json({ erro: 'Usuário e senha são obrigatórios.' });
    }

    const usuarios = lerUsuarios();
    const encontrado = usuarios.find(u => u.nome.toLowerCase() === usuario.toLowerCase());

    if (!encontrado) {
        return res.status(401).json({ erro: 'Usuário ou senha incorretos.' });
    }

    const senhaCorreta = await bcrypt.compare(senha, encontrado.senha);
    if (!senhaCorreta) {
        return res.status(401).json({ erro: 'Usuário ou senha incorretos.' });
    }

    res.status(200).json({ mensagem: `Bem-vindo, ${encontrado.nome}!` });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});