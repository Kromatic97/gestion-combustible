// RecargaStockForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

const RecargaStockForm = ({ abastecimientoFormRef }) => {
  const [formulario, setFormulario] = useState({
    CantLitros: '',
    ChoferID: ''
  });
  const [mensaje, setMensaje] = useState('');
  const [choferes, setChoferes] = useState([]);

  const cargarChoferes = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/choferes');
      setChoferes(res.data);
    } catch (error) {
      console.error('Error al cargar choferes:', error);
    }
  };

  useState(() => {
    cargarChoferes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/recarga-stock', formulario);
      setMensaje('✅ Recarga realizada correctamente');

      // Limpiar formulario
      setFormulario({ CantLitros: '', ChoferID: '' });

      // 🔄 Actualizar el stock desde el componente AbastecimientoForm si está disponible
      if (abastecimientoFormRef?.current?.cargarStock) {
        await abastecimientoFormRef.current.cargarStock();
      }
    } catch (error) {
      console.error('Error al registrar recarga:', error);
      setMensaje('❌ Error al registrar recarga');
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Recargar Stock</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Cantidad de Litros:</label>
          <input
            type="number"
            name="CantLitros"
            value={formulario.CantLitros}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block">Chofer:</label>
          <select
            name="ChoferID"
            value={formulario.ChoferID}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          >
            <option value="">Seleccionar chofer</option>
            {choferes.map(c => (
              <option key={c.choferid} value={c.choferid}>
                {c.nombrechofer}
              </option>
            ))}
          </select>
        </div>

        <div className="text-right">
          <button type="submit" className="bg-purple-800 text-white px-6 py-2 rounded">
            Registrar Recarga
          </button>
        </div>
      </form>

      {mensaje && <p className="mt-4 text-green-700 font-medium">{mensaje}</p>}
    </div>
  );
};

export default RecargaStockForm;


