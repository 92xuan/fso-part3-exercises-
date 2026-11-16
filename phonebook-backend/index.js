require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require ('./models/person')
const helmet = require('helmet')

const app = express()

app.use(express.json())
app.use(morgan('tiny'))
app.use(cors())
app.use(express.static('dist'))
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "connect-src": ["'self'", "http://localhost:3001", "ws://localhost:3001"],
    },
  })
);


morgan.token('body', (req) => {
    return JSON.stringify(req.body);
});
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

app.get('/', (request, response) => {
  response.send('<h1>Welcome to the Phonebook API</h1>')
})

app.get('/api/persons', async (request, response, next) => {
  try {
    const persons = await Person.find({})
    response.json(persons)
  } catch (error) {
    next(error) // Passes the error to error-handling middleware
  }
})

app.get('/api/info', (request, response) => {
  Person.countDocuments({})
    .then(count => {
      const time = new Date()
      response.send(`
        <div>Phonebook has info for ${count} people </div>
        <div>${time}</div>
      `)
    })
    .catch(error => {
      console.log(error)
      response.status(500).end
    })
})

app.get('/api/persons/id/:id', (request, response) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).send({error: 'person does not exist'}).end() // ID format is valid but person doesn't exist
      }
    })
    .catch(error => {
      console.log(error)
      response.status(400).send({ error: 'malformatted id' }) // ID format is invalid
    })
})

app.get('/api/persons/name/:name', (request, response) => {
  Person.findOne({ name: request.params.name })
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).send({error: 'person does not exist'}).end()
      }
    })
    .catch(error => {
      console.log(error)
      response.status(500).end()
    })
})

app.post('/api/persons', (request, response) =>{
    const body = request.body

    if (!body.name) {
        return response.status(400).send('Please include a contact name.').end()
    } else if (!body.number) {
        return response.status(400).send('Please include a phone number').end()
    } else {
        const person = new Person ({
          name: body.name, 
          number: body.number
        })
        person.save().then(addedPerson => {
          response.json(addedPerson)
        })
    }
})

// app.put('/api/persons')

app.delete('/api/persons/id/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).send(`Contact deleted successfully`).end()
    })
    .catch(error => next(error))
})

const PORT = process.env.PORT
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === "CastError") {
    return response.status(400).send({error: 'malformatted ID'})
  }

  next(error)
}

app.use(errorHandler)