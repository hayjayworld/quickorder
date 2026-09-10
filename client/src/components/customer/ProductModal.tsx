import React, { useState, useEffect } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../design-system/Button';

interface ProductModalProps {
  product: any;
  accentColor: string;
  isBold: boolean;
  onClose: () => void;
  onAdd: (item: any) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  accentColor,
  isBold,
  onClose,
  onAdd,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [totalPrice, setTotalPrice] = useState(Number(product.price));

  useEffect(() => {
    // Set default selections for required options
    product.options?.forEach((opt: any) => {
      if (opt.isRequired && !selectedOptions[opt.id]) {
        setSelectedOptions(prev => ({ ...prev, [opt.id]: opt.values[0]?.id }));
      }
    });
  }, [product]);

  useEffect(() => {
    let total = Number(product.price);
    product.options?.forEach((opt: any) => {
      const selectedValueId = selectedOptions[opt.id];
      if (selectedValueId) {
        const value = opt.values.find((v: any) => v.id === selectedValueId);
        if (value) total += Number(value.priceDelta);
      }
    });
    setTotalPrice(total * quantity);
  }, [selectedOptions, quantity, product]);

  const handleAdd = () => {
    const options = [];
    for (const optId in selectedOptions) {
      const option = product.options.find((o: any) => o.id === optId);
      const value = option.values.find((v: any) => v.id === selectedOptions[optId]);
      if (option && value) {
        options.push({
          optionId: optId,
          valueId: value.id,
          optionName: option.name,
          valueLabel: value.label,
          priceDelta: Number(value.priceDelta),
        });
      }
    }
    onAdd({
      productId: product.id,
      productName: product.name,
      unitPrice: Number(product.price),
      quantity,
      options,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className={cn(
        'w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-in',
        isBold ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'
      )}>
        {product.imageUrl && (
          <div className="relative aspect-video">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-t-2xl" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {!product.imageUrl && (
          <div className="flex justify-end p-4">
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="p-6">
          <h2 className={cn('text-xl font-bold mb-2', isBold ? 'text-white' : 'text-slate-900')}>
            {product.name}
          </h2>
          {product.description && (
            <p className={cn('text-sm mb-4', isBold ? 'text-slate-400' : 'text-slate-500')}>
              {product.description}
            </p>
          )}

          {/* Options */}
          {product.options?.map((opt: any) => (
            <div key={opt.id} className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className={cn('font-medium text-sm', isBold ? 'text-white' : 'text-slate-700')}>
                  {opt.name}
                  {opt.isRequired && <span className="text-red-500">*</span>}
                </span>
                <span className={cn('text-xs', isBold ? 'text-slate-400' : 'text-slate-400')}>
                  {opt.maxSelections > 1 ? `Choose up to ${opt.maxSelections}` : 'Choose one'}
                </span>
              </div>
              <div className="space-y-2">
                {opt.values.map((val: any) => {
                  const isSelected = selectedOptions[opt.id] === val.id;
                  return (
                    <button
                      key={val.id}
                      onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.id]: val.id }))}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all',
                        isSelected
                          ? 'border-transparent text-white'
                          : isBold
                            ? 'border-slate-700 text-slate-300 hover:border-slate-600'
                            : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      )}
                      style={isSelected ? { backgroundColor: accentColor } : undefined}
                    >
                      <span className="text-sm font-medium">{val.label}</span>
                      {Number(val.priceDelta) > 0 && (
                        <span className="text-sm">+₦{Number(val.priceDelta).toLocaleString()}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="flex items-center justify-between mb-6">
            <span className={cn('font-medium', isBold ? 'text-white' : 'text-slate-700')}>Quantity</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-slate-100"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-lg font-bold w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-slate-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Total and Add */}
          <div className="flex items-center justify-between mb-4">
            <span className={cn('font-medium', isBold ? 'text-white' : 'text-slate-700')}>Total</span>
            <span className={cn('text-2xl font-bold', isBold ? 'text-white' : 'text-slate-900')}>
              ₦{totalPrice.toLocaleString()}
            </span>
          </div>

          <Button
            className="w-full"
            onClick={handleAdd}
            style={{ backgroundColor: accentColor }}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};