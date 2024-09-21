// server.js
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Usuários hardcoded
const users = [
  { id: 1, username: 'admin', password: 'admin' },
  { id: 2, username: 'usuario2', password: 'senha2' },
];

// Chave secreta para assinar o token JWT
const SECRET_KEY = 'sua-chave-secreta';

// Rota de autenticação
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Verifica se o usuário existe
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    // Gera o token JWT
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, {
      expiresIn: '1h',
    });

    res.json({ token });
  } else {
    res.status(401).json({ message: 'Credenciais inválidas' });
  }
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Auth service rodando na porta ${PORT}`);
});
