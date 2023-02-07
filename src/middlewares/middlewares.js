import Database from "../database.js"

const database = new Database()

export function checksExistsUserAccount(request, response, next) {
    const { username } = request.headers

    const user = database.select('users', { username })
    console.log('user>>> ', user)
    if (user.length <= 0) return response.status(404).json({ type: "Error", message: "User not found." })

    return next()
}

export function checksCreateTodosUserAvailability(request, response, next) {

    const { username } = request.headers

    const user = database.select('users', { username })
    console.log(user[0].todos.length, user[0].plan)
    if (user[0].plan === "Free" && user[0].todos.length >= 10) {
        return response.status(403).json({ type: "Error", message: "Your todos limit is full." })
    }

    next()

}

export function checkTodoExists(request, response, next) {

    const { username } = request.headers
    const { todoId } = request.query
    /*
    TODO:
    [] - validate UUID with regex from node-no-libs
    [] - middleware findByUser
    */

}
