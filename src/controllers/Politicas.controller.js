import PrivacyPolicy from '../models/Politicas.model.js';
import sanitizeHtml from 'sanitize-html';

// Crear una nueva política de privacidad
export const createPrivacyPolicy = async (req, res) => {
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

        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        effectiveDateObj.setHours(0, 0, 0, 0);

        if (effectiveDateObj < currentDate) {
            return res.status(400).json({
                message: "La fecha de vigencia no puede ser anterior a la fecha actual.",
            });
        }

        // Crear la política con la fecha ingresada
        const newPolicy = new PrivacyPolicy({
            title,
            content,
            effectiveDate: effectiveDateObj,
            isCurrent: false,
        });

        await newPolicy.save();

        return res.status(201).json({
            message: "Política de privacidad creada exitosamente",
            policy: newPolicy,
        });
    } catch (error) {
        console.error("Error al crear la política de privacidad:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Obtener la política de privacidad actual
export const getCurrentPrivacyPolicy = async (req, res) => {
    try {
        const currentPolicy = await PrivacyPolicy.findOne({ isCurrent: true });

        if (!currentPolicy) {
            return res.status(404).json({ message: "No se encontró una política de privacidad actual" });
        }

        res.status(200).json(currentPolicy);
    } catch (error) {
        console.error("Error al obtener la política de privacidad actual:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Obtener todas las políticas de privacidad
export const getAllPrivacyPolicies = async (req, res) => {
    try {
        const policies = await PrivacyPolicy.find().sort({ createdAt: -1 });
        res.status(200).json(policies);
    } catch (error) {
        console.error("Error al obtener todas las políticas de privacidad:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Actualizar una política de privacidad existente
export const updatePrivacyPolicy = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, effectiveDate } = req.body;

        // Validar si la política existe
        const policyExists = await PrivacyPolicy.findById(id);
        if (!policyExists) {
            return res.status(404).json({ message: "No se encontró la política de privacidad a actualizar" });
        }

        const updatedPolicy = await PrivacyPolicy.findByIdAndUpdate(
            id,
            { title, content, effectiveDate },
            { new: true }
        );

        res.status(200).json({
            message: "Política de privacidad actualizada exitosamente",
            policy: updatedPolicy,
        });
    } catch (error) {
        console.error("Error al actualizar la política de privacidad:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Eliminar una política de privacidad
export const deletePrivacyPolicy = async (req, res) => {
    try {
        const { id } = req.params;

        const policyToDelete = await PrivacyPolicy.findById(id);
        if (!policyToDelete) {
            return res.status(404).json({ message: "Política de privacidad no encontrada." });
        }

        await PrivacyPolicy.findByIdAndDelete(id);

        if (policyToDelete.isCurrent) {
            const latestPolicy = await PrivacyPolicy.findOne().sort({ createdAt: -1 });
            if (latestPolicy) {
                latestPolicy.isCurrent = true;
                await latestPolicy.save();
                return res.status(200).json({
                    message: "Política eliminada y la más reciente establecida como actual.",
                    latestPolicy,
                });
            }
        }

        res.status(200).json({ message: "Política de privacidad eliminada exitosamente." });
    } catch (error) {
        console.error("Error al eliminar la política de privacidad:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

// Establecer una política como la actual
export const setAsCurrentPrivacyPolicy = async (req, res) => {
    try {
        const { id } = req.params;

        await PrivacyPolicy.updateMany({ isCurrent: true }, { isCurrent: false });

        const currentPolicy = await PrivacyPolicy.findByIdAndUpdate(
            id,
            { isCurrent: true },
            { new: true }
        );

        if (!currentPolicy) {
            return res.status(404).json({ message: "No se encontró la política de privacidad a establecer como actual" });
        }

        res.status(200).json({ message: "Política de privacidad marcada como actual exitosamente", policy: currentPolicy });
    } catch (error) {
        console.error("Error al establecer la política de privacidad como actual:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};
