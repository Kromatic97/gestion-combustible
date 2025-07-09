import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const VehiculoForm = () => {
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    denominacion: '',
    kilometraje: '',
    marcaid: '',
    modeloid: '',
    tipovehiculoid: ''
  });

  useEffect(() => {
    axios.get('http://localhost:3000/api/marcas')
      .then(res => setMarcas(res.data))
      .catch(err => console.error('Error cargando marcas:', err));

    axios.get('http://localhost:3000/api/modelos')
      .then(res => setModelos(res.data))
      .catch(err => console.error('Error cargando modelos:', err));

    axios.get('http://localhost:3000/api/tiposvehiculo')
      .then(res => setTipos(res.data))
      .catch(err => console.error('Error cargando tipos:', err));
  }, []);

  const handleChange = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/vehiculos', formulario);
      setMensaje('✅ Vehículo registrado correctamente');
      setFormulario({
        denominacion: '',
        kilometraje: '',
        marcaid: '',
        modeloid: '',
        tipovehiculoid: ''
      });
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      console.error('❌ Error registrando vehículo:', error);
      setMensaje('❌ Error al registrar el vehículo');
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 mt-8 rounded-xl shadow space-y-4">
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-800">Registrar Vehículo</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Denominación:</label>
          <input
            type="text"
            name="denominacion"
            value={formulario.denominacion}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block font-semibold">Kilometraje Odómetro:</label>
          <input
            type="number"
            name="kilometraje"
            value={formulario.kilometraje}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block font-semibold">Marca:</label>
          <select
            name="marcaid"
            value={formulario.marcaid}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          >
            <option value="">Seleccionar marca</option>
            {marcas.map(m => (
              <option key={m.marcaid} value={m.marcaid}>
                {m.nombremarca || m.descripcion}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold">Modelo:</label>
          <select
            name="modeloid"
            value={formulario.modeloid}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          >
            <option value="">Seleccionar modelo</option>
            {modelos.map(m => (
              <option key={m.modeloid} value={m.modeloid}>
                {m.nombremodelo}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold">Tipo de Vehículo:</label>
          <select
            name="tipovehiculoid"
            value={formulario.tipovehiculoid}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          >
            <option value="">Seleccionar tipo</option>
            {tipos.map(t => (
              <option key={t.tipovehiculoid} value={t.tipovehiculoid}>
                {t.nombretipo || t.tipovehiculo}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="bg-green-900 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
          Registrar Vehículo
        </button>

        {mensaje && <p className="mt-2 font-medium text-green-700">{mensaje}</p>}
      </form>
    </div>
  );
};

export default VehiculoForm;







