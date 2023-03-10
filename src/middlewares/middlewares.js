import Database from "../database.js"

const database = new Database()

// Checa se o usuário existe.
export function checksExistsUserAccount(request, response, next) {
    const { username } = request.headers

    const user = database.select('users', { username })
    // console.log('user>>> ', user)
    if (user.length <= 0) return response.status(404).json({ type: "Error", message: "User not found." })

    return next()
}

// Checa o plano do user e se ele pode criar mais TODOS
export function checksCreateTodosUserAvailability(request, response, next) {

    const { username } = request.headers

    const user = database.select('users', { username })
    console.log(user[0].todos.length, user[0].plan)
    if (user[0].plan === "Free" && user[0].todos.length >= 10) {
        return response.status(403).json({ type: "Error", message: "Your todos limit is full." })
    }

    next()

}

// Checa se o UUID é padrão e se o Todo existe
export function checkTodoExists(request, response, next) {
    const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
    const { username } = request.headers
    const { todoId } = request.query

    const result = regexExp.test(todoId);

    // const user = database.select('users', { username })
    // const isUserTodo = user[0]['todos'].some(row => row.id === todoId)

    const isUserTodo = database.select('users', { username })[0]['todos'].some(row => row.id === todoId)

    if (!result || !isUserTodo) {
        return response.status(400).json({ type: "Error", message: "Invalid UUID." })
    }

    next()
}

