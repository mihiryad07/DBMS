import React, { useState, useRef, useEffect } from 'react';
import { useFetchData } from '../hooks/useFetchData';
import { fetchParts, addPart, deletePart } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Loader, ErrorState } from '../components/ui/Loader';
import { Modal } from '../components/ui/Modal';
import { Search, Settings, Tag, Plus, Trash2, Filter } from 'lucide-react';

const Parts = () => {
  const { data, loading, error, refetch } = useFetchData(fetchParts);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    part_no: '',
    description: '',
    type: 'Part',
    price: '',
    stock: ''
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

  const filteredParts = data?.filter(part => {
    const matchesSearch = part.part_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         part.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || part.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPart = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10)
      };
      await addPart(payload);
      setIsModalOpen(false);
      setFormData({ part_no: '', description: '', type: 'Part', price: '', stock: '' });
      refetch();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePart = async (part_no) => {
    if (window.confirm(`Are you sure you want to delete part ${part_no}?`)) {
      try {
        await deletePart(part_no);
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
          <h2 className="text-2xl font-bold tracking-tight">Parts & Assemblies</h2>
          <p className="text-muted-foreground mt-1 text-sm">View component catalog and configurations.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              placeholder="Search part no..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-64 transition-shadow"
            />
          </div>
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg text-sm hover:bg-accent transition-colors ${
                typeFilter !== 'All' ? 'ring-2 ring-primary/50' : ''
              }`}
            >
              <Filter size={16} />
              <span>{typeFilter}</span>
            </button>
            {isFilterOpen && (
              <div className="absolute top-full mt-1 right-0 bg-card border border-border rounded-lg shadow-lg z-10 min-w-32">
                {['All', 'Part', 'Assembly'].map((type) => {
                  const count = type === 'All' 
                    ? data?.length || 0 
                    : data?.filter(part => part.type === type).length || 0;
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        setTypeFilter(type);
                        setIsFilterOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center justify-between"
                    >
                      <span>{type}</span>
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
            <span>Add Part</span>
          </button>
        </div>
      </div>

      {loading ? (
        <Loader message="Loading catalog data..." />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Catalog Items ({filteredParts?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part Number</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParts && filteredParts.length > 0 ? filteredParts.map((part) => (
                  <TableRow key={part.part_no}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {part.type === 'Assembly' ? (
                          <Settings size={16} className="text-purple-500" />
                        ) : (
                          <Tag size={16} className="text-blue-500" />
                        )}
                        {part.part_no}
                      </div>
                    </TableCell>
                    <TableCell>{part.description}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        part.type === 'Assembly' 
                          ? 'border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800' 
                          : 'border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800'
                      }`}>
                        {part.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      ${part.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {part.stock}
                    </TableCell>
                    <TableCell className="text-right">
                      <button 
                        onClick={() => handleDeletePart(part.part_no)}
                        className="p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                        title="Delete Part"
                      >
                        <Trash2 size={16} />
                      </button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No matching parts found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Part Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title="Add New Part"
      >
        <form onSubmit={handleAddPart} className="space-y-4">
          {formError && (
            <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm">
              {formError}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Part Number</label>
              <input 
                required 
                name="part_no" 
                value={formData.part_no} 
                onChange={handleInputChange} 
                placeholder="e.g. P-005"
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="Part">Part</option>
                <option value="Assembly">Assembly</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <input 
              required 
              name="description" 
              value={formData.description} 
              onChange={handleInputChange}
              placeholder="e.g. Laser Sensor"
              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Unit Price ($)</label>
              <input 
                required 
                type="number"
                step="0.01"
                min="0"
                name="price" 
                value={formData.price} 
                onChange={handleInputChange}
                placeholder="0.00"
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Initial Stock</label>
              <input 
                required 
                type="number"
                min="0"
                name="stock" 
                value={formData.stock} 
                onChange={handleInputChange}
                placeholder="e.g. 100"
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

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
              {isSubmitting ? 'Saving...' : 'Save Part'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Parts;
