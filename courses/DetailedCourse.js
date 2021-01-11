/**
 * @typedef {import('../apis/YaleCourses').Course} CourseObject
 */
const emojis = require('./reactions').DetailedCourse

module.exports = class DiscordCourse{
    /**
     * @param  {import('discord.js').TextChannel} channel
     */
    constructor(channel){
        this.channel = channel
    }
    async init(){
        this.msg = await this.channel.send({embed:firstEmbed})
    }
    async initReactions(){
        for (const emoji in emojis){
            await this.msg.react(emoji)
        }
        
        this.reactionCollector = this.msg.createReactionCollector((reaction)=>{
            return reaction.emoji.name in emojis
        })

        this.reactionCollector.on('collect',(reaction,user) => { 
            emojis[reaction.emoji.name](this,user)
            reaction.users.remove(user)
        })
        // TODO Handle Expiration of Collector

    }
    /**
     * @param  {CourseObject} course
     */
    setCourse(course){
        this.course = course
        this.reloadEmbed()
        
    }
    reloadEmbed(){
        this.msg.edit({embed:detailedCouseEmbed(this.course)})
    }
    saveCourse(user){

    }
    close(){
        this.msg.edit({embed:firstEmbed})
    }
}
/**
 * @param  {CourseObject} course
 */
const detailedCouseEmbed = (course) => {
    const fields = [
        {
            name:"Prerequisites",
            value:course.prerequisites,
        },
        {
            name:"Distributional Requirements",
            value:course.distributional.join(" • "),
            inline:true

        },
        {
            name:"Final Exam",
            value:course.finalExam,
            inline:true
        },
        {
            name:"Yale Course Credit(s)",
            value:course.hours,
            inline:true,
        },
    ]
    course.sections.map(section => {
        return `**Section #${section.no}** • Instructor: ${section.instructor} • Meeting Times: ${section.meetingTime} • ${section.crn}`
    })
    .reduce((acc,val,index,arr) => {
        //This convoluted mess is because Discord Fields have a max field description of 1024 characters.
        const reset = () => {
            acc.string = '';
            acc.count = 0;
        }
        const addString = () => {
            acc.string += val + '\n';
            acc.count+=val.length + 4;
        }
        if(acc.count + val.length + 4 < 1024){
            addString()
            if (index != arr.length-1) return acc;
        }
        if (acc.first){
            fields.push({
                name:"__All Sections__",
                value:acc.string
            })
            reset()
            addString()
            acc.first = false;
        }
        else {
            fields.push({
                name:"__More Sections__",
                value:acc.string
            })
            reset()
            addString()
        }
        return acc
    },{string:'',count:0,first:true})

    //Add additional course info if it exists
    if(course.additionalInfo) fields.splice(1,0,{
        name:"Additional Info & Attributes",
        value:course.additionalInfo.join(" • ")
    });
    if(course.description.length > 2048){
        fields.splice(0,0,{
            name:"Description Continued",
            value:course.description.slice(2048)
        })
    }

    return {
        title:`**__${course.code} - ${course.title}__**`,
        url:`https://courses.yale.edu/?details&srcdb=${course.term}&code=${encodeURI(course.code)}`,
        description:(course.description.length <= 2048) ? course.description : course.description.slice(0,2048),
        fields,
        footer:{
            text:`Last Updated: ${course.lastUpdated}`
        }
        
    }
}
const firstEmbed = {
    "title":"React to a number to view more details about the course above.",
    "description":":x: - Returns to this message\n:floppy_disk: - Saves this course in your discord worksheet."
}