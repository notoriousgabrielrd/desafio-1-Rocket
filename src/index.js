const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors()); // é uma forma de compartilhar recursos entre diferentes origens. Disponibiliza nos headers do HTTP para verificar se tal recurso pode ou não ser acessado.
app.use(express.json());

const users = []; // meu "banco de dados"

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find((element) => element.username === username)

  if (!user) response.status(404).json({ type: "Error", message: "User not found." })

  return next()
}



app.post('/users', (request, response) => {

  const { name, username } = request.body

  const userAlreadyExists = users.some((element) => element.username === username)

  if (userAlreadyExists) return response.status(400).json({ type: "Error", message: "This username is already registered." })

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  })

  return response.status(201).send(users)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  const { username } = request.headers

  const user = users.filter((element) => element.username === username)

  return response.json({ type: "Success", message: user[0] })
});

app.post('/todos', checksExistsUserAccount, (request, response) => {

  //  OBS para data: salvar deadline como ANO-MES-DIA -> new Date('ANO-MES-DIA')

  const { username } = request.headers
  const { title, deadline } = request.body
  const user = users.filter((elem) => elem.username === username)

  const newList = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user[0].todos.push(newList)

  return response.status(201).json({
    type: "Succes", message: user
  })
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params // id da tarefa
  const { username } = request.headers
  let tarefa;
  const { title, deadline } = request.body

  let user = users.filter((elem) => elem.username === username) // encontra o usuário

  if (user) {
    tarefa = user[0].todos.filter(elem => elem.id === id)
  }

  tarefa[0] = {
    id,
    created_at: tarefa[0].created_at,
    done: tarefa[0].done,
    title,
    deadline
  }
  user[0].todos = tarefa

  console.log(user)

  return response.status(201).json({
    type: "Succes", message: user
  })

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  let tarefa;

  const { id } = request.params // id da tarefa
  const { username } = request.headers

  let user = users.filter((elem) => elem.username === username) // encontra o usuário

  if (user) {
    tarefa = user[0].todos.filter(elem => elem.id === id)
  }

  tarefa[0] = {
    ...tarefa[0], done: true
  }

  user[0].todos = tarefa

  return response.status(200).json(user)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {

  let tarefa;

  const { id } = request.params // id da tarefa
  const { username } = request.headers

  let user = users.filter((elem) => elem.username === username) // encontra o usuário

  if (user) {
    rowIndex = user[0].todos.findIndex(row => row.id === id)
    console.log(user)

    if (rowIndex > -1) {
      user[0].todos.splice(rowIndex, 1)
    }
  }

  return response.status(200).json(user)

});

module.exports = app;