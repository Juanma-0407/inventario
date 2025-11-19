import pool from "../db/index.js";

const pick = (row, variants) => {
    for (const v of variants) {
        if (v in row) return row[v];
    }
    return null;
};

const mapRowToCategoria = (row) => ({
    CategoriaID: pick(row, ['CategoriaID','categoriaID','categoria_id','categoriaId','id','ID','Id']),
    CategoriaNombre: pick(row, ['CategoriaNombre','categoriaNombre','categoria_nombre','categoria','Categoria','nombre','Nombre','name','Name']),
    "Descripción": pick(row, ['Descripción','descripcion','Descripción','Descripcion','descrip','detalle','detalles']),
    Imagen: pick(row, ['Imagen','imagen','imagen_url','image','Image','url_imagen','foto','foto_url'])
});

const getCategorias = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categorias');
        const result = rows.map(mapRowToCategoria);
        return res.json(result);
    } catch (err) {
        console.error('DB error getCategorias:', err);
        return res.status(500).json({ error: 'Error al obtener categorías' });
    }
}

export const methodHTTP = {
    getCategorias
}