const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Watchlist = require('./shared/models/Watchlist');
const Content = require('./shared/models/Content');

const app = express();
app.use(express.json());

// Conexão com o MongoDB
mongoose.connect('mongodb://mongodb:27017/db');

// Middleware para autenticação JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.user = user;
    next();
  });
}

// Rota para obter a watchlist do usuário
app.get('/list', authenticateToken, async (req, res) => {
  try {
    const watchlist = await Watchlist.findOne({ username: req.user.username });
    if (!watchlist) return res.json({ contents: [] });
    res.json({ contents: watchlist.contents });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para adicionar um item à watchlist
app.post('/add', authenticateToken, async (req, res) => {
  try {
    const { contentId } = req.body;
    if (!contentId) return res.status(400).json({ message: 'ContentId é obrigatório' });

    let watchlist = await Watchlist.findOne({ username: req.user.username });

    if (!watchlist) {
      watchlist = new Watchlist({ username: req.user.username, contents: [] });
    }

    // Verifica se o conteúdo já está na watchlist
    const contentExists = watchlist.contents.some((item) => item.contentId.toString() === contentId);

    if (contentExists) {
      return res.status(400).json({ message: 'Conteúdo já está na watchlist' });
    }

    watchlist.contents.push({ contentId });
    await watchlist.save();
    res.status(201).json({ message: 'Conteúdo adicionado à watchlist' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para remover um item da watchlist
app.post('/remove', authenticateToken, async (req, res) => {
  try {
    const { contentId } = req.body;
    if (!contentId) return res.status(400).json({ message: 'ContentId é obrigatório' });

    const watchlist = await Watchlist.findOne({ username: req.user.username });

    if (!watchlist) {
      return res.status(404).json({ message: 'Watchlist não encontrada' });
    }

    // Remove o conteúdo da watchlist
    watchlist.contents = watchlist.contents.filter((item) => item.contentId.toString() !== contentId);

    await watchlist.save();
    res.json({ message: 'Conteúdo removido da watchlist' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Inicia o servidor
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Watchlist Service rodando na porta ${PORT}`);
});
