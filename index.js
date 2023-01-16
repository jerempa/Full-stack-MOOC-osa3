require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')


app.use(express.json())
app.use(cors())
app.use(express.static('build'))

morgan.token('content', function (req) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))


app.get('/', (req, res) => {
  res.send('<h1>Phonebook app</h1>')
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons.map(person => person.toJSON()))
  })
}) //get the people on the db

app.get('/info', (req, res) => {
  const date = new Date()
  Person.find({}).then(persons => {
    res.send(`<p> Phonebook has info for ${persons.length} people </p> <p> ${date} </p>`)
  })
  // show the number of people in the phonebook and date
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id).then(person => {
    if (person) {
      res.json(person)
    } else {
      res.status(404).end()
    }
  })
    .catch(error => next(error)) //show info for one person, if not found return status code 404
})


app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id).then(() => {
    res.status(204).end()
  })
    .catch(error => next(error))
}) //delete a user from the phonebook

app.post('/api/persons', (req, res, next) => {
  const body = req.body
  const user = new Person({
    name: body.name,
    number: body.number
  })
  user.save().then(addedPerson => {
    res.json(addedPerson.toJSON())
  }).catch(error => next(error)) //add the user
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body
  const person = {
    name: body.name,
    number: body.number
  }
  Person.validate(person).then(() => {
    return Person.findByIdAndUpdate(req.params.id, person, { new: true })})
    .then(updatedPerson => {
      res.json(updatedPerson.toJSON())
    })
    .catch(error => next(error)) //change the number of a user
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error) //handle errors
}

app.use(errorHandler)



const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})