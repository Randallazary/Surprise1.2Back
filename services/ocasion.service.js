import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

class OcasionService {
  constructor() {
    this.pythonPath = 'python'; // Windows
    // this.pythonPath = 'python3'; // Linux/Mac
    this.scriptPath = path.join(__dirname, '../ml_models/classify_occasion.py');
    
    // Verificación inicial
    this.verifyPython();
  }

  async verifyPython() {
    try {
      const { stdout } = await execAsync(`${this.pythonPath} --version`);
      console.log(`Python disponible: ${stdout.trim()}`);
    } catch (error) {
      console.error('❌ Python no está disponible:', error);
      throw new Error('Python no está instalado o no está en el PATH');
    }
  }

  async classifyProduct(productData) {
    try {
      const { name, description = '', category } = productData;
      
      // Validación mejorada
      if (!name || !category) {
        throw new Error('Name and category are required');
      }

      const text = `${name} ${description} ${category}`.toLowerCase().trim();
      
      if (text.length < 5) {
        console.warn('Texto demasiado corto para clasificación');
        return 'Sin categoría';
      }

      // Ejecución con manejo de espacios y caracteres especiales
      const command = `"${this.pythonPath}" "${this.scriptPath}" "${text.replace(/"/g, '\\"')}"`;
      console.log(`Ejecutando: ${command}`);

      const { stdout, stderr } = await execAsync(command, { timeout: 5000 });
      
      if (stderr) {
        console.error('Error en Python:', stderr);
        return 'Sin categoría';
      }

      const result = stdout.trim();
      console.log(`Resultado de clasificación: ${result}`);
      
      return result || 'Sin categoría'; // Fallback explícito

    } catch (error) {
      console.error('❌ Error en classifyProduct:', error.message);
      return 'Sin categoría'; // Siempre devuelve un valor por defecto
    }
  }
}

export const ocasionService = new OcasionService();