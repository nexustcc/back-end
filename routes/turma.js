const express = require("express");
const router = express.Router();
const mysql = require("../mysql");
const converterData = require("./utils/date");

router.post("/cadastrarTurma/:idCurso", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql =
            "INSERT INTO tblturma (nome, dataInicio, dataConclusao, idCurso) VALUES (?, ?, ?, ?)";
        const values = [
            req.body.nome,
            req.body.dataInicio,
            req.body.dataConclusao,
            req.params.idCurso,
        ];
        connection.query(sql, values, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(201).send({
                message: "turma cadastrada",
            });
        });
    });
});

router.get("/listarTurmas/:idInstituicao", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql =
            "SELECT idTurma, tblTurma.nome FROM tblturma INNER JOIN tblcurso ON tblTurma.idCurso = tblCurso.idCurso WHERE idInstituicao = ?";
        connection.query(sql, req.params.idInstituicao, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }
            res.status(200).send({
                turma: result.map((turma) => {
                    return {
                        idTurma: turma.idTurma,
                        nome: turma.nome,
                    };
                }),
            });
        });
    });
});

router.get("/listarTurma/:idTurma", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let nomeCurso

        const sqlAlunos = 'SELECT tblUsuario.nome, tblAluno.foto FROM tblAluno INNER JOIN tblUsuario ON tblAluno.idUsuario = tblUsuario.idUsuario WHERE idTurma = 1'
        connection.query(sqlAlunos, req.params.idTurma, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            let numeroDeAlunos = result.length

            const sqlNomeCurso = 'SELECT tblCurso.nome FROM tblCurso INNER JOIN tblTurma ON tblTurma.idCurso = tblCurso.idCurso WHERE idTurma = ?'
            connection.query(sqlNomeCurso, req.params.idTurma, (error, result, field) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }

                console.log('número da Turma: ' + req.params.idTurma)

                if(result[0].nome.length >= 1){
                    nomeCurso = result[0].nome
                    console.log(nomeCurso)
                }
                

                const sql = "SELECT * FROM tblTurma WHERE idTurma = ?";
                connection.query(sql, req.params.idTurma, (error, result, field) => {
                    if (error) {
                        return res.status(500).send({
                            error: error,
                            response: null,
                        });
                    }

                    res.status(200).send({
                        turma: result.map((turma) => {
                            return {
                                idTurma: turma.idTurma,
                                nome: turma.nome,
                                nomeCurso: nomeCurso,
                                dataInicio: converterData(turma.dataInicio),
                                dataConclusao: converterData(turma.dataConclusao),
                                numeroDeAlunos: numeroDeAlunos
                            };
                        }),
                    });
                })

            })
        });
    });
});

router.get("/listarTurmasCurso/:idCurso", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql = "SELECT * FROM tblTurma WHERE idCurso = ?";
        connection.query(sql, req.params.idCurso, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(200).send({
                turma: result.map((turma) => {
                    return {
                        idTurma: turma.idTurma,
                        nome: turma.nome,
                        dataInicio: converterData(turma.dataInicio),
                        dataConclusao: converterData(turma.dataConclusao),
                        idCurso: turma.idCurso,
                    };
                }),
            });
        });
    });
});

router.put("/editarTurma/:idTurma", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql =
            "UPDATE tblTurma SET nome = ?, dataInicio = ?, dataConclusao = ? WHERE idTurma = ?";
        const values = [
            req.body.nome,
            req.body.dataInicio,
            req.body.dataConclusao,
            req.params.idTurma,
        ];
        connection.query(sql, values, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(202).send({
                message: "Turma editada com sucesso",
            });
        });
    });
});

router.put("/mudarAlunoTurma", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql = "UPDATE tblAluno SET idTurma = ? WHERE idAluno = ?";
        const values = [req.body.idTurmaNova, req.body.idAluno];
        connection.query(sql, values, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(202).send({
                message: "Turma do Aluno alterada com sucesso",
            });
        });
    });
});

router.put("/mudarProfessorTurma/", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let arrayTurmasProfessor = [];

        const sqlTurmasAtuais =
            "SELECT idTurma FROM tblTurmaProfessor WHERE idProfessor = ?";
        connection.query(
            sqlTurmasAtuais,
            req.body.idProfessor,
            (error, result, field) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }

                let result_obj = result;
                for (let t = 0; t < result_obj.length; t++) {
                    let result_json = result_obj[t];
                    let idTurma = result_json[Object.keys(result_json)[0]];

                    arrayTurmasProfessor.push(idTurma);
                }

                let arrayNovasTurmas = req.body.novasTurmas;

                console.log(arrayTurmasProfessor);
                console.log(arrayNovasTurmas);

                for (let i = 0; i < arrayTurmasProfessor.length; i++) {
                    console.log(arrayNovasTurmas);
                    // arrayTurmasProfessor.includes()
                }
            }
        );
    });
});

router.delete("/deletarTurma/:idTurma", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql = "DELETE FROM tblturma WHERE idTurma = ?";
        connection.query(sql, req.params.idTurma, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(200).send({
                message: "turma deletada",
            });
        });
    });
});

router.get("/grupos/listarGrupos/:idTurma", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql = "SELECT * FROM tblgrupo WHERE idTurma = ?";
        connection.query(sql, req.params.idTurma, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(200).send({
                grupo: result.map((grupo) => {
                    return {
                        idgrupo: grupo.idGrupo,
                        nomeProjeto: grupo.nomeProjeto,
                        temaProjeto: grupo.temaProjeto,
                    };
                }),
            });
        });
    });
});

router.get("/membros/listarMembros/:idTurma", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sqlAlunosTurma = "SELECT * FROM tblaluno WHERE idTurma = ?";
        connection.query(
            sqlAlunosTurma,
            req.params.idTurma,
            (error, result, field) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }

                const sqlAlunos = "SELECT tblUsuario.nome, foto, tblGrupo.nomeProjeto FROM tblusuario INNER JOIN tblaluno ON tblusuario.idUsuario = tblaluno.idUsuario INNER JOIN tblGrupo ON tblGrupo.idGrupo = tblAluno.idGrupo WHERE tblAluno.idTurma = ? ORDER BY tblGrupo.nomeProjeto AND tblUsuario.nome;";
                connection.query(
                    sqlAlunos,
                    req.params.idTurma,
                    (error, result, field) => {
                        if (error) {
                            return res.status(500).send({
                                error: error,
                                response: null,
                            });
                        }

                        const alunos = result;

                        const sqlProfessores =
                            "SELECT nome, foto FROM tblProfessor INNER JOIN tblTurmaProfessor ON tblProfessor.idProfessor = tblTurmaProfessor.idProfessor INNER JOIN tblUsuario ON tblProfessor.idUsuario = tblUsuario.idUsuario WHERE idTurma = ? ORDER BY nome";
                        mysql.query(
                            sqlProfessores,
                            req.params.idTurma,
                            (error, result, field) => {
                                if (error) {
                                    return res.status(500).send({
                                        error: error,
                                        response: null,
                                    });
                                }

                                const professores = result;

                                res.status(200).send({
                                    professores: professores,
                                    alunos: alunos,
                                });
                            }
                        );
                    }
                );
            }
        );
    });
});

module.exports = router;