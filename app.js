const express = require("express");
const cors = require("cors");
const app = express();
const morgan = require("morgan");
app.use("/uploads", express.static("uploads"));
const bodyParser = require("body-parser");

const rotaCartao = require("./routes/cartao");
const rotaInstituicao = require("./routes/instituicao");
const rotaCurso = require("./routes/curso");
const rotaTurma = require("./routes/turma");
const rotaProfessor = require("./routes/professor");
const rotaAvaliador = require("./routes/avaliador");
const rotaAluno = require("./routes/aluno");
const rotaGrupo = require("./routes/grupo");
const rotaLogin = require("./routes/login");
const rotaMobile = require('./routes/mobile')
const rotaMembros = require('./routes/membros')

app.use(morgan("dev"));
app.use(cors());
app.use(
    bodyParser.urlencoded({
        extended: false,
    })
);
app.use(bodyParser.json());

app.use((req, res, next) => {
    req.header("Access-Control-Allow-Credentials", true);
    req.header("Access-Control-Allow-Origin", "*" /*'nexustcc.software'*/ );
    res.header("Access-Control-Allow-Methods", "POST, PUT, GET, PATCH, DELETE");
    req.header(
        "Access-Control-Allow-Header",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );

    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "POST, PUT, GET, PATCH, DELETE");
        return res.status(200).send({});
    }

    next();
});

app.use("/instituicao", rotaInstituicao);
app.use("/cartao", rotaCartao);
app.use("/curso", rotaCurso);
app.use("/turma", rotaTurma);
app.use("/professor", rotaProfessor);
app.use("/avaliador", rotaAvaliador);
app.use("/aluno", rotaAluno);
app.use("/grupo", rotaGrupo);
app.use("/login", rotaLogin);
app.use("/mobile", rotaMobile);
app.use("/membros", rotaMembros);

app.use((req, res, next) => {
    const erro = new Error("Não encontrado!");
    erro.status = 404;
    next(erro);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    return res.send({
        erro: {
            message: error.message,
        },
    });
});

module.exports = app;