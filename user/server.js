const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();
app.use(express.json());

// Conexão com o MongoDB
mongoose.connect('mongodb://mongodb:27017/userdb');

const SECRET_KEY = process.env.SECRET_KEY

// Middleware para autenticação JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.user = user;
    next();
  });
}

// Rota para obter o perfil do usuário
app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    res.json({ profile: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para atualizar o perfil do usuário
app.put('/profile', authenticateToken, async (req, res) => {
  try {
    const updatedData = req.body;
    const user = await User.findOneAndUpdate(
      { username: req.user.username },
      updatedData,
      { new: true, upsert: true }
    );
    res.json({ profile: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Inicia o servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`User Profile Service rodando na porta ${PORT}`);
});
