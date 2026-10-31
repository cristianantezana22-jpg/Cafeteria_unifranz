import React, { useEffect, useState } from 'react';

interface Usuario {
  id: number;
  nombreCompleto?: string;
  nombre?: string;
  email: string;
  rol: string;
}

export default function AdminPanel() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('http://localhost:8080/api/admin/usuarios')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsuarios(data);
        } else {
          setUsuarios([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar usuarios:", err);
        setUsuarios([]);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      try {
        await fetch(`http://localhost:8080/api/admin/usuarios/${id}`, {
          method: 'DELETE',
        });
        setUsuarios(usuarios.filter((u) => u.id !== id));
      } catch (err) {
        console.error("Error al eliminar:", err);
      }
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Panel de Usuarios del Sistema</h2>
        <span className="bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full">
          Total: {usuarios.length} usuarios
        </span>
      </div>
      
      {loading ? (
        <p className="text-gray-600">Cargando datos del sistema...</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuarios.length > 0 ? (
                usuarios.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.nombreCompleto || user.nombre || 'Sin nombre'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.rol === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'}`}>
                        {user.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    No hay usuarios registrados en la base de datos o hubo un error de conexión con el backend.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}