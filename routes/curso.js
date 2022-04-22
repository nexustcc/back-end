const express = require("express");
const connection = require("../mysql");
const router = express.Router();
const mysql = require("../mysql");

router.post("/cadastrarCurso/:idInstituicao", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sqlCurso = "INSERT INTO tblCurso (nome, idInstituicao) VALUES (?, ?)";
        const valuesCurso = [req.body.nome, req.params.idInstituicao];
        connection.query(sqlCurso, valuesCurso, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(201).send({
                message: "curso cadastrado",
            });
        });
    });
});

router.get("/listarCursos/:idInstituicao", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql =
            "SELECT * FROM tblcurso WHERE idInstituicao = ? ORDER BY idCurso DESC";
        connection.query(sql, req.params.idInstituicao, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(200).send({
                cursos: result,
            });
        });
    });
});

router.get("/nomeCurso/:idCurso", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql = "SELECT nome FROM tblcurso WHERE idCurso = ?";
        connection.query(sql, req.params.idCurso, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(200).send({
                nome: result,
            });
        });
    });
});

router.put("/editarCurso/:idCurso", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql = "UPDATE tblCurso SET nome = ? WHERE idCurso = ?;";
        const values = [req.body.nome, req.params.idCurso];
        connection.query(sql, values, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(202).send({
                message: "Curso editado com sucesso",
            });
        });
    });
});

router.delete("/deletarCurso/:idCurso", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql = "DELETE FROM tblcurso WHERE idCurso = ?";
        const values = [req.params.idCurso];
        connection.query(sql, values, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(202).send({
                message: "Curso deletado",
            });
        });
    });
});

module.exports = router;