const express = require("express");
const router = express.Router();
const mysql = require("../mysql");

router.post("/cadastrarInstituicao", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        console.log("conectado");

        let idUsuario;
        let idCartao;

        const sqlUsuario =
            "INSERT INTO tblusuario (nome, email, senha) VALUES (?, ?, ?)";
        const valuesUsuario = [req.body.nome, req.body.email, req.body.senha];
        connection.query(sqlUsuario, valuesUsuario, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }
            console.log("cadastrou usuario");
            idUsuario = result.insertId;

            const sqlCartao =
                "INSERT INTO tblCartao (nomeNoCartao, dataValidade, cvv, numero) VALUES (?, ?, ?,?)";
            const valuesCartao = [
                req.body.nomeNoCartao,
                req.body.dataValidade,
                req.body.cvv,
                req.body.numero,
            ];
            connection.query(sqlCartao, valuesCartao, (error, result, field) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }
                console.log("cadastrou cartão");
                idCartao = result.insertId;

                const sqlInstituicao =
                    "INSERT INTO tblInstituicao (cnpj, telefone, idCartao, idUsuario) VALUES (?, ?, ?,?)";
                const valuesInstituicao = [
                    req.body.cnpj,
                    req.body.telefone,
                    idCartao,
                    idUsuario,
                ];
                connection.query(
                    sqlInstituicao,
                    valuesInstituicao,
                    (error, result, field) => {
                        if (error) {
                            return res.status(500).send({
                                error: error,
                                response: null,
                            });
                        }
                        console.log("cadastrou instituição");

                        res.status(201).send({
                            message: "instituição cadastrada",
                        });
                    }
                );
            });
        });
    });
});

router.get("/listarInstituicao/:idInstituicao", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql =
            "SELECT * FROM tblInstituicao INNER JOIN tblUsuario ON tblInstituicao.idUsuario = tblUsuario.idUsuario WHERE idInstituicao = ?";
        const values = [req.params.idInstituicao];
        connection.query(sql, values, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(200).send({
                instituicao: result.map((instituicao) => {
                    return {
                        cnpj: instituicao.cnpj,
                        telefone: instituicao.telefone,
                        usuario: {
                            nome: instituicao.nome,
                            email: instituicao.email,
                            senha: instituicao.senha,
                        },
                    };
                }),
            });
        });
    });
});



router.get('/membros/listarMembros/:idInstituicao', (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let alunos
        let profeessores
        let avaliadores

        const sqlAlunos = 'SELECT tblAluno.idAluno, tblUsuario.nome, tblAluno.foto FROM tblAluno INNER JOIN tblUsuario ON tblAluno.idUsuario = tblUsuario.idUsuario INNER JOIN tblTurma ON tblTurma.idTurma = tblaluno.idTurma INNER JOIN tblCurso ON tblCurso.idCurso = tblturma.idCurso WHERE tblCurso.idInstituicao = ? ORDER BY nome'
        connection.query(sqlAlunos, req.params.idInstituicao, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            alunos = result

            const sqlProfessores = 'SELECT tblProfessor.idProfessor, tblUsuario.nome, tblprofessor.foto FROM tblProfessor INNER JOIN tblUsuario ON tblProfessor.idUsuario = tblUsuario.idUsuario WHERE tblprofessor.idInstituicao = ? ORDER BY nome;'
            connection.query(sqlProfessores, req.params.idInstituicao, (error, result, field) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }

                profeessores = result
    
                const sqlAvaliadores = 'SELECT tblAvaliador.idAvaliador, tblUsuario.nome FROM tblUsuario INNER JOIN tblavaliador ON tblAvaliador.idUsuario = tblUsuario.idUsuario WHERE tblAvaliador.idInstituicao = ? ORDER BY nome'
                connection.query(sqlAvaliadores, req.params.idInstituicao, (error, result, field) => {
                    if (error) {
                        return res.status(500).send({
                            error: error,
                            response: null,
                        });
                    }

                    avaliadores = result

                    res.status(200).send({
                        professores: profeessores,
                        alunos: alunos,
                        avaliadores: avaliadores
                    });
                })
            })

        })
    })
})

router.get('/membros/listarProfessor/:idProfessor', (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sqlProfessor = 'SELECT tblusuario.nome, email, senha FROM tblusuario INNER JOIN tblprofessor ON tblusuario.idUsuario = tblprofessor.idUsuario WHERE tblprofessor.idProfessor = ?'
        connection.query(sqlProfessor, req.params.idProfessor, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            let profeessor = result[0]

            const sqlCursos = 'SELECT tblcurso.nome FROM tblcurso INNER JOIN tblprofessorcurso ON tblprofessorcurso.idCurso = tblcurso.idCurso WHERE idProfessor = ? ORDER BY tblcurso.nome'
            connection.query(sqlCursos, req.params.idProfessor, (error, result, field) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }

                let cursos = result

                const sqlTurmas = 'SELECT tblturma.nome FROM tblturma INNER JOIN tblturmaprofessor ON tblturma.idTurma = tblturmaprofessor.idTurma WHERE idProfessor = ?'
                connection.query(sqlTurmas, req.params.idProfessor, (error, result, field) => {
                    if (error) {
                        return res.status(500).send({
                            error: error,
                            response: null,
                        });
                    }

                    let turmas = result

                    const sqlGrupos = 'SELECT tblgrupo.nomeProjeto FROM tblgrupo INNER JOIN tblprofessorgrupo ON tblgrupo.idGrupo = tblprofessorgrupo.idGrupo WHERE idProfessor = ?'
                    connection.query(sqlGrupos, req.params.idProfessor, (error, result, field) => {
                        if (error) {
                            return res.status(500).send({
                                error: error,
                                response: null,
                            });
                        }

                        let grupos = result

                        res.status(200).send({
                            professor: profeessor,
                            cursos: cursos,
                            turmas: turmas,
                            grupos: grupos
                        });
                    })
                })
            })
        })
    })
})

router.get('/membros/listarAluno/:idAluno', (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let aluno
        let curso
        let turma
        let grupo

        const sqlAluno = 'SELECT tblusuario.nome, tblusuario.email, tblusuario.senha FROM tblusuario INNER JOIN tblaluno ON tblaluno.idUsuario = tblusuario.idUsuario WHERE idAluno = ?'
        connection.query(sqlAluno, req.params.idAluno, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            aluno = result[0]

            const sqlCurso = 'SELECT tblcurso.nome FROM tblcurso INNER JOIN tblturma ON tblturma.idCurso = tblcurso.idCurso INNER JOIN tblaluno ON tblaluno.idTurma = tblturma.idTurma WHERE idAluno = ?'
            connection.query(sqlCurso, req.params.idAluno, (error, result, field) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }
    
                curso = result[0]

                const sqlTurma = 'SELECT tblturma.nome FROM tblturma INNER JOIN tblaluno ON tblaluno.idTurma = tblturma.idTurma WHERE idAluno = ?'
                connection.query(sqlTurma, req.params.idAluno, (error, result, field) => {
                    if (error) {
                        return res.status(500).send({
                            error: error,
                            response: null,
                        });
                    }
        
                    turma = result[0]

                    const sqlGrupo = 'SELECT tblgrupo.nomeProjeto FROM tblgrupo INNER JOIN tblaluno ON tblaluno.idGrupo = tblgrupo.idGrupo WHERE idAluno = ?'
                    connection.query(sqlGrupo, req.params.idAluno, (error, result, field) => {
                        if (error) {
                            return res.status(500).send({
                                error: error,
                                response: null,
                            });
                        }
            
                        grupo = result[0]

                        res.status(200).send({
                            aluno: aluno,
                            curso: curso,
                            turma: turma,
                            grupo: grupo
                        })

                    })
                })
            })
        })
    })  
})

router.get('/membros/listarAvaliador/:idAvaliador', (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let avaliador
        let curso
        let turma
        let grupos = []

        const sqlAvaliador = 'SELECT tblusuario.nome, tblusuario.email, tblusuario.senha FROM tblusuario INNER JOIN tblavaliador ON tblavaliador.idUsuario = tblusuario.idUsuario WHERE idAvaliador = ?'
        connection.query(sqlAvaliador, req.params.idAvaliador, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            avaliador = result[0]

            const sqlCurso = 'SELECT tblcurso.nome FROM tblcurso INNER JOIN tblturma ON tblturma.idCurso = tblcurso.idCurso INNER JOIN tblgrupo ON tblgrupo.idTurma = tblturma.idTurma INNER JOIN tblavaliadorgrupo ON tblavaliadorgrupo.idGrupo = tblgrupo.idGrupo WHERE idAvaliador = ?'
            connection.query(sqlCurso, req.params.idAvaliador, (error, result, field) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }
    
                curso = result[0]

                const sqlTurma = 'SELECT tblturma.nome FROM tblturma INNER JOIN tblgrupo ON tblgrupo.idTurma = tblturma.idTurma INNER JOIN tblavaliadorgrupo ON tblavaliadorgrupo.idGrupo = tblgrupo.idGrupo WHERE idAvaliador = ?'
                connection.query(sqlTurma, req.params.idAvaliador, (error, result, field) => {
                    if (error) {
                        return res.status(500).send({
                            error: error,
                            response: null,
                        });
                    }
        
                    turma = result[0]

                    const sqlGrupo = 'SELECT tblgrupo.nomeProjeto FROM tblgrupo INNER JOIN tblavaliadorgrupo ON tblavaliadorgrupo.idGrupo = tblgrupo.idGrupo WHERE idAvaliador = ?'
                    connection.query(sqlGrupo, req.params.idAvaliador, (error, result, field) => {
                        if (error) {
                            return res.status(500).send({
                                error: error,
                                response: null,
                            });
                        }

                        for (let g = 0; g < result.length; g++) {
                            grupos.push(result[g].nomeProjeto)   
                        }

                        res.status(200).send({
                            avaliador: avaliador,
                            curso: curso,
                            turma: turma,
                            grupos: grupos
                        })

                    })
                })
            })
        })
    })
})



router.put("/editarInstituicao/:idInstituicao", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let idUsuario;

        const sqlGetIdUsuario =
            "SELECT idUsuario FROM tblInstituicao WHERE idInstituicao = ?";
        const valuesGetIdUsuario = [req.params.idInstituicao];

        connection.query(
            sqlGetIdUsuario,
            valuesGetIdUsuario,
            (error, result, field) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }
                let result_obj = result;
                let result_json = result_obj[Object.keys(result_obj)[0]];
                idUsuario = result_json["idUsuario"];

                const sqlEditUsuario =
                    "UPDATE tblUsuario SET nome = ?, email = ?, senha = ? WHERE idUsuario = ?";
                const valuesUsuario = [
                    req.body.nome,
                    req.body.email,
                    req.body.senha,
                    idUsuario,
                ];
                connection.query(
                    sqlEditUsuario,
                    valuesUsuario,
                    (error, result, field) => {
                        if (error) {
                            return res.status(500).send({
                                error: error,
                                response: null,
                            });
                        }

                        const sqlEditInstituicao =
                            "UPDATE tblInstituicao SET cnpj = ?, telefone = ? WHERE idInstituicao = ?";
                        const valuesEditInstituicao = [
                            req.body.cnpj,
                            req.body.telefone,
                            req.params.idInstituicao,
                        ];
                        mysql.query(
                            sqlEditInstituicao,
                            valuesEditInstituicao,
                            (error, result, field) => {
                                if (error) {
                                    return res.status(500).send({
                                        error: error,
                                        response: null,
                                    });
                                }

                                res.status(201).send({
                                    message: "instituição editada",
                                });
                            }
                        );
                    }
                );
            }
        );
    });
});

router.delete("/deletarInstituicao/:idInstituicao", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let idUsuario;
        let idCartao;

        const sqlGetInstituicao =
            "SELECT * FROM tblInstituicao WHERE idInstituicao = ?";
        connection.query(
            sqlGetInstituicao,
            req.params.idInstituicao,
            (error, result, field) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }
                let result_obj = result;
                let result_json = result_obj[Object.keys(result_obj)[0]];
                idUsuario = result_json["idUsuario"];
                idCartao = result_json["idCartao"];

                console.log(idUsuario);
                console.log(idCartao);

                const sqlGetUsuarioSenha =
                    "SELECT senha FROM tblUsuario WHERE idUsuario = ?";
                connection.query(
                    sqlGetUsuarioSenha,
                    idUsuario,
                    (error, result, field) => {
                        if (error) {
                            return res.status(500).send({
                                error: error,
                                response: null,
                            });
                        }
                        let result_obj_getsenha = result;
                        let result_json_getSenha =
                            result_obj_getsenha[Object.keys(result_obj_getsenha)[0]];

                        if (result_json_getSenha["senha"] != req.body.senha) {
                            res.status(202).send({
                                message: "senha incorreta",
                            });
                        } else {
                            const sqlDeleteInstituicao =
                                "DELETE FROM tblInstituicao WHERE idInstituicao = ?";
                            connection.query(
                                sqlDeleteInstituicao,
                                req.params.idInstituicao,
                                (error, result, field) => {
                                    if (error) {
                                        return res.status(500).send({
                                            error: error,
                                            response: null,
                                        });
                                    }

                                    const sqlDeleteUsuario =
                                        "DELETE FROM tblUsuario WHERE idUsuario = ?";
                                    connection.query(sqlDeleteUsuario, idUsuario, (error) => {
                                        if (error) {
                                            return res.status(500).send({
                                                error: error,
                                                response: null,
                                            });
                                        }

                                        const sqlDeleteCartao =
                                            "DELETE FROM tblCartao WHERE idCartao = ?";
                                        connection.query(sqlDeleteCartao, idCartao, (error) => {
                                            if (error) {
                                                return res.status(500).send({
                                                    error: error,
                                                    response: null,
                                                });
                                            }

                                            res.status(202).send({
                                                message: "instituição deletada",
                                            });
                                        });
                                    });
                                }
                            );
                        }
                    }
                );
            }
        );
    });
});

module.exports = router;