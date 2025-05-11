
/**
 * 
 * @param {String} str 
 */
function parseSkinConfig(str) {
    let o = {};

    const rows = str.split("\n")//.filter((r) => { return r !== ""; });

    let sectionName = "";
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row.startsWith("[")) {
            sectionName = row.replaceAll(/\[|\]/g, "").trim();
            o[sectionName] = {};
            continue;
        }

        if (row.startsWith("/")) continue;
        if (!row) continue;

        let keysValues = row.split(":");
        let key = keysValues.at(0)?.trim();
        let value = keysValues.at(1)?.trim();

        if(!key) continue;

        o[sectionName][key] = value;

    }

    console.log(o)
    return o;
}

module.exports = {
    parseSkinConfig
}