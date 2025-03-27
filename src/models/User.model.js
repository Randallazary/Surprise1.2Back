import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  lastname: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  telefono: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return /^\d{10}$/.test(value);  // Valida que el teléfono tenga 10 dígitos
      },
      message: 'El teléfono debe tener exactamente 10 dígitos'
    }
  },
  user: { type: String, required: true, trim: true },
  preguntaSecreta: { type: String, required: true },
  respuestaSecreta: { type: String, required: true },
  password: { type: String, required: true },  
  verified: { type: Boolean, default: false },  
  role: { 
    type: String, 
    default: 'normal', 
    enum: ['normal', 'admin']  
  },
  failedLoginAttempts: { type: Number, default: 0 },  
  lockedUntil: { type: Date, default: null },  
  blocked: { type: Boolean, default: false },  
  lockCount: { type: Number, default: 0 }, 
  lastLogin: { type: Date, default: null }, 
  loginHistory: [{ type: Date }], 
}, {
  timestamps: true,  // Habilita createdAt y updatedAt automáticamente
  versionKey: false  // Elimina el campo __v de Mongoose
});

const User = model('User', userSchema);

export default User;
