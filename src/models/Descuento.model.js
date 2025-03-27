import mongoose from "mongoose";

const { Schema, model } = mongoose;

const descuentoSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 500,
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  discountedPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  image: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (value) {
        return /^(http:\/\/|https:\/\/|\/).*$/.test(value);
      },
      message: "La imagen debe ser una URL válida o una ruta relativa",
    },
  },
  category: {
    type: String,
    required: true,
    trim: true,
    enum: ["Juguetes", "Peluches", "Accesorios", "Niños", "Otros"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  versionKey: false,
});

const Descuento = model("Descuento", descuentoSchema);

export default Descuento;