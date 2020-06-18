const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
var uuidv4 = require('uuid-random');

const userSchema = new mongoose.Schema({
    password:{
        type: String,
        required: false,
        trim: true,
        minlength: 7
    },
    email:{
        type: String,
        required: false,
        trim : true,
        lowercase: true,
        unique: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email is invalid.")
            }
        }
    }, 
    googleId: {
        type: String,
        required: false,
        unique: true
    },

    userId: {
        type: String,
        required: true,
        unique: true
    }
})

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email: email})

    if(!user){
        throw new Error('Unable to login!')
    }

    const isMatch = await bcrypt.compareSync(password, user.password)

    if(!isMatch){
        throw new Error('Unable to login!')
    }
    
    return user
}

userSchema.statics.googleAuth = async (googleId, callback) => {
    const user = await User.findOne({googleId: googleId});
    if(user) {
        return callback(null, user)
    }
    const userCreated = new User({googleId: googleId, userId: uuidv4()})
    userCreated.save();
    return callback(null, userCreated)
}

// userSchema.pre('save', async function (next) {
//     const user = this
//     if(user.isModified('password')){
//         user.password = await bcrypt.hash(user.password, 10)
//     }
//     next()
// })

const User = mongoose.model('User', userSchema)

module.exports = User