const getLegitCa = require('./caLegit');
const getRugCa = require('./caRug');


const getContract = (name, symbol, letterName, buyTax, sellTax, legit_rug_state, comment) => {
    if (legit_rug_state) {
        return getRugCa(name, symbol, letterName, buyTax, sellTax, comment);
    } else {
        return getLegitCa(name, symbol, letterName, buyTax, sellTax, comment);
    }

}

module.exports = getContract