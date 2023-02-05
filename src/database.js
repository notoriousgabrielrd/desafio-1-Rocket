// persistindo os dados na aplicação

import fs from 'node:fs/promises'
// garante que o caminho é o da raiz.
const databasePath = new URL('../db.json', import.meta.url)

export class Database {

    #database = {}

    constructor() {
        fs.readfile(databasePath, 'utf-8').then(data => {
            this.#database = JSON.parse(data)
        }).catch(() => {
            this.#persist()
        })
    }

    #persist() {
        fs.writeFile(databasePath, JSON.stringify(this.#database))
    }


    select(table, search) {
        let data = this.#database[table] ?? []

        if (search.username) {
            data = data.filter(row => {
                console.log('object entrie>> ', Object.entries(search))
                return Object.entries(search).some(([key, value]) => {
                    console.log('key> ', key)
                    console.log('value> ', value)
                    return row[key].includes(value)
                })
            })
        }

        return data
    }

    insert(table, data) {

        if (Array.isArray(this.#database[table])) {
            this.#database[table].push(data)
        } else {
            return this.#database[table] = [data]
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

    update(table, id, data) {
        const rowIndexToUpdate = this.#database[table].findIndex(row => row.id === id)

        if (rowIndexToUpdate > -1) {
            this.#database[table][rowIndexToUpdate] = { id, ...data }// [[],[],[],[]]
            this.#persist()
        }
    }
}