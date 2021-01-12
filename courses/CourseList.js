
const YaleApi = require('../apis/YaleCourses')
const array = require('lodash/array');
const emojis = require('./reactions').CourseList;
const DiscordCourse = require('./DetailedCourse')
const maxCourses = 6;


//Used to handle collectors and viewing of courses
module.exports = class DiscordCourseList{
    /**
     * Instantiates search term fields
     * @param  {Object} fields
     * @param  {import('discord.js').TextChannel} channel
     */
    constructor(parameters,channel){
        this.parameters = parameters
        this.channel = channel
        this.currentPage = 0
    }
    async init(){
        this.msg = await this.channel.send({embed:{title:"Loading Courses . . ."}})
        this.detailedCourse = new DiscordCourse(this.channel)
        this.detailedCourse.init()
        // # TODO: Make Sure to add fields to this fetch statement when needed
        // # TODO: Do something when the api returns no courses back
        if(this.parameters.courses){
            this.courses = this.parameters.courses.map(course => new YaleApi.Course(course.code,course.term))
        }
        else{
            this.courses = await YaleApi.fetchCourseList(this.parameters.apiFields,this.parameters.term)
        }
        
        this.reloadEmbed()
        //Loads all the courses in the background
        this.loadNextPages()
        
        //Creating reaction collectors and processing it
        this.reactionCollector = this.msg.createReactionCollector((reaction,user)=>{
            return reaction.emoji.name in emojis && !user.bot
        })
        this.reactionCollector.on('collect',(reaction,user) => { 
            emojis[reaction.emoji.name](this)
            if(this.channel.type !== "dm") reaction.users.remove(user);
        })
        //Adding Reactions
        for (const emoji in emojis){
            await this.msg.react(emoji)
        }
        //Intialize Reactions later for the detailed course embed
        this.detailedCourse.initReactions()

        // TODO Cleanup Object when Reaction Collector Expires
    }
    async reloadEmbed(){
        const currentCourse = this.currentPage*maxCourses
        const embed = await courseListEmbed(this.courses.slice(currentCourse,currentCourse+maxCourses),this.currentPage,this.courses.length)
        this.msg.edit({embed})
    }
    loadNextPages(){
        const currentCourse = this.currentPage*maxCourses
        this.courses.slice(currentCourse+maxCourses,currentCourse+(maxCourses*3)).forEach(course=>course.init())
    }
    //Goes to next page if possible and reloads the embed
    nextPage(){
        if((this.currentPage+1)*maxCourses < this.courses.length){
            this.currentPage+=1;
            this.reloadEmbed();
            this.loadNextPages()
        }
    }
    previousPage(){
        if((this.currentPage-1)*maxCourses >= 0){
            this.currentPage-=1;
            this.reloadEmbed();
        }
    }
    getDetails(num){
        const currentCourseIndex = (this.currentPage)*maxCourses + num;
        if( currentCourseIndex < this.courses.length) this.detailedCourse.setCourse(this.courses[currentCourseIndex]);
    }

}

/**
 * Creates an embed object based on a given array of Courses
 * @param  {Array<YaleApi.Course>} courses
 * @returns {Object}
 */
const courseListEmbed = async (courses,currentPage,coursesTotal) => {
    // TODO Add a description with the serach terms provided
    var currentCourse = 1;
    let fields = courses.map(async course => {
        const num = currentCourse
        currentCourse +=1;
        await course.init()
        const meetingTimes = course.meetingTimes || "~~HTBA~~"
        let instructor = (course.instructor === "Varies by section") ? "Varies by Section":`[${course.instructor}](https://directory.yale.edu/?queryType=term&pattern=${encodeURI(course.instructor)})`
        if (course.instructor === "~~None~~") instructor = course.instructor;
        const fields = [
            {
                name:`**${num}. __${course.code} - ${course.title}__**`,
                // #TODO Make sure the splice ends in between words
                value: ""+course.description.slice(0,145) + ' . . .'
            },
            {
                name:'Instructor',
                value:instructor,
                inline:true
            },
            {
                name:'Meeting Time',
                value:meetingTimes,
                inline:true
            },
            {
                name:'# of Sections',
                value:course.sectionSize,
                inline:true
            },
        ]
        return fields
    })
    const responseFields = await Promise.all(fields)
    fields = array.flatten(responseFields)
    const lastCourse = (currentPage+1)*maxCourses
    const embed =  {
        'title':'Results:',
        'color':0x0a47b8,
        fields,
        footer:{
            text:`Page ${currentPage+1} | ${currentPage*maxCourses+1}-${(lastCourse > coursesTotal) ? coursesTotal:lastCourse } out of ${coursesTotal}.`
        }
    }
    return embed
}
