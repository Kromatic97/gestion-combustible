import React, { useEffect, useState } from 'react';
import axios from 'axios';

const HistorialRecargas = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/historial-stock');
        setData(response.data);
      } catch (error) {
        console.error('Error al cargar historial:', error);
      }
    };

    fetchHistorial();
  }, []);

  let stockAcumulado = 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-center mb-6">
        📊 Historial Consolidado de Stock
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Fecha</th>
              <th className="border p-2">Tipo</th>
              <th className="border p-2">Vehículo</th>
              <th className="border p-2">Odómetro</th>
              <th className="border p-2">Chofer</th>
              <th className="border p-2">Entrada (L)</th>
              <th className="border p-2">Salida (L)</th>
              <th className="border p-2">Stock (L)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const entrada = parseFloat(item.litrosentrada) || 0;
              const salida = parseFloat(item.litrossalida) || 0;

              stockAcumulado += entrada - salida;

              return (
                <tr key={index}>
                  <td className="border p-2">
                    {item.fechatransaccion
                      ? new Date(item.fechatransaccion).toLocaleString()
                      : '-'}
                  </td>


                  <td className="border p-2">{item.litrosentrada > 0 ? 'Recarga'
                                             : item.litrossalida > 0
                                             ? 'Abastecimiento'
                                             : '-'}</td>

                  <td className="border p-2">{item.vehiculo || '-'}</td>
                  <td className="border p-2 text-right">
                    {item.kilometraje !== 0 ? item.kilometraje : '-'}
                  </td>
                  <td className="border p-2">{item.chofer || '-'}</td>
                  <td className="border p-2 text-right">
                    {entrada > 0 ? entrada : '-'}
                  </td>
                  <td className="border p-2 text-right">
                    {salida > 0 ? salida : '-'}
                  </td>
                  <td className="border p-2 text-right font-bold">
                    {stockAcumulado.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistorialRecargas;


