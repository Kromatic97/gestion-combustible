import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ChoferForm() {
  const [nombre, setNombre] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/choferes', { nombre });
      setMensaje('✅ Chofer registrado correctamente');
      setNombre('');

      // Redirigir luego de un breve delay
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('Error registrando chofer:', error);
      setMensaje('❌ Error al registrar el chofer');
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 mt-8 rounded-xl shadow space-y-4">
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-800">Registrar Chofer</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Nombre del Chofer:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="bg-green-900 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Registrar Chofer
        </button>

        {mensaje && <p className="mt-2 font-medium text-green-700">{mensaje}</p>}
      </form>
    </div>
  );
}

export default ChoferForm;


