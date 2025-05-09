import React, { useState, useEffect } from 'react';
import { useUser } from '../auth/UserContext';
import { useNavigate } from 'react-router-dom';
import NavigationBar from '../reusable/NavigationBar';
import Sidebar from '../reusable/Sidebar';
import TripCard from './TripCard';
import '../reusable/loader.css';

const TripList = () => {
  const { user, setUser } = useUser();
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [minSeats, setMinSeats] = useState('');
  const [route, setRoute] = useState(''); // Cambiado a "route" en lugar de "departurePoint"
  const [isDriver, setIsDriver] = useState(false); // Estado para el modo de usuario
  const [loading, setLoading] = useState(true); // Estado para el loader
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrips = async () => {
      const token = localStorage.getItem('token');
    
      if (!token) {
        navigate('/login');
        return;
      }
    
      setLoading(true); // Mostrar loader al iniciar la solicitud
      const response = await fetch('https://wheels-backend-rafaelsavas-projects.vercel.app/api/trips', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    
      if (response.status === 401 || response.status === 403) {
        navigate('/login');
      } else {
        const data = await response.json();
    
        // Insertar nuevos viajes al principio manualmente
        const updatedTrips = [...data.trips].reverse(); // Si no hay `createdAt`, invertir la lista para simular orden descendente
        setTrips(updatedTrips); // Guardar los viajes actualizados con el más reciente al inicio
        setFilteredTrips(updatedTrips); // Aplicar a los viajes filtrados
      }
      setLoading(false); // Ocultar loader al finalizar la solicitud
    };
    

    fetchTrips();
  }, [navigate]);

  // Redirigir a la página de "Gestionar Viajes" cuando se activa "Modo Conductor"
  useEffect(() => {
    if (isDriver) {
      navigate('/manage-trips');
    }
  }, [isDriver, navigate]);

  // Función para filtrar los viajes según los valores seleccionados
  const filterTrips = () => {
    const filtered = trips.filter(trip => {
      const matchSeats = minSeats === '' || trip.seatsAvailable >= parseInt(minSeats);
      const matchRoute = route === '' || trip.route.toLowerCase().includes(route.toLowerCase()); // Filtrar por rutas
      const hasAvailableSeats = trip.seatsAvailable > 0; // Verificar que haya cupos disponibles
      return matchSeats && matchRoute && hasAvailableSeats;
    });
    setFilteredTrips(filtered);
  };

  // Aplicar los filtros cada vez que cambien los valores
  useEffect(() => {
    filterTrips();
  }, [minSeats, route, trips]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6]">
      {/* NavigationBar que abre el Sidebar */}
      <NavigationBar onMenuClick={() => setSidebarOpen(true)} />

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-3xl font-bold">Viajes disponibles</h2>
          {/* Switch de "Modo Pasajero / Conductor" */}
          <div className="flex items-center">
            <span className="text-white mr-3">Modo Pasajero</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isDriver}
                onChange={() => setIsDriver(!isDriver)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:bg-green-500 relative">
                {/* Círculo del switch */}
                <span
                  className={`absolute left-1 top-1 h-4 w-4 rounded-full transition-transform ${
                    isDriver ? 'bg-white' : 'bg-gray-500'
                  } ${isDriver ? 'transform translate-x-5' : ''}`}
                ></span>
              </div>
              <span className="ml-3 text-sm font-medium text-white">Modo Conductor</span>
            </label>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg mb-6 shadow-lg">
          <h2 className="text-blue-900 text-2xl font-semibold mb-4">Filtros</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Filtro de cupos mínimos */}
            <div>
              <label className="block text-gray-700 mb-2">Cupos mínimos</label>
              <select
                className="w-full p-2 border rounded-lg"
                value={minSeats}
                onChange={e => setMinSeats(e.target.value)}
              >
                <option value="">Selecciona cupos</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>

            {/* Filtro de rutas */}
            <div>
              <label className="block text-gray-700 mb-2">Rutas</label>
              <select
                className="w-full p-2 border rounded-lg"
                value={route}
                onChange={e => setRoute(e.target.value)}
              >
                <option value="">Selecciona una ruta</option>
                <option value="autonorte">Autonorte</option>
                <option value="boyaca">Boyacá</option>
                <option value="suba">Suba</option>
                <option value="novena">Novena</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loader */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loader"></div>
          </div>
        ) : (
          // Listado de viajes
          filteredTrips.length > 0 ? (
            filteredTrips.map((trip) => (
              <TripCard key={trip.tripId} trip={trip} />
            ))
          ) : (
            <div className='flex justify-center'>
              <p className='text-white text-2xl font-bold'>No hay viajes disponibles</p>
            </div>
          )
        )}

        {/* Sidebar */}
        {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} isDriver={false} />}
      </div>
    </div>
  );
};

export default TripList;
