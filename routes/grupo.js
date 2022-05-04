const express = require("express");
const router = express.Router();
const mysql = require("../mysql");
const multer = require("multer");

router.post("/cadastrarGrupo/:idTurma", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sqlGrupo =
            "INSERT INTO tblGrupo (numeracao, nomeGrupo,idTurma) VALUES (?, ?, ?)";
        const valuesGrupo = [
            req.body.numeracao,
            req.body.nomeGrupo,
            req.params.idTurma,
        ];

        connection.query(sqlGrupo, valuesGrupo, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(202).send({
                message: "Grupo Cadastrado com Sucesso",
            });
        });
    });
});

router.put("/editarGrupo/:idGrupo", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sqlEditGrupo =
            "UPDATE tblGrupo SET nomeProjeto = ?, temaProjeto = ?, numeracao = ?, nomeGrupo = ?, descricao = ?, dataApresentacao = ?, horaApresentacao = ? WHERE idGrupo = ?";
        const valuesGrupo = [
            req.body.nomeProjeto,
            req.body.temaProjeto,
            req.body.numeracao,
            req.body.nomeGrupo,
            req.body.descricao,
            req.body.dataApresentacao,
            req.body.horaApresentacao,
            req.params.idGrupo,
        ];

        connection.query(sqlEditGrupo, valuesGrupo, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(202).send({
                message: "Grupo Editado com Sucesso",
            });
        });
    });
});


router.put("/editarGrupoAluno/:idAluno", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sqlGrupoAluno = 'SELECT idGrupo FROM tblAluno WHERE idAluno = ?'
        connection.query(
            sqlGrupoAluno, 
            req.params.idAluno, 
            (error, result, field) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }

                let result_obj = result;
                let result_json = result_obj[Object.keys(result_obj)[0]];
                let idGrupo = result_json["idGrupo"];
                
                const sqlEditGrupo = "UPDATE tblGrupo SET temaProjeto = ?, descricao = ? WHERE idGrupo = ?";
                const valuesGrupo = [
                    req.body.temaProjeto,
                    req.body.descricao,
                    idGrupo,
                ];
        
                connection.query(sqlEditGrupo, valuesGrupo, (error, result, field) => {
                    if (error) {
                        return res.status(500).send({
                            error: error,
                            response: null,
                        });
                    }
        
                    res.status(202).send({
                        message: "Grupo Editado com Sucesso",
                    });
                });
        });

    });
});



router.get("/listarGrupo/:idGrupo", (req, res) => {
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

            res.status(200).send({
                grupo: result.map((grupo) => {
                    return {
                        idGrupo: grupo.idGrupo,
                        nomeProjeto: grupo.nomeProjeto,
                        numeracao: grupo.numeracao,
                    };
                }),
            });
        });
    });
});

router.get("/listarGrupos/:idTurma", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql = "SELECT * FROM tblGrupo WHERE idTurma = ?";
        connection.query(sql, req.params.idTurma, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(200).send({
                grupos: result.map((grupo) => {
                    return {
                        idGrupo: grupo.idGrupo,
                        nomeProjeto: grupo.nomeProjeto,
                        temaProjeto: grupo.temaProjeto,
                        numeracao: grupo.numeracao,
                        nomeGrupo: grupo.nomeGrupo,
                        dataApresentacao: grupo.dataApresentacao,
                        horaApresentacao: grupo.horaApresentacao,
                    };
                }),
            });
        });
    });
});

router.get("/pegarInstituicao/:idAvaliador", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql = "SELECT idInstituicao FROM tblAvaliador WHERE idAvaliador = ?";
        connection.query(sql, req.params.idAvaliador, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(202).send({
                idInstituicao: result[0].idInstituicao,
            });
        });
    });
});



router.delete("/deletarGrupo/:idGrupo", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql = "DELETE FROM tblGrupo WHERE idGrupo = ?";
        connection.query(sql, req.params.idGrupo, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(200).send({
                message: "grupo deletado",
            });
        });
    });
});

module.exports = router;