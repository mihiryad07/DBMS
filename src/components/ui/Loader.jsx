import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from './Card';

export function Loader({ message = "Loading ETL Data..." }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <Loader2 className="w-10 h-10 text-accent animate-spin" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
        <div className="text-destructive font-semibold">Error Loading Data</div>
        <div className="text-sm text-muted-foreground">{error}</div>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm hover:shadow-md transition-all active:scale-95"
          >
            Retry Fetch
          </button>
        )}
      </CardContent>
    </Card>
  );
}
