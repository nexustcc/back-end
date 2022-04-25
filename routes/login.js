const express = require("express");
const router = express.Router();
const mysql = require("../mysql");

router.post("/", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql =
            "SELECT idUsuario, nome FROM tblUsuario WHERE email = ? AND senha = ?";
        const values = [req.body.email, req.body.senha];
        connection.query(sql, values, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            let idUsuario;
            let nome;

            if (result != "") {
                idUsuario = result[Object.keys(result)[0]]["idUsuario"];
                nome = result[Object.keys(result)[0]]["nome"];

                const sqlInstituicao =
                    "SELECT idInstituicao FROM tblInstituicao WHERE idUsuario = ?";
                connection.query(sqlInstituicao, idUsuario, (error, result, field) => {
                    if (error) {
                        return res.status(500).send({
                            error: error,
                            response: null,
                        });
                    }

                    if (result != "") {
                        let idInstituicao = result[Object.keys(result)[0]]["idInstituicao"];

                        res.status(201).send({
                            idUsuario: idUsuario,
                            idTipo: idInstituicao,
                            nome: nome,
                            tipo: "instituição",
                        });
                    } else {
                        const sqlProfessor =
                            "SELECT idProfessor FROM tblProfessor WHERE idUsuario = ?";
                        connection.query(
                            sqlProfessor,
                            idUsuario,
                            (error, result, field) => {
                                if (error) {
                                    return res.status(500).send({
                                        error: error,
                                        response: null,
                                    });
                                }

                                if (result != "") {
                                    let idProfessor =
                                        result[Object.keys(result)[0]]["idProfessor"];

                                    res.status(201).send({
                                        idUsuario: idUsuario,
                                        idTipo: idProfessor,
                                        nome: nome,
                                        tipo: "professor",
                                    });
                                } else {
                                    const sqlAluno =
                                        "SELECT idAluno FROM tblAluno WHERE idUsuario = ?";
                                    connection.query(
                                        sqlAluno,
                                        idUsuario,
                                        (error, result, field) => {
                                            if (error) {
                                                return res.status(500).send({
                                                    error: error,
                                                    response: null,
                                                });
                                            }

                                            if (result != "") {
                                                let idAluno = result[Object.keys(result)[0]]["idAluno"];

                                                res.status(201).send({
                                                    idUsuario: idUsuario,
                                                    idTipo: idAluno,
                                                    nome: nome,
                                                    tipo: "aluno",
                                                });
                                            } else {
                                                const sqlAvaliador =
                                                    "SELECT idAvaliador FROM tblAluno WHERE idUsuario = ?";
                                                connection.query(
                                                    sqlAvaliador,
                                                    idUsuario,
                                                    (error, result, field) => {
                                                        if (error) {
                                                            return res.status(500).send({
                                                                error: error,
                                                                response: null,
                                                            });
                                                        }

                                                        let idAvaliador =
                                                            result[Object.keys(result)[0]]["idAvaliador"];

                                                        res.status(201).send({
                                                            idUsuario: idUsuario,
                                                            idTipo: idAvaliador,
                                                            nome: nome,
                                                            tipo: "avaliador",
                                                        });
                                                    }
                                                );
                                            }
                                        }
                                    );
                                }
                            }
                        );
                    }
                });
            } else {
                res.status(201).send({
                    message: "email ou senha inválidos",
                });
            }
        });
    });
});

module.exports = router;