module.exports.CourseList = {
    "⬅️": (CourseList)=>{
        CourseList.previousPage()
    },
    "➡️": (CourseList)=>{
        CourseList.nextPage()
    },
    "1️⃣": (CourseList) => {
        CourseList.getDetails(0)
    },
    "2️⃣":(CourseList) => {
        CourseList.getDetails(1)
    },
    "3️⃣":(CourseList) => {
        CourseList.getDetails(2)
    },
    "4️⃣":(CourseList) => {
        CourseList.getDetails(3)
    },
    "5️⃣":(CourseList) => {
        CourseList.getDetails(4)
    },
    "6️⃣":(CourseList) => {
        CourseList.getDetails(5)
    },
}

module.exports.DetailedCourse = {
    "◀️":(DetailedCourse) => {
        DetailedCourse.close()
    },
    "💾":(DetailedCourse,user) => {
        DetailedCourse.saveCourse(user)
    },
    "❌":(DetailedCourse,user) =>{
        DetailedCourse.deleteCourse(user)
    }
}