const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'gestion_combustible',
  password: 'root',
  port: 5432,
});

app.use(cors());
app.use(bodyParser.json());

/* ============================
   1. Registrar abastecimiento
=============================== */
app.post('/api/abastecimientos', async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      Fecha,
      VehiculoID,
      KilometrajeActual,
      CantLitros,
      LugarID,
      ChoferID
    } = req.body;

    const fechaHora = new Date(); // Usar fecha y hora actuales
    const litros = Number(CantLitros);
    const kilometraje = Number(KilometrajeActual);
    if (isNaN(litros) || isNaN(kilometraje)) {
      return res.status(400).json({ error: 'Datos numéricos inválidos' });
    }

    await client.query('BEGIN');

    const resultAbast = await client.query(
      `INSERT INTO Abastecimiento (Fecha, VehiculoID, KilometrajeActual, Cant_Litros, LugarID, ChoferID)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING AbastecimientoID`,
      [fechaHora, VehiculoID, kilometraje, litros, LugarID, ChoferID]
    );

    const abastecimientoID = resultAbast.rows[0].abastecimientoid;

    const resultStock = await client.query(
      `SELECT LitroActual FROM StockCombustible ORDER BY FechaTransaccion DESC LIMIT 1`
    );

    const litroActualRaw = resultStock.rows[0]?.litroactual ?? 10000;
    const litroActual = Number(litroActualRaw);
    const nuevoStock = isNaN(litroActual) ? 10000 - litros : litroActual - litros;

    const resultNewStock = await client.query(
      `INSERT INTO StockCombustible (FechaTransaccion, LitroActual)
       VALUES ($1, $2) RETURNING StockCombustibleID`,
      [fechaHora, nuevoStock]
    );

    const nuevoStockID = resultNewStock.rows[0].stockcombustibleid;

    await client.query(
      `INSERT INTO Abastecimiento_StockCombustible (AbastecimientoID, StockCombustibleID, FechaTransaccion)
       VALUES ($1, $2, $3)`,
      [abastecimientoID, nuevoStockID, fechaHora]
    );

    await client.query('COMMIT');

    res.json({
      mensaje: 'Abastecimiento registrado correctamente',
      abastecimientoID,
      nuevoStock,
      alarma: nuevoStock <= 1500
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al registrar abastecimiento:', error);
    res.status(500).json({ error: 'Error al registrar abastecimiento' });
  } finally {
    client.release();
  }
});

/* ============================
   2. Registrar una Recarga
=============================== */
app.post('/api/recarga-stock', async (req, res) => {
  try {
    const { CantLitros, ChoferID } = req.body;
    const fechaActual = new Date();

    if (!CantLitros || !ChoferID) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Insertar en RecargaStock
    await pool.query(`
      INSERT INTO RecargaStock (Fecha, CantLitros, ChoferID)
      VALUES ($1, $2, $3)
    `, [fechaActual, CantLitros, ChoferID]);

    // Obtener stock actual
    const result = await pool.query(`
      SELECT LitroActual FROM StockCombustible
      ORDER BY FechaTransaccion DESC LIMIT 1
    `);

    const stockActual = result.rowCount > 0 ? Number(result.rows[0].litroactual) : 0;

    // Calcular nuevo stock
    const nuevoStock = stockActual + Number(CantLitros);

    // Insertar nuevo stock
    await pool.query(`
      INSERT INTO StockCombustible (FechaTransaccion, LitroActual)
      VALUES ($1, $2)
    `, [fechaActual, nuevoStock]);

    res.json({ mensaje: '✅ Recarga realizada correctamente', nuevoStock });
  } catch (error) {
    console.error('Error al registrar recarga:', error);
    res.status(500).json({ error: 'Error al registrar recarga de stock' });
  }
});


/* ============================
   3. Obtener Stock Actual
=============================== */
app.get('/api/stock', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT LitroActual
      FROM StockCombustible
      ORDER BY FechaTransaccion DESC
      LIMIT 1
    `);
    const litroRaw = result.rows[0]?.litroactual ?? 0;
    const litroActual = isNaN(Number(litroRaw)) ? 0 : Number(litroRaw);

    res.json({ litroactual: litroActual });
  } catch (err) {
    console.error('Error al obtener stock:', err);
    res.status(500).json({ error: 'Error al obtener stock' });
  }
});

/* ============================
   4. Obtener datos auxiliares
=============================== */
app.get('/api/vehiculos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT VehiculoID, Denominacion, KilometrajeOdometro AS KilometrajeOdometro
      FROM Vehiculo
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener vehículos' });
  }
});

app.get('/api/choferes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ChoferID, Nombre AS NombreChofer
      FROM Chofer
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener choferes' });
  }
});

app.get('/api/lugares', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT LugarID, NombreLugar
      FROM Lugar
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lugares' });
  }
});

/* ============================
   5. Registrar chofer y vehículo
=============================== */
app.post('/api/choferes', async (req, res) => {
  try {
    const { nombre } = req.body;
    await pool.query('INSERT INTO Chofer (Nombre) VALUES ($1)', [nombre]);
    res.status(201).json({ mensaje: 'Chofer registrado correctamente' });
  } catch (error) {
    console.error('Error al registrar chofer:', error);
    res.status(500).json({ error: 'Error al registrar chofer' });
  }
});

app.post('/api/vehiculos', async (req, res) => {
  try {
    console.log('📦 Datos recibidos para registrar vehículo:', req.body);
    const { denominacion, kilometraje, marcaid, modeloid, tipovehiculoid } = req.body;
    
    await pool.query(
      `INSERT INTO Vehiculo (Denominacion, KilometrajeOdometro, MarcaID, ModeloID, TipoVehiculoID)
       VALUES ($1, $2, $3, $4, $5)`,
      [denominacion, kilometraje, marcaid, modeloid, tipovehiculoid]
    );
    res.status(201).json({ mensaje: 'Vehículo registrado correctamente' });
  } catch (error) {
    console.error('❌ Error al registrar vehículo:', error);
    res.status(500).json({ error: 'Error al registrar vehículo' });
  }
});


/* ============================
   6. Datos auxiliares para vehículos
=============================== */
app.get('/api/marcas', async (req, res) => {
  try {
    const result = await pool.query('SELECT MarcaID, Descripcion FROM Marca');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener marcas' });
  }
});

app.get('/api/modelos', async (req, res) => {
  try {
    const result = await pool.query('SELECT ModeloID, NombreModelo FROM Modelo');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener modelos' });
  }
});

app.get('/api/tiposvehiculo', async (req, res) => {
  try {
    const result = await pool.query('SELECT TipoVehiculoID, TipoVehiculo AS NombreTipo FROM TipoVehiculo');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tipos de vehículo' });
  }
});

/* ============================
   7. Abastecimientos recientes
=============================== */
app.get('/api/abastecimientos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.AbastecimientoID,
        a.Fecha,
        v.Denominacion AS Vehiculo,
        a.KilometrajeActual,
        a.Cant_Litros,
        l.NombreLugar AS Lugar,
        c.Nombre AS Chofer
      FROM Abastecimiento a
      JOIN Vehiculo v ON a.VehiculoID = v.VehiculoID
      JOIN Lugar l ON a.LugarID = l.LugarID
      JOIN Chofer c ON a.ChoferID = c.ChoferID
      ORDER BY a.Fecha DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener abastecimientos:', error);
    res.status(500).json({ error: 'Error al obtener abastecimientos' });
  }
});

/* ============================
   8. Obtener Historial de Cargas
=============================== */
app.get('/api/recargas', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.recargaid AS RecargaStockID,
        r.fecha AS Fecha,
        r.cantlitros AS Litros,
        c.nombre AS Chofer
      FROM recargastock r
      JOIN chofer c ON r.choferid = c.choferid
      ORDER BY r.fecha DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener historial de recargas:', error);
    res.status(500).json({ error: 'Error al obtener historial de recargas' });
  }
});

/* =========================================
   10. Obtener Historial de Saldos de Cargas
========================================== */
app.get('/api/historial-stock', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        Fecha AS fechatransaccion,
        'Recarga' AS tipo,
        '' AS vehiculo,
        0 AS kilometraje,
        c.Nombre AS chofer,
        r.CantLitros AS litrosentrada,
        0 AS litrossalida
      FROM RecargaStock r
      JOIN Chofer c ON r.ChoferID = c.ChoferID

      UNION ALL

      SELECT 
        a.Fecha AS fechatransaccion,
        'Abastecimiento' AS tipo,
        v.Denominacion AS vehiculo,
        a.KilometrajeActual AS kilometraje,
        c.Nombre AS chofer,
        0 AS litrosentrada,
        a.Cant_Litros AS litrossalida
      FROM Abastecimiento a
      JOIN Vehiculo v ON a.VehiculoID = v.VehiculoID
      JOIN Chofer c ON a.ChoferID = c.ChoferID

      ORDER BY fechatransaccion
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener historial de stock:', error);
    res.status(500).json({ error: 'Error al obtener historial de stock' });
  }
});

/* ============================
   12.  Obtener abastecimientos por rango de fechas
=============================== */

app.get('/api/abastecimientos-rango', async (req, res) => {
  const { desde, hasta } = req.query;

  if (!desde || !hasta) {
    return res.status(400).json({ error: 'Debe proporcionar fechas "desde" y "hasta"' });
  }

  try {
    const result = await pool.query(`
      SELECT 
        a.AbastecimientoID,
        a.Fecha,
        v.Denominacion AS Vehiculo,
        a.KilometrajeActual,
        a.Cant_Litros,
        l.NombreLugar AS Lugar,
        c.Nombre AS Chofer
      FROM Abastecimiento a
      JOIN Vehiculo v ON a.VehiculoID = v.VehiculoID
      JOIN Lugar l ON a.LugarID = l.LugarID
      JOIN Chofer c ON a.ChoferID = c.ChoferID
      WHERE a.Fecha BETWEEN $1 AND ($2::date + interval '1 day' - interval '1 second')
      ORDER BY a.Fecha
    `, [desde, hasta]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener abastecimientos por rango:', error);
    res.status(500).json({ error: 'Error al obtener abastecimientos por rango' });
  }
});






/* ============================
   12. Iniciar servidor
=============================== */
app.listen(3000, () => {
  console.log('✅ Servidor corriendo en http://localhost:3000');
});



