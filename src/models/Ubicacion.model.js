import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const ubicacionSchema = new Schema(
  {
    direccion: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Correo electrónico inválido"],
    },
    telefono: {
      type: String,
      required: true,
      trim: true,
    },
    mapaUrl: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Ubicacion = models.Ubicacion || model("Ubicacion", ubicacionSchema);

export default Ubicacion;
