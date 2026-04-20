import React, { useState } from 'react';
import { executeQuery } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Loader2, Play, Download, BarChart3, Copy, Check } from 'lucide-react';

const QUERIES = [
  { 
    id: 'q1', 
    label: "Employees under Manager Tony Tona (no middle name)",
    sql: `SELECT employee_no
FROM employees
WHERE type = 'Worker' AND department IN (
    SELECT department FROM employees WHERE name LIKE '%Tony Tona%' AND type = 'Manager'
)`
  },
  { 
    id: 'q2', 
    label: "All employees sorted by last, first, middle",
    sql: `SELECT employee_no, name
FROM employees
ORDER BY name`
  },
  { 
    id: 'q3', 
    label: "Phones of all managers",
    sql: `SELECT employee_no, phone
FROM employees
WHERE type = 'Manager'`
  },
  { 
    id: 'q4', 
    label: "All parts that are assemblies (lexicographic order)",
    sql: `SELECT part_no
FROM parts
WHERE type = 'Assembly'
ORDER BY part_no`
  },
  { 
    id: 'q5', 
    label: "Current backorders (remaining_qty > 0)",
    sql: `SELECT manager, part_no, orderDate as backorder_date, status
FROM backorders
WHERE status = 'Active'`
  },
  { 
    id: 'q6', 
    label: "All backorders (current + old)",
    sql: `SELECT manager, part_no, orderDate as backorder_date,
       CASE 
           WHEN status = 'Active' THEN '2000-01-01'
           ELSE fulfilledDate
       END AS fulfilled_date
FROM backorders`
  },
  { 
    id: 'q7', 
    label: "Remaining capacity of each bin",
    sql: `SELECT bin_id as bin_no, remaining as remaining_capacity
FROM bins`
  },
  { 
    id: 'q8', 
    label: "Managers with smallest team size",
    sql: `SELECT m.name as manager_name, count(w.employee_no) as team_size
FROM employees m
LEFT JOIN employees w ON m.department = w.department AND w.type = 'Worker'
WHERE m.type = 'Manager'
GROUP BY m.employee_no
HAVING team_size = (
    SELECT MIN(team_count)
    FROM (
        SELECT COUNT(w2.employee_no) as team_count
        FROM employees m2
        LEFT JOIN employees w2 ON m2.department = w2.department AND w2.type = 'Worker'
        WHERE m2.type = 'Manager'
        GROUP BY m2.employee_no
    ) AS temp
)`
  },
];

const Queries = () => {
  const [activeQuery, setActiveQuery] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisTab, setAnalysisTab] = useState('data');
  const [copiedQuery, setCopiedQuery] = useState(false);

  const runQuery = async (queryId) => {
    setActiveQuery(queryId);
    setLoading(true);
    setError(null);
    setResult(null);
    setAnalysisTab('data');

    try {
      const data = await executeQuery(queryId);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to execute query.');
    } finally {
      setLoading(false);
    }
  };

  const getQueryObject = () => {
    return QUERIES.find(q => q.id === activeQuery);
  };

  const copyQueryToClipboard = () => {
    const query = getQueryObject();
    if (query) {
      navigator.clipboard.writeText(query.sql);
      setCopiedQuery(true);
      setTimeout(() => setCopiedQuery(false), 2000);
    }
  };

  const exportToCSV = () => {
    if (!result || result.rows.length === 0) return;
    
    const headers = result.columns.join(',');
    const rows = result.rows.map(row => 
      row.map(cell => 
        typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
      ).join(',')
    ).join('\n');
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query-${activeQuery}-${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getAnalysisStats = () => {
    if (!result) return null;
    
    const stats = {
      totalRows: result.rows.length,
      totalColumns: result.columns.length,
      columnStats: {}
    };

    result.columns.forEach((col, idx) => {
      const columnData = result.rows.map(row => row[idx]);
      stats.columnStats[col] = {
        uniqueValues: new Set(columnData).size,
        nullCount: columnData.filter(v => v === null || v === '').length
      };
    });

    return stats;
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Queries</h2>
        <p className="text-muted-foreground mt-1 text-sm">Execute essential report queries directly against the ETL warehouse data.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 flex-1">
        
        {/* Actions Panel */}
        <div className="lg:col-span-1 space-y-4">
          {QUERIES.map(q => (
            <Card 
              key={q.id} 
              className={`cursor-pointer transition-all hover:border-primary/50 ${activeQuery === q.id ? 'border-primary shadow-md ring-1 ring-primary/20' : ''}`}
              onClick={() => runQuery(q.id)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <span className="font-medium text-sm">{q.label}</span>
                <button className={`p-2 rounded-full transition-colors ${activeQuery === q.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-primary/20'}`}>
                  {loading && activeQuery === q.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Play size={16} />
                  )}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Results Panel */}
        <Card className="lg:col-span-2 flex flex-col min-h-[600px]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle>Execution Result</CardTitle>
                {activeQuery && QUERIES.find(q => q.id === activeQuery) && (
                  <p className="text-sm text-muted-foreground mt-1">Showing results for: "{QUERIES.find(q => q.id === activeQuery).label}"</p>
                )}
              </div>
              {result && (
                <div className="flex gap-2">
                  <button
                    onClick={exportToCSV}
                    className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                    title="Export to CSV"
                  >
                    <Download size={16} />
                  </button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
            {loading ? (
              <div className="flex-1 flex items-center justify-center flex-col space-y-3 text-muted-foreground">
                <Loader2 size={32} className="animate-spin text-primary" />
                <p className="animate-pulse text-sm">Executing query on ETL store...</p>
                
                {/* Show Query While Running */}
                {activeQuery && getQueryObject() && (
                  <div className="w-full mt-4 p-3 bg-muted rounded-lg border border-border/50">
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Running Query:</p>
                    <div className="bg-black/50 p-3 rounded font-mono text-xs text-primary/80 overflow-x-auto whitespace-pre-wrap break-words">
                      {getQueryObject().sql}
                    </div>
                  </div>
                )}
              </div>
            ) : error ? (
              <div className="flex-1 flex items-center justify-center text-destructive">
                <p>{error}</p>
              </div>
            ) : result ? (
              <>
                {/* SQL Query Display Section */}
                <div className="p-3 bg-muted rounded-lg border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Executed Query:</p>
                    <button
                      onClick={copyQueryToClipboard}
                      className="p-1 rounded text-xs text-muted-foreground hover:bg-secondary transition-colors flex items-center gap-1"
                    >
                      {copiedQuery ? (
                        <>
                          <Check size={12} className="text-green-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-black/50 p-3 rounded font-mono text-xs text-primary/80 overflow-x-auto whitespace-pre-wrap break-words max-h-24">
                    {getQueryObject()?.sql}
                  </div>
                </div>

                {/* Data Analysis Menu */}
                <div className="border-b border-border flex gap-2">
                  <button
                    onClick={() => setAnalysisTab('data')}
                    className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                      analysisTab === 'data'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Data Results
                  </button>
                  <button
                    onClick={() => setAnalysisTab('analysis')}
                    className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                      analysisTab === 'analysis'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <BarChart3 size={14} />
                    Analysis
                  </button>
                </div>

                {/* Data Results Tab */}
                {analysisTab === 'data' && (
                  <div className="border border-border rounded-lg overflow-hidden flex-1 flex flex-col">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          {result.columns.map((col, i) => (
                            <TableHead key={i}>{col}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.rows.length > 0 ? result.rows.map((row, i) => (
                          <TableRow key={i}>
                            {row.map((cell, j) => (
                              <TableCell key={j} className="font-medium text-muted-foreground">
                                {cell}
                              </TableCell>
                            ))}
                          </TableRow>
                        )) : (
                          <TableRow>
                            <TableCell colSpan={result.columns.length} className="text-center py-6 text-muted-foreground">
                              Query completed successfully. 0 rows returned.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Analysis Tab */}
                {analysisTab === 'analysis' && (
                  <div className="space-y-4 flex-1 overflow-y-auto">
                    {getAnalysisStats() && (
                      <>
                        {/* Summary Statistics */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-muted rounded-lg border border-border">
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Total Rows</p>
                            <p className="text-2xl font-bold text-primary">{getAnalysisStats().totalRows}</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg border border-border">
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Total Columns</p>
                            <p className="text-2xl font-bold text-primary">{getAnalysisStats().totalColumns}</p>
                          </div>
                        </div>

                        {/* Column Details */}
                        <div className="border border-border rounded-lg p-3 bg-muted/20">
                          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase">Column Analytics</p>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {Object.entries(getAnalysisStats().columnStats).map(([colName, stats]) => (
                              <div key={colName} className="text-xs bg-background rounded p-2 border border-border/50">
                                <p className="font-medium text-foreground mb-1">{colName}</p>
                                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                                  <span>Unique: <span className="text-foreground font-semibold">{stats.uniqueValues}</span></span>
                                  <span>Empty: <span className="text-foreground font-semibold">{stats.nullCount}</span></span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground/50 border-2 border-dashed border-border rounded-lg">
                <p className="text-sm">Select a query from the left to execute</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Queries;
