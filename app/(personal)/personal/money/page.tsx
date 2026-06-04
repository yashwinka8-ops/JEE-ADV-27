'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import type { MoneyEntry, SavingsGoal, WishlistItem } from '@/store/useStore';
import AppleEmoji from '@/components/AppleEmoji';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, Wallet, ShoppingBag, Check } from 'lucide-react';

const INCOME_CATS = ['Pocket Money', 'Freelancing', 'Affiliate', 'YouTube', 'Gifts', 'Other'];
const EXPENSE_CATS = ['Food', 'Transport', 'Gadgets', 'Education', 'Entertainment', 'Clothes', 'Health', 'Other'];

const typeColor = (t: string) => t === 'income' ? '#10b981' : t === 'expense' ? '#ef4444' : '#3b82f6';
const typeIcon = (t: string) => t === 'income' ? ArrowDownRight : t === 'expense' ? ArrowUpRight : Wallet;

export default function MoneyPage() {
  const { moneyEntries, addMoneyEntry, removeMoneyEntry, savingsGoals, addSavingsGoal, updateSavingsGoal, removeSavingsGoal, wishlistItems, addWishlistItem, toggleWishlistDone, removeWishlistItem } = useStore();
  const [tab, setTab] = useState<'overview' | 'transactions' | 'goals' | 'wishlist'>('overview');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Partial<MoneyEntry>>({ type: 'expense', amount: 0, category: 'Food', note: '', date: new Date().toISOString().slice(0, 10) });
  const [showGoalAdd, setShowGoalAdd] = useState(false);
  const [goalForm, setGoalForm] = useState<Partial<SavingsGoal>>({ title: '', emoji: '🎯', target: 0, current: 0 });
  const [wishForm, setWishForm] = useState({ title: '', priority: 'immediate' as 'immediate' | 'longterm' });
  const [showWishAdd, setShowWishAdd] = useState(false);
  const [txFilter, setTxFilter] = useState<'all' | 'income' | 'expense' | 'saving'>('all');

  const income   = moneyEntries.filter(e => e.type === 'income').reduce((a, b) => a + b.amount, 0);
  const expenses = moneyEntries.filter(e => e.type === 'expense').reduce((a, b) => a + b.amount, 0);
  const savings  = moneyEntries.filter(e => e.type === 'saving').reduce((a, b) => a + b.amount, 0);
  const netWorth = income + savings - expenses;

  // Category breakdown for expenses
  const expByCat = EXPENSE_CATS.map(c => ({
    cat: c,
    total: moneyEntries.filter(e => e.type === 'expense' && e.category === c).reduce((a, b) => a + b.amount, 0)
  })).filter(x => x.total > 0).sort((a, b) => b.total - a.total);

  const sorted = [...moneyEntries]
    .filter(e => txFilter === 'all' || e.type === txFilter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const saveTx = () => {
    if (!form.amount || form.amount <= 0 || !form.category) return;
    addMoneyEntry({ ...form, id: Math.random().toString(36).slice(2) } as MoneyEntry);
    setShowAdd(false);
    setForm({ type: 'expense', amount: 0, category: 'Food', note: '', date: new Date().toISOString().slice(0, 10) });
  };

  const saveGoal = () => {
    if (!goalForm.title?.trim() || !goalForm.target) return;
    addSavingsGoal({ ...goalForm, id: Math.random().toString(36).slice(2) } as SavingsGoal);
    setShowGoalAdd(false);
    setGoalForm({ title: '', emoji: '🎯', target: 0, current: 0 });
  };

  const saveWish = () => {
    if (!wishForm.title.trim()) return;
    addWishlistItem({ ...wishForm, id: Math.random().toString(36).slice(2), done: false });
    setShowWishAdd(false);
    setWishForm({ title: '', priority: 'immediate' });
  };

  const tabs = ['overview', 'transactions', 'goals', 'wishlist'] as const;

  return (
    <div style={{ color: '#f0f0f0', fontFamily: 'Inter, sans-serif', animation: 'fadeUp 0.4s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#10b981', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
            <AppleEmoji emoji="💰" size={36} /> Money
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>Your personal financial command center.</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{
          background: '#10b981', border: 'none', borderRadius: 12, padding: '10px 20px',
          color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center'
        }}>
          <Plus size={15} /> Add Transaction
        </button>
      </div>

      {/* Net Worth Hero */}
      <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.08))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 24, padding: 32, marginBottom: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Net Worth</div>
        <div style={{ fontSize: 56, fontWeight: 900, color: netWorth >= 0 ? '#10b981' : '#ef4444', letterSpacing: '-2px' }}>₹{netWorth.toLocaleString()}</div>
        <div className="money-hero" style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>INCOME</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}>+₹{income.toLocaleString()}</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>EXPENSES</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#ef4444' }}>-₹{expenses.toLocaleString()}</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>SAVINGS</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#3b82f6' }}>₹{savings.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Add Transaction Form */}
      {showAdd && (
        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {(['expense', 'income', 'saving'] as const).map(t => (
              <button key={t} onClick={() => setForm(f => ({ ...f, type: t, category: t === 'income' ? 'Pocket Money' : 'Food' }))} style={{
                flex: 1, background: form.type === t ? `${typeColor(t)}15` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${form.type === t ? typeColor(t) : 'rgba(255,255,255,0.06)'}`,
                color: form.type === t ? typeColor(t) : 'rgba(255,255,255,0.4)',
                borderRadius: 10, padding: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize'
              }}>{t}</button>
            ))}
          </div>
          <div className="money-form mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 5 }}>Amount (₹)</label>
              <input type="number" value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: +e.target.value }))}
                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, color: '#fff', fontSize: 16, fontWeight: 700, padding: 12, outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 5 }}>Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, color: '#fff', fontSize: 14, padding: 12, outline: 'none' }}>
                {(form.type === 'income' ? INCOME_CATS : EXPENSE_CATS).map(c => <option key={c} value={c} style={{ background: '#111' }}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 5 }}>Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, color: '#fff', fontSize: 14, padding: 12, outline: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <input placeholder="Note (optional)" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, color: '#fff', fontSize: 14, padding: 12, outline: 'none' }} />
            <button onClick={saveTx} style={{ background: '#10b981', border: 'none', borderRadius: 10, padding: '0 24px', color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Add</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 4, width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? 'rgba(16,185,129,0.15)' : 'transparent',
            border: tab === t ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent',
            color: tab === t ? '#10b981' : 'rgba(255,255,255,0.4)',
            borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize'
          }}>{t}</button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div>
          {expByCat.length > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Spending by Category</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {expByCat.map(({ cat, total }) => (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, fontSize: 13, marginBottom: 5 }}>
                      <span>{cat}</span><span style={{ color: '#ef4444', fontWeight: 700 }}>₹{total.toLocaleString()}</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 999, height: 6 }}>
                      <div style={{ height: '100%', width: `${(total / expenses) * 100}%`, background: '#ef4444', borderRadius: 999 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Recent Transactions</div>
            {sorted.slice(0, 8).map((e) => {
              const Icon = typeIcon(e.type);
              return (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${typeColor(e.type)}15`, color: typeColor(e.type), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={16} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{e.category}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{new Date(e.date).toLocaleDateString()}{e.note ? ` · ${e.note}` : ''}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: typeColor(e.type) }}>{e.type === 'expense' ? '-' : '+'}₹{e.amount.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transactions */}
      {tab === 'transactions' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {(['all', 'income', 'expense', 'saving'] as const).map(f => (
              <button key={f} onClick={() => setTxFilter(f)} style={{
                background: txFilter === f ? `${f === 'all' ? '#6b7280' : typeColor(f)}15` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${txFilter === f ? `${f === 'all' ? '#6b7280' : typeColor(f)}40` : 'rgba(255,255,255,0.05)'}`,
                color: txFilter === f ? (f === 'all' ? '#f0f0f0' : typeColor(f)) : 'rgba(255,255,255,0.4)',
                borderRadius: 99, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize'
              }}>{f}</button>
            ))}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, overflow: 'hidden' }}>
            {sorted.map((e, i) => {
              const Icon = typeIcon(e.type);
              return (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', borderBottom: i < sorted.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${typeColor(e.type)}15`, color: typeColor(e.type), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={18} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{e.category}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{new Date(e.date).toLocaleDateString()}{e.note ? ` · ${e.note}` : ''}</div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: typeColor(e.type) }}>{e.type === 'expense' ? '-' : '+'}₹{e.amount.toLocaleString()}</div>
                  <button onClick={() => removeMoneyEntry(e.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer' }}><Trash2 size={14} /></button>
                </div>
              );
            })}
            {sorted.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>No transactions yet.</div>}
          </div>
        </div>
      )}

      {/* Savings Goals */}
      {tab === 'goals' && (
        <div>
          <button onClick={() => setShowGoalAdd(!showGoalAdd)} style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12, padding: '10px 20px', color: '#3b82f6', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center', marginBottom: 20 }}>
            <Plus size={14} /> New Savings Goal
          </button>
          {showGoalAdd && (
            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 16, padding: 20, marginBottom: 20 }}>
              <div className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: 12, marginBottom: 12 }}>
                <input placeholder="🎯" value={goalForm.emoji} onChange={e => setGoalForm(f => ({ ...f, emoji: e.target.value }))} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, color: '#fff', fontSize: 24, textAlign: 'center', outline: 'none' }} />
                <input placeholder="Goal name (e.g. Laptop Fund)" value={goalForm.title} onChange={e => setGoalForm(f => ({ ...f, title: e.target.value }))} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, color: '#fff', fontSize: 14, padding: 12, outline: 'none' }} />
              </div>
              <div className="money-form mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Target (₹)</label>
                  <input type="number" value={goalForm.target || ''} onChange={e => setGoalForm(f => ({ ...f, target: +e.target.value }))} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, color: '#fff', fontSize: 14, padding: 12, outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 4 }}>Current (₹)</label>
                  <input type="number" value={goalForm.current || ''} onChange={e => setGoalForm(f => ({ ...f, current: +e.target.value }))} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, color: '#fff', fontSize: 14, padding: 12, outline: 'none' }} />
                </div>
              </div>
              <button onClick={saveGoal} style={{ background: '#3b82f6', border: 'none', borderRadius: 10, padding: '12px', width: '100%', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Add Goal</button>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {savingsGoals.map(g => {
              const pct = Math.min(100, Math.round((g.current / g.target) * 100)) || 0;
              return (
                <div key={g.id} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <AppleEmoji emoji={g.emoji} size={28} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{g.title}</div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>₹{g.current.toLocaleString()} / ₹{g.target.toLocaleString()}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: '#3b82f6' }}>{pct}%</span>
                      <button onClick={() => { const v = prompt('Update current amount:'); if (v && !isNaN(+v)) updateSavingsGoal(g.id, { current: +v }); }} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, padding: '6px 12px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 12 }}>Update</button>
                      <button onClick={() => removeSavingsGoal(g.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer' }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 999, height: 10, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#10b981' : '#3b82f6', borderRadius: 999, transition: 'width 0.6s' }} />
                  </div>
                </div>
              );
            })}
            {savingsGoals.length === 0 && <div style={{ textAlign: 'center', padding: 48, color: 'rgba(255,255,255,0.2)' }}>No savings goals. Create one!</div>}
          </div>
        </div>
      )}

      {/* Wishlist */}
      {tab === 'wishlist' && (
        <div>
          <button onClick={() => setShowWishAdd(!showWishAdd)} style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '10px 20px', color: '#f59e0b', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center', marginBottom: 20 }}>
            <ShoppingBag size={14} /> Add to Wishlist
          </button>
          {showWishAdd && (
            <div className="money-hero" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 16, padding: 20, marginBottom: 20, display: 'flex', gap: 12 }}>
              <input placeholder="Item name..." value={wishForm.title} onChange={e => setWishForm(f => ({ ...f, title: e.target.value }))} style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, color: '#fff', fontSize: 14, padding: 12, outline: 'none' }} />
              <select value={wishForm.priority} onChange={e => setWishForm(f => ({ ...f, priority: e.target.value as any }))} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, color: '#fff', fontSize: 14, padding: 12, outline: 'none' }}>
                <option value="immediate">Immediate</option>
                <option value="longterm">Long-Term</option>
              </select>
              <button onClick={saveWish} style={{ background: '#f59e0b', border: 'none', borderRadius: 10, padding: '0 20px', color: '#000', fontWeight: 700, cursor: 'pointer' }}>Add</button>
            </div>
          )}
          <div className="money-form mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {(['immediate', 'longterm'] as const).map(priority => (
              <div key={priority}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 800, color: priority === 'immediate' ? '#f59e0b' : '#8b5cf6', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                  <AppleEmoji emoji={priority === 'immediate' ? '⚡' : '🌟'} size={14} /> {priority === 'immediate' ? 'Immediate' : 'Long-Term'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {wishlistItems.filter(i => i.priority === priority).map(item => (
                    <div key={item.id} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button onClick={() => toggleWishlistDone(item.id)} style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${item.done ? '#10b981' : 'rgba(255,255,255,0.2)'}`, background: item.done ? '#10b981' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {item.done && <Check size={12} color="#000" />}
                      </button>
                      <span style={{ flex: 1, fontSize: 14, textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'rgba(255,255,255,0.3)' : '#f0f0f0' }}>{item.title}</span>
                      <button onClick={() => removeWishlistItem(item.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer' }}><Trash2 size={13} /></button>
                    </div>
                  ))}
                  {wishlistItems.filter(i => i.priority === priority).length === 0 && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', padding: '12px 0', textAlign: 'center' }}>Nothing here yet.</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html:`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}} />
    </div>
  );
}