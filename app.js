const express = require('express');
const session = require('express-session');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config();

console.log(process.env.SECRET);

const app = express();

let collection;
let db;

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SECRET || "5364",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Middleware para verificar autenticação
function estaAutenticado(req, res, next) {
    if (req.session.username) {
        return next();
    } else {
        return res.status(401).redirect('/login.html');
    }
}

// Rota protegida antes de servir o ficheiro estático
app.use('/pesquisa.html', estaAutenticado, (req, res, next) => {
    next(); // deixa passar se autenticado
});

// Servir ficheiros estáticos da pasta "publico"
app.use(express.static('publico'));

app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await collection.findOne({ username });
    if (!user) {
      // User not found
      return res.status(401).send(`
        <script>
          alert('Nome de utilizador ou palavra-passe incorretos. Tente novamente.');
          window.location.href = '/login.html';
        </script>
      `);
    }

    // Compara a password entrada com a hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      // Password incorreta
      return res.status(401).send(`
        <script>
          alert('Nome de utilizador ou palavra-passe incorretos. Tente novamente.');
          window.location.href = '/login.html';
        </script>
      `);
    }

    // Password cooreta - login sucesso
    req.session.username = user.username;
    res.redirect('/pesquisa.html');

  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).send('Erro interno ao tentar fazer login');
  }
});

// Register
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await collection.findOne({ username });
    if (existingUser) {
      return res.send(`
        <script>
          alert('Este utilizador já existe. Tente outro.');
          window.location.href = '/register.html';
        </script>
      `);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await collection.insertOne({ username, password: hashedPassword });

    res.send(`
      <script>
        alert('Conta criada com sucesso. Faça login.');
        window.location.href = '/login.html';
      </script>
    `);
  } catch (err) {
    console.error("Erro ao registar:", err);
    res.status(500).send("Erro ao criar conta.");
  }
});

// Rota secreta autenticada
app.get('/segredo', estaAutenticado, (req, res) => {
    res.send(`
        <h1>Bem-vindo, ${req.session.username}!</h1>
        <p><a href="/pesquisa.html">Ir para a pesquisa</a></p>
        <p><a href="/logout">Logout</a></p>
    `);
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login.html');
});

// API protegida para pesquisa de país
app.get('/pesquisa/:pais', estaAutenticado, async (req, res) => {
    const pais = req.params.pais;
    const restcountriesAPI = `https://restcountries.com/v3.1/name/${encodeURIComponent(pais)}`;

    try {
        const resposta = await fetch(restcountriesAPI);
        if (!resposta.ok) {
            return res.status(404).send({ error: 'País não encontrado' });
        }

        const resultado = await resposta.json();
        const dados = resultado[0];

        const capital = dados.capital ? dados.capital[0] : "Desconhecida";
        const info = {
            nome: dados.name.common,
            capital,
            populacao: dados.population,
            bandeira: dados.flags?.png || ""
        };

        if (capital !== "Desconhecida") {
            const WEATHERMAPKEY = process.env.WEATHERMAPKEY;
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(capital)}&units=metric&appid=${WEATHERMAPKEY}`;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(capital)}&units=metric&appid=${WEATHERMAPKEY}`;

            const [weatherRes, forecastRes] = await Promise.all([
                fetch(weatherUrl),
                fetch(forecastUrl)
            ]);

            const weatherData = await weatherRes.json();
            const forecastData = await forecastRes.json();

            if (!weatherRes.ok || !weatherData.weather || !Array.isArray(weatherData.weather) || weatherData.weather.length === 0) {
                return res.status(500).json({ error: 'Erro ao obter dados do tempo atual' });
            }

            if (!forecastRes.ok || !forecastData.list || !Array.isArray(forecastData.list)) {
                return res.status(500).json({ error: 'Erro ao obter previsão meteorológica' });
            }

            info.tempo = {
                atual: {
                    descricao: weatherData.weather[0].description,
                    temperatura: weatherData.main.temp,
                    icone: weatherData.weather[0].icon
                },
                previsao: forecastData.list.slice(0, 5).map(item => ({
                    data: item.dt_txt,
                    temp: item.main.temp,
                    descricao: item.weather[0].description,
                    icone: item.weather[0].icon
                }))
            };
        }

        console.log("Resultado:", info);
        res.json(info);
    } catch (err) {
        console.error("Erro na pesquisa do país:", err);
        res.status(500).send({ error: 'Erro interno ao consultar país' });
    }
});

// Iniciar servidor + MongoDB
async function start() {
    try {
        const client = new MongoClient(process.env.MONGOURI || "mongodb+srv://dqnielmorais2002:xmpmKUMBg9svJeni@localcluster.1uxcyi4.mongodb.net/usersdb?retryWrites=true&w=majority&appName=LocalCluster");
        await client.connect();
        console.log("Conectado ao MongoDB");

        db = client.db("usersdb");
        collection = db.collection("users");

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log("Servidor a correr na porta", PORT);
        });
    } catch (err) {
        console.error("Erro ao iniciar a aplicação:", err);
    }
}

start();
