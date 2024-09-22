// server.js
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./shared/models/User'); // Import the User model
const SECRET_KEY = process.env.SECRET_KEY;
const VALID_REGIONS = ['BR', 'US', 'CA']; // Lista de regiões válidas

const app = express();
app.use(express.json());

// Conexão com o MongoDB
mongoose.connect('mongodb://mongodb:27017/db')


// Rota de autenticação
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verifica se o usuário existe no banco de dados
    const user = await User.findOne({ email, password }); // Adjusted to match your schema

    if (user) {
      const token = jwt.sign({ id: user._id, username: user.email, region: user.region }, SECRET_KEY, {
        expiresIn: '1h',
      });

      res.json({ token });
    } else {
      res.status(401).json({ message: 'Credenciais inválidas' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

app.post('/register', async (req, res) => {
  const { email, nome, password, region } = req.body;

  try {
    // Verifica se o usuário já existe no banco de dados
    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'Usuário já cadastrado' });
    }

    // Verifica se a região é válida
    if (!VALID_REGIONS.includes(region)) {
      return res.status(400).json({ message: 'Região inválida' });
    }

    // Cria um novo usuário no banco de dados
    const newUser = new User({ email, nome, password, region });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id, username: newUser.email, region: newUser.region }, SECRET_KEY, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Auth service rodando na porta ${PORT}`);
});