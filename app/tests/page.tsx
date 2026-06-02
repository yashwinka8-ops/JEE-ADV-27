'use client';

import { useState, useRef, useMemo } from 'react';
import { useStore, MockTest, MockTargets } from '@/store/useStore';
import { Trash2, TrendingUp, Download, Plus, Target, ChevronDown, ChevronUp } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

const anup2025Data = [
  [100, 10], [99.99992043, 30], [99.9937403, 145], [99.99, 233], [99.9004, 1641], [99.8982, 1677],
  [99.8016695, 3186], [99.7938333, 3290], [99.7018301, 4699], [99.6987428, 4731], [99.6007682, 6291],
  [99.5966798, 6328], [99.5010703, 7753], [99.49677, 7824], [99.4004213, 9345], [99.3999618, 9358],
  [99.3031387, 10816], [99.2, 10903], [99.1, 12536], [99, 15475], [98.9999641, 15509],
  [98.5003488, 23079], [98.000774, 30646], [97.5087622, 38180], [97.0042358, 45729],
  [96.55, 52689], [95.5040366, 68086], [95.0107132, 77530], [94.008, 93450], [93.1023262, 108160],
  [92.5, 120000], [92, 130000], [91, 150000], [90, 170000], [89, 195000], [88, 220000],
  [87, 250000], [86, 280000], [85, 310000]
];

function getRankAnup2025(perc: number): [string, string] {
  if (perc >= 100) return ["1", "10"];
  for (let i = 0; i < anup2025Data.length - 1; i++) {
    const [p1, r1] = anup2025Data[i];
    const [p2, r2] = anup2025Data[i + 1];
    if (perc <= p1 && perc >= p2) {
      const rank = r1 + (r2 - r1) * (p1 - perc) / (p1 - p2);
      const dev = Math.max(100, rank * 0.04);
      return [Math.floor(rank - dev).toLocaleString('en-IN'), Math.ceil(rank + dev).toLocaleString('en-IN')];
    }
  }
  return ["3,50,000+", "4,00,000+"];
}

function calculateMedian(arr: number[]): number | null {
  if (arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

const emptyForm = () => ({
  name: '',
  date: new Date().toISOString().slice(0, 10),
  physics: '',
  chemistry: '',
  maths: '',
  predictedPercentile: ''
});

export default function TestsPage() {
  const { mockTests, mockTargets, addMockTest, removeMockTest, setMockTargets } = useStore();
  const [isMinimized, setIsMinimized] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [targetForm, setTargetForm] = useState<MockTargets>({
    score: mockTargets?.score || 0,
    percentile: mockTargets?.percentile || 0,
    physics: mockTargets?.physics || 0,
    chemistry: mockTargets?.chemistry || 0,
    maths: mockTargets?.maths || 0
  });

  const chartsRef = useRef<HTMLDivElement>(null);

  // Sorting mocks by date
  const sortedMocks = useMemo(() => [...mockTests].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [mockTests]);

  const totalScores = sortedMocks.map(m => m.totalScore);
  const percentiles = sortedMocks.map(m => m.predictedPercentile);
  const physScores = sortedMocks.map(m => m.physics);
  const chemScores = sortedMocks.map(m => m.chemistry);
  const mathScores = sortedMocks.map(m => m.maths);

  const medianTotal = calculateMedian(totalScores);
  const medianPerc = calculateMedian(percentiles);
  const medianPhys = calculateMedian(physScores);
  const medianChem = calculateMedian(chemScores);
  const medianMath = calculateMedian(mathScores);

  const handleAddMock = (e: React.FormEvent) => {
    e.preventDefault();
    const p = Number(form.physics);
    const c = Number(form.chemistry);
    const m = Number(form.maths);
    const perc = Number(form.predictedPercentile);
    const total = p + c + m;
    
    if (total > 300 || perc > 100 || !form.name.trim()) {
      alert('Invalid input! Please check your scores and percentile.');
      return;
    }

    addMockTest({
      id: Date.now().toString(),
      name: form.name.trim(),
      date: form.date,
      physics: p,
      chemistry: c,
      maths: m,
      totalScore: total,
      predictedPercentile: perc
    });
    setForm(emptyForm());
  };

  const handleSetTargets = (e: React.FormEvent) => {
    e.preventDefault();
    setMockTargets(targetForm);
    alert('Goals Saved!');
  };

  const exportPDF = async () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFontSize(20);
      doc.text('JEE ZENITH 2026 - Progress Report', pageWidth / 2, 15, { align: 'center' });
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageWidth / 2, 22, { align: 'center' });

      let y = 30;

      // Summary
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Performance Summary', 20, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [['Metric', 'Value']],
        body: [
          ['Tests Taken', mockTests.length.toString()],
          ['Median Score', medianTotal?.toFixed(1) ?? 'N/A'],
          ['Median Percentile', medianPerc?.toFixed(2) ?? 'N/A']
        ],
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        margin: { left: 20, right: 20 }
      });
      y = (doc as any).lastAutoTable.finalY + 15;

      // Targets
      doc.setFontSize(14);
      doc.text('Target Goals', 20, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [['Goal', 'Target']],
        body: [
          ['Total Score', mockTargets?.score?.toString() || 'Not Set'],
          ['Percentile', mockTargets?.percentile ? mockTargets.percentile.toFixed(2) + '%' : 'Not Set'],
          ['Physics', mockTargets?.physics?.toString() || 'Not Set'],
          ['Chemistry', mockTargets?.chemistry?.toString() || 'Not Set'],
          ['Maths', mockTargets?.maths?.toString() || 'Not Set']
        ],
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246] },
        margin: { left: 20, right: 20 }
      });
      y = (doc as any).lastAutoTable.finalY + 15;

      // Charts (using html2canvas)
      if (chartsRef.current && mockTests.length > 0) {
        if (y > pageHeight - 100) { doc.addPage(); y = 20; }
        
        doc.setFontSize(14);
        doc.text('Performance Charts', 20, y);
        y += 6;

        const canvas = await html2canvas(chartsRef.current, { backgroundColor: '#1C1C1E', scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        // Calculate aspect ratio
        const imgWidth = 170;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        doc.addImage(imgData, 'PNG', 20, y, imgWidth, imgHeight);
        y += imgHeight + 15;
      }

      if (y > pageHeight - 50) { doc.addPage(); y = 20; }

      // History Table
      if (sortedMocks.length > 0) {
        doc.setFontSize(14);
        doc.text('Mock Test History', 20, y);
        y += 8;

        const historyBody = sortedMocks.slice().reverse().map(m => {
          const [minR, maxR] = getRankAnup2025(m.predictedPercentile);
          return [
            m.name,
            new Date(m.date).toLocaleDateString('en-IN'),
            m.physics.toString(),
            m.chemistry.toString(),
            m.maths.toString(),
            m.totalScore.toString(),
            m.predictedPercentile.toFixed(2) + '%',
            `${minR} – ${maxR}`
          ];
        });

        autoTable(doc, {
          startY: y,
          head: [['Paper', 'Date', 'P', 'C', 'M', 'Total', '%ile', 'Rank Range']],
          body: historyBody,
          theme: 'grid',
          headStyles: { fillColor: [79, 70, 229] },
          styles: { fontSize: 9 },
          margin: { left: 20, right: 20 }
        });
      }

      doc.save(`JEE_ZENITH_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error(e);
      alert('Failed to generate PDF. Make sure there are charts visible.');
    }
  };

  const chartData = sortedMocks.map(m => ({
    ...m,
    dateLabel: new Date(m.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  }));

  const tooltipStyle = {
    contentStyle: { background: 'var(--bg-secondary)', border: 'none', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' },
    labelStyle: { color: 'var(--label-primary)', fontWeight: 600 },
    itemStyle: { color: 'var(--label-secondary)' },
  };

  return (
    <div className="fade-in-up pb-10">
      <div className="page-header flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1>JEE ZENITH 2026</h1>
          <p>Your Complete Mock Analysis Dashboard</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setIsMinimized(!isMinimized)} className={`btn ${isMinimized ? 'btn-secondary' : 'btn-primary'}`}>
            {isMinimized ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            {isMinimized ? 'Show Dashboard' : 'Minimize Dashboard'}
          </button>
          <button onClick={exportPDF} className="btn btn-primary" style={{ background: 'var(--green)', color: '#fff' }}>
            <Download size={18} />
            Export to PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16, marginBottom: 32 }}>
        <div className="stat-tile text-center">
          <div className="stat-label">Total Tests</div>
          <div className="stat-value" style={{ color: 'var(--blue)' }}>{mockTests.length}</div>
        </div>
        <div className="stat-tile text-center">
          <div className="stat-label">Median Total</div>
          <div className="stat-value" style={{ color: 'var(--amber)' }}>{medianTotal?.toFixed(1) ?? 'N/A'}</div>
          <div style={{ fontSize: 13, color: 'var(--label-secondary)' }}>/ 300</div>
        </div>
        <div className="stat-tile text-center">
          <div className="stat-label">Median %ile</div>
          <div className="stat-value" style={{ color: 'var(--purple)' }}>{medianPerc?.toFixed(2) ?? 'N/A'}</div>
        </div>
        
        <div className="stat-tile text-center" style={{ borderTop: '4px solid var(--blue)' }}>
          <div className="stat-label">Physics Median</div>
          <div className="stat-value" style={{ color: 'var(--blue)' }}>{medianPhys?.toFixed(1) ?? 'N/A'}</div>
        </div>
        <div className="stat-tile text-center" style={{ borderTop: '4px solid var(--blue)' }}>
          <div className="stat-label">Physics High</div>
          <div className="stat-value" style={{ color: 'var(--blue)' }}>{physScores.length ? Math.max(...physScores) : 'N/A'}</div>
        </div>

        <div className="stat-tile text-center" style={{ borderTop: '4px solid var(--green)' }}>
          <div className="stat-label">Chem Median</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{medianChem?.toFixed(1) ?? 'N/A'}</div>
        </div>
        <div className="stat-tile text-center" style={{ borderTop: '4px solid var(--green)' }}>
          <div className="stat-label">Chem High</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{chemScores.length ? Math.max(...chemScores) : 'N/A'}</div>
        </div>

        <div className="stat-tile text-center" style={{ borderTop: '4px solid var(--red)' }}>
          <div className="stat-label">Maths Median</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>{medianMath?.toFixed(1) ?? 'N/A'}</div>
        </div>
        <div className="stat-tile text-center" style={{ borderTop: '4px solid var(--red)' }}>
          <div className="stat-label">Maths High</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>{mathScores.length ? Math.max(...mathScores) : 'N/A'}</div>
        </div>
      </div>

      <div className="mock-layout" style={{ gap: 24, alignItems: 'start' }}>
        
        {/* Left Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Add New Mock Result</h2>
            <form onSubmit={handleAddMock} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input required className="input" placeholder="Paper Name (e.g. 8 Apr S2)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <input required type="date" className="input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <input required type="number" min="0" max="100" className="input text-center" placeholder="Phy" value={form.physics} onChange={e => setForm({...form, physics: e.target.value})} />
                <input required type="number" min="0" max="100" className="input text-center" placeholder="Chem" value={form.chemistry} onChange={e => setForm({...form, chemistry: e.target.value})} />
                <input required type="number" min="0" max="100" className="input text-center" placeholder="Math" value={form.maths} onChange={e => setForm({...form, maths: e.target.value})} />
              </div>
              
              <div className="input text-center font-bold" style={{ background: 'var(--bg-tertiary)', color: 'var(--label-secondary)' }}>
                Total: {(Number(form.physics) || 0) + (Number(form.chemistry) || 0) + (Number(form.maths) || 0)}
              </div>
              
              <input required type="number" step="0.01" max="100" className="input text-center" placeholder="Percentile (e.g. 98.76)" value={form.predictedPercentile} onChange={e => setForm({...form, predictedPercentile: e.target.value})} />
              
              <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}><Plus size={16} /> Add Mock Result</button>
            </form>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Set Target Goals</h2>
            <form onSubmit={handleSetTargets} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input type="number" min="0" max="300" className="input text-center" placeholder="Target Total Score" value={targetForm.score || ''} onChange={e => setTargetForm({...targetForm, score: Number(e.target.value)})} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <input type="number" min="0" max="100" className="input text-center" placeholder="P" value={targetForm.physics || ''} onChange={e => setTargetForm({...targetForm, physics: Number(e.target.value)})} />
                <input type="number" min="0" max="100" className="input text-center" placeholder="C" value={targetForm.chemistry || ''} onChange={e => setTargetForm({...targetForm, chemistry: Number(e.target.value)})} />
                <input type="number" min="0" max="100" className="input text-center" placeholder="M" value={targetForm.maths || ''} onChange={e => setTargetForm({...targetForm, maths: Number(e.target.value)})} />
              </div>
              
              <input type="number" step="0.01" max="100" className="input text-center" placeholder="Target Percentile" value={targetForm.percentile || ''} onChange={e => setTargetForm({...targetForm, percentile: Number(e.target.value)})} />
              
              <button type="submit" className="btn btn-secondary" style={{ marginTop: 8 }}><Target size={16} /> Save Goals</button>
            </form>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Rank Prediction (2025 Data)</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--purple)' }}>Recent Mock</h3>
                {sortedMocks.length > 0 ? (
                  <>
                    <p style={{ fontSize: 14, color: 'var(--label-secondary)' }}>Percentile: <span style={{ color: 'var(--label-primary)', fontWeight: 'bold' }}>{sortedMocks[sortedMocks.length-1].predictedPercentile.toFixed(2)}%</span></p>
                    <div style={{ marginTop: 8, padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 8, fontWeight: 500 }}>
                      Rank: {getRankAnup2025(sortedMocks[sortedMocks.length-1].predictedPercentile).join(' – ')}
                    </div>
                  </>
                ) : <p style={{ fontSize: 14, color: 'var(--label-tertiary)' }}>No mocks added.</p>}
              </div>
              
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--green)' }}>Best Ever</h3>
                {percentiles.length > 0 ? (
                  <>
                    <p style={{ fontSize: 14, color: 'var(--label-secondary)' }}>Percentile: <span style={{ color: 'var(--label-primary)', fontWeight: 'bold' }}>{Math.max(...percentiles).toFixed(2)}%</span></p>
                    <div style={{ marginTop: 8, padding: '12px', background: 'var(--green)', color: 'white', borderRadius: 8, fontWeight: 'bold' }}>
                      Best Rank: {getRankAnup2025(Math.max(...percentiles)).join(' – ')}
                    </div>
                  </>
                ) : <p style={{ fontSize: 14, color: 'var(--label-tertiary)' }}>No mocks added.</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel / Charts */}
        <div style={{ display: isMinimized ? 'none' : 'flex', flexDirection: 'column', gap: 24 }} ref={chartsRef}>
          
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Total Score Progress</h2>
            <div style={{ fontSize: 13, color: 'var(--label-secondary)', marginBottom: 16 }}>
              Target → Total: <span style={{ color: 'var(--red)', fontWeight: 'bold' }}>{mockTargets?.score || 'N/A'}</span> | 
              P: <span style={{ color: 'var(--blue)', fontWeight: 'bold' }}>{mockTargets?.physics || 'N/A'}</span> | 
              C: <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>{mockTargets?.chemistry || 'N/A'}</span> | 
              M: <span style={{ color: 'var(--red)', fontWeight: 'bold' }}>{mockTargets?.maths || 'N/A'}</span>
            </div>
            
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--separator)" vertical={false} />
                  <XAxis dataKey="dateLabel" tick={{ fill: 'var(--label-tertiary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 300]} tick={{ fill: 'var(--label-tertiary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip {...tooltipStyle} />
                  <Legend />
                  <Line type="monotone" dataKey="totalScore" name="Total Score" stroke="var(--purple)" strokeWidth={3} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="physics" name="Physics" stroke="var(--blue)" strokeWidth={2} />
                  <Line type="monotone" dataKey="chemistry" name="Chemistry" stroke="var(--green)" strokeWidth={2} />
                  <Line type="monotone" dataKey="maths" name="Maths" stroke="var(--red)" strokeWidth={2} />
                  {mockTargets?.score > 0 && <ReferenceLine y={mockTargets.score} stroke="var(--red)" strokeDasharray="3 3" label={{ position: 'top', value: 'Target Total', fill: 'var(--red)', fontSize: 12 }} />}
                  {medianTotal && <ReferenceLine y={medianTotal} stroke="var(--cyan)" strokeDasharray="5 5" label={{ position: 'insideBottomRight', value: 'Median Total', fill: 'var(--cyan)', fontSize: 12 }} />}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
              Percentile Trend <span style={{ fontSize: 14, color: 'var(--label-secondary)' }}>(Target: <span style={{ color: 'var(--red)' }}>{mockTargets?.percentile || 'N/A'}%</span>)</span>
            </h2>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--separator)" vertical={false} />
                  <XAxis dataKey="dateLabel" tick={{ fill: 'var(--label-tertiary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[80, 100]} tick={{ fill: 'var(--label-tertiary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="predictedPercentile" name="Percentile" stroke="var(--amber)" strokeWidth={3} activeDot={{ r: 6 }} />
                  {mockTargets?.percentile > 0 && <ReferenceLine y={mockTargets.percentile} stroke="var(--red)" strokeDasharray="3 3" label={{ position: 'top', value: 'Target', fill: 'var(--red)', fontSize: 12 }} />}
                  {medianPerc && <ReferenceLine y={medianPerc} stroke="var(--cyan)" strokeDasharray="5 5" label={{ position: 'insideBottomRight', value: 'Median', fill: 'var(--cyan)', fontSize: 12 }} />}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            {[
              { key: 'physics', title: 'Physics', color: 'var(--blue)', target: mockTargets?.physics, median: medianPhys },
              { key: 'chemistry', title: 'Chemistry', color: 'var(--green)', target: mockTargets?.chemistry, median: medianChem },
              { key: 'maths', title: 'Maths', color: 'var(--red)', target: mockTargets?.maths, median: medianMath }
            ].map(sub => (
              <div key={sub.key} className="card" style={{ padding: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: sub.color, marginBottom: 16 }}>{sub.title}</h3>
                <div style={{ width: '100%', height: 200 }}>
                  <ResponsiveContainer>
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--separator)" vertical={false} />
                      <XAxis dataKey="dateLabel" tick={{ fill: 'var(--label-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: 'var(--label-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <RechartsTooltip {...tooltipStyle} />
                      <Line type="monotone" dataKey={sub.key} stroke={sub.color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                      {sub.target > 0 && <ReferenceLine y={sub.target} stroke={sub.color} strokeDasharray="3 3" />}
                      {sub.median && <ReferenceLine y={sub.median} stroke={sub.color} strokeDasharray="5 5" opacity={0.5} />}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </div>

      {/* History Table */}
      <div className="card" style={{ marginTop: 24, padding: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Mock Test History</h2>
        
        {sortedMocks.length === 0 ? (
          <div className="empty-state text-center" style={{ padding: 40 }}>
            <p style={{ color: 'var(--label-secondary)' }}>No mocks added yet. Start tracking now!</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--separator)' }}>
                  <th style={{ padding: '12px 8px', color: 'var(--label-secondary)', fontWeight: 500 }}>Paper</th>
                  <th style={{ padding: '12px 8px', color: 'var(--label-secondary)', fontWeight: 500 }}>Date</th>
                  <th style={{ padding: '12px 8px', color: 'var(--label-secondary)', fontWeight: 500, textAlign: 'center' }}>P</th>
                  <th style={{ padding: '12px 8px', color: 'var(--label-secondary)', fontWeight: 500, textAlign: 'center' }}>C</th>
                  <th style={{ padding: '12px 8px', color: 'var(--label-secondary)', fontWeight: 500, textAlign: 'center' }}>M</th>
                  <th style={{ padding: '12px 8px', color: 'var(--label-secondary)', fontWeight: 500, textAlign: 'center' }}>Total</th>
                  <th style={{ padding: '12px 8px', color: 'var(--label-secondary)', fontWeight: 500, textAlign: 'center' }}>Percentile</th>
                  <th style={{ padding: '12px 8px', color: 'var(--label-secondary)', fontWeight: 500, textAlign: 'center' }}>Rank Range</th>
                  <th style={{ padding: '12px 8px', color: 'var(--label-secondary)', fontWeight: 500, textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {sortedMocks.slice().reverse().map(m => {
                  const [minR, maxR] = getRankAnup2025(m.predictedPercentile);
                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid var(--separator)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 500 }}>{m.name}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--label-secondary)' }}>{new Date(m.date).toLocaleDateString('en-IN')}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>{m.physics}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>{m.chemistry}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>{m.maths}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 600, color: 'var(--purple)' }}>{m.totalScore}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 600, color: 'var(--amber)' }}>{m.predictedPercentile.toFixed(2)}%</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 500, color: 'var(--green)' }}>{minR} – {maxR}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <button onClick={() => removeMockTest(m.id)} className="btn btn-sm btn-icon" style={{ color: 'var(--red)', background: 'transparent' }} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
