import Deslinde from '../models/Deslinde.model.js';
import sanitizeHtml from 'sanitize-html';
import moment from 'moment-timezone';

// Crear un nuevo deslinde
export const createDeslinde = async (req, res) => {
    try {
        let { title, content, effectiveDate } = req.body;

        const forbiddenTags = [
            "b", "i", "u", "h1", "h2", "h3", "h4", "h5", "h6", 
            "center", "hr", "p", "br", "pre", "sub", "img", 
            "script", "iframe", "embed", "object", "link", "style"
        ];
        
        // Expresión regular para detectar las etiquetas prohibidas en el contenido
        const tagRegex = new RegExp(`</?(${forbiddenTags.join("|")})\\b[^>]*>`, "i");

        // Validar si el título o el contenido contienen etiquetas prohibidas
        if (tagRegex.test(title) || tagRegex.test(content)) {
            return res.status(400).json({
                message: "El uso de etiquetas HTML. no está permitido.",
            });
        }

        // Sanitizar los campos (remover cualquier etiqueta restante)
        title = sanitizeHtml(title, {
            allowedTags: [],
            allowedAttributes: {},
        });

        content = sanitizeHtml(content, {
            allowedTags: [],
            allowedAttributes: {},
        });

        // Validar campos requeridos
        if (!title || !content || !effectiveDate) {
            return res.status(400).json({
                message: "Todos los campos son requeridos, revise su solicitud.",
            });
        }

        // Verificar si la fecha recibida es válida
        if (!moment(effectiveDate, moment.ISO_8601, true).isValid()) {
            return res.status(400).json({
                message: "La fecha de vigencia es inválida.",
            });
        }

        // Usar la zona horaria de Ciudad de México
        const mexicoTime = moment.tz("America/Mexico_City");

        // Validar la fecha de vigencia en la zona horaria de Ciudad de México
        const effectiveDateObj = moment.tz(effectiveDate, "America/Mexico_City").startOf('day'); // Usamos `startOf('day')` para asegurarnos de que sea solo la fecha sin la hora
        const currentDateObj = mexicoTime.startOf('day'); // Fecha de hoy en la zona horaria de México

        // Verificar que la fecha de vigencia no sea anterior a hoy
        if (effectiveDateObj.isBefore(currentDateObj)) {
            return res.status(400).json({
                message: "La fecha de vigencia no puede ser anterior a la fecha actual.",
            });
        }

        // Crear el deslinde con la fecha ingresada
        const newDeslinde = new Deslinde({
            title,
            content,
            effectiveDate: effectiveDateObj.toDate(),
            isCurrent: false,
        });

        await newDeslinde.save();

        return res.status(201).json({
            message: "Deslinde creado exitosamente",
            deslinde: newDeslinde,
        });
    } catch (error) {
        console.error("Error al crear el deslinde:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Obtener el deslinde actual
export const getCurrentDeslinde = async (req, res) => {
    try {
        const currentDeslinde = await Deslinde.findOne({ isCurrent: true });

        if (!currentDeslinde) {
            return res.status(404).json({ message: "No se encontró un deslinde actual" });
        }

        res.status(200).json(currentDeslinde);
    } catch (error) {
        console.error("Error al obtener el deslinde actual:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Obtener todos los deslindes
export const getAllDeslindes = async (req, res) => {
    try {
        const deslindes = await Deslinde.find().sort({ createdAt: -1 });
        res.status(200).json(deslindes);
    } catch (error) {
        console.error("Error al obtener todos los deslindes:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Actualizar un deslinde existente
export const updateDeslinde = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, effectiveDate } = req.body;

        // Validar si el deslinde existe
        const deslindeExists = await Deslinde.findById(id);
        if (!deslindeExists) {
            return res.status(404).json({ message: "No se encontró el deslinde a actualizar" });
        }

        const updatedDeslinde = await Deslinde.findByIdAndUpdate(
            id,
            { title, content, effectiveDate },
            { new: true }
        );

        res.status(200).json({
            message: "Deslinde actualizado exitosamente",
            deslinde: updatedDeslinde,
        });
    } catch (error) {
        console.error("Error al actualizar el deslinde:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Eliminar un deslinde
export const deleteDeslinde = async (req, res) => {
    try {
        const { id } = req.params;

        const deslindeToDelete = await Deslinde.findById(id);
        if (!deslindeToDelete) {
            return res.status(404).json({ message: "Deslinde no encontrado." });
        }

        await Deslinde.findByIdAndDelete(id);

        if (deslindeToDelete.isCurrent) {
            const latestDeslinde = await Deslinde.findOne().sort({ createdAt: -1 });
            if (latestDeslinde) {
                latestDeslinde.isCurrent = true;
                await latestDeslinde.save();
                return res.status(200).json({
                    message: "Deslinde eliminado y el más reciente establecido como actual.",
                    latestDeslinde,
                });
            }
        }

        res.status(200).json({ message: "Deslinde eliminado exitosamente." });
    } catch (error) {
        console.error("Error al eliminar el deslinde:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

// Establecer un deslinde como el actual
export const setAsCurrentDeslinde = async (req, res) => {
    try {
        const { id } = req.params;

        await Deslinde.updateMany({ isCurrent: true }, { isCurrent: false });

        const currentDeslinde = await Deslinde.findByIdAndUpdate(
            id,
            { isCurrent: true },
            { new: true }
        );

        if (!currentDeslinde) {
            return res.status(404).json({ message: "No se encontró el deslinde a establecer como actual" });
        }

        res.status(200).json({ message: "Deslinde marcado como actual exitosamente", deslinde: currentDeslinde });
    } catch (error) {
        console.error("Error al establecer el deslinde como actual:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};
