import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';

const AbastecimientoForm = forwardRef(({ onAbastecimientoRegistrado }, ref) => {
  const [formulario, setFormulario] = useState({
    Fecha: '',
    VehiculoID: '',
    KilometrajeActual: '',
    CantLitros: '',
    LugarID: '',
    ChoferID: ''
  });

  const [vehiculos, setVehiculos] = useState([]);
  const [choferes, setChoferes] = useState([]);
  const [lugares, setLugares] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [stock, setStock] = useState(0);
  const [abastecimientos, setAbastecimientos] = useState([]);

  useImperativeHandle(ref, () => ({
    cargarVehiculos,
    cargarChoferes
  }));

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    await Promise.all([
      cargarVehiculos(),
      cargarChoferes(),
      cargarLugares(),
      cargarStock(),
      cargarAbastecimientos()
    ]);
  };

  const cargarVehiculos = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/vehiculos');
      setVehiculos(res.data);
    } catch (error) {
      console.error('Error al cargar vehículos', error);
    }
  };

  const cargarChoferes = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/choferes');
      setChoferes(res.data);
    } catch (error) {
      console.error('Error al cargar choferes', error);
    }
  };

  const cargarLugares = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/lugares');
      setLugares(res.data);
    } catch (error) {
      console.error('Error al cargar lugares', error);
    }
  };

  const cargarStock = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/stock');
      setStock(res.data.litroactual);
      console.log('🟢 Stock actualizado a:', res.data.litroactual);
    } catch (error) {
      console.error('Error al cargar stock', error);
    }
  };

  const cargarAbastecimientos = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/abastecimientos');
      setAbastecimientos(res.data);
    } catch (error) {
      console.error('Error al cargar abastecimientos:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));

    if (name === 'VehiculoID') {
      const vehiculo = vehiculos.find(v => v.vehiculoid === parseInt(value));
      if (vehiculo) {
        setFormulario(prev => ({ ...prev, KilometrajeActual: vehiculo.kilometrajeodometro }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/abastecimientos', formulario);

      setMensaje('✅ Abastecimiento registrado correctamente');

      // Limpiar formulario
      setFormulario({
        Fecha: '',
        VehiculoID: '',
        KilometrajeActual: '',
        CantLitros: '',
        LugarID: '',
        ChoferID: ''
      });

      // Recargar datos actualizados
      await cargarStock();
      await cargarAbastecimientos();

      if (onAbastecimientoRegistrado) onAbastecimientoRegistrado();

    } catch (error) {
      console.error('Error al registrar abastecimiento:', error);
      setMensaje('❌ Error al registrar el abastecimiento');
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Registrar Abastecimiento</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>Fecha:</label>
          <input type="date" name="Fecha" value={formulario.Fecha} onChange={handleChange} required className="w-full border p-2 rounded" />
        </div>

        <div>
          <label>Vehículo:</label>
          <select name="VehiculoID" value={formulario.VehiculoID} onChange={handleChange} required className="w-full border p-2 rounded">
            <option value="">Seleccionar vehículo</option>
            {vehiculos.map(v => (
              <option key={v.vehiculoid} value={v.vehiculoid}>{v.denominacion}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Kilometraje Actual:</label>
          <input type="number" name="KilometrajeActual" value={formulario.KilometrajeActual} onChange={handleChange} required className="w-full border p-2 rounded" />
        </div>

        <div>
          <label>Cantidad de Litros:</label>
          <input type="number" name="CantLitros" value={formulario.CantLitros} onChange={handleChange} required className="w-full border p-2 rounded" />
        </div>

        <div>
          <label>Lugar:</label>
          <select name="LugarID" value={formulario.LugarID} onChange={handleChange} required className="w-full border p-2 rounded">
            <option value="">Seleccionar lugar</option>
            {lugares.map(l => (
              <option key={l.lugarid} value={l.lugarid}>{l.nombrelugar}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Chofer:</label>
          <select name="ChoferID" value={formulario.ChoferID} onChange={handleChange} required className="w-full border p-2 rounded">
            <option value="">Seleccionar chofer</option>
            {choferes.map(c => (
              <option key={c.choferid} value={c.choferid}>{c.nombrechofer}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 text-right">
          <button type="submit" className="bg-green-800 text-white px-6 py-2 rounded">Registrar Carga</button>
        </div>
      </form>

      {mensaje && <p className="mt-4 text-green-700 font-medium">{mensaje}</p>}

      <div className="mt-6 p-4 bg-blue-100 rounded">
        <p className="text-lg font-semibold text-green-800">Stock Actual</p>
        <p className="text-2xl font-mono">{stock} litros</p>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Últimos abastecimientos</h3>
        <table className="w-full border text-sm bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Fecha</th>
              <th className="p-2 border">Vehículo</th>
              <th className="p-2 border">Chofer</th>
              <th className="p-2 border">Litros</th>
              <th className="p-2 border">Kilometraje</th>
              <th className="p-2 border">Lugar</th>
            </tr>
          </thead>
          <tbody>
            {abastecimientos.map((a) => (
              <tr key={a.abastecimientoid}>
                <td className="p-2 border">{new Date(a.fecha).toLocaleString()}</td>
                <td className="p-2 border">{a.vehiculo}</td>
                <td className="p-2 border">{a.chofer}</td>
                <td className="p-2 border text-right">{a.cant_litros}</td>
                <td className="p-2 border text-right">{a.kilometrajeactual}</td>
                <td className="p-2 border">{a.lugar}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default AbastecimientoForm;













