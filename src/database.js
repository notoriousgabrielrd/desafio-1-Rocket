// persistindo os dados na aplicação

// const fs = require('node:fs/promises')
// const path = require('path')
import fs from 'node:fs/promises'

// const meta = import.meta.url

// garante que o caminho é o da raiz.
// const databasePath = new URL('../db.json', meta)
const databasePath = new URL('../db.json', import.meta.url)

class Database {

    #database = {}

    constructor() {
        fs.readFile(databasePath, 'utf-8').then(data => {
            this.#database = JSON.parse(data)
            // this.#persist()
        }).catch(() => {
            this.#persist()
        })
    }

    #persist() {
        // console.log(this.#database)
        fs.writeFile(databasePath, JSON.stringify(this.#database))
    }


    select(table, search) {
        let data = this.#database[table] ?? []

        if (search.username) {
            data = data.filter(row => {
                // console.log('object entrie>> ', Object.entries(search))
                return Object.entries(search).some(([key, value]) => {
                    // console.log('key> ', key)
                    // console.log('value> ', value)
                    return row[key].includes(value)
                })
            })
        }
        // console.log('data>> ', data)
        return data
    }

    insert(table, data) {

        if (Array.isArray(this.#database[table])) {
            this.#database[table].push(data)
        } else {
            this.#database[table] = [data]
        }
        this.#persist()

        return data
    }

    delete(table, id) {
        const rowIndex = this.#database[table].findIndex(row => row.id === id)

        if (rowIndex > -1) {
            this.#database[table].splice(rowIndex, 1)  // [[],[],[],[X]]
            this.#persist()
        }
    }

    deleteTodo(table, userId, todoId) {
        const rowIndex = this.#database[table].findIndex(row => row.id === userId) // acha o index do user

        if (rowIndex > -1) {
            const rowTodoIndex = this.#database[table][rowIndex]['todos'].findIndex(row => row.id === todoId)
            if (rowTodoIndex > -1) {
                this.#database[table][rowIndex]['todos'].splice(rowTodoIndex, 1)
            }
            this.#persist()
        }
    }

    update(table, id, data) {
        const rowIndexToUpdate = this.#database[table].findIndex(row => row.id === id)

        if (rowIndexToUpdate > -1) {
            this.#database[table][rowIndexToUpdate] = { id, ...data }// [[],[],[],[]]
            this.#persist()
        }
    }
}

// module.exports = Database
export default Database