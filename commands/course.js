const CourseList = require('../courses/CourseList')
const getCriteria = require('../apis/YaleCourses').getCriteria

module.exports = {
    name: 'course',
    aliases:['courses'],
    description: 'Interact with the Yale Courses',
    /**
     * @param  {import('discord.js').Message} message
     * @param  {Array<String>} args
     */
    async execute(message,args) {
        if(!args.length) return message.channel.send({embed:helpEmbed});
        const action = args.shift().toLowerCase()

        switch(action){
            case "search":
                if(!args.length) return message.channel.send({embed:searchEmbed()});
                //Setups parameters. Apifields are query parameters optional by the api.
                const apiFields = []
                let term = '';
                //Finds additional parameters indicators
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
                        apiFields.push({
                            'field': param.field,
                            value
                        })
                    }
                    //Handles Term Var
                    if(param.field ==='term' && !indexes.includes(argIndex+1)){
                        const value = args.slice(argIndex+1,indexes[index+1]).join(" ");
                        if(value in param.options){
                            term = param.options[value]
                        }
                    }
                })
                //Defaults for values not instantiated
                if(!term){
                    term = searchParameters['-t'].default
                }

                //Create new CourseList
                message.courses = new CourseList({apiFields,term},message.channel)
                message.courses.init()
                break;
            case "worksheet":
                const Users = message.client.db.Users
                const user = await Users.findOne({ where: { user_id: message.author.id } });
                if(!user || !user.get('courses')) return message.author.send("**Courses:** `No worksheet found. Do !course search to find courses.`");
                const courses = user.get('courses')
                message.courses = new CourseList({courses},message.channel)
                message.courses.init()
                break;
            // TODO Make a bit more dynamic
            case "departments":
                const {departments} = await getCriteria()
                message.author.send({embed:optionsEmbed("Departments",departments)})
                if(message.channel.type !== 'dm')message.reply("```Sent options to your dms.```");
                break;
            case "subjects":
                const {subjects} = await getCriteria()
                message.author.send({embed:optionsEmbed("subjects",subjects)})
                if(message.channel.type !== 'dm')message.reply("```Sent options to your dms.```");
                break;
            default:
                message.reply({embed:helpEmbed})
        }
    }
}
//Search Parameters that are usable
const searchParameters = {
    '-t':{
        field:'term',
        name:'Term/Semester',
        description: '__The default is set to Fall 2020 Automatically.__\n To change to Spring 2021, add `-t spring`.',
        options:{
            'fall':"202003",
            'spring':'202101'
        },
        default:202003,
        required:true
    },
    '-s':{
        field:'subject',
        name:'Subject of Study',
        description:'Enter the corresponding 4-letter subject field\nEx. `"-s CPAR" for Computing in the Arts.`\nDo `!course subjects` for all options',
        apiFields:true,
    },
    '-d':{
        field:'dept',
        name:'Department',
        description:'Enter the corresponding 4-letter department code\nEx. `"-d CPSC" for Computer Science Department.`\nDo `!course departments` for all options',
        apiFields:true
    },
    '-i':{
        field:'instructor',
        name:'Instructor',
        description:"Search for a certain professor or instructor.",
        apiFields:true
    }

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
        description:'Usage: `!course search <keywords> [additional parameters]`\nThis command allows you to search through previous Yale Courses. The keyword is completely optional as long as you put one of the additional parameters. There are plans to add the Fall 2021 semester when possible.\n\nEx. `!course search calculus -d MATH -t spring` - Searches for the keyword "Calculus" within the math department in spring semester.\nEx. `!course search -s CPSC` - Searches for Computer Science courses',
        'color':0x0a47b8,
        fields,
        footer:{
            text:`This Feature uses the https://courses.yale.edu/ API`,
        }
    }
}

const helpEmbed = {
    title:"**Course Commands**",
    description:"A set of commands that allows you to search up yale courses with parameters, save courses, and view them later all through Discord.",
    'color':0x0a47b8,
    fields:[
        {
            name: '__**!course search**__',
            value: 'Usage: `!course search <keywords> [additional parameters]`\n**Type *!course search* for additional details and parameters available.** This command allows you to search through previous Yale Courses. '
        },
        {
            name: "__**!course worksheet**__",
            value: 'Usage: `!course worksheet`\n This command allows you to view your saved courses.'
        }
    ],
    footer:{
        text:`This Feature uses the https://courses.yale.edu/ API`,
    }
}

const optionsEmbed = (title,arr) => {
    let description
    let fields = []
    arr.reduce((acc,val,index,arr) => {
        //This convoluted mess is because Discord Fields have a max field description of 1024 characters and description is max of 2048.
        const reset = () => {
            acc.string = '';
            acc.count = 0;
        }
        const addString = () => {
            if (index){
                acc.string += val + '\n';
                acc.count+=val.length + 2;
            }
            else{
                acc.string += val + ' • ';
                acc.count+=val.length + 3;
            }
        }
        if(acc.count + val.length + 2 < 2048 && acc.first){
            addString()
            if (index != arr.length-1) return acc;
        }
        if(acc.count + val.length + 2 < 1024 && !acc.first){
            addString()
            if (index != arr.length-1) return acc;
        }
        if (acc.first){
            description = acc.string
            reset()
            addString()
            acc.first = false;
        }
        else {
            fields.push({
                name:"__More Options__",
                value:acc.string
            })
            reset()
            addString()
        }
        return acc
    },{string:'',count:0,first:true})

    return {
        title:`Available ${title}`,
        description:description,
        fields
    }
}