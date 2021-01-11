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
        this.client = this.msg.client
    }
    async initReactions(){
        this.reactionCollector = this.msg.createReactionCollector((reaction,user)=>{
            return reaction.emoji.name in emojis && !user.bot
        })

        this.reactionCollector.on('collect',(reaction,user) => { 
            emojis[reaction.emoji.name](this,user)
            if(!this.channel.type == "dm") reaction.users.remove(user);
        })

        for (const emoji in emojis){
            await this.msg.react(emoji)
        }
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
    async saveCourse(user){
        try{
            if(!this.course) return user.send("**Courses:** `Course not selected. Please select a course first by reacting to a number.`");
            const Users = this.client.db.Users
            const course = {
                code:this.course.code,
                term:this.course.term
            }
            const userDB = await Users.findOne({ where: { user_id: user.id } });
            if(!userDB) {
                await Users.create({
                    user_id:message.author.id,
                    course:[course]
                })
            }
            else{
                const oldCourses = await userDB.get('courses')
                if(oldCourses) {
                    if(oldCourses.some(old => old.code === course.code && old.term === course.term)) return user.send("**Courses:** `This course is already saved.`")
                    else userDB.set('courses',[...oldCourses,course]);
                } 
                else userDB.set('courses',[course])
                await userDB.save()
            }
            // TODO Instructions on how to get courses when that is availible.
            return user.send(`**Courses:** \`The course "${course.code}" has been saved.\``)
        }
        catch(e){
            this.client.log('error',e)
            return user.send("Error has Occured while saving course.")
        }
        
    }
    async deleteCourse(user){
        try{
            if(!this.course) return user.send("**Courses:** `Course not selected. Please select a course first by reacting to a number.`");
            const Users = this.client.db.Users
            const course = {
                code:this.course.code,
                term:this.course.term
            }
            const userDB = await Users.findOne({ where: { user_id: user.id } });
            if (userDB) {
                const oldCourses = await userDB.get('courses')
                if(oldCourses) {
                    if(oldCourses.some(old => old.code === course.code && old.term === course.term)){
                        const newCourses = oldCourses.filter(old => !(old.code === course.code && old.term === course.term))
                        userDB.set('courses',newCourses);
                        userDB.save()
                        return user.send(`**Courses:** \`The course "${course.code}" has been removed.\``)
                    }
                    else return user.send('**Courses:** `Course not found in your list.`')
                } 
            }           
        }
        catch(e){
            this.client.log('error',e)
            return user.send("Error has Occured while saving course.")
        }
    }
    close(){
        this.msg.edit({embed:firstEmbed})
        this.course = undefined
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
    if(course.additionalInfo.length) fields.splice(1,0,{
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
    "title":"React to a number to view more details about the corresponding course above.",
    "description":":arrow_backward: - Returns to this message\n:floppy_disk: - Saves this course in your discord worksheet.\n:x: - Deletes this course in your discord worksheet\nUse :arrow_left: & :arrow_right: to navigate through pages.",
    'color':0x0a47b8,
}