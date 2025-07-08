import React from 'react';

function TablaAbastecimientos({ registros }) {
  return (
    <div style={{ marginTop: '30px' }}>
      <h2>Registros de Abastecimientos</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Vehículo</th>
            <th>Kilometraje</th>
            <th>Litros</th>
            <th>Lugar</th>
            <th>Chofer</th>
          </tr>
        </thead>
        <tbody>
          {registros.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>No hay registros de abastecimiento</td>
            </tr>
          ) : (
            registros.map((registro) => (
              <tr key={registro.abastecimientoid}>
                <td>{new Date(registro.fecha).toLocaleString()}</td>
                <td>{registro.vehiculo}</td>
                <td>{registro.kilometrajeactual}</td>
                <td>{registro.cant_litros}</td>
                <td>{registro.lugar}</td>
                <td>{registro.chofer}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TablaAbastecimientos;


