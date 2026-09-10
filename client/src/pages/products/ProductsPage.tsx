import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Pencil, Trash2, Copy, MoreVertical } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { Button } from '../../components/design-system/Button';
import { Badge } from '../../components/design-system/Badge';
import { Table, THead, TBody, TH, TD } from '../../components/design-system/Table';
import { Skeleton } from '../../components/design-system/Skeleton';
import { EmptyState } from '../../components/design-system/EmptyState';
import { Modal } from '../../components/design-system/Modal';
import { useDebounce } from '../../hooks/useDebounce';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../lib/utils';

export const ProductsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    preparationTime: 15,
    imageUrl: '',
  });
  const debouncedSearch = useDebounce(search, 300);
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', debouncedSearch, categoryFilter],
    queryFn: () => apiRequest('GET', `/products?search=${debouncedSearch}&categoryId=${categoryFilter}`),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiRequest('GET', '/products/categories/list'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created');
      setShowModal(false);
      setProductForm({ name: '', description: '', price: '', categoryId: '', preparationTime: 15, imageUrl: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted');
    },
  });

  const handleSubmit = async () => {
    if (!productForm.name || !productForm.price || !productForm.categoryId) {
      toast.error('Please fill required fields');
      return;
    }
    createMutation.mutate({
      ...productForm,
      price: Number(productForm.price),
      preparationTime: Number(productForm.preparationTime),
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your menu items</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm w-full"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm"
        >
          <option value="">All Categories</option>
          {categories?.data?.map((cat: any) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : products?.data?.length === 0 ? (
          <EmptyState
            title="No products yet"
            description="Start building your menu by adding your first product."
            actionLabel="Add Product"
            onAction={() => setShowModal(true)}
          />
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>Product</TH>
                <TH>Category</TH>
                <TH>Price</TH>
                <TH>Status</TH>
                <TH>Updated</TH>
                <TH className="text-right">Actions</TH>
              </tr>
            </THead>
            <TBody>
              {products?.data?.map((product: any) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <TD>
                    <div className="flex items-center gap-3">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Pencil className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-slate-400">{product.description?.slice(0, 40)}</p>
                      </div>
                    </div>
                  </TD>
                  <TD>{product.category?.name}</TD>
                  <TD className="font-semibold">{formatCurrency(Number(product.price))}</TD>
                  <TD>
                    <Badge variant={product.status === 'ACTIVE' ? 'success' : product.status === 'OUT_OF_STOCK' ? 'danger' : 'default'}>
                      {product.status}
                    </Badge>
                  </TD>
                  <TD>{new Date(product.updatedAt).toLocaleDateString()}</TD>
                  <TD className="text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg">
                        <Copy className="w-4 h-4 text-slate-400" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(product.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TD>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </div>

      {/* Add Product Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Product" size="lg">
        <div className="space-y-4">
          <div>
            <label className="label">Product Name *</label>
            <input
              className="input-field"
              value={productForm.name}
              onChange={e => setProductForm({...productForm, name: e.target.value})}
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input-field"
              rows={3}
              value={productForm.description}
              onChange={e => setProductForm({...productForm, description: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Price (₦) *</label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={productForm.price}
                onChange={e => setProductForm({...productForm, price: e.target.value})}
              />
            </div>
            <div>
              <label className="label">Preparation Time (mins)</label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={productForm.preparationTime}
                onChange={e => setProductForm({...productForm, preparationTime: Number(e.target.value)})}
              />
            </div>
          </div>
          <div>
            <label className="label">Category *</label>
            <select
              className="select-field"
              value={productForm.categoryId}
              onChange={e => setProductForm({...productForm, categoryId: e.target.value})}
            >
              <option value="">Select category</option>
              {categories?.data?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Image URL</label>
            <input
              type="url"
              className="input-field"
              value={productForm.imageUrl}
              onChange={e => setProductForm({...productForm, imageUrl: e.target.value})}
              placeholder="https://..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSubmit} loading={createMutation.isPending}>Create Product</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};