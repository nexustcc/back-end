const express = require("express");
const router = express.Router();
const mysql = require("../mysql");

router.post('/', (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql = "SELECT idUsuario, nome FROM tblUsuario WHERE email = ? AND senha = ?";
        const values = [req.body.email, req.body.senha]
        connection.query(
            sql, 
            values, 
            (error, result, field) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }

                let idUsuario;
                let nome

                if(result != ""){
                    let result_obj = result;
                    idUsuario = result_obj[Object.keys(result_obj)[0]]["idUsuario"];
                    nome = result_obj[Object.keys(result_obj)[0]]["nome"];

                    const sqlInstituicao = 'SELECT idInstituicao FROM tblInstituicao WHERE idUsuario = ?'
                    connection.query(
                        sqlInstituicao,
                        idUsuario,
                        (error, result, field) => {
                            if (error) {
                                return res.status(500).send({
                                    error: error,
                                    response: null,
                                });
                            }

                            if(result != ""){
                                res.status(201).send({
                                    idUsuario: idUsuario,
                                    nome: nome,
                                    tipo: 'instituição'
                                });

                            } else{
                                const sqlProfessor = 'SELECT idProfessor FROM tblProfessor WHERE idUsuario = ?'
                                connection.query(
                                    sqlProfessor,
                                    idUsuario,
                                    (error, result, field) => {
                                        if (error) {
                                            return res.status(500).send({
                                                error: error,
                                                response: null,
                                            });
                                        }
            
                                        if(result != ""){
                                            res.status(201).send({
                                                idUsuario: idUsuario,
                                                nome: nome,
                                                tipo: 'professor'
                                            });

                                        } else{
                                            const sqlAluno = 'SELECT idAluno FROM tblAluno WHERE idUsuario = ?'
                                            connection.query(
                                                sqlAluno,
                                                idUsuario,
                                                (error, result, field) => {
                                                    if (error) {
                                                        return res.status(500).send({
                                                            error: error,
                                                            response: null,
                                                        });
                                                    }
                        
                                                    if(result != ""){
                                                        res.status(201).send({
                                                            idUsuario: idUsuario,
                                                            nome: nome,
                                                            tipo: 'aluno'
                                                        });

                                                    } else{
                                                        res.status(201).send({
                                                            idUsuario: idUsuario,
                                                            nome: nome,
                                                            tipo: 'avaliador'
                                                        });
                                                    }
                                                });
                                        }
                                    });
                            }
                        });               
                } else{
                    res.status(201).send({
                        message: "email ou senha inválidos",
                    });
                }
        })
    })
})

module.exports = router;