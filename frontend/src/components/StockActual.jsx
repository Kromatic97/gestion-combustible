import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';

const StockActual = forwardRef((props, ref) => {
  const [litros, setLitros] = useState(null);

  const cargarStock = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/stock');
      setLitros(res.data.litroactual);
    } catch (error) {
      console.error('Error al obtener stock actual:', error);
    }
  };

  useImperativeHandle(ref, () => ({
    cargarStock
  }));

  useEffect(() => {
    cargarStock();
  }, []);

  return (
    <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: litros <= 1500 ? '#ffcccc' : '#e6ffe6', borderRadius: '8px' }}>
      <h3>Stock Actual: {litros !== null ? `${litros} litros` : 'Cargando...'}</h3>
      {litros !== null && litros <= 1500 && (
        <p style={{ color: 'red', fontWeight: 'bold' }}>⚠️ ¡Stock bajo! Solicitar recarga.</p>
      )}
    </div>
  );
});

export default StockActual;

