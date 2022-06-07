// PARA O ALUNO SER CADASTRADO, É NECESSÁRIO QUE TENHA UM GRUPO CRIADO, EU, ARTUR, E A ANA PENSAMOS NUMA SAÍDA
// A SAÍDA FOI QUE, TODA INSTITUICAO JA VENHA COM UM GRUPO NULO, ONDE O ALUNO NA HORA QUE FOR CADASTRADO, IRÁ PRA ESSE GRUPO NULO E,
// DEPOIS QUE O PROFESSOR CRIAR OS GRUPOS OFICIAIS, ELE IRÁ EDITAR O ALUNO E COLOCÁ-LO NO GRUPO

const express = require("express");
const router = express.Router();
const mysql = require("../mysql");
const randomizarSenha = require("./utils/senha");
const enviarEmail = require("./utils/enviarEmail");
const run = require("./utils/enviarEmail");
const multer = require("multer");
const md5 = require("md5");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + md5(file.originalname) + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/svg+xml"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});



router.post("/cadastrarAluno", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let senha = randomizarSenha();

        let idUsuario;

        const sqlUsuario =
            "INSERT INTO tblUsuario (nome, email, senha) VALUES (?, ?, ?)";
        const valuesUsuario = [req.body.nome, req.body.email, senha];
        connection.query(sqlUsuario, valuesUsuario, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }
            console.log("cadastrou usuario");
            idUsuario = result.insertId;
            idGrupo = 0;

            const sqlAluno =
                "INSERT INTO tblAluno (foto, idTurma, idUsuario, idGrupo) VALUES (?, ?, ?, ?)";
            const valuesAluno = [
                "uploads/fotopadrao.svg",
                req.body.idTurma,
                idUsuario,
                req.body.idGrupo,
            ];
            connection.query(sqlAluno, valuesAluno, (error, result, field) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }

                //run(senha, req.body.email, req.body.nome);

                res.status(202).send({
                    message: "Aluno Cadastrado com Sucesso",
                });
            });
        });
    });
});

router.put("/editarAluno/:idAluno", upload.single("foto"), (req, res) => {
    console.log(req.file);
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let idUsuario;

        const sqlGetIdUsuario = "SELECT idUsuario FROM tblAluno WHERE idAluno = ?";
        const valuesGetIdUsuario = [req.params.idAluno];

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
                    "UPDATE tblUsuario SET senha = ? WHERE idUsuario = ?";
                const valuesUsuario = [req.body.senha, idUsuario];
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

                        let foto;

                        if (req.file == undefined) {
                            foto = "uploads/fotopadrao.svg";
                        } else {
                            foto = req.file.path;
                        }

                        let fotoFormmat = foto.replace("\\", "/");

                        const sqlEditAluno =
                            "UPDATE tblAluno SET foto = ? WHERE idAluno = ?";
                        const valuesEditAluno = [fotoFormmat, req.params.idAluno];
                        mysql.query(
                            sqlEditAluno,
                            valuesEditAluno,
                            (error, result, field) => {
                                if (error) {
                                    return res.status(500).send({
                                        error: error,
                                        response: null,
                                    });
                                }

                                res.status(201).send({
                                    message: "aluno editado",
                                });
                            }
                        );
                    }
                );
            }
        );
    });
});

router.get("/listarAluno/:idAluno", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql =
            "SELECT * FROM tblAluno INNER JOIN tblUsuario ON tblAluno.idUsuario = tblUsuario.idUsuario WHERE idAluno = ?";
        const values = [req.params.idAluno];
        connection.query(sql, values, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(200).send({
                aluno: result.map((aluno) => {
                    return {
                        foto: aluno.foto,
                        usuario: {
                            nome: aluno.nome,
                            email: aluno.email,
                            senha: aluno.senha,
                        },
                    };
                }),
            });
        });
    });
});

router.get("/listarAlunos/:idTurma", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql =
            "SELECT * FROM tblUsuario INNER JOIN tblAluno ON tblUsuario.idUsuario = tblAluno.idUsuario WHERE idTurma = ?";
        connection.query(sql, req.params.idTurma, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(200).send({
                alunos: result.map((aluno) => {
                    return {
                        foto: aluno.foto,
                        usuario: {
                            nome: aluno.nome,
                            email: aluno.email,
                            senha: aluno.senha,
                        },
                    };
                }),
            });
        });
    });
});

router.get("/informacoesGrupo/:idAluno", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let idGrupo
        
        const sqlIdGrupo = 'SELECT tblaluno.idGrupo FROM tblAluno WHERE tblaluno.idAluno = ?'
        connection.query(sqlIdGrupo, req.params.idAluno, (error, result, field) => {

            if (error) return res.status(500).send({ error: error, response: null });

            let result_obj = result;
            let result_json = result_obj[Object.keys(result_obj)[0]];
            idGrupo = result_json["idGrupo"];

            let grupo;
            let alunos;
            let professores;
            let andamento
    
            const sqlGrupo = "SELECT * FROM tblGrupo WHERE idGrupo = ?";
            connection.query(sqlGrupo, idGrupo, (error, result, field) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }
    
                grupo = result;
    
                const sqlAlunos = "SELECT tblAluno.idAluno, tblAluno.foto, tblUsuario.nome FROM tblAluno INNER JOIN tblUsuario ON tblAluno.idUsuario = tblUsuario.idUsuario WHERE tblAluno.idGrupo = ?";
                connection.query(sqlAlunos, idGrupo, (error, result, field) => {
                        
                    if (error) return res.status(500).send({ error: error, response: null });
    
                    alunos = result;
    
                    const sqlProfessores = "SELECT tblProfessor.idProfessor, tblProfessor.foto, tblUsuario.nome FROM tblProfessor INNER JOIN tblUsuario ON tblProfessor.idUsuario = tblUsuario.idUsuario INNER JOIN tblProfessorGrupo ON tblProfessor.idProfessor = tblProfessorGrupo.idProfessor WHERE tblProfessorGrupo.idGrupo = ?";
                    connection.query(sqlProfessores, idGrupo, (error, result, field) => {
                        if (error) return res.status(500).send({ error: error, response: null });
    
                        professores = result;

                        if(result.length == 0  || alunos.length == 0){
                            res.status(202).send({
                                grupo: grupo,
                                alunos: alunos,
                                professores: professores,
                                andamento: 0
                            });

                        } else{
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

                                            if(result.length == 0){
                                                res.status(202).send({
                                                    grupo: grupo,
                                                    alunos: alunos,
                                                    professores: professores,
                                                    andamento: 0
                                                });

                                            } else{
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
                                            }
        
                                        })
                                    }
                                })
                            }
                        }
                    });
                });
            });
        })
    });
});

router.delete("/deletarAluno/:idAluno", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let idUsuario;
        let idAluno = req.params.idAluno;

        const sqlAutor = "DELETE FROM tblAutor WHERE idAluno = ?";
        connection.query(sqlAutor, idAluno, (error, result) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            const sqlAtividade = "DELETE FROM tblAtividade WHERE idAluno = ?";
            connection.query(sqlAtividade, idAluno, (error, result) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }

                const sqlTarefa = "DELETE FROM tblTarefa WHERE idAluno = ?";
                connection.query(sqlTarefa, idAluno, (error, result) => {
                    if (error) {
                        return res.status(500).send({
                            error: error,
                            response: null,
                        });
                    }

                    const sqlTarefaAluno = "DELETE FROM tblTarefaAluno WHERE idAluno = ?";
                    connection.query(sqlTarefaAluno, idAluno, (error, result) => {
                        if (error) {
                            return res.status(500).send({
                                error: error,
                                response: null,
                            });
                        }

                        const sqlIdUsuario =
                            "SELECT tblUsuario.idUsuario FROM tblUsuario INNER JOIN tblAluno ON tblAluno.idUsuario = tblUsuario.idUsuario WHERE tblAluno.idAluno = ?";
                        connection.query(sqlIdUsuario, idAluno, (error, result) => {
                            if (error) {
                                return res.status(500).send({
                                    error: error,
                                    response: null,
                                });
                            }

                            let result_obj = result;
                            let result_json = result_obj[Object.keys(result_obj)[0]];
                            idUsuario = result_json["idUsuario"];

                            const sqlAluno = "DELETE FROM tblAluno WHERE idAluno = ?";
                            connection.query(sqlAluno, idAluno, (error, result) => {
                                if (error) {
                                    return res.status(500).send({
                                        error: error,
                                        response: null,
                                    });
                                }

                                const sqlUsuario = "DELETE FROM tblUsuario WHERE idUsuario = ?";
                                connection.query(sqlUsuario, idUsuario, (error, result) => {
                                    if (error) {
                                        return res.status(500).send({
                                            error: error,
                                            response: null,
                                        });
                                    }

                                    res.status(202).send("Aluno Deletado");
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

router.get("/listarAvaliacao/:idAluno", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let idGrupo;

        const sqlGrupo = "SELECT idGrupo FROM tblAluno WHERE idAluno = ?";

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

            const sqlAvaliacao = "SELECT * FROM tblAvaliacao WHERE idGrupo = ?";
            connection.query(sqlAvaliacao, idGrupo, (error, result, field) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }

                res.status(200).send({
                    avaliacoes: result.map((avaliacao) => {
                        return {
                            idAvaliacao: avaliacao.idAvaliacao,
                            objetividade: avaliacao.objetividade,
                            dominioConteudo: avaliacao.dominioConteudo,
                            organizacao: avaliacao.organizacao,
                            clareza: avaliacao.clareza,
                            aproveitamentoRecursos: avaliacao.aproveitamentoRecursos,
                            posturaIntegrantes: avaliacao.posturaIntegrantes,
                            fluenciaExposicaoIdeias: avaliacao.fluenciaExposicaoIdeias,
                            argumentacao: avaliacao.argumentacao,
                            usoTempo: avaliacao.usoTempo,
                            capacidadeComunicacao: avaliacao.capacidadeComunicacao,
                            observacoes: avaliacao.observacoes,
                            idAvaliador: avaliacao.idAvaliador,
                        };
                    }),
                });
            });
        });
    });
});

router.get("/grupoAluno/:idAluno", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let grupo;

        const sqlGrupo =
            "SELECT tblGrupo.idGrupo, nomeProjeto, temaProjeto, numeracao, nomeGrupo, descricao, dataApresentacao, horaApresentacao, tblGrupo.idTurma FROM tblGrupo INNER JOIN tblAluno ON tblGrupo.idGrupo = tblAluno.idGrupo WHERE idAluno = ?";
        connection.query(sqlGrupo, req.params.idAluno, (error, result, field) => {
            grupo = result;

            res.status(202).send({
                grupo: grupo
            });
        });
    });
});

module.exports = router;