import Terms from '../models/Terminos.model.js';
import sanitizeHtml from 'sanitize-html';

// Crear un nuevo documento de términos y condiciones
export const createTerms = async (req, res) => {
    try {
        let { title, content, effectiveDate } = req.body;

        // Validar si los campos contienen etiquetas prohibidas como <b>, <i>, <u>
        const forbiddenTags = ["b", "i", "u"];
        const tagRegex = new RegExp(`</?(${forbiddenTags.join("|")})\\b[^>]*>`, "i");

        if (tagRegex.test(title) || tagRegex.test(content)) {
            return res.status(400).json({
                message: "El uso de etiquetas HTML como <b>, <i> o <u> no está permitido.",
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

        // Validar la fecha de vigencia
        const effectiveDateObj = new Date(effectiveDate);
        if (isNaN(effectiveDateObj)) {
            return res.status(400).json({
                message: "La fecha de vigencia es inválida.",
            });
        }

        // Obtener la fecha actual como milisegundos (sin horas, minutos, segundos)
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Establece la hora a las 00:00 para comparación sin tener en cuenta las horas
        const currentDateInMillis = currentDate.getTime();

        // Obtener la fecha de vigencia como milisegundos
        effectiveDateObj.setHours(0, 0, 0, 0);
        let effectiveDateInMillis = effectiveDateObj.getTime();

        // Permitir que se pueda poner una fecha un día antes
        // Si la fecha es anterior a la fecha actual, sumamos un día recursivamente hasta que sea válida
        while (effectiveDateInMillis < currentDateInMillis) {
            effectiveDateObj.setDate(effectiveDateObj.getDate() + 2);
            effectiveDateInMillis = effectiveDateObj.getTime();
        }

        // Verificar que la fecha de vigencia no sea anterior a hoy (si fue ajustada)
        if (effectiveDateObj.getTime() < currentDateInMillis) {
            return res.status(400).json({
                message: "La fecha de vigencia no puede ser anterior a hoy.",
            });
        }

        // Crear el documento con la fecha ingresada
        const newTerms = new Terms({
            title,
            content,
            effectiveDate: effectiveDateObj,
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
