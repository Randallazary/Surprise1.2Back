import mongoose from "mongoose";

const { Schema, model } = mongoose


const reviewSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 200,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const productSchema = new Schema(
    {
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
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        image: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: function (value) {
                    return /^(http:\/\/|https:\/\/|\/).*$/.test(value);
                },
                message: 'La imagen debe ser una URL válida o una ruta relativa',
            },
        },
        category: {
            type: String,
            required: true,
            trim: true,
            enum: ['Juguetes', 'Peluches', 'Accesorios', 'Niños', 'Otros'],
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        reviews: [reviewSchema],
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Product = model('Product', productSchema);

export default Product;