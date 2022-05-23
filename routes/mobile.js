const express = require("express");
const res = require("express/lib/response");
const router = express.Router();
const mysql = require("../mysql");
const converterData = require("./utils/date");

router.get("/avaliador/listarGruposAvaliador/:idAvaliador", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql =
            "SELECT tblgrupo.idGrupo, tblgrupo.nomeProjeto, tblgrupo.temaProjeto FROM tblGrupo INNER JOIN tblAvaliadorGrupo ON tblGrupo.idGrupo = tblAvaliadorGrupo.idGrupo WHERE idAvaliador = ?";
        const values = [req.params.idAvaliador];
        connection.query(sql, values, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(200).send(result);
        });
    });
});

router.get("/avaliador/listarGrupo/:idGrupo", (req, res) => {
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
                        descricaoProjeto: grupo.descricao,
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

router.get("/avaliador/listarAlunosGrupo/:idGrupo", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql =
            "SELECT tblUsuario.nome, tblAluno.foto FROM tblAluno INNER JOIN tblUsuario ON tblAluno.idUsuario = tblUsuario.idUsuario WHERE tblAluno.idGrupo = ?";
        connection.query(sql, req.params.idGrupo, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(200).send(result);
        });
    });
});

router.get("/avaliador/listarProfessoresGrupo/:idGrupo", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql =
            "SELECT tblUsuario.nome, tblProfessor.foto FROM tblProfessor INNER JOIN tblUsuario ON tblProfessor.idUsuario = tblUsuario.idUsuario INNER JOIN tblProfessorGrupo ON tblProfessor.idProfessor = tblProfessorGrupo.idProfessor WHERE tblProfessorGrupo.idGrupo = ?";
        connection.query(sql, req.params.idGrupo, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(200).send(result);
        });
    });
});

router.post("/avaliador/avaliarGrupo/:idAvaliador", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let idAvaliacao;

        const sqlAvaliacao =
            "INSERT INTO tblAvaliacao (objetividade, dominioConteudo, organizacao, clareza, aproveitamentoRecursos, posturaIntegrantes, fluenciaExposicaoIdeias, argumentacao, usoTempo, capacidadeComunicacao, observacoes, idAvaliador, idGrupo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const valuesAvaliacao = [
            req.body.objetividade,
            req.body.dominioConteudo,
            req.body.organizacao,
            req.body.clareza,
            req.body.aproveitamentoRecursos,
            req.body.posturaIntegrantes,
            req.body.fluenciaExposicaoIdeias,
            req.body.argumentacao,
            req.body.usoTempo,
            req.body.capacidadeComunicacao,
            req.body.observacoes,
            req.params.idAvaliador,
            req.body.idGrupo,
        ];

        connection.query(sqlAvaliacao, valuesAvaliacao, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(202).send({
                message: "Avaliacao Cadastrada com Sucesso",
            });
        });
    });
});



router.post('/login/', (req, res) => {
    mysql.connect((error, connection) => {
        if (error) return res.status(500).send({ error: error });

        const sqlLoginAvaliador = 'SELECT tblavaliador.idAvaliador, tblusuario.nome FROM tblavaliador INNER JOIN tblusuario ON tblusuario.idUsuario = tblavaliador.idUsuario WHERE tblusuario.email = ? AND tblusuario.senha = ?;'
        connection.query(sqlLoginAvaliador, [req.body.email, req.body.senha], (error, result) => {

            if (error) return res.status(500).send({ error: error, response: null });

            if(result.lenght == undefined) {
                return res.status(200).send('Dados Inválidos')
            } else{
                return res.status(200).send(result)
            }
        })
    })
})

// router.post("/cadastrarAluno", (req, res) => {
// mysql.connect((error, connection) => {
//     if (error) {
//         return res.status(500).send({
//             error: error,
//         });
//     }

//         let senha = randomizarSenha();

//         let idUsuario;

//         const sqlUsuario =
//             "INSERT INTO tblUsuario (nome, email, senha) VALUES (?, ?, ?)";
//         const valuesUsuario = [req.body.nome, req.body.email, senha];
//         connection.query(sqlUsuario, valuesUsuario, (error, result, field) => {
// if (error) {
//     return res.status(500).send({
//         error: error,
//         response: null,
//     });
// }
//             console.log("cadastrou usuario");
//             idUsuario = result.insertId;
//             idGrupo = 0;

//             const sqlAluno =
//                 "INSERT INTO tblAluno (foto, idTurma, idUsuario, idGrupo) VALUES (?, ?, ?, ?)";
//             const valuesAluno = [
//                 "uploads/fotopadrao.svg",
//                 req.body.idTurma,
//                 idUsuario,
//                 req.body.idGrupo,
//             ];
//             connection.query(sqlAluno, valuesAluno, (error, result, field) => {
//                 if (error) {
//                     return res.status(500).send({
//                         error: error,
//                         response: null,
//                     });
//                 }

//                 //run(senha, req.body.email, req.body.nome);

// res.status(202).send({
//     message: "Aluno Cadastrado com Sucesso",
// });
//             });
//         });
//     });
// });

module.exports = router;