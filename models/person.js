const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  id: Number,
  name: {
    type: String,
    minLength: 3,
    unique: true
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: function(value) {
        return /^\d{2,3}-\S{2,}$/.test(value) && value.match(/-/g).length === 1
      },
      message: 'The first part of the number must have 2 or 3 numbers followed by \'-\' and enough characters after that'
    }
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)