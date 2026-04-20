import React from 'react';

export function Table({ children, className }) {
  return (
    <div className="w-full overflow-auto rounded-lg border border-border shadow-sm">
      <table className={`w-full caption-bottom text-sm ${className || ''}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className }) {
  return <thead className={`[&_tr]:border-b bg-muted/40 border-border/50 ${className || ''}`}>{children}</thead>;
}

export function TableRow({ children, className }) {
  return (
    <tr className={`border-b border-border/50 transition-colors hover:bg-muted/20 data-[state=selected]:bg-primary/5 ${className || ''}`}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className }) {
  return (
    <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className || ''}`}>
      {children}
    </th>
  );
}

export function TableBody({ children, className }) {
  return <tbody className={`[&_tr:last-child]:border-0 ${className || ''}`}>{children}</tbody>;
}

export function TableCell({ children, className }) {
  return (
    <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className || ''}`}>
      {children}
    </td>
  );
}
