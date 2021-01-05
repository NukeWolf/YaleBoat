const {version, validate} = require('uuid')


function isValidMd5($md5 = '')
{   
    return ($md5.match(/^[a-f0-9]{32}$/) != null);
}

async function isSimilar(uuid,Users){
    //If there are less different amount of letters than this amount, there's something wrong.
    const suspiciousLetterCount = 16
    const uuidList = await Users.findAll({ attributes: ['uuid']})
    return uuidList.some(user => {
        dbUser = user.uuid.split('')
        numOfDifferent = uuid.split('').reduce((total,char,index) => {
            return (char !== dbUser[index]) ? total+1:total
        },0)
        return suspiciousLetterCount > numOfDifferent && numOfDifferent != 0
    })
}
filter = async (link,Users) => {
    const bait = "idtoken";
    const stringCheck = "apps.admissions.yale.edu/apply/update?id="
    
    if (link.includes(bait)) return {valid:false,error:"There was an issue verifying your ID. Please contact an Admin for further assistance.",malicious:true,reason:"Used the parameter in example link."};
    if (!link.includes(stringCheck)) return {valid:false,error:"Invalid Format, please check your URL and make sure you copied and pasted correctly.",malicious:false};
    uuid = link.slice(link.search("id=")+3)
    if(isValidMd5(uuid)) return {valid:false,error:"There was an issue verifying your ID. Please contact an Admin for further assistance.",malicious:true,reason:"Used md5 hash in example link."};
    if(!validate(uuid)) return {valid:false,error:"Invalid ID, please make sure the link you pasted isn't truncated or modified.",malicious:false};
    if(!(version(uuid) === 4)) return {valid:false,error:"There was an issue verifying your ID. Please contact an Admin for further assistance.",malicious:true,reason:"Used a version of UUID other than 4"};
    const similarity = await isSimilar(uuid,Users)
    if(similarity) return {valid:false,error:"There was an issue verifying your ID. Please contact an Admin for further assistance.",malicious:true,reason:"Too similar to another id"};

    
    return {valid:true,uuid,malicious:false};
}



module.exports = filter
