// PARA O ALUNO SER CADASTRADO, É NECESSÁRIO QUE TENHA UM GRUPO CRIADO, EU, ARTUR, E A ANA PENSAMOS NUMA SAÍDA
// A SAÍDA FOI QUE, TODA INSTITUICAO JA VENHA COM UM GRUPO NULO, ONDE O ALUNO NA HORA QUE FOR CADASTRADO, IRÁ PRA ESSE GRUPO NULO E,
// DEPOIS QUE O PROFESSOR CRIAR OS GRUPOS OFICIAIS, ELE IRÁ EDITAR O ALUNO E COLOCÁ-LO NO GRUPO

const express = require("express");
const router = express.Router();
const mysql = require("../mysql");
const randomizarSenha = require("./utils/senha");
const enviarEmail = require("./utils/enviarEmail");
const run = require("./utils/enviarEmail");
const multer = require("multer");
const md5 = require("md5");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, md5(file.originalname) + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/svg+xml"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

router.post("/cadastrarAluno/:idTurma", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let senha = randomizarSenha();

        let idUsuario;

        const sqlUsuario =
            "INSERT INTO tblUsuario (nome, email, senha) VALUES (?, ?, ?)";
        const valuesUsuario = [req.body.nome, req.body.email, senha];
        connection.query(sqlUsuario, valuesUsuario, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }
            console.log("cadastrou usuario");
            idUsuario = result.insertId;
            idGrupo = 0;

            const sqlAluno =
                "INSERT INTO tblAluno (idTurma, idUsuario, idGrupo) VALUES (?, ?, ?)";
            const valuesAluno = [req.params.idTurma, idUsuario, req.body.idGrupo];
            connection.query(sqlAluno, valuesAluno, (error, result, field) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }

                run(senha, req.body.email, req.body.nome);

                res.status(202).send({
                    message: "Aluno Cadastrado com Sucesso",
                });
            });
        });
    });
});

router.put("/editarAluno/:idAluno", upload.single("foto"), (req, res) => {
    console.log(req.file);
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let idUsuario;

        const sqlGetIdUsuario = "SELECT idUsuario FROM tblAluno WHERE idAluno = ?";
        const valuesGetIdUsuario = [req.params.idAluno];

        connection.query(
            sqlGetIdUsuario,
            valuesGetIdUsuario,
            (error, result, field) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }
                let result_obj = result;
                let result_json = result_obj[Object.keys(result_obj)[0]];
                idUsuario = result_json["idUsuario"];

                const sqlEditUsuario =
                    "UPDATE tblUsuario SET nome = ?, email = ?, senha = ? WHERE idUsuario = ?";
                const valuesUsuario = [
                    req.body.nome,
                    req.body.email,
                    req.body.senha,
                    idUsuario,
                ];
                connection.query(
                    sqlEditUsuario,
                    valuesUsuario,
                    (error, result, field) => {
                        if (error) {
                            return res.status(500).send({
                                error: error,
                                response: null,
                            });
                        }

                        let foto;

                        if (req.file == undefined) {
                            foto = "uploads/fotopadrao.svg";
                        } else {
                            foto = req.file.path;
                        }

                        const sqlEditAluno =
                            "UPDATE tblAluno SET foto = ? WHERE idAluno = ?";
                        const valuesEditAluno = [foto, req.params.idAluno];
                        mysql.query(
                            sqlEditAluno,
                            valuesEditAluno,
                            (error, result, field) => {
                                if (error) {
                                    return res.status(500).send({
                                        error: error,
                                        response: null,
                                    });
                                }

                                res.status(201).send({
                                    message: "aluno editado",
                                });
                            }
                        );
                    }
                );
            }
        );
    });
});

// PRECISA DE DOIS GETS, UM DE ALUNO ESPECIFICO E OUTRO DE ALUNOS DE UMA TURMA
// AINDA ESTÁ SENDO REALIZADO (22/04/2022 às 18:11)

router.get("/listarProfessor/:idProfessor", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql =
            "SELECT * FROM tblProfessor INNER JOIN tblUsuario ON tblProfessor.idUsuario = tblUsuario.idUsuario WHERE idProfessor = ?";
        const values = [req.params.idProfessor];
        connection.query(sql, values, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(200).send({
                professor: result.map((professor) => {
                    return {
                        foto: professor.foto,
                        usuario: {
                            nome: professor.nome,
                            email: professor.email,
                            senha: professor.senha,
                        },
                    };
                }),
            });
        });
    });
});

module.exports = router;