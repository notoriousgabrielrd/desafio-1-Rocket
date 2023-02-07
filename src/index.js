// const express = require('express');
import express from 'express'
import cors from 'cors'
// const cors = require('cors');

// const database = require('./database.js')
import Database from './database.js';
import { v4 as uuidv4 } from 'uuid'
import { checksExistsUserAccount, checksCreateTodosUserAvailability, checkTodoExists } from './middlewares/middlewares.js';
// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors()); // é uma forma de compartilhar recursos entre diferentes origens. Disponibiliza nos headers do HTTP para verificar se tal recurso pode ou não ser acessado.
app.use(express.json());

// const users = []; // meu "banco de dados"
const database = new Database

// function checksExistsUserAccount(request, response, next) {
//   const { username } = request.headers


//   const user = database.select('users', { username })

//   if (user.length <= 0) return response.status(404).json({ type: "Error", message: "User not found." })

//   return next()
// }


app.post('/users', (request, response) => {


  if (!request.body.plan) {
    request.body.plan = "Free"
  }
  const { name, username, plan } = request.body

  const userAlreadyExists = database.select('users', { username })

  if (userAlreadyExists.length > 0) return response.status(400).json({ type: "Error", message: "This username is already registered." })

  const data = {
    id: uuidv4(),
    name,
    username,
    plan,
    todos: []
  }

  database.insert('users', data)

  return response.status(201).send(data)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  const { username } = request.headers

  const user = database.select('users', { username })

  return response.json({ message: user[0] })
});

app.post('/todos', checksExistsUserAccount, checksCreateTodosUserAvailability, (request, response) => {

  //  OBS para data: salvar deadline como ANO-MES-DIA -> new Date('ANO-MES-DIA')

  const { username } = request.headers
  const { title, deadline } = request.body
  const user = database.select('users', { username })

  const newList = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user[0].todos.push(newList)
  database.update('users', user[0].id, user[0])

  return response.status(201).json({
    type: "Succes", message: user
  })
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params // id da tarefa
  const { username } = request.headers
  let tarefa;
  const { title, deadline } = request.body

  let user = database.select('users', { username }) // encontra o usuário

  if (user.length > 0) {
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
  database.update('users', user[0].id, user[0])

  return response.status(201).json({
    type: "Succes", message: user
  })

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  let tarefa;

  const { id } = request.params // id da tarefa
  const { username } = request.headers

  let user = database.select('users', { username }) // encontra o usuário

  if (user.length > 0) {
    tarefa = user[0].todos.filter(elem => elem.id === id)
  }

  tarefa[0] = {
    ...tarefa[0], done: true
  }

  user[0].todos = tarefa
  database.update('users', user[0].id, user[0])

  return response.status(200).json(user)
});

app.delete('/user/:id', checksExistsUserAccount, (request, response) => {


  const { id } = request.params // id da tarefa
  const { username } = request.headers

  let user = database.select('users', { username }) // encontra o usuário


  database.delete('users', user[0].id)


  return response.status(200).json(user)

});

app.delete('/todos/:userId', checksExistsUserAccount, checkTodoExists, (request, response) => {

  const { todoId } = request.query

  const { userId } = request.params // id da tarefa
  const { username } = request.headers

  let user = database.select('users', { username }) // encontra o usuário

  database.deleteTodo('users', userId, todoId)

  return response.status(200).json(user)

});

export default app