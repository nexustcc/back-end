/* IMPORTA O PACOTE EXPRESS PARA A APLICAÇÃO*/
const express = require('express');

/* CRIA UMA INSTANCIA DO PACOTE EXPRESS PARA SER UTILIZADA NA APLICAÇÃO*/

const app = express();

/* INSTANCIA DO SERVIDOR (EXPRESS)*/
//primeiro parâmetro - listen (precisa de uma porta) - padrão de desenvolvimento é a porta 3000
//segundo parâmetro - callback

app.listen(3000, ()=>{
    console.log('SERVIDOR RODANDO EM http://localhost:3000')
});