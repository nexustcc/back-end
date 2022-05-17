const express = require("express");
const router = express.Router();
const mysql = require("../mysql");

router.get("/listarCores", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sqlCor = "SELECT * FROM tblCor";

        connection.query(sqlCor, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(200).send({
                cores: result.map((cor) => {
                    return {
                        idCor: cor.idCor,
                        nome: cor.nome,
                        codigoHexadecimal: cor.codigoHexadecimal,
                    };
                }),
            });
        });
    });
});

router.post("/cadastrarTopicoAluno/:idAluno", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sqlTopico =
            "INSERT INTO tblTopicoAluno (nome, idCor, idAluno) VALUES (?, ?, ?)";
        const valuesTopico = [req.body.nome, req.body.idCor, req.params.idAluno];

        connection.query(sqlTopico, valuesTopico, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(202).send({
                message: "Tópico de Aluno Cadastrado com Sucesso",
            });
        });
    });
});

router.post("/cadastrarTopicoGrupo/:idGrupo", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sqlTopico =
            "INSERT INTO tblTopicoGrupo (nome, idCor, idGrupo) VALUES (?, ?, ?)";
        const valuesTopico = [req.body.nome, req.body.idCor, req.params.idGrupo];

        connection.query(sqlTopico, valuesTopico, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(202).send({
                message: "Tópico de Grupo Cadastrado com Sucesso",
            });
        });
    });
});

router.put("/editarTopicoAluno/:idTopicoAluno", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql =
            "UPDATE tblTopicoAluno SET nome = ?, idCor = ? WHERE idTopicoAluno = ?;";
        const values = [req.body.nome, req.body.idCor, req.params.idTopicoAluno];
        connection.query(sql, values, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(202).send({
                message: "Topico de Aluno editado com sucesso",
            });
        });
    });
});

router.put("/editarTopicoGrupo/:idTopicoGrupo", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql =
            "UPDATE tblTopicoGrupo SET nome = ?, idCor = ? WHERE idTopicoGrupo = ?;";
        const values = [req.body.nome, req.body.idCor, req.params.idTopicoGrupo];
        connection.query(sql, values, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(202).send({
                message: "Topico de Grupo editado com sucesso",
            });
        });
    });
});

// router.post("/cadastrarTarefa/:idAluno", (req, res) => {
// mysql.connect((error, connection) => {
//     if (error) {
//         return res.status(500).send({
//             error: error,
//         });
//     }

//         const sqlTarefa =
//             "INSERT INTO tblTarefa (status, prioridade, nome, dataInicio, dataConclusao, idTopico, idCor, idAluno) VALUES (?, ?, ?)";
//         const valuesTarefa = [

//         ];
//     });
// });

module.exports = router;