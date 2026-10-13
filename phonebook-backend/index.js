const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(morgan('tiny'))
app.use(cors())
app.use(express.static('dist'))

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

morgan.token('body', (req) => {
    return JSON.stringify(req.body);
});
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

const getInfo = () => {
    const length = persons.length
    const time = new Date()
    return `<div>Phonebook has info for ${length} people</div>
            <div>${time}</div>`
}

const generateID = () => {
    const maxId = persons.length > 0
    ? Math.max(...persons.map(n => Number(n.id)))
    : 0
  return String(maxId + 1)
}

app.get('/', (request, response) => {
  response.send('<h1>Welcome to the Phonebook API</h1>')
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/info', (request, response) => {
    response.send(getInfo())
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.post('/api/persons', (request, response) =>{
    const body = request.body
    const personExists = persons.some(person => person.name === body.name)

    if (personExists) {
        response.status(400).send('Person already exists in database').end()
    } else if (!body.name) {
        return response.status(400).send('Please include a contact name.').end()
    } else if (!body.number) {
        return response.status(400).send('Please include a phone number').end()
    } else {
        const person = {
            "id": generateID(),
            "name": body.name, 
            "number": body.number
        }


        persons = persons.concat(person)
        return response.status(200).send(`${body.name} was successfully added`).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
    response.status(204).end
})

const PORT = 3001
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})