const express = require("express");
const mongoose = require("mongoose");
const Content = require("./shared/models/Content");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

const app = express();
app.use(express.json());

// Conexão com o MongoDB
mongoose.connect("mongodb://mongodb:27017/contentdb");

// Função para importar dados do JSON para o MongoDB
async function importData() {
  try {
    const data = fs.readFileSync(
      path.join(__dirname, "contentData.json"),
      "utf8"
    );
    const contents = JSON.parse(data);

    // Verifica se o conteúdo já foi importado
    const isImported = await Content.findOne({
      streamKey: contents[0].streamKey,
    });

    if (isImported) {
      console.log("Conteúdo já importado");
      await createTextIndex();
      return;
    }

    // Limpa a coleção antes de inserir novos dados
    await Content.deleteMany({});
    await Content.insertMany(contents);

    await createTextIndex();

    console.log("Dados do catálogo importados com sucesso!");
  } catch (err) {
    console.error("Erro ao importar dados do catálogo:", err);
  }
}

async function createTextIndex() {
  try {
    // Get the current indexes on the collection
    const indexes = await Content.collection.getIndexes();

    // Check if the text index already exists
    // { id: [ [ '_id', 1 ] ] }
    const textIndexExists = Object.keys(indexes).some((indexName) => {
      return indexes[indexName].some(
        (index) => index[0].fieldName === "text" && index[0].weights.text === 1
      );
    });

    if (textIndexExists) {
      console.log("Índice de texto já existe");
      return;
    }

    // Cria índice de texto para melhorar a pesquisa
    Content.collection.createIndex(
      { title: "text", description: "text" },
      { weights: { title: 5, description: 1, genre: 3 } },
      (err, result) => {
        if (err) {
          console.error("Erro ao criar índice de texto:", err);
        } else {
        }
      }
    );

    console.log("Índice de texto criado com sucesso");
  } catch (err) {
    console.error("Erro ao criar índice de texto:", err);
  }
}

// Chama a função de importação ao iniciar o servidor
mongoose.connection.once("open", () => {
  console.log("Conectado ao MongoDB");
  importData();
});

// Middleware para autenticação JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token não fornecido" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Token inválido" });
    req.user = user;
    next();
  });
}

// Rota para obter todos os conteúdos
app.get("/contents", authenticateToken, async (req, res) => {
  try {
    const region = req.query.region;
    const query = {};

    if (region) {
      query["availability.regions"] = region;
    }

    const contents = await Content.find(query);
    res.json(contents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para obter conteúdo por ID (atualizada)
app.get("/contents/:id", authenticateToken, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content)
      return res.status(404).json({ message: "Conteúdo não encontrado" });

    // Verificar disponibilidade regional e de data
    const userRegion = req.user.region || "BR";
    const now = new Date();

    const isAvailable =
      content.availability.regions.includes(userRegion) &&
      now >= content.availability.from &&
      now <= content.availability.to;

    if (!isAvailable) {
      return res.status(403).json({
        message: "Conteúdo não disponível em sua região ou data atual",
      });
    }

    // Gerar o token JWT para o serviço de streaming
    const streamingToken = jwt.sign(
      {
        userId: req.user.id,
        contentId: content._id,
        streamKey: content.streamKey,
      },
      SECRET_KEY,
      { expiresIn: "2h" } // Defina o tempo de expiração conforme necessário
    );

    // Construir a URL de streaming
    const streamingUrl = `/api/streaming/vod/${content.streamKey}/${content.streamKey}.m3u8?token=${streamingToken}`;

    // Incluir a URL de streaming na resposta
    res.json({
      content,
      streamingUrl,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para obter conteúdos por palavra-chave
app.get("/search", authenticateToken, async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) {
      return res
        .status(400)
        .json({ message: 'Parâmetro de consulta "q" é obrigatório.' });
    }

    const contents = await Content.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });

    res.json(contents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/static/:file", authenticateToken, async (req, res) => {
  try {
    const file = req.params.file;
    res.sendFile(path.join(__dirname, `./static/${file}`));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Inicia o servidor
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Content Catalog Service rodando na porta ${PORT}`);
});
