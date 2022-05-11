const express = require("express");
const router = express.Router();
const mysql = require("../mysql");

router.get('/listarProfessor/:idProfessor', (req, res) => {
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

router.get('/listarAluno/:idAluno', (req, res) => {
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

router.get('/listarAvaliador/:idAvaliador', (req, res) => {
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

module.exports = router;