# API Mashup - Pesquisa de Países e Clima

Projeto desenvolvido para a unidade curricular de Programação Web - Trabalho #2.

## Identificação do Grupo

* Daniel Morais

## Descrição do Projeto

Esta aplicação web permite aos utilizadores registarem-se, efetuarem login e, após autenticação, pesquisarem informações sobre qualquer país através da integração de duas APIs externas:

* [REST Countries API](https://restcountries.com): Nome, capital, população e bandeira do país.
* [OpenWeatherMap API](https://openweathermap.org/): Clima atual e previsão meteorológica da capital.

A aplicação utiliza autenticação com sessões Express e armazena os dados dos utilizadores (username e password com hash) em MongoDB.

## Tecnologias Utilizadas

* **Frontend**: HTML, CSS, JavaScript
* **Backend**: Node.js, Express
* **Autenticação**: express-session, bcrypt
* **Base de dados**: MongoDB Atlas
* **APIs externas**: REST Countries API, OpenWeatherMap API

## Instalação e Configuração

### 1. Clonar o repositório

```bash
git clone <url-do-repositório>
cd <nome-do-projeto>
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Crie um ficheiro `.env` na raiz do projeto com o seguinte conteúdo:

```env
SECRET=sua_chave_secreta
MONGOURI=sua_string_de_conexao_mongodb
WEATHERMAPKEY=sua_chave_api_openweathermap
PORT=3000
```

### 4. Certifique-se que o MongoDB está a correr

* Pode usar o [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) ou uma instância local.

## Executar o Projeto

### Modo normal

```bash
node app.js
```

A aplicação ficará disponível em [http://localhost:3000](http://localhost:3000) (ou outra porta definida no `.env`).

## Estrutura do Projeto

```
/api-mashup/
├── app.js
├── publico/
│   ├── login.html
│   ├── register.html
│   ├── pesquisa.html
│   ├── estilo.css
│   └── pesquisa.js
├── .env
├── package.json
└── README.md
```

## Como Usar

1. Aceda a `/register.html` para criar uma nova conta.
2. Faça login em `/login.html` com as suas credenciais.
3. Após o login, será redirecionado para `/pesquisa.html`.
4. Pesquise por um país para obter:
   * Nome, capital, população e bandeira (REST Countries)
   * Clima atual e previsão dos próximos dias (OpenWeatherMap)
5. Pode terminar a sessão clicando em "Logout".

## Link de Deployment

\[https://trabalho2-mashup-apis-dqn13lmora1s.onrender.com]

## Observações

* As passwords dos utilizadores são armazenadas com hash (bcrypt).
* As requisições às APIs externas são feitas no servidor, protegendo as chaves de API.
* O projeto pode ser facilmente expandido com novas funcionalidades (ex: guardar histórico de pesquisas).

---

Bom desenvolvimento!
