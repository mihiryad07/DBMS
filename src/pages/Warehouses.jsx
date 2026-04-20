import React, { useState, useRef, useEffect } from 'react';
import { useFetchData } from '../hooks/useFetchData';
import { fetchWarehouses, fetchBins, addWarehouse, deleteWarehouse, fetchEmployees } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Loader, ErrorState } from '../components/ui/Loader';
import { MapPin, User, Package, Plus, Trash2, X, Filter } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

const Warehouses = () => {
  const { data: warehouses, loading: loadingW, error: errorW, refetch: refetchW } = useFetchData(fetchWarehouses);
  const { data: bins, loading: loadingB, error: errorB, refetch: refetchB } = useFetchData(fetchBins);
  const { data: employees } = useFetchData(fetchEmployees);
  const { addNotification } = useNotifications();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newWarehouse, setNewWarehouse] = useState({ id: '', location: '', manager: '' });
  const [deletingWarehouse, setDeletingWarehouse] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [locationFilter, setLocationFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loading = loadingW || loadingB;
  const error = errorW || errorB;

  const filteredWarehouses = warehouses?.filter(warehouse => 
    locationFilter === 'All' || warehouse.location === locationFilter
  );

  const uniqueLocations = [...new Set(warehouses?.map(w => w.location) || [])].sort();

  const retry = () => {
    refetchW();
    refetchB();
  };

  const handleAddWarehouse = async (e) => {
    e.preventDefault();
    if (!newWarehouse.id || !newWarehouse.location || !newWarehouse.manager) {
      alert('Please fill in all fields');
      return;
    }

    setOperationLoading(true);
    try {
      await addWarehouse(newWarehouse);
      addNotification({
        title: 'Warehouse Added',
        message: `Warehouse ${newWarehouse.id} in ${newWarehouse.location} has been added successfully`,
        type: 'success'
      });
      setNewWarehouse({ id: '', location: '', manager: '' });
      setShowAddForm(false);
      refetchW();
    } catch (error) {
      alert('Failed to add warehouse: ' + error.message);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteWarehouse = async (warehouseId) => {
    if (!confirm('Are you sure you want to delete this warehouse? This action cannot be undone.')) {
      return;
    }

    setDeletingWarehouse(warehouseId);
    try {
      await deleteWarehouse(warehouseId);
      addNotification({
        title: 'Warehouse Deleted',
        message: `Warehouse ${warehouseId} has been deleted successfully`,
        type: 'info'
      });
      refetchW();
      refetchB(); // Refresh bins as they might be affected
    } catch (error) {
      alert('Failed to delete warehouse: ' + error.message);
    } finally {
      setDeletingWarehouse(null);
    }
  };

  const managerOptions = employees?.filter(emp => emp.type === 'Manager') || [];

  if (loading) return <Loader message="Extracting Warehouses and Bins..." />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Warehouses & Bins</h2>
          <p className="text-muted-foreground mt-1 text-sm">Monitor storage capacities across all distinct locations.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg text-sm hover:bg-accent transition-colors ${
                locationFilter !== 'All' ? 'ring-2 ring-primary/50' : ''
              }`}
            >
              <Filter size={16} />
              <span>{locationFilter}</span>
            </button>
            {isFilterOpen && (
              <div className="absolute top-full mt-1 right-0 bg-card border border-border rounded-lg shadow-lg z-10 min-w-40">
                <button
                  onClick={() => {
                    setLocationFilter('All');
                    setIsFilterOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center justify-between"
                >
                  <span>All Locations</span>
                  <span className="text-muted-foreground text-xs">({warehouses?.length || 0})</span>
                </button>
                {uniqueLocations.map((location) => {
                  const count = warehouses?.filter(w => w.location === location).length || 0;
                  return (
                    <button
                      key={location}
                      onClick={() => {
                        setLocationFilter(location);
                        setIsFilterOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center justify-between"
                    >
                      <span>{location}</span>
                      <span className="text-muted-foreground text-xs">({count})</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus size={16} />
            <span>Add Warehouse</span>
          </button>
        </div>
      </div>

      {/* Add Warehouse Form */}
      {showAddForm && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Add New Warehouse
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1 hover:bg-secondary rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddWarehouse} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Warehouse ID</label>
                  <input
                    type="text"
                    value={newWarehouse.id}
                    onChange={(e) => setNewWarehouse({...newWarehouse, id: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="WH08"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={newWarehouse.location}
                    onChange={(e) => setNewWarehouse({...newWarehouse, location: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Seattle"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Manager</label>
                  <select
                    value={newWarehouse.manager}
                    onChange={(e) => setNewWarehouse({...newWarehouse, manager: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  >
                    <option value="">Select Manager</option>
                    {managerOptions.map(manager => (
                      <option key={manager.employee_no} value={manager.name}>
                        {manager.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={operationLoading}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {operationLoading ? 'Adding...' : 'Add Warehouse'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {filteredWarehouses?.map(warehouse => {
          const warehouseBins = bins?.filter(b => b.warehouse === warehouse.id) || [];
          
          return (
            <Card key={warehouse.id} className="overflow-hidden border-border/60 shadow-md hover:shadow-lg transition-all group">
              <div className="bg-muted/30 border-b border-border p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 text-primary p-3 rounded-xl group-hover:scale-105 transition-transform">
                    <Package size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{warehouse.id}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1.5"><MapPin size={14} /> {warehouse.location}</span>
                      <span className="flex items-center gap-1.5"><User size={14} /> Mgr: {warehouse.manager}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-background rounded-lg border border-border text-sm font-semibold whitespace-nowrap shadow-sm">
                    {warehouseBins.length} Active Bins
                  </div>
                  <button
                    onClick={() => handleDeleteWarehouse(warehouse.id)}
                    disabled={deletingWarehouse === warehouse.id}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete Warehouse"
                  >
                    {deletingWarehouse === warehouse.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-destructive border-t-transparent" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
              
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-transparent hover:bg-transparent">
                      <TableHead className="w-1/4 pl-6">Bin ID</TableHead>
                      <TableHead className="w-1/4">Configuration</TableHead>
                      <TableHead className="w-1/4">Status</TableHead>
                      <TableHead className="w-1/4 pr-6">Capacity Utilization</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {warehouseBins.length > 0 ? warehouseBins.map(bin => {
                      const percent = ((bin.capacity - bin.remaining) / bin.capacity) * 100;
                      return (
                        <TableRow key={bin.bin_id}>
                          <TableCell className="pl-6 font-medium">{bin.bin_id}</TableCell>
                          <TableCell>
                            <span className="text-muted-foreground text-sm">Standard</span>
                          </TableCell>
                          <TableCell>
                            {bin.remaining === 0 ? (
                              <span className="text-xs font-semibold text-destructive px-2 py-1 bg-destructive/10 rounded-full">Full</span>
                            ) : bin.remaining < 20 ? (
                              <span className="text-xs font-semibold text-orange-500 px-2 py-1 bg-orange-500/10 rounded-full">Low Free Space</span>
                            ) : (
                              <span className="text-xs font-semibold text-green-500 px-2 py-1 bg-green-500/10 rounded-full">Available</span>
                            )}
                          </TableCell>
                          <TableCell className="pr-6">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${percent >= 100 ? 'bg-destructive' : percent > 80 ? 'bg-orange-500' : 'bg-primary'}`} 
                                  style={{ width: `${percent}%` }} 
                                />
                              </div>
                              <span className="text-xs font-medium w-24 text-right">
                                {bin.capacity - bin.remaining} / {bin.capacity}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    }) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                          No bins currently assigned.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Warehouses;
