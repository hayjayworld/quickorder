import React from 'react';
import { Link } from 'react-router-dom';
import { 
  QrCode, Zap, BarChart3, Store, Users, Palette, Shield, 
  ArrowRight, Check, Star, Sparkles, Menu as MenuIcon, 
  Smartphone, Table, Bell, ChevronRight, Globe
} from 'lucide-react';
import { Button } from '../../components/design-system/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#E85D3D] flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-slate-900 text-lg">QuickOrder</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">How It Works</a>
              <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
              <a href="#faq" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">FAQ</a>
            </nav>

            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Start Free Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E85D3D]/10 text-[#E85D3D] text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                New: QR Analytics Dashboard
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6">
                Turn Every Table Into an{' '}
                <span className="text-[#E85D3D]">Ordering Point</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Let customers scan, browse, and order from their phones while your team
                manages everything from one powerful dashboard. No app downloads required.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button size="lg">
                    Start Free Trial <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="outline" size="lg">
                    See How It Works
                  </Button>
                </a>
              </div>
              <div className="mt-8 flex items-center gap-6">
                <div className="flex -space-x-2">
                  {['JD', 'AK', 'MO', 'TC'].map((initials, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-semibold text-slate-600"
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-500">Trusted by 500+ restaurants</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-sm mx-auto transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#E85D3D] flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Customer View</p>
                    <p className="text-xs text-slate-500">Table 12 · Ikeja</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {['Jollof Rice', 'Chicken Burger', 'Coke'].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">{item}</span>
                      <span className="text-sm font-bold text-slate-900">₦{i === 0 ? '4,500' : i === 1 ? '6,500' : '800'}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4">Place Order</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Restaurants' },
              { value: '50K+', label: 'Orders Monthly' },
              { value: '98%', label: 'Customer Satisfaction' },
              { value: '30%', label: 'Avg. Order Increase' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Get your restaurant up and running with QR ordering in minutes.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Store, title: 'Create Restaurant', desc: 'Set up your restaurant profile and menu in minutes.' },
              { icon: QrCode, title: 'Generate QR Codes', desc: 'Create unique QR codes for every table in your outlet.' },
              { icon: Smartphone, title: 'Customers Scan', desc: 'Customers scan and browse your menu instantly.' },
              { icon: Bell, title: 'Receive Orders', desc: 'Get real-time notifications for every new order.' },
            ].map((step, i) => (
              <div key={i} className="relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 right-0 w-full h-0.5 bg-slate-100" />
                )}
                <div className="relative text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#E85D3D]/10 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-[#E85D3D]" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Run Your Restaurant
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Powerful features designed for modern restaurant operations.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: QrCode, title: 'QR Ordering', desc: 'Generate and manage QR codes for every table. Track scans and conversions.' },
              { icon: Zap, title: 'Live Orders', desc: 'Real-time order notifications with status tracking and updates.' },
              { icon: BarChart3, title: 'Advanced Analytics', desc: 'Deep insights into revenue, orders, popular items, and more.' },
              { icon: Store, title: 'Multiple Outlets', desc: 'Manage multiple restaurant locations from one dashboard.' },
              { icon: Users, title: 'Staff Management', desc: 'Role-based access for admins, managers, and front desk staff.' },
              { icon: Palette, title: 'Custom Themes', desc: 'Choose from professionally designed menu themes for your brand.' },
              { icon: Shield, title: 'Secure & Reliable', desc: 'Enterprise-grade security with multi-tenant isolation and audit logs.' },
              { icon: MenuIcon, title: 'Menu Management', desc: 'Create and manage products, categories, options, and add-ons.' },
              { icon: Globe, title: 'Multi-Currency', desc: 'Support for multiple currencies and international restaurants.' },
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-[#E85D3D]/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-[#E85D3D]" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-slate-600">Start free and scale as you grow.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: 'Free',
                period: 'Trial',
                features: ['1 Outlet', 'QR Ordering', 'Menu Management', 'Order Management', 'Basic Analytics'],
                highlight: false,
              },
              {
                name: 'Business',
                price: '₦15,000',
                period: '/month',
                features: ['Up to 3 Outlets', 'Advanced Analytics', 'Multiple Staff', 'QR Analytics', 'Custom Themes', 'Priority Support'],
                highlight: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: '',
                features: ['Unlimited Outlets', 'Custom Integrations', 'Dedicated Support', 'API Access', 'Custom Features'],
                highlight: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`rounded-2xl p-8 border ${
                  plan.highlight
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xl scale-105'
                    : 'bg-white border-slate-200'
                }`}
              >
                <h3 className={`text-xl font-bold mb-2 ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className={`text-3xl font-bold ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-sm ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <Check className={`w-4 h-4 mt-0.5 ${plan.highlight ? 'text-[#E85D3D]' : 'text-emerald-500'}`} />
                      <span className={`text-sm ${plan.highlight ? 'text-slate-300' : 'text-slate-600'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button
                    variant={plan.highlight ? 'primary' : 'outline'}
                    className="w-full"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              { q: 'Do customers need to download an app?', a: 'No! Customers simply scan the QR code with their phone camera and access your menu instantly in their browser. No app downloads required.' },
              { q: 'How does the QR code work?', a: 'Each QR code is unique and linked to a specific table or location in your restaurant. When scanned, it opens your digital menu for that specific location.' },
              { q: 'Can I manage multiple outlets?', a: 'Yes! Depending on your subscription plan, you can manage multiple restaurant locations from a single dashboard.' },
              { q: 'What happens if my subscription expires?', a: 'You can still access your data in read-only mode. QR codes will be deactivated until you reactivate your subscription.' },
            ].map((faq, i) => (
              <details key={i} className="bg-white rounded-xl border border-slate-200 p-4 group">
                <summary className="flex justify-between items-center cursor-pointer font-medium text-slate-900">
                  {faq.q}
                  <ChevronRight className="w-5 h-5 text-slate-400 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Ready to Transform Your Restaurant?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Join hundreds of restaurants already using QuickOrder to streamline their operations.
          </p>
          <Link to="/register">
            <Button size="lg">
              Start Your Free Trial <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#E85D3D] flex items-center justify-center">
                <QrCode className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">QuickOrder</span>
            </div>
            <div className="flex gap-8">
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-sm text-slate-500">© 2026 QuickOrder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};