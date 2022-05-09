/**
 * TODO: A rota /listarUsuarios/:idProfessor, da linha 219, está com erros, ainda é necessário fazer o retorno dos avaliadores
 *
 * SELECT tblAvaliadorGrupo.idAvaliador FROM tblAvaliadorGrupo INNER JOIN tblGrupo ON tblGrupo.idGrupo = tblAvaliadorGrupo.idGrupo INNER JOIN tblProfessorGrupo ON tblProfessorGrupo.idGrupo = tblGrupo.idGrupo WHERE idProfessor = 58;
 */

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

router.post("/cadastrarProfessor/:idInstituicao", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let senha = randomizarSenha();

        let idUsuario;

        const sqlUsuario =
            "INSERT INTO tblusuario (nome, email, senha) VALUES (?, ?, ?)";
        const valuesUsuario = [req.body.nome, req.body.email, senha];
        //const { nome, email, senha } = req.body;
        connection.query(sqlUsuario, valuesUsuario, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }
            console.log("cadastrou usuario");
            idUsuario = result.insertId;

            const sqlProfessor =
                "INSERT INTO tblProfessor (foto, idInstituicao, idUsuario) VALUES (?, ?, ?)";
            const valuesProfessor = ["uploads/fotopadrao.svg", req.params.idInstituicao, idUsuario];
            connection.query(
                sqlProfessor,
                valuesProfessor,
                (error, result, field) => {
                    // if (error) {
                    //     return res.status(500).send({
                    //         error: error,
                    //     });
                    // }

                    idProfessor = result.insertId;

                    const sqlProfessorCurso =
                        "INSERT INTO tblProfessorCurso (idProfessor, idCurso) VALUES (?, ?)";

                    let cursos = req.body.cursos;

                    for (var i = 0; i < cursos.length; i++) {
                        connection.query(
                            sqlProfessorCurso,
                            [idProfessor, cursos[i]],
                            (error, result, field) => {
                                // if (error) {
                                //     return res.status(500).send({
                                //         error: error,
                                //     });
                                // }
                            }
                        );
                    }

                    let turmas = req.body.turmas;

                    for (let t = 0; t < turmas.length; t++) {
                        connection.query(
                            "INSERT INTO tblTurmaProfessor (idProfessor, idTurma) VALUES (?, ?)",
                            [idProfessor, turmas[t]],
                            (error, result, field) => {
                                // if (error) {
                                //     return res.status(500).send({
                                //     error: error,
                                //     });
                                // }
                            }
                        );
                    }

                    run(senha, req.body.email, req.body.nome);

                    res.status(202).send({
                        message: "Professor Cadastrado com Curso",
                    });
                }
            );
        });
    });
});

router.get("/listarProfessor/:idProfessor", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql =
            "SELECT * FROM tblProfessor INNER JOIN tblUsuario ON tblProfessor.idUsuario = tblUsuario.idUsuario WHERE idProfessor = ?";
        const values = [req.params.idProfessor];
        connection.query(sql, values, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(200).send({
                professor: result.map((professor) => {
                    return {
                        foto: professor.foto,
                        usuario: {
                            nome: professor.nome,
                            email: professor.email,
                            senha: professor.senha,
                        },
                    };
                }),
            });
        });
    });
});

router.get("/listarCursos/:idProfessor", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql =
            "SELECT tblCurso.nome, tblCurso.idCurso FROM tblProfessorCurso INNER JOIN tblProfessor ON tblProfessor.idProfessor = tblProfessorCurso.idProfessor INNER JOIN tblCurso ON tblCurso.idcurso = tblProfessorCurso.idCurso WHERE tblProfessorCurso.idProfessor = ?";
        const values = [req.params.idProfessor];

        connection.query(sql, values, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(200).send({
                cursos: result,
            });
        });
    });
});

router.get("/listarTurmas/:idProfessor", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql =
            "SELECT tblTurma.nome FROM tblTurmaProfessor INNER JOIN tblProfessor ON tblProfessor.idProfessor = tblTurmaProfessor.idProfessor INNER JOIN tblTurma ON tblTurma.idTurma = tblTurmaProfessor.idTurma WHERE tblTurmaProfessor.idProfessor = ?";
        const values = [req.params.idProfessor];

        connection.query(sql, values, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(200).send({
                turmas: result,
            });
        });
    });
});

router.get("/listarUsuarios/:idProfessor", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sqlAlunos =
            "SELECT tblAluno.idAluno FROM tblAluno INNER JOIN tblTurma ON tblTurma.idTurma = tblAluno.idTurma INNER JOIN tblTurmaProfessor ON tblTurmaProfessor.idTurma = tblTurma.idTurma WHERE idProfessor = ?";
        const valuesAlunos = [req.params.idProfessor];

        connection.query(sqlAlunos, valuesAlunos, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            let idAlunos = [];

            for (let a = 0; a < result.length; a++) {
                idAlunos.push(result[a].idAluno);
            }

            let arrayAlunos = new Array();

            console.log(idAlunos);

            const sqlAlunoNome =
                "SELECT nome FROM tblUsuario INNER JOIN tblAluno ON tblAluno.idUsuario = tblUsuario.idUsuario WHERE idAluno = ?";

            for (let n = 0; n < idAlunos.length; n++) {
                connection.query(sqlAlunoNome, idAlunos[n], (error, result, field) => {
                    if (error) {
                        return res.status(500).send({
                            error: error,
                            response: null,
                        });
                    }

                    arrayAlunos.push(result[0].nome);
                    console.log(arrayAlunos[n]);
                });

                console.log(arrayAlunos + "teste");
            }
            console.log(arrayAlunos + "teste2");

            res.status(200).send({
                alunos: arrayAlunos,
            });
        });
    });
});

/**
 * TODO: Essa rota está retornando alguns valores nulls, caso isso seja um problema, é necessário corrigi-lo.
 */

router.get("/listarGrupos/:idProfessor", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql =
            "SELECT nomeGrupo FROM tblGrupo INNER JOIN tblProfessorGrupo ON tblGrupo.idGrupo = tblProfessorGrupo.idGrupo WHERE idProfessor = ?";
        const values = [req.params.idProfessor];

        connection.query(sql, values, (error, result, field) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                    response: null,
                });
            }

            res.status(200).send({
                turmas: result,
            });
        });
    });
});

router.put(
    "/editarProfessorCursosGrupos/:idProfessor",
    upload.single("foto"),
    (req, res) => {
        console.log(req.file);
        mysql.connect((error, connection) => {
            if (error) {
                return res.status(500).send({
                    error: error,
                });
            }

            let idGrupos = [];
            let idGruposDeletar = [];

            const sqlIdProfessor =
                "SELECT idGrupo FROM tblProfessorGrupo WHERE idProfessor = ?";
            connection.query(
                sqlIdProfessor,
                req.params.idProfessor,
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

                    let idGruposProfessor = req.body.grupos;

                    console.log("GRUPOS DA REQUISIÇÃO: " + idGruposProfessor);

                    for (let n = 0; n <= idGruposProfessor.length; n++) {
                        if (idGruposProfessor.indexOf(idGrupos[n]) >= 0) {
                            console.log(
                                "MANTER GRUPO " + (idGrupos[n] + ", mas tirar do ARRAY")
                            );
                            idGruposProfessor.splice(
                                idGruposProfessor.indexOf(idGrupos[n]),
                                1
                            );
                        } else if (idGruposProfessor.indexOf(idGrupos[n]) < 0) {
                            console.log("TIRAR GRUPO " + idGrupos[n]);
                            idGruposDeletar.push(idGrupos[n]);
                        }
                    }

                    if (idGruposDeletar.length != 0) {
                        console.log("DELETAR GRUPOS: " + idGruposDeletar);
                        const sqlDeletarGrupos =
                            "DELETE FROM tblProfessorGrupo WHERE idProfessor = ? AND idGrupo = ?";
                        for (let g = 0; g < idGruposDeletar.length; g++) {
                            connection.query(
                                sqlDeletarGrupos,
                                [req.params.idProfessor, idGruposDeletar[g]],
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

                    if (idGruposProfessor.length != 0) {
                        console.log("CRIAR GRUPOS: " + idGruposProfessor);
                        const sqlAdicionarGrupos =
                            "INSERT INTO tblProfessorGrupo (idProfessor, idGrupo) VALUES (?, ?)";
                        for (let g = 0; g < idGruposProfessor.length; g++) {
                            connection.query(
                                sqlAdicionarGrupos,
                                [req.params.idProfessor, idGruposProfessor[g]],
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
                }
            );

            let idCursos = [];
            let idCursosDeletar = [];

            const sqlIdCursosProfessor =
                "SELECT idCurso FROM tblProfessorCurso WHERE idProfessor = ?";
            connection.query(
                sqlIdCursosProfessor,
                req.params.idProfessor,
                (error, result, field) => {
                    if (error) {
                        return res.status(500).send({
                            error: error,
                            response: null,
                        });
                    }

                    for (let c = 0; c < result.length; c++) {
                        idCursos.push(result[c].idCurso);
                    }

                    console.log("CURSOS NO BANCO: " + idCursos);

                    let idCursosProfessor = req.body.cursos;

                    console.log("CURSOS DA REQUISIÇÃO: " + idCursosProfessor);

                    for (let n = 0; n <= idCursosProfessor.length; n++) {
                        if (idCursosProfessor.indexOf(idCursos[n]) >= 0) {
                            console.log(
                                "MANTER CURSO " + (idCursos[n] + ", mas tirar do ARRAY")
                            );
                            idCursosProfessor.splice(
                                idCursosProfessor.indexOf(idCursos[n]),
                                1
                            );
                        } else if (idCursosProfessor.indexOf(idCursos[n]) < 0) {
                            console.log("TIRAR CURSO " + idCursos[n]);
                            idCursosDeletar.push(idCursos[n]);
                        }
                    }

                    if (idCursosDeletar.length != 0) {
                        console.log("DELETAR CURSOS: " + idCursosDeletar);
                        const sqlDeletarCursos =
                            "DELETE FROM tblProfessorCurso WHERE idProfessor = ? AND idCurso = ?";
                        for (let c = 0; c < idCursosDeletar.length; c++) {
                            connection.query(
                                sqlDeletarCursos,
                                [req.params.idProfessor, idCursosDeletar[c]],
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

                    if (idCursosProfessor.length != 0) {
                        console.log("CRIAR CURSOS: " + idCursosProfessor);
                        const sqlAdicionarCursos =
                            "INSERT INTO tblProfessorCurso (idProfessor, idCurso) VALUES (?, ?)";
                        for (let c = 0; c < idCursosProfessor.length; c++) {
                            connection.query(
                                sqlAdicionarCursos,
                                [req.params.idProfessor, idCursosProfessor[c]],
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
                }
            );

            let idUsuario;

            const sqlGetIdUsuario =
                "SELECT idUsuario FROM tblProfessor WHERE idProfessor = ?";
            const valuesGetIdUsuario = [req.params.idProfessor];

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

                            let foto;

                            if (req.file == undefined) {
                                foto = "uploads/fotopadrao.svg";
                            } else {
                                foto = req.file.path;
                            }

                            const sqlEditProfessor =
                                "UPDATE tblProfessor SET foto = ? WHERE idProfessor = ?";
                            const valuesEditProfessor = [foto, req.params.idProfessor];
                            mysql.query(
                                sqlEditProfessor,
                                valuesEditProfessor,
                                (error, result, field) => {
                                    if (error) {
                                        return res.status(500).send({
                                            error: error,
                                            response: null,
                                        });
                                    }

                                    res.status(201).send({
                                        message: "professor editado",
                                    });
                                }
                            );
                        }
                    );
                }
            );
        });
    }
);

router.put("/editarProfessor/:idProfessor", upload.single("foto"), (req, res) => {
    console.log(req.body);
    console.log(req.file);

    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let idUsuario;

        const sqlGetIdUsuario = "SELECT idUsuario FROM tblProfessor WHERE idProfessor= ?";
        const valuesGetIdUsuario = [req.params.idProfessor];

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
                    "UPDATE tblUsuario SET email = ?, nome = ?, senha = ? WHERE idUsuario = ?";
                const valuesUsuario = [
                    req.body.email,
                    req.body.nome,
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

                        const sqlEditProfessor =
                            "UPDATE tblProfessor SET foto = ? WHERE idProfessor = ?";
                        const valuesEditProfessor = [foto, req.params.idProfessor];
                        mysql.query(
                            sqlEditProfessor,
                            valuesEditProfessor,
                            (error, result, field) => {
                                if (error) {
                                    return res.status(500).send({
                                        error: error,
                                        response: null,
                                    });
                                }

                                res.status(201).send({
                                    message: "professor editado",
                                });
                            }
                        );
                    }
                );
            }
        );
    });
});

router.get("/pegarInstituicao/:idProfessor", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        const sql = "SELECT idInstituicao FROM tblProfessor WHERE idProfessor = ?";
        connection.query(sql, req.params.idProfessor, (error, result, field) => {
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

router.delete("/deletarProfessor/:idProfessor", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        let idUsuario;

        const sqlGetProfessor = "SELECT * FROM tblProfessor WHERE idProfessor = ?";
        connection.query(
            sqlGetProfessor,
            req.params.idProfessor,
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

                const sqlDeleteProfessorCurso =
                    "DELETE FROM tblProfessorCurso WHERE idProfessor = ?";
                connection.query(
                    sqlDeleteProfessorCurso,
                    req.params.idProfessor,
                    (error) => {
                        if (error) {
                            return res.status(500).send({
                                error: error,
                                response: null,
                            });
                        }

                        const sqlDeleteProfessorTurma =
                            "DELETE FROM tblTurmaProfessor WHERE idProfessor = ?";
                        connection.query(
                            sqlDeleteProfessorTurma,
                            req.params.idProfessor,
                            (error) => {
                                if (error) {
                                    return res.status(500).send({
                                        error: error,
                                        response: null,
                                    });
                                }

                                const sqlDeleteProfessor =
                                    "DELETE FROM tblProfessor WHERE idProfessor = ?";
                                connection.query(
                                    sqlDeleteProfessor,
                                    req.params.idProfessor,
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
                                                message: "professor deletado",
                                            });
                                        });
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