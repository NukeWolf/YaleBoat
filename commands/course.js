const CourseList = require('../courses/CourseList')

module.exports = {
    name: 'course',
    aliases:['courses'],
    description: 'Interact with the Yale Courses',
    /**
     * @param  {import('discord.js').Message} message
     * @param  {Array<String>} args
     */
    execute(message,args) {
        // TODO Create Help Message
        if(!args.length) return message.channel.send({embed:searchEmbed()});
        const action = args.shift().toLowerCase()

        switch(action){
            case "search":
                //TODO Add Search Help Message
                if(!args.length) return message.channel.send({embed:searchEmbed()});
                //Setups parameters. Apifields are query parameters optional by the api.
                const apiFields = []
                const indexes = args.reduce((acc,val,index)=>{
                    return (val in searchParameters)? [...acc,index] : acc
                },[]);
                //Setups the keyword if it doesn't find any other parameter indicator
                if(!indexes){
                    apiFields.push({
                        'field': "keyword",
                        value:args.join(' ')
                    })
                }
                else if (indexes[0] !== 0){
                    apiFields.push({
                        'field': "keyword",
                        value:args.slice(0,indexes[0]).join(" ")
                    })
                }
                //When parameter indicators are found in an array, it will join all of the words inbetween together and add it to api field as field:value pair.
                indexes.forEach((argIndex,index) => {
                    const arg = args[argIndex]
                    const param = searchParameters[arg]
                    //Check if there is actually a parameter between parameter indicators
                    if(param.apiFields && !indexes.includes(argIndex+1)){
                        const value = args.slice(argIndex+1,indexes[index+1]).join(" ");
                        console.log(value)
                        apiFields.push({
                            'field': param.field,
                            value
                        })
                    }
                })
                console.log(apiFields)
                const object = new CourseList({apiFields},message.channel)
                object.init()
            default:
                //Help Message
        }
    }
}
//Search Parameters that are usable
const searchParameters = {
    '-s':{
        field:'subject',
        name:'Subject of Study',
        description:'Enter the corresponding 4-letter subject field\nEx. `"-s CPAR" for Computing in the Arts.`',
        apiFields:true,
    },
    '-d':{
        field:'dept',
        name:'Department',
        description:'Enter the corresponding 4-letter department code\nEx. `"-d CPSC" for Computer Science Department.`',
        apiFields:true
    },
    '-i':{
        field:'instructor',
        name:'Instructor',
        description:"Search for a certain professor or instructor.",
        apiFields:true
    }
    //TODO More Parameters, and custom parameters like distributional requirements, Same Professor
}

const searchEmbed = () => {
    let parametersDescription = ''
    for (const param in searchParameters){
        parametersDescription+=`**${param} | ${searchParameters[param].name}** - ${searchParameters[param].description}\n`
    }
    const fields = [
        {
            name:'__Additional Parameters__',
            value: parametersDescription
        },
    ]
    return{
        title:'!Course Search - Help',
        description:'Usage: `!course search <keywords> [additional parameters]`\nThis command allows you to search through previous Yale Courses. The keyword is completely optional as long as you put one of the additional parameters.\n\nEx. `!course search calculus -d MATH` - Searches for the keyword "Calculus" within the math department\nEx. `!course search -s CPSC` - Searches for Computer Science courses',
        'color':0x0a47b8,
        fields,
        footer:{
            text:`This Feature uses the [courses.yale.edu](https://courses.yale.edu/) API`,
        }
    }
}