import React from 'react';
import { Search, Filter } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

interface OrderFiltersProps {
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
  onOutletChange: (outletId: string) => void;
  outlets: Array<{ id: string; name: string }>;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  onSearchChange,
  onStatusChange,
  onOutletChange,
  outlets,
}) => {
  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebounce(search, 300);

  React.useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search order number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm w-full focus:outline-none focus:border-[#E85D3D]"
        />
      </div>
      <select
        onChange={e => onStatusChange(e.target.value)}
        className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm"
      >
        <option value="">All Statuses</option>
        <option value="PENDING">Pending</option>
        <option value="ACCEPTED">Accepted</option>
        <option value="PREPARING">Preparing</option>
        <option value="READY">Ready</option>
        <option value="COMPLETED">Completed</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
      <select
        onChange={e => onOutletChange(e.target.value)}
        className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm"
      >
        <option value="">All Outlets</option>
        {outlets.map(outlet => (
          <option key={outlet.id} value={outlet.id}>{outlet.name}</option>
        ))}
      </select>
    </div>
  );
};