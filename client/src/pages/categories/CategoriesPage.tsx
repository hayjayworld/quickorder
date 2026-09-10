import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, FolderTree, Eye, EyeOff, GripVertical } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { Button } from '../../components/design-system/Button';
import { Badge } from '../../components/design-system/Badge';
import { Modal } from '../../components/design-system/Modal';
import { EmptyState } from '../../components/design-system/EmptyState';
import { Skeleton } from '../../components/design-system/Skeleton';
import toast from 'react-hot-toast';

export const CategoriesPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', sortOrder: 0 });
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiRequest('GET', '/products/categories/list'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/products/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created');
      setShowModal(false);
      setCategoryForm({ name: '', description: '', sortOrder: 0 });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest('PATCH', `/products/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated');
      setShowModal(false);
      setEditingCategory(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/products/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiRequest('PATCH', `/products/categories/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated');
    },
  });

  const handleSubmit = () => {
    if (!categoryForm.name) {
      toast.error('Category name is required');
      return;
    }
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: categoryForm });
    } else {
      createMutation.mutate(categoryForm);
    }
  };

  const openEdit = (category: any) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      sortOrder: category.sortOrder,
    });
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500 mt-1">Organize your menu items</p>
        </div>
        <Button onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', description: '', sortOrder: 0 }); setShowModal(true); }}>
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : categories?.data?.length === 0 ? (
          <EmptyState
            title="No categories yet"
            description="Create your first category to organize your menu."
            actionLabel="Add Category"
            onAction={() => setShowModal(true)}
            icon={<FolderTree className="w-8 h-8 text-slate-400" />}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {categories?.data?.map((category: any) => (
              <div key={category.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
                  <div>
                    <p className="font-medium text-sm text-slate-900">{category.name}</p>
                    <p className="text-xs text-slate-500">
                      {category.description || 'No description'} · {category._count?.products || 0} products
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={category.isActive ? 'success' : 'default'}>
                    {category.isActive ? 'Active' : 'Hidden'}
                  </Badge>
                  <button
                    onClick={() => toggleActiveMutation.mutate({ id: category.id, isActive: !category.isActive })}
                    className="p-1.5 hover:bg-slate-100 rounded-lg"
                    title={category.isActive ? 'Hide' : 'Show'}
                  >
                    {category.isActive ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                  </button>
                  <button
                    onClick={() => openEdit(category)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg"
                  >
                    <Pencil className="w-4 h-4 text-slate-400" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(category.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingCategory(null); }}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      >
        <div className="space-y-4">
          <div>
            <label className="label">Category Name *</label>
            <input
              className="input-field"
              value={categoryForm.name}
              onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
              placeholder="e.g., Rice Dishes"
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input-field"
              rows={3}
              value={categoryForm.description}
              onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="label">Sort Order</label>
            <input
              type="number"
              className="input-field"
              value={categoryForm.sortOrder}
              onChange={e => setCategoryForm({ ...categoryForm, sortOrder: Number(e.target.value) })}
              min="0"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};