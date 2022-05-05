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

router.post("/cadastrarAluno/:idTurma", (req, res) => {
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
                "INSERT INTO tblAluno (idTurma, idUsuario, idGrupo) VALUES (?, ?, ?)";
            const valuesAluno = [req.params.idTurma, idUsuario, req.body.idGrupo];
            connection.query(sqlAluno, valuesAluno, (error, result, field) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }

                run(senha, req.body.email, req.body.nome);

                res.status(202).send({
                    message: "Aluno Cadastrado com Sucesso",
                });
            });
        });
    });
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
                "INSERT INTO tblAluno (idTurma, idUsuario, idGrupo) VALUES (?, ?, ?)";
            const valuesAluno = [req.body.idTurma, idUsuario, req.body.idGrupo];
            connection.query(sqlAluno, valuesAluno, (error, result, field) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }

                run(senha, req.body.email, req.body.nome);

                res.status(202).send({
                    message: "Aluno Cadastrado com Sucesso",
                });
            });
        });
    });
});


router.post("/editarAluno/:idAluno", upload.single("foto"), (req, res) => {
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
                const valuesUsuario = [
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

                        let foto;

                        if (req.file == undefined) {
                            foto = "uploads/fotopadrao.svg";
                        } else {
                            foto = req.file.path;
                        }

                        const sqlEditAluno =
                            "UPDATE tblAluno SET foto = ? WHERE idAluno = ?";
                        const valuesEditAluno = [foto, req.params.idAluno];
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

// PRECISA DE DOIS GETS, UM DE ALUNO ESPECIFICO E OUTRO DE ALUNOS DE UMA TURMA

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



router.get('/informacoesGrupo/:idAluno', (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let grupo
        let alunos = []
        let professores = []
        let andamento = []

        const sqlGrupo = 'SELECT * FROM tblGrupo INNER JOIN tblAluno ON tblGrupo.idGrupo = tblAluno.idGrupo WHERE idAluno = ?'
        connection.query(
            sqlGrupo,
            req.params.idAluno,
            (error, result, field) => {
                grupo = result

                const sqlAlunos = 'SELECT idAluno FROM tblAluno WHERE idGrupo = ?'
                connection.query(
                    sqlAlunos,
                    grupo[0].idGrupo,
                    (error, result, field) => {

                        let idAlunos = []

                        for (let a = 0; a < result.length; a++) {
                            if(result[a].idAluno != req.params.idAluno){
                                idAlunos.push(result[a].idAluno)
                            }
                        }

                        for (let a = 0; a < idAlunos.length; a++) {
                            const sqlNomeAluno = 'SELECT nome FROM tblUsuario INNER JOIN tblAluno ON tblAluno.idUsuario = tblUsuario.idUsuario WHERE idAluno = ?'
                            connection.query(
                                sqlNomeAluno,
                                idAlunos[a],
                                (error, result, field) => {
                                    alunos.push(result[0].nome)
                                }
                            )
                        }

                        const sqlIdProfessores = 'SELECT nome FROM tblUsuario INNER JOIN tblProfessor ON tblProfessor.idUsuario = tblUsuario.idUsuario INNER JOIN tblProfessorGrupo ON tblProfessorGrupo.idProfessor = tblProfessor.idProfessor WHERE idGrupo = ?'
                        connection.query(
                            sqlIdProfessores,
                            grupo[0].idGrupo,
                            (error, result, field) => {
                                if (error) {
                                    return res.status(500).send({
                                        error: error,
                                        response: null,
                                    });
                                }

                                for (let p = 0; p < result.length; p++) {
                                    professores.push(result[p].nome)
                                }

                                const sqlAndamento = 'SELECT * FROM tblTarefa INNER JOIN tblAluno ON tblAluno.idAluno = tblTarefa.idAluno WHERE idGrupo = ?'
                                connection.query(
                                    sqlAndamento,
                                    grupo[0].idGrupo,
                                    (error, result, field) => {
                                        if (error) {
                                            return res.status(500).send({
                                                error: error,
                                                response: null,
                                            });
                                        }

                                        let total = []
                                        let concluidas = []
                                        
                                        for (let t = 0; t < result.length; t++) {
                                            total.push(result[t].idTarefa)
                                            if(result[t].status == 'Concluída'){
                                                concluidas.push(result[t].status)
                                            }
                                        }

                                        let porcentagemProjetoConcluido = (100 * concluidas.length) / total.length

                                        res.status(202).send({
                                            grupo: grupo,
                                            alunos: alunos,
                                            professores: professores,
                                            andamento: porcentagemProjetoConcluido
                                        });

                                    }
                                )

                            })
                        })
                    })
            })
})


router.delete("/deletarAluno/:idAluno", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let idUsuario;

        const sqlGetAlunno = "SELECT * FROM tblAluno WHERE idAluno = ?";
        connection.query(
            sqlGetAlunno,
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
                idUsuario = result_json["idUsuario"];

                console.log(idUsuario);

                const sqlDeleteAluno = "DELETE FROM tblAluno WHERE idAluno = ?";
                connection.query(
                    sqlDeleteAluno,
                    req.params.idAluno,
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

                            res.status(202).send({
                                message: "aluno deletado",
                            });
                        });
                    }
                );
            }
        );
    });
});

module.exports = router;