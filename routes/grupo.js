const express = require("express");
const router = express.Router();
const mysql = require("../mysql");
const converterData = require("./utils/date");
const multer = require("multer");
const e = require("express");

router.post("/cadastrarGrupo/:idTurma", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sqlGrupo =
            "INSERT INTO tblGrupo (numeracao, nomeGrupo, idTurma) VALUES (?, ?, ?)";
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

            idGrupo = result.insertId;
            console.log ("idGrupo: " + idGrupo);

            idProfessores = req.body.idProfessores;
            console.log ("idProfessores: " + idProfessores);

            let sqlGrupos =
                "INSERT INTO tblProfessorGrupo (idGrupo, idProfessor) VALUES (?, ?)";

            for (let p = 0; p < idProfessores.length; p++) {
                connection.query(
                    sqlGrupos,
                    [idGrupo, idProfessores[p]]
                    //(error, result, field) => {
                        // if (error) {
                        //     return res.status(500).send({
                        //         error: error,
                        //         response: null,
                        //     });
                        // }
                    //}
                );

                console.log(idProfessores[p]);
            }

            res.status(202).send({
                message: "Grupo Cadastrado",
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

        const sqlGrupoAluno = "SELECT idGrupo FROM tblAluno WHERE idAluno = ?";
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

                const sqlEditGrupo =
                    "UPDATE tblGrupo SET temaProjeto = ?, descricao = ? WHERE idGrupo = ?";
                const valuesGrupo = [req.body.temaProjeto, req.body.descricao, idGrupo];

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
            }
        );
    });
});

router.put("/editarGrupoProfessor/:idGrupo", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sqlEditGrupo = "UPDATE tblGrupo SET temaProjeto = ?, descricao = ?, dataApresentacao = ?, horaApresentacao = ? WHERE idGrupo = ?";
        const valuesGrupo = [
            req.body.temaProjeto,
            req.body.descricao,
            req.body.dataApresentacao,
            req.body.horaApresentacao,
            req.params.idGrupo
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

            res.status(200).send(
                result.map((grupo) => {
                    return {
                        idGrupo: grupo.idGrupo,
                        nomeProjeto: grupo.nomeProjeto,
                        temaProjeto: grupo.temaProjeto,
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

router.get("/listarGrupos/:idTurma", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql = "SELECT * FROM tblGrupo WHERE idTurma = ? ORDER BY numeracao";
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

router.get("/informacoesGrupo/:idGrupo", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let grupo;
        let alunos;
        let professores;
        let andamento

        const sqlGrupo = "SELECT * FROM tblGrupo WHERE idGrupo = ?";
        connection.query(sqlGrupo, req.params.idGrupo, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            grupo = result;

            const sqlAlunos = "SELECT tblAluno.idAluno, tblAluno.foto, tblUsuario.nome FROM tblAluno INNER JOIN tblUsuario ON tblAluno.idUsuario = tblUsuario.idUsuario WHERE tblAluno.idGrupo = ?";
            connection.query(
                sqlAlunos,
                req.params.idGrupo,
                (error, result, field) => {
                    if (error) {
                        return res.status(500).send({
                            error: error,
                            response: null,
                        });
                    }

                    alunos = result;

                    const sqlProfessores = "SELECT tblProfessor.idProfessor, tblProfessor.foto, tblUsuario.nome FROM tblProfessor INNER JOIN tblUsuario ON tblProfessor.idUsuario = tblUsuario.idUsuario INNER JOIN tblProfessorGrupo ON tblProfessor.idProfessor = tblProfessorGrupo.idProfessor WHERE tblProfessorGrupo.idGrupo = ?";
                    connection.query(
                        sqlProfessores,
                        req.params.idGrupo,
                        (error, result, field) => {
                            if (error) {
                                return res.status(500).send({
                                    error: error,
                                    response: null,
                                });
                            }

                            professores = result;

                            let tarefasConcluidas = []
                            let totalTarefas = []

                            const sqlTarefasIndividuais = 'SELECT status FROM tbltarefa WHERE idAluno = ?'
                            for (let t = 0; t < alunos.length; t++) {
                                connection.query(sqlTarefasIndividuais, alunos[t].idAluno, (error, result, field) => {

                                    for (let r = 0; r < result.length; r++) {
                                        totalTarefas.push(result[r])
                                        if(result[r].status == 'Concluída') tarefasConcluidas.push(result[r])
                                    }

                                    if(t + 1 == alunos.length){

                                        const sqlTarefasGerais = 'SELECT status FROM tbltarefageral INNER JOIN tbltopicogrupo ON tbltarefageral.idTopicoGrupo = tbltopicogrupo.idTopicoGrupo WHERE idGrupo = ?'
                                        connection.query(sqlTarefasGerais, grupo[0].idGrupo, (error, result, field) => {
    
                                            for (let r = 0; r < result.length; r++) {
                                                totalTarefas.push(result[r])
                                                if(result[r].status == 'Concluída') tarefasConcluidas.push(result[r])
                
                                                if(r + 1 == result.length){

                                                    if(tarefasConcluidas.length > 0){
                                                        andamento = 100 * tarefasConcluidas.length / totalTarefas.length
                                                    } else{
                                                        andamento = 0
                                                    }
                                                    res.status(202).send({
                                                        grupo: grupo,
                                                        alunos: alunos,
                                                        professores: professores,
                                                        andamento: andamento.toFixed(0)
                                                    });
                                                }
                                            }
                                        })
                                    }
                                })
                            }
                            

                            // const sqlTarefas = 'SELECT tbltarefa.status FROM tbltarefa INNER JOIN tblaluno ON tblaluno.idAluno = tbltarefa.idAluno INNER JOIN tblgrupo ON tblgrupo.idGrupo = tblaluno.idGrupo WHERE tblgrupo.idGrupo = ?'
                            // connection.query(sqlTarefas, req.params.idGrupo, (error, result, field) => {
                                
                            //     let tarefasIndividuais = result

                            //     const sqlTarefasGerais = 'SELECT DISTINCT tbltarefageral.status FROM tbltarefageral INNER JOIN tbltarefaaluno ON tbltarefaaluno.idTarefaGeral = tbltarefageral.idTarefaGeral INNER JOIN tblaluno ON tblaluno.idAluno = tbltarefaaluno.idAluno INNER JOIN tblgrupo ON tblgrupo.idGrupo = tblaluno.idGrupo WHERE tblgrupo.idGrupo = ?'
                            //     connection.query(sqlTarefasGerais, req.params.idGrupo, (error, result, field) => {
                                    
                            //         let tarefasGerais = result

                            //         let totalTarefas = []

                            //         for (let t = 0; t < tarefasIndividuais.length; t++) {
                            //             totalTarefas.push(tarefasIndividuais[t])
                            //         }

                            //         for (let t = 0; t < tarefasGerais.length; t++) {
                            //             totalTarefas.push(tarefasGerais[t])
                            //         }
                                    
                            //         let tarefasConcluidas = []

                            //         for (let t = 0; t < totalTarefas.length; t++) {
                            //             if (totalTarefas[t].status == 'Concluída') tarefasConcluidas.push(totalTarefas[t])
                            //         }

                            //         if(tarefasConcluidas.length > 0){
                            //             andamento = 100 * tarefasConcluidas.length / totalTarefas.length
                            //         } else{
                            //             andamento = 0
                            //         }

                            //         res.status(202).send({
                            //             grupo: grupo,
                            //             alunos: alunos,
                            //             professores: professores,
                            //             andamento: andamento.toFixed(0)
                            //         });
                            //     })
                            // })
                        }
                    );
                }
            );
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

        const sqlGetAlunos =
            "SELECT idAluno, idUsuario FROM tblAluno WHERE idGrupo = ?";
        connection.query(
            sqlGetAlunos,
            req.params.idGrupo,
            (error, result, field) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }

                for (let a = 0; a < result.length; a++) {
                    const sqlDeleteAluno = "DELETE FROM tblAluno WHERE idAluno = ?";
                    connection.query(
                        sqlDeleteAluno,
                        result[a].idAluno,
                        (error, result, field) => {
                            if (error) {
                                return res.status(500).send({
                                    error: error,
                                    response: null,
                                });
                            }
                        }
                    );
                }

                for (let u = 0; u < result.length; u++) {
                    const sqlDeleteUsuario = "DELETE FROM tblUsuario WHERE idUsuario = ?";
                    connection.query(sqlDeleteUsuario, result[u].idUsuario, (error) => {
                        if (error) {
                            return res.status(500).send({
                                error: error,
                                response: null,
                            });
                        }

                        //PRECISA DESSE RES?
                        // res.status(202).send({
                        //     message: "aluno deletado",
                        // });
                    });
                }

                const sqlDeleteAvaliadorGrupo =
                    "DELETE FROM tblAvaliadorGrupo WHERE idGrupo = ?";
                connection.query(
                    sqlDeleteAvaliadorGrupo,
                    req.params.idGrupo,
                    (error, result, field) => {
                        if (error) {
                            return res.status(500).send({
                                error: error,
                                response: null,
                            });
                        }

                        const sqlDeleteProfessorGrupo =
                            "DELETE FROM tblProfessorGrupo WHERE idGrupo = ?";
                        connection.query(
                            sqlDeleteProfessorGrupo,
                            req.params.idGrupo,
                            (error, result, field) => {
                                if (error) {
                                    return res.status(500).send({
                                        error: error,
                                        response: null,
                                    });
                                }

                                const sqlDeleteAvaliacao =
                                    "DELETE FROM tblAvaliacao WHERE idGrupo = ?";
                                connection.query(
                                    sqlDeleteAvaliacao,
                                    req.params.idGrupo,
                                    (error, result, field) => {
                                        if (error) {
                                            return res.status(500).send({
                                                error: error,
                                                response: null,
                                            });
                                        }

                                        const sqlDeleteProfessorGrupo =
                                            "DELETE FROM tblProfessorGrupo WHERE idGrupo = ?";
                                        connection.query(
                                            sqlDeleteProfessorGrupo,
                                            req.params.idGrupo,
                                            (error, result, field) => {
                                                if (error) {
                                                    return res.status(500).send({
                                                        error: error,
                                                        response: null,
                                                    });
                                                }

                                                const sqlDeleteEvento =
                                                    "DELETE FROM tblEvento WHERE idGrupo = ?";
                                                connection.query(
                                                    sqlDeleteEvento,
                                                    req.params.idGrupo,
                                                    (error, result, field) => {
                                                        if (error) {
                                                            return res.status(500).send({
                                                                error: error,
                                                                response: null,
                                                            });
                                                        }

                                                        const sqlDeleteAnexo =
                                                            "DELETE FROM tblAnexo WHERE idGrupo = ?";
                                                        connection.query(
                                                            sqlDeleteAnexo,
                                                            req.params.idGrupo,
                                                            (error, result, field) => {
                                                                if (error) {
                                                                    return res.status(500).send({
                                                                        error: error,
                                                                        response: null,
                                                                    });
                                                                }

                                                                const sqlDeletePostagem =
                                                                    "DELETE FROM tblPostagem WHERE idGrupo = ?";
                                                                connection.query(
                                                                    sqlDeletePostagem,
                                                                    req.params.idGrupo,
                                                                    (error, result, field) => {
                                                                        if (error) {
                                                                            return res.status(500).send({
                                                                                error: error,
                                                                                response: null,
                                                                            });
                                                                        }

                                                                        const sqlDeleteEntregaAtividade =
                                                                            "DELETE FROM tblEntregaAtividade WHERE idGrupo = ?";
                                                                        connection.query(
                                                                            sqlDeleteEntregaAtividade,
                                                                            req.params.idGrupo,
                                                                            (error, result, field) => {
                                                                                if (error) {
                                                                                    return res.status(500).send({
                                                                                        error: error,
                                                                                        response: null,
                                                                                    });
                                                                                }

                                                                                const sqlDeleteGrupo =
                                                                                    "DELETE FROM tblGrupo WHERE idGrupo = ?";
                                                                                connection.query(
                                                                                    sqlDeleteGrupo,
                                                                                    req.params.idGrupo,
                                                                                    (error, result, field) => {
                                                                                        if (error) {
                                                                                            return res.status(500).send({
                                                                                                error: error,
                                                                                                response: null,
                                                                                            });
                                                                                        }

                                                                                        res.status(202).send({
                                                                                            message: "Grupo e Suas Relações Deletadas",
                                                                                        });
                                                                                    }
                                                                                );
                                                                            }
                                                                        );
                                                                    }
                                                                );
                                                            }
                                                        );
                                                    }
                                                );
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    });
});

module.exports = router;