"use strict";

function converterData(data) {
    if(data != null) {
        let dataSlipt = data.toISOString().split(["T"]);
        let dataArray = dataSlipt[0];
        let dataArraySplit = dataArray.split(["-"]);
        let dataFinal = dataArraySplit[2] + "/" + dataArraySplit[1] + "/" + dataArraySplit[0];
        return dataFinal;
    } else {
        return data = "";
    }
}

module.exports = converterData;