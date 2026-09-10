import React from 'react';
import { cn } from '../../lib/utils';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className }) => (
  <div className={cn('overflow-x-auto', className)}>
    <table className="min-w-full divide-y divide-slate-200">
      {children}
    </table>
  </div>
);

export const THead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead className="bg-slate-50">
    {children}
  </thead>
);

export const TBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody className="divide-y divide-slate-100 bg-white">
    {children}
  </tbody>
);

export const TH: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => (
  <th className={cn('px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider', className)}>
    {children}
  </th>
);

export const TD: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => (
  <td className={cn('px-4 py-3 text-sm text-slate-700', className)}>
    {children}
  </td>
);