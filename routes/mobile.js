const express = require("express");
const res = require("express/lib/response");
const router = express.Router();
const mysql = require("../mysql");
const converterData = require("./utils/date");

router.get("/avaliador/listarGruposAvaliador/:idAvaliador", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql =
            "SELECT nomeProjeto, temaProjeto FROM tblGrupo INNER JOIN tblAvaliadorGrupo ON tblGrupo.idGrupo = tblAvaliadorGrupo.idGrupo WHERE idAvaliador = ?";
        const values = [req.params.idAvaliador];
        connection.query(sql, values, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(200).send(result);
        });
    });
});

router.get("/avaliador/listarGrupo/:idGrupo", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql = "SELECT * FROM tblGrupo WHERE idGrupo = ?";
        connection.query(sql, req.params.idGrupo, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(200).send(
                result.map((grupo) => {
                    return {
                        idGrupo: grupo.idGrupo,
                        nomeProjeto: grupo.nomeProjeto,
                        temaProjeto: grupo.temaProjeto,
                        descricaoProjeto: grupo.descricao,
                        numeracao: grupo.numeracao,
                        nomeGrupo: grupo.nomeGrupo,
                        dataApresentacao: converterData(grupo.dataApresentacao),
                        horaApresentacao: grupo.horaApresentacao,
                    };
                })
            );
        });
    });
});

router.get("/avaliador/listarAlunosGrupo/:idGrupo", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql =
            "SELECT tblUsuario.nome, tblAluno.foto FROM tblAluno INNER JOIN tblUsuario ON tblAluno.idUsuario = tblUsuario.idUsuario WHERE tblAluno.idGrupo = ?";
        connection.query(sql, req.params.idGrupo, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(200).send(result);
        });
    });
});

router.get("/avaliador/listarProfessoresGrupo/:idGrupo", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql =
            "SELECT tblUsuario.nome, tblProfessor.foto FROM tblProfessor INNER JOIN tblUsuario ON tblProfessor.idUsuario = tblUsuario.idUsuario INNER JOIN tblProfessorGrupo ON tblProfessor.idProfessor = tblProfessorGrupo.idProfessor WHERE tblProfessorGrupo.idGrupo = ?";
        connection.query(sql, req.params.idGrupo, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(200).send(result);
        });
    });
});

module.exports = router;