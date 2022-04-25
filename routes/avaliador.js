const express = require("express");
const router = express.Router();
const mysql = require("../mysql");

router.post("/cadastrarAvaliador/:idInstituicao", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let idUsuario;
        let idAvaliador;
        let idGrupos;

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

            idUsuario = result.insertId;

            console.log(idUsuario);

            const sqlAvaliador =
                "INSERT INTO tblAvaliador (idInstituicao, idUsuario) VALUES (?, ?)";
            const valuesAvaliador = [req.params.idInstituicao, idUsuario];
            connection.query(
                sqlAvaliador,
                valuesAvaliador,
                (error, result, field) => {
                    if (error) {
                        return res.status(500).send({
                            error: error,
                            response: null,
                        });
                    }

                    idAvaliador = result.insertId;

                    console.log(idAvaliador);

                    idGrupos = req.body.idGrupos;

                    let sqlGrupos =
                        "INSERT INTO tblAvaliadorGrupo (idAvaliador, idGrupo) VALUES (?, ?)";

                    for (let g = 0; g < idGrupos.length; g++) {
                        connection.query(
                            sqlGrupos,
                            [idAvaliador, idGrupos[g]],
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

                    res.status(202).send({
                        message: "Avaliador Cadastrado",
                    });
                }
            );
        });
    });
});

router.get("/listarAvaliador/:idAvaliador", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sqlGrupos =
            "SELECT nomeGrupo FROM tblGrupo INNER JOIN tblAvaliadorGrupo ON tblGrupo.idGrupo = tblAvaliadorGrupo.idGrupo WHERE idAvaliador = ?";
        connection.query(
            sqlGrupos,
            req.params.idAvaliador,
            (error, result, field) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }

                let grupos = [];

                for (let g = 0; g < result.length; g++) {
                    grupos.push(result[g].nomeGrupo);
                }

                const sql =
                    "SELECT nome, email, senha FROM tblAvaliador INNER JOIN tblUsuario ON tblAvaliador.idUsuario = tblUsuario.idUsuario WHERE idAvaliador = ?";
                const values = [req.params.idAvaliador];
                connection.query(sql, values, (error, result, field) => {
                    if (error) {
                        return res.status(500).send({
                            error: error,
                            response: null,
                        });
                    }

                    let result_obj = result;
                    let result_json = result_obj[Object.keys(result_obj)[0]];

                    res.status(200).send({
                        avaliador: result_json,
                        grupos: grupos,
                    });
                });
            }
        );
    });
});

router.get("/listarGruposAvaliador/:idAvaliador", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql =
            "SELECT nomeProjeto, temaProjeto FROM tblGrupo INNER JOIN tblAvaliadorGrupo ON tblGrupo.idGrupo = tblAvaliadorGrupo.idGrupo WHERE idAvaliador = ?";
        const values = [req.params.idAvaliador];
        connection.query(sql, values, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(200).send({
                grupos: result,
            });
        });
    });
});

router.put("/editarAvaliador/:idAvaliador", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let idGrupos = [];
        let idGruposDeletar = [];

        const sqlIdAvaliador =
            "SELECT idGrupo FROM tblAvaliadorGrupo WHERE idAvaliador = ?";
        connection.query(
            sqlIdAvaliador,
            req.params.idAvaliador,
            (error, result, field) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }

                for (let g = 0; g < result.length; g++) {
                    idGrupos.push(result[g].idGrupo);
                }

                console.log("GRUPOS NO BANCO: " + idGrupos);

                let idGruposAvaliador = req.body.novosGruposAvaliador;

                console.log("GRUPOS DA REQUISIÇÃO: " + idGruposAvaliador);

                for (let n = 0; n <= idGrupos.length; n++) {
                    console.log(idGrupos[n]);

                    if (idGruposAvaliador.indexOf(idGrupos[n]) >= 0) {
                        console.log(
                            "MANTER GRUPO " + (idGrupos[n] + ", mas tirar do ARRAY")
                        );
                        idGruposAvaliador.splice(idGruposAvaliador.indexOf(idGrupos[n]), 1);
                    } else if (idGruposAvaliador.indexOf(idGrupos[n]) < 0) {
                        console.log("TIRAR GRUPO " + idGrupos[n]);
                        idGruposDeletar.push(idGrupos[n]);
                    }
                }

                if (idGruposDeletar.length != 0) {
                    console.log("DELETAR: " + idGruposDeletar);
                    const sqlDeletarGrupos =
                        "DELETE FROM tblAvaliadorGrupo WHERE idAvaliador = ? AND idGrupo = ?";
                    for (let g = 0; g < idGruposDeletar.length; g++) {
                        connection.query(
                            sqlDeletarGrupos,
                            [req.params.idAvaliador, idGruposDeletar[g]],
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
                }

                if (idGruposAvaliador.length != 0) {
                    console.log("CRIAR: " + idGruposAvaliador);
                    const sqlAdicionarGrupos =
                        "INSERT INTO tblAvaliadorGrupo (idAvaliador, idGrupo) VALUES (?, ?)";
                    for (let g = 0; g < idGruposAvaliador.length; g++) {
                        connection.query(
                            sqlAdicionarGrupos,
                            [req.params.idAvaliador, idGruposAvaliador[g]],
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
                }

                connection.query(
                    "SELECT idUsuario FROM tblAvaliador WHERE idAvaliador = ?",
                    req.params.idAvaliador,
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

                                res.status(200).send({
                                    message: "Avaliador editado com sucesso",
                                });
                            }
                        );
                    }
                );
            }
        );
    });
});

router.delete("/deletarAvaliador/:idAvaliador", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sqlAvalidorGrupos =
            "DELETE FROM tblAvaliadorGrupo WHERE idAvaliador = ?";
        connection.query(
            sqlAvalidorGrupos,
            req.params.idAvaliador,
            (error, result, field) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }

                const sqlIdAvaliador =
                    "SELECT idGrupo FROM tblAvaliadorGrupo WHERE idAvaliador = ?";
                connection.query(
                    sqlIdAvaliador,
                    req.params.idAvaliador,
                    (error, result, field) => {
                        if (error) {
                            return res.status(500).send({
                                error: error,
                                response: null,
                            });
                        }

                        let grupos = [];

                        for (let g = 0; g < result.length; g++) {
                            grupos.push(result[g].idGrupo);
                        }

                        const sqlDeletarGrupos =
                            "DELETE FROM tblAvaliadorGrupo WHERE idAvaliador = ? AND idGrupo = ?";
                        for (let g = 0; g < grupos.length; g++) {
                            connection.query(
                                sqlDeletarGrupos,
                                [req.params.idAvaliador, grupos[g]],
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

                        connection.query(
                            "SELECT idUsuario FROM tblAvaliador WHERE idAvaliador = ?",
                            req.params.idAvaliador,
                            (error, result, field) => {
                                if (error) {
                                    return res.status(500).send({
                                        error: error,
                                        response: null,
                                    });
                                }

                                let idUsuario;

                                let result_obj = result;
                                let result_json = result_obj[Object.keys(result_obj)[0]];
                                idUsuario = result_json["idUsuario"];

                                const sqlAvaliador =
                                    "DELETE FROM tblAvaliador WHERE idAvaliador = ?";
                                connection.query(
                                    sqlAvaliador,
                                    req.params.idAvaliador,
                                    (error, result, field) => {
                                        if (error) {
                                            return res.status(500).send({
                                                error: error,
                                                response: null,
                                            });
                                        }

                                        const sqlExcluirUsuario =
                                            "DELETE FROM tblUsuario WHERE idUsuario = ?";
                                        connection.query(
                                            sqlExcluirUsuario,
                                            idUsuario,
                                            (error, result, field) => {
                                                if (error) {
                                                    return res.status(500).send({
                                                        error: error,
                                                        response: null,
                                                    });
                                                }

                                                res.status(200).send({
                                                    message: "Avaliador deletado com sucesso",
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
    });
});

module.exports = router;