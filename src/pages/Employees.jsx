import React, { useState, useRef, useEffect } from 'react';
import { useFetchData } from '../hooks/useFetchData';
import { fetchEmployees, addEmployee, deleteEmployee } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Loader, ErrorState } from '../components/ui/Loader';
import { Modal } from '../components/ui/Modal';
import { Filter, UserPlus, Trash2, ChevronDown } from 'lucide-react';

const Employees = () => {
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const filterRef = useRef(null);
  
  // Form State
  const [formData, setFormData] = useState({
    employee_no: '',
    name: '',
    type: 'Worker',
    department: '',
    phone: ''
  });
  
  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const fetchWrapped = React.useCallback(
    () => fetchEmployees(filter === 'All' ? null : filter),
    [filter]
  );
  
  const { data, loading, error, refetch } = useFetchData(fetchWrapped);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    try {
      await addEmployee(formData);
      setIsModalOpen(false);
      setFormData({ employee_no: '', name: '', type: 'Worker', department: '', phone: '' }); 
      refetch(); 
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (employee_no) => {
    if (window.confirm(`Are you sure you want to delete employee ${employee_no}?`)) {
      try {
        await deleteEmployee(employee_no);
        refetch();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const FilterButton = ({ label }) => (
    <button
      onClick={() => {
        setFilter(label);
        setIsFilterOpen(false);
      }}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
        filter === label 
          ? 'bg-primary text-primary-foreground shadow-md' 
          : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Employee Directory</h2>
          <p className="text-muted-foreground mt-1 text-sm">Manage staff and manager assignments.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 bg-card p-1.5 rounded-lg border border-border shadow-sm hover:bg-muted/40 transition-colors"
              title="Filter employees"
            >
              <Filter size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{filter}</span>
              <ChevronDown size={14} className={`text-muted-foreground transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Filter Dropdown */}
            {isFilterOpen && (
              <div className="absolute top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Filter by Role</div>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setFilter('All');
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        filter === 'All' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-foreground hover:bg-muted/60'
                      }`}
                    >
                      All Employees ({data?.length || 0})
                    </button>
                    <button
                      onClick={() => {
                        setFilter('Manager');
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        filter === 'Manager' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-foreground hover:bg-muted/60'
                      }`}
                    >
                      Managers ({data?.filter(e => e.type === 'Manager').length || 0})
                    </button>
                    <button
                      onClick={() => {
                        setFilter('Worker');
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        filter === 'Worker' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-foreground hover:bg-muted/60'
                      }`}
                    >
                      Workers ({data?.filter(e => e.type === 'Worker').length || 0})
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium shadow hover:bg-primary/90 transition-colors"
          >
            <UserPlus size={18} />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {loading ? (
        <Loader message="Loading employee data..." />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Employees ({data?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? data.map((emp) => (
                  <TableRow key={emp.employee_no}>
                    <TableCell className="font-medium">{emp.employee_no}</TableCell>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        emp.type === 'Manager' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {emp.type}
                      </span>
                    </TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell className="text-muted-foreground">{emp.phone}</TableCell>
                    <TableCell className="text-right">
                      <button 
                        onClick={() => handleDeleteEmployee(emp.employee_no)}
                        className="p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                        title="Delete Employee"
                      >
                        <Trash2 size={16} />
                      </button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No employees found for the selected filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Employee Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title="Add New Employee"
      >
        <form onSubmit={handleAddEmployee} className="space-y-4">
          {formError && (
            <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm">
              {formError}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Employee No.</label>
              <input 
                required 
                name="employee_no" 
                value={formData.employee_no} 
                onChange={handleInputChange} 
                placeholder="e.g. E1006"
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Full Name</label>
              <input 
                required 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange}
                placeholder="e.g. John Doe"
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Role</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="Worker">Worker</option>
                <option value="Manager">Manager</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Department</label>
              <input 
                required 
                name="department" 
                value={formData.department} 
                onChange={handleInputChange}
                placeholder="e.g. Logistics"
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Phone Number</label>
            <input 
              required 
              name="phone" 
              value={formData.phone} 
              onChange={handleInputChange}
              placeholder="e.g. 555-0106"
              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
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
              {isSubmitting ? 'Saving...' : 'Save Employee'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;
