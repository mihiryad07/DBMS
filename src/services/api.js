const API_BASE_URL = 'http://localhost:3001/api';

export const fetchDashboardData = async () => {
  const response = await fetch(`${API_BASE_URL}/dashboard`);
  if (!response.ok) throw new Error('Failed to fetch dashboard data');
  return response.json();
};

export const fetchEmployees = async (type = null) => {
  const url = type ? `${API_BASE_URL}/employees?type=${encodeURIComponent(type)}` : `${API_BASE_URL}/employees`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch employees');
  return response.json();
};

export const addEmployee = async (employeeData) => {
  const response = await fetch(`${API_BASE_URL}/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employeeData)
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to add employee');
  }
  return response.json();
};

export const deleteEmployee = async (employeeId) => {
  const response = await fetch(`${API_BASE_URL}/employees/${employeeId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete employee');
  }
  return response.json();
};

export const fetchWarehouses = async () => {
  const response = await fetch(`${API_BASE_URL}/warehouses`);
  if (!response.ok) throw new Error('Failed to fetch warehouses');
  return response.json();
};

export const addWarehouse = async (warehouseData) => {
  const response = await fetch(`${API_BASE_URL}/warehouses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(warehouseData)
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to add warehouse');
  }
  return response.json();
};

export const deleteWarehouse = async (warehouseId) => {
  const response = await fetch(`${API_BASE_URL}/warehouses/${encodeURIComponent(warehouseId)}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete warehouse');
  }
  return response.json();
};

export const fetchBins = async () => {
  const response = await fetch(`${API_BASE_URL}/bins`);
  if (!response.ok) throw new Error('Failed to fetch bins');
  return response.json();
};

export const fetchParts = async () => {
  const response = await fetch(`${API_BASE_URL}/parts`);
  if (!response.ok) throw new Error('Failed to fetch parts');
  return response.json();
};

export const addPart = async (partData) => {
  const response = await fetch(`${API_BASE_URL}/parts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(partData)
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to add part');
  }
  return response.json();
};

export const deletePart = async (partId) => {
  const response = await fetch(`${API_BASE_URL}/parts/${encodeURIComponent(partId)}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete part');
  }
  return response.json();
};

export const fetchBackorders = async () => {
  const response = await fetch(`${API_BASE_URL}/backorders`);
  if (!response.ok) throw new Error('Failed to fetch backorders');
  return response.json();
};

export const addBackorder = async (backorderData) => {
  const response = await fetch(`${API_BASE_URL}/backorders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(backorderData)
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to add backorder');
  }
  return response.json();
};

export const deleteBackorder = async (orderId) => {
  const response = await fetch(`${API_BASE_URL}/backorders/${encodeURIComponent(orderId)}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete backorder');
  }
  return response.json();
};

export const executeQuery = async (queryId) => {
  const response = await fetch(`${API_BASE_URL}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ queryId }),
  });
  if (!response.ok) throw new Error('Failed to execute query');
  return response.json();
};
