import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { Button } from '../../components/design-system/Button';

export const OrderSuccessPage: React.FC = () => {
  const { qrToken, orderToken, orderNumber } = useParams();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            Your order has been sent to the restaurant.
          </p>
          
          {orderNumber && (
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-500 mb-1">Order Number</p>
              <p className="text-xl font-bold text-slate-900">{orderNumber}</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-8">
            <Clock className="w-4 h-4" />
            <span>Estimated preparation time: 15-20 minutes</span>
          </div>

          <div className="space-y-3">
            <Link to={`/order/${qrToken}/status/${orderToken}`}>
              <Button className="w-full">
                Track Order Status <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to={`/order/${qrToken}`}>
              <Button variant="outline" className="w-full">
                Back to Menu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};