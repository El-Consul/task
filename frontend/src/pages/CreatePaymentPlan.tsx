import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentPlansApi, clientsApi } from '../services/api';
import { ArrowLeft, Save, Loader2, RefreshCw } from 'lucide-react';

interface Client {
  id: number;
  name: string;
  unitCode?: string;
}

interface InstallmentInput {
  id: string; // temp id for UI key
  amount: number;
  dueDate: string;
  type: string;
}

const CreatePaymentPlan = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [clientId, setClientId] = useState('');
  const [unitPrice, setUnitPrice] = useState<number>(2485000);
  const [deposit, setDeposit] = useState<number>(495000);
  const [contractDate, setContractDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [assessmentAmount, setAssessmentAmount] = useState<number>(0);
  const [measurements, setMeasurements] = useState<number>(40000);
  const [deposit10Percent, setDeposit10Percent] = useState<number>(248000);

  // Generation Rules State
  const [totalMonths, setTotalMonths] = useState<number>(20);
  const [deliveryMonth, setDeliveryMonth] = useState<number>(8);
  const [deliveryAmount, setDeliveryAmount] = useState<number>(217000);
  const [finalAmount, setFinalAmount] = useState<number>(99000);

  const [installments, setInstallments] = useState<InstallmentInput[]>([]);

  useEffect(() => {
    clientsApi.getAll().then((res) => setClients(res.data)).catch(console.error);
  }, []);

  const remainingAmount = unitPrice - deposit;

  const generateInstallments = () => {
    if (deposit >= unitPrice) {
      setError('Deposit cannot be greater than or equal to Unit Price.');
      return;
    }
    setError('');

    // Example logic from the prompt:
    // Total Remaining = 1,990,000
    // Delivery (Month 8) = 217,000
    // Final (Month 20) = 99,000
    // Regular Months count = 18 (20 total - 1 delivery - 1 final)
    // Regular Amount = (1,990,000 - 217,000 - 99,000) / 18 = 93,000
    
    let regularMonthsCount = totalMonths;
    let sumOfSpecial = 0;

    if (deliveryMonth > 0 && deliveryMonth <= totalMonths) {
      regularMonthsCount -= 1;
      sumOfSpecial += deliveryAmount;
    }
    if (finalAmount > 0) {
      regularMonthsCount -= 1;
      sumOfSpecial += finalAmount;
    }

    const regularAmount = (remainingAmount - sumOfSpecial) / (regularMonthsCount || 1);

    const generated: InstallmentInput[] = [];
    let currentDate = new Date(contractDate);

    for (let i = 1; i <= totalMonths; i++) {
      currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
      const dueDateStr = currentDate.toISOString().split('T')[0];

      if (i === deliveryMonth) {
        generated.push({ id: Math.random().toString(), amount: deliveryAmount, dueDate: dueDateStr, type: 'DELIVERY' });
      } else if (i === totalMonths && finalAmount > 0) {
        generated.push({ id: Math.random().toString(), amount: finalAmount, dueDate: dueDateStr, type: 'FINAL' });
      } else {
        generated.push({ id: Math.random().toString(), amount: regularAmount, dueDate: dueDateStr, type: 'REGULAR' });
      }
    }

    // Add Maintenance Deposit as an extra installment if provided
    if (deposit10Percent > 0) {
      currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
      generated.push({
        id: Math.random().toString(),
        amount: deposit10Percent,
        dueDate: currentDate.toISOString().split('T')[0],
        type: 'MAINTENANCE'
      });
    }

    setInstallments(generated);
  };

  const handleInstallmentChange = (index: number, field: keyof InstallmentInput, value: string | number) => {
    const updated = [...installments];
    updated[index] = { ...updated[index], [field]: value };
    setInstallments(updated);
  };

  const removeInstallment = (index: number) => {
    const updated = [...installments];
    updated.splice(index, 1);
    setInstallments(updated);
  };

  const addManualInstallment = () => {
    const lastDate = installments.length > 0 ? new Date(installments[installments.length - 1].dueDate) : new Date(contractDate);
    const newDate = new Date(lastDate.setMonth(lastDate.getMonth() + 1)).toISOString().split('T')[0];
    setInstallments([...installments, { id: Math.random().toString(), amount: 0, dueDate: newDate, type: 'REGULAR' }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setError('Please select a client');
      return;
    }
    if (installments.length === 0) {
      setError('Please generate or add installments');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await paymentPlansApi.create({
        clientId: parseInt(clientId),
        unitPrice,
        contractDate,
        deposit,
        assessmentAmount,
        measurements,
        deposit10Percent,
        installments: installments.map(i => ({
          amount: Number(i.amount),
          dueDate: i.dueDate,
          type: i.type
        }))
      });
      navigate(`/clients/${clientId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save payment plan');
      setSubmitting(false);
    }
  };

  const totalInstallmentsAmount = installments.reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <div className="flex-col gap-6">
      <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ alignSelf: 'flex-start' }}>
        <ArrowLeft size={18} /> Back
      </button>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-h2">Create Payment Plan</h1>
          <p className="text-muted mt-2">Generate a customized installment plan for a client</p>
        </div>
      </div>

      {error && <div className="login-error">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form & Generator */}
        <div className="card glass-panel lg:col-span-1 flex-col gap-4">
          <h3 className="text-h3 border-b border-white/10 pb-2">Plan Details</h3>
          
          <div className="form-group">
            <label className="form-label">Client *</label>
            <select className="input" value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="">Select a client</option>
              {clients.map(c => <option key={c.id} value={c.id}>#{c.id} - {c.name} {c.unitCode ? `(${c.unitCode})` : ''}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Unit Price</label>
              <input type="number" className="input" value={unitPrice} onChange={e => setUnitPrice(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label">Down Payment</label>
              <input type="number" className="input" value={deposit} onChange={e => setDeposit(Number(e.target.value))} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contract Date</label>
            <input type="date" className="input" value={contractDate} onChange={e => setContractDate(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Measurements Fee</label>
              <input type="number" className="input" value={measurements} onChange={e => setMeasurements(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label">Assessment Amount (المقايسة)</label>
              <input type="number" className="input" value={assessmentAmount} onChange={e => setAssessmentAmount(Number(e.target.value))} />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Maintenance (10%)</label>
            <input type="number" className="input" value={deposit10Percent} onChange={e => setDeposit10Percent(Number(e.target.value))} />
          </div>

          <div className="p-3 bg-black/20 rounded-lg mt-2">
            <span className="text-sm text-muted">Remaining to Install:</span>
            <p className="font-bold text-xl text-accent-primary">{remainingAmount.toLocaleString()} EGP</p>
          </div>

          <h3 className="text-h3 border-b border-white/10 pb-2 mt-4">Generation Rules</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Total Months</label>
              <input type="number" className="input" value={totalMonths} onChange={e => setTotalMonths(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label">Delivery Month #</label>
              <input type="number" className="input" value={deliveryMonth} onChange={e => setDeliveryMonth(Number(e.target.value))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Delivery Amount</label>
              <input type="number" className="input" value={deliveryAmount} onChange={e => setDeliveryAmount(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label">Final Amount</label>
              <input type="number" className="input" value={finalAmount} onChange={e => setFinalAmount(Number(e.target.value))} />
            </div>
          </div>

          <button className="btn btn-secondary w-full mt-2" onClick={generateInstallments}>
            <RefreshCw size={18} /> Generate Installments
          </button>
        </div>

        {/* Right Column: Grid */}
        <div className="card glass-panel lg:col-span-2 flex-col gap-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h3 className="text-h3">Installments Schedule ({installments.length})</h3>
            <div className="text-right">
              <span className="text-sm text-muted block">Total Grid Amount</span>
              <span className={`font-bold ${totalInstallmentsAmount > remainingAmount ? 'text-accent-primary' : 'text-danger'}`}>
                {totalInstallmentsAmount.toLocaleString()} EGP
              </span>
            </div>
          </div>

          <div className="table-container" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <table>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 1 }}>
                <tr>
                  <th>#</th>
                  <th>Amount (EGP)</th>
                  <th>Due Date</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {installments.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-muted p-4">No installments generated. Use the generator or add manually.</td></tr>
                ) : (
                  installments.map((inst, idx) => (
                    <tr key={inst.id}>
                      <td className="text-muted">{idx + 1}</td>
                      <td>
                        <input type="number" className="input" style={{ padding: '0.25rem 0.5rem', minHeight: '32px' }} value={Math.round(inst.amount)} onChange={(e) => handleInstallmentChange(idx, 'amount', Number(e.target.value))} />
                      </td>
                      <td>
                        <input type="date" className="input" style={{ padding: '0.25rem 0.5rem', minHeight: '32px' }} value={inst.dueDate} onChange={(e) => handleInstallmentChange(idx, 'dueDate', e.target.value)} />
                      </td>
                      <td>
                        <select className="input" style={{ padding: '0.25rem 0.5rem', minHeight: '32px' }} value={inst.type} onChange={(e) => handleInstallmentChange(idx, 'type', e.target.value)}>
                          <option value="REGULAR">Regular</option>
                          <option value="DELIVERY">Delivery</option>
                          <option value="FINAL">Final</option>
                          <option value="MAINTENANCE">Maintenance</option>
                        </select>
                      </td>
                      <td>
                        <button className="btn-icon text-danger" onClick={() => removeInstallment(idx)}>X</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between mt-4 pt-4 border-t border-white/10">
            <button className="btn btn-secondary" onClick={addManualInstallment}>
              + Add Row
            </button>
            <button className="btn btn-primary px-8" onClick={handleSubmit} disabled={submitting || installments.length === 0}>
              {submitting ? <><Loader2 size={18} className="spin" /> Saving...</> : <><Save size={18} /> Save Payment Plan</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePaymentPlan;
