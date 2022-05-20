/**
 * TODO: Preciso fazer as rotas de DELETE Tópico (Aluno) e DELETE Tópico (Grupo), ao deletar um tópico, deverá deletar as tarefas existentes nele e qualquer relação que contenha o id a ser deletado
 * TODO: Coloque essas duas rotas depois de router.put("/editarTopicoGrupo/:idTopicoGrupo"), para ficar mais organizado
 * TODO: Também preciso fazer: GET Tópico (Aluno), GET Tópico (Grupo), GET Tarefa (Aluno), GET Tarefa (Grupo), utilizando o converterData do date.js para converter e formatar as datas
 * TODO: Farei primeiro os GETS que faltam e depois os DELETES que faltam
 * TODO: Fazer também GET de Tarefa Específica
 *
 * TODO: GET Topico (Aluno) e GET Topico(Grupo)
 * TODO: DELETE Topico (Aluno) e DELETE Topico(Grupo)
 * TODO: PUT idCor em Topico(Aluno) e PUT idCor em Topico(Grupo)
 * TODO: GET Tarefas de um Tópico Específico (Aluno) passando idAluno, assim vai retornar tudo de uma vez e nao será necessário fazer vários fetchs
 * **/

const express = require("express");
const router = express.Router();
const mysql = require("../mysql");
const converterData = require("./utils/date");

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
        const valuesTopico = [req.body.nome, 2, req.params.idAluno];

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

router.post("/cadastrarTopicoGrupo/:idAluno", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let idGrupo;

        const sqlGrupo = "SELECT idGrupo FROM tblaluno WHERE idAluno = ?";
        connection.query(sqlGrupo, req.params.idAluno, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            let result_obj = result;
            let result_json = result_obj[Object.keys(result_obj)[0]];
            idGrupo = result_json["idGrupo"];

            const sqlTopico =
                "INSERT INTO tblTopicoGrupo (nome, idCor, idGrupo) VALUES (?, ?, ?)";
            const valuesTopico = [req.body.nome, 2, idGrupo];
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
});

router.put("/editarTopicoAluno/:idTopicoAluno", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql = "UPDATE tblTopicoAluno SET nome = ? WHERE idTopicoAluno = ?;";
        const values = [req.body.nome, req.params.idTopicoAluno];
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

        const sql = "UPDATE tblTopicoGrupo SET nome = ? WHERE idTopicoGrupo = ?;";
        const values = [req.body.nome, req.params.idTopicoGrupo];
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

router.get("/listarTarefas/:idTopicoAluno", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql = "SELECT * FROM tblTarefa WHERE idTopicoAluno = ?";
        connection.query(sql, req.params.idTopicoAluno, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(200).send({
                Tarefas: result.map((tarefa) => {
                    return {
                        idTarefa: tarefa.idTarefa,
                        status: tarefa.status,
                        prioridade: tarefa.prioridade,
                        nome: tarefa.nome,
                        dataInicio: converterData(tarefa.dataInicio),
                        dataConclusao: converterData(tarefa.dataConclusao),
                        idTopicoAluno: tarefa.idTopicoAluno,
                        idCor: tarefa.idCor,
                        idAluno: tarefa.idAluno,
                    };
                }),
            });
        });
    });
});

router.post("/cadastrarTarefa/:idTopicoAluno", (req, res) => {
    mysql.connect((error, connection) => {
        // if (error) {
        //     return res.status(500).send({
        //         error: error,
        //     });
        // }

        var dateTime = new Date();
        var dateSplit = dateTime.toISOString().split(["T"]);

        const sqlTarefa =
            "INSERT INTO tblTarefa (status, prioridade, nome, dataInicio, dataConclusao, idTopicoAluno, idCor, idAluno) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const valuesTarefa = [
            "Não iniciada",
            "Média",
            req.body.nome,
            dateSplit[0],
            req.body.dataConclusao,
            req.params.idTopicoAluno,
            2,
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

////////////////////////////////////////////////////////////////////////////////////////////////
//Ainda não iniciado

// router.get("/listarTarefasGerais/:idTopicoGrupo", (req, res) => {
//     mysql.connect((error, connection) => {
//         if (error) {
//             return res.status(500).send({
//                 error: error,
//             });
//         }

//         const sql = "SELECT * FROM tblTarefa WHERE idTopicoAluno = ?";
//         connection.query(sql, req.params.idTopicoAluno, (error, result, field) => {
//             if (error) {
//                 return res.status(500).send({
//                     error: error,
//                     response: null,
//                 });
//             }

//             res.status(200).send({
//                 Tarefas: result.map((tarefa) => {
//                     return {
//                         idTarefa: tarefa.idTarefa,
//                         status: tarefa.status,
//                         prioridade: tarefa.prioridade,
//                         nome: tarefa.nome,
//                         dataInicio: converterData(tarefa.dataInicio),
//                         dataConclusao: converterData(tarefa.dataConclusao),
//                         idTopicoAluno: tarefa.idTopicoAluno,
//                         idCor: tarefa.idCor,
//                         idAluno: tarefa.idAluno
//                     };
//                 }),
//             });
//         });
//     });
// });
////////////////////////////////////////////////////////////////////////////////////////////////

router.post("/cadastrarTarefaGeral/:idTopicoGrupo", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let idTarefaGeral;
        let idAlunos;

        var dateTime = new Date();
        var dateSplit = dateTime.toISOString().split(["T"]);

        const sqlTarefa =
            "INSERT INTO tblTarefaGeral (status, prioridade, nome, dataInicio, dataConclusao, idTopicoGrupo, idCor) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const valuesTarefa = [
            "Não iniciada",
            "Média",
            req.body.nome,
            dateSplit[0],
            req.body.dataConclusao,
            req.params.idTopicoGrupo,
            2,
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

router.delete("/deletarTarefa/:idTarefa", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql = "DELETE FROM tblTarefa WHERE idTarefa = ?";
        connection.query(sql, req.params.idTarefa, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(200).send({
                message: "tarefa deletada",
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

// router.delete("/deletarTarefaGeral/:idTarefaGeral", (req, res) => {
//     if (error) {
//         return res.status(500).send({
//             error: error,
//         });
//     }
// });

router.get("/listarAlunosGrupo/:idAluno", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }
    });
});

module.exports = router;