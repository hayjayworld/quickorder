import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../components/design-system/Button';
import { apiRequest } from '../../lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';

export const OnboardingWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [outlet, setOutlet] = useState({ name: '', address: '', phone: '' });
  const [category, setCategory] = useState({ name: '' });
  const [tableCount, setTableCount] = useState(10);
  const navigate = useNavigate();
  const { fetchMe } = useAuthStore();

  const steps = ['Restaurant', 'Outlet', 'Menu', 'Tables', 'QR Codes', 'Complete'];

  const handleNext = () => setStep(s => Math.min(s + 1, 6));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleComplete = async () => {
    try {
      // Create outlet
      const outletResponse = await apiRequest('POST', '/outlets', outlet);
      const outletId = outletResponse.data.id;

      // Create category
      if (category.name) {
        await apiRequest('POST', '/products/categories', { name: category.name });
      }

      // Create tables and QR codes
      const tableIds: string[] = [];
      for (let i = 1; i <= tableCount; i++) {
        const tableRes = await apiRequest('POST', `/outlets/${outletId}/tables`, {
          label: `Table ${i}`,
          capacity: 4,
        });
        tableIds.push(tableRes.data.id);
      }

      // Generate QR codes in bulk
      await apiRequest('POST', '/qr/bulk', {
        outletId,
        tableIds,
        labelPrefix: 'Table',
      });

      toast.success('Setup complete! Your restaurant is ready.');
      await fetchMe();
      navigate('/app');
    } catch (error) {
      toast.error('Error during setup. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="max-w-3xl mx-auto w-full px-4 py-8">
        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((label, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  i + 1 <= step ? 'bg-[#E85D3D] text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {i + 1 < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-xs mt-1 text-slate-600">{label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i + 1 < step ? 'bg-[#E85D3D]' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Restaurant Information</h2>
              <p className="text-sm text-slate-500 mb-6">We'll use your restaurant details for the menu.</p>
              {/* Restaurant info already set at registration */}
              <Button onClick={handleNext}>Next <ChevronRight className="w-4 h-4" /></Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Create Your First Outlet</h2>
              <div>
                <label className="label">Outlet Name</label>
                <input className="input-field" value={outlet.name} onChange={e => setOutlet({...outlet, name: e.target.value})} placeholder="e.g., Main Branch" />
              </div>
              <div>
                <label className="label">Address</label>
                <input className="input-field" value={outlet.address} onChange={e => setOutlet({...outlet, address: e.target.value})} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input-field" value={outlet.phone} onChange={e => setOutlet({...outlet, phone: e.target.value})} />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack}><ChevronLeft className="w-4 h-4" /> Back</Button>
                <Button onClick={handleNext} disabled={!outlet.name}>Next <ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Add Your First Category</h2>
              <p className="text-sm text-slate-500">You can add products later.</p>
              <div>
                <label className="label">Category Name</label>
                <input className="input-field" value={category.name} onChange={e => setCategory({...category, name: e.target.value})} placeholder="e.g., Rice Dishes" />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack}><ChevronLeft className="w-4 h-4" /> Back</Button>
                <Button onClick={handleNext} disabled={!category.name}>Next <ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">How Many Tables?</h2>
              <p className="text-sm text-slate-500">We'll create tables and generate QR codes for you.</p>
              <div>
                <label className="label">Number of Tables</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  className="input-field"
                  value={tableCount}
                  onChange={e => setTableCount(Number(e.target.value))}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack}><ChevronLeft className="w-4 h-4" /> Back</Button>
                <Button onClick={handleNext}>Next <ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 text-center">
              <h2 className="text-xl font-bold">Ready to Generate QR Codes</h2>
              <p className="text-sm text-slate-500">You're almost done!</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={handleBack}><ChevronLeft className="w-4 h-4" /> Back</Button>
                <Button onClick={handleComplete}>Complete Setup</Button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">You're Ready to Receive Orders!</h2>
              <p className="text-slate-500 mb-6">Your restaurant menu is live. Share your QR codes with customers.</p>
              <Button onClick={() => navigate('/app')}>Go to Dashboard</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};