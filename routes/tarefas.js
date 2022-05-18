/**
 * TODO: Preciso fazer as rotas de DELETE Tópico (Aluno) e DELETE Tópico (Grupo), ao deletar um tópico, deverá deletar as tarefas existentes nele e qualquer relação que contenha o id a ser deletado
 * TODO: Coloque essas duas rotas depois de router.put("/editarTopicoGrupo/:idTopicoGrupo"), para ficar mais organizado
 * TODO: Também preciso fazer: GET Tópico (Aluno), GET Tópico (Grupo), GET Tarefa (Aluno), GET Tarefa (Grupo), utilizando o converterData do date.js para converter e formatar as datas
 * TODO: Farei primeiro os GETS que faltam e depois os DELETES que faltam
 * **/

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

router.post("/cadastrarTarefa/:idTopicoAluno", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sqlTarefa =
            "INSERT INTO tblTarefa (status, prioridade, nome, dataInicio, dataConclusao, idTopicoAluno, idCor, idAluno) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const valuesTarefa = [
            req.body.status,
            req.body.prioridade,
            req.body.nome,
            req.body.dataInicio,
            req.body.dataConclusao,
            req.params.idTopicoAluno,
            req.body.idCor,
            req.body.idAluno,
        ];

        connection.query(sqlTarefa, valuesTarefa, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(202).send({
                message: "Tarefa de Aluno cadastrada com sucesso",
            });
        });
    });
});

router.post("/cadastrarTarefaGeral/:idTopicoGrupo", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let idTarefaGeral;
        let idAlunos;

        const sqlTarefa =
            "INSERT INTO tblTarefaGeral (status, prioridade, nome, dataInicio, dataConclusao, idTopicoGrupo, idCor) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const valuesTarefa = [
            req.body.status,
            req.body.prioridade,
            req.body.nome,
            req.body.dataInicio,
            req.body.dataConclusao,
            req.params.idTopicoGrupo,
            req.body.idCor,
        ];

        connection.query(sqlTarefa, valuesTarefa, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            idTarefaGeral = result.insertId;

            console.log("id da TarefaGeral criada " + idTarefaGeral);

            idAlunos = req.body.idAlunos;

            console.log("idAlunos (todos) " + idAlunos);
            console.log("Quantidade de alunos " + idAlunos.length);

            let sqlTarefaAluno =
                "INSERT INTO tblTarefaAluno (idTarefaGeral, idAluno) VALUES (?, ?)";

            for (let a = 0; a < idAlunos.length; a++) {
                connection.query(
                    sqlTarefaAluno,
                    [idTarefaGeral, idAlunos[a]],
                    (error, result, field) => {
                        if (error) {
                            return res.status(500).send({
                                error: error,
                                response: null,
                            });
                        }

                        console.log("idAlunos (for) " + idAlunos[a]);
                    }
                );
            }

            res.status(202).send({
                message: "Tarefa de Grupo (Inserindo na tabela intermediária tblTarefaAluno) cadastrada com sucesso",
            });
        });
    });
});

router.put("/editarTarefa/:idTarefa", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql =
            "UPDATE tblTarefa SET status = ?, prioridade = ?, nome = ?, dataInicio = ?, dataConclusao = ?, idTopicoAluno = ?, idCor = ? WHERE idTarefa = ?;";
        const values = [
            req.body.status,
            req.body.prioridade,
            req.body.nome,
            req.body.dataInicio,
            req.body.dataConclusao,
            req.body.idTopicoAluno,
            req.body.idCor,
            req.params.idTarefa,
        ];

        connection.query(sql, values, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(202).send({
                message: "Tarefa de Aluno editada com sucesso",
            });
        });
    });
});

router.put("/editarTarefaGeral/:idTarefaGeral", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql =
            "UPDATE tblTarefaGeral SET status = ?, prioridade = ?, nome = ?, dataInicio = ?, dataConclusao = ?, idTopicoGrupo = ?, idCor = ? WHERE idTarefaGeral = ?;";
        const values = [
            req.body.status,
            req.body.prioridade,
            req.body.nome,
            req.body.dataInicio,
            req.body.dataConclusao,
            req.body.idTopicoGrupo,
            req.body.idCor,
            req.params.idTarefaGeral,
        ];

        connection.query(sql, values, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(202).send({
                message: "Tarefa de Grupo editada com sucesso",
            });
        });
    });
});

module.exports = router;