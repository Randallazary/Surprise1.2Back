import moment from 'moment-timezone';
import sanitizeHtml from 'sanitize-html';
import Terms from '../models/Terminos.model.js';

export const createTerms = async (req, res) => {
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
                message: "La fecha de vigencia no puede ser anterior a hoy.",
            });
        }

        // Crear el documento con la fecha ingresada
        const newTerms = new Terms({
            title,
            content,
            effectiveDate: effectiveDateObj.toDate(), // Convertimos el momento a un objeto Date
            isCurrent: false,
        });

        await newTerms.save();

        return res.status(201).json({
            message: "Términos creados exitosamente",
            terms: newTerms,
        });
    } catch (error) {
        console.error("Error al crear términos y condiciones:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};




// Obtener los términos actuales
export const getCurrentTerms = async (req, res) => {
    try {
        const currentTerms = await Terms.findOne({ isCurrent: true });

        if (!currentTerms) {
            return res.status(404).json({ message: "No se encontraron términos actuales" });
        }

        res.status(200).json(currentTerms);
    } catch (error) {
        console.error("Error al obtener los términos actuales:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Obtener todos los términos
export const getAllTerms = async (req, res) => {
    try {
        const terms = await Terms.find().sort({ createdAt: -1 });
        res.status(200).json(terms);
    } catch (error) {
        console.error("Error al obtener todos los términos:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Actualizar términos
export const updateTerms = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, effectiveDate } = req.body;

        // Validar si el término existe
        const termExists = await Terms.findById(id);
        if (!termExists) {
            return res.status(404).json({ message: "No se encontraron términos para actualizar" });
        }

        const updatedTerms = await Terms.findByIdAndUpdate(
            id,
            { title, content, effectiveDate },
            { new: true }
        );

        res.status(200).json({ message: "Términos actualizados exitosamente", terms: updatedTerms });
    } catch (error) {
        console.error("Error al actualizar términos:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Eliminar términos
export const deleteTerms = async (req, res) => {
    try {
        const { id } = req.params;

        const termsToDelete = await Terms.findById(id);
        if (!termsToDelete) {
            return res.status(404).json({ message: "Términos no encontrados." });
        }

        await Terms.findByIdAndDelete(id);

        if (termsToDelete.isCurrent) {
            const latestTerms = await Terms.findOne().sort({ createdAt: -1 });
            if (latestTerms) {
                latestTerms.isCurrent = true;
                await latestTerms.save();
                return res.status(200).json({
                    message: "Términos eliminados y el más reciente establecido como actual.",
                    latestTerms,
                });
            }
        }

        res.status(200).json({ message: "Términos eliminados exitosamente." });
    } catch (error) {
        console.error("Error al eliminar términos:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Establecer términos como actuales
export const setAsCurrentTerms = async (req, res) => {
    try {
        const { id } = req.params;

        await Terms.updateMany({ isCurrent: true }, { isCurrent: false });

        const currentTerms = await Terms.findByIdAndUpdate(
            id,
            { isCurrent: true },
            { new: true }
        );

        if (!currentTerms) {
            return res.status(404).json({ message: "No se encontraron términos para establecer como actuales" });
        }

        res.status(200).json({ message: "Términos establecidos como actuales exitosamente", terms: currentTerms });
    } catch (error) {
        console.error("Error al establecer términos como actuales:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};
