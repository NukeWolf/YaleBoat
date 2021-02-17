const axios = require('axios')
/**
 * @type {axios.default} api
 */
module.exports = api = axios.create({
    baseURL: "https://www.xwordinfo.com/JSON/Data.aspx",
    headers:{
        "Referer":"https://www.xwordinfo.com/JSON/Sample1",
    },
})
