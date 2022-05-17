const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];


function checksExistsUserAccount(request, response, next) {
    const { username } = request.headers;

    const user = users.find((user) => user.username === username);

    if (!user) {
        return response.status(404).json({error: 'User not found'})
    };
    request.user = user;
    return next()    
}


app.post('/users', (request, response) => {
    const { name, username } = request.body;

    const userExists = users.some((user) => user.username === username);

    if (userExists) {
        return response.status(400).json({error: 'User already registered'})
    };

    const user = {
        id: uuidv4(),
        name,
        username,
        todos: []
    }

    users.push(user);

    return response.status(201).json(user)

});


app.get('/todos', checksExistsUserAccount, (request, response) => {
    const user = request.user

    return response.json(user.todos)
});


app.post('/todos', checksExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body;
    const user = request.user;

    const new_todo = { 
        id: uuidv4(),
        title,
        done: false, 
        deadline: new Date(deadline), 
        created_at: new Date()
    }

    user.todos.push(new_todo)

    return response.status(201).json(new_todo)

});


app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body;
    const { id: todo_id } = request.params
    const user = request.user;

    const target_todo = user.todos.find((todo) => todo.id === todo_id)

    if (!target_todo) {
        return response.status(404).json({ error: 'Invalid todo' })
    }

    target_todo.title = title
    target_todo.deadline = deadline

    return response.json(target_todo)
});


app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
    const { id: todo_id } = request.params
    const user = request.user;

    const target_todo = user.todos.find((todo) => todo.id === todo_id)

    if (!target_todo) {
        return response.status(404).json({ error: 'Invalid todo' })
    }

    target_todo.done = true

    return response.json(target_todo)
});


app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { id: todo_id } = request.params
    const user = request.user;

    const target_todo = user.todos.find((todo) => todo.id === todo_id)
    if (!target_todo) {
        return response.status(404).json({ error: 'Invalid todo' })
    }
    user.todos.splice(target_todo, 1)
    return response.status(204).send()

});


module.exports = app;