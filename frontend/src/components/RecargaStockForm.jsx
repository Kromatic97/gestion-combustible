import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RecargaStockForm = () => {
  const [formulario, setFormulario] = useState({
    Fecha: '',
    CantLitros: '',
    ChoferID: ''
  });
  const [choferes, setChoferes] = useState([]);
  const [mensaje, setMensaje] = useState(false);
  const navigate = useNavigate();

  const cargarChoferes = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/choferes');
      const data = await res.json();
      setChoferes(data);
    } catch (error) {
      console.error('Error al cargar choferes:', error);
    }
  };

  useEffect(() => {
    cargarChoferes();
  }, []);

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirmar = window.confirm('¿Está seguro de registrar esta recarga de stock?');
    if (!confirmar) return;

    try {
      const res = await fetch('http://localhost:3000/api/recarga-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario)
      });

      if (res.ok) {
        setMensaje(true);
        setFormulario({ Fecha: '', CantLitros: '', ChoferID: '' });

        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        alert('Error al registrar la recarga');
      }
    } catch (error) {
      console.error('Error al registrar recarga:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-lg font-bold mb-4">Registrar Recarga de Stock</h2>

      <label className="block mb-2">Fecha:</label>
      <input type="datetime-local" name="Fecha" value={formulario.Fecha} onChange={handleChange} className="w-full mb-4 border p-2 rounded" required />

      <label className="block mb-2">Cantidad de Litros:</label>
      <input type="number" name="CantLitros" value={formulario.CantLitros} onChange={handleChange} className="w-full mb-4 border p-2 rounded" required />

      <label className="block mb-2">Chofer:</label>
      <select name="ChoferID" value={formulario.ChoferID} onChange={handleChange} className="w-full mb-4 border p-2 rounded" required>
        <option value="">Seleccionar chofer</option>
        {choferes.map(c => (
          <option key={c.choferid} value={c.choferid}>{c.nombrechofer}</option>
        ))}
      </select>

      <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded">
        Registrar Recarga
      </button>

      {mensaje && (
        <div className="mt-4 text-green-600 flex items-center">
          <input type="checkbox" checked readOnly className="mr-2" />
          Recarga registrada correctamente
        </div>
      )}
    </form>
  );
};

export default RecargaStockForm;

