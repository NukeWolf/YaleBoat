# YaleBoat

Bot verifies and does course stuff lmao.

## Main Features
* [Invite Manager](util/inviteManager.js) that tracks invite codes and who joins using those codes in a log channel 
* [State Role Select](util/stateManager.js) that allows a user to select what state they're from based on a 2 letter reaction. [Setup commands](commands/setup.js) also included.
* [Yale Courses](courses) [API](apis/YaleCourses.js) integration with discord including [commands](commands/course.js) to search for courses, an interactive menu, and saving courses to a database.
* Verification to insure that Users verify their account and admission status.

## Dependencies

- Discord.JS (API Libary)
- PostgreSQL (Database)
- Sequalize (DB ORM)
- Axios (API fetch)
- JSDOM(HTML parse from Yale API)

