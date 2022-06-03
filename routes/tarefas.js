const express = require("express");
const router = express.Router();
const mysql = require("../mysql");
const converterData = require("./utils/date");



// CORES - TAREFA e TÓPICO
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

// ALUNOS GRUPO
router.get("/listarAlunosGrupo/:idAluno", (req, res) => {
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

            const sqlAlunosGrupo = "SELECT tblaluno.idAluno, tblusuario.nome, tblaluno.foto FROM tblaluno INNER JOIN tblusuario ON tblaluno.idUsuario = tblusuario.idUsuario INNER JOIN tblgrupo ON tblaluno.idgrupo = tblgrupo.idGrupo WHERE tblgrupo.idGrupo = ?";
            connection.query(sqlAlunosGrupo, idGrupo, (error, result, field) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }

                res.status(202).send({
                    alunos: result
                });
            });
        });
    });
});



// TÓPICO ALUNO
router.post("/cadastrarTopicoAluno/:idAluno", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sqlTopico =  "INSERT INTO tblTopicoAluno (nome, idCor, idAluno) VALUES (?, ?, ?)";
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

router.put("/editarTopicoAluno/:idTopicoAluno", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        if(req.body.nome == '' || req.body.nome == undefined){
            const sql = "UPDATE tblTopicoAluno SET idCor = ? WHERE idTopicoAluno = ?;";
            const values = [req.body.idCor, req.params.idTopicoAluno];
            connection.query(sql, values, (error, result, field) => {
                if (error) return res.status(500).send({ error: error, response: null });

                res.status(202).send({ message: "Topico de Aluno editado com sucesso" });
            });
        } else {
            const sql = "UPDATE tblTopicoAluno SET nome = ?, idCor = ? WHERE idTopicoAluno = ?;";
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
        }

    });
});

router.get('/listarTopicoAluno/:idAluno', (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sqlTopicoAluno = "SELECT tbltopicoaluno.idTopicoAluno, tbltopicoaluno.nome FROM tbltopicoaluno WHERE idAluno = ?";
        connection.query(sqlTopicoAluno, req.params.idAluno, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(202).send({
                topicos_aluno: result
            });
        });
    });
})

router.delete('/deletarTopicoAluno/:idTopicoAluno', (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sqlDeleteTarefasTopico = 'DELETE FROM tbltarefa WHERE idTopicoAluno = ?'
        connection.query(sqlDeleteTarefasTopico, req.params.idTopicoAluno, (error, result) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            const sqlDeleteTopicoAluno = 'DELETE FROM tbltopicoaluno WHERE idTopicoAluno = ?'
            connection.query(sqlDeleteTopicoAluno, req.params.idTopicoAluno, (error, result) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }

                res.status(202).send({
                    message: 'Topico do Aluno deletado com sucesso'
                })
                
            })
        })
    })
})


// TAREFAS ALUNO
router.post("/cadastrarTarefa/:idAluno", (req, res) => {
    mysql.connect((error, connection) => {

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
            req.body.idTopicoAluno,
            2,
            req.params.idAluno,
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

router.post('/duplicarTarefa', (req, res) => {
    mysql.connect((error, connection) => {

        const sqlIdTopico = 'SELECT * FROM tblTarefa WHERE idTarefa = ?'
        connection.query(sqlIdTopico, req.body.idTarefa, (error, result, field) => {
            if (error) return res.status(500).send({ error: error, response: null });
    
            const sqlTarefa = "INSERT INTO tblTarefa (status, prioridade, nome, dataInicio, dataConclusao, idTopicoAluno, idCor, idAluno) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            const valuesTarefa = [
                result[0].status,
                result[0].prioridade,
                result[0].nome,
                result[0].dataInicio,
                result[0].dataConclusao,
                result[0].idTopicoAluno,
                result[0].idCor,
                result[0].idAluno,
            ];
    
            connection.query(sqlTarefa, valuesTarefa, (error, result, field) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }
    
                res.status(202).send({
                    message: "Tarefa de Aluno DUPLICADA com sucesso",
                });
            });
        })

    });
})

router.put("/editarTarefa/:idTarefa", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql =
            "UPDATE tblTarefa SET status = ?, prioridade = ?, nome = ?, dataConclusao = ?, idTopicoAluno = ?, idCor = ? WHERE idTarefa = ?;";
        const values = [
            req.body.status,
            req.body.prioridade,
            req.body.nome,
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

router.get("/listarTarefas/:idAluno", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }
        
        
        const sqlTopicosAluno = 'SELECT tbltopicoaluno.idTopicoAluno, tbltopicoaluno.nome, tbltopicoaluno.idCor FROM tbltopicoaluno WHERE tbltopicoaluno.idAluno = ?'
        connection.query(sqlTopicosAluno, req.params.idAluno, (error, result, field) =>  {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }
            
            let topicos = result
            
            let tarefas = []

            if(topicos.length == 0) res.status(200).send(tarefas)
            
            for (let t = 0; t < topicos.length; t++) {
    
                let idTopico = topicos[t].idTopicoAluno
                let nomeTopico = topicos[t].nome
                let idCor = topicos[t].idCor
    
                const sqlTarefas = 'SELECT * FROM tbltarefa WHERE idTopicoAluno = ? ORDER BY status desc'
                connection.query(sqlTarefas, idTopico, (error, result) => {

                    let tarefasDoTopico = result 
                        
                    if((t + 1) == (topicos.length)){
                        tarefas.push({'idTopico': idTopico, 'nomeTopico': nomeTopico, 'idCor': idCor, tarefasDoTopico})
                        res.status(200).send(tarefas)
                    } else{
                        tarefas.push({'idTopico': idTopico, 'nomeTopico': nomeTopico, 'idCor': idCor, tarefasDoTopico})
                    }
                })
            }
        })
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




// TÓPICO GERAL
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

            const sqlTopico = "INSERT INTO tblTopicoGrupo (nome, idCor, idGrupo) VALUES (?, ?, ?)";
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

router.get('/listarTopicoGrupo/:idAluno', (req, res) => {
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

            const sqlTopicoAluno = "SELECT tbltopicogrupo.idTopicogrupo, tbltopicogrupo.nome FROM tbltopicogrupo WHERE idgrupo = ?";
            connection.query(sqlTopicoAluno, idGrupo, (error, result, field) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }
    
                res.status(202).send({
                    topicos_grupo: result
                });
            });
        })
    });
})

router.delete('/deletarTopicoGrupo/:idTopicoGrupo', (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let idTarefas = []

        const sqlIdTarefasGrupo = 'SELECT tbltarefageral.idTarefaGeral FROM tbltarefageral WHERE idTopicoGrupo = ?'
        connection.query(sqlIdTarefasGrupo, req.params.idTopicoGrupo, (error, result) => {
            if (error) return res.status(500).send({ error: error, response: null });

            for (let i = 0; i < result.length; i++) { idTarefas.push(result[i].idTarefaGeral) }
            
            const sqlDeleteAlunosTarefa = "DELETE FROM tbltarefaaluno WHERE idTarefaGeral = ?";
            for (let a = 0; a < idTarefas.length; a++) {
                connection.query(sqlDeleteAlunosTarefa, idTarefas[a], (error, result, field) => {
                    if (error) return res.status(500).send({ error: error, response: null });
                });
            }

            const sqlDeleteTarefa = "DELETE FROM tbltarefageral WHERE idTarefaGeral = ?";
            for (let t = 0; t < idTarefas.length; t++) {
                connection.query(sqlDeleteTarefa, idTarefas[t], (error, result, field) => {
                    if (error) return res.status(500).send({ error: error, response: null });
                });
            }
            
            const sqlDeleteTopico = 'DELETE FROM tbltopicogrupo WHERE idTopicoGrupo = ?'
            connection.query(sqlDeleteTopico, req.params.idTopicoGrupo, (error, result, field) => {
                res.status(200).send({ message: "tarefa deletada" });
            })
        })

        // const sqlDeleteTarefasTopico = 'DELETE FROM tbltarefa WHERE idTopicoAluno = ?'
        // connection.query(sqlDeleteTarefasTopico, req.params.idTopicoAluno, (error, result) => {
        //     if (error) {
        //         return res.status(500).send({
        //             error: error,
        //             response: null,
        //         });
        //     }

        //     const sqlDeleteTopicoAluno = 'DELETE FROM tbltopicoaluno WHERE idTopicoAluno = ?'
        //     connection.query(sqlDeleteTopicoAluno, req.params.idTopicoAluno, (error, result) => {
        //         if (error) {
        //             return res.status(500).send({
        //                 error: error,
        //                 response: null,
        //             });
        //         }

        //         res.status(202).send({
        //             message: 'Topico do Aluno deletado com sucesso'
        //         })
                
        //     })
        // })
    })
})


// TAREFAS ALUNO
router.post("/cadastrarTarefaGeral/:idAluno", (req, res) => {
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
            
            var dateTime = new Date();
            var dateSplit = dateTime.toISOString().split(["T"]);
            
            const sqlTarefa = "INSERT INTO tblTarefaGeral (status, prioridade, nome, dataInicio, dataConclusao, idTopicoGrupo, idCor) VALUES (?, ?, ?, ?, ?, ?, ?)";
            const valuesTarefa = [
                "Não iniciada",
                "Média",
                req.body.nome,
                dateSplit[0],
                req.body.dataConclusao,
                req.body.idTopicoGrupo,
                2,
            ];
            
            connection.query(sqlTarefa, valuesTarefa, (error, result, field) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }
            
                let idTarefaGeral = result.insertId;

                let idAlunos = req.body.idAlunos;

                let sqlTarefaAluno = "INSERT INTO tblTarefaAluno (idAluno, idTarefaGeral) VALUES (?, ?)";
                for (let a = 0; a < idAlunos.length; a++) {
                    connection.query(sqlTarefaAluno, [idAlunos[a], idTarefaGeral], (error, result, field) => {
                        if (error) {
                            return res.status(500).send({
                                error: error,
                                response: null,
                            });
                        }
                    });
                }
            
                res.status(202).send({
                    message: "Tarefa Geral cadastrada",
                });
            });
        })
    });
});

router.put("/editarTarefaGeral/:idTarefaGeral", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let novosAlunos = req.body.idAlunos 

        const sqlAlunosTarefa = 'SELECT idAluno FROM tbltarefaaluno WHERE idTarefaGeral = ?'
        connection.query(sqlAlunosTarefa, req.params.idTarefaGeral, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            let alunosTarefaAntigo = []

            for (let a = 0; a < result.length; a++) {
                alunosTarefaAntigo.push(result[a].idAluno)
            }

            for (let a = 0; a < alunosTarefaAntigo.length; a++) {
                if (novosAlunos.includes(alunosTarefaAntigo[a]) == false) {
                    console.log('aluno ' + alunosTarefaAntigo[a] + ' RETIRADO da tarefa')
                    
                    const sqlDeleteAlunoTarefa = 'DELETE FROM tbltarefaaluno WHERE idAluno = ? AND idTarefaGeral = ?'
                    connection.query(sqlDeleteAlunoTarefa, [alunosTarefaAntigo[a], req.params.idTarefaGeral], (error, result, field) => {
                        if (error) return res.status(500).send({ error: error, response: null });
                    })
                }
            }

            for (let a = 0; a < novosAlunos.length; a++) {
                if (alunosTarefaAntigo.includes(novosAlunos[a]) == false) {
                    console.log('aluno ' + novosAlunos[a] + ' ADICIONADO da tarefa')

                    const sqlAdicionarAlunoTarefa = 'INSERT INTO tbltarefaaluno (idAluno, idTarefaGeral) VALUES (?, ?)'
                    connection.query(sqlAdicionarAlunoTarefa, [novosAlunos[a], req.params.idTarefaGeral], (error, result, field) => {
                        if (error) return res.status(500).send({ error: error, response: null });
                    })
                }
            }
            
            const sql = "UPDATE tblTarefaGeral SET status = ?, prioridade = ?, nome = ?, dataConclusao = ?, idTopicoGrupo = ?, idCor = ? WHERE idTarefaGeral = ?;";
            const values = [
                req.body.status,
                req.body.prioridade,
                req.body.nome,
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
            
                res.status(202).send({ message: "Tarefa de Grupo editada com sucesso" });
            });
        })
    });
});

router.get("/listarTarefasGerais/:idAluno", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sqlTopicosAlunoGrupo = 'SELECT tbltopicogrupo.idTopicoGrupo, tbltopicogrupo.nome FROM tbltopicogrupo INNER JOIN tblgrupo ON tblgrupo.idGrupo = tbltopicogrupo.idGrupo INNER JOIN tblaluno ON tblaluno.idGrupo = tblgrupo.idGrupo WHERE tblaluno.idAluno = ?'
        connection.query(sqlTopicosAlunoGrupo, req.params.idAluno, (error, result, field) =>  {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }
            
            let topicos = result
            
            let tarefas = []

            if(topicos.length == 0) res.status(200).send({ tarefas: tarefas})

            for (let t = 0; t < topicos.length; t++) {
    
                let idTopicoGrupo = topicos[t].idTopicoGrupo
                let nomeTopicoGrupo = topicos[t].nome
    
                const sqlTarefas = 'SELECT * FROM tbltarefageral WHERE idTopicoGrupo = ?'
                connection.query(sqlTarefas, idTopicoGrupo, (error, result) => {

                    let tarefasDoTopico = result

                    const sqlAlunosTarefa = 'SELECT tblaluno.idAluno, tblusuario.nome, tblaluno.foto FROM tblaluno INNER JOIN tbltarefaaluno ON tbltarefaaluno.idAluno = tblaluno.idAluno INNER JOIN tblusuario ON tblusuario.idUsuario = tblaluno.idUsuario WHERE tbltarefaaluno.idTarefaGeral = ?'
                    for (let a = 0; a < tarefasDoTopico.length; a++) {
                        connection.query(sqlAlunosTarefa, tarefasDoTopico[a].idTarefaGeral, (error, result) => {
                            if (error) return res.status(500).send({ error: error, response: null });
                            
                            tarefasDoTopico[a].alunos = result;
        
                            if(t + 1 == topicos.length){
                                if (a + 1 == tarefasDoTopico.length){
                                    tarefas.push( {'idTopico': idTopicoGrupo, 'nomeTopico': nomeTopicoGrupo, tarefasDoTopico} )
                                    console.log(result)
                                    res.status(200).send(tarefas)
                                } 
                            } else{
                                if (tarefas.length == 0) {
                                    tarefas.push( {'idTopico': idTopicoGrupo, 'nomeTopico': nomeTopicoGrupo, tarefasDoTopico} )
                                } else{
                                    if(idTopicoGrupo =! tarefas[t].idTopico){
                                        tarefas.push( {'idTopico': idTopicoGrupo, 'nomeTopico': nomeTopicoGrupo, tarefasDoTopico} )
                                    }
                                }
                            }
                        })
                    }
                })
            }
        })
    });
});

router.delete("/deletarTarefaGeral/:idTarefaGeral", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) return res.status(500).send({ error: error });

        const sqlDeleteAlunosTarefa = "DELETE FROM tbltarefaaluno WHERE idTarefaGeral = ?";
        connection.query(sqlDeleteAlunosTarefa, req.params.idTarefaGeral, (error, result, field) => {

            if (error) return res.status(500).send({ error: error, response: null });

            const sqlDeleteTarefa = "DELETE FROM tbltarefageral WHERE idTarefaGeral = ?";
            connection.query(sqlDeleteTarefa, req.params.idTarefaGeral, (error, result, field) => {

                if (error) return res.status(500).send({ error: error, response: null });

                res.status(200).send({ message: "tarefa deletada" });
            });
        });
    })
});

module.exports = router;