import React, { useState, useRef, useEffect } from 'react';
import { useFetchData } from '../hooks/useFetchData';
import { fetchBackorders, addBackorder, deleteBackorder } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Loader, ErrorState } from '../components/ui/Loader';
import { Modal } from '../components/ui/Modal';
import { Clock, CheckCircle2, Plus, Trash2, Filter } from 'lucide-react';

const Backorders = () => {
  const { data, loading, error, refetch } = useFetchData(fetchBackorders);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const [formData, setFormData] = useState({
    id: '',
    part_no: '',
    manager: '',
    orderDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    fulfilledDate: ''
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredBackorders = data?.filter(backorder => 
    statusFilter === 'All' || backorder.status === statusFilter
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddBackorder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    try {
      await addBackorder(formData);
      setIsModalOpen(false);
      setFormData({ 
        id: '', part_no: '', manager: '', 
        orderDate: new Date().toISOString().split('T')[0], 
        status: 'Active', fulfilledDate: '' 
      });
      refetch();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBackorder = async (id) => {
    if (window.confirm(`Are you sure you want to delete backorder ${id}?`)) {
      try {
        await deleteBackorder(id);
        refetch();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Active Backorders Tracking</h2>
          <p className="text-muted-foreground mt-1 text-sm">Monitor delayed parts fulfillment across all locations.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg text-sm hover:bg-accent transition-colors ${
                statusFilter !== 'All' ? 'ring-2 ring-primary/50' : ''
              }`}
            >
              <Filter size={16} />
              <span>{statusFilter}</span>
            </button>
            {isFilterOpen && (
              <div className="absolute top-full mt-1 right-0 bg-card border border-border rounded-lg shadow-lg z-10 min-w-32">
                {['All', 'Active', 'Completed'].map((status) => {
                  const count = status === 'All' 
                    ? data?.length || 0 
                    : data?.filter(bo => bo.status === status).length || 0;
                  return (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setIsFilterOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center justify-between"
                    >
                      <span>{status}</span>
                      <span className="text-muted-foreground text-xs">({count})</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} />
            <span>Add Backorder</span>
          </button>
        </div>
      </div>

      {loading ? (
        <Loader message="Loading backorder history..." />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Backorder Records ({filteredBackorders?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Part No</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fulfilled</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBackorders && filteredBackorders.length > 0 ? filteredBackorders.map((bo) => (
                  <TableRow key={bo.id}>
                    <TableCell className="font-medium text-primary">{bo.id}</TableCell>
                    <TableCell>{bo.part_no}</TableCell>
                    <TableCell>{bo.manager}</TableCell>
                    <TableCell className="text-muted-foreground">{bo.orderDate}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {bo.status === 'Active' ? (
                          <>
                            <Clock size={16} className="text-orange-500" />
                            <span className="font-medium text-orange-600 dark:text-orange-400">Active</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={16} className="text-green-500" />
                            <span className="font-medium text-green-600 dark:text-green-400">Completed</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {bo.fulfilledDate || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <button 
                        onClick={() => handleDeleteBackorder(bo.id)}
                        className="p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                        title="Delete Backorder"
                      >
                        <Trash2 size={16} />
                      </button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      No backorders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Backorder Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title="Add New Backorder"
      >
        <form onSubmit={handleAddBackorder} className="space-y-4">
          {formError && (
            <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm">
              {formError}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Order ID</label>
              <input 
                required 
                name="id" 
                value={formData.id} 
                onChange={handleInputChange} 
                placeholder="e.g. BO-1005"
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Part Number</label>
              <input 
                required 
                name="part_no" 
                value={formData.part_no} 
                onChange={handleInputChange}
                placeholder="e.g. P-001"
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Manager Name</label>
            <input 
              required 
              name="manager" 
              value={formData.manager} 
              onChange={handleInputChange}
              placeholder="e.g. Tony Smith"
              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Order Date</label>
              <input 
                required 
                type="date"
                name="orderDate" 
                value={formData.orderDate} 
                onChange={handleInputChange}
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {formData.status === 'Completed' && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Fulfilled Date</label>
              <input 
                required 
                type="date"
                name="fulfilledDate" 
                value={formData.fulfilledDate} 
                onChange={handleInputChange}
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          )}

          <div className="pt-4 flex justify-end gap-2">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-4 py-2 font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Backorder'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Backorders;
