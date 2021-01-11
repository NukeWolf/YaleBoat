const axios = require('axios')
var array = require('lodash/array');
const { JSDOM }= require('jsdom')


/**
 * @type {axios.default} api
 */
const api = axios.create({
    baseURL: "https://courses.yale.edu/api"
})

/**
 * Performs a search query and returns a list of fields
 * @param  {string} term
 * @param  {Object} fields
 * @returns {Array<Course>} Array of Course Objects
 */
async function fetchCourseList(fields,term) {
    const params = {page:'fose',route:'search'}
    //Default Criteria only gets classes from Yale College
    const criteria = [
        {
            "field":"col",
            "value":"YC"
        },
        ...fields
    ]
    const data = {
        "other":{
            "srcdb":term
        },
        criteria
    }
    // #TODO Create a timeout handler
    const response = await api.get('/', {
        params,
        data
    })
    const results = response.data.results
    // # TODO - Limit Courses returned to around 500
    return array.uniqBy(results,'code').map(result => new Course(result.code,term))
}


class Course {
    // # TODO - Implement get Course API
    constructor(code,termCode){
        this.code = code
        this.term = termCode
    }
    async init() {
        if (this.initialized) return;
        const rawData = await this.getCourseDetails(this.code,this.term)

        this.title = rawData.title
        this.sectionSize = rawData.groupSize
        
        const {description,prerequisites} = this.formatDescription(rawData.description)
        this.description = description
        this.prerequisites = prerequisites

        this.meetingTimes = this.formatHTML(rawData.meeting_html)
        this.instructor = this.formatInstructor(rawData.instructordetail_html) || "~~None~~"
        this.distributional = this.formatDistributional(rawData.yc_attrs) || ["~~None~~"]
        this.finalExam = rawData.final_exam
        this.hours = rawData.hours
        // TODO Fix Additional Info Formatting
        this.additionalInfo = this.formatAdditionalInfo(rawData.ci_attrs)
        this.lastUpdated = rawData.last_updated

        this.sections = rawData.allInGroup.map(section =>{
            return {
                'no':section.no,
                'crn':section.crn,
                'instructor':section.instr,
                'meetingTime':section.meets
            }
        })


        this.initialized = true

    }
    async getCourseDetails(code,term) {
        const params = {page:'fose',route:'details'}
        const response = await api.get('/',{
            params,
            data:{
                "group":`code:${code}`,
                "srcdb":term
            }
        })
        return response.data
    }
    formatHTML(text){
        return text.replace(/<[^>]*>?/gm, '');
    }
    formatInstructor(text){
        const index = text.indexOf(`<div class="instructor-email">`)
        return (index !== -1) ? text.slice(0,index).replace(/<[^>]*>?/gm, ''):text.replace(/<[^>]*>?/gm, '')
    }
    formatDistributional(text){
        if(!text) return
        const dom = new JSDOM(text).window.document
        const single = dom.querySelector('i')
        return  (single) ? [single.textContent] : Array.from(dom.querySelectorAll('li')).map(node=>node.textContent)
    }
    formatDescription(text){
        const dom = new JSDOM(text).window.document
        let description = dom.querySelector('p')
        description = (description) ? description.textContent : "No description"
        let prerequisites = dom.querySelector('.prerequisites')
        prerequisites = (prerequisites) ? prerequisites.textContent : "None"
        return {description,prerequisites}
    }
    formatAdditionalInfo(text){
        if(!text) return []
        const dom = new JSDOM(text).window.document
        return Array.from(dom.querySelectorAll('a')).map(node=>node.textContent)
    }
}
const test = async() => {
    const test = new Course("CPSC 035")
    await test.init()
    console.log(test.meetingTimes)
    console.log(test.instructor)
}

//test()
module.exports = {fetchCourseList}
module.exports.Course = Course