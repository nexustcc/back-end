const express = require("express");
const router = express.Router();
const mysql = require("../mysql");

router.get("/listarCartao/:idInstituicao", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }

        var idCartao;

        const sqlInstituicao =
            "SELECT idCartao FROM tblInstituicao WHERE idInstituicao = ?";
        const valuesInstituicao = [req.params.idInstituicao];
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

                idCartao = result[Object.keys(result)[0]].idCartao;

                const sqlCartao = "SELECT * FROM tblCartao WHERE idCartao = ?";
                const valuesCartao = [idCartao];
                connection.query(sqlCartao, valuesCartao, (error, result, field) => {
                    if (error) {
                        return res.status(500).send({
                            error: error,
                            response: null,
                        });
                    }

                    res.status(200).send({
                        cartao: result,
                    });
                });
            }
        );
    });
});

router.put("/editarCartao/:idInstituicao", (req, res) => {
    mysql.connect((error, connection) => {
        if (error) {
            return res.status(500).send({
                error: error,
            });
        }
        var idCartao;

        const sqlGetIdCartao =
            "SELECT idCartao FROM tblInstituicao WHERE idInstituicao = ?";
        const valuesGetIdCartao = [req.params.idInstituicao];
        connection.query(
            sqlGetIdCartao,
            valuesGetIdCartao,
            (error, result, field) => {
                if (error) {
                    return res.status(500).send({
                        error: error,
                        response: null,
                    });
                }

                var result_obj = result;
                var result_json = result_obj[Object.keys(result_obj)[0]];
                idCartao = result_json["idCartao"];

                console.log(idCartao);

                const sql =
                    "UPDATE tblCartao SET nomeNoCartao = ?, dataValidade = ?, cvv = ?, numero = ? WHERE idCartao = ?";
                const values = [
                    req.body.nomeNoCartao,
                    req.body.dataValidade,
                    req.body.cvv,
                    req.body.numero,
                    idCartao,
                ];

                console.log(sql);
                console.log(values);

                connection.query(sql, values, (error, result, field) => {
                    if (error) {
                        return res.status(500).send({
                            error: error,
                            response: error.message,
                        });
                    }

                    res.status(202).send({
                        message: "cartao alterado",
                    });
                });
            }
        );
    });
});

module.exports = router;