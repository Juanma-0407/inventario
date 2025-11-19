import express from "express";
import categoriasRoutes from "./routes/categorias.routes.js";
import tablesRoutes from "./routes/tables.routes.js";
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()

app.set("port", 5000)

app.use(cors());
app.use(express.json());

// Serve frontend static files under /frontend
app.use('/frontend', express.static(path.join(__dirname, '..', 'frontend')));

app.use("/api/categorias", categoriasRoutes)
app.use("/api/tables", tablesRoutes)

export default app;