const { useState, useEffect, useRef, useCallback, useMemo } = React;


const BANCOS_INICIAL = [
  "Mercado Pago - Nicole","Mercado Pago - Luís","Santander",
  "iFood Pago - Tijuca","iFood Pago - Higienópolis","C6",
  "Alelo (PicPay)","Caixinha","Pluxee (Mercado Pago - Luis)","99Food (Mercado Pago - Luis)"
];

const TIPOS_DOCTO = ["Boleto","Fatura","NF","Transferência","Débito Automático","PIX",
  "Link de Pagamento","Repasse de Plataforma","Extrato financeiro iFood","Extrato financeiro 99Food","Cartão de Crédito"];

const CAT_RECEITA_INICIAL = {
  "Receita com CNPJ 50.166.828": ["iFood Bolos - Higienópolis","Delivery Próprio","Notas do Mercadinho"],
  "Receita com CNPJ 48.659.129": ["iFood Tijuca","99Food","Delivery próprio","Alelo","Pluxee"],
  "Receita com CNPJ 51.295.630": ["iFood Higienópolis","99Food","Alelo","Pluxee"],
  "Outras Receitas 2": [],
  "Outras Receitas 3": [],
  "Receitas Financeiras": ["Receitas Financeiras","Juros de Aplicações"]
};

const CAT_DESPESA_INICIAL = {
  "Custos Variáveis": ["Mercadoria para Revenda","Matéria-prima","Insumos","Embalagens",
    "Pedidos cancelados","Taxa de processamento Pik n Pak","Utensílios","Taxas de entrega",
    "Pedágio","Cartão de Crédito - C6"],
  "Despesas com Ocupação": ["Água","Aluguel ateliê","Condomínio","Telefone + Internet",
    "IPTU","Limpeza e Conservação","Energia Elétrica","Aluguel Pik n' Pak","Seguro predial"],
  "Despesas com Serviços": ["Contabilidade","Publicidade e Propaganda","Serviços Jurídicos",
    "Webdesigner","Designer","Serviços de TI","Abrasel"],
  "Despesas com Pessoal": ["Salários","Folha de Pagamento","Vale Transporte","Vale Refeição",
    "Assistência Médica","Assistência Odonto","INSS","FGTS"],
  "Deduções sobre Vendas": ["DAS - Simples Nacional","PIS","COFINS","ISS","IPI","ICMS","Comissões"],
  "Despesas com Manutenção": ["Conserto do Forno","Troca do vaso sanitário","Melhorias na Loja"],
  "Despesas com Taxas": ["iFood - Higienópolis","iFood Bolos - Higienópolis","iFood - Tijuca",
    "99Food - Higienópolis","99Food - Tijuca","Antecipação Alelo Tijuca","Antecipação Pluxee - Tijuca",
    "Link de Pagamento - 50.166.828","Link de Pagamento - 48.659.129","Boleto - 50.166.828",
    "Antecipação iFood TJK - 48.659.129","Antecipação iFood HG - 50.166.828",
    "Taxa e Comissões iFood TJK - 48.659.129","Incentivos da Loja TJK - 48.659.129",
    "Taxa de entrega TJK - 48.659.129","Comissão e distribuição 99 - 48.659.129",
    "Processamento 99Food - 48.659.129","Custos Logísticos 99Food - 48.659.129",
    "Custos Logísticos da Loja 99Food - 48.659.129"],
  "Despesas Financeiras": ["Taxas Bancárias","Taxa TED/DOC","Juros por atraso"],
  "Investimentos": ["Máquinas","Móveis","Veículos","Imóveis"]
};



const TRANSFERENCIAS_INICIAIS = [
  {id:1,data:"2026-03-04",saidoBanco:"Mercado Pago - Luís",entrouBanco:"Mercado Pago - Nicole",valor:488.73},
  {id:2,data:"2026-03-03",saidoBanco:"Mercado Pago - Luís",entrouBanco:"Mercado Pago - Nicole",valor:150.17},
];

const SALDOS_INICIAIS_DEFAULT = {
  data: "2026-03-01",
  contas: {
    "Mercado Pago - Nicole": 2188.42,
    "Mercado Pago - Luís": 100.77,
    "Santander": 5,
    "iFood Pago - Tijuca": 0,
    "iFood Pago - Higienópolis": 0,
    "C6": 0,
    "Alelo (PicPay)": 0,
    "Caixinha": 6062.51,
    "Pluxee (Mercado Pago - Luis)": 0,
    "99Food (Mercado Pago - Luis)": 0,
  }
};

const FORNECEDORES_INICIAIS = [];

const METAS_INICIAIS = {
  ano: new Date().getFullYear(),
  receitas: {},
  despesas: {},
};

const today = () => new Date().toISOString().slice(0, 10);
const fmt = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (d) => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "";

const iStyle = { padding: "8px 10px", borderRadius: 8, border: "1.5px solid #2d2640", background: "#1a1628", color: "#f0e8ff", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };

function FInput({ label, value, onChange, type = "text", placeholder, required }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 600, color: "#8a7fa0", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}{required && <span style={{ color: "#e85d8a" }}> *</span>}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={iStyle} onFocus={e => e.target.style.borderColor = "#c084fc"} onBlur={e => e.target.style.borderColor = "#2d2640"} />
    </div>
  );
}

function FSel({ label, value, onChange, options, required }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 600, color: "#8a7fa0", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}{required && <span style={{ color: "#e85d8a" }}> *</span>}</label>}
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ ...iStyle, cursor: "pointer", color: value ? "#f0e8ff" : "#6b5f80" }}
        onFocus={e => e.target.style.borderColor = "#c084fc"} onBlur={e => e.target.style.borderColor = "#2d2640"}>
        <option value="">Selecionar...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Badge({ color, children }) {
  const c = { green: ["#0d2e1a","#4ade80","#166534"], red: ["#2e0d1a","#f87171","#7f1d1d"], blue: ["#0d1a2e","#60a5fa","#1e3a5f"], purple: ["#1a0d2e","#c084fc","#4c1d95"] }[color] || ["#1a0d2e","#c084fc","#4c1d95"];
  return <span style={{ background: c[0], color: c[1], border: `1px solid ${c[2]}`, padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{children}</span>;
}

function Btn({ children, onClick, color = "purple", ghost, small }) {
  const bg = { purple: "linear-gradient(135deg,#7c3aed,#6d28d9)", green: "linear-gradient(135deg,#22c55e,#16a34a)", red: "linear-gradient(135deg,#ef4444,#dc2626)", blue: "linear-gradient(135deg,#6366f1,#4f46e5)" };
  return (
    <button onClick={onClick} style={{ padding: small ? "5px 11px" : "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: small ? 12 : 13, fontWeight: 600, background: ghost ? "none" : bg[color], border: ghost ? "1.5px solid #2d2640" : "none", color: ghost ? "#8a7fa0" : "#fff" }}>
      {children}
    </button>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#13101e", border: "1.5px solid #2d2640", borderRadius: 16, padding: 24, width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: "#f0e8ff", fontSize: 17, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#8a7fa0", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ReceitaForm({ onSave, onCancel, initial, catReceita, catDespesa, bancos, tiposDocto }) {
  const [f, setF] = useState(initial || { data: today(), documento: "PIX", plano: "", conta: "", tipo: "Parcelas", descricao: "", banco: "", bancOrigem: "", valor: "", parcelas: "1 de 1", vencimento: today(), recebimento: today() });
  // Descontos: [{ id, tipo, plano, conta, valor }]
  const [descontos, setDescontos] = useState(initial?.descontos || [{ id: Date.now(), tipo: "", plano: "", conta: "", valor: "" }]);

  const set = k => v => setF(p => ({ ...p, [k]: v }));
  const subs = f.plano ? (catReceita[f.plano] || []) : [];
  const isTransf = f.documento === "Transferência";

  const addDesconto = () => setDescontos(ds => [...ds, { id: Date.now(), tipo: "", plano: "", conta: "", valor: "" }]);
  const removeDesconto = (id) => setDescontos(ds => ds.filter(d => d.id !== id));
  const setDesc = (id, k, v) => setDescontos(ds => ds.map(d => d.id === id ? { ...d, [k]: v, ...(k==="plano"?{conta:""}:{}) } : d));

  const totalDescontos = descontos.reduce((s,d) => s + (parseFloat(String(d.valor).replace(",",".")) || 0), 0);
  const valorLiq = (parseFloat(String(f.valor).replace(",",".")) || 0) - totalDescontos;

  const isMob2 = typeof window !== "undefined" && window.innerWidth < 768;
  return (
    <div style={{ display: "grid", gridTemplateColumns: isMob2 ? "1fr" : "1fr 1fr", gap: 12 }}>
      <FInput label="Data do Documento" type="date" value={f.data} onChange={set("data")} required />
      <FSel label="Tipo de Documento" value={f.documento} onChange={set("documento")} options={tiposDocto || TIPOS_DOCTO} required />
      <div style={{ gridColumn: "1/-1" }}><FSel label="Plano de Conta" value={f.plano} onChange={v => setF(p => ({ ...p, plano: v, conta: "" }))} options={Object.keys(catReceita)} required /></div>
      {subs.length > 0 && <div style={{ gridColumn: "1/-1" }}><FSel label="Conta" value={f.conta} onChange={set("conta")} options={subs} /></div>}

      {isTransf ? (
        <>
          <FSel label="🏦 Saiu do Banco (origem)" value={f.bancOrigem || ""} onChange={set("bancOrigem")} options={bancos} />
          <FSel label="🏦 Entrou no Banco (destino)" value={f.banco} onChange={set("banco")} options={bancos} required />
        </>
      ) : (
        <FSel label="Banco Recebedor" value={f.banco} onChange={set("banco")} options={bancos} required />
      )}

      <FSel label="Tipo" value={f.tipo} onChange={set("tipo")} options={["Parcelas","Recorrente"]} />
      <FInput label="Valor Bruto (R$)" type="number" value={f.valor} onChange={set("valor")} placeholder="0,00" required />
      <FInput label="Parcelas" value={f.parcelas} onChange={set("parcelas")} placeholder="1 de 1" />
      <FInput label="Vencimento" type="date" value={f.vencimento} onChange={set("vencimento")} />
      <FInput label="Recebimento" type="date" value={f.recebimento} onChange={set("recebimento")} />
      <div style={{ gridColumn: "1/-1" }}><FInput label="Descrição" value={f.descricao} onChange={set("descricao")} placeholder="Descreva o lançamento..." /></div>

      {/* Seção de descontos */}
      <div style={{ gridColumn: "1/-1", background:"#0d0b15", border:"1.5px solid #2d2640", borderRadius:10, padding:"12px 14px", display:"flex", flexDirection:"column", gap:8 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <span style={{ fontSize:11, fontWeight:800, color:"#f59e0b", textTransform:"uppercase", letterSpacing:"0.06em" }}>💸 Descontos / Deduções</span>
            <span style={{ fontSize:10, color:"#4a3f60", marginLeft:8 }}>Taxas deduzidas desta receita (serão criadas como despesas)</span>
          </div>
          <button onClick={addDesconto}
            style={{ fontSize:11, fontWeight:700, background:"#1c1400", border:"1px solid #92400e", borderRadius:6, color:"#f59e0b", cursor:"pointer", padding:"3px 10px" }}>
            + Adicionar
          </button>
        </div>

        {descontos.map((d, di) => {
          const contaOpts = catDespesa ? (catDespesa[d.plano] || []) : [];
          return (
            <div key={d.id} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 80px auto", gap:6, alignItems:"flex-end", background:"#130f1e", borderRadius:8, padding:"8px 10px", border:"1px solid #1e1a2e" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                <label style={{ fontSize:9, color:"#6b5f80", fontWeight:600, textTransform:"uppercase" }}>Tipo de desconto</label>
                <input value={d.tipo} onChange={e => setDesc(d.id,"tipo",e.target.value)}
                  placeholder="Ex: Comissão, Taxa..." style={{ ...iStyle, fontSize:11, padding:"5px 8px" }} />
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                <label style={{ fontSize:9, color:"#6b5f80", fontWeight:600, textTransform:"uppercase" }}>Plano de Conta</label>
                <select value={d.plano} onChange={e => setDesc(d.id,"plano",e.target.value)}
                  style={{ ...iStyle, fontSize:11, padding:"5px 8px", cursor:"pointer" }}>
                  <option value="">Selecionar...</option>
                  {catDespesa && Object.keys(catDespesa).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                <label style={{ fontSize:9, color:"#6b5f80", fontWeight:600, textTransform:"uppercase" }}>Subcategoria</label>
                <select value={d.conta} onChange={e => setDesc(d.id,"conta",e.target.value)}
                  style={{ ...iStyle, fontSize:11, padding:"5px 8px", cursor:"pointer" }} disabled={!d.plano}>
                  <option value="">Selecionar...</option>
                  {contaOpts.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                <label style={{ fontSize:9, color:"#6b5f80", fontWeight:600, textTransform:"uppercase" }}>Valor (R$)</label>
                <input value={d.valor} onChange={e => setDesc(d.id,"valor",e.target.value)}
                  placeholder="0,00" style={{ ...iStyle, fontSize:11, padding:"5px 8px", textAlign:"right" }} />
              </div>
              <button onClick={() => removeDesconto(d.id)}
                style={{ background:"none", border:"1px solid #7f1d1d", borderRadius:6, color:"#f87171", cursor:"pointer", padding:"5px 8px", fontSize:12, alignSelf:"flex-end" }}>
                🗑
              </button>
            </div>
          );
        })}

        {totalDescontos > 0 && (
          <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 10px", background:"#1a1000", borderRadius:6, border:"1px solid #92400e" }}>
            <span style={{ fontSize:11, color:"#f59e0b" }}>Total de descontos: <strong>{fmt(totalDescontos)}</strong></span>
            <span style={{ fontSize:11, color:"#c084fc" }}>Valor líquido: <strong>{fmt(Math.max(0, valorLiq))}</strong></span>
          </div>
        )}
      </div>

      {isTransf && (f.bancOrigem || f.banco) && (
        <div style={{ gridColumn: "1/-1", background:"#1a1628", border:"1px solid #2d2640", borderRadius:8, padding:"8px 14px", display:"flex", alignItems:"center", gap:10, fontSize:12 }}>
          <span style={{ color:"#f87171" }}>↑ {f.bancOrigem || "—"}</span>
          <span style={{ color:"#4a3f60" }}>→</span>
          <span style={{ color:"#f59e0b" }}>↓ {f.banco || "—"}</span>
        </div>
      )}

      <div style={{ gridColumn: "1/-1", display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
        <Btn ghost onClick={onCancel}>Cancelar</Btn>
        <Btn color="green" onClick={() => onSave({ ...f, descontos: descontos.filter(d => parseFloat(String(d.valor).replace(",",".")) > 0) })}>Salvar Receita</Btn>
      </div>
    </div>
  );
}

function DespesaForm({ onSave, onCancel, initial, catDespesa, bancos, tiposDocto }) {
  const [f, setF] = useState(initial || { data: today(), documento: "PIX", plano: "", conta: "", tipo: "Parcelas", descricao: "", banco: "", bancDestino: "", valor: "", parcelas: "1 de 1", vencimento: today(), pagamento: today() });
  const set = k => v => setF(p => ({ ...p, [k]: v }));
  const subs = f.plano ? (catDespesa[f.plano] || []) : [];
  const isTransf = f.documento === "Transferência";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <FInput label="Data do Documento" type="date" value={f.data} onChange={set("data")} required />
      <FSel label="Tipo de Documento" value={f.documento} onChange={set("documento")} options={tiposDocto || TIPOS_DOCTO} required />
      <div style={{ gridColumn: "1/-1" }}><FSel label="Plano de Conta" value={f.plano} onChange={v => setF(p => ({ ...p, plano: v, conta: "" }))} options={Object.keys(catDespesa)} required /></div>
      {subs.length > 0 && <div style={{ gridColumn: "1/-1" }}><FSel label="Conta" value={f.conta} onChange={set("conta")} options={subs} /></div>}

      {/* Quando for Transferência: mostrar banco de origem e banco de destino */}
      {isTransf ? (
        <>
          <FSel label="🏦 Saiu do Banco (origem)" value={f.banco} onChange={set("banco")} options={bancos} required />
          <FSel label="🏦 Entrou no Banco (destino)" value={f.bancDestino || ""} onChange={set("bancDestino")} options={bancos} />
        </>
      ) : (
        <FSel label="Banco Pagador" value={f.banco} onChange={set("banco")} options={bancos} required />
      )}

      <FSel label="Tipo" value={f.tipo} onChange={set("tipo")} options={["Parcelas","Recorrente"]} />
      <FInput label="Valor (R$)" type="number" value={f.valor} onChange={set("valor")} placeholder="0,00" required />
      <FInput label="Parcelas" value={f.parcelas} onChange={set("parcelas")} placeholder="1 de 1" />
      <FInput label="Vencimento" type="date" value={f.vencimento} onChange={set("vencimento")} />
      <FInput label="Pagamento" type="date" value={f.pagamento} onChange={set("pagamento")} />
      <div style={{ gridColumn: "1/-1" }}><FInput label="Descrição" value={f.descricao} onChange={set("descricao")} placeholder="Descreva o lançamento..." /></div>

      {/* Resumo visual da transferência */}
      {isTransf && (f.banco || f.bancDestino) && (
        <div style={{ gridColumn: "1/-1", background:"#1a1628", border:"1px solid #2d2640", borderRadius:8, padding:"8px 14px", display:"flex", alignItems:"center", gap:10, fontSize:12 }}>
          <span style={{ color:"#f87171" }}>↑ {f.banco || "—"}</span>
          <span style={{ color:"#4a3f60" }}>→</span>
          <span style={{ color:"#4ade80" }}>↓ {f.bancDestino || "—"}</span>
        </div>
      )}

      <div style={{ gridColumn: "1/-1", display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
        <Btn ghost onClick={onCancel}>Cancelar</Btn>
        <Btn color="red" onClick={() => onSave(f)}>Salvar Despesa</Btn>
      </div>
    </div>
  );
}

function TransfForm({ onSave, onCancel, bancos }) {
  const [f, setF] = useState({ data: today(), saidoBanco: "", entrouBanco: "", valor: "" });
  const set = k => v => setF(p => ({ ...p, [k]: v }));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <div style={{ gridColumn: "1/-1" }}><FInput label="Data" type="date" value={f.data} onChange={set("data")} required /></div>
      <FSel label="Saiu do Banco" value={f.saidoBanco} onChange={set("saidoBanco")} options={bancos} required />
      <FSel label="Entrou no Banco" value={f.entrouBanco} onChange={set("entrouBanco")} options={bancos} required />
      <div style={{ gridColumn: "1/-1" }}><FInput label="Valor (R$)" type="number" value={f.valor} onChange={set("valor")} placeholder="0,00" required /></div>
      <div style={{ gridColumn: "1/-1", display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
        <Btn ghost onClick={onCancel}>Cancelar</Btn>
        <Btn color="blue" onClick={() => onSave(f)}>Salvar Transferência</Btn>
      </div>
    </div>
  );
}

// ── Sub-item editável ──
function SubItem({ sub, accent, onDelete, onRename }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(sub);
  const confirm = () => { onRename(val.trim()); setEditing(false); };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", background: "#0e0c18", borderRadius: 6 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: accent + "70", flexShrink: 0 }} />
      {editing
        ? <input autoFocus value={val} onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") confirm(); if (e.key === "Escape") { setVal(sub); setEditing(false); } }}
            style={{ ...iStyle, flex: 1, fontSize: 12, padding: "3px 8px" }} />
        : <span style={{ flex: 1, fontSize: 12, color: "#c8b8e8" }}>{sub}</span>
      }
      {editing ? (
        <>
          <button onClick={confirm} style={{ background: "none", border: "none", cursor: "pointer", color: accent, fontSize: 14 }}>✓</button>
          <button onClick={() => { setVal(sub); setEditing(false); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b5f80", fontSize: 14 }}>✕</button>
        </>
      ) : (
        <>
          <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b5f80", fontSize: 11 }}>✏️</button>
          <button onClick={onDelete} style={{ background: "none", border: "none", cursor: "pointer", color: "#f87171", fontSize: 11 }}>🗑</button>
        </>
      )}
    </div>
  );
}

// ── Seção de configuração (receita / despesa) ──
function ConfigSection({ title, color, data, onUpdate }) {
  const [open, setOpen] = useState(null);
  const [newCat, setNewCat] = useState("");
  const [newSub, setNewSub] = useState({});
  const [renamingCat, setRenamingCat] = useState(null);
  const [renameVal, setRenameVal] = useState("");

  const accent = color === "green" ? "#4ade80" : "#f87171";
  const borderAlt = color === "green" ? "#166534" : "#7f1d1d";
  const bgAlt = color === "green" ? "#071a0d" : "#1a0707";
  const btnColor = color === "green" ? "green" : "red";

  const addCat = () => {
    const n = newCat.trim(); if (!n || data[n]) return;
    onUpdate({ ...data, [n]: [] }); setNewCat("");
  };
  const delCat = (cat) => { const d = { ...data }; delete d[cat]; onUpdate(d); if (open === cat) setOpen(null); };
  const startRename = (cat) => { setRenamingCat(cat); setRenameVal(cat); };
  const confirmRename = (cat) => {
    const n = renameVal.trim(); if (!n || n === cat || data[n]) { setRenamingCat(null); return; }
    const d = {}; for (const [k, v] of Object.entries(data)) d[k === cat ? n : k] = v;
    onUpdate(d); if (open === cat) setOpen(n); setRenamingCat(null);
  };
  const addSub = (cat) => {
    const n = (newSub[cat] || "").trim(); if (!n || data[cat].includes(n)) return;
    onUpdate({ ...data, [cat]: [...data[cat], n] });
    setNewSub(p => ({ ...p, [cat]: "" }));
  };
  const delSub = (cat, sub) => onUpdate({ ...data, [cat]: data[cat].filter(s => s !== sub) });
  const renameSub = (cat, old, nv) => {
    if (!nv || nv === old) return;
    onUpdate({ ...data, [cat]: data[cat].map(s => s === old ? nv : s) });
  };

  return (
    <div style={{ background: "#13101e", border: "1.5px solid #2d2640", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #2d2640", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: accent, display: "inline-block" }} />
        <span style={{ fontWeight: 700, fontSize: 14, color: "#f0e8ff" }}>{title}</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#6b5f80" }}>{Object.keys(data).length} categorias</span>
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Add category */}
        <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
          <input value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === "Enter" && addCat()}
            placeholder="Nova categoria..." style={{ ...iStyle, flex: 1, fontSize: 12, padding: "7px 10px" }} />
          <Btn small color={btnColor} onClick={addCat}>+ Adicionar</Btn>
        </div>

        {Object.entries(data).map(([cat, subs]) => (
          <div key={cat} style={{ background: bgAlt, border: `1px solid ${borderAlt}30`, borderRadius: 10, overflow: "hidden" }}>
            {/* Category row */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", cursor: "pointer", userSelect: "none" }}
              onClick={() => setOpen(open === cat ? null : cat)}>
              <span style={{ color: "#8a7fa0", fontSize: 11 }}>{open === cat ? "▾" : "▸"}</span>
              {renamingCat === cat
                ? <input autoFocus value={renameVal} onChange={e => setRenameVal(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") confirmRename(cat); if (e.key === "Escape") setRenamingCat(null); }}
                    onClick={e => e.stopPropagation()} style={{ ...iStyle, flex: 1, fontSize: 13, padding: "4px 8px" }} />
                : <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#e0d4f5" }}>{cat}</span>
              }
              <span style={{ fontSize: 11, color: "#6b5f80" }}>{subs.length}</span>
              <div onClick={e => e.stopPropagation()} style={{ display: "flex", gap: 2 }}>
                {renamingCat === cat ? (
                  <>
                    <button onClick={() => confirmRename(cat)} style={{ background: "none", border: "none", cursor: "pointer", color: accent, fontSize: 14, padding: "2px 5px" }}>✓</button>
                    <button onClick={() => setRenamingCat(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b5f80", fontSize: 14, padding: "2px 5px" }}>✕</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startRename(cat)} title="Renomear" style={{ background: "none", border: "none", cursor: "pointer", color: "#6b5f80", fontSize: 12, padding: "2px 6px" }}>✏️</button>
                    <button onClick={() => delCat(cat)} title="Excluir" style={{ background: "none", border: "none", cursor: "pointer", color: "#f87171", fontSize: 12, padding: "2px 6px" }}>🗑</button>
                  </>
                )}
              </div>
            </div>
            {/* Subs */}
            {open === cat && (
              <div style={{ borderTop: `1px solid ${borderAlt}30`, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 5 }}>
                {subs.length === 0 && <p style={{ margin: 0, fontSize: 12, color: "#6b5f80", fontStyle: "italic" }}>Sem itens ainda.</p>}
                {subs.map(sub => (
                  <SubItem key={sub} sub={sub} accent={accent} onDelete={() => delSub(cat, sub)} onRename={nv => renameSub(cat, sub, nv)} />
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <input value={newSub[cat] || ""} onChange={e => setNewSub(p => ({ ...p, [cat]: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && addSub(cat)} placeholder="Novo item..."
                    style={{ ...iStyle, flex: 1, fontSize: 12, padding: "6px 10px" }} />
                  <Btn small color={btnColor} onClick={() => addSub(cat)}>+</Btn>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SALDO ATUAL POR CONTA CONFIG ─────────────────────────────────────────────
function SaldoAtualConfig({ saldos, bancos, receitas, despesas, transferencias }) {
  // Apenas contas configuradas em "Comece Aqui" (saldos.contas)
  const contasConfig = Object.keys(saldos.contas || {});
  if (contasConfig.length === 0) return (
    <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, padding:"14px 16px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
        <span style={{ width:8, height:8, borderRadius:"50%", background:"#fbbf24", display:"inline-block" }} />
        <span style={{ fontWeight:700, fontSize:14, color:"#f0e8ff" }}>Saldo Atual por Conta</span>
      </div>
      <div style={{ fontSize:12, color:"#4a3f60", padding:"16px 0" }}>
        Nenhuma conta configurada. Cadastre os saldos iniciais em <strong style={{color:"#c084fc"}}>Comece Aqui</strong> acima.
      </div>
    </div>
  );

  // Inclui TODOS os lançamentos (iFood, 99Food e extrato bancário)
  const contas = contasConfig.map(banco => {
    const si   = Number(saldos.contas[banco] || 0);
    const ent  = receitas.filter(r => r.banco === banco).reduce((s,r) => s + Number(r.valor||0), 0);
    const sai  = despesas.filter(d => d.banco === banco).reduce((s,d) => s + Number(d.valor||0), 0);
    const tin  = transferencias.filter(t => (t.entrouBanco||t.entroubanco) === banco).reduce((s,t) => s + Number(t.valor||0), 0);
    const tout = transferencias.filter(t => (t.saidoBanco||t.saidobanco) === banco).reduce((s,t) => s + Number(t.valor||0), 0);
    return { banco, si, ent, sai, tin, tout, saldoAtual: si + ent - sai + tin - tout };
  });

  const total = contas.reduce((s,c) => s + c.saldoAtual, 0);
  const maxAbs = Math.max(...contas.map(c => Math.abs(c.saldoAtual)), 1);

  return (
    <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, overflow:"hidden" }}>
      {/* Header */}
      <div style={{ padding:"14px 16px", borderBottom:"1px solid #2d2640", display:"flex", justifyContent:"space-between", alignItems:"center", background:"linear-gradient(90deg,#100e1b,#13101e)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:"#fbbf24", display:"inline-block" }} />
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:"#f0e8ff" }}>Saldo Atual por Conta</div>
            <div style={{ fontSize:10, color:"#6b5f80", marginTop:1 }}>Saldo inicial + entradas − saídas ± transferências</div>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:9, color:"#6b5f80", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:2 }}>Total</div>
          <div style={{ fontSize:20, fontWeight:900, color: total >= 0 ? "#fbbf24" : "#f87171" }}>{fmt(total)}</div>
        </div>
      </div>

      {/* Header da tabela */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 90px 90px 100px 120px", padding:"7px 16px", background:"#0d0b15", borderBottom:"1px solid #1a1628" }}>
        {["Conta","Inicial","Entradas","Saídas","Transf.","Saldo Atual"].map((h, i) => (
          <div key={h} style={{ fontSize:9, fontWeight:800, color:"#4a3f60", textTransform:"uppercase", letterSpacing:"0.07em", textAlign: i===0 ? "left" : "right" }}>{h}</div>
        ))}
      </div>

      {/* Linhas — apenas contas de Configurações */}
      {contas.map((c, ci) => {
        const pct = maxAbs > 0 ? (Math.abs(c.saldoAtual) / maxAbs * 100) : 0;
        const pos = c.saldoAtual >= 0;
        return (
          <div key={c.banco} style={{ borderBottom:"1px solid #13101e" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 90px 90px 100px 120px",
              padding:"11px 16px", background: ci%2===0 ? "#0d0b15" : "#100e1b", alignItems:"center" }}>
              <div style={{ fontSize:12, fontWeight:600, color:"#c8b8e8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.banco}</div>
              <div style={{ textAlign:"right", fontSize:11, color:"#8a7fa0" }}>{c.si ? fmt(c.si) : "—"}</div>
              <div style={{ textAlign:"right", fontSize:11, color: c.ent>0 ? "#4ade80" : "#4a3f60" }}>{c.ent>0 ? "+"+fmt(c.ent) : "—"}</div>
              <div style={{ textAlign:"right", fontSize:11, color: c.sai>0 ? "#f87171" : "#4a3f60" }}>{c.sai>0 ? "-"+fmt(c.sai) : "—"}</div>
              <div style={{ textAlign:"right", fontSize:11, color: (c.tin-c.tout)!==0 ? "#818cf8" : "#4a3f60" }}>
                {(c.tin-c.tout)!==0 ? ((c.tin-c.tout)>0?"+":"")+fmt(c.tin-c.tout) : "—"}
              </div>
              <div style={{ textAlign:"right", fontSize:14, fontWeight:900, color: pos ? "#fbbf24" : "#f87171" }}>{fmt(c.saldoAtual)}</div>
            </div>
            <div style={{ height:3, background:"#0a0814", margin:"0 16px" }}>
              <div style={{ height:"100%", width:`${pct}%`, background: pos
                ? "linear-gradient(90deg,#d97706,#fbbf24)"
                : "linear-gradient(90deg,#991b1b,#f87171)",
                borderRadius:"0 99px 99px 0", transition:"width 0.5s ease" }}/>
            </div>
          </div>
        );
      })}

      {/* Rodapé */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 90px 90px 100px 120px",
        padding:"11px 16px", background:"#1a1628", borderTop:"1.5px solid #2d2640" }}>
        <div style={{ fontSize:11, fontWeight:800, color:"#6b5f80", textTransform:"uppercase" }}>TOTAL</div>
        <div style={{ textAlign:"right", fontSize:11, fontWeight:700, color:"#8a7fa0" }}>{fmt(contas.reduce((s,c)=>s+c.si,0))}</div>
        <div style={{ textAlign:"right", fontSize:11, fontWeight:700, color:"#4ade80" }}>+{fmt(contas.reduce((s,c)=>s+c.ent,0))}</div>
        <div style={{ textAlign:"right", fontSize:11, fontWeight:700, color:"#f87171" }}>-{fmt(contas.reduce((s,c)=>s+c.sai,0))}</div>
        <div style={{ textAlign:"right", fontSize:11, fontWeight:700, color:"#818cf8" }}>—</div>
        <div style={{ textAlign:"right", fontSize:16, fontWeight:900, color: total>=0?"#fbbf24":"#f87171" }}>{fmt(total)}</div>
      </div>
    </div>

  );
}


function SaldosConfig({ saldos, onUpdate, bancos }) {
  const [editData, setEditData] = useState(saldos.data);
  const [saved, setSaved] = useState(false);

  const setValor = (banco, valor) => {
    onUpdate({ ...saldos, contas: { ...saldos.contas, [banco]: valor === "" ? "" : Number(valor) } });
  };

  const saveData = () => {
    onUpdate({ ...saldos, data: editData });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const total = Object.values(saldos.contas).reduce((s, v) => s + Number(v || 0), 0);

  return (
    <div style={{ background: "#13101e", border: "1.5px solid #f59e0b40", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #2d2640", background: "linear-gradient(135deg, #1c1505, #13101e)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🚀</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#fbbf24" }}>Comece Aqui — Saldo Inicial</div>
            <div style={{ fontSize: 12, color: "#8a7fa0", marginTop: 2 }}>Informe o saldo que você tinha em cada conta na data de início</div>
          </div>
        </div>
      </div>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#8a7fa0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            📅 Data do Saldo Inicial
          </label>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input type="date" value={editData} onChange={e => setEditData(e.target.value)}
              style={{ ...iStyle, maxWidth: 200 }}
              onFocus={e => e.target.style.borderColor = "#f59e0b"}
              onBlur={e => e.target.style.borderColor = "#2d2640"} />
            <button onClick={saveData}
              style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: saved ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#d97706,#b45309)", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
              {saved ? "✓ Salvo!" : "Salvar data"}
            </button>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: "#6b5f80" }}>
            Esta é a data de referência — aparece no Dashboard como ponto de partida.
          </p>
        </div>

        <div style={{ borderTop: "1px solid #2d2640" }} />

        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#8a7fa0", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 12 }}>
            💰 Saldo por Conta / Banco
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {bancos.map(banco => (
              <div key={banco} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 11, color: "#8a7fa0", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={banco}>
                  {banco}
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#6b5f80", pointerEvents: "none" }}>R$</span>
                  <input type="number" step="0.01"
                    value={saldos.contas[banco] ?? ""}
                    onChange={e => setValor(banco, e.target.value)}
                    placeholder="0,00"
                    style={{ ...iStyle, paddingLeft: 30, fontSize: 13 }}
                    onFocus={e => e.target.style.borderColor = "#f59e0b"}
                    onBlur={e => e.target.style.borderColor = "#2d2640"} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#1c1505", border: "1.5px solid #f59e0b40", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#c8b8e8", fontWeight: 600 }}>
            Total em caixa em {new Date(saldos.data + "T12:00:00").toLocaleDateString("pt-BR")}
          </span>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#fbbf24" }}>{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── TIPOS DE DOCUMENTO CONFIG ────────────────────────────────────────────────
function TiposDoctoConfig({ tiposDocto, onUpdate }) {
  const [novo, setNovo] = useState("");
  const [editando, setEditando] = useState(null);
  const [editVal, setEditVal] = useState("");

  const add = () => {
    const v = novo.trim();
    if (!v || tiposDocto.includes(v)) return;
    onUpdate([...tiposDocto, v]);
    setNovo("");
  };

  const remove = (t) => onUpdate(tiposDocto.filter(x => x !== t));

  const startEdit = (t) => { setEditando(t); setEditVal(t); };

  const saveEdit = () => {
    const v = editVal.trim();
    if (!v || (v !== editando && tiposDocto.includes(v))) { setEditando(null); return; }
    onUpdate(tiposDocto.map(x => x === editando ? v : x));
    setEditando(null);
  };

  return (
    <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, overflow:"hidden" }}>
      <div style={{ padding:"14px 16px", borderBottom:"1px solid #2d2640", display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ width:8, height:8, borderRadius:"50%", background:"#f59e0b", display:"inline-block" }} />
        <span style={{ fontWeight:700, fontSize:14, color:"#f0e8ff" }}>Tipos de Documento</span>
        <span style={{ marginLeft:"auto", fontSize:12, color:"#6b5f80" }}>{tiposDocto.length} tipos</span>
      </div>
      <div style={{ padding:16, display:"flex", flexDirection:"column", gap:10 }}>
        <div style={{ fontSize:11, color:"#6b5f80", lineHeight:1.5 }}>
          Esses tipos aparecem nos formulários de receita, despesa e na coluna "Documento" ao importar extratos.
        </div>

        {/* Add new */}
        <div style={{ display:"flex", gap:8 }}>
          <input value={novo} onChange={e => setNovo(e.target.value)} onKeyDown={e => e.key==="Enter" && add()}
            placeholder="Novo tipo... ex: Cheque, TED, Débito..."
            style={{ ...iStyle, flex:1, fontSize:12, padding:"7px 10px" }} />
          <button onClick={add}
            style={{ padding:"7px 16px", borderRadius:8, border:"none", background:"linear-gradient(135deg,#d97706,#f59e0b)", color:"#1a0a00", cursor:"pointer", fontSize:12, fontWeight:800 }}>
            + Adicionar
          </button>
        </div>

        {/* List */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:6 }}>
          {tiposDocto.map(t => (
            <div key={t} style={{ background:"#0d0b15", border:"1.5px solid #1a1628", borderRadius:8, overflow:"hidden" }}>
              {editando === t ? (
                <div style={{ display:"flex", gap:4, padding:"6px 8px" }}>
                  <input value={editVal} onChange={e=>setEditVal(e.target.value)}
                    onKeyDown={e => { if(e.key==="Enter") saveEdit(); if(e.key==="Escape") setEditando(null); }}
                    autoFocus
                    style={{ ...iStyle, flex:1, fontSize:11, padding:"3px 6px" }} />
                  <button onClick={saveEdit}
                    style={{ fontSize:11, background:"#0e4023", border:"none", borderRadius:4, color:"#4ade80", cursor:"pointer", padding:"3px 8px", fontWeight:700 }}>✓</button>
                  <button onClick={() => setEditando(null)}
                    style={{ fontSize:11, background:"none", border:"none", color:"#6b5f80", cursor:"pointer", padding:"3px 4px" }}>✕</button>
                </div>
              ) : (
                <div style={{ display:"flex", alignItems:"center", padding:"8px 10px", gap:6 }}>
                  <span style={{ fontSize:12, color:"#c8b8e8", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t}</span>
                  <button onClick={() => startEdit(t)}
                    style={{ fontSize:10, background:"none", border:"1px solid #2d2640", borderRadius:4, color:"#8a7fa0", cursor:"pointer", padding:"2px 6px", flexShrink:0 }}>✏️</button>
                  <button onClick={() => remove(t)}
                    style={{ fontSize:10, background:"none", border:"1px solid #7f1d1d", borderRadius:4, color:"#f87171", cursor:"pointer", padding:"2px 6px", flexShrink:0 }}>🗑</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


function BancosConfig({ bancos, onUpdate, bancoCnpj, onUpdateCnpj, receitas, setReceitas, despesas, setDespesas, saldos, setSaldos, transferencias, setTransferencias, showToast }) {
  const [novoNome, setNovoNome] = useState("");
  const [novoCnpj, setNovoCnpj] = useState("");
  const [editando, setEditando] = useState(null); // banco sendo editado

  const CNPJS = [
    { label: "— Sem CNPJ", value: "" },
    { label: "50.166.828 — Higienópolis (Nicole)", value: "50.166.828" },
    { label: "48.659.129 — Tijuca (Luís)", value: "48.659.129" },
    { label: "51.295.630 — Higienópolis 2", value: "51.295.630" },
  ];

  const add = () => {
    const b = novoNome.trim();
    if (!b || bancos.includes(b)) return;
    onUpdate([...bancos, b]);
    if (novoCnpj) onUpdateCnpj({ ...bancoCnpj, [b]: novoCnpj });
    setNovoNome(""); setNovoCnpj("");
  };

  const remove = (b) => {
    onUpdate(bancos.filter(x => x !== b));
    const { [b]: _, ...rest } = { ...(bancoCnpj || {}) };
    onUpdateCnpj(rest);
  };

  const rename = (b, nv) => {
    if (!nv || nv === b) return;

    // 1. Atualiza lista de bancos e bancoCnpj
    onUpdate(bancos.map(x => x === b ? nv : x));
    const oldCnpj = { ...(bancoCnpj || {}) };
    if (oldCnpj[b] !== undefined) { oldCnpj[nv] = oldCnpj[b]; delete oldCnpj[b]; }
    onUpdateCnpj(oldCnpj);

    // 2. Propaga renomeação para receitas, despesas, transferências e saldos
    if (setReceitas && receitas) setReceitas(receitas.map(r => r.banco === b ? { ...r, banco: nv } : r));
    if (setDespesas && despesas) setDespesas(despesas.map(d => d.banco === b ? { ...d, banco: nv } : d));
    if (setTransferencias && transferencias) setTransferencias(transferencias.map(t => {
      let u = { ...t };
      if ((u.saidoBanco||u.saidobanco) === b) { u.saidoBanco = nv; u.saidobanco = nv; }
      if ((u.entrouBanco||u.entroubanco) === b) { u.entrouBanco = nv; u.entroubanco = nv; }
      return u;
    }));
    if (setSaldos && saldos?.contas?.[b] !== undefined) {
      const novasContas = { ...saldos.contas, [nv]: saldos.contas[b] };
      delete novasContas[b];
      setSaldos({ ...saldos, contas: novasContas });
    }

    if (showToast) showToast(`✅ "${b}" renomeado para "${nv}" em todos os lançamentos`, "ok");
  };

  const setCnpj = (b, cnpj) => onUpdateCnpj({ ...(bancoCnpj || {}), [b]: cnpj });

  const corCnpj = (cnpj) => cnpj === "50.166.828" ? "#f59e0b" : cnpj === "48.659.129" ? "#e85d8a" : cnpj === "51.295.630" ? "#c084fc" : "#4a3f60";

  return (
    <div style={{ background: "#13101e", border: "1.5px solid #2d2640", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #2d2640", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#818cf8", display: "inline-block" }} />
        <span style={{ fontWeight: 700, fontSize: 14, color: "#f0e8ff" }}>Bancos / Contas</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#6b5f80" }}>{bancos.length} contas</span>
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>

        {/* Formulário de adição */}
        <div style={{ background: "#0d0b15", border: "1px solid #2d2640", borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6b5f80", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.06em" }}>Nova conta</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <label style={{ fontSize: 10, color: "#6b5f80" }}>Nome do banco / conta</label>
              <input value={novoNome} onChange={e => setNovoNome(e.target.value)}
                onKeyDown={e => e.key === "Enter" && add()}
                placeholder="Ex: Mercado Pago - Nicole"
                style={{ ...iStyle, fontSize: 12, padding: "7px 10px" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <label style={{ fontSize: 10, color: "#6b5f80" }}>CNPJ vinculado</label>
              <select value={novoCnpj} onChange={e => setNovoCnpj(e.target.value)}
                style={{ ...iStyle, fontSize: 12, padding: "7px 8px", cursor: "pointer" }}>
                {CNPJS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <button onClick={add} style={{ padding: "7px 16px", borderRadius: 8, border: "none",
              background: "linear-gradient(135deg,#3730a3,#4f46e5)", color: "#fff",
              cursor: "pointer", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
              + Adicionar
            </button>
          </div>
        </div>

        {/* Lista de bancos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {bancos.map(b => {
            const cnpj = (bancoCnpj || {})[b] || "";
            const cor = corCnpj(cnpj);
            const isEdit = editando === b;
            return (
              <div key={b} style={{ background: "#0d0b15", border: "1.5px solid #1a1628", borderRadius: 10, overflow: "hidden" }}>
                {/* Linha principal */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: cnpj ? cor : "#2d2640", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#c8b8e8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b}</div>
                    {cnpj
                      ? <div style={{ fontSize: 10, color: cor, marginTop: 1 }}>CNPJ {cnpj}</div>
                      : <div style={{ fontSize: 10, color: "#4a3f60", marginTop: 1 }}>Sem CNPJ vinculado</div>
                    }
                  </div>
                  <button onClick={() => setEditando(isEdit ? null : b)}
                    style={{ fontSize: 11, background: isEdit ? "#2d2640" : "none", border: "1px solid #2d2640", borderRadius: 6, color: "#8a7fa0", cursor: "pointer", padding: "3px 8px" }}>
                    ✏️
                  </button>
                  <button onClick={() => remove(b)}
                    style={{ fontSize: 11, background: "none", border: "1px solid #7f1d1d", borderRadius: 6, color: "#f87171", cursor: "pointer", padding: "3px 8px" }}>
                    🗑
                  </button>
                </div>

                {/* Painel de edição */}
                {isEdit && (
                  <div style={{ borderTop: "1px solid #1a1628", padding: "10px 12px", background: "#100e1b", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <label style={{ fontSize: 10, color: "#6b5f80" }}>Renomear</label>
                      <div style={{ display: "flex", gap: 6 }}>
                        <input defaultValue={b} id={`rename-${b}`}
                          style={{ ...iStyle, fontSize: 11, padding: "5px 8px", flex: 1 }} />
                        <button onClick={() => {
                          const nv = document.getElementById(`rename-${b}`)?.value?.trim();
                          if (nv && nv !== b) { rename(b, nv); setEditando(nv); }
                        }} style={{ fontSize: 11, background: "#1e3a8a", border: "none", borderRadius: 6, color: "#93c5fd", cursor: "pointer", padding: "5px 10px", fontWeight: 700 }}>OK</button>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <label style={{ fontSize: 10, color: "#6b5f80" }}>CNPJ vinculado</label>
                      <select value={cnpj} onChange={e => setCnpj(b, e.target.value)}
                        style={{ ...iStyle, fontSize: 11, padding: "5px 8px", cursor: "pointer" }}>
                        {CNPJS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── DADOS DA PLANILHA (embutidos) ─────────────────────────────────────────
const INSUMOS_PLANILHA = [{"cod": 1, "nome": "Açúcar Mascavo", "unid": "KG", "preco": 13.5}, {"cod": 2, "nome": "Açúcar Refinado", "unid": "KG", "preco": 4.1}, {"cod": 3, "nome": "Amido", "unid": "KG", "preco": 6.39}, {"cod": 4, "nome": "Bicarbonato", "unid": "KG", "preco": 19.64}, {"cod": 5, "nome": "Biscoito Maisena", "unid": "KG", "preco": 3.69}, {"cod": 6, "nome": "Cacau em pó", "unid": "KG", "preco": 49.99}, {"cod": 7, "nome": "Chocolate Branco Cobertura - SICAO", "unid": "KG", "preco": 32.495}, {"cod": 8, "nome": "Chocolate Branco Nobre - Nestle", "unid": "KG", "preco": 89.99}, {"cod": 9, "nome": "Chocolate em pó 50%", "unid": "Gr", "preco": 57.99}, {"cod": 10, "nome": "Chocolate meio amargo Cobertura - SICAO", "unid": "KG", "preco": 30.995}, {"cod": 11, "nome": "Chocolate meio amargo Nobre - Nestle", "unid": "KG", "preco": 89.99}, {"cod": 12, "nome": "Creme de Avelã - Master Martini", "unid": "KG", "preco": 34.99}, {"cod": 13, "nome": "Farinha", "unid": "KG", "preco": 2.99}, {"cod": 14, "nome": "Leite em pó", "unid": "Gr", "preco": 13.9}, {"cod": 15, "nome": "Leite Ninho", "unid": "Gr", "preco": 22.9}, {"cod": 16, "nome": "Limão (kg)", "unid": "KG", "preco": 4.99}, {"cod": 17, "nome": "Margarina", "unid": "KG", "preco": 162.9}, {"cod": 18, "nome": "Marshmallow (un)", "unid": "Unidade", "preco": 5.98}, {"cod": 19, "nome": "Nutella", "unid": "KG", "preco": 198.0}, {"cod": 20, "nome": "Ovo", "unid": "Unidade", "preco": 21.0}, {"cod": 21, "nome": "Ovomaltine Rocks (g)", "unid": "KG", "preco": 98.16}, {"cod": 22, "nome": "Recheio Ovomaltine", "unid": "KG", "preco": 71.25}, {"cod": 23, "nome": "Sal", "unid": "KG", "preco": 2.49}, {"cod": 24, "nome": "Creme de Avelã da Dolce", "unid": "KG", "preco": 49.0}, {"cod": 25, "nome": "Água", "unid": "Ml", "preco": 0}, {"cod": 26, "nome": "Massa de cookie s'mores (15 bateladas)", "unid": "KG", "preco": 103.56}, {"cod": 27, "nome": "Massa de cookie chocolate - gotas preta (15 bateladas)", "unid": "KG", "preco": 26.11}, {"cod": 28, "nome": "Massa de cookie chocolate - gotas branca (15 bateladas)", "unid": "KG", "preco": 26.22}, {"cod": 29, "nome": "Leite condensado", "unid": "KG", "preco": 15.1646}, {"cod": 30, "nome": "Creme de leite", "unid": "KG", "preco": 14.95}, {"cod": 31, "nome": "Cacau black", "unid": "KG", "preco": 51.99}, {"cod": 32, "nome": "Oleo", "unid": "KG", "preco": 7.3}, {"cod": 33, "nome": "Fermento", "unid": "KG", "preco": 8.49}, {"cod": 34, "nome": "Brigadeiro de Ninho", "unid": "KG", "preco": 18.65}, {"cod": 35, "nome": "Brigadeiro Preto", "unid": "KG", "preco": 19.6}, {"cod": 36, "nome": "Massa de Bolo Chocolate", "unid": "KG", "preco": 12.87}, {"cod": 37, "nome": "Potinho pra calda", "unid": "Unidade", "preco": 1.0}, {"cod": 38, "nome": "Sinete DL", "unid": "Unidade", "preco": 0.46}, {"cod": 39, "nome": "Massa de Crunch", "unid": "KG", "preco": 11.45}, {"cod": 40, "nome": "Caramelo", "unid": "KG", "preco": 9.46}, {"cod": 41, "nome": "pasta saborizante de limão", "unid": "KG", "preco": 255.0}, {"cod": 42, "nome": "Biscoito Oreo", "unid": "KG", "preco": 36.44}, {"cod": 43, "nome": "Baunilha", "unid": "KG", "preco": 13.9}, {"cod": 44, "nome": "Blend de Chocolate Preto", "unid": "KG", "preco": 50.66}, {"cod": 45, "nome": "Blend de Chocolate Branco", "unid": "KG", "preco": 58.12}, {"cod": 46, "nome": "Recheio de Limao", "unid": "KG", "preco": 25.87}, {"cod": 47, "nome": "Acessórios do Ovo", "unid": "Unidade", "preco": 7.29}, {"cod": 48, "nome": "Acessórios da Barra", "unid": "Unidade", "preco": 4.93}, {"cod": 49, "nome": "Recheio Crunch", "unid": "KG", "preco": 55.1}, {"cod": 50, "nome": "Prato 20cm", "unid": "Unidade", "preco": 19.9}, {"cod": 51, "nome": "Massa de Bolo Branco", "unid": "KG", "preco": 12.05}, {"cod": 52, "nome": "Recheio Kinder Bueno", "unid": "KG", "preco": 38.99}, {"cod": 53, "nome": "Topping Kinder Bueno", "unid": "Unidade", "preco": 8.99}, {"cod": 54, "nome": "Gastos incalculaveis com bolo", "unid": "Unidade", "preco": 3.0}, {"cod": 55, "nome": "Embalagem fatia", "unid": "Unidade", "preco": 190.0}, {"cod": 56, "nome": "Granulado", "unid": "KG", "preco": 15.99}, {"cod": 57, "nome": "Massa de cookie chocolate - sem gotas", "unid": "KG", "preco": 91.97}, {"cod": 58, "nome": "Essência de Baunilha", "unid": "Ml", "preco": 12.49}, {"cod": 59, "nome": "Corante vermelho", "unid": "KG", "preco": 3.99}, {"cod": 60, "nome": "Massa de cookie redvelvet (15 bateladas)", "unid": "KG", "preco": 114.34}, {"cod": 61, "nome": "Canela", "unid": "KG", "preco": 4.99}, {"cod": 62, "nome": "Massa de cookie tradicional (gotas brancas)", "unid": "KG", "preco": 13.98}, {"cod": 63, "nome": "Doce de leite", "unid": "KG", "preco": 102.99}, {"cod": 64, "nome": "Hambugueira", "unid": "Unidade", "preco": 25.0}, {"cod": 65, "nome": "Calda de Açucar", "unid": "KG", "preco": 3.08}, {"cod": 66, "nome": "Potinho para bolo de pote", "unid": "Unidade", "preco": 10.99}, {"cod": 67, "nome": "Tabuleiro de Brownie (12u)", "unid": "Unidade", "preco": 27.93}, {"cod": 68, "nome": "Massa de Bolo Cenoura", "unid": "KG", "preco": 9.88}, {"cod": 69, "nome": "Manteiga", "unid": "KG", "preco": 12.99}, {"cod": 70, "nome": "Chantilly", "unid": "Ml", "preco": 19.99}, {"cod": 71, "nome": "Cenoura (kg)", "unid": "KG", "preco": 7.0}, {"cod": 72, "nome": "Pó Merengue - Arcolor", "unid": "KG", "preco": 13.99}, {"cod": 73, "nome": "Merengue Powder", "unid": "KG", "preco": 26.78}, {"cod": 74, "nome": "Massa amanteigada", "unid": "KG", "preco": 16.07}, {"cod": 75, "nome": "Mousse de limão", "unid": "KG", "preco": 22.27}, {"cod": 76, "nome": "gelatina 24g incolor", "unid": "Gr", "preco": 13.99}, {"cod": 77, "nome": "Mousse de chocolate branco (chocoduo)", "unid": "Unidade", "preco": 31.62}, {"cod": 78, "nome": "Mousse de chocolate preto (chocoduo)", "unid": "Unidade", "preco": 25.62}, {"cod": 79, "nome": "Chocolate meio amargo Nobre - SICAO", "unid": "KG", "preco": 131.99}, {"cod": 80, "nome": "Chocolate branco Nobre - Melken", "unid": "KG", "preco": 182.99}];
const DESPESAS_FIXAS_PLANILHA = [{"desc": "Salários + Encargos + Benefícios", "valor": 0}, {"desc": "Energia Elétrica", "valor": 708.89}, {"desc": "Aluguel + IPTU", "valor": 1133.89}, {"desc": "Alarme + Segurança", "valor": 0}, {"desc": "Internet + Telefone", "valor": 138.05}, {"desc": "Água", "valor": 521.59}, {"desc": "Salário", "valor": 3800.0}, {"desc": "Contabilidade", "valor": 0}, {"desc": "Suporte de TI", "valor": 0}, {"desc": "Sistemas de Gestão", "valor": 395.43}, {"desc": "Publicidade e Marketing", "valor": 0}, {"desc": "Combustível", "valor": 0}, {"desc": "Manutenção Predial", "valor": 0}, {"desc": "Manutenção de Carros", "valor": 0}, {"desc": "Material de Escritório", "valor": 0}, {"desc": "Pik n Pak", "valor": 636.0}, {"desc": "Abrasel", "valor": 152.0}, {"desc": "MEI", "valor": 246.15}, {"desc": "Seguro predial", "valor": 104.03}];
const PRODUTOS_PLANILHA = [{"nome": "Ovo de Páscoa - S'mores", "tipo": "proprio", "preco": 69.9, "previsao": 25, "faturamento": 1747.5, "custo": 399.77, "mc": 1215.26, "mc_pct": 69.5, "lucro": 683.27, "lucro_pct": 39.1}, {"nome": "Ovo de Páscoa - Chocolatudo", "tipo": "proprio", "preco": 69.9, "previsao": 15, "faturamento": 1048.5, "custo": 292.38, "mc": 676.65, "mc_pct": 64.5, "lucro": 357.45, "lucro_pct": 34.1}, {"nome": "Ovo de Páscoa - Matilda", "tipo": "proprio", "preco": 69.9, "previsao": 20, "faturamento": 1398.0, "custo": 357.23, "mc": 934.8, "mc_pct": 66.9, "lucro": 509.2, "lucro_pct": 36.4}, {"nome": "Ovo de Páscoa - Ovomaltine", "tipo": "proprio", "preco": 75.9, "previsao": 15, "faturamento": 1138.5, "custo": 321.76, "mc": 730.44, "mc_pct": 64.2, "lucro": 383.84, "lucro_pct": 33.7}, {"nome": "Barra Recheada Brigadeiro", "tipo": "proprio", "preco": 29.9, "previsao": 50, "faturamento": 1495.0, "custo": 597.8, "mc": 783.88, "mc_pct": 52.4, "lucro": 328.75, "lucro_pct": 22.0}, {"nome": "Barra Recheada Crunch", "tipo": "proprio", "preco": 29.9, "previsao": 20, "faturamento": 598.0, "custo": 266.04, "mc": 331.96, "mc_pct": 55.5, "lucro": 149.91, "lucro_pct": 25.1}, {"nome": "Barra Recheada Ovomaltine", "tipo": "proprio", "preco": 35.9, "previsao": 20, "faturamento": 718.0, "custo": 285.42, "mc": 378.16, "mc_pct": 52.7, "lucro": 159.57, "lucro_pct": 22.2}, {"nome": "Barra Recheada Caramelo", "tipo": "proprio", "preco": 29.9, "previsao": 20, "faturamento": 598.0, "custo": 112.67, "mc": 440.0, "mc_pct": 73.6, "lucro": 257.95, "lucro_pct": 43.1}, {"nome": "Barra Recheada Oreo com Avelã", "tipo": "proprio", "preco": 35.9, "previsao": 20, "faturamento": 718.0, "custo": 279.54, "mc": 384.03, "mc_pct": 53.5, "lucro": 165.45, "lucro_pct": 23.0}, {"nome": "Barra Recheada Tortinha de Limão", "tipo": "proprio", "preco": 29.9, "previsao": 20, "faturamento": 598.0, "custo": 392.87, "mc": 159.8, "mc_pct": 26.7, "lucro": -22.25, "lucro_pct": -3.7}, {"nome": "Mini Ovo - Brigadeiro Preto", "tipo": "proprio", "preco": 6.5, "previsao": 50, "faturamento": 325.0, "custo": 75.16, "mc": 225.21, "mc_pct": 69.3, "lucro": 126.26, "lucro_pct": 38.9}, {"nome": "Mini Ovo - Brigadeiro Ninho", "tipo": "proprio", "preco": 6.5, "previsao": 50, "faturamento": 325.0, "custo": 73.97, "mc": 226.39, "mc_pct": 69.7, "lucro": 127.45, "lucro_pct": 39.2}, {"nome": "Torta S'mores", "tipo": "proprio", "preco": 119.9, "previsao": 10, "faturamento": 1199.0, "custo": 306.66, "mc": 801.46, "mc_pct": 66.8, "lucro": 436.44, "lucro_pct": 36.4}, {"nome": "Torta Matilda", "tipo": "proprio", "preco": 109.9, "previsao": 5, "faturamento": 549.5, "custo": 130.32, "mc": 377.52, "mc_pct": 68.7, "lucro": 210.24, "lucro_pct": 38.3}, {"nome": "Torta Cookie Chocolate com Brigadeiro", "tipo": "proprio", "preco": 109.9, "previsao": 5, "faturamento": 549.5, "custo": 174.55, "mc": 333.3, "mc_pct": 60.7, "lucro": 166.01, "lucro_pct": 30.2}, {"nome": "Fatia Cookie - S'mores (delivery próprio)", "tipo": "proprio", "preco": 24.9, "previsao": 6, "faturamento": 149.4, "custo": 40.17, "mc": 101.79, "mc_pct": 68.1, "lucro": 56.3, "lucro_pct": 37.7}, {"nome": "Fatia Cookie - S'mores (iFood e 99)", "tipo": "proprio", "preco": 28.9, "previsao": 75, "faturamento": 2167.5, "custo": 502.16, "mc": 928.61, "mc_pct": 42.8, "lucro": 268.75, "lucro_pct": 12.4}, {"nome": "Fatia Cookie - Chocolate com Brigadeiro (delivery próprio)", "tipo": "proprio", "preco": 22.9, "previsao": 1, "faturamento": 22.9, "custo": 7.4, "mc": 15.5, "mc_pct": 67.7, "lucro": 8.53, "lucro_pct": 37.2}, {"nome": "Fatia Cookie - Chocolate com Brigadeiro (iFood e 99)", "tipo": "proprio", "preco": 26.9, "previsao": 19, "faturamento": 511.1, "custo": 140.62, "mc": 196.76, "mc_pct": 38.5, "lucro": 41.16, "lucro_pct": 8.1}, {"nome": "Fatia Cookie - Redvelvet com Ninho (delivery próprio)", "tipo": "proprio", "preco": 22.9, "previsao": 2, "faturamento": 45.8, "custo": 11.17, "mc": 34.63, "mc_pct": 75.6, "lucro": 20.68, "lucro_pct": 45.2}, {"nome": "Fatia Cookie - Redvelvet com Ninho (iFood e 99)", "tipo": "proprio", "preco": 26.9, "previsao": 25, "faturamento": 672.5, "custo": 139.66, "mc": 304.26, "mc_pct": 45.2, "lucro": 99.53, "lucro_pct": 14.8}, {"nome": "Fatia Cookie - Ovomaltine (delivery próprio)", "tipo": "proprio", "preco": 23.9, "previsao": 2, "faturamento": 47.8, "custo": 23.08, "mc": 24.72, "mc_pct": 51.7, "lucro": 10.16, "lucro_pct": 21.3}, {"nome": "Fatia Cookie - Ovomaltine (iFood e 99)", "tipo": "proprio", "preco": 29.9, "previsao": 29, "faturamento": 867.1, "custo": 334.72, "mc": 237.65, "mc_pct": 27.4, "lucro": -26.33, "lucro_pct": -3.0}, {"nome": "Fatia Cookie - Doce de Leite (iFood e 99)", "tipo": "proprio", "preco": 26.9, "previsao": 26, "faturamento": 699.4, "custo": 148.02, "mc": 313.66, "mc_pct": 44.8, "lucro": 100.74, "lucro_pct": 14.4}, {"nome": "Fatia de Bolo - Matilda (delivery próprio)", "tipo": "proprio", "preco": 23.9, "previsao": 4, "faturamento": 95.6, "custo": 19.14, "mc": 76.46, "mc_pct": 80.0, "lucro": 47.36, "lucro_pct": 49.5}, {"nome": "Fatia de Bolo - Matilda (iFood e 99)", "tipo": "proprio", "preco": 29.9, "previsao": 31, "faturamento": 926.9, "custo": 148.34, "mc": 463.51, "mc_pct": 50.0, "lucro": 181.33, "lucro_pct": 19.6}, {"nome": "Fatia de Bolo - Buena Dolce (delivery próprio)", "tipo": "proprio", "preco": 23.9, "previsao": 6, "faturamento": 143.4, "custo": 44.1, "mc": 99.3, "mc_pct": 69.2, "lucro": 55.65, "lucro_pct": 38.8}, {"nome": "Fatia de Bolo - Buena Dolce (iFood e 99)", "tipo": "proprio", "preco": 29.9, "previsao": 6, "faturamento": 179.4, "custo": 44.1, "mc": 83.3, "mc_pct": 46.4, "lucro": 28.68, "lucro_pct": 16.0}, {"nome": "Fatia Gelada - Limão (delivery próprio)", "tipo": "proprio", "preco": 23.9, "previsao": 1, "faturamento": 23.9, "custo": 5.23, "mc": 18.67, "mc_pct": 78.1, "lucro": 11.4, "lucro_pct": 47.7}, {"nome": "Fatia Gelada - Limão (iFood e 99)", "tipo": "proprio", "preco": 29.9, "previsao": 10, "faturamento": 299.0, "custo": 52.28, "mc": 145.09, "mc_pct": 48.5, "lucro": 54.06, "lucro_pct": 18.1}, {"nome": "Fatia de Bolo - Cenoura (iFood e 99)", "tipo": "proprio", "preco": 29.9, "previsao": 9, "faturamento": 269.1, "custo": 43.04, "mc": 134.59, "mc_pct": 50.0, "lucro": 52.67, "lucro_pct": 19.6}, {"nome": "Fatia Gelada - Chocoduo (iFood e 99)", "tipo": "proprio", "preco": 29.9, "previsao": 19, "faturamento": 568.1, "custo": 172.41, "mc": 202.59, "mc_pct": 35.7, "lucro": 29.64, "lucro_pct": 5.2}, {"nome": "Cookie - Doce de Leite (delivery próprio)", "tipo": "proprio", "preco": 15.9, "previsao": 2, "faturamento": 31.8, "custo": 4.2, "mc": 27.6, "mc_pct": 86.8, "lucro": 17.92, "lucro_pct": 56.3}, {"nome": "Cookie - Doce de Leite (iFood e 99)", "tipo": "proprio", "preco": 18.9, "previsao": 9, "faturamento": 170.1, "custo": 18.9, "mc": 93.38, "mc_pct": 54.9, "lucro": 41.6, "lucro_pct": 24.5}, {"nome": "Cookie - S'mores (delivery próprio)", "tipo": "proprio", "preco": 18.9, "previsao": 2, "faturamento": 37.8, "custo": 4.99, "mc": 32.81, "mc_pct": 86.8, "lucro": 21.31, "lucro_pct": 56.4}, {"nome": "Cookie - S'mores (iFood e 99)", "tipo": "proprio", "preco": 22.9, "previsao": 20, "faturamento": 458.0, "custo": 49.85, "mc": 252.47, "mc_pct": 55.1, "lucro": 113.04, "lucro_pct": 24.7}, {"nome": "Cookie - Redvelvet com Ninho (delivery próprio)", "tipo": "proprio", "preco": 15.9, "previsao": 5, "faturamento": 79.5, "custo": 9.81, "mc": 69.69, "mc_pct": 87.7, "lucro": 45.49, "lucro_pct": 57.2}, {"nome": "Cookie - Redvelvet com Ninho (iFood e 99)", "tipo": "proprio", "preco": 18.9, "previsao": 13, "faturamento": 245.7, "custo": 25.51, "mc": 136.68, "mc_pct": 55.6, "lucro": 61.88, "lucro_pct": 25.2}, {"nome": "Cookie - Kinder Bueno (delivery próprio)", "tipo": "proprio", "preco": 18.9, "previsao": 5, "faturamento": 94.5, "custo": 16.9, "mc": 77.6, "mc_pct": 82.1, "lucro": 48.83, "lucro_pct": 51.7}, {"nome": "Cookie - Kinder Bueno (iFood e 99)", "tipo": "proprio", "preco": 22.9, "previsao": 18, "faturamento": 412.2, "custo": 60.83, "mc": 211.26, "mc_pct": 51.3, "lucro": 85.78, "lucro_pct": 20.8}, {"nome": "Cookie - Dueto das Galáxias (delivery próprio)", "tipo": "proprio", "preco": 18.9, "previsao": 6, "faturamento": 113.4, "custo": 19.62, "mc": 93.78, "mc_pct": 82.7, "lucro": 59.25, "lucro_pct": 52.3}, {"nome": "Cookie - Dueto das Galáxias (iFood e 99)", "tipo": "proprio", "preco": 22.9, "previsao": 19, "faturamento": 435.1, "custo": 62.14, "mc": 225.07, "mc_pct": 51.7, "lucro": 92.61, "lucro_pct": 21.3}, {"nome": "Cookie - Ninho Supreme (delivery próprio)", "tipo": "proprio", "preco": 18.9, "previsao": 2, "faturamento": 37.8, "custo": 8.03, "mc": 29.77, "mc_pct": 78.7, "lucro": 18.26, "lucro_pct": 48.3}, {"nome": "Cookie - Ninho Supreme (iFood  e 99)", "tipo": "proprio", "preco": 22.9, "previsao": 6, "faturamento": 137.4, "custo": 24.1, "mc": 66.6, "mc_pct": 48.5, "lucro": 24.77, "lucro_pct": 18.0}, {"nome": "Bolo Vulcão - Cenoura (delivery próprio)", "tipo": "proprio", "preco": 26.9, "previsao": 4, "faturamento": 107.6, "custo": 20.76, "mc": 86.84, "mc_pct": 80.7, "lucro": 54.08, "lucro_pct": 50.3}, {"nome": "Bolo Vulcão - Cenoura (iFoodHG e 99)", "tipo": "proprio", "preco": 33.9, "previsao": 7, "faturamento": 237.3, "custo": 36.33, "mc": 132.17, "mc_pct": 55.7, "lucro": 59.93, "lucro_pct": 25.3}, {"nome": "Bolo Vulcão - Matilda (iFoodHG e 99)", "tipo": "proprio", "preco": 33.9, "previsao": 3, "faturamento": 101.7, "custo": 15.58, "mc": 56.63, "mc_pct": 55.7, "lucro": 25.67, "lucro_pct": 25.2}, {"nome": "Bolo Vulcão - Nuvem de Ninho (delivery próprio)", "tipo": "proprio", "preco": 26.9, "previsao": 1, "faturamento": 26.9, "custo": 6.29, "mc": 20.61, "mc_pct": 76.6, "lucro": 12.42, "lucro_pct": 46.2}, {"nome": "Bolo Vulcão - Nuvem de Ninho (iFoodHG e 99)", "tipo": "proprio", "preco": 33.9, "previsao": 9, "faturamento": 305.1, "custo": 56.57, "mc": 160.35, "mc_pct": 52.6, "lucro": 67.47, "lucro_pct": 22.1}, {"nome": "Bolo de Pote - Matilda (delivery próprio)", "tipo": "proprio", "preco": 16.9, "previsao": 7, "faturamento": 118.3, "custo": 24.5, "mc": 93.8, "mc_pct": 79.3, "lucro": 57.78, "lucro_pct": 48.8}, {"nome": "Bolo de Pote - Matilda (iFoodHG e 99)", "tipo": "proprio", "preco": 21.9, "previsao": 10, "faturamento": 219.0, "custo": 35.0, "mc": 120.51, "mc_pct": 55.0, "lucro": 53.84, "lucro_pct": 24.6}, {"nome": "Mini cookitos - Brigadeiro", "tipo": "proprio", "preco": 3.0, "previsao": 1, "faturamento": 3.0, "custo": 0.91, "mc": 2.09, "mc_pct": 69.7, "lucro": 1.18, "lucro_pct": 39.2}, {"nome": "Mini cookitos - Brigadeiro", "tipo": "proprio", "preco": 21.9, "previsao": 1, "faturamento": 21.9, "custo": 0.91, "mc": 14.64, "mc_pct": 66.9, "lucro": 7.97, "lucro_pct": 36.4}, {"nome": "Bolo de Pote - Nuvem de Ninho (delivery próprio)", "tipo": "proprio", "preco": 16.9, "previsao": 2, "faturamento": 33.8, "custo": 6.77, "mc": 27.03, "mc_pct": 80.0, "lucro": 16.74, "lucro_pct": 49.5}, {"nome": "Bolo de Pote - Nuvem de Ninho (iFoodHG e 99)", "tipo": "proprio", "preco": 21.9, "previsao": 1, "faturamento": 21.9, "custo": 3.39, "mc": 12.16, "mc_pct": 55.5, "lucro": 5.5, "lucro_pct": 25.1}, {"nome": "Bolo de Pote - ChocoNinho (delivery próprio)", "tipo": "proprio", "preco": 16.9, "previsao": 2, "faturamento": 33.8, "custo": 6.77, "mc": 27.03, "mc_pct": 80.0, "lucro": 16.74, "lucro_pct": 49.5}, {"nome": "Bolo de Pote - ChocoNinho (iFoodHG e 99)", "tipo": "proprio", "preco": 21.9, "previsao": 2, "faturamento": 43.8, "custo": 6.77, "mc": 24.33, "mc_pct": 55.5, "lucro": 11.0, "lucro_pct": 25.1}, {"nome": "Brownie Recheado - Ninho com Avelã (delivery próprio)", "tipo": "proprio", "preco": 11.0, "previsao": 4, "faturamento": 44.0, "custo": 12.53, "mc": 31.47, "mc_pct": 71.5, "lucro": 18.08, "lucro_pct": 41.1}, {"nome": "Brownie Recheado - Ninho com Avelã (iFood e 99)", "tipo": "proprio", "preco": 17.2, "previsao": 16, "faturamento": 275.2, "custo": 50.11, "mc": 131.55, "mc_pct": 47.8, "lucro": 47.77, "lucro_pct": 17.4}, {"nome": "Brownie Recheado - Brigadeiro (delivery próprio)", "tipo": "proprio", "preco": 11.0, "previsao": 1, "faturamento": 11.0, "custo": 2.92, "mc": 8.08, "mc_pct": 73.5, "lucro": 4.74, "lucro_pct": 43.1}, {"nome": "Brownie Recheado - Brigadeiro (iFood e 99)", "tipo": "proprio", "preco": 17.2, "previsao": 15, "faturamento": 258.0, "custo": 43.73, "mc": 126.57, "mc_pct": 49.1, "lucro": 48.03, "lucro_pct": 18.6}, {"nome": "Brownie Recheado - Doce de Leite (delivery próprio)", "tipo": "proprio", "preco": 11.0, "previsao": 4, "faturamento": 44.0, "custo": 11.88, "mc": 32.12, "mc_pct": 73.0, "lucro": 18.72, "lucro_pct": 42.5}, {"nome": "Brownie Recheado - Doce de Leite (iFood e 99)", "tipo": "proprio", "preco": 17.2, "previsao": 11, "faturamento": 189.2, "custo": 32.68, "mc": 92.21, "mc_pct": 48.7, "lucro": 34.61, "lucro_pct": 18.3}, {"nome": "Croassaint - 4 queijos (iFood)", "tipo": "revenda", "preco": 19.9, "previsao": 10, "faturamento": 199.0, "custo": 37.9, "mc": 103.41, "mc_pct": 52.0, "lucro": 42.83, "lucro_pct": 21.5}, {"nome": "Croassaint - Frango com Requeijão (iFood)", "tipo": "revenda", "preco": 19.9, "previsao": 10, "faturamento": 199.0, "custo": 37.9, "mc": 103.41, "mc_pct": 52.0, "lucro": 42.83, "lucro_pct": 21.5}, {"nome": "Joelho - Queijo com Presunto (iFood)", "tipo": "revenda", "preco": 19.9, "previsao": 5, "faturamento": 99.5, "custo": 18.95, "mc": 51.7, "mc_pct": 52.0, "lucro": 21.41, "lucro_pct": 21.5}, {"nome": "Folhado - Peito de Peru (iFood)", "tipo": "revenda", "preco": 19.9, "previsao": 10, "faturamento": 199.0, "custo": 37.9, "mc": 103.41, "mc_pct": 52.0, "lucro": 42.83, "lucro_pct": 21.5}];



// ─── FICHAS TÉCNICAS TAB ───────────────────────────────────────────────────────
function FichasTecnicasTab({ insumos = [], receitas = [] }) {
  const SB_URL   = "https://wmlecjrkqwoejuryeayz.supabase.co/rest/v1";
  const SB_KEY_V = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbGVjanJrcXdvZWp1cnllYXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDgyMDYsImV4cCI6MjA5MTMyNDIwNn0.SAYFGBZFjvLn9jIEs8J5mR93ZY7HlYQbT43YTn8JKnI";
  const SB_H = { "Content-Type":"application/json","apikey":SB_KEY_V,"Authorization":"Bearer "+SB_KEY_V };

  const [produtos,       setProdutos]       = useState([]);
  const [fichas,         setFichas]         = useState([]);
  const [prodSel,        setProdSel]        = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [salvando,       setSalvando]       = useState(false);
  const [fBusca,         setFBusca]         = useState("");
  const [fCat,           setFCat]           = useState("");
  const [addForm,        setAddForm]        = useState({ tipo:"insumo", cod:"", quantidade:"" });
  const [editQtd,        setEditQtd]        = useState({});
  const [editPrecoVenda, setEditPrecoVenda] = useState(false);
  const [precoVendaInput,setPrecoVendaInput]= useState("");
  const [novoProdModal,  setNovoProdModal]  = useState(false);
  const [novoProdForm,   setNovoProdForm]   = useState({ categoria:"", subcategoria:"", nome:"" });
  const [editProdModal,  setEditProdModal]  = useState(null); // produto sendo editado

  const isMob = window.innerWidth < 768;
  const selS  = { ...iStyle, fontSize:11, padding:"5px 8px", cursor:"pointer" };
  const thFT  = (x={}) => ({ padding:"7px 10px", fontSize:10, fontWeight:800, color:"#6b5f80", textTransform:"uppercase", letterSpacing:"0.06em", borderBottom:"1px solid #2d2640", background:"#13101e", ...x });
  const tdFT  = (x={}) => ({ padding:"7px 10px", fontSize:12, color:"#c8b8e8", borderBottom:"1px solid #1a1628", ...x });

  // ── Carregar produtos ──────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`${SB_URL}/catalogo_produtos?ativo=eq.true&order=categoria,subcategoria.nullsfirst,ordem,nome`, { headers: SB_H });
        const d = await r.json();
        setProdutos(Array.isArray(d) ? d : []);
      } catch(e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  // ── Carregar ficha do produto selecionado ─────────────────────────────────
  useEffect(() => {
    if (!prodSel) { setFichas([]); return; }
    (async () => {
      try {
        const r = await fetch(`${SB_URL}/ficha_tecnica?produto_id=eq.${prodSel.id}&order=ordem,id`, { headers: SB_H });
        const d = await r.json();
        setFichas(Array.isArray(d) ? d : []);
      } catch(e) { console.error(e); }
    })();
  }, [prodSel]);

  // ── Resolver item de uma linha da ficha ───────────────────────────────────
  // insumo_cod → busca em insumos; receita_id → busca em receitas
  const resolveItem = (row) => {
    if (row.receita_id) {
      const r = receitas.find(x => x.id === row.receita_id);
      if (r) return { cod: null, nome: r.nome, unid: r.unid, preco: r._custoUnitario || 0, _tipo: "receita" };
    }
    if (row.insumo_cod) {
      const i = insumos.find(x => x.cod === Number(row.insumo_cod));
      if (i) return { cod: i.cod, nome: i.nome, unid: i.unid, preco: i.preco, _tipo: "insumo" };
    }
    return null;
  };

  const custo     = (row) => { const it = resolveItem(row); return it ? Number(row.quantidade) * Number(it.preco) : 0; };
  const custoTotal = fichas.reduce((s, r) => s + custo(r), 0);

  // ── Preço de venda e margem ────────────────────────────────────────────────
  const precoVenda   = Number(prodSel?.preco_venda || 0);
  const lucro        = precoVenda - custoTotal;
  const margemPct    = precoVenda > 0 ? (lucro / precoVenda * 100) : 0;
  const markupPct    = custoTotal > 0 ? (lucro / custoTotal * 100) : 0;
  const corMargem    = margemPct >= 40 ? "#4ade80" : margemPct >= 20 ? "#f59e0b" : margemPct > 0 ? "#f87171" : "#6b5f80";

  const salvarPrecoVenda = async () => {
    const pv = Number(String(precoVendaInput).replace(",","."));
    if (isNaN(pv) || pv < 0) { setEditPrecoVenda(false); return; }
    try {
      await fetch(`${SB_URL}/catalogo_produtos?id=eq.${prodSel.id}`, {
        method:"PATCH", headers:{...SB_H,"Prefer":"return=minimal"},
        body: JSON.stringify({ preco_venda: pv })
      });
      setProdutos(prev => prev.map(p => p.id===prodSel.id ? {...p, preco_venda: pv} : p));
      setProdSel(prev => ({ ...prev, preco_venda: pv }));
    } catch(e) { console.error(e); }
    setEditPrecoVenda(false);
  };

  // ── Adicionar item à ficha ────────────────────────────────────────────────
  const adicionarItem = async () => {
    if (!addForm.cod || !addForm.quantidade || !prodSel) return;
    setSalvando(true);
    const qtd = Number(String(addForm.quantidade).replace(",","."));
    // Monta o payload correto: insumo_cod (int) OU receita_id (int)
    const payload = { produto_id: prodSel.id, quantidade: qtd, ordem: fichas.length };
    if (addForm.tipo === "receita") {
      payload.receita_id  = Number(addForm.cod);
      payload.insumo_cod  = null;
    } else {
      payload.insumo_cod  = Number(addForm.cod);
    }
    try {
      const r = await fetch(`${SB_URL}/ficha_tecnica`, {
        method:"POST", headers:{ ...SB_H,"Prefer":"return=representation" },
        body: JSON.stringify(payload)
      });
      const d = await r.json();
      if (Array.isArray(d) && d[0]) setFichas(prev => [...prev, d[0]]);
      setAddForm(f => ({ ...f, cod:"", quantidade:"" }));
    } catch(e) { console.error("Erro ao adicionar:", e); }
    setSalvando(false);
  };

  const salvarQtd = async (row, novaQtd) => {
    const qtd = Number(String(novaQtd).replace(",","."));
    if (isNaN(qtd) || qtd === Number(row.quantidade)) { setEditQtd(e=>({...e,[row.id]:undefined})); return; }
    try {
      await fetch(`${SB_URL}/ficha_tecnica?id=eq.${row.id}`, { method:"PATCH", headers:{...SB_H,"Prefer":"return=minimal"}, body: JSON.stringify({ quantidade: qtd }) });
      setFichas(prev => prev.map(r => r.id===row.id ? {...r, quantidade: qtd} : r));
    } catch(e) { console.error(e); }
    setEditQtd(e=>({...e,[row.id]:undefined}));
  };

  const removerItem = async (id) => {
    try {
      await fetch(`${SB_URL}/ficha_tecnica?id=eq.${id}`, { method:"DELETE", headers:SB_H });
      setFichas(prev => prev.filter(r => r.id !== id));
    } catch(e) { console.error(e); }
  };

  // ── Criar novo produto ────────────────────────────────────────────────────
  const criarProduto = async () => {
    const cat = novoProdForm.categoria?.trim();
    const sub = novoProdForm.subcategoria?.trim() || null;
    const nom = novoProdForm.nome?.trim();
    if (!cat || !nom) return;
    try {
      const r = await fetch(`${SB_URL}/catalogo_produtos`, {
        method:"POST", headers:{ ...SB_H,"Prefer":"return=representation" },
        body: JSON.stringify({ categoria: cat, subcategoria: sub, nome: nom, ordem: produtos.length })
      });
      const d = await r.json();
      if (Array.isArray(d) && d[0]) {
        setProdutos(prev => [...prev, d[0]].sort((a,b)=>a.categoria.localeCompare(b.categoria)||(a.subcategoria||"").localeCompare(b.subcategoria||"")||a.ordem-b.ordem));
        setProdSel(d[0]);
      }
    } catch(e) { console.error(e); }
    setNovoProdModal(false);
    setNovoProdForm({ categoria:"", subcategoria:"", nome:"" });
  };

  // ── Agrupamento ────────────────────────────────────────────────────────────
  const categorias = [...new Set(produtos.map(p => p.categoria))];
  const filtrados  = produtos.filter(p => {
    if (fCat   && p.categoria !== fCat) return false;
    if (fBusca && !p.nome.toLowerCase().includes(fBusca.toLowerCase()) && !p.categoria.toLowerCase().includes(fBusca.toLowerCase())) return false;
    return true;
  });
  const grupos = filtrados.reduce((acc,p) => {
    if (!acc[p.categoria]) acc[p.categoria] = [];
    acc[p.categoria].push(p);
    return acc;
  }, {});
  const allCats = categorias;
  const allSubs = (cat) => [...new Set(produtos.filter(p=>p.categoria===cat && p.subcategoria).map(p=>p.subcategoria))];

  if (loading) return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:200, color:"#6b5f80" }}>Carregando produtos...</div>;

  return (
    <div style={{ display:"flex", gap:12, alignItems:"flex-start", flexDirection:isMob?"column":"row" }}>

      {/* ── Painel esquerdo ── */}
      <div style={{ width:isMob?"100%":270, flexShrink:0, display:"flex", flexDirection:"column", gap:8 }}>
        <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, padding:"12px 14px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <div style={{ fontSize:12, fontWeight:800, color:"#c084fc" }}>📋 Fichas Técnicas</div>
            <button onClick={()=>setNovoProdModal(true)}
              style={{ fontSize:10, fontWeight:700, padding:"4px 10px", borderRadius:6, border:"1px solid #4ade80", background:"#0a1f0a", color:"#4ade80", cursor:"pointer" }}>
              + Produto
            </button>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            <input value={fBusca} onChange={e=>setFBusca(e.target.value)}
              placeholder="Buscar produto..." style={{ ...selS, width:"100%" }} />
            <select value={fCat} onChange={e=>setFCat(e.target.value)} style={{ ...selS, width:"100%" }}>
              <option value="">Todas as categorias</option>
              {categorias.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ fontSize:10, color:"#4a3f60", marginTop:6 }}>{filtrados.length} produto{filtrados.length!==1?"s":""}</div>
        </div>

        {Object.entries(grupos).map(([cat, prods]) => (
          <div key={cat} style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:10, overflow:"hidden" }}>
            <div style={{ padding:"6px 12px", background:"#1a1030", fontSize:11, fontWeight:800, color:"#e9d5ff" }}>{cat}</div>
            {prods.map(p => (
              <button key={p.id} onClick={()=>setProdSel(p)}
                style={{ display:"block", width:"100%", textAlign:"left", padding:"6px 14px",
                  background:prodSel?.id===p.id?"#2d1254":"transparent",
                  borderTop:"1px solid #13101e", border:"none",
                  color:prodSel?.id===p.id?"#e9d5ff":"#8a7fa0",
                  fontSize:11, cursor:"pointer", transition:"all 0.12s" }}>
                {p.subcategoria && <span style={{ fontSize:9, color:"#4a3f60", display:"block" }}>{p.subcategoria}</span>}
                {p.nome}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* ── Painel direito ── */}
      <div style={{ flex:1, minWidth:0 }}>
        {!prodSel
          ? <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, padding:48, textAlign:"center" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
              <div style={{ fontSize:14, color:"#6b5f80", fontWeight:600 }}>Selecione um produto</div>
              <div style={{ fontSize:12, color:"#4a3f60", marginTop:4 }}>Clique em qualquer produto para ver ou editar sua ficha técnica.</div>
              <button onClick={()=>setNovoProdModal(true)}
                style={{ marginTop:16, padding:"8px 20px", borderRadius:8, border:"1px solid #4ade80", background:"#0a1f0a", color:"#4ade80", fontWeight:700, fontSize:12, cursor:"pointer" }}>
                + Adicionar novo produto
              </button>
            </div>
          : <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {/* Header com preço de venda e margem */}
              <div style={{ background:"linear-gradient(135deg,#1e1040,#2d1254)", border:"1.5px solid #7c3aed", borderRadius:12, padding:"14px 18px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8, marginBottom: precoVenda > 0 || fichas.length > 0 ? 14 : 0 }}>
                  <div>
                    <div style={{ fontSize:15, fontWeight:900, color:"#e9d5ff" }}>{prodSel.nome}</div>
                    <div style={{ fontSize:11, color:"#9333ea", marginTop:2 }}>{prodSel.categoria}{prodSel.subcategoria?" · "+prodSel.subcategoria:""}</div>
                  </div>
                  <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                    {/* Botões de ação */}
                    <button onClick={()=>setEditProdModal({...prodSel})} title="Editar produto"
                      style={{ padding:"5px 10px", borderRadius:7, border:"1px solid #2d2640", background:"none", color:"#a78bfa", cursor:"pointer", fontSize:12, display:"flex", alignItems:"center", gap:4 }}>
                      ✏️ <span style={{fontSize:10}}>Editar</span>
                    </button>
                    <button title="Duplicar produto" onClick={async ()=>{
                      const novoProd = { ...prodSel, id: Date.now(), nome: prodSel.nome + " (cópia)" };
                      delete novoProd.id;
                      try {
                        const res = await fetch(`https://wmlecjrkqwoejuryeayz.supabase.co/rest/v1/catalogo_produtos`, {
                          method:"POST",
                          headers:{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbGVjanJrcXdvZWp1cnllYXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDgyMDYsImV4cCI6MjA5MTMyNDIwNn0.SAYFGBZFjvLn9jIEs8J5mR93ZY7HlYQbT43YTn8JKnI","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbGVjanJrcXdvZWp1cnllYXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDgyMDYsImV4cCI6MjA5MTMyNDIwNn0.SAYFGBZFjvLn9jIEs8J5mR93ZY7HlYQbT43YTn8JKnI","Prefer":"return=representation"},
                          body: JSON.stringify({ nome: prodSel.nome+" (cópia)", categoria: prodSel.categoria, subcategoria: prodSel.subcategoria, preco_venda: prodSel.preco_venda, ativo: true })
                        });
                        const [criado] = await res.json();
                        if (criado) {
                          // Duplicar também as fichas técnicas
                          const fichasDoProd = await fetch(`https://wmlecjrkqwoejuryeayz.supabase.co/rest/v1/ficha_tecnica?produto_id=eq.${prodSel.id}`, {
                            headers:{"apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbGVjanJrcXdvZWp1cnllYXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDgyMDYsImV4cCI6MjA5MTMyNDIwNn0.SAYFGBZFjvLn9jIEs8J5mR93ZY7HlYQbT43YTn8JKnI","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbGVjanJrcXdvZWp1cnllYXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDgyMDYsImV4cCI6MjA5MTMyNDIwNn0.SAYFGBZFjvLn9jIEs8J5mR93ZY7HlYQbT43YTn8JKnI"}
                          }).then(r=>r.json());
                          if (fichasDoProd?.length) {
                            const novasFichas = fichasDoProd.map(f => ({ ...f, id: undefined, produto_id: criado.id }));
                            await fetch(`https://wmlecjrkqwoejuryeayz.supabase.co/rest/v1/ficha_tecnica`, {
                              method:"POST",
                              headers:{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbGVjanJrcXdvZWp1cnllYXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDgyMDYsImV4cCI6MjA5MTMyNDIwNn0.SAYFGBZFjvLn9jIEs8J5mR93ZY7HlYQbT43YTn8JKnI","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbGVjanJrcXdvZWp1cnllYXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDgyMDYsImV4cCI6MjA5MTMyNDIwNn0.SAYFGBZFjvLn9jIEs8J5mR93ZY7HlYQbT43YTn8JKnI","Prefer":"return=minimal"},
                              body: JSON.stringify(novasFichas)
                            });
                          }
                          alert(`Produto "${criado.nome}" duplicado com sucesso!`);
                          window.location.reload();
                        }
                      } catch(e) { console.error(e); alert("Erro ao duplicar."); }
                    }}
                      style={{ padding:"5px 10px", borderRadius:7, border:"1px solid #2d2640", background:"none", color:"#60a5fa", cursor:"pointer", fontSize:12, display:"flex", alignItems:"center", gap:4 }}>
                      📋 <span style={{fontSize:10}}>Duplicar</span>
                    </button>
                    <button onClick={()=>{ if(window.confirm(`Excluir "${prodSel.nome}"? Esta ação não pode ser desfeita.`)) excluirProduto(prodSel.id); }} title="Excluir produto"
                      style={{ padding:"5px 10px", borderRadius:7, border:"1px solid #7f1d1d", background:"none", color:"#f87171", cursor:"pointer", fontSize:12, display:"flex", alignItems:"center", gap:4 }}>
                      🗑 <span style={{fontSize:10}}>Excluir</span>
                    </button>
                    <div style={{ width:1, height:24, background:"#2d2640" }}/>
                    {/* Custo total */}
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:9, color:"#6b5f80", textTransform:"uppercase", letterSpacing:"0.08em" }}>Custo de produção</div>
                      <div style={{ fontSize:18, fontWeight:900, color:"#f59e0b" }}>{fmt(custoTotal)}</div>
                      <div style={{ fontSize:9, color:"#6b5f80" }}>{fichas.length} item{fichas.length!==1?"s":""}</div>
                    </div>
                    {/* Preço de venda */}
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:9, color:"#6b5f80", textTransform:"uppercase", letterSpacing:"0.08em" }}>Preço de venda</div>
                      {editPrecoVenda
                        ? <div style={{ display:"flex", gap:4, alignItems:"center", justifyContent:"flex-end" }}>
                            <input type="number" step="0.01" min="0" autoFocus
                              value={precoVendaInput}
                              onChange={e=>setPrecoVendaInput(e.target.value)}
                              onKeyDown={e=>{ if(e.key==="Enter") salvarPrecoVenda(); if(e.key==="Escape") setEditPrecoVenda(false); }}
                              style={{ ...iStyle, width:90, fontSize:14, padding:"3px 8px", textAlign:"right", borderColor:"#4ade80", fontWeight:800 }} />
                            <button onClick={salvarPrecoVenda} style={{ fontSize:12, background:"#16a34a", color:"#fff", border:"none", borderRadius:4, padding:"3px 8px", cursor:"pointer" }}>✓</button>
                            <button onClick={()=>setEditPrecoVenda(false)} style={{ fontSize:12, background:"none", color:"#6b5f80", border:"none", cursor:"pointer" }}>✕</button>
                          </div>
                        : <div onClick={()=>{ setPrecoVendaInput(precoVenda ? String(precoVenda) : ""); setEditPrecoVenda(true); }}
                            style={{ fontSize:18, fontWeight:900, color:precoVenda>0?"#4ade80":"#3a3060", cursor:"pointer", borderBottom:"1px dashed "+(precoVenda>0?"#4ade8066":"#3a3060") }}
                            title="Clique para editar o preço de venda">
                            {precoVenda > 0 ? fmt(precoVenda) : "Definir preço →"}
                          </div>
                      }
                      {!editPrecoVenda && <div style={{ fontSize:9, color:"#4a3f60", marginTop:2 }}>clique para editar</div>}
                    </div>
                  </div>
                </div>

                {/* Painel de rentabilidade — só mostra se tiver custo E preço */}
                {custoTotal > 0 && precoVenda > 0 && (
                  <div style={{ borderTop:"1px solid #3730a366", paddingTop:12, display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                    {[
                      { label:"💰 Lucro por unid.",  val: fmt(lucro),           cor: lucro>=0?"#4ade80":"#f87171",  sub: lucro>=0?"positivo":"negativo" },
                      { label:"📊 Margem (%)",        val: margemPct.toFixed(1)+"%", cor: corMargem,              sub: "sobre preço de venda" },
                      { label:"📈 Markup (%)",        val: markupPct.toFixed(1)+"%", cor: corMargem,              sub: "sobre custo" },
                      { label:"⚡ Ponto equil.",      val: custoTotal > 0 ? `${Math.ceil(500/lucro)} un.` : "—",  cor:"#818cf8", sub:"para lucrar R$500" },
                    ].map(k => (
                      <div key={k.label} style={{ background:"rgba(0,0,0,0.3)", borderRadius:8, padding:"8px 10px" }}>
                        <div style={{ fontSize:9, color:"#6b5f80", marginBottom:4 }}>{k.label}</div>
                        <div style={{ fontSize:15, fontWeight:900, color:k.cor, lineHeight:1 }}>{k.val}</div>
                        <div style={{ fontSize:9, color:"#4a3f60", marginTop:3 }}>{k.sub}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Aviso se custo > preço */}
                {custoTotal > 0 && precoVenda > 0 && lucro < 0 && (
                  <div style={{ marginTop:8, background:"#2a0a0a", border:"1px solid #7f1d1d", borderRadius:8, padding:"8px 12px", fontSize:11, color:"#f87171" }}>
                    ⚠️ O custo de produção ({fmt(custoTotal)}) é maior que o preço de venda ({fmt(precoVenda)}). Você está vendendo com prejuízo de {fmt(Math.abs(lucro))} por unidade.
                  </div>
                )}

                {/* Sugestão de preço mínimo */}
                {custoTotal > 0 && precoVenda === 0 && (
                  <div style={{ marginTop:10, display:"flex", gap:8, flexWrap:"wrap" }}>
                    <div style={{ fontSize:10, color:"#6b5f80" }}>Sugestões de preço:</div>
                    {[
                      { label:"Margem 30%", pv: custoTotal / 0.70 },
                      { label:"Margem 40%", pv: custoTotal / 0.60 },
                      { label:"Margem 50%", pv: custoTotal / 0.50 },
                    ].map(s => (
                      <button key={s.label} onClick={()=>{ setPrecoVendaInput(s.pv.toFixed(2)); setEditPrecoVenda(true); }}
                        style={{ fontSize:10, padding:"3px 10px", borderRadius:6, border:"1px solid #3730a3", background:"#1a1030", color:"#818cf8", cursor:"pointer" }}>
                        {s.label}: {fmt(s.pv)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tabela */}
              <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, overflow:"hidden" }}>
                <table style={{ borderCollapse:"collapse", width:"100%" }}>
                  <thead>
                    <tr>
                      <th style={thFT({ textAlign:"center", width:50 })}>Cód</th>
                      <th style={thFT({ textAlign:"left" })}>Produto/Serviço</th>
                      <th style={thFT({ textAlign:"center", width:70 })}>Unid.</th>
                      <th style={thFT({ textAlign:"right", width:90 })}>Quant.</th>
                      <th style={thFT({ textAlign:"right", width:100 })}>Valor</th>
                      <th style={thFT({ textAlign:"right", width:55 })}>% custo</th>
                      <th style={thFT({ width:36 })}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {fichas.length === 0
                      ? <tr><td colSpan={7} style={tdFT({ textAlign:"center", color:"#4a3f60", padding:24 })}>Nenhum insumo na ficha. Adicione abaixo.</td></tr>
                      : fichas.map((row, i) => {
                          const item  = resolveItem(row);
                          const valor = custo(row);
                          const edit  = editQtd[row.id] !== undefined;
                          return (
                            <tr key={row.id} style={{ background:i%2===0?"#0d0b15":"#100e1b" }}>
                              <td style={tdFT({ textAlign:"center", color:"#4a3f60", fontSize:11 })}>
                                {item?._tipo==="receita" ? "📝" : item?.cod||"—"}
                              </td>
                              <td style={tdFT({ fontWeight:500 })}>
                                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                  {item?._tipo==="receita" && <span style={{ fontSize:9, background:"#1a1030", color:"#9333ea", padding:"1px 5px", borderRadius:4, flexShrink:0 }}>Receita</span>}
                                  <span>{item?.nome || <span style={{color:"#f87171"}}>Item não encontrado</span>}</span>
                                </div>
                              </td>
                              <td style={tdFT({ textAlign:"center", color:"#8a7fa0", fontSize:11 })}>{item?.unid||"—"}</td>
                              <td style={tdFT({ textAlign:"right" })}>
                                {edit
                                  ? <input type="number" step="0.001" min="0" autoFocus value={editQtd[row.id]}
                                      onChange={e=>setEditQtd(q=>({...q,[row.id]:e.target.value}))}
                                      onBlur={e=>salvarQtd(row,e.target.value)}
                                      onKeyDown={e=>{ if(e.key==="Enter") e.target.blur(); if(e.key==="Escape") setEditQtd(q=>({...q,[row.id]:undefined})); }}
                                      style={{ ...iStyle, width:70, textAlign:"right", fontSize:12, padding:"2px 6px", borderColor:"#f59e0b" }} />
                                  : <span onClick={()=>setEditQtd(q=>({...q,[row.id]:String(row.quantidade)}))}
                                      style={{ cursor:"pointer", borderBottom:"1px dashed #4a3f60", paddingBottom:1 }} title="Clique para editar">
                                      {Number(row.quantidade).toLocaleString("pt-BR",{maximumFractionDigits:4})}
                                    </span>
                                }
                              </td>
                              <td style={tdFT({ textAlign:"right", fontWeight:700, color:valor>0?"#f59e0b":"#3a3060" })}>
                                {valor > 0 ? fmt(valor) : "—"}
                              </td>
                              <td style={tdFT({ textAlign:"right", fontSize:10 })}>
                                {custoTotal > 0 && valor > 0
                                  ? <span style={{ color: valor/custoTotal > 0.4 ? "#f87171" : "#8a7fa0" }}>
                                      {(valor/custoTotal*100).toFixed(0)}%
                                    </span>
                                  : <span style={{color:"#3a3060"}}>—</span>
                                }
                              </td>
                              <td style={tdFT({ textAlign:"center" })}>
                                <button onClick={()=>removerItem(row.id)} style={{ background:"none", border:"none", color:"#f87171", cursor:"pointer", fontSize:12 }}>🗑</button>
                              </td>
                            </tr>
                          );
                        })
                    }
                    {fichas.length > 0 && (
                      <tr style={{ background:"#1a1030", borderTop:"2px solid #3730a3" }}>
                        <td colSpan={4} style={{ padding:"8px 10px", fontSize:12, fontWeight:700, color:"#9333ea", textAlign:"right" }}>Custo Total</td>
                        <td style={{ padding:"8px 10px", fontSize:14, fontWeight:900, color:"#f59e0b", textAlign:"right" }}>{fmt(custoTotal)}</td>
                        <td style={{ padding:"8px 10px", fontSize:11, color:"#6b5f80", textAlign:"right" }}>100%</td>
                        <td></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Formulário adicionar */}
              <div style={{ background:"#0d0b15", border:"1.5px solid #1a3a20", borderRadius:12, padding:"12px 14px" }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#4ade80", marginBottom:8 }}>+ Adicionar à Ficha</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"flex-end" }}>
                  <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                    <label style={{ fontSize:9, color:"#6b5f80", textTransform:"uppercase" }}>Tipo</label>
                    <select value={addForm.tipo} onChange={e=>setAddForm(f=>({...f,tipo:e.target.value,cod:""}))}
                      style={{ ...selS, width:110 }}>
                      <option value="insumo">Insumo</option>
                      <option value="receita">📝 Receita</option>
                    </select>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:3, flex:2, minWidth:180 }}>
                    <label style={{ fontSize:9, color:"#6b5f80", textTransform:"uppercase" }}>
                      {addForm.tipo==="receita" ? "Receita de produção" : "Insumo"}
                    </label>
                    {addForm.tipo === "receita"
                      ? <select value={addForm.cod} onChange={e=>setAddForm(f=>({...f,cod:e.target.value}))}
                          style={{ ...selS, borderColor:addForm.cod?"#9333ea":"" }}>
                          <option value="">Selecione a receita...</option>
                          {receitas.length === 0
                            ? <option disabled>Nenhuma receita cadastrada</option>
                            : receitas.map(r=>(
                                <option key={r.id} value={r.id}>
                                  📝 {r.nome} ({r.unid}) — {fmt(r._custoUnitario||0)}/{r.unid}
                                </option>
                              ))
                          }
                        </select>
                      : <select value={addForm.cod} onChange={e=>setAddForm(f=>({...f,cod:e.target.value}))}
                          style={{ ...selS, borderColor:addForm.cod?"#4ade80":"" }}>
                          <option value="">Selecione o insumo...</option>
                          {[...insumos].sort((a,b)=>a.nome.localeCompare(b.nome)).map(i=>(
                            <option key={i.cod} value={i.cod}>{i.nome} ({i.unid}) — {fmt(i.preco)}/{i.unid}</option>
                          ))}
                        </select>
                    }
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:3, width:90 }}>
                    <label style={{ fontSize:9, color:"#6b5f80", textTransform:"uppercase" }}>
                      Qtd {(() => {
                        if (!addForm.cod) return "";
                        if (addForm.tipo==="receita") { const r=receitas.find(x=>x.id===Number(addForm.cod)); return r?`(${r.unid})`:""; }
                        const i=insumos.find(x=>x.cod===Number(addForm.cod)); return i?`(${i.unid})`:"";
                      })()}
                    </label>
                    <input type="number" step="0.001" min="0" value={addForm.quantidade}
                      onChange={e=>setAddForm(f=>({...f,quantidade:e.target.value}))}
                      onKeyDown={e=>{ if(e.key==="Enter") adicionarItem(); }}
                      placeholder="0,000" style={{ ...selS, textAlign:"right", borderColor:addForm.quantidade?"#4ade80":"" }} />
                  </div>
                  {addForm.cod && addForm.quantidade && (() => {
                    let preco = 0;
                    if (addForm.tipo==="receita") { const r=receitas.find(x=>x.id===Number(addForm.cod)); preco=r?._custoUnitario||0; }
                    else { const i=insumos.find(x=>x.cod===Number(addForm.cod)); preco=i?.preco||0; }
                    return preco>0 ? <div style={{ fontSize:11, color:"#f59e0b", paddingBottom:6 }}>= {fmt(Number(addForm.quantidade)*preco)}</div> : null;
                  })()}
                  <button onClick={adicionarItem} disabled={salvando||!addForm.cod||!addForm.quantidade}
                    style={{ padding:"7px 18px", borderRadius:8, border:"none",
                      background:(!addForm.cod||!addForm.quantidade)?"#1a2e1a":"#16a34a",
                      color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer", flexShrink:0, opacity:salvando?0.6:1 }}>
                    {salvando?"...":"Adicionar"}
                  </button>
                </div>
              </div>
            </div>
        }
      </div>

      {/* Modal: Novo produto */}
      {novoProdModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
          onClick={()=>setNovoProdModal(false)}>
          <div style={{ background:"#13101e", borderRadius:14, border:"1.5px solid #2d2640", padding:24, width:"100%", maxWidth:420 }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:14, fontWeight:800, color:"#4ade80", marginBottom:16 }}>➕ Novo Produto</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div>
                <label style={{ fontSize:10, color:"#6b5f80", display:"block", marginBottom:4, textTransform:"uppercase" }}>Categoria *</label>
                <select value={novoProdForm.categoria} onChange={e=>setNovoProdForm(f=>({...f,categoria:e.target.value,subcategoria:""}))}
                  style={{ ...selS, width:"100%" }}>
                  <option value="">Selecione uma categoria...</option>
                  {allCats.map(c=><option key={c} value={c}>{c}</option>)}
                  <option value="__nova__">+ Nova categoria...</option>
                </select>
                {novoProdForm.categoria === "__nova__" && (
                  <input autoFocus value={novoProdForm._catCustom||""} onChange={e=>setNovoProdForm(f=>({...f,categoria:e.target.value,_catCustom:e.target.value}))}
                    placeholder="Nome da categoria" style={{ ...selS, width:"100%", marginTop:6, borderColor:"#7c3aed" }} />
                )}
              </div>
              {novoProdForm.categoria && novoProdForm.categoria !== "__nova__" && (
                <div>
                  <label style={{ fontSize:10, color:"#6b5f80", display:"block", marginBottom:4, textTransform:"uppercase" }}>Subcategoria (opcional)</label>
                  <select value={novoProdForm.subcategoria||""} onChange={e=>setNovoProdForm(f=>({...f, subcategoria:e.target.value==="__novasub__"?"":e.target.value, _subCustom:"", _subNova:e.target.value==="__novasub__"}))}
                    style={{ ...selS, width:"100%" }}>
                    <option value="">Sem subcategoria</option>
                    {allSubs(novoProdForm.categoria).map(s=><option key={s} value={s}>{s}</option>)}
                    <option value="__novasub__">+ Nova subcategoria...</option>
                  </select>
                  {(novoProdForm._subNova || novoProdForm.subcategoria === "__novasub__") && (
                    <input autoFocus value={novoProdForm._subCustom||""} onChange={e=>setNovoProdForm(f=>({...f, subcategoria:e.target.value, _subCustom:e.target.value}))}
                      placeholder="Nome da nova subcategoria" style={{ ...selS, width:"100%", marginTop:6, borderColor:"#7c3aed" }} />
                  )}
                </div>
              )}
              <div>
                <label style={{ fontSize:10, color:"#6b5f80", display:"block", marginBottom:4, textTransform:"uppercase" }}>Nome do produto *</label>
                <input value={novoProdForm.nome} onChange={e=>setNovoProdForm(f=>({...f,nome:e.target.value}))}
                  placeholder="Ex: Cookie S'mores" style={{ ...selS, width:"100%" }}
                  onKeyDown={e=>{ if(e.key==="Enter") criarProduto(); }} />
              </div>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:16 }}>
              <button onClick={criarProduto} disabled={!novoProdForm.nome?.trim()||!novoProdForm.categoria?.trim()}
                style={{ flex:1, padding:"10px", borderRadius:8, border:"none", background:"#16a34a", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer",
                  opacity:(!novoProdForm.nome||!novoProdForm.categoria)?0.4:1 }}>
                Criar e abrir ficha
              </button>
              <button onClick={()=>setNovoProdModal(false)}
                style={{ padding:"10px 16px", borderRadius:8, border:"1px solid #3a3060", background:"none", color:"#8a7fa0", cursor:"pointer" }}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de edição do produto ── */}
      {editProdModal && (() => {
        // Categorias e subcategorias extraídas dos produtos existentes
        const todasCats = [...new Set(produtos.map(p=>p.categoria).filter(Boolean))].sort();
        const todasSubs = [...new Set(produtos.filter(p=>p.categoria===editProdModal.categoria).map(p=>p.subcategoria).filter(Boolean))].sort();

        return (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
            onClick={()=>setEditProdModal(null)}>
            <div style={{ background:"#13101e", borderRadius:16, border:"1.5px solid #9333ea", width:"100%", maxWidth:420, padding:"20px" }}
              onClick={e=>e.stopPropagation()}>
              <div style={{ fontSize:14, fontWeight:800, color:"#c084fc", marginBottom:16 }}>✏️ Editar Produto</div>

              {/* Categoria */}
              <div style={{ marginBottom:10 }}>
                <label style={{ fontSize:10, color:"#6b5f80", fontWeight:700, textTransform:"uppercase", display:"block", marginBottom:3 }}>Categoria *</label>
                <select value={editProdModal.categoria||""} onChange={e=>setEditProdModal(m=>({...m, categoria:e.target.value==="__nova__"?"":(e.target.value), subcategoria:"", _catNova: e.target.value==="__nova__" }))}
                  style={{ ...iStyle, fontSize:12 }}>
                  <option value="">Selecione...</option>
                  {todasCats.map(c=><option key={c} value={c}>{c}</option>)}
                  <option value="__nova__">+ Nova categoria...</option>
                </select>
                {editProdModal._catNova && (
                  <input autoFocus value={editProdModal.categoria||""} onChange={e=>setEditProdModal(m=>({...m,categoria:e.target.value}))}
                    placeholder="Nome da nova categoria" style={{ ...iStyle, fontSize:12, marginTop:6 }} />
                )}
              </div>

              {/* Subcategoria */}
              <div style={{ marginBottom:10 }}>
                <label style={{ fontSize:10, color:"#6b5f80", fontWeight:700, textTransform:"uppercase", display:"block", marginBottom:3 }}>Subcategoria (opcional)</label>
                <select value={editProdModal.subcategoria||""} onChange={e=>setEditProdModal(m=>({...m, subcategoria:e.target.value==="__nova__"?"":e.target.value, _subNova: e.target.value==="__nova__" }))}
                  style={{ ...iStyle, fontSize:12 }}>
                  <option value="">Nenhuma</option>
                  {todasSubs.map(s=><option key={s} value={s}>{s}</option>)}
                  <option value="__nova__">+ Nova subcategoria...</option>
                </select>
                {editProdModal._subNova && (
                  <input autoFocus value={editProdModal.subcategoria||""} onChange={e=>setEditProdModal(m=>({...m,subcategoria:e.target.value}))}
                    placeholder="Nome da nova subcategoria" style={{ ...iStyle, fontSize:12, marginTop:6 }} />
                )}
              </div>

              {/* Nome */}
              <div style={{ marginBottom:10 }}>
                <label style={{ fontSize:10, color:"#6b5f80", fontWeight:700, textTransform:"uppercase", display:"block", marginBottom:3 }}>Nome do produto *</label>
                <input value={editProdModal.nome||""} onChange={e=>setEditProdModal(m=>({...m,nome:e.target.value}))}
                  style={{ ...iStyle, fontSize:12 }} />
              </div>

              <div style={{ display:"flex", gap:8, marginTop:16 }}>
                <button onClick={async ()=>{
                  if (!editProdModal.nome?.trim() || !editProdModal.categoria?.trim()) return;
                  try {
                    await fetch(`${SB_URL}/catalogo_produtos?id=eq.${editProdModal.id}`, {
                      method:"PATCH", headers:{...SB_H,"Prefer":"return=minimal"},
                      body: JSON.stringify({ nome:editProdModal.nome.trim(), categoria:editProdModal.categoria.trim(), subcategoria:editProdModal.subcategoria?.trim()||null })
                    });
                    setProdutos(p => p.map(x => x.id===editProdModal.id ? {...x, nome:editProdModal.nome.trim(), categoria:editProdModal.categoria.trim(), subcategoria:editProdModal.subcategoria?.trim()||null} : x));
                    setProdSel(s => s?.id===editProdModal.id ? {...s, nome:editProdModal.nome.trim(), categoria:editProdModal.categoria.trim(), subcategoria:editProdModal.subcategoria?.trim()||null} : s);
                    setEditProdModal(null);
                  } catch(e) { console.error(e); }
                }} style={{ flex:1, padding:"10px", borderRadius:8, border:"none", background:"#7c3aed", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                  💾 Salvar alterações
                </button>
                <button onClick={()=>setEditProdModal(null)}
                  style={{ padding:"10px 16px", borderRadius:8, border:"1px solid #3a3060", background:"none", color:"#8a7fa0", cursor:"pointer" }}>✕</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}


// ─── RECEITAS TAB ──────────────────────────────────────────────────────────────
function ReceitasProducaoTab({ insumos = [], receitas, setReceitas, setRecIngredientes }) {
  const SB_URL   = "https://wmlecjrkqwoejuryeayz.supabase.co/rest/v1";
  const SB_KEY_V = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbGVjanJrcXdvZWp1cnllYXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDgyMDYsImV4cCI6MjA5MTMyNDIwNn0.SAYFGBZFjvLn9jIEs8J5mR93ZY7HlYQbT43YTn8JKnI";
  const SB_H = { "Content-Type":"application/json","apikey":SB_KEY_V,"Authorization":"Bearer "+SB_KEY_V };

  const [recSel,     setRecSel]     = useState(null);   // receita selecionada
  const [ingredientes,setIngredientes]= useState([]);   // receita_ingredientes rows
  const [novaRec,    setNovaRec]    = useState(false);
  const [novaForm,   setNovaForm]   = useState({ nome:"", unid:"KG", rendimento:"1", observacao:"" });
  const [addIng,     setAddIng]     = useState({ insumo_cod:"", quantidade:"" });
  const [salvando,   setSalvando]   = useState(false);
  const [editQtd,    setEditQtd]    = useState({});
  const [fBusca,     setFBusca]     = useState("");

  const isMob = window.innerWidth < 768;
  const selS  = { ...iStyle, fontSize:11, padding:"5px 8px", cursor:"pointer" };

  // ── Carregar ingredientes da receita selecionada ───────────────────────────
  useEffect(() => {
    if (!recSel) { setIngredientes([]); return; }
    (async () => {
      try {
        const r = await fetch(`${SB_URL}/receita_ingredientes?receita_id=eq.${recSel.id}&order=ordem,id`, { headers: SB_H });
        const data = await r.json();
        setIngredientes(Array.isArray(data) ? data : []);
      } catch(e) { console.error(e); }
    })();
  }, [recSel]);

  // ── Custo de um ingrediente ────────────────────────────────────────────────
  const getInsumo = (cod) => insumos.find(i => i.cod === Number(cod));
  const custoIng  = (row) => {
    const ins = getInsumo(row.insumo_cod);
    return ins ? Number(row.quantidade) * Number(ins.preco) : 0;
  };
  const custoTotalRec = ingredientes.reduce((s,r) => s + custoIng(r), 0);
  const rendimento    = recSel ? Number(recSel.rendimento) || 1 : 1;
  const custoUnitario = custoTotalRec / rendimento;

  // ── Criar nova receita ────────────────────────────────────────────────────
  const criarReceita = async () => {
    if (!novaForm.nome?.trim()) return;
    setSalvando(true);
    try {
      const r = await fetch(`${SB_URL}/receitas_base`, {
        method:"POST", headers:{ ...SB_H,"Prefer":"return=representation" },
        body: JSON.stringify({
          nome:       novaForm.nome.trim(),
          unid:       novaForm.unid || "KG",
          rendimento: Number(novaForm.rendimento) || 1,
          observacao: novaForm.observacao?.trim() || null,
        })
      });
      const data = await r.json();
      if (Array.isArray(data) && data[0]) {
        const nova = { ...data[0], _custoUnitario: 0 };
        setReceitas(prev => [...prev, nova]);
        setRecSel(nova);
      }
    } catch(e) { console.error(e); }
    setNovaRec(false);
    setNovaForm({ nome:"", unid:"KG", rendimento:"1", observacao:"" });
    setSalvando(false);
  };

  // ── Adicionar ingrediente ──────────────────────────────────────────────────
  const adicionarIngrediente = async () => {
    if (!addIng.insumo_cod || !addIng.quantidade || !recSel) return;
    setSalvando(true);
    const row = {
      receita_id: recSel.id,
      insumo_cod: Number(addIng.insumo_cod),
      quantidade: Number(String(addIng.quantidade).replace(",",".")),
      ordem:      ingredientes.length,
    };
    try {
      const r = await fetch(`${SB_URL}/receita_ingredientes`, {
        method:"POST", headers:{ ...SB_H,"Prefer":"return=representation" },
        body: JSON.stringify(row)
      });
      const data = await r.json();
      if (Array.isArray(data) && data[0]) {
        const novosIngs = [...ingredientes, data[0]];
        setIngredientes(novosIngs);
        // Recalcula custo e atualiza receitas no estado global
        const novoCusto = novosIngs.reduce((s,x) => {
          const ins = getInsumo(x.insumo_cod);
          return s + (ins ? Number(x.quantidade)*Number(ins.preco) : 0);
        }, 0) / rendimento;
        setReceitas(prev => prev.map(rec => rec.id===recSel.id ? {...rec,_custoUnitario:novoCusto} : rec));
        setRecSel(prev => ({ ...prev, _custoUnitario: novoCusto }));
        // Sincroniza ingredientes globais para recálculo automático por preço
        if (setRecIngredientes) setRecIngredientes(prev => [...prev.filter(i=>i.receita_id!==recSel.id), ...novosIngs]);
      }
      setAddIng({ insumo_cod:"", quantidade:"" });
    } catch(e) { console.error(e); }
    setSalvando(false);
  };

  const salvarQtdIng = async (row, novaQtd) => {
    const qtd = Number(String(novaQtd).replace(",","."));
    if (isNaN(qtd)) { setEditQtd(e=>({...e,[row.id]:undefined})); return; }
    try {
      await fetch(`${SB_URL}/receita_ingredientes?id=eq.${row.id}`, { method:"PATCH", headers:{...SB_H,"Prefer":"return=minimal"}, body: JSON.stringify({ quantidade: qtd }) });
      const novosIngs = ingredientes.map(r => r.id===row.id ? {...r,quantidade:qtd} : r);
      setIngredientes(novosIngs);
      const novoCusto = novosIngs.reduce((s,x)=>{ const ins=getInsumo(x.insumo_cod); return s+(ins?Number(x.quantidade)*Number(ins.preco):0); },0)/rendimento;
      setReceitas(prev => prev.map(rec => rec.id===recSel.id ? {...rec,_custoUnitario:novoCusto} : rec));
      if (setRecIngredientes) setRecIngredientes(prev => [...prev.filter(i=>i.receita_id!==recSel.id), ...novosIngs]);
    } catch(e) { console.error(e); }
    setEditQtd(e=>({...e,[row.id]:undefined}));
  };

  const removerIngrediente = async (id) => {
    try {
      await fetch(`${SB_URL}/receita_ingredientes?id=eq.${id}`, { method:"DELETE", headers:SB_H });
      const novosIngs = ingredientes.filter(r => r.id !== id);
      setIngredientes(novosIngs);
      const novoCusto = novosIngs.reduce((s,x)=>{ const ins=getInsumo(x.insumo_cod); return s+(ins?Number(x.quantidade)*Number(ins.preco):0); },0)/rendimento;
      setReceitas(prev => prev.map(rec => rec.id===recSel.id ? {...rec,_custoUnitario:novoCusto} : rec));
      if (setRecIngredientes) setRecIngredientes(prev => [...prev.filter(i=>i.receita_id!==recSel.id), ...novosIngs]);
    } catch(e) { console.error(e); }
  };

  const excluirReceita = async (id) => {
    if (!window.confirm("Remover esta receita?")) return;
    try {
      await fetch(`${SB_URL}/receitas_base?id=eq.${id}`, { method:"PATCH", headers:{...SB_H,"Prefer":"return=minimal"}, body: JSON.stringify({ ativo: false }) });
      setReceitas(prev => prev.filter(r => r.id !== id));
      setRecSel(null);
    } catch(e) { console.error(e); }
  };

  const recFiltradas = receitas.filter(r => !fBusca || r.nome.toLowerCase().includes(fBusca.toLowerCase()));

  const thFT = (extra={}) => ({ padding:"7px 10px", fontSize:10, fontWeight:800, color:"#6b5f80", textTransform:"uppercase", letterSpacing:"0.06em", borderBottom:"1px solid #2d2640", background:"#13101e", ...extra });
  const tdFT = (extra={}) => ({ padding:"7px 10px", fontSize:12, color:"#c8b8e8", borderBottom:"1px solid #1a1628", ...extra });

  return (
    <div style={{ display:"flex", gap:12, alignItems:"flex-start", flexDirection:isMob?"column":"row" }}>

      {/* ── Lista de receitas (esquerda) ── */}
      <div style={{ width:isMob?"100%":260, flexShrink:0, display:"flex", flexDirection:"column", gap:8 }}>
        <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, padding:"12px 14px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <div>
              <div style={{ fontSize:12, fontWeight:800, color:"#9333ea" }}>📝 Receitas</div>
              <div style={{ fontSize:10, color:"#4a3f60" }}>{receitas.length} receita{receitas.length!==1?"s":""}</div>
            </div>
            <button onClick={()=>setNovaRec(true)}
              style={{ fontSize:10, fontWeight:700, padding:"5px 12px", borderRadius:6, border:"1px solid #9333ea", background:"#1a1030", color:"#c084fc", cursor:"pointer" }}>
              + Nova
            </button>
          </div>
          <input value={fBusca} onChange={e=>setFBusca(e.target.value)}
            placeholder="Buscar receita..." style={{ ...selS, width:"100%" }} />
        </div>

        <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:10, overflow:"hidden" }}>
          {recFiltradas.length === 0
            ? <div style={{ padding:"20px 14px", textAlign:"center", fontSize:11, color:"#4a3f60" }}>
                Nenhuma receita. Clique em "+ Nova" para criar.
              </div>
            : recFiltradas.map(rec => (
              <button key={rec.id} onClick={()=>setRecSel(rec)}
                style={{ display:"block", width:"100%", textAlign:"left", padding:"8px 14px",
                  background:recSel?.id===rec.id?"#1a1030":"transparent",
                  borderTop:"1px solid #13101e", border:"none",
                  color:recSel?.id===rec.id?"#e9d5ff":"#8a7fa0",
                  fontSize:11, cursor:"pointer" }}>
                <div style={{ fontWeight:600 }}>{rec.nome}</div>
                <div style={{ fontSize:9, color:"#4a3f60", marginTop:2 }}>
                  Rende: {Number(rec.rendimento).toLocaleString("pt-BR")} {rec.unid} ·
                  Custo: <span style={{color:"#f59e0b"}}>{fmt(rec._custoUnitario||0)}/{rec.unid}</span>
                </div>
              </button>
            ))
          }
        </div>
      </div>

      {/* ── Ficha da receita (direita) ── */}
      <div style={{ flex:1, minWidth:0 }}>
        {!recSel
          ? <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, padding:48, textAlign:"center" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>📝</div>
              <div style={{ fontSize:14, color:"#6b5f80", fontWeight:600 }}>Selecione ou crie uma receita</div>
              <div style={{ fontSize:12, color:"#4a3f60", marginTop:4 }}>Receitas aparecem como insumo na aba Fichas Técnicas.</div>
              <button onClick={()=>setNovaRec(true)} style={{ marginTop:16, padding:"8px 20px", borderRadius:8, border:"1px solid #9333ea", background:"#1a1030", color:"#c084fc", fontWeight:700, fontSize:12, cursor:"pointer" }}>
                + Criar primeira receita
              </button>
            </div>
          : <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {/* Header receita */}
              <div style={{ background:"linear-gradient(135deg,#1a0a2a,#2d1254)", border:"1.5px solid #9333ea", borderRadius:12, padding:"14px 18px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8 }}>
                  <div>
                    <div style={{ fontSize:15, fontWeight:900, color:"#e9d5ff" }}>📝 {recSel.nome}</div>
                    <div style={{ fontSize:11, color:"#9333ea", marginTop:2 }}>
                      Rende: <strong style={{color:"#f0e8ff"}}>{Number(recSel.rendimento).toLocaleString("pt-BR")} {recSel.unid}</strong>
                      {recSel.observacao && <span style={{marginLeft:8,color:"#6b5f80"}}>· {recSel.observacao}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:10, color:"#6b5f80" }}>Custo total da receita</div>
                    <div style={{ fontSize:18, fontWeight:900, color:"#f59e0b" }}>{fmt(custoTotalRec)}</div>
                    <div style={{ fontSize:11, color:"#9333ea", marginTop:2 }}>
                      → <strong style={{color:"#f0e8ff"}}>{fmt(custoUnitario)}</strong> / {recSel.unid}
                    </div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, marginTop:8 }}>
                  <div style={{ fontSize:10, background:"#9333ea22", border:"1px solid #9333ea44", padding:"3px 10px", borderRadius:6, color:"#c084fc" }}>
                    💡 Aparece como insumo "📝 {recSel.nome}" na aba Fichas Técnicas
                  </div>
                  <button onClick={()=>excluirReceita(recSel.id)}
                    style={{ fontSize:10, background:"none", border:"1px solid #7f1d1d", borderRadius:6, color:"#f87171", cursor:"pointer", padding:"3px 10px", marginLeft:"auto" }}>
                    🗑 Excluir receita
                  </button>
                </div>
              </div>

              {/* Tabela de ingredientes */}
              <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, overflow:"hidden" }}>
                <table style={{ borderCollapse:"collapse", width:"100%" }}>
                  <thead>
                    <tr>
                      <th style={thFT({ textAlign:"center", width:50 })}>Cód</th>
                      <th style={thFT({ textAlign:"left" })}>Insumo</th>
                      <th style={thFT({ textAlign:"center", width:70 })}>Unid.</th>
                      <th style={thFT({ textAlign:"right", width:90 })}>Quant.</th>
                      <th style={thFT({ textAlign:"right", width:100 })}>Custo</th>
                      <th style={thFT({ width:36 })}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredientes.length === 0 && (
                      <tr><td colSpan={6} style={tdFT({ textAlign:"center", color:"#4a3f60", padding:24 })}>Nenhum ingrediente. Adicione abaixo.</td></tr>
                    )}
                    {ingredientes.map((row, i) => {
                      const ins   = getInsumo(row.insumo_cod);
                      const valor = custoIng(row);
                      const edit  = editQtd[row.id] !== undefined;
                      return (
                        <tr key={row.id} style={{ background:i%2===0?"#0d0b15":"#100e1b" }}>
                          <td style={tdFT({ textAlign:"center", color:"#4a3f60", fontSize:11 })}>{ins?.cod||"—"}</td>
                          <td style={tdFT({ fontWeight:500 })}>{ins?.nome||<span style={{color:"#f87171"}}>Não encontrado</span>}</td>
                          <td style={tdFT({ textAlign:"center", color:"#8a7fa0", fontSize:11 })}>{ins?.unid||"—"}</td>
                          <td style={tdFT({ textAlign:"right" })}>
                            {edit
                              ? <input type="number" step="0.001" min="0" autoFocus value={editQtd[row.id]}
                                  onChange={e=>setEditQtd(q=>({...q,[row.id]:e.target.value}))}
                                  onBlur={e=>salvarQtdIng(row,e.target.value)}
                                  onKeyDown={e=>{ if(e.key==="Enter") e.target.blur(); if(e.key==="Escape") setEditQtd(q=>({...q,[row.id]:undefined})); }}
                                  style={{ ...iStyle, width:70, textAlign:"right", fontSize:12, padding:"2px 6px", borderColor:"#9333ea" }} />
                              : <span onClick={()=>setEditQtd(q=>({...q,[row.id]:String(row.quantidade)}))}
                                  style={{ cursor:"pointer", borderBottom:"1px dashed #4a3f60", paddingBottom:1 }} title="Clique para editar">
                                  {Number(row.quantidade).toLocaleString("pt-BR",{maximumFractionDigits:4})}
                                </span>
                            }
                          </td>
                          <td style={tdFT({ textAlign:"right", fontWeight:700, color:valor>0?"#f59e0b":"#3a3060" })}>
                            {valor > 0 ? fmt(valor) : "—"}
                          </td>
                          <td style={tdFT({ textAlign:"center" })}>
                            <button onClick={()=>removerIngrediente(row.id)} style={{ background:"none", border:"none", color:"#f87171", cursor:"pointer", fontSize:12 }}>🗑</button>
                          </td>
                        </tr>
                      );
                    })}
                    {ingredientes.length > 0 && (
                      <>
                        <tr style={{ background:"#1a1030", borderTop:"1px solid #3730a3" }}>
                          <td colSpan={4} style={{ padding:"7px 10px", fontSize:11, fontWeight:700, color:"#9333ea", textAlign:"right" }}>Total da receita</td>
                          <td style={{ padding:"7px 10px", fontSize:13, fontWeight:900, color:"#f59e0b", textAlign:"right" }}>{fmt(custoTotalRec)}</td>
                          <td></td>
                        </tr>
                        <tr style={{ background:"#12002a", borderTop:"1px solid #6d28d9" }}>
                          <td colSpan={4} style={{ padding:"7px 10px", fontSize:11, fontWeight:700, color:"#c084fc", textAlign:"right" }}>
                            Custo por {recSel.unid} (÷ {Number(recSel.rendimento)} {recSel.unid})
                          </td>
                          <td style={{ padding:"7px 10px", fontSize:14, fontWeight:900, color:"#c084fc", textAlign:"right" }}>{fmt(custoUnitario)}</td>
                          <td></td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Adicionar ingrediente */}
              <div style={{ background:"#0d0b15", border:"1.5px solid #2d1254", borderRadius:12, padding:"12px 14px" }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#9333ea", marginBottom:8 }}>+ Adicionar Ingrediente</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"flex-end" }}>
                  <div style={{ display:"flex", flexDirection:"column", gap:3, flex:2, minWidth:180 }}>
                    <label style={{ fontSize:9, color:"#6b5f80", textTransform:"uppercase" }}>Insumo</label>
                    <select value={addIng.insumo_cod} onChange={e=>setAddIng(f=>({...f,insumo_cod:e.target.value}))}
                      style={{ ...selS, borderColor:addIng.insumo_cod?"#9333ea":"" }}>
                      <option value="">Selecione o insumo...</option>
                      {[...insumos].sort((a,b)=>a.nome.localeCompare(b.nome)).map(i=>(
                        <option key={i.cod} value={i.cod}>{i.nome} ({i.unid}) — {fmt(i.preco)}/{i.unid}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:3, width:90 }}>
                    <label style={{ fontSize:9, color:"#6b5f80", textTransform:"uppercase" }}>
                      Qtd {addIng.insumo_cod ? "("+getInsumo(Number(addIng.insumo_cod))?.unid+")" : ""}
                    </label>
                    <input type="number" step="0.001" min="0" value={addIng.quantidade}
                      onChange={e=>setAddIng(f=>({...f,quantidade:e.target.value}))}
                      onKeyDown={e=>{ if(e.key==="Enter") adicionarIngrediente(); }}
                      placeholder="0,000" style={{ ...selS, textAlign:"right", borderColor:addIng.quantidade?"#9333ea":"" }} />
                  </div>
                  {addIng.insumo_cod && addIng.quantidade && (
                    <div style={{ fontSize:11, color:"#f59e0b", paddingBottom:6 }}>
                      = {fmt(Number(addIng.quantidade) * Number(getInsumo(Number(addIng.insumo_cod))?.preco||0))}
                    </div>
                  )}
                  <button onClick={adicionarIngrediente} disabled={salvando||!addIng.insumo_cod||!addIng.quantidade}
                    style={{ padding:"7px 18px", borderRadius:8, border:"none", background:(!addIng.insumo_cod||!addIng.quantidade)?"#1a0a2a":"#7c3aed",
                      color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer", flexShrink:0, opacity:salvando?0.6:1 }}>
                    {salvando?"...":"Adicionar"}
                  </button>
                </div>
              </div>
            </div>
        }
      </div>

      {/* Modal: Nova receita */}
      {novaRec && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
          onClick={()=>setNovaRec(false)}>
          <div style={{ background:"#13101e", borderRadius:14, border:"1.5px solid #9333ea", padding:24, width:"100%", maxWidth:440 }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:14, fontWeight:800, color:"#c084fc", marginBottom:16 }}>📝 Nova Receita</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div>
                <label style={{ fontSize:10, color:"#6b5f80", display:"block", marginBottom:4, textTransform:"uppercase" }}>Nome *</label>
                <input value={novaForm.nome} onChange={e=>setNovaForm(f=>({...f,nome:e.target.value}))}
                  placeholder="Ex: Massa cookie tradicional" style={{ ...selS, width:"100%" }}
                  autoFocus onKeyDown={e=>{ if(e.key==="Enter") criarReceita(); }} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <div>
                  <label style={{ fontSize:10, color:"#6b5f80", display:"block", marginBottom:4, textTransform:"uppercase" }}>Unidade do Rendimento</label>
                  <select value={novaForm.unid} onChange={e=>setNovaForm(f=>({...f,unid:e.target.value}))} style={{ ...selS, width:"100%" }}>
                    {["KG","Gr","Ml","Litro","Unidade","Cx"].map(u=><option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:10, color:"#6b5f80", display:"block", marginBottom:4, textTransform:"uppercase" }}>Rendimento</label>
                  <input type="number" step="0.01" min="0.01" value={novaForm.rendimento} onChange={e=>setNovaForm(f=>({...f,rendimento:e.target.value}))}
                    placeholder="Ex: 1.5" style={{ ...selS, width:"100%", textAlign:"right" }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize:10, color:"#6b5f80", display:"block", marginBottom:4, textTransform:"uppercase" }}>Observação (opcional)</label>
                <input value={novaForm.observacao} onChange={e=>setNovaForm(f=>({...f,observacao:e.target.value}))}
                  placeholder="Ex: 15 bateladas, conservar refrigerado..." style={{ ...selS, width:"100%" }} />
              </div>
              <div style={{ fontSize:10, color:"#6b5f80", background:"#1a1030", padding:"8px 10px", borderRadius:6, lineHeight:1.6 }}>
                💡 Após criar, adicione os ingredientes. O custo por {novaForm.unid||"unidade"} é calculado automaticamente e a receita aparecerá como insumo nas Fichas Técnicas.
              </div>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:16 }}>
              <button onClick={criarReceita} disabled={salvando||!novaForm.nome?.trim()}
                style={{ flex:1, padding:"10px", borderRadius:8, border:"none", background:"#7c3aed", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer", opacity:(!novaForm.nome||salvando)?0.5:1 }}>
                {salvando?"Criando...":"Criar receita"}
              </button>
              <button onClick={()=>setNovaRec(false)}
                style={{ padding:"10px 16px", borderRadius:8, border:"1px solid #3a3060", background:"none", color:"#8a7fa0", cursor:"pointer" }}>✕</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── INSUMOS TAB (preços da matéria-prima) ───────────────────────────────────
function InsumosPrecosTab({ insumos, compras = [], onUpdateInsumo }) {
  const [fBusca, setFBusca] = useState("");
  const [fUnid,  setFUnid]  = useState("");
  const [ordenar,setOrdenar]= useState("nome");
  const [editPreco, setEditPreco] = useState({});
  const [historico, setHistorico] = useState(null);

  const SB_URL = "https://wmlecjrkqwoejuryeayz.supabase.co/rest/v1";
  const SB_KEY_V = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbGVjanJrcXdvZWp1cnllYXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDgyMDYsImV4cCI6MjA5MTMyNDIwNn0.SAYFGBZFjvLn9jIEs8J5mR93ZY7HlYQbT43YTn8JKnI";
  const SB_H = { "Content-Type":"application/json","apikey":SB_KEY_V,"Authorization":"Bearer "+SB_KEY_V };

  const isMob = typeof window !== "undefined" && window.innerWidth < 768;
  const selS = { ...iStyle, fontSize:12, padding:"6px 8px", cursor:"pointer" };
  const lista = insumos?.length ? insumos : INSUMOS_PLANILHA;
  const unidades = [...new Set(lista.map(i=>i.unid).filter(Boolean))].sort();
  const filtrados = lista.filter(i => {
    if (fUnid && i.unid !== fUnid) return false;
    if (fBusca && !i.nome.toLowerCase().includes(fBusca.toLowerCase())) return false;
    return true;
  }).sort((a,b) => {
    if (ordenar === "preco_desc") return b.preco - a.preco;
    if (ordenar === "preco_asc")  return a.preco - b.preco;
    return a.nome.localeCompare(b.nome);
  });
  const maxPreco = Math.max(...filtrados.map(i=>i.preco),1);

  const comprasDoInsumo = (cod) => compras.filter(c => c.insumo_cod === cod).sort((a,b)=>b.id-a.id);
  const ultimaCompra    = (cod) => comprasDoInsumo(cod)[0];

  const salvarPreco = async (ins) => {
    const novoPreco = Number(String(editPreco[ins.cod]||ins.preco).replace(",","."));
    if (!novoPreco || novoPreco === ins.preco) { setEditPreco(e=>({...e,[ins.cod]:undefined})); return; }
    try {
      await fetch(`${SB_URL}/insumos?cod=eq.${ins.cod}`, { method:"PATCH", headers:{...SB_H,"Prefer":"return=minimal"}, body: JSON.stringify({ preco: novoPreco, updated_at: new Date().toISOString() }) });
      if (onUpdateInsumo) onUpdateInsumo(ins.cod, novoPreco);
    } catch(e) { console.error("Erro ao atualizar preço:", e); }
    setEditPreco(e=>({...e,[ins.cod]:undefined}));
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, padding:"12px 16px" }}>
        <div style={{ fontSize:13, fontWeight:800, color:"#4ade80", marginBottom:2 }}>🌿 Insumos — Preços da Matéria-Prima</div>
        <div style={{ fontSize:11, color:"#6b5f80" }}>
          <strong style={{color:"#f0e8ff"}}>{lista.length}</strong> insumos cadastrados ·
          <span style={{color:"#818cf8", marginLeft:4}}>Clique no preço para editar · 📋 = ver histórico de compras</span>
        </div>
      </div>
      <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, padding:"12px 14px" }}>
        <div style={{ display:"grid", gridTemplateColumns: isMob?"1fr 1fr":"1fr 1fr 1fr 1fr", gap:8 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
            <label style={{ fontSize:10, color:"#6b5f80", fontWeight:600, textTransform:"uppercase" }}>🔍 Busca</label>
            <input value={fBusca} onChange={e=>setFBusca(e.target.value)} placeholder="Nome do insumo..." style={{ ...selS, borderColor: fBusca?"#4ade80":"" }} />
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
            <label style={{ fontSize:10, color:"#6b5f80", fontWeight:600, textTransform:"uppercase" }}>Unidade</label>
            <select value={fUnid} onChange={e=>setFUnid(e.target.value)} style={{ ...selS, borderColor: fUnid?"#4ade80":"" }}>
              <option value="">Todas</option>
              {unidades.map(u=><option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
            <label style={{ fontSize:10, color:"#6b5f80", fontWeight:600, textTransform:"uppercase" }}>Ordenar</label>
            <select value={ordenar} onChange={e=>setOrdenar(e.target.value)} style={selS}>
              <option value="nome">Nome A-Z</option>
              <option value="preco_desc">Maior preço</option>
              <option value="preco_asc">Menor preço</option>
            </select>
          </div>
          <div style={{ display:"flex", alignItems:"flex-end" }}>
            <span style={{ fontSize:11, color:"#8a7fa0" }}><strong style={{color:"#f0e8ff"}}>{filtrados.length}</strong> insumos</span>
          </div>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns: isMob?"1fr":"1fr 1fr", gap:6 }}>
        {filtrados.map((ins,i)=>{
          const barW = maxPreco>0?(ins.preco/maxPreco*100):0;
          const cor  = ins.preco>50?"#f87171":ins.preco>20?"#f59e0b":"#4ade80";
          const ult  = ultimaCompra(ins.cod);
          const edit = editPreco[ins.cod] !== undefined;
          return (
            <div key={ins.cod||i} style={{ background:i%2===0?"#13101e":"#100e1b", border:"1px solid #1a1628", borderRadius:8, padding:"10px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:11, fontWeight:600, color:"#c8b8e8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ins.nome}</div>
                <div style={{ height:2, background:"#1a1628", marginTop:4, borderRadius:99 }}>
                  <div style={{ height:"100%", width:`${barW}%`, background:cor, borderRadius:99, opacity:0.6 }}/>
                </div>
                {ult && <div style={{ fontSize:9, color:"#3a3255", marginTop:3 }}>Última compra: {fmtDate(ult.data)} · {fmt(ult.preco_unitario)}/{ins.unid}</div>}
              </div>
              <div style={{ textAlign:"right", flexShrink:0, marginLeft:8 }}>
                {edit
                  ? <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                      <input type="number" step="0.01" min="0" autoFocus value={editPreco[ins.cod]}
                        onChange={e=>setEditPreco(ep=>({...ep,[ins.cod]:e.target.value}))}
                        onKeyDown={e=>{ if(e.key==="Enter") salvarPreco(ins); if(e.key==="Escape") setEditPreco(ep=>({...ep,[ins.cod]:undefined})); }}
                        style={{ ...iStyle, width:80, fontSize:12, padding:"3px 6px", textAlign:"right", borderColor:"#f59e0b" }} />
                      <button onClick={()=>salvarPreco(ins)} style={{ fontSize:11, background:"#16a34a", color:"#fff", border:"none", borderRadius:4, padding:"3px 8px", cursor:"pointer" }}>✓</button>
                      <button onClick={()=>setEditPreco(ep=>({...ep,[ins.cod]:undefined}))} style={{ fontSize:11, background:"none", color:"#6b5f80", border:"none", cursor:"pointer" }}>✕</button>
                    </div>
                  : <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                      {comprasDoInsumo(ins.cod).length > 0 && (
                        <button onClick={()=>setHistorico(ins)} title="Ver histórico"
                          style={{ fontSize:12, background:"none", border:"1px solid #2d2640", borderRadius:4, color:"#818cf8", cursor:"pointer", padding:"2px 6px" }}>
                          📋 {comprasDoInsumo(ins.cod).length}
                        </button>
                      )}
                      <div>
                        <div title="Clique para editar" onClick={()=>setEditPreco(ep=>({...ep,[ins.cod]:String(ins.preco)}))}
                          style={{ fontSize:13, fontWeight:800, color:cor, cursor:"pointer", borderBottom:"1px dashed "+cor+"66" }}>
                          {fmt(ins.preco)}
                        </div>
                        <div style={{ fontSize:9, color:"#4a3f60" }}>/{ins.unid}</div>
                      </div>
                    </div>
                }
              </div>
            </div>
          );
        })}
      </div>
      {historico && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={()=>setHistorico(null)}>
          <div style={{ background:"#13101e", borderRadius:16, border:"1.5px solid #2d2640", width:"100%", maxWidth:600, maxHeight:"85vh", overflow:"hidden", display:"flex", flexDirection:"column" }} onClick={e=>e.stopPropagation()}>
            <div style={{ padding:"14px 18px", borderBottom:"1px solid #2d2640", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#1a1628" }}>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:"#4ade80" }}>📋 {historico.nome}</div>
                <div style={{ fontSize:11, color:"#6b5f80", marginTop:2 }}>Preço atual: <strong style={{color:"#f59e0b"}}>{fmt(historico.preco)}/{historico.unid}</strong></div>
              </div>
              <button onClick={()=>setHistorico(null)} style={{ background:"none", border:"none", color:"#8a7fa0", cursor:"pointer", fontSize:20 }}>✕</button>
            </div>
            <div style={{ overflowY:"auto", padding:16 }}>
              {comprasDoInsumo(historico.cod).map((c,i)=>(
                <div key={c.id} style={{ padding:"10px 12px", borderBottom:"1px solid #1a1628", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:12, color:"#c8b8e8", fontWeight:600 }}>{fmtDate(c.data)} · {Number(c.quantidade).toLocaleString("pt-BR")} {c.unid}</div>
                    <div style={{ fontSize:10, color:"#4a3f60" }}>{fmt(c.preco_unitario)}/{c.unid}{c.fornecedor?" · "+c.fornecedor:""}</div>
                  </div>
                  <div style={{ fontSize:13, fontWeight:800, color:"#f59e0b" }}>{fmt(Number(c.quantidade)*Number(c.preco_unitario))}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── COMPRAS / ENTRADAS DE MERCADORIA ────────────────────────────────────────
function ComprasTab({ insumos, compras, onSaveCompra, onDeleteCompra, onUpdateInsumo, onAddInsumo }) {
  const SB_URL = "https://wmlecjrkqwoejuryeayz.supabase.co/rest/v1";
  const SB_KEY_V = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbGVjanJrcXdvZWp1cnllYXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDgyMDYsImV4cCI6MjA5MTMyNDIwNn0.SAYFGBZFjvLn9jIEs8J5mR93ZY7HlYQbT43YTn8JKnI";
  const SB_H = { "Content-Type":"application/json","apikey":SB_KEY_V,"Authorization":"Bearer "+SB_KEY_V };

  const hoje = () => new Date().toISOString().slice(0,10);

  // ── Multi-item: lista de itens para registrar de uma vez ──────────────────
  const itemVazio = () => ({ id: Date.now()+Math.random(), insumo_cod:"", quantidade:"", valor_total:"", preco_unitario:"", observacao:"" });
  const [dataCompra, setDataCompra] = useState(hoje());
  const [fornecedor, setFornecedor] = useState("");
  const [itens, setItens] = useState([itemVazio()]);
  const [salvando, setSalvando] = useState(false);

  // Compatibilidade: form legado para o scan de nota
  const [form, setForm] = useState({ data: hoje(), insumo_cod:"", quantidade:"", preco_unitario:"", fornecedor:"", observacao:"" });

  const atualizarItem = (id, campo, valor) => {
    setItens(prev => prev.map(it => {
      if (it.id !== id) return it;
      const novo = { ...it, [campo]: valor };
      // Calcular preco_unitario automaticamente
      const qtd = parseFloat(String(campo==="quantidade"?valor:novo.quantidade).replace(",",".")) || 0;
      const vt  = parseFloat(String(campo==="valor_total"?valor:novo.valor_total).replace(",",".")) || 0;
      if (qtd > 0 && vt > 0) novo.preco_unitario = (vt / qtd).toFixed(4);
      else if (campo==="preco_unitario") novo.preco_unitario = valor; // edição manual
      return novo;
    }));
  };

  const adicionarItem  = () => setItens(prev => [...prev, itemVazio()]);
  const removerItem    = (id) => setItens(prev => prev.length > 1 ? prev.filter(it=>it.id!==id) : prev);
  const totalGeral     = itens.reduce((s,it) => s + (parseFloat(String(it.valor_total).replace(",",".")) || 0), 0);
  const itensValidos   = itens.filter(it => it.insumo_cod && it.quantidade && it.preco_unitario);
  const [fBusca, setFBusca] = useState("");
  const [fMes, setFMes] = useState("");
  const [novoInsumo, setNovoInsumo] = useState({ nome:"", unid:"KG" });
  const [mostrarNovoInsumo, setMostrarNovoInsumo] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [scanStatus, setScanStatus] = useState("idle"); // idle | scanning | done | error
  const [scanResultados, setScanResultados] = useState([]); // lista de itens extraídos
  const [scanPreview, setScanPreview] = useState(null); // base64 da imagem
  const fileInputRef = useRef(null);
  const isMob = window.innerWidth < 768;
  const selS = { ...iStyle, fontSize:12, padding:"6px 8px", cursor:"pointer" };

  // ── Escanear nota fiscal via Claude API ────────────────────────────────────
  const escanearNota = async (file) => {
    if (!file) return;
    setScanStatus("scanning");
    setScanResultados([]);

    // Converter para base64
    const base64 = await new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result.split(",")[1]);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });
    const mediaType = file.type || "image/jpeg";
    setScanPreview(`data:${mediaType};base64,${base64}`);

    // Lista de insumos para ajudar o Claude a mapear
    const listaInsumos = insumos.map(i => `${i.cod}: ${i.nome} (${i.unid})`).join("\n");

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: base64 }
              },
              {
                type: "text",
                text: `Você é um assistente que extrai dados de notas fiscais para um sistema de controle de estoque de confeitaria.

Analise esta imagem de nota fiscal/cupom fiscal e extraia os itens comprados.

Temos os seguintes insumos cadastrados no sistema:
${listaInsumos}

Para cada item da nota, retorne um JSON array com os campos:
- insumo_cod: número do código do insumo mais próximo da lista acima (ou null se não encontrar)
- insumo_nome: nome do item na nota (texto original)
- quantidade: quantidade comprada (número decimal)
- preco_unitario: preço por unidade/kg/litro (número decimal em reais)
- fornecedor: nome do estabelecimento/fornecedor da nota (string ou null)
- data: data da compra no formato YYYY-MM-DD (ou null se não visível)

Retorne APENAS o JSON array puro, sem explicações, sem markdown, sem crases ou blocos de código.
Exemplo: [{"insumo_cod":13,"insumo_nome":"Farinha de trigo","quantidade":5,"preco_unitario":4.99,"fornecedor":"Mercado X","data":"2026-04-15"}]

Se não conseguir identificar itens, retorne [].`
              }
            ]
          }]
        })
      });

      const data = await response.json();
      const texto = data.content?.[0]?.text || "[]";

      let itens = [];
      try {
        // Limpa possíveis backticks residuais
        const clean = texto.replace(/```json|```/g,"").trim();
        itens = JSON.parse(clean);
        if (!Array.isArray(itens)) itens = [];
      } catch(e) { itens = []; }

      setScanResultados(itens);
      setScanStatus(itens.length > 0 ? "done" : "error");
    } catch(e) {
      console.error("Erro ao escanear nota:", e);
      setScanStatus("error");
    }
  };

  const aplicarItemScan = (item) => {
    // Tenta achar o insumo pelo cod sugerido, ou pelo nome
    let insumoMatch = insumos.find(i => i.cod === Number(item.insumo_cod));
    if (!insumoMatch && item.insumo_nome) {
      const nomeLower = item.insumo_nome.toLowerCase();
      insumoMatch = insumos.find(i => i.nome.toLowerCase().includes(nomeLower.slice(0,6)) || nomeLower.includes(i.nome.toLowerCase().slice(0,6)));
    }
    setForm({
      data:           item.data || hoje(),
      insumo_cod:     insumoMatch ? String(insumoMatch.cod) : "",
      quantidade:     item.quantidade ? String(item.quantidade) : "",
      preco_unitario: item.preco_unitario ? String(item.preco_unitario) : "",
      fornecedor:     item.fornecedor || "",
      observacao:     insumoMatch ? "" : `Insumo não encontrado: ${item.insumo_nome}`,
    });
    // Scroll para o formulário
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const insumoSel = insumos.find(i => i.cod === Number(form.insumo_cod));
  const totalCompra = (Number(form.quantidade||0) * Number(String(form.preco_unitario).replace(",",".")||0));

  const meses = [...new Set(compras.map(c => c.data?.slice(0,7)).filter(Boolean))].sort().reverse();
  const comprasFilt = compras.filter(c => {
    if (fMes && c.data?.slice(0,7) !== fMes) return false;
    if (fBusca && !c.insumo_nome?.toLowerCase().includes(fBusca.toLowerCase())) return false;
    return true;
  }).sort((a,b) => b.id - a.id);

  const totalPeriodo = comprasFilt.reduce((s,c) => s + Number(c.preco_total||0), 0);

  const salvarCompra = async () => {
    if (itensValidos.length === 0) return;
    setSalvando(true);
    try {
      for (const it of itensValidos) {
        const ins = insumos.find(i => i.cod === Number(it.insumo_cod));
        const pu  = parseFloat(String(it.preco_unitario).replace(",","."));
        const qtd = parseFloat(String(it.quantidade).replace(",","."));
        const vt  = parseFloat(String(it.valor_total).replace(",",".")) || pu * qtd;
        const registro = {
          id: Date.now() + Math.floor(Math.random()*1000),
          data: dataCompra,
          insumo_cod:    Number(it.insumo_cod),
          insumo_nome:   ins?.nome || "",
          quantidade:    qtd,
          unid:          ins?.unid || "KG",
          preco_unitario: pu,
          preco_total:   vt,
          fornecedor:    fornecedor || null,
          observacao:    it.observacao || null,
        };
        await fetch(`${SB_URL}/compras`, { method:"POST", headers:{ ...SB_H,"Prefer":"return=minimal" }, body: JSON.stringify(registro) });
        await fetch(`${SB_URL}/insumos?cod=eq.${it.insumo_cod}`, { method:"PATCH", headers:{ ...SB_H,"Prefer":"return=minimal" }, body: JSON.stringify({ preco: pu, updated_at: new Date().toISOString() }) });
        onSaveCompra(registro);
        onUpdateInsumo(Number(it.insumo_cod), pu);
      }
      // Limpa o formulário mantendo data e fornecedor
      setItens([itemVazio()]);
    } catch(e) { console.error("Erro ao salvar compras:", e); }
    setSalvando(false);
  };

  const salvarNovoInsumo = async () => {
    if (!novoInsumo.nome.trim()) return;
    const cod = Math.max(0, ...insumos.map(i=>i.cod)) + 1;
    const ins = { cod, nome: novoInsumo.nome.trim(), unid: novoInsumo.unid, preco: 0 };
    try {
      await fetch(`${SB_URL}/insumos`, { method:"POST", headers:{ ...SB_H,"Prefer":"return=minimal" }, body: JSON.stringify(ins) });
      onAddInsumo(ins);
      setNovoInsumo({ nome:"", unid:"KG" });
      setMostrarNovoInsumo(false);
    } catch(e) { console.error("Erro ao criar insumo:", e); }
  };

  const deletarCompra = async (c) => {
    try {
      await fetch(`${SB_URL}/compras?id=eq.${c.id}`, { method:"DELETE", headers:SB_H });
      onDeleteCompra(c.id);
    } catch(e) { console.error("Erro ao deletar:", e); }
    setConfirmDel(null);
  };

  const MESES_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const fmtMes = m => { if(!m) return ""; const [y,mo]=m.split("-"); return `${MESES_PT[parseInt(mo)-1]}/${y}`; };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {/* Header */}
      <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:800, color:"#c084fc", marginBottom:2 }}>🛒 Entradas de Mercadoria</div>
          <div style={{ fontSize:11, color:"#6b5f80" }}>{insumos.length} insumos cadastrados · {compras.length} compras registradas</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>fileInputRef.current?.click()}
            style={{ fontSize:11, fontWeight:700, padding:"7px 14px", borderRadius:8, border:"1px solid #f59e0b", background:"#1a1000", color:"#f59e0b", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            📷 Escanear Nota
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display:"none" }}
            onChange={e=>{ if(e.target.files[0]) escanearNota(e.target.files[0]); e.target.value=""; }} />
          <button onClick={()=>setMostrarNovoInsumo(v=>!v)}
            style={{ fontSize:11, fontWeight:700, padding:"6px 14px", borderRadius:8, border:"1px solid #7c3aed", background:"#2d1254", color:"#e9d5ff", cursor:"pointer" }}>
            + Novo Insumo
          </button>
        </div>
      </div>

      {/* Painel de scan da nota fiscal */}
      {scanStatus !== "idle" && (
        <div style={{ background:"#13101e", border:"1.5px solid " + (scanStatus==="error"?"#f87171":scanStatus==="scanning"?"#f59e0b":"#4ade80"), borderRadius:12, overflow:"hidden" }}>
          <div style={{ padding:"12px 16px", background:"#0d0b15", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:22 }}>{scanStatus==="scanning"?"⏳":scanStatus==="done"?"✅":"❌"}</span>
              <div>
                <div style={{ fontSize:13, fontWeight:800, color:scanStatus==="error"?"#f87171":scanStatus==="scanning"?"#f59e0b":"#4ade80" }}>
                  {scanStatus==="scanning" ? "Analisando nota fiscal com IA..." : scanStatus==="done" ? scanResultados.length+" item"+(scanResultados.length!==1?"s":"")+" identificado"+(scanResultados.length!==1?"s":"") : "Não foi possível identificar itens"}
                </div>
                <div style={{ fontSize:10, color:"#6b5f80", marginTop:2 }}>
                  {scanStatus==="scanning" ? "Aguarde, isso pode levar alguns segundos..." : scanStatus==="done" ? "Clique em um item para preencher o formulário" : "Tente uma foto mais nítida e bem iluminada"}
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              {scanPreview && (
                <img src={scanPreview} alt="Nota" style={{ height:48, width:48, objectFit:"cover", borderRadius:6, border:"1px solid #2d2640", cursor:"pointer" }}
                  onClick={()=>window.open(scanPreview,"_blank")} title="Ver imagem completa" />
              )}
              <button onClick={()=>{ setScanStatus("idle"); setScanResultados([]); setScanPreview(null); }}
                style={{ background:"none", border:"none", color:"#6b5f80", cursor:"pointer", fontSize:20, padding:"0 4px" }}>✕</button>
            </div>
          </div>
          {scanStatus==="done" && scanResultados.length > 0 && (
            <div>
              {scanResultados.map((item, idx) => {
                const matchCod  = insumos.find(i => i.cod === Number(item.insumo_cod));
                const matchNome = !matchCod && item.insumo_nome
                  ? insumos.find(i => i.nome.toLowerCase().includes((item.insumo_nome||"").toLowerCase().slice(0,6)))
                  : null;
                const insumoFinal = matchCod || matchNome;
                const total = item.quantidade && item.preco_unitario ? Number(item.quantidade)*Number(item.preco_unitario) : 0;
                return (
                  <div key={idx}
                    style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 16px", borderTop:"1px solid #1a1628", cursor:"pointer" }}
                    onClick={()=>aplicarItemScan(item)}
                    onMouseEnter={e=>e.currentTarget.style.background="#1a1628"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                        <span style={{ fontSize:12, fontWeight:700, color:"#f0e8ff" }}>{item.insumo_nome}</span>
                        {insumoFinal
                          ? <span style={{ fontSize:10, background:"#0a1f0a", border:"1px solid #1a3a1a", color:"#4ade80", padding:"1px 6px", borderRadius:4 }}>✓ {insumoFinal.nome}</span>
                          : <span style={{ fontSize:10, background:"#1a0a0a", border:"1px solid #3a1a1a", color:"#f87171", padding:"1px 6px", borderRadius:4 }}>⚠ Não mapeado</span>
                        }
                      </div>
                      <div style={{ fontSize:11, color:"#6b5f80", marginTop:3 }}>
                        {item.quantidade && <span>{Number(item.quantidade).toLocaleString("pt-BR")} × </span>}
                        {item.preco_unitario && <span style={{color:"#f59e0b"}}>{fmt(item.preco_unitario)}</span>}
                        {item.fornecedor && <span style={{marginLeft:8}}>· {item.fornecedor}</span>}
                        {item.data && <span style={{marginLeft:8}}>· {fmtDate(item.data)}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0, marginLeft:12 }}>
                      {total > 0 && <div style={{ fontSize:13, fontWeight:800, color:"#c084fc" }}>{fmt(total)}</div>}
                      <div style={{ fontSize:10, color:"#4a3f60", marginTop:2 }}>Clique para usar →</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Novo Insumo */}
      {mostrarNovoInsumo && (
        <div style={{ background:"#1a1030", border:"1.5px solid #7c3aed", borderRadius:12, padding:"14px 16px", display:"flex", gap:10, alignItems:"flex-end", flexWrap:"wrap" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:3, flex:1, minWidth:180 }}>
            <label style={{ fontSize:10, color:"#9333ea", fontWeight:700, textTransform:"uppercase" }}>Nome do Insumo</label>
            <input value={novoInsumo.nome} onChange={e=>setNovoInsumo(n=>({...n,nome:e.target.value}))}
              placeholder="Ex: Chocolate Amargo Premium" style={{ ...selS }} />
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
            <label style={{ fontSize:10, color:"#9333ea", fontWeight:700, textTransform:"uppercase" }}>Unidade</label>
            <select value={novoInsumo.unid} onChange={e=>setNovoInsumo(n=>({...n,unid:e.target.value}))} style={selS}>
              {["KG","Gr","Ml","Unidade","Litro","Cx"].map(u=><option key={u}>{u}</option>)}
            </select>
          </div>
          <button onClick={salvarNovoInsumo}
            style={{ padding:"6px 18px", borderRadius:8, border:"none", background:"#7c3aed", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer" }}>
            Criar
          </button>
          <button onClick={()=>setMostrarNovoInsumo(false)}
            style={{ padding:"6px 12px", borderRadius:8, border:"1px solid #3a3060", background:"none", color:"#8a7fa0", cursor:"pointer", fontSize:12 }}>
            Cancelar
          </button>
        </div>
      )}

      {/* ── Formulário multi-item ── */}
      <div style={{ background:"#13101e", border:"1.5px solid #1a3a20", borderRadius:12, padding:"14px 16px" }}>
        <div style={{ fontSize:12, fontWeight:700, color:"#4ade80", marginBottom:12 }}>📥 Registrar Nova Compra</div>

        {/* Data + Fornecedor — campos globais */}
        <div style={{ display:"grid", gridTemplateColumns: isMob?"1fr":"1fr 1fr", gap:8, marginBottom:14 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
            <label style={{ fontSize:10, color:"#6b5f80", fontWeight:600, textTransform:"uppercase" }}>📅 Data da Compra</label>
            <input type="date" value={dataCompra} onChange={e=>setDataCompra(e.target.value)} style={selS} />
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
            <label style={{ fontSize:10, color:"#6b5f80", fontWeight:600, textTransform:"uppercase" }}>🏭 Fornecedor (opcional)</label>
            <input value={fornecedor} onChange={e=>setFornecedor(e.target.value)}
              placeholder="Nome do fornecedor..." style={selS} />
          </div>
        </div>

        {/* Header das colunas */}
        <div style={{ display:"grid", gridTemplateColumns: isMob?"3fr 2fr 2fr 2fr":"3fr 1.5fr 1.8fr 1.8fr 1.8fr 1.5fr auto", gap:6, marginBottom:4, paddingBottom:6, borderBottom:"1px solid #1a1628" }}>
          {[["Insumo",""],["Qtd",""],["Valor Total","R$"],["Preço/Un","→ calculado"],["Observação",""],["",""]].map(([l,sub],i)=>
            i===5 ? <div key={i}/> :
            <div key={i} style={{ display:"flex", flexDirection:"column", gap:1 }}>
              <span style={{ fontSize:9, color:"#6b5f80", fontWeight:700, textTransform:"uppercase" }}>{l}</span>
              {sub && <span style={{ fontSize:8, color:"#3a3060" }}>{sub}</span>}
            </div>
          )}
        </div>

        {/* Linhas de itens */}
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {itens.map((it, idx) => {
            const ins = insumos.find(i => i.cod === Number(it.insumo_cod));
            const pu  = parseFloat(String(it.preco_unitario).replace(",",".")) || 0;
            const qtd = parseFloat(String(it.quantidade).replace(",",".")) || 0;
            const vt  = parseFloat(String(it.valor_total).replace(",",".")) || 0;
            const valido = it.insumo_cod && qtd > 0 && pu > 0;
            return (
              <div key={it.id} style={{ display:"grid", gridTemplateColumns: isMob?"3fr 2fr 2fr 2fr":"3fr 1.5fr 1.8fr 1.8fr 1.8fr 1.5fr auto", gap:6, alignItems:"center",
                background: valido?"#0a1f0a22":"transparent", borderRadius:8, padding:"4px 0" }}>

                {/* Insumo */}
                <select value={it.insumo_cod} onChange={e=>atualizarItem(it.id,"insumo_cod",e.target.value)}
                  style={{ ...selS, borderColor: it.insumo_cod?"#4ade80":"", fontSize:11 }}>
                  <option value="">Selecione...</option>
                  {[...insumos].sort((a,b)=>a.nome.localeCompare(b.nome)).map(i=>(
                    <option key={i.cod} value={i.cod}>{i.nome} ({i.unid})</option>
                  ))}
                </select>

                {/* Quantidade */}
                <input type="number" step="0.001" min="0" value={it.quantidade}
                  onChange={e=>atualizarItem(it.id,"quantidade",e.target.value)}
                  placeholder={ins?`${ins.unid}`:"qtd"}
                  style={{ ...selS, fontSize:12, borderColor:it.quantidade?"#4ade80":"", textAlign:"right" }} />

                {/* Valor Total */}
                <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                  <input type="number" step="0.01" min="0" value={it.valor_total}
                    onChange={e=>atualizarItem(it.id,"valor_total",e.target.value)}
                    placeholder="R$ total"
                    style={{ ...selS, fontSize:12, borderColor:it.valor_total?"#f59e0b":"", textAlign:"right" }} />
                </div>

                {/* Preço unitário — calculado ou manual */}
                <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                  <input type="number" step="0.0001" min="0" value={it.preco_unitario}
                    onChange={e=>atualizarItem(it.id,"preco_unitario",e.target.value)}
                    placeholder="R$/un"
                    style={{ ...selS, fontSize:12,
                      borderColor: pu>0?"#c084fc":"",
                      background: (qtd>0&&vt>0)?"#1a0a2a":"#1a1628",
                      color: pu>0?"#c084fc":"#6b5f80",
                      textAlign:"right" }} />
                  {qtd>0&&vt>0&&pu>0 && (
                    <span style={{ fontSize:8, color:"#9333ea", textAlign:"right" }}>
                      {fmt(vt)} ÷ {qtd} {ins?.unid||""}
                    </span>
                  )}
                </div>

                {/* Observação */}
                <input value={it.observacao} onChange={e=>atualizarItem(it.id,"observacao",e.target.value)}
                  placeholder="obs..." style={{ ...selS, fontSize:11 }} />

                {/* Total do item */}
                <div style={{ textAlign:"right", fontSize:11, fontWeight:700,
                  color: valido?"#4ade80":"#4a3f60", whiteSpace:"nowrap", minWidth:60 }}>
                  {valido ? fmt(vt||pu*qtd) : "—"}
                </div>

                {/* Botão remover */}
                {itens.length > 1 && (
                  <button onClick={()=>removerItem(it.id)}
                    style={{ background:"none", border:"none", color:"#f87171", cursor:"pointer", fontSize:16, padding:"0 4px", flexShrink:0 }}>
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Adicionar item + totais + salvar */}
        <div style={{ marginTop:12, paddingTop:10, borderTop:"1px solid #1a3a20", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <button onClick={adicionarItem}
              style={{ padding:"7px 14px", borderRadius:8, border:"1px dashed #1a3a20", background:"none", color:"#4ade80", cursor:"pointer", fontSize:11, fontWeight:700 }}>
              + Adicionar produto
            </button>
            {totalGeral > 0 && (
              <span style={{ fontSize:12, color:"#f59e0b" }}>
                Total geral: <strong>{fmt(totalGeral)}</strong>
                {itensValidos.length > 0 && <span style={{ color:"#4a3f60", fontSize:10, marginLeft:6 }}>({itensValidos.length} item{itensValidos.length!==1?"s":""})</span>}
              </span>
            )}
          </div>
          <button onClick={salvarCompra} disabled={salvando || itensValidos.length===0}
            style={{ padding:"9px 28px", borderRadius:8, border:"none",
              background: itensValidos.length===0?"#1a2e1a":"#16a34a",
              color:"#fff", fontWeight:800, fontSize:13, cursor: itensValidos.length===0?"not-allowed":"pointer",
              opacity: salvando?0.6:1 }}>
            {salvando ? "Salvando..." : `✓ Registrar ${itensValidos.length>1?itensValidos.length+" compras":"Compra"}`}
          </button>
        </div>
      </div>

      {/* Filtros do histórico */}
      <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, padding:"12px 14px", display:"flex", gap:8, flexWrap:"wrap", alignItems:"flex-end" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
          <label style={{ fontSize:10, color:"#6b5f80", fontWeight:600, textTransform:"uppercase" }}>🔍 Insumo</label>
          <input value={fBusca} onChange={e=>setFBusca(e.target.value)} placeholder="Buscar insumo..." style={{ ...selS, width:180 }} />
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
          <label style={{ fontSize:10, color:"#6b5f80", fontWeight:600, textTransform:"uppercase" }}>📅 Mês</label>
          <select value={fMes} onChange={e=>setFMes(e.target.value)} style={selS}>
            <option value="">Todos</option>
            {meses.map(m=><option key={m} value={m}>{fmtMes(m)}</option>)}
          </select>
        </div>
        <div style={{ fontSize:11, color:"#8a7fa0" }}>
          <strong style={{color:"#f0e8ff"}}>{comprasFilt.length}</strong> compras ·
          Total: <strong style={{color:"#f59e0b"}}>{fmt(totalPeriodo)}</strong>
        </div>
      </div>

      {/* Histórico de compras */}
      {comprasFilt.length === 0
        ? <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, padding:32, textAlign:"center", color:"#4a3f60", fontSize:12 }}>
            Nenhuma compra registrada ainda. Use o formulário acima para registrar a primeira entrada.
          </div>
        : <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {comprasFilt.map((c,i) => (
              <div key={c.id} style={{ background:i%2===0?"#13101e":"#100e1b", border:"1px solid #1a1628", borderRadius:10, padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginBottom:3 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:"#c8b8e8" }}>{c.insumo_nome}</span>
                    {c.fornecedor && <span style={{ fontSize:10, color:"#6b5f80", background:"#0d0b15", padding:"1px 6px", borderRadius:4 }}>{c.fornecedor}</span>}
                  </div>
                  <div style={{ fontSize:10, color:"#4a3f60" }}>
                    {fmtDate(c.data)} · {Number(c.quantidade).toLocaleString("pt-BR")} {c.unid} × {fmt(c.preco_unitario)}/{c.unid}
                    {c.observacao && <span style={{ marginLeft:6, color:"#3a3050" }}>· {c.observacao}</span>}
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:13, fontWeight:800, color:"#f59e0b" }}>{fmt(c.preco_total ?? Number(c.quantidade)*Number(c.preco_unitario))}</div>
                  {confirmDel === c.id
                    ? <div style={{ display:"flex", gap:4, marginTop:4 }}>
                        <button onClick={()=>deletarCompra(c)} style={{ fontSize:10, fontWeight:700, background:"#dc2626", color:"#fff", border:"none", borderRadius:4, padding:"2px 8px", cursor:"pointer" }}>Sim</button>
                        <button onClick={()=>setConfirmDel(null)} style={{ fontSize:10, background:"none", color:"#6b5f80", border:"none", cursor:"pointer" }}>✕</button>
                      </div>
                    : <button onClick={()=>setConfirmDel(c.id)} style={{ fontSize:10, background:"none", border:"1px solid #3a1a1a", borderRadius:4, color:"#f87171", cursor:"pointer", padding:"2px 6px", marginTop:4 }}>🗑</button>
                  }
                </div>
              </div>
            ))}
          </div>
      }

      {/* Modal de confirmação */}
    </div>
  );
}

// ─── PRECIFICAÇÃO TAB ────────────────────────────────────────────────────────
function PrecificacaoTab({ receitasProd = [], precifConfig, onUpdatePrecifConfig }) {
  const SB_URL   = "https://wmlecjrkqwoejuryeayz.supabase.co/rest/v1";
  const SB_KEY_V = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbGVjanJrcXdvZWp1cnllYXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDgyMDYsImV4cCI6MjA5MTMyNDIwNn0.SAYFGBZFjvLn9jIEs8J5mR93ZY7HlYQbT43YTn8JKnI";
  const SB_H = { "Content-Type":"application/json","apikey":SB_KEY_V,"Authorization":"Bearer "+SB_KEY_V };

  const [produtos,      setProdutos]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [fBusca,        setFBusca]        = useState("");
  const [fCat,          setFCat]          = useState("");
  const [subView,       setSubView]       = useState("tabela"); // "tabela" | "analise"
  const [editPrecoVenda,setEditPrecoVenda]= useState({});       // { [id]: string }
  const [salvando,      setSalvando]      = useState({});

  // Config de taxas (persiste em precifConfig)
  const cfg = precifConfig || { taxaImposto:0, taxaMaquina:2.99, taxaAplicativo:0, taxaComissao:0, despesasFixas:7836.03, pontoEquilibrio:14145, margemMedia:55.4 };
  const [editConfig, setEditConfig]   = useState(false);
  const [configDraft, setConfigDraft] = useState(null);
  const [salvandoConfig, setSalvandoConfig] = useState(false);
  const [configSalvo,    setConfigSalvo]    = useState(false);

  const isMob = typeof window !== "undefined" && window.innerWidth < 768;
  const selS  = { ...iStyle, fontSize:11, padding:"5px 8px", cursor:"pointer" };
  const thS   = (x={}) => ({ padding:"7px 10px", fontSize:10, fontWeight:800, color:"#6b5f80", textTransform:"uppercase", letterSpacing:"0.06em", borderBottom:"1px solid #2d2640", background:"#0d0b15", whiteSpace:"nowrap", ...x });
  const tdS   = (x={}) => ({ padding:"8px 10px", fontSize:12, borderBottom:"1px solid #1a1628", ...x });

  // ── Carregar produtos + rateio das despesas fixas ────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [rP, rDF] = await Promise.all([
          fetch(`${SB_URL}/catalogo_produtos?ativo=eq.true&order=categoria,subcategoria.nullsfirst,ordem,nome`, { headers: SB_H }),
          fetch(`${SB_URL}/despesas_fixas?select=valor`, { headers: SB_H }),
        ]);
        const d = await rP.json();
        const prods = Array.isArray(d) ? d : [];
        setProdutos(prods);
        // Calcula rateio e atualiza cfg
        try {
          const dfData = await rDF.json();
          if (Array.isArray(dfData) && dfData.length > 0 && prods.length > 0) {
            const totalDF = dfData.reduce((s, x) => s + Number(x.valor || 0), 0);
            const rateio  = Math.round((totalDF / prods.length) * 100) / 100;
            if (onUpdatePrecifConfig) onUpdatePrecifConfig(prev => ({
              ...(prev || {}),
              despesasFixas: rateio,
            }));
          }
        } catch(e) { console.warn("Rateio precif:", e); }
      } catch(e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  // ── Cruzar produto com receita de produção para pegar CMV ─────────────────
  // catalogo_produtos tem campo "receita_id" ou match por nome
  const getCMV = (prod) => {
    // tenta match por receita_id ou por nome
    const rec = receitasProd.find(r =>
      (prod.receita_id && r.id === prod.receita_id) ||
      r.nome.toLowerCase() === prod.nome.toLowerCase()
    );
    return rec ? (rec._custoUnitario || 0) : 0;
  };

  // ── Cálculos por produto ──────────────────────────────────────────────────
  const calcular = (prod) => {
    const pv      = Number(prod.preco_venda || 0);
    const cmv     = getCMV(prod);
    const cmvPct  = pv > 0 ? (cmv / pv * 100) : 0;
    const impPct  = Number(cfg.taxaImposto   || 0);
    const maqPct  = Number(cfg.taxaMaquina   || 0);
    const appPct  = Number(cfg.taxaAplicativo|| 0);
    const comPct  = Number(cfg.taxaComissao  || 0);
    const impR    = pv * impPct  / 100;
    const maqR    = pv * maqPct  / 100;
    const appR    = pv * appPct  / 100;
    const comR    = pv * comPct  / 100;
    const custoVar = cmv + impR + maqR + appR + comR;
    const custoVarPct = pv > 0 ? (custoVar / pv * 100) : 0;
    const lucro   = pv - custoVar;
    const margem  = pv > 0 ? (lucro / pv * 100) : 0;
    const markup  = cmv > 0 ? (lucro / cmv * 100) : 0;
    return { pv, cmv, cmvPct, impPct, impR, maqPct, maqR, appPct, appR, comPct, comR, custoVar, custoVarPct, lucro, margem, markup };
  };

  // ── Salvar preço de venda ─────────────────────────────────────────────────
  const salvarPrecoVenda = async (prod) => {
    const pv = Number(String(editPrecoVenda[prod.id] || "").replace(",","."));
    if (isNaN(pv) || pv < 0) { setEditPrecoVenda(e => ({...e, [prod.id]: undefined})); return; }
    setSalvando(s => ({...s, [prod.id]: true}));
    try {
      await fetch(`${SB_URL}/catalogo_produtos?id=eq.${prod.id}`, {
        method:"PATCH", headers:{...SB_H,"Prefer":"return=minimal"},
        body: JSON.stringify({ preco_venda: pv })
      });
      setProdutos(prev => prev.map(p => p.id === prod.id ? {...p, preco_venda: pv} : p));
    } catch(e) { console.error(e); }
    setSalvando(s => ({...s, [prod.id]: false}));
    setEditPrecoVenda(e => ({...e, [prod.id]: undefined}));
  };

  // ── Salvar config de taxas ────────────────────────────────────────────────
  const salvarConfig = async () => {
    const novo = {
      taxaImposto:    Number(String(configDraft.taxaImposto   ||0).replace(",",".")),
      taxaMaquina:    Number(String(configDraft.taxaMaquina   ||0).replace(",",".")),
      taxaAplicativo: Number(String(configDraft.taxaAplicativo||0).replace(",",".")),
      taxaComissao:   Number(String(configDraft.taxaComissao  ||0).replace(",",".")),
      despesasFixas:  Number(String(configDraft.despesasFixas ||0).replace(",",".")),
      pontoEquilibrio:Number(String(configDraft.pontoEquilibrio||0).replace(",",".")),
      margemMedia:    Number(String(configDraft.margemMedia   ||0).replace(",",".")),
    };
    setSalvandoConfig(true);
    try {
      await fetch(`${SB_URL}/config`, {
        method:"POST", headers:{...SB_H,"Prefer":"resolution=merge-duplicates"},
        body: JSON.stringify({ key:"dl_precifConfig", value: JSON.stringify(novo) })
      });
    } catch(e) { console.error(e); }
    if (onUpdatePrecifConfig) onUpdatePrecifConfig(novo);
    setSalvandoConfig(false);
    setConfigSalvo(true);
    setTimeout(() => setConfigSalvo(false), 2500);
    setEditConfig(false);
    setConfigDraft(null);
  };

  // ── Filtros ───────────────────────────────────────────────────────────────
  const categorias = [...new Set(produtos.map(p => p.categoria).filter(Boolean))].sort();
  const filtrados  = produtos.filter(p => {
    if (fCat  && p.categoria !== fCat) return false;
    if (fBusca && !p.nome.toLowerCase().includes(fBusca.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:200, color:"#6b5f80", fontSize:13 }}>Carregando...</div>;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

      {/* Header */}
      <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:800, color:"#f59e0b" }}>🧾 Precificação</div>
          <div style={{ fontSize:11, color:"#6b5f80", marginTop:2 }}>
            Impostos: <strong style={{color:"#f0e8ff"}}>{cfg.taxaImposto||0}%</strong> ·
            Máquina: <strong style={{color:"#f0e8ff"}}>{cfg.taxaMaquina||0}%</strong> ·
            Aplicativo: <strong style={{color:"#f0e8ff"}}>{cfg.taxaAplicativo||0}%</strong> ·
            Comissão: <strong style={{color:"#f0e8ff"}}>{cfg.taxaComissao||0}%</strong> ·{" "}
            <button onClick={() => { setConfigDraft({...cfg}); setEditConfig(true); }}
              style={{ background:"none", border:"none", color:"#f59e0b", cursor:"pointer", fontSize:11, fontWeight:700, padding:0, textDecoration:"underline" }}>
              ⚙️ configurar
            </button>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>setSubView("tabela")}
            style={{ padding:"7px 16px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:700,
              background: subView==="tabela" ? "linear-gradient(135deg,#d97706,#b45309)" : "#1a1628",
              color: subView==="tabela" ? "#fff" : "#6b5f80" }}>
            🧾 Tabela de Preços
          </button>
          <button onClick={()=>setSubView("analise")}
            style={{ padding:"7px 16px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:700,
              background: subView==="analise" ? "linear-gradient(135deg,#7c3aed,#6d28d9)" : "#1a1628",
              color: subView==="analise" ? "#fff" : "#6b5f80" }}>
            🔍 Análise Individual
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"flex-end" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:3, flex:1, minWidth:160 }}>
          <label style={{ fontSize:10, color:"#6b5f80", fontWeight:600, textTransform:"uppercase" }}>🔍 Busca</label>
          <input value={fBusca} onChange={e=>setFBusca(e.target.value)} placeholder="Nome do produto..."
            style={{ ...selS, borderColor: fBusca?"#f59e0b":"" }} />
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:3, minWidth:140 }}>
          <label style={{ fontSize:10, color:"#6b5f80", fontWeight:600, textTransform:"uppercase" }}>Categoria</label>
          <select value={fCat} onChange={e=>setFCat(e.target.value)} style={{ ...selS, borderColor: fCat?"#f59e0b":"" }}>
            <option value="">Todas</option>
            {categorias.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ fontSize:11, color:"#8a7fa0", paddingBottom:6 }}>
          <strong style={{color:"#f0e8ff"}}>{filtrados.length}</strong> produtos
        </div>
      </div>

      {/* ── TABELA DE PREÇOS ── */}
      {subView === "tabela" && (
        <div style={{ overflowX:"auto", borderRadius:12, border:"1.5px solid #2d2640" }}>
          <table style={{ borderCollapse:"collapse", width:"100%", minWidth:900 }}>
            <thead>
              <tr>
                <th colSpan={4} style={{ ...thS({ textAlign:"center", background:"#13101e", color:"#8a7fa0", borderRight:"2px solid #2d2640" }) }}>Identificação</th>
                <th colSpan={3} style={{ ...thS({ textAlign:"center", background:"#1a1000", color:"#f59e0b", borderRight:"2px solid #2d2640" }) }}>Custos Variáveis</th>
                <th colSpan={2} style={{ ...thS({ textAlign:"center", background:"#1a0a00", color:"#f87171", borderRight:"2px solid #2d2640" }) }}>Impostos</th>
                <th colSpan={2} style={{ ...thS({ textAlign:"center", background:"#0a1a1a", color:"#60a5fa", borderRight:"2px solid #2d2640" }) }}>Taxa Máquina</th>
                <th colSpan={3} style={{ ...thS({ textAlign:"center", background:"#0d1a0d", color:"#4ade80" }) }}>Resultado</th>
              </tr>
              <tr>
                {[
                  { l:"CÓD",           al:"center", w:50  },
                  { l:"PRODUTO",       al:"left",   w:200 },
                  { l:"CATEGORIA",     al:"left",   w:120 },
                  { l:"PREÇO VENDA",   al:"right",  w:110, br:true },
                  { l:"CMV R$",        al:"right",  w:90, cor:"#f59e0b" },
                  { l:"CMV %",         al:"right",  w:70, cor:"#f59e0b" },
                  { l:"CUSTOS VAR. R$",al:"right",  w:110, cor:"#f59e0b", br:true },
                  { l:"IMPOSTOS %",    al:"right",  w:90, cor:"#f87171" },
                  { l:"IMPOSTOS R$",   al:"right",  w:90, cor:"#f87171", br:true },
                  { l:"TAXA MÁQ. %",   al:"right",  w:90, cor:"#60a5fa" },
                  { l:"TAXA MÁQ. R$",  al:"right",  w:90, cor:"#60a5fa", br:true },
                  { l:"LUCRO R$",      al:"right",  w:90, cor:"#4ade80" },
                  { l:"MARGEM %",      al:"right",  w:80, cor:"#4ade80" },
                  { l:"MARKUP %",      al:"right",  w:80, cor:"#4ade80" },
                ].map(({ l, al, w, cor, br }) => (
                  <th key={l} style={{ ...thS({ textAlign:al, minWidth:w, color:cor||"#6b5f80", borderRight: br?"2px solid #2d2640":"none" }) }}>{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((prod, i) => {
                const c = calcular(prod);
                const editando = editPrecoVenda[prod.id] !== undefined;
                const corMarg  = c.margem >= 40 ? "#4ade80" : c.margem >= 20 ? "#f59e0b" : c.margem > 0 ? "#f87171" : "#6b5f80";
                const bg = i % 2 === 0 ? "#0d0b15" : "#100e1b";
                return (
                  <tr key={prod.id} style={{ background: bg }}>
                    <td style={{ ...tdS({ textAlign:"center", color:"#4a3f60", fontSize:11 }) }}>{prod.id}</td>
                    <td style={{ ...tdS({ color:"#f59e0b", fontWeight:700 }) }}>{prod.nome}</td>
                    <td style={{ ...tdS({ color:"#8a7fa0", fontSize:11, borderRight:"2px solid #1a1628" }) }}>{prod.categoria}{prod.subcategoria ? ` · ${prod.subcategoria}` : ""}</td>
                    {/* Preço de venda editável */}
                    <td style={{ ...tdS({ textAlign:"right", borderRight:"2px solid #1a1628" }) }}>
                      {editando
                        ? <div style={{ display:"flex", gap:4, alignItems:"center", justifyContent:"flex-end" }}>
                            <input type="number" step="0.01" min="0" autoFocus
                              value={editPrecoVenda[prod.id]}
                              onChange={e=>setEditPrecoVenda(ep=>({...ep,[prod.id]:e.target.value}))}
                              onKeyDown={e=>{ if(e.key==="Enter") salvarPrecoVenda(prod); if(e.key==="Escape") setEditPrecoVenda(ep=>({...ep,[prod.id]:undefined})); }}
                              style={{ ...iStyle, width:80, fontSize:11, padding:"3px 6px", textAlign:"right", borderColor:"#f59e0b" }} />
                            <button onClick={()=>salvarPrecoVenda(prod)} disabled={salvando[prod.id]}
                              style={{ fontSize:10, background:"#16a34a", color:"#fff", border:"none", borderRadius:4, padding:"3px 7px", cursor:"pointer" }}>✓</button>
                            <button onClick={()=>setEditPrecoVenda(ep=>({...ep,[prod.id]:undefined}))}
                              style={{ fontSize:10, background:"none", color:"#6b5f80", border:"none", cursor:"pointer" }}>✕</button>
                          </div>
                        : <div title="Clique para editar" onClick={()=>setEditPrecoVenda(ep=>({...ep,[prod.id]:String(c.pv||"")}))}
                            style={{ color: c.pv>0?"#f0e8ff":"#3a3255", fontWeight:700, cursor:"pointer", borderBottom: c.pv>0?"1px dashed #4a3f60":"none" }}>
                            {c.pv > 0 ? fmt(c.pv) : <span style={{fontSize:10}}>— clique p/ definir</span>}
                          </div>
                      }
                    </td>
                    <td style={{ ...tdS({ textAlign:"right", color: c.cmv>0?"#f59e0b":"#3a3255" }) }}>{c.cmv>0?fmt(c.cmv):"—"}</td>
                    <td style={{ ...tdS({ textAlign:"right", color: c.cmvPct>0?"#f59e0b":"#3a3255" }) }}>{c.cmvPct>0?c.cmvPct.toFixed(1)+"%":"—"}</td>
                    <td style={{ ...tdS({ textAlign:"right", color: c.cmv>0?"#f59e0b":"#3a3255", borderRight:"2px solid #1a1628", fontWeight:700 }) }}>{c.cmv>0?fmt(c.cmv):"—"}</td>
                    <td style={{ ...tdS({ textAlign:"right", color: c.impPct>0?"#f87171":"#3a3255" }) }}>{c.impPct>0?c.impPct.toFixed(2)+"%":"—"}</td>
                    <td style={{ ...tdS({ textAlign:"right", color: c.impR>0?"#f87171":"#3a3255", borderRight:"2px solid #1a1628" }) }}>{c.impR>0?fmt(c.impR):"—"}</td>
                    <td style={{ ...tdS({ textAlign:"right", color: c.maqPct>0?"#60a5fa":"#3a3255" }) }}>{c.maqPct>0?c.maqPct.toFixed(2)+"%":"—"}</td>
                    <td style={{ ...tdS({ textAlign:"right", color: c.maqR>0?"#60a5fa":"#3a3255", borderRight:"2px solid #1a1628" }) }}>{c.maqR>0?fmt(c.maqR):"—"}</td>
                    <td style={{ ...tdS({ textAlign:"right", color: c.lucro>0?"#4ade80":c.lucro<0?"#f87171":"#3a3255", fontWeight:700 }) }}>{c.pv>0?fmt(c.lucro):"—"}</td>
                    <td style={{ ...tdS({ textAlign:"right", color:corMarg, fontWeight:700 }) }}>{c.pv>0?c.margem.toFixed(1)+"%":"—"}</td>
                    <td style={{ ...tdS({ textAlign:"right", color: c.markup>0?"#c084fc":"#3a3255" }) }}>{c.markup>0?c.markup.toFixed(1)+"%":"—"}</td>
                  </tr>
                );
              })}
              {filtrados.length === 0 && (
                <tr><td colSpan={14} style={{ padding:32, textAlign:"center", color:"#4a3f60", fontSize:13 }}>Nenhum produto encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── ANÁLISE INDIVIDUAL ── */}
      {subView === "analise" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filtrados.map((prod, i) => {
            const c = calcular(prod);
            const corMarg = c.margem >= 40 ? "#4ade80" : c.margem >= 20 ? "#f59e0b" : c.margem > 0 ? "#f87171" : "#6b5f80";
            const editando = editPrecoVenda[prod.id] !== undefined;
            return (
              <div key={prod.id} style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, padding:"14px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8, marginBottom:10 }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:800, color:"#f59e0b" }}>{prod.nome}</div>
                    <div style={{ fontSize:11, color:"#6b5f80" }}>{prod.categoria}{prod.subcategoria ? ` · ${prod.subcategoria}` : ""} · #{prod.id}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:10, color:"#6b5f80", textTransform:"uppercase" }}>Preço de Venda</div>
                    {editando
                      ? <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                          <input type="number" step="0.01" min="0" autoFocus value={editPrecoVenda[prod.id]}
                            onChange={e=>setEditPrecoVenda(ep=>({...ep,[prod.id]:e.target.value}))}
                            onKeyDown={e=>{ if(e.key==="Enter") salvarPrecoVenda(prod); if(e.key==="Escape") setEditPrecoVenda(ep=>({...ep,[prod.id]:undefined})); }}
                            style={{ ...iStyle, width:90, fontSize:13, padding:"4px 8px", textAlign:"right", borderColor:"#f59e0b" }} />
                          <button onClick={()=>salvarPrecoVenda(prod)} style={{ fontSize:11, background:"#16a34a", color:"#fff", border:"none", borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>✓</button>
                          <button onClick={()=>setEditPrecoVenda(ep=>({...ep,[prod.id]:undefined}))} style={{ fontSize:11, background:"none", color:"#6b5f80", border:"none", cursor:"pointer" }}>✕</button>
                        </div>
                      : <div onClick={()=>setEditPrecoVenda(ep=>({...ep,[prod.id]:String(c.pv||"")}))}
                          style={{ fontSize:20, fontWeight:900, color: c.pv>0?"#f0e8ff":"#3a3255", cursor:"pointer", borderBottom:"1px dashed #4a3f6066" }}>
                          {c.pv > 0 ? fmt(c.pv) : "— definir"}
                        </div>
                    }
                  </div>
                </div>
                {c.pv > 0 && (
                  <div style={{ display:"grid", gridTemplateColumns: isMob?"1fr 1fr":"repeat(5,1fr)", gap:8 }}>
                    {[
                      { l:"CMV",       v:fmt(c.cmv),    p:c.cmvPct.toFixed(1)+"%",    cor:"#f59e0b" },
                      { l:"Impostos",  v:fmt(c.impR),   p:c.impPct.toFixed(2)+"%",    cor:"#f87171" },
                      { l:"Máquina",   v:fmt(c.maqR),   p:c.maqPct.toFixed(2)+"%",    cor:"#60a5fa" },
                      { l:"Aplicativo",v:fmt(c.appR),   p:c.appPct.toFixed(2)+"%",    cor:"#818cf8" },
                      { l:"Comissão",  v:fmt(c.comR),   p:c.comPct.toFixed(2)+"%",    cor:"#fb923c" },
                    ].map(k => (
                      <div key={k.l} style={{ background:"#0d0b15", borderRadius:8, padding:"8px 10px", border:`1px solid ${k.cor}33` }}>
                        <div style={{ fontSize:9, color:"#6b5f80", textTransform:"uppercase", marginBottom:2 }}>{k.l}</div>
                        <div style={{ fontSize:13, fontWeight:800, color:k.cor }}>{k.v}</div>
                        <div style={{ fontSize:10, color:k.cor+"99" }}>{k.p}</div>
                      </div>
                    ))}
                  </div>
                )}
                {c.pv > 0 && (
                  <div style={{ display:"flex", gap:12, marginTop:10, padding:"10px 12px", background:"#0a0814", borderRadius:8, border:`1.5px solid ${corMarg}33`, flexWrap:"wrap" }}>
                    <div><span style={{ fontSize:10, color:"#6b5f80" }}>Lucro: </span><strong style={{ color: c.lucro>0?"#4ade80":"#f87171" }}>{fmt(c.lucro)}</strong></div>
                    <div><span style={{ fontSize:10, color:"#6b5f80" }}>Margem: </span><strong style={{ color:corMarg }}>{c.margem.toFixed(1)}%</strong></div>
                    <div><span style={{ fontSize:10, color:"#6b5f80" }}>Markup: </span><strong style={{ color:"#c084fc" }}>{c.markup.toFixed(1)}%</strong></div>
                    <div><span style={{ fontSize:10, color:"#6b5f80" }}>Custo total: </span><strong style={{ color:"#f0e8ff" }}>{fmt(c.custoVar)} ({c.custoVarPct.toFixed(1)}%)</strong></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal configurar taxas */}
      {editConfig && configDraft && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
          onClick={e=>{ if(e.target===e.currentTarget){ setEditConfig(false); setConfigDraft(null); } }}>
          <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:14, padding:24, width:"100%", maxWidth:440, display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ fontSize:14, fontWeight:800, color:"#f59e0b" }}>⚙️ Configurações de Precificação</div>
            <div style={{ fontSize:11, color:"#6b5f80" }}>Taxas aplicadas sobre o preço de venda de cada produto</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[
                { label:"Impostos (%)",    key:"taxaImposto"    },
                { label:"Taxa Máquina (%)",key:"taxaMaquina"    },
                { label:"Aplicativo (%)",  key:"taxaAplicativo" },
                { label:"Comissão (%)",    key:"taxaComissao"   },
                { label:"Despesas Fixas (R$)", key:"despesasFixas"   },
                { label:"Ponto Equilíbrio (R$)", key:"pontoEquilibrio" },
                { label:"Margem Média (%)", key:"margemMedia"   },
              ].map(({ label, key }) => (
                <div key={key} style={{ display:"flex", flexDirection:"column", gap:3 }}>
                  <label style={{ fontSize:10, fontWeight:600, color:"#8a7fa0", textTransform:"uppercase" }}>{label}</label>
                  <input type="number" step="0.01" min="0"
                    value={configDraft[key] ?? ""}
                    onChange={e => setConfigDraft(d => ({ ...d, [key]: e.target.value }))}
                    style={{ ...iStyle, fontSize:12 }}
                    onFocus={e=>e.target.style.borderColor="#f59e0b"}
                    onBlur={e=>e.target.style.borderColor="#2d2640"} />
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              <button onClick={()=>{ setEditConfig(false); setConfigDraft(null); }}
                style={{ padding:"8px 16px", borderRadius:8, border:"1.5px solid #2d2640", background:"none", color:"#8a7fa0", cursor:"pointer", fontSize:13 }}>
                Cancelar
              </button>
              <button onClick={salvarConfig} disabled={salvandoConfig}
                style={{ padding:"8px 20px", borderRadius:8, border:"none",
                  background: configSalvo ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#d97706,#b45309)",
                  color:"#fff", fontWeight:700, cursor:"pointer", fontSize:13, opacity: salvandoConfig?0.6:1 }}>
                {salvandoConfig ? "Salvando..." : configSalvo ? "✓ Salvo!" : "💾 Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DESPESAS FIXAS TAB ──────────────────────────────────────────────────────
function DespesasFixasTab() {
  const isMob = typeof window !== "undefined" && window.innerWidth < 768;
  const dfCom  = DESPESAS_FIXAS_PLANILHA.filter(d=>d.valor>0).sort((a,b)=>b.valor-a.valor);
  const dfSem  = DESPESAS_FIXAS_PLANILHA.filter(d=>d.valor===0);
  const total  = dfCom.reduce((s,d)=>s+d.valor,0);
  const maxVal = Math.max(...dfCom.map(d=>d.valor),1);
  const peq    = 14145.47;
  const pctPE  = Math.min(100, total/peq*100);
  const CORES  = ["#f87171","#f59e0b","#818cf8","#4ade80","#c084fc","#60a5fa","#fb923c","#34d399","#a78bfa","#fbbf24","#e879f9"];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ background:"linear-gradient(135deg,#1a0a0a,#2d1212)", border:"1.5px solid #7f1d1d", borderRadius:14, padding:"16px 18px" }}>
        <div style={{ fontSize:13, fontWeight:800, color:"#f87171", marginBottom:4 }}>📌 Despesas Fixas Mensais</div>
        <div style={{ fontSize:26, fontWeight:900, color:"#f0e8ff", marginBottom:4 }}>{fmt(total)}</div>
        <div style={{ fontSize:11, color:"#8a7fa0", marginBottom:12 }}>10 categorias ativas · dados da planilha Dolce Luna</div>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
          <span style={{ fontSize:11, color:"#8a7fa0" }}>Ponto de equilíbrio necessário</span>
          <span style={{ fontSize:11, fontWeight:700, color: pctPE>=100?"#4ade80":"#f59e0b" }}>{fmt(peq)}</span>
        </div>
        <div style={{ background:"#1a0a0a", borderRadius:99, height:8, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${pctPE}%`,
            background: pctPE>=100?"linear-gradient(90deg,#4ade80,#22c55e)":"linear-gradient(90deg,#f59e0b,#f87171)",
            borderRadius:99 }}/>
        </div>
        <div style={{ fontSize:10, color:"#6b5f80", marginTop:4 }}>
          Despesas = {pctPE.toFixed(1)}% do ponto de equilíbrio
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns: isMob?"1fr":"1fr 1fr", gap:12 }}>
        {/* Gráfico donut */}
        <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, padding:"14px 16px" }}>
          <div style={{ fontSize:11, fontWeight:800, color:"#8a7fa0", textTransform:"uppercase", marginBottom:10 }}>Distribuição</div>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}>
            {(()=>{
              const size=160,cx=80,cy=80,r=52,sw=30,circ=2*Math.PI*r;
              let off=0;
              return (
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{transform:"rotate(-90deg)"}}>
                  <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a1628" strokeWidth={sw}/>
                  {dfCom.map((d,i)=>{
                    const pct=d.valor/total, dash=pct*circ;
                    const el=<circle key={i} cx={cx} cy={cy} r={r} fill="none"
                      stroke={CORES[i%CORES.length]} strokeWidth={sw}
                      strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={-off}/>;
                    off+=dash; return el;
                  })}
                </svg>
              );
            })()}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {dfCom.map((d,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:8, height:8, borderRadius:2, background:CORES[i%CORES.length], flexShrink:0 }}/>
                <span style={{ fontSize:10, color:"#8a7fa0", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.desc}</span>
                <span style={{ fontSize:10, fontWeight:700, color:"#f0e8ff", flexShrink:0 }}>{(d.valor/total*100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
        {/* Lista */}
        <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, overflow:"hidden" }}>
          <div style={{ padding:"12px 14px", borderBottom:"1px solid #1a1628" }}>
            <span style={{ fontSize:11, fontWeight:800, color:"#8a7fa0", textTransform:"uppercase" }}>Detalhamento</span>
          </div>
          <div style={{ maxHeight:400, overflowY:"auto" }}>
            {dfCom.map((d,i)=>{
              const barW=maxVal>0?(d.valor/maxVal*100):0;
              return (
                <div key={i} style={{ padding:"10px 14px", borderBottom:"1px solid #13101e", background:i%2===0?"#0d0b15":"#100e1b" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <span style={{ fontSize:11, color:"#c8b8e8", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.desc}</span>
                    <span style={{ fontSize:12, fontWeight:800, color:CORES[i%CORES.length], flexShrink:0, marginLeft:8 }}>{fmt(d.valor)}</span>
                  </div>
                  <div style={{ background:"#1a1628", borderRadius:99, height:3 }}>
                    <div style={{ height:"100%", width:`${barW}%`, background:CORES[i%CORES.length], borderRadius:99, opacity:0.8 }}/>
                  </div>
                  <div style={{ fontSize:9, color:"#4a3f60", marginTop:2 }}>{(d.valor/total*100).toFixed(1)}% do total</div>
                </div>
              );
            })}
            {dfSem.length > 0 && (
              <div style={{ padding:"8px 14px", borderTop:"1px solid #1a1628" }}>
                <div style={{ fontSize:10, color:"#4a3f60" }}>Sem valor: Salários + Encargos + Benefícios, Alarme + Segurança, Contabilidade, Suporte de TI, Publicidade e Marketing, Combustível, Manutenção Predial, Manutenção de Carros, Material de Escritório</div>
              </div>
            )}
          </div>
          <div style={{ padding:"10px 14px", background:"#1a1628", borderTop:"1.5px solid #2d2640", display:"flex", justifyContent:"space-between" }}>
            <span style={{ fontSize:11, fontWeight:700, color:"#6b5f80" }}>TOTAL MENSAL</span>
            <span style={{ fontSize:13, fontWeight:900, color:"#f87171" }}>{fmt(total)}</span>
          </div>
        </div>
      </div>
      <div style={{ background:"#0d0f1a", border:"1px solid #1e1a4e", borderRadius:10, padding:"12px 14px" }}>
        <div style={{ fontSize:11, color:"#6b5f80" }}>
          💡 <strong style={{color:"#818cf8"}}>Previsibilidade:</strong> Com despesas fixas de {fmt(total)}/mês e margem de contribuição média de 55,4%, você precisa faturar pelo menos <strong style={{color:"#f59e0b"}}>{fmt(peq)}</strong>/mês para cobrir todos os custos.
        </div>
      </div>
    </div>
  );
}


// ─── TRANSFERENCIAS TAB ───────────────────────────────────────────────────────
function TransferenciasTab({ transferencias, setTransferencias, setModal, showToast, isMobile }) {
  const [fBancoT, setFBancoT] = useState("");
  const [fDireT,  setFDireT]  = useState("todos");
  const [fDeT,    setFDeT]    = useState("");
  const [fAteT,   setFAteT]   = useState("");

  const bancosTransf = useMemo(() => [...new Set([
    ...transferencias.map(t => t.saidoBanco  || t.saidobanco ).filter(Boolean),
    ...transferencias.map(t => t.entrouBanco || t.entroubanco).filter(Boolean),
  ])].sort(), [transferencias]);

  const filtradas = useMemo(() => transferencias.filter(t => {
    const saiu   = t.saidoBanco  || t.saidobanco  || "";
    const entrou = t.entrouBanco || t.entroubanco || "";
    if (fBancoT) {
      if (fDireT === "saiu"   && saiu   !== fBancoT) return false;
      if (fDireT === "entrou" && entrou !== fBancoT) return false;
      if (fDireT === "todos"  && saiu !== fBancoT && entrou !== fBancoT) return false;
    }
    if (fDeT  && (t.data||"") < fDeT)  return false;
    if (fAteT && (t.data||"") > fAteT) return false;
    return true;
  }).sort((a,b) => (b.data||"").localeCompare(a.data||"")), [transferencias, fBancoT, fDireT, fDeT, fAteT]);

  const totalFiltrado = filtradas.reduce((s,t)=>s+Number(t.valor||0),0);
  const temFiltro = fBancoT || fDeT || fAteT;
  const selS = { ...iStyle, fontSize:12, padding:"6px 8px", cursor:"pointer" };
  const ativ = v => v ? { borderColor:"#818cf8", color:"#f0e8ff" } : {};

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {/* Filtros */}
      <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, padding:"12px 14px" }}>
        <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr auto", gap:8, marginBottom:8 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
            <label style={{ fontSize:10, color:"#6b5f80", fontWeight:600, textTransform:"uppercase" }}>🏦 Banco</label>
            <select value={fBancoT} onChange={e=>setFBancoT(e.target.value)} style={{ ...selS, ...ativ(fBancoT) }}>
              <option value="">Todos</option>
              {bancosTransf.map(b=><option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
            <label style={{ fontSize:10, color:"#6b5f80", fontWeight:600, textTransform:"uppercase" }}>Direção</label>
            <select value={fDireT} onChange={e=>setFDireT(e.target.value)} style={{ ...selS, ...ativ(fDireT!=="todos") }} disabled={!fBancoT}>
              <option value="todos">Saiu ou Entrou</option>
              <option value="saiu">Saiu deste banco</option>
              <option value="entrou">Entrou neste banco</option>
            </select>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
            <label style={{ fontSize:10, color:"#6b5f80", fontWeight:600, textTransform:"uppercase" }}>📅 De</label>
            <input type="date" value={fDeT} onChange={e=>setFDeT(e.target.value)} style={{ ...selS, ...ativ(fDeT) }} />
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
            <label style={{ fontSize:10, color:"#6b5f80", fontWeight:600, textTransform:"uppercase" }}>📅 Até</label>
            <input type="date" value={fAteT} onChange={e=>setFAteT(e.target.value)} style={{ ...selS, ...ativ(fAteT) }} />
          </div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:6, gridColumn: isMobile ? "1/-1" : "auto" }}>
            <Btn small ghost onClick={() => setModal("transf")}>⇌ Nova Transferência</Btn>
            {temFiltro && (
              <button onClick={()=>{ setFBancoT(""); setFDireT("todos"); setFDeT(""); setFAteT(""); }}
                style={{ fontSize:11, background:"none", border:"1px solid #2d2640", borderRadius:6, color:"#8a7fa0", cursor:"pointer", padding:"6px 10px" }}>
                ✕ Limpar
              </button>
            )}
          </div>
        </div>
        <span style={{ fontSize:12, color:"#8a7fa0" }}>
          <strong style={{color:"#f0e8ff"}}>{filtradas.length}</strong> de {transferencias.length} transferências
          {temFiltro && <span style={{ color:"#818cf8", marginLeft:10, fontWeight:700 }}>= {fmt(totalFiltrado)}</span>}
        </span>
      </div>

      {/* Lista */}
      {filtradas.map(t => {
        const saiu   = t.saidoBanco  || t.saidobanco  || "—";
        const entrou = t.entrouBanco || t.entroubanco || "—";
        return (
          <div key={t.id} style={{ background:"#13101e", border:"1.5px solid #1a1a3a", borderRadius:12, padding:"12px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", gap:8, marginBottom:4, alignItems:"center", flexWrap:"wrap" }}>
                <Badge color="purple">Transferência</Badge>
                <span style={{ fontSize:11, color:"#6b5f80" }}>{fmtDate(t.data)}</span>
              </div>
              <div style={{ fontSize:13, color:"#c8b8e8" }}>
                <span style={{ color:"#f87171" }}>{saiu}</span>
                <span style={{ color:"#8a7fa0", margin:"0 8px" }}>→</span>
                <span style={{ color:"#c084fc" }}>{entrou}</span>
              </div>
              {t.descricao && <div style={{ fontSize:11, color:"#4a3f60", marginTop:2 }}>{t.descricao}</div>}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0, marginLeft:10 }}>
              <span style={{ fontSize:15, fontWeight:800, color:"#818cf8" }}>{fmt(t.valor)}</span>
              <button onClick={() => { setTransferencias(l => l.filter(x => x.id !== t.id)); showToast("Removido.", "del"); }}
                style={{ background:"none", border:"1px solid #7f1d1d", borderRadius:6, color:"#f87171", cursor:"pointer", padding:"4px 8px", fontSize:11 }}>🗑</button>
            </div>
          </div>
        );
      })}
      {filtradas.length === 0 && (
        <p style={{ color:"#6b5f80", textAlign:"center", padding:32 }}>
          {temFiltro ? "Nenhuma transferência para os filtros selecionados." : "Nenhuma transferência cadastrada."}
        </p>
      )}
    </div>
  );
}


// ─── PRODUTOS VENDIDOS TAB ────────────────────────────────────────────────────


function ProdutosTab({ bancoCnpj = {} }) {
  const SB_URL = "https://wmlecjrkqwoejuryeayz.supabase.co/rest/v1";
  const SB_KEY_V = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbGVjanJrcXdvZWp1cnllYXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDgyMDYsImV4cCI6MjA5MTMyNDIwNn0.SAYFGBZFjvLn9jIEs8J5mR93ZY7HlYQbT43YTn8JKnI";
  const SB_H = { "Content-Type":"application/json","apikey":SB_KEY_V,"Authorization":"Bearer "+SB_KEY_V };

  const hoje = new Date();
  const mesAtual = hoje.toISOString().slice(0,7);

  const [produtos,   setProdutos]   = useState([]);
  const [canais,     setCanais]     = useState([]);
  const [vendas,     setVendas]     = useState([]);
  const [mesRef,     setMesRef]     = useState(mesAtual);
  const [loading,    setLoading]    = useState(true);
  const [salvando,   setSalvando]   = useState({});
  const [novoModal,  setNovoModal]  = useState(null); // "produto" | "canal"
  const [editModal,  setEditModal]  = useState(null); // { tipo, item }
  const [novoForm,   setNovoForm]   = useState({});

  const isMob = window.innerWidth < 768;

  // ── Carregar dados ────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [rP, rC] = await Promise.all([
          fetch(`${SB_URL}/catalogo_produtos?ativo=eq.true&order=categoria,subcategoria.nullsfirst,ordem,nome`, { headers: SB_H }),
          fetch(`${SB_URL}/canais_venda?ativo=eq.true&order=ordem`, { headers: SB_H }),
        ]);
        const prods = await rP.json();
        const chans = await rC.json();
        setProdutos(Array.isArray(prods) ? prods : []);
        setCanais(Array.isArray(chans) ? chans : []);
      } catch(e) { console.error("Erro ao carregar:", e); }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!mesRef) return;
    (async () => {
      try {
        const r = await fetch(`${SB_URL}/vendas_produtos?mes_referencia=eq.${mesRef}&select=*`, { headers: SB_H });
        const v = await r.json();
        setVendas(Array.isArray(v) ? v : []);
      } catch(e) { console.error("Erro vendas:", e); }
    })();
  }, [mesRef]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getQtd = (prodId, canalId) => {
    const v = vendas.find(v => v.produto_id === prodId && v.canal_id === canalId);
    return v ? Number(v.quantidade) : 0;
  };
  const totalPorProduto = (prodId) => canais.reduce((s, c) => s + getQtd(prodId, c.id), 0);
  const totalPorCanal = (canalId, prodList) => prodList.reduce((s, p) => s + getQtd(p.id, canalId), 0);

  const salvarCelula = async (prodId, canalId, qtd) => {
    const key = `${prodId}-${canalId}`;
    setSalvando(s => ({ ...s, [key]: true }));
    const qtdNum = Number(qtd) || 0;
    setVendas(prev => {
      const idx = prev.findIndex(v => v.produto_id === prodId && v.canal_id === canalId && v.mes_referencia === mesRef);
      if (idx >= 0) { const n=[...prev]; n[idx]={...n[idx],quantidade:qtdNum}; return n; }
      return [...prev, { id: Date.now(), produto_id: prodId, canal_id: canalId, mes_referencia: mesRef, quantidade: qtdNum }];
    });
    try {
      if (qtdNum === 0) {
        await fetch(`${SB_URL}/vendas_produtos?produto_id=eq.${prodId}&canal_id=eq.${canalId}&mes_referencia=eq.${mesRef}`, { method:"DELETE", headers:SB_H });
      } else {
        await fetch(`${SB_URL}/vendas_produtos`, {
          method:"POST", headers:{ ...SB_H,"Prefer":"resolution=merge-duplicates,return=minimal" },
          body: JSON.stringify({ id: Date.now(), produto_id: prodId, canal_id: canalId, mes_referencia: mesRef, quantidade: qtdNum })
        });
      }
    } catch(e) { console.error("Erro salvar:", e); }
    setSalvando(s => ({ ...s, [key]: false }));
  };

  const excluirProduto = async (id) => {
    await fetch(`${SB_URL}/catalogo_produtos?id=eq.${id}`, { method:"PATCH", headers:{...SB_H,"Prefer":"return=minimal"}, body: JSON.stringify({ ativo: false }) });
    setProdutos(prev => prev.filter(p => p.id !== id));
    setEditModal(null);
  };
  const excluirCanal = async (id) => {
    await fetch(`${SB_URL}/canais_venda?id=eq.${id}`, { method:"PATCH", headers:{...SB_H,"Prefer":"return=minimal"}, body: JSON.stringify({ ativo: false }) });
    setCanais(prev => prev.filter(c => c.id !== id));
    setEditModal(null);
  };
  const salvarNovoProduto = async () => {
    const cat = novoForm.categoria?.trim();
    const sub = (novoForm.subcategoria === "__nova__sub__" ? novoForm._subCustom : novoForm.subcategoria)?.trim() || null;
    if (!novoForm.nome?.trim() || !cat || cat === "__nova__edit__") return;
    try {
      const r = await fetch(`${SB_URL}/catalogo_produtos`, {
        method:"POST", headers:{...SB_H,"Prefer":"return=representation"},
        body: JSON.stringify({ categoria: cat, subcategoria: sub, nome: novoForm.nome.trim(), ordem: produtos.length })
      });
      const data = await r.json();
      if (Array.isArray(data) && data[0]) {
        setProdutos(prev => [...prev, data[0]].sort((a,b)=>a.categoria.localeCompare(b.categoria)||(a.subcategoria||"").localeCompare(b.subcategoria||"")||a.ordem-b.ordem));
      }
    } catch(e) { console.error(e); }
    setNovoModal(null); setNovoForm({});
  };
  const salvarNovoCanal = async () => {
    if (!novoForm.nome?.trim()) return;
    try {
      const r = await fetch(`${SB_URL}/canais_venda`, {
        method:"POST", headers:{...SB_H,"Prefer":"return=representation"},
        body: JSON.stringify({ nome: novoForm.nome.trim(), cnpj: novoForm.cnpj||null, ordem: canais.length })
      });
      const data = await r.json();
      if (Array.isArray(data) && data[0]) setCanais(prev => [...prev, data[0]]);
    } catch(e) { console.error(e); }
    setNovoModal(null); setNovoForm({});
  };
  const salvarEditProduto = async () => {
    const { id, nome, categoria, subcategoria } = editModal.item;
    await fetch(`${SB_URL}/catalogo_produtos?id=eq.${id}`, { method:"PATCH", headers:{...SB_H,"Prefer":"return=minimal"}, body: JSON.stringify({ nome, categoria, subcategoria: subcategoria||null }) });
    setProdutos(prev => prev.map(p => p.id===id ? {...p, nome, categoria, subcategoria} : p));
    setEditModal(null);
  };
  const salvarEditCanal = async () => {
    const { id, nome, cnpj } = editModal.item;
    await fetch(`${SB_URL}/canais_venda?id=eq.${id}`, { method:"PATCH", headers:{...SB_H,"Prefer":"return=minimal"}, body: JSON.stringify({ nome, cnpj }) });
    setCanais(prev => prev.map(c => c.id===id ? {...c, nome, cnpj} : c));
    setEditModal(null);
  };

  // ── Agrupamento ───────────────────────────────────────────────────────────
  // categoria -> subcategoria -> produtos
  const grupos = {};
  for (const p of produtos) {
    if (!grupos[p.categoria]) grupos[p.categoria] = {};
    const sub = p.subcategoria || "__none__";
    if (!grupos[p.categoria][sub]) grupos[p.categoria][sub] = [];
    grupos[p.categoria][sub].push(p);
  }
  const categorias = Object.keys(grupos);
  const allCatsForSelect = categorias;
  const allSubsForSelect = (cat) => [...new Set(produtos.filter(p=>p.categoria===cat && p.subcategoria).map(p=>p.subcategoria))];

  // Totais
  const totalProdCat = (cat) => {
    const prods = produtos.filter(p => p.categoria === cat);
    return prods.reduce((s, p) => s + totalPorProduto(p.id), 0);
  };
  const totalProdSub = (cat, sub) => {
    const prods = grupos[cat]?.[sub] || [];
    return prods.reduce((s, p) => s + totalPorProduto(p.id), 0);
  };
  const totalGeralCanal = (canalId) => produtos.reduce((s, p) => s + getQtd(p.id, canalId), 0);
  const totalGeral = () => canais.reduce((s, c) => s + totalGeralCanal(c.id), 0);

  // CNPJ groups for header
  const cnpjGroups = canais.reduce((acc, c) => {
    const key = c.cnpj || "Outros";
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});
  const corCnpj = (cnpj) => cnpj === "48.659.129" ? "#818cf8" : cnpj === "50.166.828" ? "#f472b6" : cnpj === "51.295.630" ? "#f59e0b" : "#94a3b8";

  const MESES_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const fmtMes = m => { if(!m) return ""; const [y,mo]=m.split("-"); return `${MESES_PT[parseInt(mo)-1]}/${y}`; };
  const mesesDisp = Array.from({ length: 13 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    return d.toISOString().slice(0,7);
  });

  const thS = (extra={}) => ({ padding:"6px 8px", fontSize:10, fontWeight:700, textAlign:"center", borderBottom:"2px solid #2d2640", whiteSpace:"nowrap", ...extra });
  const tdS = (extra={}) => ({ padding:"3px 4px", textAlign:"center", borderBottom:"1px solid #13101e", ...extra });

  if (loading) return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:200, color:"#6b5f80", fontSize:13 }}>Carregando...</div>;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

      {/* Header */}
      <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:800, color:"#c084fc", marginBottom:2 }}>🛍 Produtos Vendidos</div>
          <div style={{ fontSize:11, color:"#6b5f80" }}>
            {produtos.length} produtos · {canais.length} canais ·
            Total geral: <strong style={{color:"#f0e8ff"}}>{totalGeral()} unid</strong>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          <select value={mesRef} onChange={e=>setMesRef(e.target.value)}
            style={{ ...iStyle, fontSize:12, padding:"6px 10px", cursor:"pointer", fontWeight:700, color:"#c084fc", borderColor:"#7c3aed" }}>
            {mesesDisp.map(m=><option key={m} value={m}>{fmtMes(m)}</option>)}
          </select>
          <button onClick={()=>{ setNovoModal("produto"); setNovoForm({ categoria: categorias[0]||"" }); }}
            style={{ fontSize:11, fontWeight:700, padding:"6px 12px", borderRadius:8, border:"1px solid #4ade80", background:"#0a1f0a", color:"#4ade80", cursor:"pointer" }}>
            + Produto
          </button>
          <button onClick={()=>{ setNovoModal("canal"); setNovoForm({}); }}
            style={{ fontSize:11, fontWeight:700, padding:"6px 12px", borderRadius:8, border:"1px solid #818cf8", background:"#0a0b1a", color:"#818cf8", cursor:"pointer" }}>
            + Canal
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div style={{ overflowX:"auto", borderRadius:12, border:"1.5px solid #2d2640" }}>
        <table style={{ borderCollapse:"collapse", width:"100%", minWidth: 200 + canais.length * 85 }}>
          <thead>
            {/* Linha CNPJ */}
            <tr>
              <th style={{ ...thS({ textAlign:"left", background:"#1a1628", color:"#6b5f80", minWidth:180, position:"sticky", left:0, zIndex:2 }) }}>
                Atualizado: {fmtMes(mesRef)}
              </th>
              {Object.entries(cnpjGroups).map(([cnpj, chs]) => (
                <th key={cnpj} colSpan={chs.length}
                  style={{ ...thS({ background:corCnpj(cnpj)+"22", color:corCnpj(cnpj), borderLeft:"2px solid "+corCnpj(cnpj)+"66", letterSpacing:"0.04em" }) }}>
                  CNPJ: {cnpj}
                </th>
              ))}
              <th style={{ ...thS({ background:"#2d1254", color:"#c084fc", borderLeft:"2px solid #7c3aed", minWidth:65 }) }}>Total</th>
            </tr>
            {/* Linha canais */}
            <tr>
              <th style={{ ...thS({ textAlign:"left", background:"#13101e", color:"#f0e8ff", position:"sticky", left:0, zIndex:2 }) }}>Itens</th>
              {canais.map(c => {
                const isFirst = cnpjGroups[c.cnpj||"Outros"]?.[0]?.id === c.id;
                return (
                  <th key={c.id} style={{ ...thS({ background:corCnpj(c.cnpj)+"11", color:"#c8b8e8", borderLeft: isFirst?"2px solid "+corCnpj(c.cnpj)+"44":"none" }) }}>
                    <div>{c.nome}</div>
                    <button onClick={()=>setEditModal({ tipo:"canal", item:{...c} })}
                      style={{ fontSize:9, background:"none", border:"none", color:"#4a3f60", cursor:"pointer", display:"block", margin:"2px auto 0" }}>✏️</button>
                  </th>
                );
              })}
              <th style={{ ...thS({ background:"#2d1254", color:"#c084fc", borderLeft:"2px solid #7c3aed" }) }}>Total</th>
            </tr>
          </thead>

          <tbody>
            {categorias.map(cat => {
              const subs = Object.keys(grupos[cat]);
              const prodsCat = produtos.filter(p => p.categoria === cat);
              const totCat = prodsCat.reduce((s, p) => s + totalPorProduto(p.id), 0);
              return (
                <>
                  {/* Cabeçalho categoria */}
                  <tr key={"cat-"+cat}>
                    <td colSpan={canais.length + 2}
                      style={{ background:"#1a1030", padding:"8px 14px", fontSize:13, fontWeight:900, color:"#e9d5ff", borderTop:"2px solid #3730a3", borderBottom:"1px solid #2d2640", position:"sticky", left:0 }}>
                      {cat}
                    </td>
                  </tr>

                  {subs.map(sub => {
                    const prods = grupos[cat][sub];
                    const hasSub = sub !== "__none__";
                    return (
                      <>
                        {/* Cabeçalho subcategoria (se existir) */}
                        {hasSub && (
                          <tr key={"sub-"+cat+sub}>
                            <td colSpan={canais.length + 2}
                              style={{ background:"#120f20", padding:"5px 18px", fontSize:11, fontWeight:700, color:"#8a7fa0", fontStyle:"italic", borderBottom:"1px solid #1a1628", position:"sticky", left:0 }}>
                              {sub}
                            </td>
                          </tr>
                        )}

                        {/* Produtos */}
                        {prods.map((prod, pi) => {
                          const totP = totalPorProduto(prod.id);
                          return (
                            <tr key={prod.id} style={{ background: pi%2===0?"#0d0b15":"#100e1b" }}>
                              <td style={{ padding:"5px 12px 5px 18px", fontSize:11, color:"#c8b8e8", borderBottom:"1px solid #13101e", position:"sticky", left:0, background:pi%2===0?"#0d0b15":"#100e1b", whiteSpace:"nowrap" }}>
                                <span style={{ flex:1 }}>{prod.nome}</span>
                                <button onClick={()=>setEditModal({ tipo:"produto", item:{...prod} })}
                                  style={{ fontSize:9, background:"none", border:"none", color:"#3a3060", cursor:"pointer", marginLeft:6 }}>✏️</button>
                              </td>
                              {canais.map(c => {
                                const key = `${prod.id}-${c.id}`;
                                const qtd = getQtd(prod.id, c.id);
                                const isFirst = cnpjGroups[c.cnpj||"Outros"]?.[0]?.id === c.id;
                                return (
                                  <td key={c.id} style={{ ...tdS({ borderLeft: isFirst?"2px solid "+corCnpj(c.cnpj)+"22":"none" }) }}>
                                    <input type="number" min="0" step="1"
                                      defaultValue={qtd||""}
                                      placeholder="—"
                                      key={`${prod.id}-${c.id}-${mesRef}`}
                                      onBlur={e=>{ const v=e.target.value; if(Number(v||0)!==qtd) salvarCelula(prod.id,c.id,v); }}
                                      onKeyDown={e=>{ if(e.key==="Enter") e.target.blur(); }}
                                      style={{ width:60, textAlign:"center", background:salvando[key]?"#1a2e1a":qtd>0?"#0d1f0d":"transparent",
                                        border:qtd>0?"1px solid #1a3a1a":"1px solid transparent",
                                        borderRadius:4, color:qtd>0?"#4ade80":"#3a3060", fontSize:12, fontWeight:qtd>0?700:400, padding:"3px 4px", outline:"none" }}
                                    />
                                  </td>
                                );
                              })}
                              <td style={{ ...tdS({ fontWeight:800, fontSize:12, color:totP>0?"#c084fc":"#3a3060", borderLeft:"2px solid #3730a366", background:"#12001a" }) }}>
                                {totP > 0 ? totP : "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </>
                    );
                  })}

                  {/* Total da categoria */}
                  <tr key={"tot-"+cat}>
                    <td style={{ padding:"6px 14px", fontSize:11, fontWeight:800, color:"#f472b6", background:"#1a0a14", borderTop:"1px solid #3730a3", borderBottom:"2px solid #2d2640", position:"sticky", left:0 }}>
                      Total {cat}
                    </td>
                    {canais.map(c => {
                      const t = prodsCat.reduce((s, p) => s + getQtd(p.id, c.id), 0);
                      return (
                        <td key={c.id} style={{ ...tdS({ fontWeight:700, fontSize:12, color:t>0?"#f472b6":"#3a3060", background:"#1a0a14", borderTop:"1px solid #3730a3", borderBottom:"2px solid #2d2640" }) }}>
                          {t > 0 ? t : "—"}
                        </td>
                      );
                    })}
                    <td style={{ ...tdS({ fontWeight:900, fontSize:13, color:"#c084fc", background:"#1a0a14", borderTop:"1px solid #3730a3", borderBottom:"2px solid #2d2640", borderLeft:"2px solid #7c3aed" }) }}>
                      {totCat > 0 ? totCat : "—"}
                    </td>
                  </tr>
                </>
              );
            })}

            {/* Total geral */}
            <tr>
              <td style={{ padding:"8px 14px", fontSize:12, fontWeight:900, color:"#c084fc", background:"#2d1254", borderTop:"2px solid #7c3aed", position:"sticky", left:0 }}>Total vendido</td>
              {canais.map(c => (
                <td key={c.id} style={{ padding:"8px 4px", textAlign:"center", fontWeight:800, fontSize:12, color:"#f0e8ff", background:"#2d1254", borderTop:"2px solid #7c3aed" }}>
                  {totalGeralCanal(c.id) > 0 ? totalGeralCanal(c.id) : "—"}
                </td>
              ))}
              <td style={{ padding:"8px 8px", textAlign:"center", fontWeight:900, fontSize:14, color:"#c084fc", background:"#2d1254", borderTop:"2px solid #7c3aed", borderLeft:"2px solid #7c3aed" }}>
                {totalGeral()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Modal: Novo produto */}
      {novoModal === "produto" && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={()=>setNovoModal(null)}>
          <div style={{ background:"#13101e", borderRadius:14, border:"1.5px solid #2d2640", padding:24, width:"100%", maxWidth:420 }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:14, fontWeight:800, color:"#c084fc", marginBottom:16 }}>➕ Novo Produto</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div>
                <label style={{ fontSize:10, color:"#6b5f80", display:"block", marginBottom:4, textTransform:"uppercase" }}>Categoria *</label>
                <select value={novoForm.categoria||""} onChange={e=>setNovoForm(f=>({...f,categoria:e.target.value==="__nova__"?"":e.target.value, subcategoria:""}))}
                  style={{ ...iStyle, width:"100%", fontSize:12, padding:"8px 10px", cursor:"pointer" }}>
                  <option value="">Selecione uma categoria...</option>
                  {allCatsForSelect.map(c=><option key={c} value={c}>{c}</option>)}
                  <option value="__nova__">+ Nova categoria...</option>
                </select>
                {novoForm.categoria === "" && novoForm._novaCat !== undefined && (
                  <input autoFocus value={novoForm._novaCat||""} onChange={e=>setNovoForm(f=>({...f,categoria:e.target.value,_novaCat:e.target.value}))}
                    placeholder="Nome da nova categoria" style={{ ...iStyle, width:"100%", fontSize:12, padding:"8px 10px", marginTop:6, borderColor:"#7c3aed" }} />
                )}
                {/* Trigger nova categoria */}
                {novoForm.categoria === "__nova__" || novoForm._novaCat !== undefined ? null : null}
              </div>
              {/* Campo para nova categoria caso selecione "+ Nova categoria..." */}
              {novoForm.categoria === "" && (
                <div style={{ display: allCatsForSelect.length > 0 ? "none" : "block" }}>
                  <input value={novoForm._catCustom||""} onChange={e=>setNovoForm(f=>({...f,categoria:e.target.value,_catCustom:e.target.value}))}
                    placeholder="Digite o nome da categoria" style={{ ...iStyle, width:"100%", fontSize:12, padding:"8px 10px" }} />
                </div>
              )}
              {novoForm.categoria && (
                <div>
                  <label style={{ fontSize:10, color:"#6b5f80", display:"block", marginBottom:4, textTransform:"uppercase" }}>Subcategoria (opcional)</label>
                  {allSubsForSelect(novoForm.categoria).length > 0
                    ? <select value={novoForm.subcategoria||""} onChange={e=>setNovoForm(f=>({...f,subcategoria:e.target.value==="__nova__sub__"?"__nova__sub__":e.target.value}))}
                        style={{ ...iStyle, width:"100%", fontSize:12, padding:"8px 10px", cursor:"pointer" }}>
                        <option value="">Sem subcategoria</option>
                        {allSubsForSelect(novoForm.categoria).map(s=><option key={s} value={s}>{s}</option>)}
                        <option value="__nova__sub__">+ Nova subcategoria...</option>
                      </select>
                    : <input value={novoForm.subcategoria||""} onChange={e=>setNovoForm(f=>({...f,subcategoria:e.target.value}))}
                        placeholder="Ex: 15cm - baixo (opcional)" style={{ ...iStyle, width:"100%", fontSize:12, padding:"8px 10px" }} />
                  }
                  {novoForm.subcategoria === "__nova__sub__" && (
                    <input autoFocus value={novoForm._subCustom||""} onChange={e=>setNovoForm(f=>({...f,subcategoria:e.target.value,_subCustom:e.target.value}))}
                      placeholder="Nome da nova subcategoria" style={{ ...iStyle, width:"100%", fontSize:12, padding:"8px 10px", marginTop:6, borderColor:"#7c3aed" }} />
                  )}
                </div>
              )}
              <div>
                <label style={{ fontSize:10, color:"#6b5f80", display:"block", marginBottom:4, textTransform:"uppercase" }}>Nome do produto *</label>
                <input value={novoForm.nome||""} onChange={e=>setNovoForm(f=>({...f,nome:e.target.value}))}
                  placeholder="Ex: S'mores" style={{ ...iStyle, width:"100%", fontSize:12, padding:"8px 10px" }}
                  onKeyDown={e=>{ if(e.key==="Enter") salvarNovoProduto(); }} />
              </div>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:16 }}>
              <button onClick={salvarNovoProduto} disabled={!novoForm.nome?.trim()||!novoForm.categoria?.trim()}
                style={{ flex:1, padding:"10px", borderRadius:8, border:"none", background:"#7c3aed", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer", opacity:(!novoForm.nome||!novoForm.categoria)?0.5:1 }}>
                Criar produto
              </button>
              <button onClick={()=>setNovoModal(null)}
                style={{ padding:"10px 16px", borderRadius:8, border:"1px solid #3a3060", background:"none", color:"#8a7fa0", cursor:"pointer" }}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Novo canal */}
      {novoModal === "canal" && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={()=>setNovoModal(null)}>
          <div style={{ background:"#13101e", borderRadius:14, border:"1.5px solid #2d2640", padding:24, width:"100%", maxWidth:420 }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:14, fontWeight:800, color:"#818cf8", marginBottom:16 }}>➕ Novo Canal de Venda</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div>
                <label style={{ fontSize:10, color:"#6b5f80", display:"block", marginBottom:4, textTransform:"uppercase" }}>Nome *</label>
                <input value={novoForm.nome||""} onChange={e=>setNovoForm(f=>({...f,nome:e.target.value}))}
                  placeholder="Ex: iFood - TJK" style={{ ...iStyle, width:"100%", fontSize:12, padding:"8px 10px" }} />
              </div>
              <div>
                <label style={{ fontSize:10, color:"#6b5f80", display:"block", marginBottom:4, textTransform:"uppercase" }}>CNPJ (opcional)</label>
                <input value={novoForm.cnpj||""} onChange={e=>setNovoForm(f=>({...f,cnpj:e.target.value}))}
                  placeholder="Ex: 48.659.129" style={{ ...iStyle, width:"100%", fontSize:12, padding:"8px 10px" }} />
              </div>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:16 }}>
              <button onClick={salvarNovoCanal} disabled={!novoForm.nome?.trim()}
                style={{ flex:1, padding:"10px", borderRadius:8, border:"none", background:"#7c3aed", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer" }}>
                Criar canal
              </button>
              <button onClick={()=>setNovoModal(null)}
                style={{ padding:"10px 16px", borderRadius:8, border:"1px solid #3a3060", background:"none", color:"#8a7fa0", cursor:"pointer" }}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar produto */}
      {editModal?.tipo === "produto" && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={()=>setEditModal(null)}>
          <div style={{ background:"#13101e", borderRadius:14, border:"1.5px solid #2d2640", padding:24, width:"100%", maxWidth:420 }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:14, fontWeight:800, color:"#c084fc", marginBottom:16 }}>✏️ Editar Produto</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div>
                <label style={{ fontSize:10, color:"#6b5f80", display:"block", marginBottom:4, textTransform:"uppercase" }}>Categoria</label>
                <select value={editModal.item.categoria||""} onChange={e=>setEditModal(m=>({...m,item:{...m.item,categoria:e.target.value,subcategoria:""}}))}
                  style={{ ...iStyle, width:"100%", fontSize:12, padding:"8px 10px", cursor:"pointer" }}>
                  <option value="">Selecione...</option>
                  {allCatsForSelect.map(c=><option key={c} value={c}>{c}</option>)}
                  <option value="__nova__edit__">+ Nova categoria...</option>
                </select>
                {editModal.item.categoria === "__nova__edit__" && (
                  <input autoFocus value={editModal.item._catCustom||""} onChange={e=>setEditModal(m=>({...m,item:{...m.item,categoria:e.target.value,_catCustom:e.target.value}}))}
                    placeholder="Nome da nova categoria" style={{ ...iStyle, width:"100%", fontSize:12, padding:"8px 10px", marginTop:6, borderColor:"#7c3aed" }} />
                )}
              </div>
              <div>
                <label style={{ fontSize:10, color:"#6b5f80", display:"block", marginBottom:4, textTransform:"uppercase" }}>Subcategoria</label>
                {allSubsForSelect(editModal.item.categoria).length > 0
                  ? <select value={editModal.item.subcategoria||""} onChange={e=>setEditModal(m=>({...m,item:{...m.item,subcategoria:e.target.value==="__nova__sub__edit__"?"":e.target.value}}))}
                      style={{ ...iStyle, width:"100%", fontSize:12, padding:"8px 10px", cursor:"pointer" }}>
                      <option value="">Sem subcategoria</option>
                      {allSubsForSelect(editModal.item.categoria).map(s=><option key={s} value={s}>{s}</option>)}
                      <option value="__nova__sub__edit__">+ Nova subcategoria...</option>
                    </select>
                  : <input value={editModal.item.subcategoria||""} onChange={e=>setEditModal(m=>({...m,item:{...m.item,subcategoria:e.target.value}}))}
                      placeholder="Opcional" style={{ ...iStyle, width:"100%", fontSize:12, padding:"8px 10px" }} />
                }
              </div>
              <div>
                <label style={{ fontSize:10, color:"#6b5f80", display:"block", marginBottom:4, textTransform:"uppercase" }}>Nome</label>
                <input value={editModal.item.nome||""} onChange={e=>setEditModal(m=>({...m,item:{...m.item,nome:e.target.value}}))}
                  style={{ ...iStyle, width:"100%", fontSize:12, padding:"8px 10px" }} />
              </div>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:16 }}>
              <button onClick={salvarEditProduto}
                style={{ flex:1, padding:"10px", borderRadius:8, border:"none", background:"#7c3aed", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer" }}>
                Salvar
              </button>
              <button onClick={()=>{ if(window.confirm("Remover produto?")) excluirProduto(editModal.item.id); }}
                style={{ padding:"10px 14px", borderRadius:8, border:"1px solid #7f1d1d", background:"none", color:"#f87171", cursor:"pointer", fontSize:12 }}>🗑</button>
              <button onClick={()=>setEditModal(null)}
                style={{ padding:"10px 14px", borderRadius:8, border:"1px solid #3a3060", background:"none", color:"#8a7fa0", cursor:"pointer" }}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar canal */}
      {editModal?.tipo === "canal" && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={()=>setEditModal(null)}>
          <div style={{ background:"#13101e", borderRadius:14, border:"1.5px solid #2d2640", padding:24, width:"100%", maxWidth:420 }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:14, fontWeight:800, color:"#818cf8", marginBottom:16 }}>✏️ Editar Canal</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div>
                <label style={{ fontSize:10, color:"#6b5f80", display:"block", marginBottom:4, textTransform:"uppercase" }}>Nome</label>
                <input value={editModal.item.nome||""} onChange={e=>setEditModal(m=>({...m,item:{...m.item,nome:e.target.value}}))}
                  style={{ ...iStyle, width:"100%", fontSize:12, padding:"8px 10px" }} />
              </div>
              <div>
                <label style={{ fontSize:10, color:"#6b5f80", display:"block", marginBottom:4, textTransform:"uppercase" }}>CNPJ</label>
                <input value={editModal.item.cnpj||""} onChange={e=>setEditModal(m=>({...m,item:{...m.item,cnpj:e.target.value}}))}
                  style={{ ...iStyle, width:"100%", fontSize:12, padding:"8px 10px" }} />
              </div>
            </div>
            <div style={{ display:"flex", gap:8, marginTop:16 }}>
              <button onClick={salvarEditCanal}
                style={{ flex:1, padding:"10px", borderRadius:8, border:"none", background:"#7c3aed", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer" }}>
                Salvar
              </button>
              <button onClick={()=>{ if(window.confirm("Remover canal?")) excluirCanal(editModal.item.id); }}
                style={{ padding:"10px 14px", borderRadius:8, border:"1px solid #7f1d1d", background:"none", color:"#f87171", cursor:"pointer", fontSize:12 }}>🗑</button>
              <button onClick={()=>setEditModal(null)}
                style={{ padding:"10px 14px", borderRadius:8, border:"1px solid #3a3060", background:"none", color:"#8a7fa0", cursor:"pointer" }}>✕</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}



// ─── APP ──────────────────────────────────────────────────────────────────────

// ─── FORNECEDORES CONFIG ──────────────────────────────────────────────────────
function FornecedoresConfig({ fornecedores, onUpdate }) {
  const emptyForn = () => ({ id: Date.now(), nome: "", cnpjCpf: "", telefone: "", email: "", contato: "", tipo: "", endereco: "" });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForn());
  const [editId, setEditId] = useState(null);
  const [busca, setBusca] = useState("");

  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.nome.trim()) return;
    if (editId) {
      onUpdate(fornecedores.map(f => f.id === editId ? { ...form, id: editId } : f));
    } else {
      onUpdate([...fornecedores, { ...form, id: Date.now() }]);
    }
    setForm(emptyForn()); setShowForm(false); setEditId(null);
  };

  const startEdit = (forn) => {
    setForm(forn); setEditId(forn.id); setShowForm(true);
  };

  const remove = (id) => onUpdate(fornecedores.filter(f => f.id !== id));

  const filtered = fornecedores.filter(f =>
    !busca || f.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (f.cnpjCpf || "").includes(busca) || (f.email || "").toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={{ background: "#13101e", border: "1.5px solid #2d2640", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #2d2640", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#38bdf8", display: "inline-block" }} />
        <span style={{ fontWeight: 700, fontSize: 14, color: "#f0e8ff" }}>Fornecedores</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#6b5f80" }}>{fornecedores.length} cadastrados</span>
        <button onClick={() => { setForm(emptyForn()); setEditId(null); setShowForm(s => !s); }}
          style={{ padding: "5px 12px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#0ea5e9,#0284c7)", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
          {showForm && !editId ? "✕ Cancelar" : "+ Novo Fornecedor"}
        </button>
      </div>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Form */}
        {showForm && (
          <div style={{ background: "#0d1a26", border: "1.5px solid #0ea5e940", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#38bdf8", marginBottom: 2 }}>
              {editId ? "✏️ Editar Fornecedor" : "📋 Novo Fornecedor"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ gridColumn: "1/-1" }}>
                <FInput label="Nome / Razão Social *" value={form.nome} onChange={set("nome")} placeholder="Nome do fornecedor" />
              </div>
              <FInput label="CNPJ / CPF" value={form.cnpjCpf} onChange={set("cnpjCpf")} placeholder="00.000.000/0001-00" />
              <FInput label="Telefone" value={form.telefone} onChange={set("telefone")} placeholder="(21) 99999-9999" />
              <FInput label="E-mail" value={form.email} onChange={set("email")} placeholder="contato@email.com" />
              <FInput label="Nome do Contato" value={form.contato} onChange={set("contato")} placeholder="Nome do responsável" />
              <FSel label="Tipo" value={form.tipo} onChange={set("tipo")} options={["Pessoa Física","Pessoa Jurídica","MEI"]} />
              <div style={{ gridColumn: "1/-1" }}>
                <FInput label="Endereço" value={form.endereco} onChange={set("endereco")} placeholder="Rua, número, cidade..." />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
              <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForn()); }}
                style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #2d2640", background: "none", color: "#8a7fa0", cursor: "pointer", fontSize: 12 }}>Cancelar</button>
              <button onClick={save}
                style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#0ea5e9,#0284c7)", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                {editId ? "Salvar Alterações" : "Cadastrar"}
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        {fornecedores.length > 0 && (
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="🔍 Buscar fornecedor..."
            style={{ ...iStyle, fontSize: 12, padding: "7px 12px" }} />
        )}

        {/* List */}
        {filtered.length === 0 && fornecedores.length === 0 && (
          <p style={{ margin: 0, fontSize: 13, color: "#6b5f80", textAlign: "center", padding: "16px 0", fontStyle: "italic" }}>
            Nenhum fornecedor cadastrado ainda.
          </p>
        )}
        {filtered.map(forn => (
          <div key={forn.id} style={{ background: "#0d1a26", border: "1px solid #0ea5e920", borderRadius: 10, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#e0f2fe" }}>{forn.nome}</span>
                {forn.tipo && <span style={{ fontSize: 11, background: "#0c2238", color: "#38bdf8", border: "1px solid #0ea5e940", padding: "1px 7px", borderRadius: 99, fontWeight: 600 }}>{forn.tipo}</span>}
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {forn.cnpjCpf && <span style={{ fontSize: 12, color: "#8a7fa0" }}>📄 {forn.cnpjCpf}</span>}
                {forn.telefone && <span style={{ fontSize: 12, color: "#8a7fa0" }}>📞 {forn.telefone}</span>}
                {forn.email && <span style={{ fontSize: 12, color: "#8a7fa0" }}>✉️ {forn.email}</span>}
                {forn.contato && <span style={{ fontSize: 12, color: "#8a7fa0" }}>👤 {forn.contato}</span>}
              </div>
              {forn.endereco && <div style={{ fontSize: 11, color: "#6b5f80", marginTop: 3 }}>📍 {forn.endereco}</div>}
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button onClick={() => startEdit(forn)} style={{ background: "none", border: "1px solid #2d2640", borderRadius: 6, color: "#8a7fa0", cursor: "pointer", padding: "5px 9px", fontSize: 11 }}>✏️</button>
              <button onClick={() => remove(forn.id)} style={{ background: "none", border: "1px solid #7f1d1d", borderRadius: 6, color: "#f87171", cursor: "pointer", padding: "5px 9px", fontSize: 11 }}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── METAS TAB ────────────────────────────────────────────────────────────────
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function ProgressBar({ realizado, meta, color }) {
  const pct = meta > 0 ? Math.min(100, (realizado / meta) * 100) : 0;
  const over = meta > 0 && realizado > meta;
  const barColor = over ? "#f87171" : color;
  return (
    <div style={{ width: "100%", background: "#1a1628", borderRadius: 99, height: 7, overflow: "hidden" }}>
      <div style={{ width: pct + "%", height: "100%", background: barColor, borderRadius: 99, transition: "width 0.4s ease" }} />
    </div>
  );
}

function MetasTab({ metas, onUpdate, receitas, despesas, catReceita, catDespesa }) {
  const ANOS = [2024, 2025, 2026, 2027, 2028];
  const [anoSel, setAnoSel] = useState(metas.ano || new Date().getFullYear());
  const [activeSection, setActiveSection] = useState("receitas");
  const [expandedCats, setExpandedCats] = useState({});

  const toggleCat = (cat) => setExpandedCats(p => ({ ...p, [cat]: !p[cat] }));

  // Key format: "ano-mes-plano" or "ano-mes-plano-conta"
  const makeKey = (mes, plano, conta) =>
    conta ? `${anoSel}-${String(mes).padStart(2,"0")}-${plano}|||${conta}`
           : `${anoSel}-${String(mes).padStart(2,"0")}-${plano}`;

  const getMeta = (tipo, mes, plano, conta) => {
    const k = makeKey(mes, plano, conta);
    const v = metas[tipo]?.[k];
    return v === undefined ? "" : v;
  };

  const setMeta = (tipo, mes, plano, conta, valor) => {
    const k = makeKey(mes, plano, conta);
    onUpdate({
      ...metas,
      [tipo]: { ...metas[tipo], [k]: valor === "" ? "" : Number(valor) }
    });
  };

  // Realizado: sum from actual transactions for that month
  const getRealizado = (tipo, mes, plano, conta) => {
    const prefix = `${anoSel}-${String(mes).padStart(2,"0")}`;
    if (tipo === "receitas") {
      return receitas
        .filter(r => {
          const dateField = r.recebimento || r.data;
          if (!dateField || !dateField.startsWith(prefix)) return false;
          if (r.plano !== plano) return false;
          if (conta && r.conta !== conta) return false;
          if (!conta) return true; // category total
          return true;
        })
        .reduce((s, r) => s + Number(r.valor || 0), 0);
    } else {
      return despesas
        .filter(d => {
          const dateField = d.pagamento || d.data;
          if (!dateField || !dateField.startsWith(prefix)) return false;
          if (d.plano !== plano) return false;
          if (conta && d.conta !== conta) return false;
          return true;
        })
        .reduce((s, d) => s + Number(d.valor || 0), 0);
    }
  };

  const catMap = activeSection === "receitas" ? catReceita : catDespesa;
  const accent = activeSection === "receitas" ? "#4ade80" : "#f87171";
  const accentDim = activeSection === "receitas" ? "#166534" : "#7f1d1d";
  const accentBg = activeSection === "receitas" ? "#071a0d" : "#1a0707";

  // Totals per month for the summary row
  const monthTotals = MESES.map((_, mi) => {
    const mes = mi + 1;
    let orcado = 0, realizado = 0;
    Object.keys(catMap).forEach(plano => {
      const subs = catMap[plano];
      if (subs.length > 0) {
        subs.forEach(conta => {
          orcado += Number(getMeta(activeSection, mes, plano, conta) || 0);
          realizado += getRealizado(activeSection, mes, plano, conta);
        });
      } else {
        orcado += Number(getMeta(activeSection, mes, plano, null) || 0);
        realizado += getRealizado(activeSection, mes, plano, null);
      }
    });
    return { orcado, realizado, dif: realizado - orcado };
  });

  const cellBase = {
    padding: "6px 8px", fontSize: 12, borderRight: "1px solid #1e1a2e",
    whiteSpace: "nowrap", verticalAlign: "middle"
  };

  const inputCell = (tipo, mes, plano, conta) => {
    const v = getMeta(tipo, mes, plano, conta);
    return (
      <input
        type="number"
        step="0.01"
        value={v}
        onChange={e => setMeta(tipo, mes, plano, conta, e.target.value)}
        placeholder="—"
        style={{
          width: "100%", minWidth: 80, padding: "4px 6px", borderRadius: 6,
          border: "1.5px solid " + (Number(v) > 0 ? accent + "50" : "#2d2640"),
          background: Number(v) > 0 ? accentBg : "#0e0c18",
          color: "#f0e8ff", fontSize: 11, outline: "none", boxSizing: "border-box",
          textAlign: "right"
        }}
        onFocus={e => e.target.style.borderColor = accent}
        onBlur={e => e.target.style.borderColor = Number(getMeta(tipo, mes, plano, conta)) > 0 ? accent + "50" : "#2d2640"}
      />
    );
  };

  const fmtCell = (v, isReal, isMeta) => {
    if (!v && v !== 0) return <span style={{ color: "#3a3255" }}>—</span>;
    const num = Number(v);
    if (num === 0) return <span style={{ color: "#3a3255" }}>—</span>;
    const color = isReal ? "#c8b8e8" : isMeta ? accent : (num >= 0 ? "#4ade80" : "#f87171");
    return <span style={{ color, fontWeight: isReal || isMeta ? 500 : 700 }}>{fmt(num)}</span>;
  };

  const difCell = (real, orc) => {
    if (orc === 0 && real === 0) return <span style={{ color: "#3a3255" }}>—</span>;
    const dif = real - orc;
    const color = activeSection === "receitas"
      ? (dif >= 0 ? "#4ade80" : "#f87171")
      : (dif <= 0 ? "#4ade80" : "#f87171"); // for expenses, under budget is good
    return <span style={{ color, fontWeight: 700 }}>{dif >= 0 ? "+" : ""}{fmt(dif)}</span>;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, paddingBottom: 32 }}>
      {/* Controls */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, color: "#8a7fa0", fontWeight: 600, textTransform: "uppercase" }}>Ano</label>
          <select value={anoSel} onChange={e => setAnoSel(Number(e.target.value))}
            style={{ ...iStyle, width: 100, fontSize: 13 }}
            onFocus={e => e.target.style.borderColor = "#c084fc"} onBlur={e => e.target.style.borderColor = "#2d2640"}>
            {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
          {["receitas", "despesas"].map(s => (
            <button key={s} onClick={() => setActiveSection(s)}
              style={{
                padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 700,
                background: activeSection === s
                  ? (s === "receitas" ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#ef4444,#dc2626)")
                  : "#1a1628",
                color: activeSection === s ? "#fff" : "#8a7fa0"
              }}>
              {s === "receitas" ? "↑ Receitas" : "↓ Despesas"}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable table */}
      <div style={{ overflowX: "auto", borderRadius: 12, border: "1.5px solid #2d2640" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 900 }}>
          <thead>
            {/* Month headers */}
            <tr style={{ background: "#1a1628" }}>
              <th style={{ ...cellBase, width: 200, minWidth: 180, textAlign: "left", color: "#8a7fa0", fontSize: 11, fontWeight: 700, textTransform: "uppercase", position: "sticky", left: 0, background: "#1a1628", zIndex: 2, borderRight: "2px solid #2d2640" }}>
                Plano de Conta
              </th>
              {MESES.map((mes) => (
                <th key={mes} colSpan={3} style={{ ...cellBase, textAlign: "center", color: accent, fontSize: 11, fontWeight: 700, textTransform: "uppercase", borderRight: "2px solid #2d2640", background: "#1a1628" }}>
                  {mes.slice(0,3).toUpperCase()}
                </th>
              ))}
            </tr>
            {/* Orçado / Realizado / Diferença sub-headers */}
            <tr style={{ background: "#13101e", borderBottom: "2px solid #2d2640" }}>
              <th style={{ ...cellBase, width: 200, minWidth: 180, position: "sticky", left: 0, background: "#13101e", zIndex: 2, borderRight: "2px solid #2d2640" }} />
              {MESES.map((_, mi) => (
                [
                  <th key={`o${mi}`} style={{ ...cellBase, fontSize: 10, color: accent, fontWeight: 700, textAlign: "center", background: "#13101e", textTransform: "uppercase" }}>Orçado</th>,
                  <th key={`r${mi}`} style={{ ...cellBase, fontSize: 10, color: "#8a7fa0", fontWeight: 700, textAlign: "center", background: "#13101e", textTransform: "uppercase" }}>Realizado</th>,
                  <th key={`d${mi}`} style={{ ...cellBase, fontSize: 10, color: "#c084fc", fontWeight: 700, textAlign: "center", background: "#13101e", borderRight: "2px solid #2d2640", textTransform: "uppercase" }}>Dif.</th>
                ]
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(catMap).map(([plano, subs], pi) => {
              const isExpanded = expandedCats[plano];
              const hasSubs = subs.length > 0;

              // Category total row
              const catRows = MESES.map((_, mi) => {
                const mes = mi + 1;
                let orc, real;
                if (hasSubs) {
                  orc = subs.reduce((s, c) => s + Number(getMeta(activeSection, mes, plano, c) || 0), 0);
                  real = subs.reduce((s, c) => s + getRealizado(activeSection, mes, plano, c), 0);
                } else {
                  orc = Number(getMeta(activeSection, mes, plano, null) || 0);
                  real = getRealizado(activeSection, mes, plano, null);
                }
                return { orc, real };
              });

              return [
                // ── Category row ──
                <tr key={plano} style={{ background: pi % 2 === 0 ? "#0f0d1a" : "#13101e", cursor: hasSubs ? "pointer" : "default" }}
                  onClick={() => hasSubs && toggleCat(plano)}>
                  <td style={{ ...cellBase, position: "sticky", left: 0, background: pi % 2 === 0 ? "#0f0d1a" : "#13101e", zIndex: 1, borderRight: "2px solid #2d2640", fontWeight: 700, color: "#e0d4f5", fontSize: 12 }}>
                    <span style={{ marginRight: 6, color: "#6b5f80", fontSize: 10 }}>
                      {hasSubs ? (isExpanded ? "▾" : "▸") : "·"}
                    </span>
                    {plano}
                  </td>
                  {catRows.map(({ orc, real }, mi) => (
                    [
                      <td key={`o${mi}`} style={{ ...cellBase, textAlign: "right" }}
                          onClick={e => { if (!hasSubs) e.stopPropagation(); }}>
                        {hasSubs
                          ? fmtCell(orc, false, true)
                          : inputCell(activeSection, mi + 1, plano, null)
                        }
                      </td>,
                      <td key={`r${mi}`} style={{ ...cellBase, textAlign: "right" }}>
                        {fmtCell(real, true, false)}
                      </td>,
                      <td key={`d${mi}`} style={{ ...cellBase, textAlign: "right", borderRight: "2px solid #2d2640" }}>
                        {difCell(real, orc)}
                      </td>
                    ]
                  ))}
                </tr>,

                // ── Sub-item rows (if expanded) ──
                ...(hasSubs && isExpanded ? subs.map((conta, si) => (
                  <tr key={`${plano}-${conta}`} style={{ background: pi % 2 === 0 ? "#0c0a17" : "#100e1b" }}>
                    <td style={{ ...cellBase, position: "sticky", left: 0, background: pi % 2 === 0 ? "#0c0a17" : "#100e1b", zIndex: 1, borderRight: "2px solid #2d2640", color: "#9688b8", fontSize: 11, paddingLeft: 24 }}>
                      ↳ {conta}
                    </td>
                    {MESES.map((_, mi) => {
                      const real = getRealizado(activeSection, mi + 1, plano, conta);
                      const orc = Number(getMeta(activeSection, mi + 1, plano, conta) || 0);
                      return [
                        <td key={`o${mi}`} style={{ ...cellBase, textAlign: "right" }} onClick={e => e.stopPropagation()}>
                          {inputCell(activeSection, mi + 1, plano, conta)}
                        </td>,
                        <td key={`r${mi}`} style={{ ...cellBase, textAlign: "right" }}>
                          {fmtCell(real, true, false)}
                        </td>,
                        <td key={`d${mi}`} style={{ ...cellBase, textAlign: "right", borderRight: "2px solid #2d2640" }}>
                          {difCell(real, orc)}
                        </td>
                      ];
                    })}
                  </tr>
                )) : [])
              ];
            })}

            {/* ── TOTAL ROW ── */}
            <tr style={{ background: "#1a1628", borderTop: "2px solid #2d2640" }}>
              <td style={{ ...cellBase, position: "sticky", left: 0, background: "#1a1628", zIndex: 1, borderRight: "2px solid #2d2640", fontWeight: 800, color: accent, fontSize: 12, textTransform: "uppercase" }}>
                TOTAL
              </td>
              {monthTotals.map(({ orcado, realizado, dif }, mi) => (
                [
                  <td key={`o${mi}`} style={{ ...cellBase, textAlign: "right", fontWeight: 700 }}>
                    {fmtCell(orcado, false, true)}
                  </td>,
                  <td key={`r${mi}`} style={{ ...cellBase, textAlign: "right", fontWeight: 700 }}>
                    {fmtCell(realizado, true, false)}
                  </td>,
                  <td key={`d${mi}`} style={{ ...cellBase, textAlign: "right", borderRight: "2px solid #2d2640", fontWeight: 800 }}>
                    {difCell(realizado, orcado)}
                  </td>
                ]
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: "#6b5f80" }}>
          <span style={{ color: accent, fontWeight: 700 }}>Orçado</span> = valor que você quer atingir
        </span>
        <span style={{ fontSize: 11, color: "#6b5f80" }}>
          <span style={{ color: "#c8b8e8", fontWeight: 700 }}>Realizado</span> = soma dos lançamentos
        </span>
        <span style={{ fontSize: 11, color: "#6b5f80" }}>
          <span style={{ color: "#c084fc", fontWeight: 700 }}>Diferença</span> = realizado − orçado
        </span>
        <span style={{ fontSize: 11, color: "#6b5f80" }}>
          ▸ Clique em uma categoria com subcategorias para expandir
        </span>
      </div>
    </div>
  );
}



// ─── RELATÓRIOS ───────────────────────────────────────────────────────────────
function RelatorioShell({ icon, title, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 12, borderBottom: "1px solid #2d2640" }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#f0e8ff" }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function EmptyRelatorio({ icon, title }) {
  return (
    <div style={{ background: "#13101e", border: "1.5px solid #2d2640", borderRadius: 12, padding: "40px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#c084fc", marginBottom: 8 }}>{title}</div>
      <p style={{ color: "#6b5f80", fontSize: 13, margin: 0 }}>Selecione um relatório no menu lateral para visualizar.</p>
    </div>
  );
}

function RelConciliacao({ receitas, despesas, transferencias, bancos }) {
  const [mesSel, setMesSel] = useState(new Date().getMonth() + 1);
  const [anoSel, setAnoSel] = useState(new Date().getFullYear());
  const [expandido, setExpandido] = useState(null); // banco expandido
  const [filtroTipo, setFiltroTipo] = useState("todos"); // todos | entradas | saidas | transf

  const prefix = `${anoSel}-${String(mesSel).padStart(2,"0")}`;
  const toggle = (banco) => setExpandido(b => b === banco ? null : banco);

  // União de bancos cadastrados + bancos que aparecem nos dados (garante que nenhum suma)
  const todosBancos = [...new Set([
    ...bancos,
    ...receitas.map(r => r.banco).filter(Boolean),
    ...despesas.map(d => d.banco).filter(Boolean),
  ])].sort();

  return (
    <RelatorioShell icon="⚖" title="Conciliação Bancária">
      {/* Filtros de período */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, color: "#8a7fa0", fontWeight: 600, textTransform: "uppercase" }}>Mês</label>
          <select value={mesSel} onChange={e => { setMesSel(Number(e.target.value)); setExpandido(null); }} style={{ ...iStyle, width: 130, fontSize: 12 }}>
            {MESES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, color: "#8a7fa0", fontWeight: 600, textTransform: "uppercase" }}>Ano</label>
          <select value={anoSel} onChange={e => { setAnoSel(Number(e.target.value)); setExpandido(null); }} style={{ ...iStyle, width: 90, fontSize: 12 }}>
            {[2024,2025,2026,2027,2028].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div style={{ fontSize: 11, color: "#4a3f60", paddingBottom: 6 }}>
          Clique em uma conta para ver as transações do período
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {todosBancos.map(banco => {
          const recsBanco   = receitas.filter(r => r.banco === banco && (r.recebimento||r.data||"").startsWith(prefix));
          const despsBanco  = despesas.filter(d => d.banco === banco && (d.pagamento||d.data||"").startsWith(prefix));
          const transfBanco = transferencias.filter(t => (t.entrouBanco===banco || t.saidoBanco===banco) && (t.data||"").startsWith(prefix));

          const entradas = recsBanco.reduce((s,r)=>s+Number(r.valor||0),0);
          const saidas   = despsBanco.reduce((s,d)=>s+Number(d.valor||0),0);
          const transfE  = transferencias.filter(t => t.entrouBanco===banco && (t.data||"").startsWith(prefix)).reduce((s,t)=>s+Number(t.valor||0),0);
          const transfS  = transferencias.filter(t => t.saidoBanco===banco && (t.data||"").startsWith(prefix)).reduce((s,t)=>s+Number(t.valor||0),0);
          const liquido  = entradas + transfE - saidas - transfS;
          const total    = recsBanco.length + despsBanco.length + transfBanco.length;

          if (total === 0) return null;

          const isOpen = expandido === banco;

          // Monta lista unificada de transações
          const txns = [
            ...recsBanco.map(r  => ({ ...r,  _tipo:"entrada", _data: r.recebimento||r.data, _desc: r.descricao||r.conta||r.plano, _doc: r.documento })),
            ...despsBanco.map(d => ({ ...d,  _tipo:"saida",   _data: d.pagamento||d.data,   _desc: d.descricao||d.conta||d.plano, _doc: d.documento })),
            ...transfBanco.map(t=> ({ ...t,  _tipo:"transf",  _data: t.data,                _desc: t.descricao||"Transferência",  _doc: "Transferência",
              _de: t.saidoBanco, _para: t.entrouBanco })),
          ].sort((a,b) => (a._data||"").localeCompare(b._data||""));

          const txnsFiltradas = txns.filter(t =>
            filtroTipo === "todos" ? true :
            filtroTipo === "entradas" ? t._tipo === "entrada" :
            filtroTipo === "saidas"   ? t._tipo === "saida" :
            t._tipo === "transf"
          );

          return (
            <div key={banco} style={{ background:"#13101e", border:`1.5px solid ${isOpen?"#7c3aed":"#2d2640"}`, borderRadius:12, overflow:"hidden", transition:"border-color 0.2s" }}>

              {/* Header do card — clicável */}
              <button onClick={() => toggle(banco)} style={{
                width:"100%", background:"none", border:"none", cursor:"pointer", padding:"14px 16px",
                display:"flex", alignItems:"center", gap:12, textAlign:"left"
              }}>
                {/* Ícone + nome */}
                <span style={{ fontSize:16, flexShrink:0 }}>🏦</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, color:"#e0d4f5", fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{banco}</div>
                  <div style={{ fontSize:10, color:"#6b5f80", marginTop:1 }}>{total} transação{total!==1?"ões":""} no período</div>
                </div>

                {/* Mini KPIs inline */}
                <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                  {entradas>0 && <span style={{ fontSize:11, fontWeight:700, color:"#f59e0b", background:"#1c1600", border:"1px solid #92400e", borderRadius:6, padding:"2px 8px" }}>+{fmt(entradas)}</span>}
                  {saidas>0   && <span style={{ fontSize:11, fontWeight:700, color:"#f87171", background:"#1a0505", border:"1px solid #7f1d1d", borderRadius:6, padding:"2px 8px" }}>-{fmt(saidas)}</span>}
                  <span style={{ fontSize:11, fontWeight:800, color:liquido>=0?"#c084fc":"#f87171", background: liquido>=0?"#1a0d2e":"#1a0505", border:`1px solid ${liquido>=0?"#4c1d95":"#7f1d1d"}`, borderRadius:6, padding:"2px 8px" }}>={fmt(liquido)}</span>
                </div>

                {/* Chevron */}
                <span style={{ fontSize:12, color:"#6b5f80", flexShrink:0, transform: isOpen?"rotate(180deg)":"none", transition:"transform 0.2s" }}>▼</span>
              </button>

              {/* Painel expandido */}
              {isOpen && (
                <div style={{ borderTop:"1px solid #2d2640" }}>

                  {/* Filtro de tipo de transação */}
                  <div style={{ padding:"10px 16px", background:"#0d0b15", display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                    <span style={{ fontSize:10, color:"#4a3f60", fontWeight:700, textTransform:"uppercase" }}>Exibir:</span>
                    {[["todos","Todos",total],["entradas","Entradas",recsBanco.length],["saidas","Saídas",despsBanco.length],["transf","Transferências",transfBanco.length]].map(([v,l,n])=>(
                      <button key={v} onClick={()=>setFiltroTipo(v)}
                        style={{ padding:"3px 10px", borderRadius:6, border:`1px solid ${filtroTipo===v?"#7c3aed":"#2d2640"}`,
                          background:filtroTipo===v?"#2d1254":"none", color:filtroTipo===v?"#c084fc":"#6b5f80",
                          cursor:"pointer", fontSize:11, fontWeight:filtroTipo===v?700:400 }}>
                        {l} <span style={{opacity:0.6}}>({n})</span>
                      </button>
                    ))}
                    <span style={{ marginLeft:"auto", fontSize:10, color:"#4a3f60" }}>{txnsFiltradas.length} registro{txnsFiltradas.length!==1?"s":""}</span>
                  </div>

                  {/* Tabela de transações */}
                  <div style={{ overflowX:"auto", maxHeight:400, overflowY:"auto" }}>
                    <table style={{ borderCollapse:"collapse", width:"100%", minWidth:560 }}>
                      <thead>
                        <tr style={{ background:"#100e1b", position:"sticky", top:0, zIndex:1 }}>
                          {["Tipo","Data","Descrição","Documento","Valor"].map((h,i)=>(
                            <th key={h} style={{ padding:"8px 12px", fontSize:9, fontWeight:800, color:"#4a3f60",
                              textTransform:"uppercase", letterSpacing:"0.07em",
                              textAlign:i===4?"right":"left", borderBottom:"1px solid #1a1628",
                              whiteSpace:"nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {txnsFiltradas.length === 0 ? (
                          <tr><td colSpan={5} style={{ padding:24, textAlign:"center", color:"#4a3f60", fontSize:12 }}>Nenhuma transação neste filtro.</td></tr>
                        ) : txnsFiltradas.map((t, i) => {
                          const cor   = t._tipo==="entrada"?"#f59e0b":t._tipo==="saida"?"#f87171":"#818cf8";
                          const bgBdg = t._tipo==="entrada"?"#1c1600":t._tipo==="saida"?"#1a0505":"#1e1b4b";
                          const bBdg  = t._tipo==="entrada"?"#92400e":t._tipo==="saida"?"#7f1d1d":"#3730a3";
                          const label = t._tipo==="entrada"?"↑ Entrada":t._tipo==="saida"?"↓ Saída":"⇌ Transf.";
                          return (
                            <tr key={t.id||i} style={{ background:i%2===0?"#0d0b15":"#100e1b", borderBottom:"1px solid #13101e" }}>
                              <td style={{ padding:"8px 12px", whiteSpace:"nowrap" }}>
                                <span style={{ fontSize:10, fontWeight:700, color:cor, background:bgBdg, border:`1px solid ${bBdg}`, borderRadius:4, padding:"2px 6px" }}>{label}</span>
                              </td>
                              <td style={{ padding:"8px 12px", fontSize:11, color:"#8a7fa0", whiteSpace:"nowrap" }}>{fmtDate(t._data)}</td>
                              <td style={{ padding:"8px 12px", fontSize:11, color:"#c8b8e8", maxWidth:220, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}
                                title={t._tipo==="transf" ? `${t._de} → ${t._para}` : t._desc}>
                                {t._tipo==="transf"
                                  ? <span><span style={{color:"#f87171"}}>{t._de}</span><span style={{color:"#4a3f60",margin:"0 4px"}}>→</span><span style={{color:"#f59e0b"}}>{t._para}</span></span>
                                  : t._desc
                                }
                              </td>
                              <td style={{ padding:"8px 12px", fontSize:10, color:"#6b5f80", whiteSpace:"nowrap" }}>{t._doc||"—"}</td>
                              <td style={{ padding:"8px 12px", fontSize:12, fontWeight:800, color:cor, textAlign:"right", whiteSpace:"nowrap" }}>
                                {t._tipo==="entrada"?"+":t._tipo==="saida"?"-":""}{fmt(t.valor||0)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {txnsFiltradas.length > 0 && (
                        <tfoot>
                          <tr style={{ background:"#1a1628", borderTop:"1.5px solid #2d2640" }}>
                            <td colSpan={4} style={{ padding:"9px 12px", fontSize:11, fontWeight:800, color:"#6b5f80", textTransform:"uppercase" }}>Total do período</td>
                            <td style={{ padding:"9px 12px", fontSize:13, fontWeight:900, color:liquido>=0?"#c084fc":"#f87171", textAlign:"right" }}>{fmt(liquido)}</td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </RelatorioShell>
  );
}

function RelFCDiario({ receitas, despesas, transferencias }) {
  const [mesSel, setMesSel] = useState(new Date().getMonth() + 1);
  const [anoSel, setAnoSel] = useState(new Date().getFullYear());
  const prefix = `${anoSel}-${String(mesSel).padStart(2,"0")}`;
  const diasNoMes = new Date(anoSel, mesSel, 0).getDate();
  const dias = Array.from({length: diasNoMes}, (_,i) => {
    const d = String(i+1).padStart(2,"0");
    const dayKey = `${prefix}-${d}`;
    const rec = receitas.filter(r => (r.recebimento||r.data||"") === dayKey).reduce((s,r)=>s+Number(r.valor||0),0);
    const desp = despesas.filter(d2 => (d2.pagamento||d2.data||"") === dayKey).reduce((s,d2)=>s+Number(d2.valor||0),0);
    const tE = transferencias.filter(t => t.data === dayKey).reduce((s,t)=>s+Number(t.valor||0),0);
    return { dia: i+1, rec, desp, saldo: rec - desp };
  }).filter(d => d.rec > 0 || d.desp > 0);

  return (
    <RelatorioShell icon="📅" title="Fluxo de Caixa Diário">
      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, color: "#8a7fa0", fontWeight: 600, textTransform: "uppercase" }}>Mês</label>
          <select value={mesSel} onChange={e => setMesSel(Number(e.target.value))} style={{ ...iStyle, width: 130, fontSize: 12 }}>
            {MESES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, color: "#8a7fa0", fontWeight: 600, textTransform: "uppercase" }}>Ano</label>
          <select value={anoSel} onChange={e => setAnoSel(Number(e.target.value))} style={{ ...iStyle, width: 90, fontSize: 12 }}>
            {[2024,2025,2026,2027,2028].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>
      {dias.length === 0 ? <p style={{ color: "#6b5f80", textAlign: "center", padding: 32 }}>Nenhum lançamento neste período.</p> :
        <div style={{ overflowX: "auto", borderRadius: 12, border: "1.5px solid #2d2640" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr style={{ background: "#1a1628" }}>
                {["Dia","Entradas","Saídas","Saldo do Dia"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "#8a7fa0", textTransform: "uppercase", textAlign: h === "Dia" ? "left" : "right", borderBottom: "1px solid #2d2640" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dias.map((d, i) => (
                <tr key={d.dia} style={{ background: i%2===0 ? "#0f0d1a" : "#13101e" }}>
                  <td style={{ padding: "9px 14px", fontSize: 13, color: "#c8b8e8", fontWeight: 600 }}>{String(d.dia).padStart(2,"0")}/{String(mesSel).padStart(2,"0")}/{anoSel}</td>
                  <td style={{ padding: "9px 14px", fontSize: 13, color: "#4ade80", fontWeight: 700, textAlign: "right" }}>{d.rec > 0 ? fmt(d.rec) : "—"}</td>
                  <td style={{ padding: "9px 14px", fontSize: 13, color: "#f87171", fontWeight: 700, textAlign: "right" }}>{d.desp > 0 ? fmt(d.desp) : "—"}</td>
                  <td style={{ padding: "9px 14px", fontSize: 13, color: d.saldo >= 0 ? "#4ade80" : "#f87171", fontWeight: 700, textAlign: "right" }}>{fmt(d.saldo)}</td>
                </tr>
              ))}
              <tr style={{ background: "#1a1628", borderTop: "2px solid #2d2640" }}>
                <td style={{ padding: "9px 14px", fontSize: 12, fontWeight: 800, color: "#c084fc", textTransform: "uppercase" }}>Total</td>
                <td style={{ padding: "9px 14px", fontSize: 13, fontWeight: 800, color: "#4ade80", textAlign: "right" }}>{fmt(dias.reduce((s,d)=>s+d.rec,0))}</td>
                <td style={{ padding: "9px 14px", fontSize: 13, fontWeight: 800, color: "#f87171", textAlign: "right" }}>{fmt(dias.reduce((s,d)=>s+d.desp,0))}</td>
                <td style={{ padding: "9px 14px", fontSize: 13, fontWeight: 800, color: "#c084fc", textAlign: "right" }}>{fmt(dias.reduce((s,d)=>s+d.saldo,0))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      }
    </RelatorioShell>
  );
}

function RelFCMensal({ receitas, despesas, anoSel: anoInit }) {
  const [anoSel, setAnoSel] = useState(anoInit || new Date().getFullYear());
  const mesesData = MESES.map((mes, mi) => {
    const prefix = `${anoSel}-${String(mi+1).padStart(2,"0")}`;
    const rec = receitas.filter(r => (r.recebimento||r.data||"").startsWith(prefix)).reduce((s,r)=>s+Number(r.valor||0),0);
    const desp = despesas.filter(d => (d.pagamento||d.data||"").startsWith(prefix)).reduce((s,d)=>s+Number(d.valor||0),0);
    return { mes, rec, desp, saldo: rec - desp };
  });
  return (
    <RelatorioShell icon="📆" title="Fluxo de Caixa Mensal">
      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, color: "#8a7fa0", fontWeight: 600, textTransform: "uppercase" }}>Ano</label>
          <select value={anoSel} onChange={e => setAnoSel(Number(e.target.value))} style={{ ...iStyle, width: 100, fontSize: 12 }}>
            {[2024,2025,2026,2027,2028].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>
      <div style={{ overflowX: "auto", borderRadius: 12, border: "1.5px solid #2d2640" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr style={{ background: "#1a1628" }}>
              {["Mês","Receitas","Despesas","Resultado"].map(h => (
                <th key={h} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "#8a7fa0", textTransform: "uppercase", textAlign: h === "Mês" ? "left" : "right", borderBottom: "1px solid #2d2640" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mesesData.map((d, i) => (
              <tr key={d.mes} style={{ background: i%2===0 ? "#0f0d1a" : "#13101e" }}>
                <td style={{ padding: "9px 14px", fontSize: 13, color: "#c8b8e8", fontWeight: 600 }}>{d.mes}</td>
                <td style={{ padding: "9px 14px", fontSize: 13, color: "#4ade80", fontWeight: 700, textAlign: "right" }}>{d.rec > 0 ? fmt(d.rec) : "—"}</td>
                <td style={{ padding: "9px 14px", fontSize: 13, color: "#f87171", fontWeight: 700, textAlign: "right" }}>{d.desp > 0 ? fmt(d.desp) : "—"}</td>
                <td style={{ padding: "9px 14px", fontSize: 13, color: d.saldo >= 0 ? "#4ade80" : "#f87171", fontWeight: 700, textAlign: "right" }}>{(d.rec > 0 || d.desp > 0) ? fmt(d.saldo) : "—"}</td>
              </tr>
            ))}
            <tr style={{ background: "#1a1628", borderTop: "2px solid #2d2640" }}>
              <td style={{ padding: "9px 14px", fontSize: 12, fontWeight: 800, color: "#c084fc", textTransform: "uppercase" }}>Total Anual</td>
              <td style={{ padding: "9px 14px", fontSize: 13, fontWeight: 800, color: "#4ade80", textAlign: "right" }}>{fmt(mesesData.reduce((s,d)=>s+d.rec,0))}</td>
              <td style={{ padding: "9px 14px", fontSize: 13, fontWeight: 800, color: "#f87171", textAlign: "right" }}>{fmt(mesesData.reduce((s,d)=>s+d.desp,0))}</td>
              <td style={{ padding: "9px 14px", fontSize: 13, fontWeight: 800, color: "#c084fc", textAlign: "right" }}>{fmt(mesesData.reduce((s,d)=>s+d.saldo,0))}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </RelatorioShell>
  );
}

function RelDRE({ receitas, despesas, catReceita, catDespesa }) {
  const [anoSel, setAnoSel] = useState(new Date().getFullYear());
  const [drillDown, setDrillDown] = useState(null); // { tipo: "r"|"d", cat, mes } or null

  const getCatTotal = (tipo, cat) => {
    const items = tipo === "r" ? receitas : despesas;
    const dateField = tipo === "r" ? "recebimento" : "pagamento";
    return MESES.map((_,mi) => {
      const prefix = `${anoSel}-${String(mi+1).padStart(2,"0")}`;
      return items.filter(x => x.plano === cat && (x[dateField]||x.data||"").startsWith(prefix)).reduce((s,x)=>s+Number(x.valor||0),0);
    });
  };
  const totalRec = MESES.map((_,mi) => {
    const prefix = `${anoSel}-${String(mi+1).padStart(2,"0")}`;
    return receitas.filter(r => (r.recebimento||r.data||"").startsWith(prefix)).reduce((s,r)=>s+Number(r.valor||0),0);
  });
  const totalDesp = MESES.map((_,mi) => {
    const prefix = `${anoSel}-${String(mi+1).padStart(2,"0")}`;
    return despesas.filter(d => (d.pagamento||d.data||"").startsWith(prefix)).reduce((s,d)=>s+Number(d.valor||0),0);
  });
  const resultado = totalRec.map((r,i) => r - totalDesp[i]);
  const cellS = { padding: "7px 10px", fontSize: 11, textAlign: "right", borderRight: "1px solid #1e1a2e", whiteSpace: "nowrap" };

  // Drill-down: items para o painel de detalhes
  const drillItems = drillDown ? (() => {
    const items = drillDown.tipo === "r" ? receitas : despesas;
    const dateField = drillDown.tipo === "r" ? "recebimento" : "pagamento";
    const filtered = drillDown.mes !== null
      ? items.filter(x => x.plano === drillDown.cat && (x[dateField]||x.data||"").startsWith(`${anoSel}-${String(drillDown.mes+1).padStart(2,"0")}`))
      : items.filter(x => x.plano === drillDown.cat && (x[dateField]||x.data||"").startsWith(`${anoSel}`));
    return filtered.sort((a,b)=>((b[dateField]||b.data||"").localeCompare(a[dateField]||a.data||"")));
  })() : [];

  const drillTotal = drillItems.reduce((s,x)=>s+Number(x.valor||0),0);
  const isRec = drillDown?.tipo === "r";
  const cor = isRec ? "#f59e0b" : "#f87171";

  const handleClick = (tipo, cat, mesIdx) => {
    if (drillDown?.tipo===tipo && drillDown?.cat===cat && drillDown?.mes===mesIdx) {
      setDrillDown(null); // fecha se clicar no mesmo
    } else {
      setDrillDown({ tipo, cat, mes: mesIdx });
    }
  };

  return (
    <RelatorioShell icon="📊" title="DRE — Demonstrativo de Resultado do Exercício">
      <div style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, color: "#8a7fa0", fontWeight: 600, textTransform: "uppercase" }}>Ano</label>
          <select value={anoSel} onChange={e => { setAnoSel(Number(e.target.value)); setDrillDown(null); }} style={{ ...iStyle, width: 100, fontSize: 12 }}>
            {[2024,2025,2026,2027,2028].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div style={{ fontSize: 10, color: "#4a3f60", marginTop: 16 }}>
          Clique em qualquer célula para ver os lançamentos detalhados
        </div>
      </div>

      <div style={{ overflowX: "auto", borderRadius: 12, border: "1.5px solid #2d2640" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 900 }}>
          <thead>
            <tr style={{ background: "#1a1628" }}>
              <th style={{ ...cellS, textAlign: "left", width: 180, color: "#8a7fa0", fontSize: 11, fontWeight: 700, textTransform: "uppercase", borderRight: "2px solid #2d2640", position: "sticky", left: 0, background: "#1a1628" }}>Conta</th>
              {MESES.map((m,mi) => (
                <th key={m} style={{ ...cellS, color: "#8a7fa0", fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                  background: drillDown?.mes===mi ? "#1e1040" : "transparent" }}>
                  {m.slice(0,3)}
                </th>
              ))}
              <th style={{ ...cellS, color: "#c084fc", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: "#100d20" }}>
              <td colSpan={14} style={{ ...cellS, textAlign: "left", fontWeight: 800, color: "#f59e0b", fontSize: 12, textTransform: "uppercase", borderRight: "2px solid #2d2640", position: "sticky", left: 0, background: "#100d20" }}>RECEITAS</td>
            </tr>
            {Object.keys(catReceita).map((cat, ci) => {
              const vals = getCatTotal("r", cat);
              const tot = vals.reduce((s,v)=>s+v,0);
              if (tot === 0) return null;
              const isSel = drillDown?.tipo==="r" && drillDown?.cat===cat;
              const bgBase = ci%2===0?"#0f0d1a":"#13101e";
              return <tr key={cat} style={{ background: isSel?"#1e1040":bgBase }}>
                <td onClick={() => handleClick("r", cat, null)}
                  style={{ ...cellS, textAlign: "left", color: "#c8b8e8", fontSize: 12, borderRight: "2px solid #2d2640", position: "sticky", left: 0, background: isSel?"#1e1040":bgBase, cursor:"pointer" }}
                  title="Clique para ver todos os lançamentos desta categoria">
                  {isSel ? "▶ " : ""}{cat}
                </td>
                {vals.map((v,mi) => (
                  <td key={mi} onClick={() => handleClick("r", cat, mi)}
                    style={{ ...cellS, color: v>0?"#f59e0b":"#3a3255",
                      background: (isSel && drillDown?.mes===mi) ? "#2d1254" : "transparent",
                      cursor: v>0 ? "pointer" : "default",
                      fontWeight: (isSel && drillDown?.mes===mi) ? 800 : 400 }}
                    title={v>0 ? `Ver lançamentos de ${MESES[mi]}` : ""}>
                    {v>0?fmt(v):"—"}
                  </td>
                ))}
                <td onClick={() => handleClick("r", cat, null)}
                  style={{ ...cellS, color: "#f59e0b", fontWeight: 700, cursor:"pointer" }}>
                  {fmt(tot)}
                </td>
              </tr>;
            })}
            <tr style={{ background: "#100d20", borderTop: "1px solid #3d2a00" }}>
              <td style={{ ...cellS, textAlign: "left", fontWeight: 700, color: "#f59e0b", fontSize: 12, borderRight: "2px solid #2d2640", position: "sticky", left: 0, background: "#100d20" }}>TOTAL RECEITAS</td>
              {totalRec.map((v,i) => <td key={i} style={{ ...cellS, color: "#f59e0b", fontWeight: 700 }}>{v>0?fmt(v):"—"}</td>)}
              <td style={{ ...cellS, color: "#f59e0b", fontWeight: 800 }}>{fmt(totalRec.reduce((s,v)=>s+v,0))}</td>
            </tr>
            <tr style={{ background: "#2e0d1a" }}>
              <td colSpan={14} style={{ ...cellS, textAlign: "left", fontWeight: 800, color: "#f87171", fontSize: 12, textTransform: "uppercase", borderRight: "2px solid #2d2640", position: "sticky", left: 0, background: "#2e0d1a" }}>DESPESAS</td>
            </tr>
            {Object.keys(catDespesa).map((cat, ci) => {
              const vals = getCatTotal("d", cat);
              const tot = vals.reduce((s,v)=>s+v,0);
              if (tot === 0) return null;
              const isSel = drillDown?.tipo==="d" && drillDown?.cat===cat;
              const bgBase = ci%2===0?"#0f0d1a":"#13101e";
              return <tr key={cat} style={{ background: isSel?"#200808":bgBase }}>
                <td onClick={() => handleClick("d", cat, null)}
                  style={{ ...cellS, textAlign: "left", color: "#c8b8e8", fontSize: 12, borderRight: "2px solid #2d2640", position: "sticky", left: 0, background: isSel?"#200808":bgBase, cursor:"pointer" }}
                  title="Clique para ver todos os lançamentos desta categoria">
                  {isSel ? "▶ " : ""}{cat}
                </td>
                {vals.map((v,mi) => (
                  <td key={mi} onClick={() => handleClick("d", cat, mi)}
                    style={{ ...cellS, color: v>0?"#f87171":"#3a3255",
                      background: (isSel && drillDown?.mes===mi) ? "#3d0f0f" : "transparent",
                      cursor: v>0 ? "pointer" : "default",
                      fontWeight: (isSel && drillDown?.mes===mi) ? 800 : 400 }}
                    title={v>0 ? `Ver lançamentos de ${MESES[mi]}` : ""}>
                    {v>0?fmt(v):"—"}
                  </td>
                ))}
                <td onClick={() => handleClick("d", cat, null)}
                  style={{ ...cellS, color: "#f87171", fontWeight: 700, cursor:"pointer" }}>
                  {fmt(tot)}
                </td>
              </tr>;
            })}
            <tr style={{ background: "#1a0707", borderTop: "1px solid #7f1d1d" }}>
              <td style={{ ...cellS, textAlign: "left", fontWeight: 700, color: "#f87171", fontSize: 12, borderRight: "2px solid #2d2640", position: "sticky", left: 0, background: "#1a0707" }}>TOTAL DESPESAS</td>
              {totalDesp.map((v,i) => <td key={i} style={{ ...cellS, color: "#f87171", fontWeight: 700 }}>{v>0?fmt(v):"—"}</td>)}
              <td style={{ ...cellS, color: "#f87171", fontWeight: 800 }}>{fmt(totalDesp.reduce((s,v)=>s+v,0))}</td>
            </tr>
            <tr style={{ background: "#1a1628", borderTop: "2px solid #c084fc" }}>
              <td style={{ ...cellS, textAlign: "left", fontWeight: 800, color: "#c084fc", fontSize: 13, textTransform: "uppercase", borderRight: "2px solid #2d2640", position: "sticky", left: 0, background: "#1a1628" }}>RESULTADO</td>
              {resultado.map((v,i) => <td key={i} style={{ ...cellS, color: v>=0?"#c084fc":"#f87171", fontWeight: 800 }}>{(totalRec[i]>0||totalDesp[i]>0)?fmt(v):"—"}</td>)}
              <td style={{ ...cellS, color: resultado.reduce((s,v)=>s+v,0)>=0?"#c084fc":"#f87171", fontWeight: 800 }}>{fmt(resultado.reduce((s,v)=>s+v,0))}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Painel de Drill-Down */}
      {drillDown && (
        <div style={{ marginTop:12, background:"#0d0b15", border:`1.5px solid ${cor}44`, borderRadius:12, overflow:"hidden" }}>
          {/* Header */}
          <div style={{ padding:"12px 16px", background:`linear-gradient(90deg,${cor}12,transparent)`, borderBottom:`1px solid ${cor}22`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:12, fontWeight:800, color:cor }}>
                {isRec ? "↑ Receitas" : "↓ Despesas"} — {drillDown.cat}
                {drillDown.mes !== null ? ` · ${MESES[drillDown.mes]} ${anoSel}` : ` · Ano ${anoSel} (todos os meses)`}
              </div>
              <div style={{ fontSize:10, color:"#6b5f80", marginTop:2 }}>
                {drillItems.length} lançamento{drillItems.length!==1?"s":""} · Total: <strong style={{color:cor}}>{fmt(drillTotal)}</strong>
              </div>
            </div>
            <button onClick={() => setDrillDown(null)}
              style={{ background:"none", border:`1px solid ${cor}44`, borderRadius:6, color:"#8a7fa0", cursor:"pointer", padding:"4px 10px", fontSize:11 }}>
              ✕ Fechar
            </button>
          </div>

          {/* Tabela de lançamentos */}
          <div style={{ overflowX:"auto", maxHeight:360, overflowY:"auto" }}>
            <table style={{ borderCollapse:"collapse", width:"100%", minWidth:600 }}>
              <thead>
                <tr style={{ background:"#100e1b", position:"sticky", top:0, zIndex:1 }}>
                  {["Data","Descrição","Subcategoria","Banco","Documento","Valor"].map((h,i)=>(
                    <th key={h} style={{ padding:"7px 12px", fontSize:9, fontWeight:800, color:"#4a3f60",
                      textTransform:"uppercase", letterSpacing:"0.07em",
                      textAlign:i===5?"right":"left", borderBottom:"1px solid #1a1628",
                      whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {drillItems.length === 0
                  ? <tr><td colSpan={6} style={{ padding:24, textAlign:"center", color:"#4a3f60", fontSize:12 }}>Nenhum lançamento neste período.</td></tr>
                  : drillItems.map((x,i) => (
                    <tr key={x.id||i} style={{ background:i%2===0?"#0d0b15":"#100e1b", borderBottom:"1px solid #13101e" }}>
                      <td style={{ padding:"7px 12px", fontSize:11, color:"#8a7fa0", whiteSpace:"nowrap" }}>{fmtDate(x[isRec?"recebimento":"pagamento"]||x.data)}</td>
                      <td style={{ padding:"7px 12px", fontSize:11, color:"#c8b8e8", maxWidth:220, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={x.descricao}>{x.descricao||"—"}</td>
                      <td style={{ padding:"7px 12px", fontSize:11, color:"#6b5f80", whiteSpace:"nowrap" }}>{x.conta||"—"}</td>
                      <td style={{ padding:"7px 12px", fontSize:11, color:"#6b5f80", whiteSpace:"nowrap" }}>{x.banco||"—"}</td>
                      <td style={{ padding:"7px 12px", fontSize:10, color:"#4a3f60", whiteSpace:"nowrap" }}>{x.documento||"—"}</td>
                      <td style={{ padding:"7px 12px", fontSize:12, fontWeight:800, color:cor, textAlign:"right", whiteSpace:"nowrap" }}>{fmt(x.valor||0)}</td>
                    </tr>
                  ))
                }
              </tbody>
              {drillItems.length > 0 && (
                <tfoot>
                  <tr style={{ background:"#1a1628", borderTop:`1.5px solid ${cor}44` }}>
                    <td colSpan={5} style={{ padding:"8px 12px", fontSize:11, fontWeight:800, color:"#6b5f80" }}>Total</td>
                    <td style={{ padding:"8px 12px", fontSize:13, fontWeight:900, color:cor, textAlign:"right" }}>{fmt(drillTotal)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </RelatorioShell>
  );
}

function RelDashboardGerencial({ receitas, despesas, catReceita, catDespesa, saldos }) {
  const [gDe,  setGDe]  = useState("");
  const [gAte, setGAte] = useState("");
  const [gBanco, setGBanco] = useState("");

  const todosB = [...new Set([...receitas.map(r=>r.banco), ...despesas.map(d=>d.banco)].filter(Boolean))].sort();

  const recF = receitas.filter(r => {
    const d = r.recebimento||r.data||"";
    if (gDe && d < gDe) return false;
    if (gAte && d > gAte) return false;
    if (gBanco && r.banco !== gBanco) return false;
    return true;
  });
  const despF = despesas.filter(d => {
    const dt = d.pagamento||d.data||"";
    if (gDe && dt < gDe) return false;
    if (gAte && dt > gAte) return false;
    if (gBanco && d.banco !== gBanco) return false;
    return true;
  });

  const totalR = recF.reduce((s,r)=>s+Number(r.valor||0),0);
  const totalD = despF.reduce((s,d)=>s+Number(d.valor||0),0);
  const saldoInicial = Object.values(saldos.contas).reduce((s,v)=>s+Number(v||0),0);
  // Saldo em conta: acumulado desde a data do saldo inicial até o fim do filtro
  // Inclui Repasse de Plataforma (dinheiro real), exclui apenas extrato bruto de plataforma
  const DOCS_PLAT_G = ["Extrato financeiro iFood","Extrato financeiro 99Food"];
  const dataRefG = saldos.data || "";
  const recAcum  = receitas.filter(r=>{
    if (DOCS_PLAT_G.includes(r.documento)) return false;
    const d = r.recebimento||r.data||"";
    if (dataRefG && d < dataRefG) return false;
    if (gAte && d > gAte) return false;
    return true;
  }).reduce((s,r)=>s+Number(r.valor||0),0);
  const despAcum = despesas.filter(d=>{
    if (DOCS_PLAT_G.includes(d.documento)) return false;
    const dt = d.pagamento||d.data||"";
    if (dataRefG && dt < dataRefG) return false;
    if (gAte && dt > gAte) return false;
    return true;
  }).reduce((s,d)=>s+Number(d.valor||0),0);
  const totalSaldo = saldoInicial + recAcum - despAcum;
  const topRec  = Object.keys(catReceita).map(cat => ({ cat, v: recF.filter(r=>r.plano===cat).reduce((s,r)=>s+Number(r.valor||0),0) })).filter(x=>x.v>0).sort((a,b)=>b.v-a.v);
  const topDesp = Object.keys(catDespesa).map(cat => ({ cat, v: despF.filter(d=>d.plano===cat).reduce((s,d)=>s+Number(d.valor||0),0) })).filter(x=>x.v>0).sort((a,b)=>b.v-a.v);
  const maxR = topRec[0]?.v || 1;
  const maxD = topDesp[0]?.v || 1;
  const temFiltro = gDe || gAte || gBanco;
  const selS = { ...iStyle, fontSize:11, padding:"5px 8px", cursor:"pointer" };
  return (
    <RelatorioShell icon="📈" title="Dashboard Gerencial">
      {/* Filtros */}
      <div style={{ background:"#13101e", border:`1.5px solid ${temFiltro?"#7c3aed":"#2d2640"}`, borderRadius:12, padding:"10px 14px", display:"flex", gap:8, flexWrap:"wrap", alignItems:"flex-end", marginBottom:4 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
          <label style={{ fontSize:9, color:"#6b5f80", fontWeight:700, textTransform:"uppercase" }}>📅 De</label>
          <input type="date" value={gDe} onChange={e=>setGDe(e.target.value)} style={{ ...selS, borderColor: gDe?"#7c3aed":"" }} />
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
          <label style={{ fontSize:9, color:"#6b5f80", fontWeight:700, textTransform:"uppercase" }}>📅 Até</label>
          <input type="date" value={gAte} onChange={e=>setGAte(e.target.value)} style={{ ...selS, borderColor: gAte?"#7c3aed":"" }} />
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
          <label style={{ fontSize:9, color:"#6b5f80", fontWeight:700, textTransform:"uppercase" }}>🏦 Banco</label>
          <select value={gBanco} onChange={e=>setGBanco(e.target.value)} style={{ ...selS, borderColor: gBanco?"#7c3aed":"" }}>
            <option value="">Todos</option>
            {todosB.map(b=><option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        {temFiltro && (
          <button onClick={()=>{setGDe("");setGAte("");setGBanco("");}}
            style={{ fontSize:11, background:"#2d1254", border:"1px solid #7c3aed", borderRadius:6, color:"#e9d5ff", cursor:"pointer", padding:"5px 12px" }}>
            ✕ Limpar
          </button>
        )}
        {temFiltro && (
          <span style={{ fontSize:11, color:"#8a7fa0" }}>
            <strong style={{color:"#f0e8ff"}}>{recF.length}</strong> rec · <strong style={{color:"#f0e8ff"}}>{despF.length}</strong> desp
          </span>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {[["💰 Saldo em Conta", totalSaldo, "#fbbf24"],["📈 Total Receitas", totalR, "#4ade80"],["📉 Total Despesas", totalD, "#f87171"],["💵 Resultado", totalR-totalD, totalR-totalD>=0?"#4ade80":"#f87171"],["📊 Margem %", totalR>0?((totalR-totalD)/totalR*100):0, "#c084fc"],["🧾 Lançamentos", receitas.length + despesas.length, "#60a5fa"]].map(([l,v,c])=>(
          <div key={l} style={{ background: "#13101e", border: "1.5px solid #2d2640", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: "#8a7fa0", marginBottom: 4 }}>{l}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: c }}>{typeof v === "number" && l.includes("%") ? v.toFixed(1)+"%" : typeof v === "number" && l.includes("Lançamentos") ? v : fmt(v)}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "#13101e", border: "1.5px solid #2d2640", borderRadius: 12, padding: 16 }}>
          <h4 style={{ margin: "0 0 12px", color: "#4ade80", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Top Receitas</h4>
          {topRec.slice(0,6).map(x => (
            <div key={x.cat} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: "#c8b8e8" }}>{x.cat}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#4ade80" }}>{fmt(x.v)}</span>
              </div>
              <div style={{ background: "#1a1628", borderRadius: 99, height: 5 }}>
                <div style={{ width: (x.v/maxR*100)+"%", height: "100%", background: "#4ade80", borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: "#13101e", border: "1.5px solid #2d2640", borderRadius: 12, padding: 16 }}>
          <h4 style={{ margin: "0 0 12px", color: "#f87171", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Top Despesas</h4>
          {topDesp.slice(0,6).map(x => (
            <div key={x.cat} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: "#c8b8e8" }}>{x.cat}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#f87171" }}>{fmt(x.v)}</span>
              </div>
              <div style={{ background: "#1a1628", borderRadius: 99, height: 5 }}>
                <div style={{ width: (x.v/maxD*100)+"%", height: "100%", background: "#f87171", borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </RelatorioShell>
  );
}

function RelListagem({ tipo, items, catMap }) {
  const [mesSel, setMesSel] = useState(0);
  const [anoSel, setAnoSel] = useState(new Date().getFullYear());
  const [catSel, setCatSel] = useState("");
  const isRec = tipo === "receitas";
  const dateField = isRec ? "recebimento" : "pagamento";
  const filtered = items.filter(x => {
    const d = x[dateField] || x.data || "";
    const prefix = mesSel > 0 ? `${anoSel}-${String(mesSel).padStart(2,"0")}` : `${anoSel}`;
    if (!d.startsWith(prefix)) return false;
    if (catSel && x.plano !== catSel) return false;
    return true;
  });
  const total = filtered.reduce((s,x)=>s+Number(x.valor||0),0);
  return (
    <RelatorioShell icon={isRec?"💹":"📉"} title={isRec?"Relatório de Receitas":"Relatório de Despesas"}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, color: "#8a7fa0", fontWeight: 600, textTransform: "uppercase" }}>Mês</label>
          <select value={mesSel} onChange={e => setMesSel(Number(e.target.value))} style={{ ...iStyle, width: 130, fontSize: 12 }}>
            <option value={0}>Todos</option>
            {MESES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, color: "#8a7fa0", fontWeight: 600, textTransform: "uppercase" }}>Ano</label>
          <select value={anoSel} onChange={e => setAnoSel(Number(e.target.value))} style={{ ...iStyle, width: 90, fontSize: 12 }}>
            {[2024,2025,2026,2027,2028].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 150 }}>
          <label style={{ fontSize: 11, color: "#8a7fa0", fontWeight: 600, textTransform: "uppercase" }}>Categoria</label>
          <select value={catSel} onChange={e => setCatSel(e.target.value)} style={{ ...iStyle, fontSize: 12 }}>
            <option value="">Todas</option>
            {Object.keys(catMap).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div style={{ background: isRec?"#0a1f10":"#1a0707", border: `1px solid ${isRec?"#166534":"#7f1d1d"}`, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: "#8a7fa0" }}>{filtered.length} lançamentos encontrados</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: isRec?"#4ade80":"#f87171" }}>{fmt(total)}</span>
      </div>
      {filtered.length === 0 ? <p style={{ color: "#6b5f80", textAlign: "center", padding: 24 }}>Nenhum lançamento encontrado.</p> :
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map(x => (
            <div key={x.id} style={{ background: "#13101e", border: `1.5px solid ${isRec?"#1a3a20":"#3a1a1a"}`, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, color: "#c8b8e8", fontWeight: 600 }}>{x.descricao || x.conta || x.plano}</div>
                <div style={{ fontSize: 11, color: "#6b5f80", marginTop: 2 }}>{fmtDate(x[dateField]||x.data)} · {x.plano} · {x.banco}</div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: isRec?"#4ade80":"#f87171", whiteSpace: "nowrap", marginLeft: 12 }}>{fmt(x.valor)}</span>
            </div>
          ))}
        </div>
      }
    </RelatorioShell>
  );
}

function RelDashboardMetas({ metas, receitas, despesas, catReceita, catDespesa }) {
  const [anoSel, setAnoSel] = useState(metas.ano || new Date().getFullYear());
  const tipos = [
    { key: "receitas", label: "Receitas", catMap: catReceita, items: receitas, dateField: "recebimento", color: "#4ade80", bg: "#071a0d", border: "#166534" },
    { key: "despesas", label: "Despesas", catMap: catDespesa, items: despesas, dateField: "pagamento", color: "#f87171", bg: "#1a0707", border: "#7f1d1d" },
  ];
  return (
    <RelatorioShell icon="🏆" title="Dashboard de Metas">
      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, color: "#8a7fa0", fontWeight: 600, textTransform: "uppercase" }}>Ano</label>
          <select value={anoSel} onChange={e => setAnoSel(Number(e.target.value))} style={{ ...iStyle, width: 100, fontSize: 12 }}>
            {[2024,2025,2026,2027,2028].map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>
      {tipos.map(({ key, label, catMap, items, dateField, color, bg, border }) => {
        const orcadoAnual = Object.keys(catMap).reduce((s, plano) => {
          return s + MESES.reduce((ms, _, mi) => {
            const k = `${anoSel}-${String(mi+1).padStart(2,"0")}-${plano}`;
            return ms + Number(metas[key]?.[k] || 0);
          }, 0);
        }, 0);
        const realizadoAnual = items.filter(x => (x[dateField]||x.data||"").startsWith(String(anoSel))).reduce((s,x)=>s+Number(x.valor||0),0);
        const pctAnual = orcadoAnual > 0 ? Math.min(100, realizadoAnual / orcadoAnual * 100) : 0;
        return (
          <div key={key} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color }}>{label} {anoSel}</div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: "#8a7fa0" }}>Realizado / Orçado</div>
                <div style={{ fontSize: 16, fontWeight: 800, color }}>{fmt(realizadoAnual)} / {orcadoAnual > 0 ? fmt(orcadoAnual) : "sem meta"}</div>
              </div>
            </div>
            {orcadoAnual > 0 && (
              <div style={{ background: "#1a1628", borderRadius: 99, height: 10, marginBottom: 14, overflow: "hidden" }}>
                <div style={{ width: pctAnual+"%", height: "100%", background: color, borderRadius: 99, transition: "width 0.4s" }} />
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {MESES.map((mes, mi) => {
                const prefix = `${anoSel}-${String(mi+1).padStart(2,"0")}`;
                const orc = Object.keys(catMap).reduce((s, plano) => {
                  const k = `${prefix}-${plano}`;
                  return s + Number(metas[key]?.[k] || 0);
                }, 0);
                const real = items.filter(x => (x[dateField]||x.data||"").startsWith(prefix)).reduce((s,x)=>s+Number(x.valor||0),0);
                const pct = orc > 0 ? Math.min(100, real/orc*100) : null;
                const isGood = key === "receitas" ? real >= orc && orc > 0 : real <= orc && orc > 0;
                return (
                  <div key={mes} style={{ background: "#13101e", borderRadius: 8, padding: "10px 10px 8px" }}>
                    <div style={{ fontSize: 10, color: "#8a7fa0", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>{mes.slice(0,3)}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: pct !== null ? (isGood ? "#4ade80" : "#f87171") : color }}>{fmt(real)}</div>
                    {orc > 0 && <div style={{ fontSize: 10, color: "#6b5f80" }}>/ {fmt(orc)}</div>}
                    {pct !== null && (
                      <div style={{ background: "#1a1628", borderRadius: 99, height: 4, marginTop: 6, overflow: "hidden" }}>
                        <div style={{ width: pct+"%", height: "100%", background: isGood?"#4ade80":"#f87171", borderRadius: 99 }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </RelatorioShell>
  );
}

function RelatoriosTab({ relatorio, receitas, despesas, transferencias, bancos, catReceita, catDespesa, metas, saldos }) {
  if (!relatorio) return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingBottom: 32 }}>
      {[
        { id: "rel-conciliacao", icon: "⚖", label: "Conciliação Bancária", desc: "Entradas e saídas por conta bancária" },
        { id: "rel-fc-diario", icon: "📅", label: "Fluxo de Caixa Diário", desc: "Movimentação dia a dia" },
        { id: "rel-fc-mensal", icon: "📆", label: "Fluxo de Caixa Mensal", desc: "Resumo mensal do ano" },
        { id: "rel-dre", icon: "📊", label: "DRE", desc: "Resultado por categoria em 12 meses" },
        { id: "rel-dashboard", icon: "📈", label: "Dashboard Gerencial", desc: "Visão geral com gráficos" },
        { id: "rel-despesas", icon: "📉", label: "Relatório de Despesas", desc: "Detalhamento de gastos" },
        { id: "rel-receitas", icon: "💹", label: "Relatório de Receitas", desc: "Detalhamento de entradas" },
        { id: "rel-metas", icon: "🏆", label: "Dashboard de Metas", desc: "Progresso das metas mensais" },
      ].map(item => (
        <div key={item.id} style={{ background: "#13101e", border: "1.5px solid #2d2640", borderRadius: 12, padding: "20px 18px", cursor: "pointer", transition: "border-color 0.2s" }}
          onClick={() => {}}
          onMouseOver={e => e.currentTarget.style.borderColor = "#c084fc"}
          onMouseOut={e => e.currentTarget.style.borderColor = "#2d2640"}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#f0e8ff", marginBottom: 4 }}>{item.label}</div>
          <div style={{ fontSize: 12, color: "#6b5f80" }}>{item.desc}</div>
          <div style={{ marginTop: 12, fontSize: 11, color: "#c084fc" }}>← Clique no menu lateral para abrir</div>
        </div>
      ))}
    </div>
  );
  if (relatorio === "rel-conciliacao") return <RelConciliacao receitas={receitas} despesas={despesas} transferencias={transferencias} bancos={bancos} />;
  if (relatorio === "rel-fc-diario") return <RelFCDiario receitas={receitas} despesas={despesas} transferencias={transferencias} />;
  if (relatorio === "rel-fc-mensal") return <RelFCMensal receitas={receitas} despesas={despesas} />;
  if (relatorio === "rel-dre") return <RelDRE receitas={receitas} despesas={despesas} catReceita={catReceita} catDespesa={catDespesa} />;
  if (relatorio === "rel-dashboard") return <RelDashboardGerencial receitas={receitas} despesas={despesas} catReceita={catReceita} catDespesa={catDespesa} saldos={saldos} />;
  if (relatorio === "rel-despesas") return <RelListagem tipo="despesas" items={despesas} catMap={catDespesa} />;
  if (relatorio === "rel-receitas") return <RelListagem tipo="receitas" items={receitas} catMap={catReceita} />;
  if (relatorio === "rel-metas") return <RelDashboardMetas metas={metas} receitas={receitas} despesas={despesas} catReceita={catReceita} catDespesa={catDespesa} />;
  return null;
}


// ─── RECEITAS TAB ─────────────────────────────────────────────────────────────
// ─── HISTÓRICO DE IMPORTAÇÕES ─────────────────────────────────────────────────
// ─── MESES IMPORTADOS BADGE ───────────────────────────────────────────────────
function MesesImportados({ receitas, despesas, filtroRec, filtroDesp, setReceitas, setDespesas, showToast }) {
  const MESES_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const [confirmando, setConfirmando] = useState(null);
  const [previewMes,  setPreviewMes]  = useState(null);

  const meses = useMemo(() => {
    const all = [
      ...(filtroRec ? receitas.filter(filtroRec) : []),
      ...(filtroDesp ? despesas.filter(filtroDesp) : []),
    ].map(x => (x.data || "").slice(0, 7)).filter(m => /^\d{4}-\d{2}$/.test(m));
    return [...new Set(all)].sort().reverse();
  }, [receitas, despesas]);

  const fmtMes = (m) => {
    const [y, mo] = m.split("-");
    return `${MESES_PT[parseInt(mo) - 1]}/${y}`;
  };

  const SB_URL = "https://wmlecjrkqwoejuryeayz.supabase.co/rest/v1";
  const SB_KEY_V = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbGVjanJrcXdvZWp1cnllYXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDgyMDYsImV4cCI6MjA5MTMyNDIwNn0.SAYFGBZFjvLn9jIEs8J5mR93ZY7HlYQbT43YTn8JKnI";
  const SB_H = { "Content-Type":"application/json", "apikey":SB_KEY_V, "Authorization":"Bearer "+SB_KEY_V };

  const excluirMes = async (mes) => {
    const novasRec  = receitas.filter(r => !(filtroRec  && filtroRec(r)  && (r.data||"").startsWith(mes)));
    const novasDesp = despesas.filter(d => !(filtroDesp && filtroDesp(d) && (d.data||"").startsWith(mes)));
    const qtdR = receitas.length - novasRec.length;
    const qtdD = despesas.length - novasDesp.length;
    setReceitas(novasRec); setDespesas(novasDesp); setConfirmando(null);
    const idsR = receitas.filter(r => !novasRec.find(x => x.id === r.id)).map(r => r.id);
    const idsD = despesas.filter(d => !novasDesp.find(x => x.id === d.id)).map(d => d.id);
    try {
      for (const id of idsR) await fetch(`${SB_URL}/receitas?id=eq.${id}`,  { method:"DELETE", headers:SB_H });
      for (const id of idsD) await fetch(`${SB_URL}/despesas?id=eq.${id}`, { method:"DELETE", headers:SB_H });
    } catch(e) { console.error("Erro exclusão:", e); }
    showToast(`🗑 ${fmtMes(mes)} removido: ${qtdR} rec, ${qtdD} desp`, "del");
  };

  const abrirPreview = (mes) => {
    const recs  = receitas.filter(r => filtroRec  && filtroRec(r)  && (r.data||"").startsWith(mes)).sort((a,b)=>(b.data||"").localeCompare(a.data||""));
    const desps = despesas.filter(d => filtroDesp && filtroDesp(d) && (d.data||"").startsWith(mes)).sort((a,b)=>(b.data||"").localeCompare(a.data||""));
    setPreviewMes({ mes, recs, desps });
  };

  const totalRec  = previewMes ? previewMes.recs.reduce((s,r)=>s+Number(r.valor||0),0)  : 0;
  const totalDesp = previewMes ? previewMes.desps.reduce((s,d)=>s+Number(d.valor||0),0) : 0;

  return (
    <>
      <div style={{ background:"#0d0b15", border:"1.5px solid #2d2640", borderRadius:10, padding:"12px 14px" }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#6b5f80", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>📅 Meses importados</div>
        {meses.length === 0
          ? <span style={{ fontSize:11, color:"#4a3f60", fontStyle:"italic" }}>Nenhum dado importado ainda</span>
          : <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {meses.map(m => (
                confirmando === m
                  ? <div key={m} style={{ display:"flex", alignItems:"center", gap:4, background:"#2d0a0a", border:"1px solid #f87171", borderRadius:99, padding:"3px 8px" }}>
                      <span style={{ fontSize:11, color:"#fca5a5" }}>Apagar {fmtMes(m)}?</span>
                      <button onClick={() => excluirMes(m)} style={{ fontSize:10, fontWeight:800, background:"#dc2626", color:"#fff", border:"none", borderRadius:99, padding:"1px 7px", cursor:"pointer" }}>Sim</button>
                      <button onClick={() => setConfirmando(null)} style={{ fontSize:10, background:"none", color:"#8a7fa0", border:"none", cursor:"pointer" }}>✕</button>
                    </div>
                  : <div key={m} style={{ display:"flex", alignItems:"center", gap:0, background:"#1e1a4e", border:"1px solid #3730a3", borderRadius:99, overflow:"hidden" }}>
                      <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", color:"#818cf8" }}>{fmtMes(m)}</span>
                      <button onClick={() => abrirPreview(m)} title={"Ver lançamentos de " + fmtMes(m)}
                        style={{ fontSize:11, background:"#1a1850", color:"#4ade80", border:"none", borderLeft:"1px solid #3730a3", padding:"3px 7px", cursor:"pointer" }}>
                        👁
                      </button>
                      <button onClick={() => setConfirmando(m)} title={"Excluir " + fmtMes(m)}
                        style={{ fontSize:10, background:"#2d2060", color:"#f87171", border:"none", borderLeft:"1px solid #3730a3", padding:"3px 7px", cursor:"pointer" }}>
                        🗑
                      </button>
                    </div>
              ))}
            </div>
        }
      </div>

      {previewMes && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
          onClick={() => setPreviewMes(null)}>
          <div style={{ background:"#13101e", borderRadius:16, border:"1.5px solid #2d2640", width:"100%", maxWidth:720, maxHeight:"88vh", overflow:"hidden", display:"flex", flexDirection:"column" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding:"14px 18px", borderBottom:"1px solid #2d2640", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#1a1628", flexShrink:0 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:"#c084fc" }}>{"👁 Lançamentos importados — " + fmtMes(previewMes.mes)}</div>
                <div style={{ fontSize:11, color:"#6b5f80", marginTop:2 }}>{previewMes.recs.length} receitas · {previewMes.desps.length} despesas/taxas</div>
              </div>
              <button onClick={() => setPreviewMes(null)} style={{ background:"none", border:"none", color:"#8a7fa0", cursor:"pointer", fontSize:20 }}>✕</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, padding:"12px 16px", flexShrink:0, borderBottom:"1px solid #1a1628" }}>
              {[
                { l:"Receitas", v:previewMes.recs.length,  c:"#4ade80" },
                { l:"Total ↑",  v:fmt(totalRec),           c:"#f59e0b" },
                { l:"Despesas", v:previewMes.desps.length,  c:"#f87171" },
                { l:"Total ↓",  v:fmt(totalDesp),          c:"#f87171" },
              ].map(k=>(
                <div key={k.l} style={{ background:"#0d0b15", border:"1px solid " + k.c + "33", borderRadius:8, padding:"8px 10px" }}>
                  <div style={{ fontSize:9, color:"#6b5f80", textTransform:"uppercase", marginBottom:2 }}>{k.l}</div>
                  <div style={{ fontSize:15, fontWeight:800, color:k.c }}>{k.v}</div>
                </div>
              ))}
            </div>
            <div style={{ overflowY:"auto", padding:"12px 16px", display:"flex", flexDirection:"column", gap:12 }}>
              {previewMes.recs.length > 0 && (
                <div>
                  <div style={{ fontSize:11, fontWeight:800, color:"#4ade80", textTransform:"uppercase", marginBottom:6, display:"flex", justifyContent:"space-between" }}>
                    <span>{"↑ Receitas (" + previewMes.recs.length + ")"}</span><span style={{ color:"#f59e0b" }}>{fmt(totalRec)}</span>
                  </div>
                  <div style={{ background:"#0d0b15", borderRadius:8, overflow:"hidden" }}>
                    {previewMes.recs.map((r,i)=>(
                      <div key={r.id} style={{ padding:"7px 12px", borderBottom:"1px solid #13101e", display:"flex", justifyContent:"space-between", alignItems:"center", background:i%2===0?"#0d0b15":"#100e1b" }}>
                        <div style={{ minWidth:0, flex:1 }}>
                          <div style={{ fontSize:11, color:"#c8b8e8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.descricao||r.conta||"—"}</div>
                          <div style={{ fontSize:10, color:"#4a3f60" }}>{fmtDate(r.data) + " · " + (r.banco||"—")}</div>
                        </div>
                        <div style={{ fontSize:12, fontWeight:800, color:"#4ade80", flexShrink:0, marginLeft:12 }}>{fmt(r.valor)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {previewMes.desps.length > 0 && (
                <div>
                  <div style={{ fontSize:11, fontWeight:800, color:"#f87171", textTransform:"uppercase", marginBottom:6, display:"flex", justifyContent:"space-between" }}>
                    <span>{"↓ Despesas/Taxas (" + previewMes.desps.length + ")"}</span><span>{fmt(totalDesp)}</span>
                  </div>
                  <div style={{ background:"#0d0b15", borderRadius:8, overflow:"hidden" }}>
                    {previewMes.desps.map((d,i)=>(
                      <div key={d.id} style={{ padding:"7px 12px", borderBottom:"1px solid #13101e", display:"flex", justifyContent:"space-between", alignItems:"center", background:i%2===0?"#0d0b15":"#100e1b" }}>
                        <div style={{ minWidth:0, flex:1 }}>
                          <div style={{ fontSize:11, color:"#c8b8e8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.descricao||d.conta||"—"}</div>
                          <div style={{ fontSize:10, color:"#4a3f60" }}>{fmtDate(d.data) + " · " + (d.conta||d.banco||"—")}</div>
                        </div>
                        <div style={{ fontSize:12, fontWeight:800, color:"#f87171", flexShrink:0, marginLeft:12 }}>{"−" + fmt(d.valor)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {previewMes.recs.length === 0 && previewMes.desps.length === 0 && (
                <div style={{ textAlign:"center", color:"#4a3f60", padding:32, fontSize:12 }}>Nenhum lançamento encontrado.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}


function HistoricoImportacoesTab({ historico, onLimpar, receitas, despesas }) {
  const [previewModal, setPreviewModal] = useState(null); // { h, items }
  const TIPO_LABEL = {
    "ifood-tjk":    { label: "iFood Tijuca",    icon: "🍕", cor: "#f97316" },
    "ifood-hg":     { label: "iFood HG",         icon: "🍕", cor: "#f97316" },
    "99food-hg":    { label: "99Food HG",         icon: "🛺", cor: "#facc15" },
    "99food-tjk":   { label: "99Food Tijuca",     icon: "🛺", cor: "#facc15" },
    "extrato-mp":   { label: "Extrato MP",         icon: "🏦", cor: "#c084fc" },
    "extrato-c6":   { label: "Extrato C6",         icon: "🏦", cor: "#c084fc" },
    "extrato-san":  { label: "Extrato Santander",  icon: "🏦", cor: "#c084fc" },
    "extrato-gen":  { label: "Extrato Bancário",   icon: "📄", cor: "#94a3b8" },
  };

  const meses = [...new Set(historico.map(h => h.mes_referencia).filter(Boolean))].sort().reverse();

  const fmtMes = (m) => {
    if (!m) return "—";
    const [y, mo] = m.split("-");
    const nomes = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
    return `${nomes[parseInt(mo)-1]}/${y}`;
  };

  const fmtDt = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" });
  };

  if (historico.length === 0) return (
    <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, padding:40, textAlign:"center" }}>
      <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
      <div style={{ color:"#6b5f80", fontSize:14 }}>Nenhuma importação registrada ainda.</div>
      <div style={{ color:"#4a3f60", fontSize:12, marginTop:6 }}>As próximas importações aparecerão aqui.</div>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, padding:"14px 16px" }}>
        <div style={{ fontSize:15, fontWeight:800, color:"#c084fc", marginBottom:4 }}>📋 Histórico de Importações</div>
        <div style={{ fontSize:12, color:"#8a7fa0" }}>{historico.length} importação{historico.length !== 1 ? "ões" : ""} registrada{historico.length !== 1 ? "s" : ""}.</div>
      </div>

      {/* Preview modal - inside JSX */}
      {previewModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
          onClick={() => setPreviewModal(null)}>
          <div style={{ background:"#13101e", borderRadius:16, border:"1.5px solid #2d2640", width:"100%", maxWidth:700, maxHeight:"85vh", overflow:"hidden", display:"flex", flexDirection:"column" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding:"14px 18px", borderBottom:"1px solid #2d2640", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#1a1628" }}>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:"#c084fc" }}>👁 Dados Importados</div>
                <div style={{ fontSize:11, color:"#6b5f80", marginTop:2 }}>
                  {previewModal.h.nome_arquivo || previewModal.h.tipo} · {fmtDt(previewModal.h.importado_em)}
                </div>
              </div>
              <button onClick={() => setPreviewModal(null)}
                style={{ background:"none", border:"none", color:"#8a7fa0", cursor:"pointer", fontSize:20 }}>✕</button>
            </div>
            <div style={{ overflowY:"auto", padding:16, display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8 }}>
                {[
                  { l:"Receitas",   v:previewModal.h.qtd_receitas,           c:"#4ade80" },
                  { l:"Despesas",   v:previewModal.h.qtd_despesas,           c:"#f87171" },
                  { l:"Total Rec",  v:fmt(previewModal.h.total_receitas||0),  c:"#f59e0b" },
                  { l:"Total Desp", v:fmt(previewModal.h.total_despesas||0),  c:"#f87171" },
                ].map(k=>(
                  <div key={k.l} style={{ background:"#0d0b15", border:`1px solid ${k.c}33`, borderRadius:8, padding:"8px 10px" }}>
                    <div style={{ fontSize:9, color:"#6b5f80", textTransform:"uppercase" }}>{k.l}</div>
                    <div style={{ fontSize:15, fontWeight:800, color:k.c }}>{k.v}</div>
                  </div>
                ))}
              </div>
              {previewModal.receitasMatch.length > 0 && (
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:"#4ade80", textTransform:"uppercase", marginBottom:6 }}>↑ Receitas ({previewModal.receitasMatch.length})</div>
                  <div style={{ background:"#0d0b15", borderRadius:8, overflow:"hidden", maxHeight:200, overflowY:"auto" }}>
                    {previewModal.receitasMatch.map((r,i)=>(
                      <div key={r.id} style={{ padding:"6px 10px", borderBottom:"1px solid #13101e", display:"flex", justifyContent:"space-between", background:i%2===0?"#0d0b15":"#100e1b" }}>
                        <div style={{ fontSize:11, color:"#c8b8e8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{r.descricao||r.conta||"—"}</div>
                        <div style={{ fontSize:11, fontWeight:700, color:"#4ade80", flexShrink:0, marginLeft:8 }}>{fmt(r.valor)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {previewModal.despesasMatch.length > 0 && (
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:"#f87171", textTransform:"uppercase", marginBottom:6 }}>↓ Despesas ({previewModal.despesasMatch.length})</div>
                  <div style={{ background:"#0d0b15", borderRadius:8, overflow:"hidden", maxHeight:200, overflowY:"auto" }}>
                    {previewModal.despesasMatch.map((d,i)=>(
                      <div key={d.id} style={{ padding:"6px 10px", borderBottom:"1px solid #13101e", display:"flex", justifyContent:"space-between", background:i%2===0?"#0d0b15":"#100e1b" }}>
                        <div style={{ fontSize:11, color:"#c8b8e8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{d.descricao||d.conta||"—"}</div>
                        <div style={{ fontSize:11, fontWeight:700, color:"#f87171", flexShrink:0, marginLeft:8 }}>{fmt(d.valor)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {previewModal.receitasMatch.length === 0 && previewModal.despesasMatch.length === 0 && (
                <div style={{ textAlign:"center", color:"#4a3f60", padding:24, fontSize:12 }}>
                  Não foi possível cruzar os dados desta importação.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {meses.map(mes => {
        const itens = historico.filter(h => h.mes_referencia === mes).sort((a,b) => b.id - a.id);
        const tiposImportados = [...new Set(itens.map(h => h.tipo))];
        const ESPERADOS = ["ifood-tjk","ifood-hg","99food-hg","99food-tjk","extrato-mp"];

        return (
          <div key={mes} style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, overflow:"hidden" }}>
            {/* Cabeçalho do mês */}
            <div style={{ padding:"12px 16px", borderBottom:"1px solid #2d2640", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#1a1628" }}>
              <div style={{ fontWeight:800, fontSize:15, color:"#f0e8ff" }}>📅 {fmtMes(mes)}</div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {ESPERADOS.map(t => {
                  const info = TIPO_LABEL[t] || { label: t, icon:"📄", cor:"#94a3b8" };
                  const ok = tiposImportados.includes(t);
                  return (
                    <span key={t} style={{
                      fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:99,
                      background: ok ? info.cor + "22" : "#1a1628",
                      color: ok ? info.cor : "#3a2f50",
                      border: `1px solid ${ok ? info.cor + "66" : "#2d2640"}`,
                    }}>
                      {ok ? "✓" : "○"} {info.icon} {info.label}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Lista de importações do mês */}
            <div style={{ padding:"8px 0" }}>
              {itens.map(h => {
                const info = TIPO_LABEL[h.tipo] || { label: h.tipo, icon:"📄", cor:"#94a3b8" };
                return (
                  <div key={h.id} style={{ padding:"10px 16px", display:"flex", alignItems:"center", gap:12, borderBottom:"1px solid #13101e" }}>
                    <span style={{ fontSize:18 }}>{info.icon}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                        <span style={{ fontWeight:700, fontSize:12, color: info.cor }}>{info.label}</span>
                        {h.banco && <span style={{ fontSize:11, color:"#8a7fa0", background:"#0d0b15", padding:"1px 6px", borderRadius:6 }}>{h.banco}</span>}
                      </div>
                      <div style={{ fontSize:11, color:"#6b5f80", marginTop:2 }}>
                        {fmtDt(h.importado_em)}
                        {h.nome_arquivo && <span style={{ marginLeft:8, color:"#4a3f60" }}>• {h.nome_arquivo}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:11, color:"#4ade80", fontWeight:700 }}>+{h.qtd_receitas} rec</div>
                      <div style={{ fontSize:11, color:"#f87171", fontWeight:700 }}>+{h.qtd_despesas} desp</div>
                    </div>
                    <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                      <button onClick={() => {
                        const importedAt = new Date(h.importado_em).getTime();
                        const w = 30 * 60 * 1000;
                        setPreviewModal({
                          h,
                          receitasMatch: receitas.filter(r => { const c = r.id && String(r.id).length===13?Number(r.id):0; return Math.abs(c-importedAt)<w; }).slice(0,200),
                          despesasMatch: despesas.filter(d => { const c = d.id && String(d.id).length===13?Number(d.id):0; return Math.abs(c-importedAt)<w; }).slice(0,200),
                        });
                      }}
                        title="Visualizar dados importados"
                        style={{ background:"none", border:"1px solid #1e3a2a", borderRadius:6, color:"#4ade80", cursor:"pointer", padding:"4px 8px", fontSize:14, flexShrink:0 }}>
                        👁
                      </button>
                      <button onClick={() => { if(window.confirm("Remover este registro do histórico?")) onLimpar(h.id); }}
                        style={{ background:"none", border:"1px solid #3a1a1a", borderRadius:6, color:"#f87171", cursor:"pointer", padding:"4px 8px", fontSize:11, flexShrink:0 }}>
                        🗑
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}


function ReceitasTab({ receitas, setReceitas, setEditItem, setModal, showToast, bancos = [], despesas = [], sbDelete = () => {} }) {
  const [fBanco, setFBanco] = useState("");
  const [fPlano, setFPlano] = useState("");
  const [fConta, setFConta] = useState("");
  const [fBusca, setFBusca] = useState("");
  const [fDe,    setFDe]    = useState("");
  const [fAte,   setFAte]   = useState("");
  const [expandido, setExpandido] = useState(null); // id da receita expandida

  const DOCS_PLAT = ["Extrato financeiro iFood","Extrato financeiro 99Food"];
  const isPedidoPlat = r => DOCS_PLAT.includes(r.documento);

  // Busca despesas vinculadas a um pedido de plataforma
  // iFood:  receita = "Pedido iFood TJK #8346"     → despesas = "Pedido iFood TJK #8346 — ..."
  // 99Food: receita = "99Food HG 2026-04-14 — 1 pedido" → despesas = "99Food HG 2026-04-14 — Comissão..."
  const despesasDoPedido = (r) => {
    const is99 = r.documento === "Extrato financeiro 99Food";
    // Para 99Food, usa tudo antes do " — " como prefixo; para iFood, usa a descrição toda
    const prefix = is99 ? r.descricao.split(" — ")[0] : r.descricao;
    return despesas.filter(d =>
      d.descricao && d.descricao.startsWith(prefix + " — ") && d.descricao !== r.descricao
    );
  };

  const bancosDisp = [...new Set([...bancos, ...receitas.map(r => r.banco).filter(Boolean)])].sort();
  const planosDisp = [...new Set(receitas.map(r => r.plano).filter(Boolean))].sort();
  const contasDisp = [...new Set(
    receitas.filter(r => !fPlano || r.plano === fPlano).map(r => r.conta).filter(Boolean)
  )].sort();

  const filtradas = receitas.filter(r => {
    if (fBanco && r.banco !== fBanco) return false;
    if (fPlano && r.plano !== fPlano) return false;
    if (fConta && r.conta !== fConta) return false;
    if (fBusca && !JSON.stringify(r).toLowerCase().includes(fBusca.toLowerCase())) return false;
    if (fDe  && (r.data || "") < fDe)  return false;
    if (fAte && (r.data || "") > fAte) return false;
    return true;
  }).sort((a, b) => (b.data || "").localeCompare(a.data || ""));

  const totalFiltrado = filtradas.reduce((s, r) => s + Number(r.valor || 0), 0);
  const temFiltro = fBanco || fPlano || fConta || fBusca || fDe || fAte;
  const limpar = () => { setFBanco(""); setFPlano(""); setFConta(""); setFBusca(""); setFDe(""); setFAte(""); };

  const selStyle = { ...iStyle, fontSize: 12, padding: "6px 8px", cursor: "pointer" };
  const ativo = v => v ? { borderColor: "#c084fc", color: "#f0e8ff" } : {};

  return (
    <div>
      {/* Filtros */}
      <div style={{ background: "#13101e", border: "1.5px solid #2d2640", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={{ fontSize: 10, color: "#6b5f80", fontWeight: 600, textTransform: "uppercase" }}>🏦 Banco</label>
            <select value={fBanco} onChange={e => setFBanco(e.target.value)} style={{ ...selStyle, ...ativo(fBanco) }}>
              <option value="">Todos</option>
              {bancosDisp.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={{ fontSize: 10, color: "#6b5f80", fontWeight: 600, textTransform: "uppercase" }}>📂 Plano de Conta</label>
            <select value={fPlano} onChange={e => { setFPlano(e.target.value); setFConta(""); }} style={{ ...selStyle, ...ativo(fPlano) }}>
              <option value="">Todos</option>
              {planosDisp.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={{ fontSize: 10, color: "#6b5f80", fontWeight: 600, textTransform: "uppercase" }}>🏷 Subcategoria</label>
            <select value={fConta} onChange={e => setFConta(e.target.value)} style={{ ...selStyle, ...ativo(fConta) }} disabled={contasDisp.length === 0}>
              <option value="">Todas</option>
              {contasDisp.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={{ fontSize: 10, color: "#6b5f80", fontWeight: 600, textTransform: "uppercase" }}>📅 Data de</label>
            <input type="date" value={fDe} onChange={e => setFDe(e.target.value)}
              style={{ ...selStyle, ...ativo(fDe) }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={{ fontSize: 10, color: "#6b5f80", fontWeight: 600, textTransform: "uppercase" }}>📅 Data até</label>
            <input type="date" value={fAte} onChange={e => setFAte(e.target.value)}
              style={{ ...selStyle, ...ativo(fAte) }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={{ fontSize: 10, color: "#6b5f80", fontWeight: 600, textTransform: "uppercase" }}>🔍 Busca</label>
            <input value={fBusca} onChange={e => setFBusca(e.target.value)} placeholder="Descrição, valor..."
              style={{ ...selStyle, ...ativo(fBusca) }} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#8a7fa0" }}>
            <strong style={{ color: "#f0e8ff" }}>{filtradas.length}</strong> de {receitas.length} lançamentos
            {temFiltro && <span style={{ color: "#4ade80", marginLeft: 10, fontWeight: 700 }}>= {fmt(totalFiltrado)}</span>}
          </span>
          {temFiltro && (
            <button onClick={limpar}
              style={{ fontSize: 11, background: "none", border: "1px solid #3d2f5a", borderRadius: 6, color: "#8a7fa0", cursor: "pointer", padding: "3px 10px" }}>
              ✕ Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtradas.map(r => {
          const isPlat = isPedidoPlat(r);
          const despPedido = isPlat ? despesasDoPedido(r) : [];
          const totalDesp = despPedido.reduce((s,d)=>s+Number(d.valor||0),0);
          const liquido = Number(r.valor||0) - totalDesp;
          const isOpen = expandido === r.id;

          return (
          <div key={r.id} style={{ background: "#13101e", border: `1.5px solid ${isOpen?"#4ade80":"#1a3a20"}`, borderRadius: 12, overflow:"hidden" }}>
            {/* Linha principal */}
            <div style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 4, flexWrap: "wrap", alignItems: "center" }}>
                  <Badge color="green">Receita</Badge>
                  <span style={{ fontSize: 11, color: "#6b5f80" }}>{fmtDate(r.data)}</span>
                  <Badge color="blue">{r.documento}</Badge>
                  {r.conta && <Badge color="purple">{r.conta}</Badge>}
                </div>
                <div style={{ fontSize: 13, color: "#c8b8e8", fontWeight: 600 }}>{r.descricao || r.conta || r.plano}</div>
                <div style={{ fontSize: 11, color: "#8a7fa0", marginTop: 2 }}>
                  <span style={{ color: "#6b5f80" }}>{r.plano}</span>
                  <span style={{ margin: "0 6px", color: "#3a3255" }}>·</span>
                  {r.documento === "Transferência" && r.bancOrigem
                    ? <span><span style={{ color:"#f87171" }}>{r.bancOrigem}</span><span style={{ color:"#4a3f60", margin:"0 4px" }}>→</span><span style={{ color:"#4ade80" }}>{r.banco}</span></span>
                    : <span style={{ color: "#6b5f80" }}>{r.banco}</span>
                  }
                  {/* Líquido resumo quando fechado */}
                  {isPlat && despPedido.length > 0 && !isOpen && (
                    <span style={{ marginLeft:8, color:"#4a3f60" }}>
                      · líq <strong style={{color:"#c084fc"}}>{fmt(liquido)}</strong>
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 12 }}>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#4ade80", whiteSpace: "nowrap" }}>{fmt(r.valor)}</div>
                  {isPlat && despPedido.length > 0 && (
                    <div style={{ fontSize:10, color:"#f87171" }}>−{fmt(totalDesp)} taxas</div>
                  )}
                </div>
                {/* Botão expandir — só para pedidos de plataforma com despesas */}
                {isPlat && despPedido.length > 0 && (
                  <button onClick={() => setExpandido(isOpen ? null : r.id)}
                    title={isOpen ? "Fechar detalhes" : "Ver taxas e comissões"}
                    style={{ background: isOpen?"#0a1f0a":"none", border:`1px solid ${isOpen?"#4ade80":"#2d4a2d"}`, borderRadius:6, color: isOpen?"#4ade80":"#6b5f80", cursor:"pointer", padding:"4px 8px", fontSize:12, transition:"all 0.15s" }}>
                    {isOpen ? "▲" : "▼"}
                  </button>
                )}
                <button onClick={() => {
                  // Carrega descontos vinculados a esta receita (despesas com receita_id)
                  const descsVinculados = despesas.filter(d => d.receita_id === r.id);
                  const descontosFormatados = descsVinculados.map(d => ({
                    id: d.id,
                    tipo: d.descricao?.split(" — ")[0]?.replace("Desconto/Taxa","").trim() || "Taxa",
                    plano: d.plano || "",
                    conta: d.conta || "",
                    valor: String(d.valor || ""),
                  }));
                  setEditItem({
                    ...r,
                    descontos: descontosFormatados.length > 0 ? descontosFormatados : undefined,
                  });
                  setModal("receita");
                }}
                  style={{ background: "none", border: "1px solid #2d2640", borderRadius: 6, color: "#8a7fa0", cursor: "pointer", padding: "4px 8px", fontSize: 11 }}>✏️</button>
                <button onClick={() => { setReceitas(receitas.filter(x => x.id !== r.id)); sbDelete("receitas", r.id); showToast("Removido.", "del"); }}
                  style={{ background: "none", border: "1px solid #7f1d1d", borderRadius: 6, color: "#f87171", cursor: "pointer", padding: "4px 8px", fontSize: 11 }}>🗑</button>
              </div>
            </div>

            {/* Painel expansível com taxas do pedido */}
            {isOpen && despPedido.length > 0 && (
              <div style={{ borderTop:"1px solid #1a2e1a", background:"#0a130a" }}>
                {/* Header */}
                <div style={{ padding:"8px 14px 4px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:10, fontWeight:800, color:"#4a3f60", textTransform:"uppercase", letterSpacing:"0.06em" }}>
                    💸 Taxas & Comissões do Pedido
                  </span>
                  <span style={{ fontSize:11, color:"#4a3f60" }}>
                    {despPedido.length} item{despPedido.length>1?"s":""}
                  </span>
                </div>
                {/* Linhas de despesa */}
                {despPedido.map((d,i) => {
                  const tipo = d.descricao.replace(r.descricao + " — ", "");
                  const corTipo = tipo.includes("Comissão") || tipo.includes("Taxa") ? "#f87171"
                    : tipo.includes("Incentivo") ? "#818cf8"
                    : "#f59e0b";
                  return (
                    <div key={d.id} style={{ padding:"6px 14px", display:"flex", justifyContent:"space-between", alignItems:"center",
                      borderTop: i>0?"1px solid #0f1a0f":"none",
                      background: i%2===0?"transparent":"#0d160d" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:6, height:6, borderRadius:"50%", background:corTipo, flexShrink:0 }}/>
                        <span style={{ fontSize:12, color:"#8a9a80" }}>{tipo}</span>
                        {d.conta && <span style={{ fontSize:10, color:"#4a3f60" }}>· {d.conta.split(" - ")[0]}</span>}
                      </div>
                      <span style={{ fontSize:12, fontWeight:700, color:corTipo }}>−{fmt(d.valor)}</span>
                    </div>
                  );
                })}
                {/* Totalizador */}
                <div style={{ padding:"8px 14px 10px", borderTop:"1px solid #1a2e1a", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#0d160d" }}>
                  <div style={{ fontSize:11, color:"#6b5f80" }}>
                    Bruto <strong style={{color:"#4ade80"}}>{fmt(r.valor)}</strong>
                    <span style={{margin:"0 6px", color:"#3a3255"}}>−</span>
                    Taxas <strong style={{color:"#f87171"}}>{fmt(totalDesp)}</strong>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end" }}>
                    <span style={{ fontSize:10, color:"#4a3f60", textTransform:"uppercase" }}>Líquido</span>
                    <span style={{ fontSize:14, fontWeight:900, color: liquido>=0?"#c084fc":"#f87171" }}>{fmt(liquido)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          );
        })}
        {filtradas.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "#6b5f80" }}>
            {temFiltro ? "Nenhum lançamento para os filtros selecionados." : "Nenhuma receita cadastrada."}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DESPESAS TAB ─────────────────────────────────────────────────────────────
function DespesasTab({ despesas, setDespesas, setEditItem, setModal, showToast, bancos = [], sbDelete = () => {} }) {
  const [fBanco, setFBanco] = useState("");
  const [fPlano, setFPlano] = useState("");
  const [fConta, setFConta] = useState("");
  const [fBusca, setFBusca] = useState("");
  const [fDe,    setFDe]    = useState("");
  const [fAte,   setFAte]   = useState("");

  // Usa bancos do cadastro; complementa com bancos que existem nos lançamentos mas não estão no cadastro
  const bancosDisp = [...new Set([...bancos, ...despesas.map(d => d.banco).filter(Boolean)])].sort();
  const planosDisp = [...new Set(despesas.map(d => d.plano).filter(Boolean))].sort();
  const contasDisp = [...new Set(
    despesas.filter(d => !fPlano || d.plano === fPlano).map(d => d.conta).filter(Boolean)
  )].sort();

  const filtradas = despesas.filter(d => {
    if (fBanco && d.banco !== fBanco) return false;
    if (fPlano && d.plano !== fPlano) return false;
    if (fConta && d.conta !== fConta) return false;
    if (fBusca && !JSON.stringify(d).toLowerCase().includes(fBusca.toLowerCase())) return false;
    if (fDe  && (d.data || "") < fDe)  return false;
    if (fAte && (d.data || "") > fAte) return false;
    return true;
  }).sort((a, b) => (b.data || "").localeCompare(a.data || ""));

  const totalFiltrado = filtradas.reduce((s, d) => s + Number(d.valor || 0), 0);
  const temFiltro = fBanco || fPlano || fConta || fBusca || fDe || fAte;
  const limpar = () => { setFBanco(""); setFPlano(""); setFConta(""); setFBusca(""); setFDe(""); setFAte(""); };

  const selStyle = { ...iStyle, fontSize: 12, padding: "6px 8px", cursor: "pointer" };
  const ativo = v => v ? { borderColor: "#f87171", color: "#f0e8ff" } : {};

  return (
    <div>
      {/* Filtros */}
      <div style={{ background: "#13101e", border: "1.5px solid #2d2640", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={{ fontSize: 10, color: "#6b5f80", fontWeight: 600, textTransform: "uppercase" }}>🏦 Banco</label>
            <select value={fBanco} onChange={e => setFBanco(e.target.value)} style={{ ...selStyle, ...ativo(fBanco) }}>
              <option value="">Todos</option>
              {bancosDisp.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={{ fontSize: 10, color: "#6b5f80", fontWeight: 600, textTransform: "uppercase" }}>📂 Plano de Conta</label>
            <select value={fPlano} onChange={e => { setFPlano(e.target.value); setFConta(""); }} style={{ ...selStyle, ...ativo(fPlano) }}>
              <option value="">Todos</option>
              {planosDisp.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={{ fontSize: 10, color: "#6b5f80", fontWeight: 600, textTransform: "uppercase" }}>🏷 Subcategoria</label>
            <select value={fConta} onChange={e => setFConta(e.target.value)} style={{ ...selStyle, ...ativo(fConta) }} disabled={contasDisp.length === 0}>
              <option value="">Todas</option>
              {contasDisp.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={{ fontSize: 10, color: "#6b5f80", fontWeight: 600, textTransform: "uppercase" }}>📅 Data de</label>
            <input type="date" value={fDe} onChange={e => setFDe(e.target.value)}
              style={{ ...selStyle, ...ativo(fDe) }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={{ fontSize: 10, color: "#6b5f80", fontWeight: 600, textTransform: "uppercase" }}>📅 Data até</label>
            <input type="date" value={fAte} onChange={e => setFAte(e.target.value)}
              style={{ ...selStyle, ...ativo(fAte) }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={{ fontSize: 10, color: "#6b5f80", fontWeight: 600, textTransform: "uppercase" }}>🔍 Busca</label>
            <input value={fBusca} onChange={e => setFBusca(e.target.value)} placeholder="Descrição, valor..."
              style={{ ...selStyle, ...ativo(fBusca) }} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#8a7fa0" }}>
            <strong style={{ color: "#f0e8ff" }}>{filtradas.length}</strong> de {despesas.length} lançamentos
            {temFiltro && <span style={{ color: "#f87171", marginLeft: 10, fontWeight: 700 }}>= {fmt(totalFiltrado)}</span>}
          </span>
          {temFiltro && (
            <button onClick={limpar}
              style={{ fontSize: 11, background: "none", border: "1px solid #3d2f5a", borderRadius: 6, color: "#8a7fa0", cursor: "pointer", padding: "3px 10px" }}>
              ✕ Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtradas.map(d => (
          <div key={d.id} style={{ background: "#13101e", border: "1.5px solid #3a1a1a", borderRadius: 12, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 4, flexWrap: "wrap", alignItems: "center" }}>
                <Badge color="red">Despesa</Badge>
                <span style={{ fontSize: 11, color: "#6b5f80" }}>{fmtDate(d.data)}</span>
                <Badge color="blue">{d.documento}</Badge>
                {d.conta && <Badge color="purple">{d.conta}</Badge>}
              </div>
              <div style={{ fontSize: 13, color: "#c8b8e8", fontWeight: 600 }}>{d.descricao || d.conta || d.plano}</div>
              <div style={{ fontSize: 11, color: "#8a7fa0", marginTop: 2 }}>
                <span style={{ color: "#6b5f80" }}>{d.plano}</span>
                <span style={{ margin: "0 6px", color: "#3a3255" }}>·</span>
                {d.documento === "Transferência" && d.bancDestino
                  ? <span><span style={{ color:"#f87171" }}>{d.banco}</span><span style={{ color:"#4a3f60", margin:"0 4px" }}>→</span><span style={{ color:"#4ade80" }}>{d.bancDestino}</span></span>
                  : <span style={{ color: "#6b5f80" }}>{d.banco}</span>
                }
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#f87171", whiteSpace: "nowrap" }}>{fmt(d.valor)}</span>
              <button onClick={() => { setEditItem(d); setModal("despesa"); }}
                style={{ background: "none", border: "1px solid #2d2640", borderRadius: 6, color: "#8a7fa0", cursor: "pointer", padding: "4px 8px", fontSize: 11 }}>✏️</button>
              <button onClick={() => { setDespesas(despesas.filter(x => x.id !== d.id)); sbDelete("despesas", d.id); showToast("Removido.", "del"); }}
                style={{ background: "none", border: "1px solid #7f1d1d", borderRadius: 6, color: "#f87171", cursor: "pointer", padding: "4px 8px", fontSize: 11 }}>🗑</button>
            </div>
          </div>
        ))}
        {filtradas.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "#6b5f80" }}>
            {temFiltro ? "Nenhum lançamento para os filtros selecionados." : "Nenhuma despesa cadastrada."}
          </div>
        )}
      </div>
    </div>
  );
}



// ─── SEGURANÇA ────────────────────────────────────────────────────────────────
async function hashSenha(senha) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(senha));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("");
}

function LockScreen({ onUnlock, onSetup, temSenha }) {
  const [val, setVal] = useState("");
  const [erro, setErro] = useState(false);
  const inputRef = React.useRef();
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);

  const tentar = async () => {
    const h = await hashSenha(val);
    if (temSenha) {
      const ok = await onUnlock(h);
      if (!ok) { setErro(true); setVal(""); setTimeout(() => setErro(false), 1500); }
    } else {
      if (val.length < 4) { setErro(true); setTimeout(() => setErro(false), 1500); return; }
      await onSetup(val);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0d0b15", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20 }}>
      <div style={{ fontSize:48 }}>🌙</div>
      <div style={{ fontSize:20, fontWeight:800, background:"linear-gradient(90deg,#c084fc,#e85d8a)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Dolce Luna</div>
      <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:16, padding:28, display:"flex", flexDirection:"column", gap:14, width:300 }}>
        <div style={{ fontSize:14, fontWeight:700, color:"#c8b8e8", textAlign:"center" }}>
          🔒 {temSenha ? "Digite sua senha" : "Primeiro acesso — crie uma senha"}
        </div>
        <input ref={inputRef} type="password" value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && tentar()}
          placeholder={temSenha ? "Senha" : "Criar senha (mín. 4 caracteres)"}
          style={{ ...iStyle, fontSize:14, padding:"10px 14px", textAlign:"center", borderColor: erro ? "#f87171" : "#2d2640" }} />
        {erro && <div style={{ fontSize:11, color:"#f87171", textAlign:"center" }}>{temSenha ? "Senha incorreta" : "Mínimo 4 caracteres"}</div>}
        <button onClick={tentar}
          style={{ padding:"10px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#c084fc,#e85d8a)", color:"#fff", fontWeight:800, fontSize:14, cursor:"pointer" }}>
          {temSenha ? "Entrar" : "Criar senha e entrar"}
        </button>
      </div>
    </div>
  );
}

function AlterarSenhaModal({ onSave, onClose }) {
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [conf, setConf] = useState("");
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState(false);

  const salvar = async () => {
    if (nova !== conf) { setErro("As senhas não coincidem"); return; }
    if (nova.length < 4) { setErro("Mínimo 4 caracteres"); return; }
    const hAtual = await hashSenha(atual);
    const hNova  = await hashSenha(nova);
    const res = await onSave(hAtual, hNova);
    if (!res) { setErro("Senha atual incorreta"); return; }
    setOk(true); setTimeout(onClose, 1500);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:16, padding:28, width:320, display:"flex", flexDirection:"column", gap:12 }}>
        <div style={{ fontSize:15, fontWeight:800, color:"#c084fc" }}>🔑 Alterar Senha</div>
        {ok ? <div style={{ color:"#4ade80", textAlign:"center", padding:16 }}>✅ Senha alterada!</div> : <>
          {[["Senha atual", atual, setAtual],["Nova senha", nova, setNova],["Confirmar nova senha", conf, setConf]].map(([lbl, v, set]) => (
            <div key={lbl} style={{ display:"flex", flexDirection:"column", gap:4 }}>
              <label style={{ fontSize:11, color:"#6b5f80", fontWeight:600 }}>{lbl}</label>
              <input type="password" value={v} onChange={e => set(e.target.value)} style={{ ...iStyle, padding:"8px 12px" }} />
            </div>
          ))}
          {erro && <div style={{ fontSize:11, color:"#f87171" }}>{erro}</div>}
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
            <button onClick={onClose} style={{ padding:"8px 16px", borderRadius:8, border:"1px solid #2d2640", background:"none", color:"#8a7fa0", cursor:"pointer" }}>Cancelar</button>
            <button onClick={salvar} style={{ padding:"8px 16px", borderRadius:8, border:"none", background:"linear-gradient(135deg,#c084fc,#e85d8a)", color:"#fff", fontWeight:700, cursor:"pointer" }}>Salvar</button>
          </div>
        </>}
      </div>
    </div>
  );
}


// ─── IMPORTAR IFOOD TAB ───────────────────────────────────────────────────────
// ─── XLSX PARSER + PROCESSADORES (client-side) ───────────────────────────────
// Carrega PDF.js via CDN uma única vez
async function carregarPDFJS() {
  if (window._PDFJS_READY) return window.pdfjsLib;
  await new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  window._PDFJS_READY = true;
  return window.pdfjsLib;
}

// Extrai texto de PDF e converte em rows compatíveis com o parser do extrato
async function lerPDF(file) {
  const pdfjsLib = await carregarPDFJS();
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  let linhasTexto = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    // Agrupa itens por linha (Y próximo)
    const items = content.items.map(i => ({ x: Math.round(i.transform[4]), y: Math.round(i.transform[5]), t: i.str }));
    items.sort((a,b) => b.y - a.y || a.x - b.x);
    let linhaAtual = null, yAtual = null;
    for (const it of items) {
      if (yAtual === null || Math.abs(it.y - yAtual) > 4) {
        if (linhaAtual) linhasTexto.push(linhaAtual.trim());
        linhaAtual = it.t; yAtual = it.y;
      } else {
        linhaAtual += (it.t.startsWith(" ") ? "" : " ") + it.t;
      }
    }
    if (linhaAtual) linhasTexto.push(linhaAtual.trim());
  }

  // Tenta detectar padrão: data + descrição + valor
  // Aceita DD/MM/YYYY ou DD-MM-YYYY no início da linha
  const rows = [];
  const reData = /^(\d{2}[\/-]\d{2}[\/-]\d{4})/;
  const reValor = /([-+]?\s*R?\$?\s*[\d.,]+)\s*$/;

  for (const linha of linhasTexto) {
    const mData = linha.match(reData);
    if (!mData) continue;
    const mValor = linha.match(reValor);
    if (!mValor) continue;
    const restante = linha.slice(mData[1].length, linha.length - mValor[1].length).trim();
    if (!restante) continue;
    rows.push({
      "data da transação": mData[1],
      "descrição": restante,
      "valor": mValor[1].replace(/R?\$\s*/,"").replace(/\s/,""),
    });
  }

  if (rows.length === 0) {
    // Fallback: retorna linhas brutas para o parser genérico tentar colunas
    throw new Error(`PDF lido (${linhasTexto.length} linhas) mas nenhuma transação detectada automaticamente. Tente exportar como CSV ou XLSX no seu banco.`);
  }
  return rows;
}

async function lerXLSX(file) {
  // PDF → parser especial
  if (file.name?.toLowerCase().endsWith(".pdf")) {
    return await lerPDF(file);
  }

  if (!window._XLSX) {
    await new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
    window._XLSX = window.XLSX;
  }
  const X = window._XLSX;
  const isCsv = file.name?.toLowerCase().endsWith(".csv");
  if (isCsv) {
    // CSV com valores em formato brasileiro (vírgula decimal):
    // raw: true evita que o SheetJS converta "179,51" → 17951
    const text = await file.text();
    const wb = X.read(text, { type: "string", raw: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    return X.utils.sheet_to_json(ws, { defval: "", raw: true });
  }
  // XLSX / XLS
  const buf = await file.arrayBuffer();
  const wb  = X.read(buf, { type: "array" });
  const ws  = wb.Sheets[wb.SheetNames[0]];
  return X.utils.sheet_to_json(ws, { defval: "" });
}

function rNum(v) {
  // Se já for número (ex: float vindo de xlsx com biblioteca que parseia direto)
  if (typeof v === "number") return isNaN(v) ? 0 : Math.round(v * 100) / 100;
  const s = String(v ?? "").trim();
  if (!s) return 0;
  // Formato brasileiro com vírgula decimal (ex: "1.234,56" ou "19,05")
  if (s.includes(",")) {
    const n = parseFloat(s.replace(/\./g, "").replace(",", "."));
    return isNaN(n) ? 0 : Math.round(n * 100) / 100;
  }
  // Número com ponto decimal (ex: "-19.05" ou "45.8")
  const n = parseFloat(s);
  return isNaN(n) ? 0 : Math.round(n * 100) / 100;
}

function parseDt(v) {
  if (v == null || v === "") return "";
  // Se já for um número (serial Excel)
  if (typeof v === "number") {
    if (v > 0 && v < 60000) {
      const d = new Date(Math.round((v - 25569) * 86400 * 1000));
      return d.toISOString().slice(0,10);
    }
    return "";
  }
  const s = String(v).trim();
  if (!s) return "";
  // DD/MM/YYYY (com barra)
  let m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  // DD-MM-YYYY (com hífen — formato do Mercado Pago)
  m = s.match(/^(\d{2})-(\d{2})-(\d{4})/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  // YYYY-MM-DD (ISO já correto)
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0,10);
  // YYYYMMDD (ex: 20260331)
  if (/^\d{8}$/.test(s)) return `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`;
  // DD/MM/YY ou DD-MM-YY (ano com 2 dígitos)
  m = s.match(/^(\d{2})[\/-](\d{2})[\/-](\d{2})$/);
  if (m) return `20${m[3]}-${m[2]}-${m[1]}`;
  // Excel serial numérico como string
  if (/^\d+$/.test(s) && Number(s) > 0 && Number(s) < 60000) {
    const d = new Date(Math.round((Number(s) - 25569) * 86400 * 1000));
    return d.toISOString().slice(0,10);
  }
  // Datetime completo: pega só a data
  m = s.match(/^(\d{4}-\d{2}-\d{2})[ T]/);
  if (m) return m[1];
  return s.slice(0,10);
}

function processarXLSX(rows, tipo, cnpj, banco) {
  const headers = Object.keys(rows[0] || {}).join("|").toLowerCase();
  const ts0 = Date.now();
  const isIFood   = headers.includes("valor dos itens") || headers.includes("taxas e comissoes") || headers.includes("id curto do pedido");
  // Formato 99Food por pedido — colunas em português com acentos (ex: "Preço original do item", "ID do pedido")
  const is99PedPT = headers.includes("preço original do item") || (headers.includes("id do pedido") && headers.includes("custos logísticos"));
  const is99Ped   = headers.includes("preco_original") || (headers.includes("comissao") && headers.includes("logistica") && headers.includes("pedido"));
  // is99Dia só quando NÃO for o formato por pedido em português
  const is99Dia   = !is99PedPT && (headers.includes("receita total de vendas") || headers.includes("total de vendas realizadas") || (headers.includes("despesas de comiss") && !headers.includes("id do pedido")));
  const tag      = cnpj === "48.659.129" ? "TJK" : "HG";
  const planoR   = `Receita com CNPJ ${cnpj}`;
  const cCom99   = `Comissão e distribuição 99 - ${cnpj}`;
  const cLog99   = `Custos Logísticos 99Food - ${cnpj}`;
  const cLoj99   = `Custos Logísticos da Loja 99Food - ${cnpj}`;
  const receitas = [], despesas = [];

  if (is99PedPT) {
    // Formato 99Food "Dados do pedido" com colunas em português
    rows.forEach((row, i) => {
      // Pular pedidos cancelados (horário de cancelamento preenchido E receita = 0)
      const cancelado = String(row["Horário do cancelamento"] || "").trim();
      const pr = rNum(row["Preço original do item"]);
      if (cancelado && pr === 0) return;
      const pid  = row["ID do pedido"] || i;
      const rawDt = row["Data"] ? String(row["Data"]).trim() : "";
      const data = parseDt(rawDt);
      const ts   = ts0 + i * 10;
      const co   = rNum(row["Despesas de comissão da loja"]);
      const of   = rNum(row["Despesas de ofertas da loja"]);
      const lo   = rNum(row["Custos logísticos"]);
      const en   = rNum(row["Custo líquido da loja na oferta de entrega grátis"]);
      if (pr > 0) receitas.push({ id:ts, data, documento:"Extrato financeiro 99Food", plano:planoR, conta:"99Food", tipo:"Recorrente", descricao:`Pedido 99Food ${tag} #${pid}`, banco, valor:pr, vencimento:data, recebimento:data });
      [{ val:co, conta:cCom99, desc:"Comissão 99Food" }, { val:of, conta:cLoj99, desc:"Oferta 99Food" }, { val:lo, conta:cLog99, desc:"Logística 99Food" }, { val:en, conta:cLoj99, desc:"Entrega grátis 99Food" }]
        .forEach((d,j) => { if (d.val > 0) despesas.push({ id:ts+j+1, data, documento:"Extrato financeiro 99Food", plano:"Despesas com Taxas", conta:d.conta, tipo:"Recorrente", descricao:`Pedido 99Food ${tag} #${pid} — ${d.desc}`, banco, valor:d.val, vencimento:data, pagamento:data }); });
    });

  } else if (isIFood) {
    const tag2     = cnpj === "48.659.129" ? "TJK" : "HG";
    const contaRec = cnpj === "48.659.129" ? "iFood Tijuca" : "iFood Higienópolis";
    const cCom     = `Comissões iFood - ${tag2}`;     // taxas e comissões (inclui entrega)
    const cSrv     = `Taxa de Serviço iFood - ${tag2}`; // taxa de serviço
    const cInc2    = `Incentivos iFood - ${tag2}`;    // incentivos/promoções
    rows.filter(r => String(r["STATUS FINAL DO PEDIDO"]||"").toUpperCase() === "CONCLUIDO").forEach((row, i) => {
      const data = parseDt(row["DATA E HORA DO PEDIDO"]);
      const pid  = row["ID CURTO DO PEDIDO"] || i;
      const ts   = ts0 + i * 10;
      const vi   = rNum(row["VALOR DOS ITENS (R$)"]);
      const tc   = Math.abs(rNum(row["TAXAS E COMISSOES (R$)"]));
      const il   = rNum(row["INCENTIVO PROMOCIONAL DA LOJA (R$)"]);
      const tsv  = rNum(row["TAXA DE SERVIÇO (R$)"]);
      receitas.push({ id:ts, data, documento:"Extrato financeiro iFood", plano:planoR, conta:contaRec, tipo:"Recorrente", descricao:`Pedido iFood ${tag} #${pid}`, banco, valor:vi, vencimento:data, recebimento:data });
      [{ val:tc, conta:cCom,  desc:"Taxas e Comissões" },
       { val:tsv, conta:cSrv, desc:"Taxa de Serviço" },
       { val:il,  conta:cInc2,desc:"Incentivo Loja" }]
        .forEach((d,j) => { if (d.val > 0) despesas.push({ id:ts+j+1, data, documento:"Extrato financeiro iFood", plano:"Despesas com Taxas", conta:d.conta, tipo:"Recorrente", descricao:`Pedido iFood ${tag} #${pid} — ${d.desc}`, banco, valor:d.val, vencimento:data, pagamento:data }); });
    });

  } else if (is99Ped) {
    rows.forEach((row, i) => {
      const pid  = row["pedido"]||row["Pedido"]||row["PEDIDO"]||i;
      const data = parseDt(row["data"]||row["Data"]||row["DATA"]);
      const ts   = ts0 + i * 10;
      const pr   = rNum(row["preco_original"]||row["Preço Original"]||row["valor"]);
      const co   = rNum(row["comissao"]||row["Comissão"]);
      const of   = rNum(row["oferta"]||row["Oferta"]);
      const lo   = rNum(row["logistica"]||row["Logística"]);
      const en   = rNum(row["entrega_gratis"]||row["Entrega Grátis"]);
      if (pr > 0) receitas.push({ id:ts, data, documento:"Extrato financeiro 99Food", plano:planoR, conta:"99Food", tipo:"Recorrente", descricao:`Pedido 99Food ${tag} #${pid}`, banco, valor:pr, vencimento:data, recebimento:data });
      [{ val:co, conta:cCom99, desc:"Comissão 99Food" }, { val:of, conta:cLoj99, desc:"Oferta 99Food" }, { val:lo, conta:cLog99, desc:"Logística 99Food" }, { val:en, conta:cLoj99, desc:"Entrega grátis 99Food" }]
        .forEach((d,j) => { if (d.val > 0) despesas.push({ id:ts+j+1, data, documento:"Extrato financeiro 99Food", plano:"Despesas com Taxas", conta:d.conta, tipo:"Recorrente", descricao:`Pedido 99Food ${tag} #${pid} — ${d.desc}`, banco, valor:d.val, vencimento:data, pagamento:data }); });
    });

  } else if (is99Dia) {
    const chaves = Object.keys(rows[0]);
    const col = (p) => chaves.find(k => k.toLowerCase().includes(p.toLowerCase())) || "";
    const cTV = col("Total de vendas realizadas");
    const cRV = col("Receita total de vendas");
    const cDO = col("Despesas de ofertas");
    const cDC = col("Despesas de comiss");
    const cDt = col("Data");
    rows.filter(row => rNum(row[cTV]) > 0).forEach((row, i) => {
      const data  = parseDt(row[cDt]);
      const ts    = ts0 + i * 10;
      const nPed  = Math.round(rNum(row[cTV]));
      const rv    = rNum(row[cRV]);
      const dof   = rNum(row[cDO]);
      const dc    = rNum(row[cDC]);
      if (rv  > 0) receitas.push({ id:ts,   data, documento:"Extrato financeiro 99Food", plano:planoR, conta:"99Food", tipo:"Recorrente", descricao:`99Food ${tag} ${data} — ${nPed} pedido${nPed>1?"s":""}`, banco, valor:rv, vencimento:data, recebimento:data });
      if (dc  > 0) despesas.push({ id:ts+1, data, documento:"Extrato financeiro 99Food", plano:"Despesas com Taxas", conta:cCom99, tipo:"Recorrente", descricao:`99Food ${tag} ${data} — Comissão da loja`, banco, valor:dc, vencimento:data, pagamento:data });
      if (dof > 0) despesas.push({ id:ts+2, data, documento:"Extrato financeiro 99Food", plano:"Despesas com Taxas", conta:cLoj99, tipo:"Recorrente", descricao:`99Food ${tag} ${data} — Ofertas da loja`, banco, valor:dof, vencimento:data, pagamento:data });
    });

  } else {
    throw new Error(`Formato não reconhecido. Colunas: ${Object.keys(rows[0]).slice(0,5).join(", ")}`);
  }
  return { receitas, despesas };
}

function UploadRelatorio({ tipo, cnpj, banco, onImportado, onRegistrar, nomeArquivo, showToast, setReceitas, setDespesas, receitas, despesas }) {
  const [status, setStatus]   = useState("idle");
  const [preview, setPreview] = useState(null);
  const [erro, setErro]       = useState(null);
  const [filtroPrev, setFiltroPrev] = useState("todos");

  const lerArquivo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    setStatus("lendo"); setPreview(null); setErro(null);
    try {
      const rows = await lerXLSX(file);
      if (!rows.length) throw new Error("Nenhum dado encontrado na planilha");
      const { receitas: novasRec, despesas: novasDesp } = processarXLSX(rows, tipo, cnpj, banco);
      if (!novasRec.length && !novasDesp.length) throw new Error("Nenhum lançamento gerado. Verifique o formato.");
      setPreview({ novasRec, novasDesp });
      setStatus("preview");
    } catch (err) { setErro(err.message); setStatus("erro"); }
  };

  const confirmar = () => {
    if (!preview) return;
    const { novasRec, novasDesp } = preview;
    const idsRec  = new Set((receitas||[]).map(r => r.id));
    const idsDesp = new Set((despesas||[]).map(d => d.id));
    setReceitas([...(receitas||[]), ...novasRec.filter(r => !idsRec.has(r.id))]);
    setDespesas([...(despesas||[]), ...novasDesp.filter(d => !idsDesp.has(d.id))]);
    setStatus("importado"); setPreview(null);
    showToast(`✅ ${novasRec.length} receitas e ${novasDesp.length} despesas importadas!`, "ok");
    if (onImportado) onImportado({ receitas_salvas: novasRec.length, despesas_salvas: novasDesp.length });
    if (onRegistrar) {
      const datas = [...novasRec, ...novasDesp].map(x => x.data).filter(Boolean).sort();
      const mesRef = datas.length ? datas[0].slice(0,7) : new Date().toISOString().slice(0,7);
      onRegistrar({ tipo, banco, mesReferencia: mesRef, nomeArquivo, qtdRec: novasRec.length, qtdDesp: novasDesp.length,
        totalRec: novasRec.reduce((s,r)=>s+r.valor,0), totalDesp: novasDesp.reduce((s,r)=>s+r.valor,0) });
    }
  };

  const cancelar = () => { setStatus("idle"); setPreview(null); };
  const totalRec  = preview ? preview.novasRec.reduce((s,r)=>s+Number(r.valor||0),0) : 0;
  const totalDesp = preview ? preview.novasDesp.reduce((s,d)=>s+Number(d.valor||0),0) : 0;
  const cor = status==="ok"||status==="importado" ? "#4ade80" : status==="erro" ? "#f87171" : "#c084fc";
  const btnUpload = { display:"flex", alignItems:"center", gap:8, cursor:"pointer", padding:"12px 20px", borderRadius:10, fontWeight:800, fontSize:13, border:`2px dashed ${cor}`, background:"#1a1028", color:cor, width:"100%", justifyContent:"center" };
  const cellS = { padding:"7px 10px", fontSize:11, borderBottom:"1px solid #1a1628", whiteSpace:"nowrap" };

  if (status !== "preview") return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <label style={btnUpload}>
        {status==="lendo"     ? "⏳ Lendo arquivo..." :
         status==="importado" ? "✅ Importado! Enviar outro arquivo" :
         status==="erro"      ? "❌ Erro — tentar novamente" :
                                "📂 Selecionar arquivo .xlsx para importar"}
        <input type="file" accept=".xlsx,.xls,.csv,.pdf" onChange={lerArquivo} disabled={status==="lendo"} style={{ display:"none" }} />
      </label>
      {status==="erro" && <div style={{ background:"#2e0d0d", border:"1px solid #7f1d1d", borderRadius:8, padding:"10px 14px", fontSize:12, color:"#f87171" }}>{erro}</div>}
    </div>
  );

  const { novasRec, novasDesp } = preview;
  const itensRec  = filtroPrev !== "despesas" ? novasRec  : [];
  const itensDesp = filtroPrev !== "receitas" ? novasDesp : [];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8 }}>
        {[{ l:"Receitas", v:novasRec.length, c:"#4ade80" }, { l:"↑ Total", v:fmt(totalRec), c:"#4ade80" },
          { l:"Despesas", v:novasDesp.length, c:"#f87171" }, { l:"↓ Total", v:fmt(totalDesp), c:"#f87171" }]
          .map(s => (
          <div key={s.l} style={{ background:"#0d2018", border:`1.5px solid ${s.c}33`, borderRadius:10, padding:"10px 12px" }}>
            <div style={{ fontSize:10, color:"#8a7fa0", textTransform:"uppercase" }}>{s.l}</div>
            <div style={{ fontSize:16, fontWeight:800, color:s.c, marginTop:2 }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
        <span style={{ fontSize:11, color:"#6b5f80", fontWeight:700 }}>Visualizar:</span>
        {["todos","receitas","despesas"].map(f => (
          <button key={f} onClick={() => setFiltroPrev(f)}
            style={{ padding:"4px 12px", borderRadius:6, border:"1.5px solid "+(filtroPrev===f?"#c084fc":"#2d2640"), background:filtroPrev===f?"#2a1840":"none", color:filtroPrev===f?"#c084fc":"#6b5f80", cursor:"pointer", fontSize:11, fontWeight:700, textTransform:"capitalize" }}>
            {f}
          </button>
        ))}
        <span style={{ marginLeft:"auto", fontSize:11, color:"#8a7fa0" }}>{itensRec.length + itensDesp.length} lançamentos</span>
      </div>
      <div style={{ overflowX:"auto", borderRadius:12, border:"1.5px solid #2d2640", maxHeight:360, overflowY:"auto" }}>
        <table style={{ borderCollapse:"collapse", width:"100%", minWidth:600 }}>
          <thead>
            <tr style={{ background:"#1a1628", position:"sticky", top:0 }}>
              {["Tipo","Data","Descrição","Conta","Banco","Valor"].map(h => (
                <th key={h} style={{ ...cellS, color:"#8a7fa0", fontWeight:700, textTransform:"uppercase", fontSize:10, textAlign:h==="Valor"?"right":"left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {itensRec.map((r,i) => (
              <tr key={"r"+i} style={{ borderBottom:"1px solid #131020", background:i%2===0?"#0d0b15":"#100e1b" }}>
                <td style={cellS}><span style={{ background:"#14532d", color:"#4ade80", borderRadius:4, padding:"2px 6px", fontSize:10, fontWeight:700 }}>Receita</span></td>
                <td style={{ ...cellS, color:"#8a7fa0" }}>{fmtDate(r.data)}</td>
                <td style={{ ...cellS, color:"#c8b8e8", maxWidth:200, overflow:"hidden", textOverflow:"ellipsis" }}>{r.descricao}</td>
                <td style={{ ...cellS, color:"#6b5f80" }}>{r.conta||r.plano}</td>
                <td style={{ ...cellS, color:"#6b5f80" }}>{r.banco}</td>
                <td style={{ ...cellS, color:"#4ade80", fontWeight:800, textAlign:"right" }}>{fmt(r.valor)}</td>
              </tr>
            ))}
            {itensDesp.map((d,i) => (
              <tr key={"d"+i} style={{ borderBottom:"1px solid #131020", background:i%2===0?"#0d0b15":"#100e1b" }}>
                <td style={cellS}><span style={{ background:"#7f1d1d", color:"#f87171", borderRadius:4, padding:"2px 6px", fontSize:10, fontWeight:700 }}>Despesa</span></td>
                <td style={{ ...cellS, color:"#8a7fa0" }}>{fmtDate(d.data)}</td>
                <td style={{ ...cellS, color:"#c8b8e8", maxWidth:200, overflow:"hidden", textOverflow:"ellipsis" }}>{d.descricao}</td>
                <td style={{ ...cellS, color:"#6b5f80" }}>{d.conta||d.plano}</td>
                <td style={{ ...cellS, color:"#6b5f80" }}>{d.banco}</td>
                <td style={{ ...cellS, color:"#f87171", fontWeight:800, textAlign:"right" }}>{fmt(d.valor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end", alignItems:"center", paddingTop:8, borderTop:"1px solid #2d2640" }}>
        <button onClick={cancelar} style={{ padding:"9px 20px", borderRadius:8, border:"1.5px solid #2d2640", background:"none", color:"#8a7fa0", cursor:"pointer", fontSize:13, fontWeight:600 }}>
          ✕ Cancelar
        </button>
        <button onClick={confirmar} style={{ padding:"10px 28px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#166534,#15803d)", color:"#fff", cursor:"pointer", fontSize:13, fontWeight:800 }}>
          ✅ Confirmar e importar {novasRec.length + novasDesp.length} lançamentos
        </button>
      </div>
    </div>
  );
}

// ─── IMPORTAR IFOOD TIJUCA TAB ───────────────────────────────────────────────
function ImportarIFoodTab({ receitas, setReceitas, despesas, setDespesas, showToast, onRegistrar }) {
  const prefixo = "Pedido iFood TJK #";
  const jaImportado = receitas.some(r => r.descricao && r.descricao.startsWith(prefixo));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, padding:"14px 16px" }}>
        <div style={{ fontSize:15, fontWeight:800, color:"#f59e0b", marginBottom:4 }}>🍕 Importar iFood Tijuca — CNPJ 48.659.129</div>
        <div style={{ fontSize:12, color:"#8a7fa0", marginBottom:8 }}>Envie o relatório de conciliação do iFood para a unidade Tijuca.</div>
        <MesesImportados receitas={receitas} despesas={despesas}
          setReceitas={setReceitas} setDespesas={setDespesas} showToast={showToast}
          filtroRec={r => r.documento === "Extrato financeiro iFood" && r.banco === "iFood Pago - Tijuca"}
          filtroDesp={d => d.documento === "Extrato financeiro iFood" && d.banco === "iFood Pago - Tijuca"} />
        <div style={{ marginTop:8 }} />
        <UploadRelatorio
          tipo="ifood-tjk" cnpj="48.659.129" banco="iFood Pago - Tijuca"
          showToast={showToast} receitas={receitas} despesas={despesas}
          setReceitas={setReceitas} setDespesas={setDespesas} onRegistrar={onRegistrar}
        />
        {jaImportado && (
          <div style={{ marginTop:8, background:"#1c1505", border:"1px solid #b45309", borderRadius:8, padding:"10px 12px", fontSize:12, color:"#f59e0b", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
            <span>⚠️ Pedidos iFood Tijuca já importados. Remova duplicatas se necessário.</span>
            <button onClick={() => {
              const v = new Set(); const vd = new Set();
              setReceitas(receitas.filter(r => { if (!r.descricao?.startsWith(prefixo)) return true; if (v.has(r.descricao)) return false; v.add(r.descricao); return true; }));
              setDespesas(despesas.filter(d => { if (!d.descricao?.startsWith(prefixo)) return true; if (vd.has(d.descricao)) return false; vd.add(d.descricao); return true; }));
              showToast("🧹 Duplicatas iFood Tijuca removidas!", "ok");
            }} style={{ padding:"6px 14px", borderRadius:8, border:"none", background:"#b45309", color:"#fff", cursor:"pointer", fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>
              🧹 Remover duplicatas
            </button>
          </div>
        )}
      </div>
      <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, padding:"14px 16px", fontSize:12, color:"#6b5f80" }}>
        <div style={{ fontWeight:700, color:"#c084fc", marginBottom:6 }}>ℹ️ Formatos aceitos</div>
        <div style={{ fontFamily:"monospace", fontSize:11, color:"#a0f0a0", background:"#0d0b15", padding:"8px 12px", borderRadius:6 }}>
          Relatório de pedidos iFood · colunas: ID CURTO DO PEDIDO · DATA E HORA DO PEDIDO · VALOR DOS ITENS (R$) · TAXAS E COMISSOES (R$) · INCENTIVO PROMOCIONAL DA LOJA (R$) · TAXA DE SERVIÇO (R$)
        </div>
      </div>
    </div>
  );
}

// ─── IMPORTAR IFOOD HG TAB ────────────────────────────────────────────────────
function ImportarIFoodHGTab({ receitas, setReceitas, despesas, setDespesas, showToast, onRegistrar }) {
  const prefixo = "Pedido iFood HG #";
  const jaImportado = receitas.some(r => r.descricao && r.descricao.startsWith(prefixo));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, padding:"14px 16px" }}>
        <div style={{ fontSize:15, fontWeight:800, color:"#e85d8a", marginBottom:4 }}>🍕 Importar iFood Higienópolis — CNPJ 51.295.630</div>
        <div style={{ fontSize:12, color:"#8a7fa0", marginBottom:8 }}>Envie o relatório de conciliação do iFood para a unidade Higienópolis.</div>
        <MesesImportados receitas={receitas} despesas={despesas}
          setReceitas={setReceitas} setDespesas={setDespesas} showToast={showToast}
          filtroRec={r => r.documento === "Extrato financeiro iFood" && r.banco === "iFood Pago - Higienópolis"}
          filtroDesp={d => d.documento === "Extrato financeiro iFood" && d.banco === "iFood Pago - Higienópolis"} />
        <div style={{ marginTop:8 }} />
        <UploadRelatorio
          tipo="ifood-hg" cnpj="51.295.630" banco="iFood Pago - Higienópolis"
          showToast={showToast} receitas={receitas} despesas={despesas}
          setReceitas={setReceitas} setDespesas={setDespesas} onRegistrar={onRegistrar}
        />
        {jaImportado && (
          <div style={{ marginTop:8, background:"#1c0510", border:"1px solid #9f1239", borderRadius:8, padding:"10px 12px", fontSize:12, color:"#f43f5e", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
            <span>⚠️ Pedidos iFood HG já importados. Remova duplicatas se necessário.</span>
            <button onClick={() => {
              const v = new Set(); const vd = new Set();
              setReceitas(receitas.filter(r => { if (!r.descricao?.startsWith(prefixo)) return true; if (v.has(r.descricao)) return false; v.add(r.descricao); return true; }));
              setDespesas(despesas.filter(d => { if (!d.descricao?.startsWith(prefixo)) return true; if (vd.has(d.descricao)) return false; vd.add(d.descricao); return true; }));
              showToast("🧹 Duplicatas iFood HG removidas!", "ok");
            }} style={{ padding:"6px 14px", borderRadius:8, border:"none", background:"#9f1239", color:"#fff", cursor:"pointer", fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>
              🧹 Remover duplicatas
            </button>
          </div>
        )}
      </div>
      <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, padding:"14px 16px", fontSize:12, color:"#6b5f80" }}>
        <div style={{ fontWeight:700, color:"#c084fc", marginBottom:6 }}>ℹ️ Formatos aceitos</div>
        <div style={{ fontFamily:"monospace", fontSize:11, color:"#a0f0a0", background:"#0d0b15", padding:"8px 12px", borderRadius:6 }}>
          Relatório de pedidos iFood · colunas: ID CURTO DO PEDIDO · DATA E HORA DO PEDIDO · VALOR DOS ITENS (R$) · TAXAS E COMISSOES (R$) · INCENTIVO PROMOCIONAL DA LOJA (R$) · TAXA DE SERVIÇO (R$)
        </div>
      </div>
    </div>
  );
}

// ─── IMPORTAR 99FOOD HG TAB ───────────────────────────────────────────────────
function Importar99FoodTab({ receitas, setReceitas, despesas, setDespesas, showToast, onRegistrar }) {
  const prefixo = "Pedido 99Food HG #";
  const prefixoDia = "99Food HG ";
  const jaImportado = receitas.some(r => r.descricao && (r.descricao.startsWith(prefixo) || r.descricao.startsWith(prefixoDia)));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, padding:"14px 16px" }}>
        <div style={{ fontSize:15, fontWeight:800, color:"#f59e0b", marginBottom:4 }}>🛺 Importar 99Food HG — CNPJ 51.295.630</div>
        <div style={{ fontSize:12, color:"#8a7fa0", marginBottom:8 }}>Envie o relatório do 99Food para a unidade Higienópolis.</div>
        <MesesImportados receitas={receitas} despesas={despesas}
          setReceitas={setReceitas} setDespesas={setDespesas} showToast={showToast}
          filtroRec={r => r.documento === "Extrato financeiro 99Food" && r.banco === "99Food (Nubank - Ana)"}
          filtroDesp={d => d.documento === "Extrato financeiro 99Food" && d.banco === "99Food (Nubank - Ana)"} />
        <div style={{ marginTop:8 }} />
        <UploadRelatorio
          tipo="99food-hg" cnpj="51.295.630" banco="99Food (Nubank - Ana)"
          showToast={showToast} receitas={receitas} despesas={despesas}
          setReceitas={setReceitas} setDespesas={setDespesas} onRegistrar={onRegistrar}
        />
        {jaImportado && (
          <div style={{ marginTop:8, background:"#1c1505", border:"1px solid #b45309", borderRadius:8, padding:"10px 12px", fontSize:12, color:"#f59e0b", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
            <span>⚠️ Pedidos 99Food HG já importados. Remova duplicatas se necessário.</span>
            <button onClick={() => {
              const v = new Set(); const vd = new Set();
              setReceitas(receitas.filter(r => { if (!r.descricao?.startsWith(prefixo) && !r.descricao?.startsWith(prefixoDia)) return true; if (v.has(r.descricao)) return false; v.add(r.descricao); return true; }));
              setDespesas(despesas.filter(d => { if (!d.descricao?.startsWith(prefixo) && !d.descricao?.startsWith(prefixoDia)) return true; if (vd.has(d.descricao)) return false; vd.add(d.descricao); return true; }));
              showToast("🧹 Duplicatas 99Food HG removidas!", "ok");
            }} style={{ padding:"6px 14px", borderRadius:8, border:"none", background:"#b45309", color:"#fff", cursor:"pointer", fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>
              🧹 Remover duplicatas
            </button>
          </div>
        )}
      </div>
      <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, padding:"14px 16px", fontSize:12, color:"#6b5f80" }}>
        <div style={{ fontWeight:700, color:"#c084fc", marginBottom:6 }}>ℹ️ Formatos aceitos</div>
        <div style={{ fontFamily:"monospace", fontSize:11, color:"#a0f0a0", background:"#0d0b15", padding:"8px 12px", borderRadius:6, lineHeight:1.8 }}>
          Relatório por pedido: pedido · data · preco_original · comissao · oferta · logistica · entrega_gratis<br/>
          Relatório diário (Dados da loja): Data · Total de vendas realizadas · Receita total de vendas · Despesas de comissão da loja · Despesas de ofertas da loja
        </div>
      </div>
    </div>
  );
}


// ─── MESES IMPORTADOS POR BANCO (tabela compacta) ────────────────────────────
function MesesImportadosBancos({ bancos, receitas, despesas, setReceitas, setDespesas, showToast }) {
  const MESES_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const [confirmando, setConfirmando] = useState(null);
  const [previewMes,  setPreviewMes]  = useState(null); // { banco, mes, recs, desps }

  const fmtMes = (m) => {
    const [y, mo] = m.split("-");
    return `${MESES_PT[parseInt(mo) - 1]}/${y}`;
  };

  const DOCS_PLAT = ["Extrato financeiro iFood", "Extrato financeiro 99Food"];
  const isExtrato = x => !DOCS_PLAT.includes(x.documento);

  const bancosComDados = bancos.filter(b =>
    receitas.some(r => r.banco === b && isExtrato(r)) ||
    despesas.some(d => d.banco === b && isExtrato(d))
  );

  if (bancosComDados.length === 0) return null;

  const getMeses = (banco) => {
    const all = [
      ...receitas.filter(r => r.banco === banco && isExtrato(r)),
      ...despesas.filter(d => d.banco === banco && isExtrato(d)),
    ].map(x => (x.data || "").slice(0, 7)).filter(m => /^\d{4}-\d{2}$/.test(m));
    return [...new Set(all)].sort().reverse();
  };

  const SB_URL = "https://wmlecjrkqwoejuryeayz.supabase.co/rest/v1";
  const SB_KEY_V = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbGVjanJrcXdvZWp1cnllYXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDgyMDYsImV4cCI6MjA5MTMyNDIwNn0.SAYFGBZFjvLn9jIEs8J5mR93ZY7HlYQbT43YTn8JKnI";
  const SB_H = { "Content-Type":"application/json", "apikey":SB_KEY_V, "Authorization":"Bearer "+SB_KEY_V };

  const excluir = async (banco, mes) => {
    const novasRec  = receitas.filter(r => !(r.banco === banco && isExtrato(r) && (r.data||"").startsWith(mes)));
    const novasDesp = despesas.filter(d => !(d.banco === banco && isExtrato(d) && (d.data||"").startsWith(mes)));
    const qtdR = receitas.length - novasRec.length;
    const qtdD = despesas.length - novasDesp.length;
    setReceitas(novasRec); setDespesas(novasDesp); setConfirmando(null);
    const idsRecRem  = receitas.filter(r => !novasRec.find(x => x.id === r.id)).map(r => r.id);
    const idsDespRem = despesas.filter(d => !novasDesp.find(x => x.id === d.id)).map(d => d.id);
    try {
      for (const id of idsRecRem)  await fetch(`${SB_URL}/receitas?id=eq.${id}`,  { method:"DELETE", headers:SB_H });
      for (const id of idsDespRem) await fetch(`${SB_URL}/despesas?id=eq.${id}`, { method:"DELETE", headers:SB_H });
    } catch(e) { console.error("Erro ao sincronizar exclusão:", e); }
    showToast(`🗑 ${banco} · ${fmtMes(mes)} removido (${qtdR} rec, ${qtdD} desp)`, "del");
  };

  const abrirPreview = (banco, mes) => {
    const recs  = receitas.filter(r => r.banco === banco && isExtrato(r) && (r.data||"").startsWith(mes)).sort((a,b)=>(b.data||"").localeCompare(a.data||""));
    const desps = despesas.filter(d => d.banco === banco && isExtrato(d) && (d.data||"").startsWith(mes)).sort((a,b)=>(b.data||"").localeCompare(a.data||""));
    setPreviewMes({ banco, mes, recs, desps });
  };

  const isConfirmando = (banco, mes) =>
    confirmando && confirmando.banco === banco && confirmando.mes === mes;

  const totalRec  = previewMes ? previewMes.recs.reduce((s,r)=>s+Number(r.valor||0),0)  : 0;
  const totalDesp = previewMes ? previewMes.desps.reduce((s,d)=>s+Number(d.valor||0),0) : 0;

  return (
    <>
    <div style={{ background:"#0d0b15", border:"1.5px solid #2d2640", borderRadius:12, overflow:"hidden" }}>
      {/* Header */}
      <div style={{ padding:"10px 16px", borderBottom:"1px solid #1a1628", display:"flex", alignItems:"center", gap:8, background:"#100e1b" }}>
        <span style={{ fontSize:11, fontWeight:800, color:"#6b5f80", textTransform:"uppercase", letterSpacing:"0.08em" }}>
          📅 Meses importados por banco
        </span>
        <span style={{ fontSize:10, color:"#4a3f60" }}>— clique em 👁 para ver ou 🗑 para remover</span>
      </div>

      {/* Rows */}
      {bancosComDados.map((banco, bi) => {
        const meses = getMeses(banco);
        return (
          <div key={banco} style={{
            display:"grid",
            gridTemplateColumns:"200px 1fr",
            borderBottom: bi < bancosComDados.length - 1 ? "1px solid #13101e" : "none",
            minHeight:38,
          }}>
            {/* Banco */}
            <div style={{
              padding:"8px 14px",
              display:"flex", alignItems:"center",
              borderRight:"1px solid #1a1628",
              background:"#0d0b15",
            }}>
              <span style={{ fontSize:11, color:"#8a7fa0", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {banco}
              </span>
            </div>

            {/* Badges */}
            <div style={{
              padding:"7px 12px",
              display:"flex", alignItems:"center", flexWrap:"wrap", gap:5,
              background:"#0a0814",
            }}>
              {meses.length === 0
                ? <span style={{ fontSize:10, color:"#3a3050", fontStyle:"italic" }}>Sem dados</span>
                : meses.map(mes => (
                  isConfirmando(banco, mes)
                    ? <div key={mes} style={{
                        display:"inline-flex", alignItems:"center", gap:5,
                        background:"#1a0505", border:"1px solid #dc2626",
                        borderRadius:6, padding:"3px 8px",
                      }}>
                        <span style={{ fontSize:10, color:"#fca5a5", fontWeight:600, whiteSpace:"nowrap" }}>
                          Apagar {fmtMes(mes)}?
                        </span>
                        <button onClick={() => excluir(banco, mes)}
                          style={{ fontSize:10, fontWeight:800, background:"#dc2626", color:"#fff",
                            border:"none", borderRadius:4, padding:"1px 8px", cursor:"pointer", whiteSpace:"nowrap" }}>
                          Sim
                        </button>
                        <button onClick={() => setConfirmando(null)}
                          style={{ fontSize:11, background:"none", color:"#6b5f80", border:"none", cursor:"pointer", padding:"0 2px" }}>
                          ✕
                        </button>
                      </div>
                    : <div key={mes} style={{
                        display:"inline-flex", alignItems:"center", gap:0,
                        background:"#1e1a4e", border:"1px solid #3730a3",
                        borderRadius:6, overflow:"hidden",
                      }}>
                        <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", color:"#818cf8", whiteSpace:"nowrap" }}>
                          {fmtMes(mes)}
                        </span>
                        {/* 👁 Ver lançamentos */}
                        <button
                          onClick={() => abrirPreview(banco, mes)}
                          title={"Ver lançamentos de " + fmtMes(mes) + " — " + banco}
                          style={{ fontSize:11, background:"#1a1850", color:"#4ade80",
                            border:"none", borderLeft:"1px solid #3730a3",
                            padding:"3px 6px", cursor:"pointer",
                            display:"flex", alignItems:"center" }}>
                          👁
                        </button>
                        {/* 🗑 Excluir */}
                        <button
                          onClick={() => setConfirmando({ banco, mes })}
                          title={"Excluir " + fmtMes(mes) + " de " + banco}
                          style={{ fontSize:10, background:"#16124a", color:"#f87171",
                            border:"none", borderLeft:"1px solid #3730a3",
                            padding:"3px 6px", cursor:"pointer",
                            display:"flex", alignItems:"center" }}>
                          🗑
                        </button>
                      </div>
                ))
              }
            </div>
          </div>
        );
      })}

    {/* Modal de preview por banco */}
    {previewMes && (
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
        onClick={() => setPreviewMes(null)}>
        <div style={{ background:"#13101e", borderRadius:16, border:"1.5px solid #2d2640", width:"100%", maxWidth:720, maxHeight:"88vh", overflow:"hidden", display:"flex", flexDirection:"column" }}
          onClick={e => e.stopPropagation()}>
          <div style={{ padding:"14px 18px", borderBottom:"1px solid #2d2640", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#1a1628", flexShrink:0 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:800, color:"#c084fc" }}>{"👁 " + previewMes.banco + " — " + fmtMes(previewMes.mes)}</div>
              <div style={{ fontSize:11, color:"#6b5f80", marginTop:2 }}>{previewMes.recs.length} entradas · {previewMes.desps.length} saídas</div>
            </div>
            <button onClick={() => setPreviewMes(null)} style={{ background:"none", border:"none", color:"#8a7fa0", cursor:"pointer", fontSize:20, padding:"4px 8px" }}>✕</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, padding:"12px 16px", flexShrink:0, borderBottom:"1px solid #1a1628" }}>
            {[
              { l:"Entradas", v:previewMes.recs.length,  c:"#4ade80" },
              { l:"Total ↑",  v:fmt(totalRec),         c:"#f59e0b" },
              { l:"Saídas",  v:previewMes.desps.length, c:"#f87171" },
              { l:"Total ↓", v:fmt(totalDesp),         c:"#f87171" },
            ].map(k=>(
              <div key={k.l} style={{ background:"#0d0b15", border:"1px solid "+k.c+"33", borderRadius:8, padding:"8px 10px" }}>
                <div style={{ fontSize:9, color:"#6b5f80", textTransform:"uppercase", marginBottom:2 }}>{k.l}</div>
                <div style={{ fontSize:15, fontWeight:800, color:k.c }}>{k.v}</div>
              </div>
            ))}
          </div>
          <div style={{ overflowY:"auto", padding:"12px 16px", display:"flex", flexDirection:"column", gap:12 }}>
            {previewMes.recs.length > 0 && (
              <div>
                <div style={{ fontSize:11, fontWeight:800, color:"#4ade80", textTransform:"uppercase", marginBottom:6, display:"flex", justifyContent:"space-between" }}>
                  <span>{"↑ Entradas ("+previewMes.recs.length+")"}</span>
                  <span style={{ color:"#f59e0b" }}>{fmt(totalRec)}</span>
                </div>
                <div style={{ background:"#0d0b15", borderRadius:8, overflow:"hidden" }}>
                  {previewMes.recs.map((r,i)=>(
                    <div key={r.id} style={{ padding:"7px 12px", borderBottom:"1px solid #13101e", display:"flex", justifyContent:"space-between", alignItems:"center", background:i%2===0?"#0d0b15":"#100e1b" }}>
                      <div style={{ minWidth:0, flex:1 }}>
                        <div style={{ fontSize:11, color:"#c8b8e8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.descricao||r.conta||"—"}</div>
                        <div style={{ fontSize:10, color:"#4a3f60" }}>{fmtDate(r.data)+" · "+(r.documento||"—")}</div>
                      </div>
                      <div style={{ fontSize:12, fontWeight:800, color:"#4ade80", flexShrink:0, marginLeft:12 }}>{fmt(r.valor)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {previewMes.desps.length > 0 && (
              <div>
                <div style={{ fontSize:11, fontWeight:800, color:"#f87171", textTransform:"uppercase", marginBottom:6, display:"flex", justifyContent:"space-between" }}>
                  <span>{"↓ Saídas ("+previewMes.desps.length+")"}</span>
                  <span>{fmt(totalDesp)}</span>
                </div>
                <div style={{ background:"#0d0b15", borderRadius:8, overflow:"hidden" }}>
                  {previewMes.desps.map((d,i)=>(
                    <div key={d.id} style={{ padding:"7px 12px", borderBottom:"1px solid #13101e", display:"flex", justifyContent:"space-between", alignItems:"center", background:i%2===0?"#0d0b15":"#100e1b" }}>
                      <div style={{ minWidth:0, flex:1 }}>
                        <div style={{ fontSize:11, color:"#c8b8e8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.descricao||d.conta||"—"}</div>
                        <div style={{ fontSize:10, color:"#4a3f60" }}>{fmtDate(d.data)+" · "+(d.plano||d.documento||"—")}</div>
                      </div>
                      <div style={{ fontSize:12, fontWeight:800, color:"#f87171", flexShrink:0, marginLeft:12 }}>{"−"+fmt(d.valor)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {previewMes.recs.length===0 && previewMes.desps.length===0 && (
              <div style={{ textAlign:"center", color:"#4a3f60", padding:32, fontSize:12 }}>Nenhum lançamento encontrado.</div>
            )}
          </div>
        </div>
      </div>
    )}
    </div>

    </>
  );
}


// ─── IMPORTAR EXTRATOS BANCÁRIOS TAB ─────────────────────────────────────────
// ─── PDF EXTRATO: usa Claude API para extrair transações ─────────────────────
async function processarPDFExtrato(file) {
  // Converte PDF para base64
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 = btoa(bin);

  // Chama a Edge Function do Supabase (evita problema de CORS com a API Anthropic)
  const EDGE_URL = "https://wmlecjrkqwoejuryeayz.supabase.co/functions/v1/parse-pdf-extrato";
  const SB_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbGVjanJrcXdvZWp1cnllYXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDgyMDYsImV4cCI6MjA5MTMyNDIwNn0.SAYFGBZFjvLn9jIEs8J5mR93ZY7HlYQbT43YTn8JKnI";

  const resp = await fetch(EDGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + SB_KEY,
    },
    body: JSON.stringify({ pdf_base64: b64 })
  });

  const data = await resp.json();
  if (!resp.ok || data.error) throw new Error(data.error || "Erro ao processar PDF");
  return data.transacoes || [];
}


function ImportarExtratosTab({ receitas, setReceitas, despesas, setDespesas, transferencias, setTransferencias, bancos, bancoCnpj, catReceita, catDespesa, tiposDocto, showToast, onRegistrar }) {
  const [bancSel, setBancSel]   = useState("");
  const [arquivo, setArquivo]   = useState(null);
  const [status, setStatus]     = useState("idle");
  const [preview, setPreview]   = useState(null);
  const [erro, setErro]         = useState(null);
  const [filtroPrev, setFiltroPrev] = useState("todos");
  const [planoPadrao, setPlanoPadrao] = useState("");  // plano padrão para entradas
  const [contaPadrao, setContaPadrao] = useState("");

  const tipoExtrato = bancSel.toLowerCase().includes("mercado pago") ? "mp"
                    : bancSel.toLowerCase().includes("santander")     ? "santander"
                    : bancSel.toLowerCase().includes("c6")            ? "c6"
                    : "generico";

  // Detecta se uma descrição é uma transferência
  const isTransfDesc = (desc) => {
    const d = desc.toLowerCase();
    return d.includes("transferência") || d.includes("transferencia") || d.includes("ted ") || d.includes("doc ");
  };

  const processarExtrato = async (file) => {
    if (!bancSel) { showToast("❌ Selecione o banco primeiro!", "del"); return; }
    setStatus("lendo"); setPreview(null); setErro(null);
    try {
      const ts0 = Date.now();
      const linhas = [];

      // ── PDF: usa Claude API para extrair transações ──
      if (file.name.toLowerCase().endsWith(".pdf")) {
        if (tipoExtrato !== "mp") throw new Error("Importação de PDF disponível apenas para contas Mercado Pago.");
        showToast("🤖 Lendo PDF com IA — pode levar alguns segundos...", "ok");
        const transacoes = await processarPDFExtrato(file);
        if (!transacoes.length) throw new Error("Nenhuma transação encontrada no PDF.");
        transacoes.forEach((t, i) => {
          const data = t.data || "";
          const desc = String(t.descricao || "").trim();
          const valor = Math.abs(Number(t.valor) || 0);
          if (!data || valor === 0) return;
          const d2 = desc.toLowerCase();
          const isTransf = isTransfDesc(desc);
          const isRepasse2 = d2.includes("antecipação semanal") || d2.includes("antecipacao semanal")
            || d2.includes("repasse ifood") || d2.includes("repasse 99food")
            || d2.includes("nourishflow") || d2.includes("pluxee")
            || d2.includes("banco topazio") || d2.includes("99 food ltda")
            || d2.includes("repasse de plataforma");
          const docGen = isRepasse2 ? "Repasse de Plataforma"
            : d2.includes("liberação de dinheiro") || d2.includes("liberacao de dinheiro") ? "Link de Pagamento"
            : d2.startsWith("pix") || d2.includes("tuna pagamentos") ? "PIX"
            : d2.includes("boleto") ? "Boleto"
            : isTransf ? "Transferência" : "Transferência";
          linhas.push({
            id: ts0 + i * 10, data, descricao: desc, banco: bancSel, valor,
            tipo: t.tipo === "saida" ? "saida" : isTransf ? "transf" : "entrada",
            documento: docGen, plano: "", conta: "",
          });
        });
        if (!linhas.length) throw new Error("Nenhum lançamento válido encontrado no PDF.");
        setPreview({ linhas });
        setStatus("preview");
        showToast(`✅ PDF lido: ${linhas.length} lançamentos identificados`, "ok");
        return;
      }

      const rows = await lerXLSX(file);
      if (!rows.length) throw new Error("Nenhum dado encontrado na planilha");

      if (tipoExtrato === "mp") {
        let dataRows = rows;
        const temChaveCorreta = rows.length > 0 && "RELEASE_DATE" in rows[0];
        if (!temChaveCorreta) {
          const idxHeader = rows.findIndex(r => Object.values(r).some(v => String(v).trim() === "RELEASE_DATE"));
          if (idxHeader >= 0) {
            const newHeaders = Object.values(rows[idxHeader]).map(v => String(v ?? "").trim());
            dataRows = rows.slice(idxHeader + 1).map(row => {
              const vals = Object.values(row);
              const obj = {};
              newHeaders.forEach((h, i) => { if (h) obj[h] = vals[i] ?? ""; });
              return obj;
            });
          }
        }
        dataRows.forEach((row, i) => {
          const data  = parseDt(row["RELEASE_DATE"] || row["Data"] || "");
          if (!data || data.length < 8) return;
          const desc  = String(row["TRANSACTION_TYPE"] || row["Descrição"] || "").trim();
          const valor = rNum(row["TRANSACTION_NET_AMOUNT"] || row["Valor"] || 0);
          if (!desc || valor === 0) return;
          const isTransf = isTransfDesc(desc);
          const d2 = desc.toLowerCase();
          const isRepasse = d2.includes("antecipação semanal") || d2.includes("antecipacao semanal")
            || d2.includes("repasse ifood") || d2.includes("repasse 99food")
            || d2.includes("nourishflow")
            || d2.includes("pluxee")          // repasse vale-refeição via Pluxee
            || d2.includes("banco topazio")   // repasse via Banco Topázio
            || d2.includes("99 food ltda")    // repasse 99Food via PIX
            || d2.includes("repasse de plataforma");
          const docTipo = isRepasse ? "Repasse de Plataforma"
            : d2.includes("liberação de dinheiro") || d2.includes("liberacao de dinheiro") ? "Link de Pagamento"
            : d2.startsWith("pix") || d2.includes("tuna pagamentos") ? "PIX"
            : d2.includes("boleto") ? "Boleto"
            : d2.includes("ted") || d2.includes(" doc ") ? "Transferência"
            : isTransf ? "Transferência"
            : "Transferência";
          linhas.push({
            id: ts0 + i * 10, data, descricao: desc, banco: bancSel,
            valor: Math.abs(valor),
            tipo: isTransf ? "transf" : valor > 0 ? "entrada" : "saida",
            documento: docTipo,
            plano: "", conta: "",
          });
        });
      } else {
        const cData  = Object.keys(rows[0]).find(k => /data|date|dt_/i.test(k)) || "";
        const cDesc  = Object.keys(rows[0]).find(k => /descri|hist|memo|transac/i.test(k)) || "";
        const cValor = Object.keys(rows[0]).find(k => /valor|value|amount|net/i.test(k)) || "";
        const cCred  = Object.keys(rows[0]).find(k => /cred|entr|receb/i.test(k)) || "";
        const cDeb   = Object.keys(rows[0]).find(k => /debit|saida|saída|pago/i.test(k)) || "";
        rows.forEach((row, i) => {
          const data = parseDt(row[cData] || "");
          const desc = String(row[cDesc] || "").trim();
          if (!data || data.length < 8 || !desc) return;
          const isTransf = isTransfDesc(desc);
          const d2 = desc.toLowerCase();
          const isRepasse2 = d2.includes("antecipação semanal") || d2.includes("antecipacao semanal")
            || d2.includes("repasse ifood") || d2.includes("repasse 99food")
            || d2.includes("nourishflow")
            || d2.includes("pluxee")
            || d2.includes("banco topazio")
            || d2.includes("99 food ltda")
            || d2.includes("repasse de plataforma");
          const docGen = isRepasse2 ? "Repasse de Plataforma"
            : d2.includes("liberação de dinheiro") || d2.includes("liberacao de dinheiro") ? "Link de Pagamento"
            : d2.startsWith("pix") || d2.includes("tuna pagamentos") ? "PIX"
            : d2.includes("boleto") ? "Boleto"
            : isTransf ? "Transferência" : "Transferência";
          if (cValor) {
            const v = rNum(row[cValor]);
            if (v !== 0) linhas.push({ id: ts0+i*10, data, descricao: desc, banco: bancSel,
              valor: Math.abs(v), tipo: isTransf ? "transf" : v > 0 ? "entrada" : "saida",
              documento: docGen, plano: "", conta: "" });
          } else {
            const cr = rNum(row[cCred]), db = rNum(row[cDeb]);
            if (cr > 0) linhas.push({ id: ts0+i*10,   data, descricao: desc, banco: bancSel, valor: cr, tipo: isTransf?"transf":"entrada", documento:docGen, plano:"", conta:"" });
            if (db > 0) linhas.push({ id: ts0+i*10+1, data, descricao: desc, banco: bancSel, valor: db, tipo: isTransf?"transf":"saida",   documento:docGen, plano:"", conta:"" });
          }
        });
      }

      if (!linhas.length) throw new Error("Nenhum lançamento identificado. Verifique o arquivo ou o banco selecionado.");
      setPreview({ linhas });
      setStatus("preview");
    } catch (err) { setErro(err.message); setStatus("erro"); }
  };

  const updateLinha = (idx, field, value) => {
    setPreview(p => {
      const linhas = [...p.linhas];
      linhas[idx] = { ...linhas[idx], [field]: value };
      if (field === "plano") linhas[idx].conta = "";
      // Se o plano ou conta contiver "caixinha" e o banco selecionado for CNPJ 50.166.828,
      // redireciona automaticamente o lançamento para o banco "Caixinha"
      const cnpjDoBanco = (bancoCnpj || {})[bancSel] || "";
      if (cnpjDoBanco === "50.166.828") {
        const val = value.toLowerCase();
        if ((field === "plano" || field === "conta") && val.includes("caixinha")) {
          linhas[idx].banco = "Caixinha";
          linhas[idx]._redirecionado = true;
        }
      }
      return { ...p, linhas };
    });
  };

  // Aplica plano/conta padrão a todas as linhas de entrada sem categoria
  const aplicarPadrao = () => {
    if (!planoPadrao) return;
    const cnpjDoBanco = (bancoCnpj || {})[bancSel] || "";
    const isCaixinha = planoPadrao.toLowerCase().includes("caixinha") || contaPadrao.toLowerCase().includes("caixinha");
    setPreview(p => ({
      ...p,
      linhas: p.linhas.map(l =>
        l.tipo === "entrada" && !l.plano
          ? {
              ...l,
              plano: planoPadrao,
              conta: contaPadrao,
              banco: (cnpjDoBanco === "50.166.828" && isCaixinha) ? "Caixinha" : l.banco,
              _redirecionado: (cnpjDoBanco === "50.166.828" && isCaixinha) ? true : undefined,
            }
          : l
      )
    }));
  };

  const confirmar = () => {
    if (!preview) return;
    const { linhas } = preview;
    const ts = Date.now();
    const novasRec = [], novasDesp = [], novasTransf = [];

    linhas.forEach((l, i) => {
      const desc = rNum(l.desconto || 0);
      if (l.tipo === "entrada") {
        const valorBruto = l.valor + desc;
        const recId = l.id;
        novasRec.push({ id: recId, data: l.data, documento: l.documento, plano: l.plano, conta: l.conta,
          tipo: "Recorrente", descricao: l.descricao, banco: l.banco, valor: valorBruto,
          vencimento: l.data, recebimento: l.data });
        if (desc > 0) {
          novasDesp.push({ id: ts + i*100 + Math.floor(Math.random()*99), data: l.data, documento: "Ajuste",
            plano: "Despesas Financeiras", conta: "Taxas Bancárias",
            tipo: "Recorrente", descricao: "Desconto/Taxa — " + l.descricao,
            banco: l.banco, valor: desc, vencimento: l.data, pagamento: l.data,
            receita_id: recId }); // vínculo direto com a receita
        }
      } else if (l.tipo === "saida") {
        novasDesp.push({ id: l.id, data: l.data, documento: l.documento, plano: l.plano, conta: l.conta,
          tipo: "Recorrente", descricao: l.descricao, banco: l.banco, valor: l.valor,
          vencimento: l.data, pagamento: l.data });
      } else if (l.tipo === "transf") {
        novasTransf.push({ id: l.id, data: l.data, saidoBanco: l.banco, entrouBanco: l.destBanco || "", descricao: l.descricao, valor: l.valor });
      }
    });

    const idsR = new Set((receitas||[]).map(r => r.id));
    const idsD = new Set((despesas||[]).map(d => d.id));
    const idsT = new Set((transferencias||[]).map(t => t.id));

    const recFiltradas   = novasRec.filter(r => !idsR.has(r.id));
    const despFiltradas  = novasDesp.filter(d => !idsD.has(d.id));
    const transfFiltradas= novasTransf.filter(t => !idsT.has(t.id));

    if (recFiltradas.length)    setReceitas([...(receitas||[]), ...recFiltradas]);
    if (despFiltradas.length)   setDespesas([...(despesas||[]), ...despFiltradas]);
    if (transfFiltradas.length && setTransferencias) setTransferencias([...(transferencias||[]), ...transfFiltradas]);

    // Upsert direto no Supabase para garantir persistência (evita problema de stale state no sbSync)
    const SB_DIRECT = "https://wmlecjrkqwoejuryeayz.supabase.co/rest/v1";
    const SB_KEY_D = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbGVjanJrcXdvZWp1cnllYXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDgyMDYsImV4cCI6MjA5MTMyNDIwNn0.SAYFGBZFjvLn9jIEs8J5mR93ZY7HlYQbT43YTn8JKnI";
    const H_D = { "Content-Type":"application/json","apikey":SB_KEY_D,"Authorization":"Bearer "+SB_KEY_D,"Prefer":"resolution=merge-duplicates,return=minimal" };
    const upsertDireto = async (table, rows) => {
      if (!rows.length) return;
      for (let i = 0; i < rows.length; i += 500) {
        try {
          const res = await fetch(`${SB_DIRECT}/${table}`, { method:"POST", headers: H_D, body: JSON.stringify(rows.slice(i, i+500)) });
          if (!res.ok) console.error(`[upsert] ${table}:`, await res.text().catch(()=>""));
        } catch(e) { console.error(`[upsert] ${table} network:`, e); }
      }
    };
    upsertDireto("receitas", recFiltradas.map(r => ({ ...r, valor: Number(r.valor||0) })));
    upsertDireto("despesas", despFiltradas.map(d => ({ ...d, valor: Number(d.valor||0) })));
    if (transfFiltradas.length) {
      const tNorm = transfFiltradas.map(t => { const r={...t}; if(r.saidoBanco!==undefined){r.saidobanco=r.saidoBanco;delete r.saidoBanco;} if(r.entrouBanco!==undefined){r.entroubanco=r.entrouBanco;delete r.entrouBanco;} return r; });
      upsertDireto("transferencias", tNorm);
    }

    setStatus("importado"); setPreview(null);
    showToast(`✅ ${novasRec.length} entradas, ${novasDesp.length} saídas e ${novasTransf.length} transferências importadas!`, "ok");
    if (onRegistrar) {
      const datas = linhas.map(x => x.data).filter(Boolean).sort();
      const mesRef = datas.length ? datas[0].slice(0,7) : new Date().toISOString().slice(0,7);
      onRegistrar({ tipo: "extrato-" + tipoExtrato, banco: bancSel, mesReferencia: mesRef, nomeArquivo: arquivo?.name,
        qtdRec: novasRec.length, qtdDesp: novasDesp.length,
        totalRec: novasRec.reduce((s,r)=>s+r.valor,0), totalDesp: novasDesp.reduce((s,d)=>s+d.valor,0) });
    }
  };

  const cancelar = () => { setStatus("idle"); setPreview(null); };
  const cellS = { padding:"7px 10px", fontSize:11, borderBottom:"1px solid #1a1628", whiteSpace:"nowrap" };

  const linhasFiltradas = !preview ? [] : preview.linhas.filter(l =>
    filtroPrev === "todos" ? true : filtroPrev === "entradas" ? l.tipo === "entrada" : filtroPrev === "saidas" ? l.tipo === "saida" : l.tipo === "transf"
  );
  const totalRec   = !preview ? 0 : preview.linhas.filter(l=>l.tipo==="entrada").reduce((s,l)=>s+l.valor,0);
  const totalDesp  = !preview ? 0 : preview.linhas.filter(l=>l.tipo==="saida").reduce((s,l)=>s+l.valor,0);
  const totalTransf= !preview ? 0 : preview.linhas.filter(l=>l.tipo==="transf").length;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, paddingBottom:40 }}>
      <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, padding:"14px 16px" }}>
        <div style={{ fontSize:15, fontWeight:800, color:"#c084fc", marginBottom:4 }}>📄 Importar Extratos Bancários</div>
        <div style={{ fontSize:12, color:"#8a7fa0" }}>Selecione o banco e envie o extrato em <strong style={{color:"#c084fc"}}>.xlsx · .csv · .pdf</strong> — edite as categorias antes de confirmar. PDFs com layout de tabela são suportados.</div>
      </div>

      {/* Meses importados por banco */}
      <MesesImportadosBancos
        bancos={bancos} receitas={receitas} despesas={despesas}
        setReceitas={setReceitas} setDespesas={setDespesas} showToast={showToast}
      />

      {/* Seletor de banco */}
      <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, padding:"14px 16px", display:"flex", flexDirection:"column", gap:8 }}>
        <label style={{ fontSize:11, fontWeight:700, color:"#8a7fa0", textTransform:"uppercase" }}>🏦 Selecionar banco</label>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:8 }}>
          {bancos.map(b => (
            <button key={b} onClick={() => { setBancSel(b); setStatus("idle"); setPreview(null); }}
              style={{ padding:"10px 14px", borderRadius:10, border:"1.5px solid "+(bancSel===b?"#c084fc":"#2d2640"),
                background: bancSel===b?"#2a1840":"#1a1628", color:bancSel===b?"#f0e8ff":"#8a7fa0",
                cursor:"pointer", fontSize:12, fontWeight: bancSel===b?700:400, textAlign:"left" }}>
              {bancSel===b ? "✓ " : ""}{b}
            </button>
          ))}
        </div>
      </div>

      {/* Upload */}
      {bancSel && status !== "preview" && (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <label style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            padding:"14px 20px", borderRadius:10, cursor: status==="lendo"?"wait":"pointer",
            border:"2px dashed "+(status==="importado"?"#4ade80":status==="erro"?"#f87171":"#c084fc"),
            background:"#1a1028", color: status==="importado"?"#4ade80":status==="erro"?"#f87171":"#c084fc",
            fontWeight:800, fontSize:13 }}>
            {status==="lendo"?"⏳ Lendo arquivo...":status==="importado"?"✅ Importado! Enviar outro extrato":status==="erro"?"❌ Erro — tentar novamente":`📂 Selecionar extrato — ${bancSel}`}
            <input type="file"
              accept=".xlsx,.xls,.csv,.pdf"
              style={{ display:"none" }} disabled={status==="lendo"}
              onChange={e => { const f=e.target.files[0]; if(f){setArquivo(f); processarExtrato(f);} e.target.value=""; }} />
          </label>
          {status==="erro" && <div style={{ background:"#2e0d0d", border:"1px solid #7f1d1d", borderRadius:8, padding:"10px 14px", fontSize:12, color:"#f87171" }}>{erro}</div>}
          {tipoExtrato === "mp" && status !== "erro" && (
            <div style={{ display:"flex", gap:6, alignItems:"center", fontSize:10, color:"#4a3f60", padding:"4px 8px" }}>
              <span>📄</span>
              <span>Aceita <strong style={{color:"#8a7fa0"}}>.xlsx · .csv · .pdf</strong> — o PDF é processado automaticamente pela IA</span>
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      {status === "preview" && preview && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {/* Cards */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8 }}>
            {[{l:"Entradas",v:preview.linhas.filter(l=>l.tipo==="entrada").length,c:"#4ade80"},
              {l:"↑ Total",v:fmt(totalRec),c:"#4ade80"},
              {l:"Saídas",v:preview.linhas.filter(l=>l.tipo==="saida").length,c:"#f87171"},
              {l:"⇌ Transf.",v:totalTransf,c:"#818cf8"}].map(s=>(
              <div key={s.l} style={{ background:"#0d0b15", border:`1.5px solid ${s.c}33`, borderRadius:10, padding:"10px 12px" }}>
                <div style={{ fontSize:10, color:"#8a7fa0", textTransform:"uppercase" }}>{s.l}</div>
                <div style={{ fontSize:16, fontWeight:800, color:s.c, marginTop:2 }}>{s.v}</div>
              </div>
            ))}
          </div>

          {/* Plano padrão para entradas */}
          <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, padding:"12px 14px" }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#c084fc", marginBottom:8 }}>🏷 Categoria padrão para entradas (opcional)</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:8, alignItems:"flex-end" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                <label style={{ fontSize:10, color:"#6b5f80", fontWeight:600, textTransform:"uppercase" }}>Plano de Conta</label>
                <select value={planoPadrao} onChange={e=>{setPlanoPadrao(e.target.value); setContaPadrao("");}}
                  style={{ ...iStyle, fontSize:12, padding:"6px 8px", cursor:"pointer" }}>
                  <option value="">Sem padrão</option>
                  {Object.keys(catReceita).map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                <label style={{ fontSize:10, color:"#6b5f80", fontWeight:600, textTransform:"uppercase" }}>Subcategoria</label>
                <select value={contaPadrao} onChange={e=>setContaPadrao(e.target.value)}
                  style={{ ...iStyle, fontSize:12, padding:"6px 8px", cursor:"pointer" }} disabled={!planoPadrao}>
                  <option value="">Sem padrão</option>
                  {(catReceita[planoPadrao]||[]).map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button onClick={aplicarPadrao} disabled={!planoPadrao}
                style={{ padding:"6px 14px", borderRadius:8, border:"none", background:planoPadrao?"#581c87":"#2d2640", color:planoPadrao?"#e9d5ff":"#4a3f60", cursor:planoPadrao?"pointer":"default", fontSize:12, fontWeight:700 }}>
                ✓ Aplicar em todas as entradas sem categoria
              </button>
            </div>
          </div>

          {/* Filtro */}
          <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
            <span style={{ fontSize:11, color:"#6b5f80", fontWeight:700 }}>Visualizar:</span>
            {[["todos","Todos"],["entradas","Entradas"],["saidas","Saídas"],["transf","Transferências"]].map(([f,l])=>(
              <button key={f} onClick={()=>setFiltroPrev(f)}
                style={{ padding:"4px 12px", borderRadius:6, border:"1.5px solid "+(filtroPrev===f?"#c084fc":"#2d2640"),
                  background:filtroPrev===f?"#2a1840":"none", color:filtroPrev===f?"#c084fc":"#6b5f80",
                  cursor:"pointer", fontSize:11, fontWeight:700 }}>
                {l}
              </button>
            ))}
            <span style={{ marginLeft:"auto", fontSize:11, color:"#8a7fa0" }}>{linhasFiltradas.length} lançamentos</span>
          </div>

          {/* Tabela editável */}
          <div style={{ overflowX:"auto", borderRadius:12, border:"1.5px solid #2d2640", maxHeight:500, overflowY:"auto" }}>
            <table style={{ borderCollapse:"collapse", width:"100%", minWidth:1050 }}>
              <thead>
                <tr style={{ background:"#1a1628", position:"sticky", top:0, zIndex:1 }}>
                  {["Tipo","Data","Descrição","Documento","Plano de Conta","Subcategoria","Desconto (R$)","Valor","Ações"].map(h=>(
                    <th key={h} style={{ ...cellS, color:"#8a7fa0", fontWeight:700, textTransform:"uppercase", fontSize:10,
                      textAlign:(h==="Valor"||h==="Desconto (R$)")?"right":"left", padding:"9px 10px", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {linhasFiltradas.map((l, vi) => {
                  const realIdx = preview.linhas.findIndex(x => x.id === l.id);
                  const planoOpts = l.tipo === "entrada" ? Object.keys(catReceita) : Object.keys(catDespesa);
                  const contaOpts = l.tipo === "entrada" ? (catReceita[l.plano]||[]) : (catDespesa[l.plano]||[]);
                  const cor = l.tipo==="entrada"?"#4ade80":l.tipo==="saida"?"#f87171":"#818cf8";
                  const badge = l.tipo==="entrada"?{bg:"#14532d",c:"#4ade80"}:l.tipo==="saida"?{bg:"#7f1d1d",c:"#f87171"}:{bg:"#1e1b4b",c:"#818cf8"};
                  const desc = rNum(l.desconto||0);
                  return (
                    <tr key={l.id} style={{ borderBottom:"1px solid #131020", background:vi%2===0?"#0d0b15":"#100e1b" }}>
                      <td style={{...cellS, whiteSpace:"nowrap"}}>
                        <select value={l.tipo} onChange={e=>updateLinha(realIdx,"tipo",e.target.value)}
                          style={{ background:badge.bg, color:badge.c, border:"none", borderRadius:4, padding:"2px 6px", fontSize:10, fontWeight:700, cursor:"pointer" }}>
                          <option value="entrada">Entrada</option>
                          <option value="saida">Saída</option>
                          <option value="transf">Transf.</option>
                        </select>
                      </td>
                      <td style={{ ...cellS, color:"#8a7fa0", whiteSpace:"nowrap" }}>{fmtDate(l.data)}</td>
                      <td style={{ ...cellS, color:"#c8b8e8", maxWidth:200 }} title={l.descricao}>
                        <div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l.descricao}</div>
                        {l._redirecionado && (
                          <div style={{ fontSize:9, color:"#f59e0b", fontWeight:700, marginTop:1 }}>
                            🏦 → {l.banco}
                          </div>
                        )}
                        {!l._redirecionado && l.banco !== bancSel && l.banco && (
                          <div style={{ fontSize:9, color:"#818cf8", fontWeight:700, marginTop:1 }}>
                            🏦 → {l.banco}
                          </div>
                        )}
                      </td>
                      <td style={cellS}>
                        <select value={l.documento||""} onChange={e=>updateLinha(realIdx,"documento",e.target.value)}
                          style={{ ...iStyle, fontSize:11, padding:"3px 6px", cursor:"pointer", minWidth:90 }}>
                          {(tiposDocto||TIPOS_DOCTO).map(t=><option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                      <td style={cellS}>
                        {l.tipo === "transf"
                          ? <select value={l.destBanco||""} onChange={e=>updateLinha(realIdx,"destBanco",e.target.value)}
                              style={{ ...iStyle, fontSize:11, padding:"3px 6px", cursor:"pointer", maxWidth:150 }}>
                              <option value="">Banco destino...</option>
                              {bancos.map(b=><option key={b} value={b}>{b}</option>)}
                            </select>
                          : <select value={l.plano} onChange={e=>updateLinha(realIdx,"plano",e.target.value)}
                              style={{ ...iStyle, fontSize:11, padding:"3px 6px", cursor:"pointer", maxWidth:160, borderColor:l.plano?"":"#b45309" }}>
                              <option value="">Selecionar...</option>
                              {planoOpts.map(p=><option key={p} value={p}>{p}</option>)}
                            </select>
                        }
                      </td>
                      <td style={cellS}>
                        {l.tipo==="transf" || !l.plano
                          ? <span style={{ fontSize:11, color:"#4a3f60" }}>—</span>
                          : <select value={l.conta} onChange={e=>updateLinha(realIdx,"conta",e.target.value)}
                              style={{ ...iStyle, fontSize:11, padding:"3px 6px", cursor:"pointer", maxWidth:140 }}>
                              <option value="">Selecionar...</option>
                              {contaOpts.map(c=><option key={c} value={c}>{c}</option>)}
                            </select>
                        }
                      </td>
                      <td style={{ ...cellS, textAlign:"right", background: desc>0?"#1a1100":"transparent" }}>
                        {l.tipo === "entrada" ? (
                          <div style={{ display:"flex", flexDirection:"column", gap:2, alignItems:"flex-end" }}>
                            <input value={l.desconto||""} onChange={e=>updateLinha(realIdx,"desconto",e.target.value)}
                              placeholder="0,00" title="Taxa deduzida antes do depósito (será registrada como despesa)"
                              style={{ ...iStyle, fontSize:11, padding:"3px 6px", width:75, textAlign:"right",
                                borderColor: desc>0?"#f59e0b":"#2d2640", background: desc>0?"#1c1200":"#0e0c18" }} />
                            {desc>0 && <span style={{ fontSize:9, color:"#f59e0b", whiteSpace:"nowrap" }}>↓ despesa: {fmt(desc)}</span>}
                          </div>
                        ) : <span style={{ fontSize:11, color:"#4a3f60" }}>—</span>}
                      </td>
                      <td style={{ ...cellS, fontWeight:800, textAlign:"right", whiteSpace:"nowrap", background: desc>0?"#0a1a00":"transparent" }}>
                        {desc>0 ? (
                          <div style={{ display:"flex", flexDirection:"column", gap:1, alignItems:"flex-end" }}>
                            <span style={{ color:"#4ade80", fontSize:12 }}>{fmt(l.valor + desc)}</span>
                            <span style={{ fontSize:9, color:"#6b9a6b" }}>bruto</span>
                          </div>
                        ) : (
                          <span style={{ color:cor }}>{fmt(l.valor)}</span>
                        )}
                      </td>
                      <td style={{ ...cellS, textAlign:"center" }}>
                        <button onClick={()=>{
                          setPreview(p=>({...p,linhas:p.linhas.filter((_,i)=>i!==realIdx)}));
                        }} style={{ background:"none", border:"1px solid #3a1a1a", borderRadius:4, color:"#f87171", cursor:"pointer", padding:"2px 6px", fontSize:11 }}>🗑</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Resumo descontos */}
          {(() => {
            const linhasComDesc = preview.linhas.filter(l => rNum(l.desconto||0) > 0);
            if (linhasComDesc.length === 0) return null;
            const totalDesc = linhasComDesc.reduce((s,l) => s + rNum(l.desconto||0), 0);
            const totalBruto = linhasComDesc.reduce((s,l) => s + l.valor + rNum(l.desconto||0), 0);
            return (
              <div style={{ background:"#1a1100", border:"1.5px solid #b45309", borderRadius:10, padding:"10px 14px", display:"flex", gap:16, alignItems:"center", flexWrap:"wrap" }}>
                <span style={{ fontSize:11, fontWeight:700, color:"#f59e0b" }}>💰 Descontos aplicados:</span>
                <span style={{ fontSize:11, color:"#c8b8e8" }}>{linhasComDesc.length} linha{linhasComDesc.length>1?"s":""}</span>
                <span style={{ fontSize:11, color:"#f87171" }}>Total descontos: <strong>{fmt(totalDesc)}</strong> → criados como despesa em <em>Despesas Financeiras / Taxas Bancárias</em></span>
                <span style={{ fontSize:11, color:"#4ade80" }}>Valor bruto total: <strong>{fmt(totalBruto)}</strong></span>
              </div>
            );
          })()}

          {/* Botões */}
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", alignItems:"center", paddingTop:8, borderTop:"1px solid #2d2640" }}>
            <button onClick={cancelar} style={{ padding:"9px 20px", borderRadius:8, border:"1.5px solid #2d2640", background:"none", color:"#8a7fa0", cursor:"pointer", fontSize:13, fontWeight:600 }}>
              ✕ Cancelar
            </button>
            <button onClick={confirmar} style={{ padding:"10px 28px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#166534,#15803d)", color:"#fff", cursor:"pointer", fontSize:13, fontWeight:800 }}>
              ✅ Confirmar {preview.linhas.length} lançamentos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Importar99FoodTJKTab({ receitas, setReceitas, despesas, setDespesas, showToast, onRegistrar }) {
  const [importado, setImportado] = useState(false);

  const jaImportado = receitas.some(r => r.descricao && r.descricao.startsWith("Pedido 99Food TJK #"));

  const selStyle = { padding:"5px 8px", borderRadius:6, border:"1.5px solid #2d2640", background:"#0e0c18", color:"#f0e8ff", fontSize:11, outline:"none" };

  if (importado) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40, gap:16, textAlign:"center" }}>
      <div style={{ fontSize:52 }}>✅</div>
      <div style={{ fontSize:18, fontWeight:800, color:"#4ade80" }}>99Food Tijuca importado!</div>
      <div style={{ fontSize:13, color:"#8a7fa0" }}>Os pedidos já estão nas abas de Receitas e Despesas.</div>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, paddingBottom:80 }}>
      <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, padding:"14px 16px" }}>
        <div style={{ fontSize:15, fontWeight:800, color:"#f59e0b", marginBottom:4 }}>🛺 Importar 99Food Tijuca — CNPJ 48.659.129</div>
        <div style={{ fontSize:12, color:"#8a7fa0", marginBottom:8 }}>
          Envie o relatório de conciliação do 99Food para a unidade Tijuca. Os dados serão salvos diretamente no banco.
        </div>
        <MesesImportados receitas={receitas} despesas={despesas}
          setReceitas={setReceitas} setDespesas={setDespesas} showToast={showToast}
          filtroRec={r => r.documento === "Extrato financeiro 99Food" && r.banco === "99Food (Mercado Pago - Luis)"}
          filtroDesp={d => d.documento === "Extrato financeiro 99Food" && d.banco === "99Food (Mercado Pago - Luis)"} />
        <div style={{ marginTop:8 }} />
        <UploadRelatorio
          tipo="99food-tjk" cnpj="48.659.129" banco="99Food (Mercado Pago - Luis)"
          showToast={showToast} receitas={receitas} despesas={despesas}
          setReceitas={setReceitas} setDespesas={setDespesas}
          onImportado={() => setImportado(true)} onRegistrar={onRegistrar}
        />
        {jaImportado && (
          <div style={{ marginTop:8, background:"#1c1505", border:"1px solid #b45309", borderRadius:8, padding:"10px 12px", fontSize:12, color:"#f59e0b", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
            <span>⚠️ Pedidos 99Food Tijuca já foram importados. Clique para remover duplicatas.</span>
            <button onClick={() => {
              const vistos = new Set();
              const recSemDup = receitas.filter(r => {
                if (!r.descricao || !r.descricao.startsWith("Pedido 99Food TJK #")) return true;
                if (vistos.has(r.descricao)) return false;
                vistos.add(r.descricao); return true;
              });
              const vistosD = new Set();
              const despSemDup = despesas.filter(d => {
                if (!d.descricao || !d.descricao.startsWith("Pedido 99Food TJK #")) return true;
                if (vistosD.has(d.descricao)) return false;
                vistosD.add(d.descricao); return true;
              });
              setReceitas(recSemDup); setDespesas(despSemDup);
              showToast("🧹 Duplicatas do 99Food Tijuca removidas!", "ok");
            }}
              style={{ padding:"6px 14px", borderRadius:8, border:"none", background:"#b45309", color:"#fff", cursor:"pointer", fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>
              🧹 Remover duplicatas
            </button>
          </div>
        )}
      </div>

      <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:12, padding:"16px" }}>
        <div style={{ fontSize:13, color:"#8a7fa0", lineHeight:1.7 }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#c084fc", marginBottom:8 }}>ℹ️ Estrutura esperada do arquivo</div>
          <div>O relatório deve ter as colunas do sistema 99Food:</div>
          <div style={{ marginTop:6, fontFamily:"monospace", fontSize:11, color:"#a0f0a0", background:"#0d0b15", padding:"8px 12px", borderRadius:6 }}>
            pedido · data · preco_original · comissao · oferta · logistica · entrega_gratis
          </div>
          <div style={{ marginTop:8, color:"#6b5f80", fontSize:11 }}>
            Receitas → plano "Receita com CNPJ 48.659.129" · conta "99Food" · banco "99Food (Mercado Pago - Luis)"<br/>
            Despesas → plano "Despesas com Taxas" · contas de comissão/logística 99Food Tijuca
          </div>
        </div>
      </div>
    </div>
  );
}


function App() {
  // ── UI state (not persisted) ──────────────────────────────────────────────
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(false);
  const [cleanMode, setCleanMode] = useState(false);
  const [hideValues, setHideValues] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  // On mobile: sidebar starts closed
  useEffect(() => { if (isMobile) setSidebarOpen(false); }, [isMobile]);
  const [dashDe, setDashDe] = useState("");   // filtro data dashboard
  const [dashAte, setDashAte] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [relatorioAtivo, setRelatorioAtivo] = useState(null);
  const [modal, setModal] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [filtro, setFiltro] = useState("");

  // ── Auth state ────────────────────────────────────────────────────────────
  const [authStatus, setAuthStatus] = useState("loading"); // "loading" | "setup" | "locked" | "unlocked"
  const [senhaHash, setSenhaHash] = useState(null);
  const [modalSenha, setModalSenha] = useState(false);
  const inactivityTimer = useRef(null);
  const INACTIVITY_MS = 10 * 60 * 1000; // 10 minutes

  // ── Data state (persisted in Supabase) ───────────────────────────────────
  const [historicoImport, setHistoricoImport] = useState([]);
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [transferencias, setTransferencias] = useState([]);
  const [catReceita, setCatReceita] = useState(CAT_RECEITA_INICIAL);
  const [catDespesa, setCatDespesa] = useState(CAT_DESPESA_INICIAL);
  const [bancos, setBancos] = useState(BANCOS_INICIAL);
  const [bancoCnpj, setBancoCnpj] = useState({}); // { "Banco X": "50.166.828" }
  const [saldos, setSaldos] = useState(SALDOS_INICIAIS_DEFAULT);
  const [fornecedores, setFornecedores] = useState(FORNECEDORES_INICIAIS);
  const [metas, setMetas] = useState(METAS_INICIAIS);
  const [tiposDocto, setTiposDocto] = useState(TIPOS_DOCTO);
  const [insumos,     setInsumos]     = useState(INSUMOS_PLANILHA); // fallback para planilha, substituto pelo banco
  const [compras,     setCompras]     = useState([]);
  const [receitasProd, setReceitasProd] = useState([]); // receitas_base de produção (≠ receitas financeiras)
  const [recIngredientes, setRecIngredientes] = useState([]); // receita_ingredientes — mantido para recalcular custos
  const [precifConfig, setPrecifConfig] = useState({ despesasFixas: 7836.03, pontoEquilibrio: 14145, margemMedia: 55.4 });

  // ── SUPABASE REST DIRETO (RLS protege acesso sem o segredo) ─────────────
  const SB = "https://wmlecjrkqwoejuryeayz.supabase.co/rest/v1";
  const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbGVjanJrcXdvZWp1cnllYXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDgyMDYsImV4cCI6MjA5MTMyNDIwNn0.SAYFGBZFjvLn9jIEs8J5mR93ZY7HlYQbT43YTn8JKnI";
  const H = { "Content-Type": "application/json", "apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY };

  // window.storage como fallback local
  const wSet = async (key, value) => { try { await window.storage.set(key, JSON.stringify(value)); } catch {} };
  const wGet = async (key) => { try { const r = await window.storage.get(key); return r?.value ? JSON.parse(r.value) : null; } catch { return null; } };

  // Supabase: busca tabela inteira
  const sbList = async (table) => {
    try {
      const r = await fetch(SB + "/" + table + "?select=*&order=id.asc&limit=10000", { headers: H });
      if (!r.ok) return null;
      const d = await r.json();
      return Array.isArray(d) && d.length > 0 ? d : null;
    } catch { return null; }
  };

  // Supabase: busca config
  const sbGetCfg = async (key) => {
    try {
      const r = await fetch(SB + "/config?key=eq." + encodeURIComponent(key) + "&select=value", { headers: H });
      if (!r.ok) return null;
      const d = await r.json();
      return d.length ? JSON.parse(d[0].value) : null;
    } catch { return null; }
  };

  // Supabase: salva config (upsert)
  const sbSetCfg = async (key, value) => {
    try {
      await fetch(SB + "/config", {
        method: "POST",
        headers: { ...H, "Prefer": "resolution=merge-duplicates" },
        body: JSON.stringify({ key, value: JSON.stringify(value) })
      });
    } catch {}
    await wSet("dl_" + key.replace("dl_",""), value); // fallback local
  };

  // Supabase: sincroniza tabela via UPSERT (nunca deleta tudo — evita perda de dados)
  const sbSync = async (table, rows) => {
    try {
      if (rows.length > 0) {
        const normalized = rows.map(r => {
          const row = { ...r, valor: Number(r.valor || 0) };
          if (table === "transferencias") {
            if (row.saidoBanco !== undefined) { row.saidobanco = row.saidoBanco; delete row.saidoBanco; }
            if (row.entrouBanco !== undefined) { row.entroubanco = row.entrouBanco; delete row.entrouBanco; }
          }
          return row;
        });
        // Chunks de 500 para não exceder limite da API
        for (let i = 0; i < normalized.length; i += 500) {
          const res = await fetch(SB + "/" + table, {
            method: "POST",
            headers: { ...H, "Prefer": "resolution=merge-duplicates,return=minimal" },
            body: JSON.stringify(normalized.slice(i, i + 500))
          });
          if (!res.ok) {
            const txt = await res.text().catch(() => "");
            console.error(`[sbSync] ${table} chunk ${i} → HTTP ${res.status}:`, txt);
          }
        }
      }
    } catch(e) { console.error("[sbSync] network error:", table, e); }
    await wSet("dl_" + table, rows); // fallback local
  };

  // Deleta um registro específico pelo ID (para remoções unitárias)
  const sbDelete = async (table, id) => {
    try {
      const res = await fetch(`${SB}/${table}?id=eq.${id}`, { method: "DELETE", headers: H });
      if (!res.ok) console.error(`[sbDelete] ${table}/${id} → HTTP ${res.status}`);
    } catch(e) { console.error("[sbDelete] network error:", table, id, e); }
  };

  // Atualiza UM registro pelo ID via PATCH (para edições unitárias)
  const sbPatch = async (table, id, fields) => {
    try {
      // Colunas válidas por tabela — evita rejeição por campos extras do formulário
      const COLS = {
        receitas:  ["data","documento","plano","conta","tipo","descricao","banco","valor","vencimento","recebimento"],
        despesas:  ["data","documento","plano","conta","tipo","descricao","banco","valor","vencimento","pagamento","receita_id"],
      };
      const allowed = COLS[table] || Object.keys(fields).filter(k => k !== "id");
      const body = {};
      allowed.forEach(k => { if (fields[k] !== undefined) body[k] = fields[k]; });
      if (body.valor !== undefined) body.valor = Number(body.valor);

      const res = await fetch(`${SB}/${table}?id=eq.${id}`, {
        method: "PATCH",
        headers: { ...H, "Prefer": "return=minimal" },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error(`[sbPatch] ${table}/${id} → HTTP ${res.status}:`, txt);
      } else {
        console.log(`[sbPatch] ${table}/${id} OK — plano="${body.plano}" conta="${body.conta}"`);
      }
    } catch(e) { console.error("[sbPatch] network error:", table, id, e); }
  };

  // ── Load: tenta Supabase, cai no window.storage, cai nos defaults ──────────
  useEffect(() => {
    (async () => {
      const [recSB, despSB, hisSB, tvSB, crSB, cdSB, bSB, bcSB, sSB, fSB, mSB, tdSB, phSB, insSB, compSB, recBasesSB, recIngsSB, pcSB] = await Promise.all([
        sbList("receitas"), sbList("despesas"), sbList("historico_importacoes"),
        sbGetCfg("dl_transferencias"), sbGetCfg("dl_catReceita"), sbGetCfg("dl_catDespesa"),
        sbGetCfg("dl_bancos"), sbGetCfg("dl_bancoCnpj"), sbGetCfg("dl_saldos"), sbGetCfg("dl_fornecedores"),
        sbGetCfg("dl_metas"), sbGetCfg("dl_tiposDocto"), sbGetCfg("dl_senha_hash"),
        sbList("insumos"), sbList("compras"), sbList("receitas_base"), sbList("receita_ingredientes"),
        sbGetCfg("dl_precifConfig"),
      ]);

      // Fallback local para configs não encontradas no Supabase
      const tv  = tvSB  ?? await wGet("dl_transferencias") ?? TRANSFERENCIAS_INICIAIS;
      const crv = crSB  ?? await wGet("dl_catReceita")     ?? CAT_RECEITA_INICIAL;
      const cdv = cdSB  ?? await wGet("dl_catDespesa")     ?? CAT_DESPESA_INICIAL;
      const bv  = bSB   ?? await wGet("dl_bancos")         ?? BANCOS_INICIAL;
      const bcv = bcSB  ?? await wGet("dl_bancoCnpj")     ?? {};
      const sv  = sSB   ?? await wGet("dl_saldos")         ?? SALDOS_INICIAIS_DEFAULT;
      const fv  = fSB   ?? await wGet("dl_fornecedores")   ?? FORNECEDORES_INICIAIS;
      const mv  = mSB   ?? await wGet("dl_metas")          ?? METAS_INICIAIS;
      const tdv = tdSB  ?? await wGet("dl_tiposDocto")    ?? TIPOS_DOCTO;
      const phv = phSB  ?? await wGet("dl_senha_hash")     ?? null;

      // Receitas e despesas financeiras: SOMENTE do Supabase — sem fallback local
      setReceitas(recSB ?? []);
      setDespesas(despSB ?? []);
      setHistoricoImport(hisSB ?? []);
      setTransferencias(tv); setCatReceita(crv); setCatDespesa(cdv);
      setBancos(bv); setBancoCnpj(bcv); setSaldos(sv); setFornecedores(fv); setMetas(mv); setTiposDocto(tdv);
      setSenhaHash(phv);
      if (pcSB) setPrecifConfig(pcSB);
      // Insumos: usa banco se disponível, caso contrário fallback para planilha
      if (insSB?.length) setInsumos(insSB.map(i=>({...i, preco: Number(i.preco||0)})));
      if (compSB?.length) setCompras(compSB);
      // Carregar receitas com custo calculado
      if (recBasesSB?.length) {
        const insumosCarregados = insSB?.length ? insSB.map(i=>({...i,preco:Number(i.preco||0)})) : INSUMOS_PLANILHA;
        const ings = recIngsSB || [];
        setRecIngredientes(ings); // guarda para recalcular quando insumos mudarem
        const receitasComCusto = recBasesSB.filter(r=>r.ativo!==false).map(rec => {
          const rend = Number(rec.rendimento)||1;
          const total = ings.filter(i=>i.receita_id===rec.id).reduce((s,i)=>{
            const ins = insumosCarregados.find(x=>x.cod===Number(i.insumo_cod));
            return s + (ins ? Number(i.quantidade)*Number(ins.preco) : 0);
          },0);
          return { ...rec, _custoUnitario: total/rend };
        });
        setReceitasProd(receitasComCusto);
      }
      setAuthStatus(phv ? "locked" : "setup");
      setLoaded(true);
    })();
  }, []);

  // ── Recalcula _custoUnitario das receitas quando insumos mudam ───────────
  useEffect(() => {
    if (!recIngredientes.length || !receitasProd.length) return;
    setReceitasProd(prev => prev.map(rec => {
      const rend = Number(rec.rendimento) || 1;
      const total = recIngredientes
        .filter(i => i.receita_id === rec.id)
        .reduce((s, i) => {
          const ins = insumos.find(x => x.cod === Number(i.insumo_cod));
          return s + (ins ? Number(i.quantidade) * Number(ins.preco) : 0);
        }, 0);
      return { ...rec, _custoUnitario: total / rend };
    }));
  }, [insumos]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Inactivity auto-lock ──────────────────────────────────────────────────
  const resetTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (senhaHash) {
      inactivityTimer.current = setTimeout(() => setAuthStatus("locked"), INACTIVITY_MS);
    }
  }, [senhaHash, INACTIVITY_MS]);

  useEffect(() => {
    if (authStatus !== "unlocked") return;
    const events = ["mousemove","keydown","click","scroll","touchstart"];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [authStatus, resetTimer]);

  // ── Auth handlers ─────────────────────────────────────────────────────────
  const handleSetup = async (senha) => {
    const h = await hashSenha(senha);
    await sbSetCfg("dl_senha_hash", h);
    setSenhaHash(h);
    setAuthStatus("unlocked");
  };

  const handleUnlock = async (h) => {
    if (h === senhaHash) { setAuthStatus("unlocked"); return true; }
    return false;
  };

  const handleChangeSenha = async (hAtual, hNova) => {
    if (hAtual !== senhaHash) return false;
    await sbSetCfg("dl_senha_hash", hNova);
    setSenhaHash(hNova);
    return true;
  };

  // ── Salvar registro de importação ────────────────────────────────────────
  const registrarImportacao = async ({ tipo, banco, mesReferencia, nomeArquivo, qtdRec, qtdDesp, totalRec, totalDesp }) => {
    const reg = {
      id: Date.now(),
      importado_em: new Date().toISOString(),
      tipo: tipo || "desconhecido",
      banco: banco || "",
      mes_referencia: mesReferencia || new Date().toISOString().slice(0,7),
      nome_arquivo: nomeArquivo || "",
      qtd_receitas: Number(qtdRec) || 0,
      qtd_despesas: Number(qtdDesp) || 0,
      total_receitas: Number(totalRec) || 0,
      total_despesas: Number(totalDesp) || 0,
    };
    // Atualiza estado local imediatamente
    setHistoricoImport(prev => [...prev, reg]);
    // Salva no Supabase
    try {
      const res = await fetch(SB + "/historico_importacoes", {
        method: "POST",
        headers: { ...H, "Prefer": "return=minimal" },
        body: JSON.stringify(reg)  // objeto simples, não array
      });
      if (!res.ok) {
        const err = await res.text();
        console.error("Erro ao salvar histórico:", res.status, err);
      }
    } catch(e) { console.error("Fetch histórico falhou:", e); }
    // Backup automático após cada importação bem-sucedida (2s de delay)
    setTimeout(() => {
      try { exportarJSON(true); } catch {}
    }, 2000);
  };

  // ── Sem auto-save: dados ficam em memória até o usuário sincronizar ────────
  const [syncStatus, setSyncStatus] = useState("idle"); // idle | syncing | ok | error
  const [pendente, setPendente] = useState(false); // indica dados não sincronizados

  // Receitas e Despesas: salva imediatamente no storage + marca pendente
  const saveReceitas = useCallback((novas) => {
    setReceitas(novas);
    sbSync("receitas", novas);
    setPendente(true);
  }, []);
  const saveDespesas = useCallback((novas) => {
    setDespesas(novas);
    sbSync("despesas", novas);
    setPendente(true);
  }, []);

  // Auto-save de configs APÓS a carga inicial (useRef evita disparar no 1º render)
  const primeiraVez = useRef(true);
  useEffect(() => {
    if (!loaded) return;
    if (primeiraVez.current) { primeiraVez.current = false; return; }
    // Salva configs automaticamente quando mudam
    sbSetCfg("dl_transferencias", transferencias);
    sbSetCfg("dl_catReceita",     catReceita);
    sbSetCfg("dl_catDespesa",     catDespesa);
    sbSetCfg("dl_bancos",         bancos);
    sbSetCfg("dl_bancoCnpj",      bancoCnpj);
    sbSetCfg("dl_saldos",         saldos);
    sbSetCfg("dl_fornecedores",   fornecedores);
    sbSetCfg("dl_metas",          metas);
    sbSetCfg("dl_tiposDocto",     tiposDocto);
    sbSetCfg("dl_precifConfig",   precifConfig);
    setPendente(true);
  }, [transferencias, catReceita, catDespesa, bancos, bancoCnpj, saldos, fornecedores, metas, tiposDocto, precifConfig, loaded]);

  // ── Sincronização: salva TUDO no window.storage ──────────────────────────
  const sincronizar = async () => {
    setSyncStatus("syncing");
    try {
      await Promise.all([
        sbSync("receitas",       receitas),
        sbSync("despesas",       despesas),
        sbSetCfg("dl_transferencias", transferencias),
        sbSetCfg("dl_catReceita",     catReceita),
        sbSetCfg("dl_catDespesa",     catDespesa),
        sbSetCfg("dl_bancos",         bancos),
        sbSetCfg("dl_bancoCnpj",      bancoCnpj),
        sbSetCfg("dl_saldos",         saldos),
        sbSetCfg("dl_fornecedores",   fornecedores),
        sbSetCfg("dl_metas",          metas),
        sbSetCfg("dl_tiposDocto",     tiposDocto),
      ]);
      setSyncStatus("ok");
      setPendente(false);
      setTimeout(() => setSyncStatus("idle"), 3000);
    } catch(e) {
      console.error("Sync error:", e);
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 4000);
    }
  };

  // ── Exportar JSON completo ────────────────────────────────────────────────
  const [modalBackup, setModalBackup] = useState(null); // null | "export" | "import"

  const [limparStatus, setLimparStatus] = useState("idle"); // idle | confirmando | limpando

  const limparTudo = async () => {
    setLimparStatus("limpando");
    try {
      await Promise.all([
        fetch(SB + "/receitas?id=gte.0",              { method: "DELETE", headers: H }),
        fetch(SB + "/despesas?id=gte.0",              { method: "DELETE", headers: H }),
        fetch(SB + "/transferencias?id=gte.0",        { method: "DELETE", headers: H }),
        fetch(SB + "/historico_importacoes?id=gte.0", { method: "DELETE", headers: H }),
      ]);
      await fetch(SB + "/config?key=like.dl_%25", { method: "DELETE", headers: H });
    } catch(e) { console.error("Erro ao limpar:", e); }
    setLimparStatus("idle");
    window.location.reload();
  };

  const exportarJSON = (silencioso = false) => {
    const dados = {
      versao: "1.0",
      exportadoEm: new Date().toISOString(),
      receitas, despesas, transferencias,
      catReceita, catDespesa, bancos, saldos, fornecedores, metas,
    };
    const json = JSON.stringify(dados, null, 2);
    const nome = "dolce-luna-backup-" + new Date().toISOString().slice(0,10) + ".json";
    try {
      const uri = "data:application/json;charset=utf-8," + encodeURIComponent(json);
      const a = document.createElement("a");
      a.href = uri;
      a.download = nome;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Registra horário do último backup no localStorage
      try { localStorage.setItem("dl_ultimo_backup", new Date().toISOString()); } catch {}
      if (!silencioso) showToast("✅ Backup salvo na sua máquina!", "ok");
    } catch(e) {
      setModalBackup({ tipo: "export", json });
    }
  };

  // Auto-backup: verifica se passou mais de 24h desde o último backup
  // e dispara automaticamente ao abrir o sistema
  useEffect(() => {
    if (!loaded || authStatus !== "unlocked") return;
    try {
      const ultimo = localStorage.getItem("dl_ultimo_backup");
      const agora = new Date();
      if (!ultimo || (agora - new Date(ultimo)) > 24 * 60 * 60 * 1000) {
        // Espera 3s para não sobrepor o carregamento
        const t = setTimeout(() => {
          if (receitas.length > 0 || despesas.length > 0) {
            exportarJSON(true); // silencioso = não mostra toast
            showToast("💾 Backup automático salvo na sua máquina!", "ok");
          }
        }, 3000);
        return () => clearTimeout(t);
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, authStatus]);

  // ── Importar JSON ─────────────────────────────────────────────────────────
  const importarJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const dados = JSON.parse(ev.target.result);
        if (dados.receitas)      { saveReceitas(dados.receitas); }
        if (dados.despesas)      { saveDespesas(dados.despesas); }
        if (dados.transferencias){ setTransferencias(dados.transferencias); await wSet("dl_transferencias", dados.transferencias); }
        if (dados.catReceita)    { setCatReceita(dados.catReceita);    await wSet("dl_catReceita",    dados.catReceita); }
        if (dados.catDespesa)    { setCatDespesa(dados.catDespesa);    await wSet("dl_catDespesa",    dados.catDespesa); }
        if (dados.bancos)        { setBancos(dados.bancos);            await wSet("dl_bancos",        dados.bancos); }
        if (dados.saldos)        { setSaldos(dados.saldos);            await wSet("dl_saldos",        dados.saldos); }
        if (dados.fornecedores)  { setFornecedores(dados.fornecedores);await wSet("dl_fornecedores",  dados.fornecedores); }
        if (dados.metas)         { setMetas(dados.metas);              await wSet("dl_metas",         dados.metas); }
        showToast("✅ Backup importado! " + (dados.receitas?.length || 0) + " receitas, " + (dados.despesas?.length || 0) + " despesas.", "ok");
      } catch(e) {
        showToast("❌ Erro ao importar: arquivo inválido.", "del");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // reset input
  };

  // ── Loading screen ────────────────────────────────────────────────────────
  if (!loaded || authStatus === "loading") return (
    <div style={{ minHeight: "100vh", background: "#0d0b15", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:0.4;transform:scaleX(0.8)} 50%{opacity:1;transform:scaleX(1)} }`}</style>
      <div style={{ fontSize: 48 }}>🌙</div>
      <div style={{ fontSize: 16, fontWeight: 700, background: "linear-gradient(90deg,#c084fc,#e85d8a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Dolce Luna</div>
      <div style={{ fontSize: 13, color: "#8a7fa0" }}>Carregando seus dados...</div>
      <div style={{ width: 200, height: 4, background: "#1a1628", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: "60%", height: "100%", background: "linear-gradient(90deg,#c084fc,#e85d8a)", borderRadius: 99, animation: "pulse 1.2s ease-in-out infinite" }} />
      </div>
    </div>
  );

  // ── Auth gates ────────────────────────────────────────────────────────────
  if (authStatus === "setup" || authStatus === "locked") return (
    <LockScreen
      temSenha={authStatus === "locked"}
      onUnlock={handleUnlock}
      onSetup={handleSetup}
    />
  );

  const showToast = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const totalR = receitas.reduce((s, r) => s + Number(r.valor || 0), 0);
  const totalD = despesas.reduce((s, d) => s + Number(d.valor || 0), 0);
  const saldo = totalR - totalD;

  const saveReceita = async (f) => {
    const SB_D = "https://wmlecjrkqwoejuryeayz.supabase.co/rest/v1";
    const SB_K = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbGVjanJrcXdvZWp1cnllYXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDgyMDYsImV4cCI6MjA5MTMyNDIwNn0.SAYFGBZFjvLn9jIEs8J5mR93ZY7HlYQbT43YTn8JKnI";
    const SBH  = { "Content-Type":"application/json","apikey":SB_K,"Authorization":"Bearer "+SB_K,"Prefer":"resolution=merge-duplicates,return=minimal" };

    const novosDescontos = (f.descontos||[]).filter(d => parseFloat(String(d.valor).replace(",",".")) > 0);
    const totalDesc = novosDescontos.reduce((s,d) => s + (parseFloat(String(d.valor).replace(",",".")) || 0), 0);
    const recId = editItem ? editItem.id : Date.now();
    const recValor = Number(f.valor);

    // Salva/atualiza a receita
    if (editItem) {
      const updated = { ...f, id: editItem.id, valor: recValor };
      setReceitas(prev => prev.map(r => r.id === editItem.id ? updated : r));
      // PATCH direto no registro — não faz upsert de todos
      await sbPatch("receitas", editItem.id, updated);
      // Remove descontos antigos vinculados a esta receita e recria
      try {
        await fetch(`${SB_D}/despesas?receita_id=eq.${editItem.id}`, { method:"DELETE", headers:{...SBH,"Prefer":"return=minimal"} });
        setDespesas(prev => prev.filter(d => d.receita_id !== editItem.id));
      } catch(e) { console.error("Erro ao remover descontos antigos:", e); }
    } else {
      saveReceitas([...receitas, { ...f, id: recId, valor: recValor }]);
    }

    // Salva os novos descontos como despesas vinculadas
    if (novosDescontos.length > 0) {
      const novasDepDesc = novosDescontos.map((d, i) => ({
        id: recId + i + 1,
        data: f.data, documento: "Ajuste",
        plano: d.plano || "Despesas Financeiras",
        conta: d.conta || "Taxas Bancárias",
        tipo: "Recorrente",
        descricao: (d.tipo || "Desconto/Taxa") + " — " + (f.descricao || ""),
        banco: f.banco, valor: parseFloat(String(d.valor).replace(",",".")) || 0,
        vencimento: f.data, pagamento: f.data,
        receita_id: recId,
      }));
      saveDespesas([...despesas.filter(d => d.receita_id !== recId), ...novasDepDesc]);
      try {
        await fetch(`${SB_D}/despesas`, { method:"POST", headers:SBH, body: JSON.stringify(novasDepDesc.map(d=>({...d,valor:Number(d.valor)}))) });
      } catch(e) { console.error("Erro ao salvar descontos:", e); }
    }

    showToast(editItem ? "Receita atualizada!" : "Receita adicionada!");
    setModal(null); setEditItem(null);
  };
  const saveDespesa = async (f) => {
    if (editItem) {
      const updated = { ...f, id: editItem.id, valor: Number(f.valor) };
      setDespesas(prev => prev.map(d => d.id === editItem.id ? updated : d));
      // PATCH direto no registro
      await sbPatch("despesas", editItem.id, updated);
    } else {
      saveDespesas([...despesas, { ...f, id: Date.now(), valor: Number(f.valor) }]);
    }
    showToast(editItem ? "Despesa atualizada!" : "Despesa adicionada!");
    setModal(null); setEditItem(null);
  };
  const saveTransf = (f) => {
    setTransferencias(l => [...l, { ...f, id: Date.now(), valor: Number(f.valor) }]);
    showToast("Transferência registrada!");
    setModal(null);
  };

  const goTo = (t) => { setTab(t); setRelatorioAtivo(null); setFiltro(""); };
  const goRelatorio = (r) => { setTab("relatorios"); setRelatorioAtivo(r); };

  const navGroups = [
    {
      label: "Finanças",
      items: [
        { id: "dashboard",      icon: "◈",  label: "Dashboard" },
        { id: "receitas",       icon: "↑",  label: "Receitas" },
        { id: "despesas",       icon: "↓",  label: "Despesas" },
        { id: "transferencias", icon: "⇌",  label: "Transferências" },
        { id: "metas",          icon: "🎯", label: "Metas" },
      ]
    },
    {
      label: "Análise",
      items: [
        { id: "produtos",       icon: "🛍", label: "Produtos Vendidos" },
        { id: "compras",        icon: "🛒", label: "Entradas de Mercadoria" },
        { id: "precificacao",   icon: "🧾", label: "Precificação" },
        { id: "insumos",        icon: "🌿", label: "Insumos" },
        { id: "despesas-fixas", icon: "📌", label: "Despesas Fixas" },
      ]
    },
    {
      label: "Fichas & Receitas",
      items: [
        { id: "fichas-tecnicas", icon: "📋", label: "Fichas Técnicas" },
        { id: "receitas-prod",   icon: "📝", label: "Receitas de Produção" },
      ]
    },
    {
      label: "Relatórios",
      items: [
        { id: "rel-conciliacao", icon: "⚖", label: "Conciliação Bancária" },
        { id: "rel-fc-diario", icon: "📅", label: "Fluxo de Caixa Diário" },
        { id: "rel-fc-mensal", icon: "📆", label: "Fluxo de Caixa Mensal" },
        { id: "rel-dre", icon: "📊", label: "DRE" },
        { id: "rel-dashboard", icon: "📈", label: "Dashboard Gerencial" },
        { id: "rel-despesas", icon: "📉", label: "Relatório de Despesas" },
        { id: "rel-receitas", icon: "💹", label: "Relatório de Receitas" },
        { id: "rel-metas", icon: "🏆", label: "Dashboard de Metas" },
      ]
    },
    {
      label: "Importar",
      items: [
        { id: "importar-ifood",       icon: "🍕", label: "iFood - Tijuca" },
        { id: "importar-ifood-hg",    icon: "🍕", label: "iFood - HG" },
        { id: "importar-99food-hg",   icon: "🛺", label: "99Food - HG" },
        { id: "importar-99food-tjk",  icon: "🛺", label: "99Food - Tijuca" },
        { id: "importar-extratos",    icon: "📄", label: "Extratos Bancários" },
      ]
    },
    {
      label: "Configurações",
      items: [
        { id: "config", icon: "⚙", label: "Configurações" },
      ]
    }
  ];

  // ── Tokens de tema ────────────────────────────────────────────────────────
  const T = cleanMode ? {
    bg:          "#f5f4f0",
    bgCard:      "#ffffff",
    bgCard2:     "#f0eeea",
    bgSidebar:   "#faf9f6",
    border:      "#e0ddd8",
    border2:     "#ccc9c3",
    text:        "#1a1814",
    textSub:     "#6b6860",
    textMuted:   "#9e9b95",
    accent:      "#7c3aed",
    accentLight: "#ede9fe",
    headerBg:    "#ffffff",
    headerBorder:"#e0ddd8",
    sidebarHover:"#f0eeea",
    sidebarActive:"#ede9fe",
    inputBg:     "#ffffff",
    inputBorder: "#d1cec8",
    green:       "#16a34a",
    red:         "#dc2626",
    yellow:      "#b45309",
  } : {
    bg:          "#0d0b15",
    bgCard:      "#13101e",
    bgCard2:     "#1a1628",
    bgSidebar:   "#0f0c1a",
    border:      "#2d2640",
    border2:     "#3a3060",
    text:        "#f0e8ff",
    textSub:     "#8a7fa0",
    textMuted:   "#4a3f60",
    accent:      "#c084fc",
    accentLight: "#2d1254",
    headerBg:    "linear-gradient(135deg,#1a1628,#13101e)",
    headerBorder:"#2d2640",
    sidebarHover:"#1a1628",
    sidebarActive:"#2d1254",
    inputBg:     "#1a1628",
    inputBorder: "#2d2640",
    green:       "#4ade80",
    red:         "#f87171",
    yellow:      "#f59e0b",
  };

  const allItems = navGroups.flatMap(g => g.items);
  const activeItem = tab === "relatorios"
    ? allItems.find(i => i.id === relatorioAtivo)
    : allItems.find(i => i.id === tab);
  const SIDEBAR_W = sidebarOpen ? 220 : 0;

  // Formata valor ou esconde com ••••
  const fmtH = (v) => hideValues ? "••••" : fmt(v);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Segoe UI', system-ui, sans-serif", display: "flex", flexDirection: "column", transition: "background 0.25s, color 0.25s" }}>

      {/* ── TOP HEADER ── */}
      <div style={{ background: T.headerBg, borderBottom: `1px solid ${T.headerBorder}`,
        padding: isMobile ? "10px 12px" : "12px 16px",
        position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", gap: isMobile ? 8 : 12 }}>

        {/* Hamburger — só desktop */}
        {!isMobile && (
          <button onClick={() => setSidebarOpen(o => !o)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 8px", borderRadius: 8, color: T.accent, display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
            <span style={{ display: "block", width: 20, height: 2, background: T.accent, borderRadius: 2, transition: "all 0.25s", transform: sidebarOpen ? "rotate(45deg) translate(4px, 4px)" : "none" }} />
            <span style={{ display: "block", width: 20, height: 2, background: T.accent, borderRadius: 2, transition: "all 0.25s", opacity: sidebarOpen ? 0 : 1 }} />
            <span style={{ display: "block", width: 20, height: 2, background: T.accent, borderRadius: 2, transition: "all 0.25s", transform: sidebarOpen ? "rotate(-45deg) translate(4px, -4px)" : "none" }} />
          </button>
        )}

        {/* Logo */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: isMobile ? 15 : 16, fontWeight: 800, background: "linear-gradient(90deg,#c084fc,#e85d8a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>🌙 Dolce Luna</div>
          {!isMobile && (
            <div style={{ fontSize: 10, color: "#4a3f60" }}>
              {(() => {
                const allDates = [
                  ...receitas.map(r => r.recebimento || r.data),
                  ...despesas.map(d => d.pagamento || d.data),
                ].filter(Boolean).sort();
                const last = allDates[allDates.length - 1];
                if (!last) return "Controle Financeiro";
                const [y,m,d] = last.split("-");
                return `Última atualização: ${d}/${m}/${y}`;
              })()}
            </div>
          )}
        </div>

        {/* Breadcrumb — só desktop */}
        {!isMobile && activeItem && (
          <div style={{ fontSize: 12, color: "#8a7fa0", display: "flex", alignItems: "center", gap: 6 }}>
            <span>{activeItem.icon}</span>
            <span style={{ color: "#c084fc", fontWeight: 600 }}>{activeItem.label}</span>
          </div>
        )}

        {/* Mobile: seção atual */}
        {isMobile && activeItem && (
          <div style={{ fontSize: 12, fontWeight: 700, color: "#c084fc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {activeItem.icon} {activeItem.label}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: isMobile ? 4 : 6, alignItems: "center", flexShrink: 0 }}>
          {isMobile ? (
            // Mobile: só ícones compactos
            <>
              <button onClick={() => { setEditItem(null); setModal("receita"); }}
                style={{ background:"linear-gradient(135deg,#14532d,#166534)", border:"none", borderRadius:8, color:"#4ade80", cursor:"pointer", padding:"7px 10px", fontSize:16, fontWeight:800 }}>+↑</button>
              <button onClick={() => { setEditItem(null); setModal("despesa"); }}
                style={{ background:"linear-gradient(135deg,#7f1d1d,#991b1b)", border:"none", borderRadius:8, color:"#f87171", cursor:"pointer", padding:"7px 10px", fontSize:16, fontWeight:800 }}>+↓</button>
              {/* Ocultar valores */}
              <button onClick={() => setHideValues(v => !v)} title={hideValues ? "Mostrar valores" : "Ocultar valores"}
                style={{ background: hideValues ? "#2d1254" : "none", border:`1px solid ${hideValues ? T.accent : T.border}`, borderRadius:8, color: hideValues ? T.accent : T.textSub, cursor:"pointer", padding:"6px 9px", fontSize:15, transition:"all 0.2s" }}>
                {hideValues ? "🙈" : "👁"}
              </button>
              {/* Toggle tema */}
              <button onClick={() => setCleanMode(m => !m)} title={cleanMode ? "Modo escuro" : "Modo claro"}
                style={{ background: cleanMode ? "#f0eeea" : "#1a1628", border:`1px solid ${cleanMode?"#ccc9c3":"#2d2640"}`, borderRadius:8, cursor:"pointer", padding:"6px 9px", fontSize:15, lineHeight:1, transition:"all 0.2s" }}>
                {cleanMode ? "🌙" : "☀️"}
              </button>
              <button onClick={() => setAuthStatus("locked")}
                style={{ background:"none", border:`1px solid ${T.border}`, borderRadius:8, color:T.textSub, cursor:"pointer", padding:"7px 9px", fontSize:14 }}>🔒</button>
            </>
          ) : (
            <>
              <Btn small color="green" onClick={() => { setEditItem(null); setModal("receita"); }}>+ Receita</Btn>
              <Btn small color="red" onClick={() => { setEditItem(null); setModal("despesa"); }}>+ Despesa</Btn>
              <button onClick={() => exportarJSON(false)} title="Exportar backup"
                style={{ background:"none", border:`1.5px solid ${T.border}`, borderRadius:8, color:T.textSub, cursor:"pointer", padding:"5px 10px", fontSize:12, display:"flex", alignItems:"center", gap:4, whiteSpace:"nowrap" }}>
                💾 Backup
              </button>
              {/* Ocultar valores */}
              <button onClick={() => setHideValues(v => !v)} title={hideValues ? "Mostrar valores" : "Ocultar valores"}
                style={{ background: hideValues ? (cleanMode?"#f0e8ff":"#2d1254") : "none", border:`1.5px solid ${hideValues ? T.accent : T.border}`, borderRadius:8, cursor:"pointer", padding:"5px 11px", fontSize:15, display:"flex", alignItems:"center", gap:5, color: hideValues ? T.accent : T.textSub, transition:"all 0.2s", whiteSpace:"nowrap" }}>
                <span>{hideValues ? "🙈" : "👁"}</span>
              </button>
              {/* Toggle tema */}
              <button onClick={() => setCleanMode(m => !m)} title={cleanMode ? "Modo escuro" : "Modo claro"}
                style={{ background: cleanMode ? "#f0eeea" : "#1a1628", border:`1.5px solid ${cleanMode?"#ccc9c3":"#2d2640"}`, borderRadius:8, cursor:"pointer", padding:"5px 12px", fontSize:13, display:"flex", alignItems:"center", gap:6, fontWeight:600, color: cleanMode ? "#6b6860" : "#8a7fa0", transition:"all 0.2s", whiteSpace:"nowrap" }}>
                <span style={{ fontSize:15 }}>{cleanMode ? "🌙" : "☀️"}</span>
                <span>{cleanMode ? "Dark" : "Clean"}</span>
              </button>
              <button onClick={() => setAuthStatus("locked")}
                style={{ background:"none", border:`1.5px solid ${T.border}`, borderRadius:8, color:T.textSub, cursor:"pointer", padding:"5px 10px", fontSize:15, display:"flex", alignItems:"center" }}>
                🔒
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── BODY: SIDEBAR + CONTENT ── */}
      <div style={{ display: "flex", flex: 1, position: "relative" }}>

        {/* SIDEBAR — desktop only */}
        {!isMobile && (
          <div style={{
            width: SIDEBAR_W, minHeight: "calc(100vh - 57px)",
            background: T.bgSidebar, borderRight: `1px solid ${T.border}`,
            overflowX: "hidden", overflowY: "auto",
            transition: "width 0.25s cubic-bezier(.4,0,.2,1)",
            flexShrink: 0, position: "sticky", top: 57, alignSelf: "flex-start",
            maxHeight: "calc(100vh - 57px)"
          }}>
            {sidebarOpen && (
              <div style={{ padding: "12px 0", width: 220 }}>
                {navGroups.map(group => (
                  <div key={group.label} style={{ marginBottom: 8 }}>
                    <div style={{ padding: "6px 16px 4px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      {group.label}
                    </div>
                    {group.items.map(item => {
                      const isRel = item.id.startsWith("rel-");
                      const isActive = isRel ? (tab === "relatorios" && relatorioAtivo === item.id) : tab === item.id;
                      return (
                        <button key={item.id}
                          onClick={() => isRel ? goRelatorio(item.id) : goTo(item.id)}
                          style={{
                            width: "100%", padding: "9px 16px", border: "none", cursor: "pointer", textAlign: "left",
                            background: isActive ? T.sidebarActive : "none",
                            color: isActive ? T.accent : T.textSub,
                            fontSize: 13, fontWeight: isActive ? 700 : 400,
                            borderLeft: isActive ? `3px solid ${T.accent}` : "3px solid transparent",
                            display: "flex", alignItems: "center", gap: 10,
                            transition: "all 0.15s"
                          }}
                          onMouseOver={e => { if (!isActive) { e.currentTarget.style.background = T.sidebarHover; e.currentTarget.style.color = T.text; } }}
                          onMouseOut={e => { if (!isActive) { e.currentTarget.style.background = "none"; e.currentTarget.style.color = T.textSub; } }}>
                          <span style={{ fontSize: 15, width: 20, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
                        </button>
                      );
                    })}
                    <div style={{ height: 1, background: T.border, margin: "6px 16px" }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MOBILE: Drawer overlay — abre da direita para a esquerda */}
        {isMobile && sidebarOpen && (
          <>
            {/* Backdrop */}
            <div onClick={() => setSidebarOpen(false)}
              style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:150 }} />
            {/* Drawer — direita */}
            <div style={{
              position:"fixed", top:0, right:0, bottom:0, width:"80vw", maxWidth:300,
              background: T.bgSidebar, borderLeft:`1px solid ${T.border}`, zIndex:160,
              overflowY:"auto", paddingTop:12,
              boxShadow:"-8px 0 32px rgba(0,0,0,0.5)",
            }}>
              <div style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                <div style={{ fontSize:15, fontWeight:800, background:"linear-gradient(90deg,#c084fc,#e85d8a)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>🌙 Dolce Luna</div>
                <button onClick={() => setSidebarOpen(false)} style={{ background:"none", border:"none", color:T.textSub, fontSize:20, cursor:"pointer", padding:"4px 8px" }}>✕</button>
              </div>
              {navGroups.map(group => (
                <div key={group.label} style={{ marginBottom: 8 }}>
                  <div style={{ padding:"6px 16px 4px", fontSize:10, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.1em" }}>
                    {group.label}
                  </div>
                  {group.items.map(item => {
                    const isRel = item.id.startsWith("rel-");
                    const isActive = isRel ? (tab==="relatorios" && relatorioAtivo===item.id) : tab===item.id;
                    return (
                      <button key={item.id}
                        onClick={() => { isRel ? goRelatorio(item.id) : goTo(item.id); setSidebarOpen(false); }}
                        style={{
                          width:"100%", padding:"12px 16px", border:"none", cursor:"pointer", textAlign:"left",
                          background: isActive ? T.sidebarActive : "none",
                          color: isActive ? T.accent : T.textSub,
                          fontSize:14, fontWeight: isActive ? 700 : 400,
                          borderLeft: isActive ? `3px solid ${T.accent}` : "3px solid transparent",
                          display:"flex", alignItems:"center", gap:12,
                        }}>
                        <span style={{ fontSize:18, width:24, textAlign:"center", flexShrink:0 }}>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                  <div style={{ height:1, background:T.border, margin:"6px 16px" }} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, padding: isMobile ? "12px 10px" : "16px", overflowX: "hidden", minWidth: 0, paddingBottom: isMobile ? 80 : 16, background: T.bg, transition:"background 0.25s" }}>

          {/* ── DASHBOARD ── */}
          {tab === "dashboard" && (() => {
            // ── Constantes ────────────────────────────────────────────────────
            const CONTA_CENTRAL  = "Mercado Pago - Nicole";
            const CONTA_CAIXINHA = "Caixinha";
            const DOCS_PLAT      = ["Extrato financeiro iFood", "Extrato financeiro 99Food"];

            // Saldos iniciais configurados em "Comece Aqui"
            const saldoInicialCentral  = Number(saldos.contas?.[CONTA_CENTRAL]  || 0);
            const saldoInicialCaixinha = Number(saldos.contas?.[CONTA_CAIXINHA] || 0);
            const dataRef = saldos.data || ""; // data do saldo inicial

            // ── Filtro de data do dashboard ───────────────────────────────────
            const inRange = x => {
              const d = x.data || x.recebimento || x.pagamento || "";
              if (dashDe && d < dashDe) return false;
              if (dashAte && d > dashAte) return false;
              return true;
            };
            const temFiltroData = !!(dashDe || dashAte);

            // ── VISÃO EXTRATO (MP Nicole) — base do saldo em conta ────────────
            // Receitas: tudo que entrou na MP Nicole no período
            const receitasFiltradas = receitas.filter(r => r.banco === CONTA_CENTRAL && inRange(r));
            const totalReceitas     = receitasFiltradas.reduce((s,r) => s + Number(r.valor||0), 0);

            // Despesas: tudo que saiu da MP Nicole no período
            const despesasFiltradas = despesas.filter(d => d.banco === CONTA_CENTRAL && inRange(d));
            const totalDespesas     = despesasFiltradas.reduce((s,d) => s + Number(d.valor||0), 0);

            // Saldo líquido do período (MP Nicole)
            const saldoLiquido = totalReceitas - totalDespesas;
            const margem  = totalReceitas > 0 ? (saldoLiquido / totalReceitas * 100) : 0;
            const pctDesp = totalReceitas > 0 ? Math.min(100, totalDespesas / totalReceitas * 100) : 0;

            // ── SALDO EM CONTA: só MP Nicole (saldo real) ────────────────────
            // Caixinha é guardada separado — não soma ao saldo em conta
            const fimAcum = dashAte || "";
            const recAcum = receitas.filter(r => {
              if (r.banco !== CONTA_CENTRAL) return false;
              const d = r.data || r.recebimento || "";
              if (dataRef && d < dataRef) return false;
              if (fimAcum && d > fimAcum) return false;
              return true;
            }).reduce((s,r) => s + Number(r.valor||0), 0);
            const despAcum = despesas.filter(d => {
              if (d.banco !== CONTA_CENTRAL) return false;
              const dt = d.data || d.pagamento || "";
              if (dataRef && dt < dataRef) return false;
              if (fimAcum && dt > fimAcum) return false;
              return true;
            }).reduce((s,d) => s + Number(d.valor||0), 0);
            // Saldo em conta = saldo inicial da MP Nicole + movimentos — SEM caixinha
            const saldoConta    = saldoInicialCentral + (recAcum - despAcum);
            const saldoContaSub = `🏦 Caixinha guardada: ${fmtH(saldoInicialCaixinha)}`;

            // ── SALDO NO INÍCIO DO PERÍODO FILTRADO (carry-forward) ───────────
            // "Quanto eu tinha quando o período começou?"
            // = saldo acumulado até o dia ANTERIOR ao início do filtro
            const temFiltroInicio = !!dashDe;
            const saldoInicioPeriodo = (() => {
              if (!temFiltroInicio) return null; // sem filtro de início = não faz sentido mostrar
              // Um dia antes do início do filtro
              const diaAntes = new Date(dashDe + "T12:00:00");
              diaAntes.setDate(diaAntes.getDate() - 1);
              const limAnte = diaAntes.toISOString().slice(0, 10);
              const recAntes = receitas.filter(r => {
                if (r.banco !== CONTA_CENTRAL) return false;
                const d = r.data || r.recebimento || "";
                if (dataRef && d < dataRef) return false;
                return d <= limAnte;
              }).reduce((s,r) => s + Number(r.valor||0), 0);
              const despAntes = despesas.filter(d => {
                if (d.banco !== CONTA_CENTRAL) return false;
                const dt = d.data || d.pagamento || "";
                if (dataRef && dt < dataRef) return false;
                return dt <= limAnte;
              }).reduce((s,d) => s + Number(d.valor||0), 0);
              return saldoInicialCentral + (recAntes - despAntes);
            })();

            // ── VISÃO BRUTA (todos os bancos) — painel de plataformas ─────────
            // Receita bruta = todas as receitas do período (sem extrato de plataforma para evitar dupla contagem)
            const totalBrutoRec  = receitas.filter(r => inRange(r) && !DOCS_PLAT.includes(r.documento)).reduce((s,r) => s + Number(r.valor||0), 0);
            const totalBrutoDesp = despesas.filter(d => inRange(d) && !DOCS_PLAT.includes(d.documento)).reduce((s,d) => s + Number(d.valor||0), 0);
            const platRec        = receitas.filter(r => inRange(r) &&  DOCS_PLAT.includes(r.documento)).reduce((s,r) => s + Number(r.valor||0), 0);
            const platDesp       = despesas.filter(d => inRange(d) &&  DOCS_PLAT.includes(d.documento)).reduce((s,d) => s + Number(d.valor||0), 0);
            const totalRepasses  = 0;

            // aliases para partes do código que usam receitasLiq/despesasLiq
            const receitasLiq = receitasFiltradas;
            const despesasLiq = despesasFiltradas;

            // ── Gráficos por categoria (MP Nicole no período) ─────────────────
            const semCategoria = receitasLiq.filter(r => !r.plano).reduce((s,r) => s + Number(r.valor||0), 0);
            const recCatsBase  = Object.keys(catReceita).map(cat => ({
              cat, v: receitasLiq.filter(r => r.plano === cat).reduce((s,r) => s + Number(r.valor||0), 0)
            })).filter(x => x.v > 0);
            const recCats = [
              ...recCatsBase,
              ...(semCategoria > 0 ? [{ cat: "Extrato Bancário (sem categoria)", v: semCategoria }] : [])
            ].sort((a,b) => b.v - a.v);

            const despCatsBase = Object.keys(catDespesa).map(cat => {
              const despDoPlano = despesasLiq.filter(d => d.plano === cat);
              const total = despDoPlano.reduce((s,d) => s + Number(d.valor||0), 0);
              // Subcontas dentro deste plano
              const contasMap = {};
              despDoPlano.forEach(d => {
                const k = d.conta || "(sem subcategoria)";
                contasMap[k] = (contasMap[k] || 0) + Number(d.valor||0);
              });
              const contas = Object.entries(contasMap)
                .map(([nome, v]) => ({ nome, v }))
                .filter(x => x.v > 0)
                .sort((a,b) => b.v - a.v);
              return { cat, v: total, contas };
            }).filter(x => x.v > 0);
            const despSemPlano = despesasLiq.filter(d => !d.plano).reduce((s,d) => s + Number(d.valor||0), 0);
            const despCats = [
              ...despCatsBase,
              ...(despSemPlano > 0 ? [{ cat: "Sem categoria", v: despSemPlano, contas: [] }] : [])
            ].sort((a,b) => b.v - a.v);
            const totalDespesasGrafico = despCats.reduce((s,c) => s + c.v, 0);

            // SVG donut chart
            const DonutChart = ({ items, total, size=120, cor }) => {
              if (!items.length || total === 0) return (
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                  <circle cx={size/2} cy={size/2} r={size*0.38} fill="none" stroke="#2d2640" strokeWidth={size*0.12}/>
                  <text x={size/2} y={size/2+4} textAnchor="middle" fill="#4a3f60" fontSize={10}>Sem dados</text>
                </svg>
              );
              const r = size*0.38, cx = size/2, cy = size/2, sw = size*0.12;
              const circ = 2*Math.PI*r;
              let offset = 0;
              const CORES = cor === "green"
                ? ["#4ade80","#22c55e","#16a34a","#15803d","#166534","#86efac","#bbf7d0"]
                : ["#f87171","#ef4444","#dc2626","#b91c1c","#991b1b","#fca5a5","#fecaca"];
              return (
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{transform:"rotate(-90deg)"}}>
                  <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a1628" strokeWidth={sw}/>
                  {items.map((item,i) => {
                    const pct = item.v / total;
                    const dash = pct * circ;
                    const el = <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                      stroke={CORES[i%CORES.length]} strokeWidth={sw}
                      strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={-offset}
                      style={{transition:"stroke-dasharray 0.6s ease"}}/>;
                    offset += dash;
                    return el;
                  })}
                </svg>
              );
            };

            const barC = "#c084fc";
            const badge = (txt, col) => (
              <span style={{fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:99,background:col+"22",color:col,border:`1px solid ${col}44`,textTransform:"uppercase",letterSpacing:"0.05em"}}>{txt}</span>
            );

            // Formata data legível
            const fmtFiltro = (d) => { if (!d) return ""; const [y,m,dia] = d.split("-"); return `${dia}/${m}/${y}`; };

            return (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {/* ══ BARRA DE FILTRO ══ */}
              <div style={{ background:T.bgCard, border:`1.5px solid ${temFiltroData?"#7c3aed":"#1e1a2e"}`, borderRadius:14, padding:"12px 16px", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                <span style={{ fontSize:14 }}>📅</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:11, fontWeight:700, color: temFiltroData?"#c084fc":"#6b5f80" }}>
                    {temFiltroData
                      ? `${dashDe ? fmtFiltro(dashDe) : "início"} → ${dashAte ? fmtFiltro(dashAte) : "hoje"}`
                      : "Todo o período"}
                  </div>
                  {temFiltroData && (
                    <div style={{ fontSize:10, color:T.textMuted, marginTop:1 }}>
                      {receitasFiltradas.length} entradas · {despesasFiltradas.length} saídas
                    </div>
                  )}
                </div>
                <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                  <input type="date" value={dashDe} onChange={e => setDashDe(e.target.value)}
                    style={{ ...iStyle, fontSize:11, padding:"5px 8px", width:130, borderColor: dashDe?"#7c3aed":"" }} />
                  <span style={{ color:T.textMuted, fontSize:11 }}>→</span>
                  <input type="date" value={dashAte} onChange={e => setDashAte(e.target.value)}
                    style={{ ...iStyle, fontSize:11, padding:"5px 8px", width:130, borderColor: dashAte?"#7c3aed":"" }} />
                  {[
                    { l:"Este mês", fn: () => { const n=new Date(); const y=n.getFullYear(), m=String(n.getMonth()+1).padStart(2,"0"); setDashDe(`${y}-${m}-01`); setDashAte(`${y}-${m}-${String(new Date(y,n.getMonth()+1,0).getDate()).padStart(2,"0")}`); }},
                    { l:"Mês anterior", fn: () => { const n=new Date(); n.setMonth(n.getMonth()-1); const y=n.getFullYear(), m=String(n.getMonth()+1).padStart(2,"0"); setDashDe(`${y}-${m}-01`); setDashAte(`${y}-${m}-${String(new Date(y,n.getMonth()+1,0).getDate()).padStart(2,"0")}`); }},
                  ].map(({l,fn}) => (
                    <button key={l} onClick={fn} style={{ fontSize:10, fontWeight:600, padding:"5px 10px", borderRadius:6, border:"1px solid #2d1e4e", background:T.bgCard, color:"#9d7fd4", cursor:"pointer" }}>{l}</button>
                  ))}
                  {temFiltroData && (
                    <button onClick={() => { setDashDe(""); setDashAte(""); }}
                      style={{ fontSize:10, fontWeight:700, padding:"5px 12px", borderRadius:6, border:"1px solid #7c3aed", background:"#2d1254", color:T.text, cursor:"pointer" }}>
                      ✕ Limpar
                    </button>
                  )}
                </div>
              </div>

              {/* ══ CARDS PRINCIPAIS — o que importa primeiro ══ */}
              <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap:10 }}>
                {[
                  {
                    icon: "↑", label: "Entradas", val: totalReceitas,
                    sub: `${receitasFiltradas.length} lançamentos · MP Nicole`,
                    cor: "#4ade80", bg: "linear-gradient(135deg,#0a1f0a,#0f2e12)",
                    border: "#1a4d1a",
                  },
                  {
                    icon: "↓", label: "Saídas", val: totalDespesas,
                    sub: `${despesasFiltradas.length} lançamentos · MP Nicole`,
                    cor: "#f87171", bg: "linear-gradient(135deg,#1f0a0a,#2e0f0f)",
                    border: "#4d1a1a",
                  },
                  {
                    icon: saldoLiquido >= 0 ? "=" : "⚠", label: "Resultado do período", val: saldoLiquido,
                    sub: `${margem.toFixed(1)}% margem sobre entradas`,
                    cor: saldoLiquido >= 0 ? "#c084fc" : "#f87171",
                    bg: saldoLiquido >= 0 ? "linear-gradient(135deg,#150a2e,#1e1040)" : "linear-gradient(135deg,#1f0a0a,#2e0f0f)",
                    border: saldoLiquido >= 0 ? "#4c2a8e" : "#4d1a1a",
                  },
                  {
                    icon: "🏦", label: "Saldo em conta", val: saldoConta,
                    sub: saldoContaSub,
                    cor: "#f59e0b", bg: "linear-gradient(135deg,#1a1000,#261600)",
                    border: "#4d3000",
                  },
                ].map((k, i) => (
                  <div key={i} style={{ background: k.bg, border: `1.5px solid ${k.border}`, borderRadius: 14, padding: "16px 18px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                      <span style={{ fontSize:13, fontWeight:900, color:k.cor, opacity:0.7 }}>{k.icon}</span>
                      <span style={{ fontSize:10, fontWeight:700, color:k.cor+"99", textTransform:"uppercase", letterSpacing:"0.08em" }}>{k.label}</span>
                    </div>
                    <div style={{ fontSize: isMobile ? 20 : 26, fontWeight:900, color:k.cor, lineHeight:1, fontVariantNumeric:"tabular-nums", marginBottom:6 }}>
                      {fmtH(k.val)}
                    </div>
                    <div style={{ fontSize:10, color:T.textMuted, lineHeight:1.4 }}>{k.sub}</div>
                  </div>
                ))}
              </div>

              {/* ══ GRÁFICO MENSAL ══ */}
              {(() => {
                const mesesLabel = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
                const ano = new Date().getFullYear();
                const dadosMes = mesesLabel.map((_,mi) => {
                  const pfx = `${ano}-${String(mi+1).padStart(2,"0")}`;
                  const r = receitas.filter(x => x.banco === CONTA_CENTRAL && (x.recebimento||x.data||"").startsWith(pfx)).reduce((s,x)=>s+Number(x.valor||0),0);
                  const d = despesas.filter(x => x.banco === CONTA_CENTRAL && (x.pagamento||x.data||"").startsWith(pfx)).reduce((s,x)=>s+Number(x.valor||0),0);
                  return { mes: mesesLabel[mi], r, d };
                });
                const maxV = Math.max(...dadosMes.flatMap(m=>[m.r,m.d]),1);
                const h = 90;
                const temDados = dadosMes.some(m=>m.r>0||m.d>0);
                if (!temDados) return null;
                const mesAtual = new Date().getMonth();
                return (
                  <div style={{ background:T.bg, border:`1.5px solid ${T.border}`, borderRadius:14, padding:"16px 18px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                      <div style={{ fontSize:11, fontWeight:800, color:T.textSub, textTransform:"uppercase", letterSpacing:"0.08em" }}>
                        Entradas vs Saídas — MP Nicole {ano}
                      </div>
                      <div style={{ display:"flex", gap:12 }}>
                        {[["#4ade80","Entradas"],["#f87171","Saídas"]].map(([c,l]) => (
                          <div key={l} style={{ display:"flex", alignItems:"center", gap:4 }}>
                            <div style={{ width:8, height:8, borderRadius:2, background:c }} />
                            <span style={{ fontSize:9, color:"#6b5f80" }}>{l}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ overflowX:"auto" }}>
                      <div style={{ display:"flex", gap:3, alignItems:"flex-end", minWidth: isMobile ? 500 : 0, height:h+28, position:"relative", paddingBottom:22 }}>
                        {[0.25,0.5,0.75,1].map(pct=>(
                          <div key={pct} style={{ position:"absolute", left:0, right:0, bottom:22+h*pct-h, borderTop:"1px solid #1a1628", zIndex:0 }} />
                        ))}
                        {dadosMes.map((m,i)=>(
                          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:1, position:"relative", zIndex:1 }}>
                            <div style={{ display:"flex", gap:2, alignItems:"flex-end", height:h }}>
                              <div title={`Entradas ${m.mes}: ${fmtH(m.r)}`}
                                style={{ width:9, background: i===mesAtual ? "#4ade80" : "#22533a", height:`${maxV>0?(m.r/maxV*h):0}px`, borderRadius:"3px 3px 0 0", minHeight:m.r>0?2:0, transition:"height 0.5s ease" }}/>
                              <div title={`Saídas ${m.mes}: ${fmtH(m.d)}`}
                                style={{ width:9, background: i===mesAtual ? "#f87171" : "#5a2020", height:`${maxV>0?(m.d/maxV*h):0}px`, borderRadius:"3px 3px 0 0", minHeight:m.d>0?2:0, transition:"height 0.5s ease" }}/>
                            </div>
                            <div style={{ fontSize:8, color: i===mesAtual ? "#c084fc" : "#3a3060", fontWeight: i===mesAtual ? 800 : 400 }}>{m.mes}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ══ CANAIS DE VENDA — largura total ══ */}
              {(() => {
                  const receitasCanais = receitas.filter(inRange);
                  const despesasCanais = despesas.filter(inRange);
                  const CANAIS_PLAT = [
                    { id:"ifood-tjk",  label:"iFood Tijuca",      icon:"🍕", cor:"#f97316", banco:"iFood Pago - Tijuca",         doc:"Extrato financeiro iFood" },
                    { id:"ifood-hg",   label:"iFood HG",           icon:"🍕", cor:"#fb923c", banco:"iFood Pago - Higienópolis",   doc:"Extrato financeiro iFood" },
                    { id:"99food-hg",  label:"99Food HG",          icon:"🛺", cor:"#facc15", banco:"99Food (Nubank - Ana)",         doc:"Extrato financeiro 99Food" },
                    { id:"99food-tjk", label:"99Food Tijuca",      icon:"🛺", cor:"#fde047", banco:"99Food (Mercado Pago - Luis)", doc:"Extrato financeiro 99Food" },
                  ];
                  const canaisData = CANAIS_PLAT.map(c => {
                    const recs  = receitasCanais.filter(r => r.banco === c.banco && r.documento === c.doc);
                    const desps = despesasCanais.filter(d => d.banco === c.banco && d.documento === c.doc);
                    const bruto = recs.reduce((s,r)=>s+Number(r.valor||0),0);
                    const taxas = desps.reduce((s,d)=>s+Number(d.valor||0),0);
                    return { ...c, bruto, taxas, liq: bruto - taxas, qtd: recs.length };
                  }).filter(c => c.bruto > 0);

                  // Cardápio próprio: PIX + Link de Pagamento da MP Nicole (vendas diretas)
                  const DOCS_PLAT_EXCL = ["Extrato financeiro iFood","Extrato financeiro 99Food","Repasse de Plataforma"];
                  const recCardapio = receitasCanais.filter(r =>
                    r.banco === CONTA_CENTRAL && !DOCS_PLAT_EXCL.includes(r.documento)
                  );
                  const brutoCardapio = recCardapio.reduce((s,r)=>s+Number(r.valor||0),0);

                  if (canaisData.length === 0 && brutoCardapio === 0) return null;

                  const totalBruto = canaisData.reduce((s,c)=>s+c.bruto,0);
                  const totalTaxas = canaisData.reduce((s,c)=>s+c.taxas,0);
                  const totalLiq   = canaisData.reduce((s,c)=>s+c.liq,0);

                  const thC = { padding:"8px 14px", fontSize:9, fontWeight:800, color:"#6b5f80", textTransform:"uppercase", letterSpacing:"0.07em", borderBottom:"1px solid #1e1a2e", background:"#0a0816", whiteSpace:"nowrap" };
                  const tdC = (cor) => ({ padding:"10px 14px", fontSize:12, fontWeight:700, color: cor||"#c8b8e8", borderBottom:"1px solid #13101e", verticalAlign:"middle" });

                  return (
                    <div style={{ background:"#0d0b15", border:"1.5px solid #1e1a2e", borderRadius:14, overflow:"hidden" }}>
                      {/* Header */}
                      <div style={{ padding:"12px 18px", background:"linear-gradient(90deg,#130d28,#0d0b15)", borderBottom:"1px solid #1e1a2e", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
                        <div>
                          <div style={{ fontSize:12, fontWeight:800, color:"#e9d5ff", letterSpacing:"0.04em" }}>📦 Canais de Venda — Faturamento por Plataforma</div>
                          <div style={{ fontSize:10, color:"#6b5f80", marginTop:2 }}>
                            Valores do relatório de cada plataforma — faturamento bruto, taxas cobradas e líquido recebido
                          </div>
                        </div>
                        <div style={{ display:"flex", gap:16, alignItems:"center" }}>
                          <div style={{ textAlign:"right" }}>
                            <div style={{ fontSize:9, color:"#6b5f80", textTransform:"uppercase", letterSpacing:"0.06em" }}>Total bruto</div>
                            <div style={{ fontSize:16, fontWeight:900, color:"#a78bfa" }}>{fmtH(totalBruto + brutoCardapio)}</div>
                          </div>
                          <div style={{ width:1, height:28, background:"#2d1e4e" }} />
                          <div style={{ textAlign:"right" }}>
                            <div style={{ fontSize:9, color:"#6b5f80", textTransform:"uppercase", letterSpacing:"0.06em" }}>Taxas</div>
                            <div style={{ fontSize:16, fontWeight:900, color:"#f87171" }}>−{fmtH(totalTaxas)}</div>
                          </div>
                          <div style={{ width:1, height:28, background:"#2d1e4e" }} />
                          <div style={{ textAlign:"right" }}>
                            <div style={{ fontSize:9, color:"#6b5f80", textTransform:"uppercase", letterSpacing:"0.06em" }}>Líquido</div>
                            <div style={{ fontSize:16, fontWeight:900, color:"#c084fc" }}>{fmtH(totalLiq + brutoCardapio)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Tabela */}
                      <div style={{ overflowX:"auto" }}>
                        <table style={{ borderCollapse:"collapse", width:"100%", minWidth:460 }}>
                          <thead>
                            <tr>
                              <th style={{ ...thC, textAlign:"left" }}>Canal</th>
                              <th style={{ ...thC, textAlign:"center" }}>Pedidos</th>
                              <th style={{ ...thC, textAlign:"right" }}>Faturamento</th>
                              <th style={{ ...thC, textAlign:"right" }}>Taxas</th>
                              <th style={{ ...thC, textAlign:"right" }}>Líquido</th>
                              <th style={{ ...thC, textAlign:"right" }}>% Taxa</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Cardápio próprio */}
                            {brutoCardapio > 0 && (
                              <tr style={{ background:"#0a1a0a" }}>
                                <td style={tdC()}>
                                  <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                                    <span>🛍</span>
                                    <div>
                                      <div style={{ fontSize:12, fontWeight:700, color:"#4ade80" }}>Cardápio próprio</div>
                                      <div style={{ fontSize:9, color:"#4a3f60" }}>PIX e link direto</div>
                                    </div>
                                  </div>
                                </td>
                                <td style={{ ...tdC(), textAlign:"center", color:"#6b5f80" }}>{recCardapio.length}</td>
                                <td style={{ ...tdC("#4ade80"), textAlign:"right" }}>{fmtH(brutoCardapio)}</td>
                                <td style={{ ...tdC("#6b5f80"), textAlign:"right" }}>—</td>
                                <td style={{ ...tdC("#4ade80"), textAlign:"right", fontWeight:900 }}>{fmtH(brutoCardapio)}</td>
                                <td style={{ ...tdC("#4ade80"), textAlign:"right" }}>0%</td>
                              </tr>
                            )}
                            {/* Plataformas */}
                            {canaisData.map((c) => {
                              const pctTaxa = c.bruto > 0 ? (c.taxas / c.bruto * 100) : 0;
                              return (
                                <tr key={c.id} style={{ background:"transparent" }}
                                  onMouseEnter={e=>e.currentTarget.style.background="#13101e"}
                                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                                  <td style={tdC()}>
                                    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                                      <span>{c.icon}</span>
                                      <div>
                                        <div style={{ fontSize:12, fontWeight:700, color:"#d4c8f0" }}>{c.label}</div>
                                        <div style={{ height:3, width:60, background:"#1a1628", borderRadius:99, marginTop:4, overflow:"hidden" }}>
                                          <div style={{ height:"100%", width:`${100-pctTaxa}%`, background:c.cor, borderRadius:99 }} />
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ ...tdC(), textAlign:"center", color:"#6b5f80" }}>{c.qtd}</td>
                                  <td style={{ ...tdC("#a78bfa"), textAlign:"right" }}>{fmtH(c.bruto)}</td>
                                  <td style={{ ...tdC("#f87171"), textAlign:"right" }}>−{fmtH(c.taxas)}</td>
                                  <td style={{ ...tdC(c.cor), textAlign:"right", fontWeight:900 }}>{fmtH(c.liq)}</td>
                                  <td style={{ ...tdC("#6b5f80"), textAlign:"right" }}>{pctTaxa.toFixed(1)}%</td>
                                </tr>
                              );
                            })}
                          </tbody>
                          {/* Totais */}
                          {canaisData.length > 0 && (
                            <tfoot>
                              <tr style={{ background:"#13101e", borderTop:"2px solid #2d1e4e" }}>
                                <td style={{ ...tdC("#9333ea"), fontWeight:800, borderBottom:"none" }}>Total plataformas</td>
                                <td style={{ ...tdC(), textAlign:"center", borderBottom:"none", color:"#6b5f80" }}>
                                  {canaisData.reduce((s,c)=>s+c.qtd,0)}
                                </td>
                                <td style={{ ...tdC("#a78bfa"), textAlign:"right", fontWeight:900, borderBottom:"none" }}>{fmtH(totalBruto)}</td>
                                <td style={{ ...tdC("#f87171"), textAlign:"right", fontWeight:900, borderBottom:"none" }}>−{fmtH(totalTaxas)}</td>
                                <td style={{ ...tdC("#c084fc"), textAlign:"right", fontWeight:900, fontSize:14, borderBottom:"none" }}>{fmtH(totalLiq)}</td>
                                <td style={{ ...tdC("#6b5f80"), textAlign:"right", borderBottom:"none" }}>
                                  {totalBruto > 0 ? (totalTaxas/totalBruto*100).toFixed(1)+"%" : "—"}
                                </td>
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      </div>
                    </div>
                  );
                })()}

                {/* Gráficos de categoria */}
              <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:10 }}>
                <div style={{ background:"#0d0b15", border:"1.5px solid #1e1a2e", borderRadius:14, padding:"16px 18px", display:"flex", flexDirection:"column", gap:14 }}>
                  {/* Receitas por categoria */}
                  <div>
                    <div style={{ fontSize:11, fontWeight:800, color:"#8a7fa0", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Entradas por tipo</div>
                    {recCats.length === 0 ? (
                      <div style={{ fontSize:11, color:"#3a3060", padding:"12px 0" }}>Categorize os lançamentos na aba Receitas</div>
                    ) : (
                      <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                        {recCats.slice(0,5).map((item,i) => {
                          const pct = totalReceitas > 0 ? (item.v/totalReceitas*100) : 0;
                          const CORES = ["#4ade80","#22c55e","#86efac","#16a34a","#bbf7d0"];
                          return (
                            <div key={item.cat}>
                              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                                <span style={{ fontSize:10, color:"#c8b8e8", maxWidth:"60%", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.cat}</span>
                                <span style={{ fontSize:10, fontWeight:700, color:CORES[i%CORES.length] }}>{fmtH(item.v)}</span>
                              </div>
                              <div style={{ height:3, background:"#0a1f0a", borderRadius:99, overflow:"hidden" }}>
                                <div style={{ height:"100%", width:`${pct}%`, background:CORES[i%CORES.length], borderRadius:99, transition:"width 0.6s ease" }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div style={{ height:1, background:"#1e1a2e" }} />
                  {/* Saídas por categoria */}
                  <div>
                    <div style={{ fontSize:11, fontWeight:800, color:"#8a7fa0", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Saídas por categoria</div>
                    {despCats.length === 0 ? (
                      <div style={{ fontSize:11, color:"#3a3060", padding:"12px 0" }}>
                        Categorize os lançamentos na aba Despesas para ver aqui
                      </div>
                    ) : (
                      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        {despCats.map((item,i) => {
                          const pct = totalDespesasGrafico > 0 ? (item.v/totalDespesasGrafico*100) : 0;
                          const CORES = ["#f87171","#ef4444","#fb923c","#fca5a5","#dc2626","#fecaca","#f97316"];
                          const cor = CORES[i % CORES.length];
                          return (
                            <div key={item.cat}>
                              {/* Plano de contas */}
                              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                                <span style={{ fontSize:11, fontWeight:700, color:"#d4c8f0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"60%" }}>
                                  {item.cat}
                                </span>
                                <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                                  <span style={{ fontSize:9, color:"#6b5f80" }}>{pct.toFixed(1)}%</span>
                                  <span style={{ fontSize:11, fontWeight:800, color:cor }}>{fmtH(item.v)}</span>
                                </div>
                              </div>
                              {/* Barra do plano */}
                              <div style={{ height:4, background:"#1f0a0a", borderRadius:99, overflow:"hidden", marginBottom:4 }}>
                                <div style={{ height:"100%", width:`${pct}%`, background:cor, borderRadius:99, transition:"width 0.6s ease" }} />
                              </div>
                              {/* Subcontas */}
                              {item.contas && item.contas.length > 0 && (
                                <div style={{ display:"flex", flexDirection:"column", gap:2, paddingLeft:10, borderLeft:`2px solid ${cor}33`, marginTop:4 }}>
                                  {item.contas.map((sub, si) => {
                                    const subPct = item.v > 0 ? (sub.v / item.v * 100) : 0;
                                    return (
                                      <div key={sub.nome} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                                        <span style={{ fontSize:9, color:"#8a7fa0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"60%" }}>
                                          {sub.nome}
                                        </span>
                                        <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                                          <span style={{ fontSize:8, color:"#4a3f60" }}>{subPct.toFixed(0)}%</span>
                                          <span style={{ fontSize:9, fontWeight:700, color:`${cor}cc` }}>{fmtH(sub.v)}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
            );
          })()}

          {/* ── RECEITAS ── */}
          {tab === "receitas" && (
            <ReceitasTab
              receitas={receitas} setReceitas={saveReceitas}
              despesas={despesas}
              setEditItem={setEditItem} setModal={setModal} showToast={showToast}
              bancos={bancos} sbDelete={sbDelete}
            />
          )}

          {/* ── DESPESAS ── */}
          {tab === "despesas" && (
            <DespesasTab
              despesas={despesas} setDespesas={saveDespesas}
              setEditItem={setEditItem} setModal={setModal} showToast={showToast}
              bancos={bancos} sbDelete={sbDelete}
            />
          )}

          {/* ── TRANSFERÊNCIAS ── */}
          {tab === "transferencias" && (
            <TransferenciasTab
              transferencias={transferencias}
              setTransferencias={setTransferencias}
              setModal={setModal}
              showToast={showToast}
              isMobile={isMobile}
            />
          )}

          {/* ── METAS ── */}
          {/* ── PRODUTOS VENDIDOS ── */}
          {tab === "produtos" && <ProdutosTab bancoCnpj={bancoCnpj} />}

          {/* ── PRECIFICAÇÃO & INSUMOS ── */}
          {tab === "compras" && (
            <ComprasTab
              insumos={insumos}
              compras={compras}
              onSaveCompra={c => setCompras(prev => [...prev, c])}
              onDeleteCompra={id => setCompras(prev => prev.filter(c => c.id !== id))}
              onUpdateInsumo={(cod, preco) => setInsumos(prev => prev.map(i => i.cod === cod ? { ...i, preco } : i))}
              onAddInsumo={ins => setInsumos(prev => [...prev, ins])}
            />
          )}
          {tab === "fichas-tecnicas" && <FichasTecnicasTab insumos={insumos} receitas={receitasProd} />}
          {tab === "receitas-prod" && <ReceitasProducaoTab insumos={insumos} receitas={receitasProd} setReceitas={setReceitasProd} setRecIngredientes={setRecIngredientes} />}
          {tab === "precificacao" && <PrecificacaoTab receitasProd={receitasProd} precifConfig={precifConfig} onUpdatePrecifConfig={setPrecifConfig} />}
          {tab === "insumos" && <InsumosPrecosTab insumos={insumos} compras={compras} onUpdateInsumo={(cod, preco) => setInsumos(prev => prev.map(i => i.cod === cod ? { ...i, preco } : i))} />}

          {/* ── DESPESAS FIXAS ── */}
          {tab === "despesas-fixas" && <DespesasFixasTab />}

          {/* ── METAS ── */}
          {tab === "metas" && (
            <MetasTab metas={metas} onUpdate={setMetas} receitas={receitas} despesas={despesas} catReceita={catReceita} catDespesa={catDespesa} />
          )}

          {/* ── RELATÓRIOS ── */}
          {tab === "relatorios" && <RelatoriosTab relatorio={relatorioAtivo} receitas={receitas} despesas={despesas} transferencias={transferencias} bancos={bancos} catReceita={catReceita} catDespesa={catDespesa} metas={metas} saldos={saldos} />}

          {/* ── IMPORTAR IFOOD ── */}
          {tab === "importar-ifood" && (
            <ImportarIFoodTab
              receitas={receitas} setReceitas={saveReceitas}
              despesas={despesas} setDespesas={saveDespesas}
              showToast={showToast} onRegistrar={registrarImportacao}
            />
          )}

          {/* ── IMPORTAR IFOOD HG ── */}
          {tab === "importar-ifood-hg" && (
            <ImportarIFoodHGTab
              receitas={receitas} setReceitas={saveReceitas}
              despesas={despesas} setDespesas={saveDespesas}
              showToast={showToast} onRegistrar={registrarImportacao}
            />
          )}

          {/* ── IMPORTAR 99FOOD HG ── */}
          {tab === "importar-99food-hg" && (
            <Importar99FoodTab
              receitas={receitas} setReceitas={saveReceitas}
              despesas={despesas} setDespesas={saveDespesas}
              showToast={showToast} onRegistrar={registrarImportacao}
            />
          )}

          {/* ── IMPORTAR 99FOOD TIJUCA ── */}
          {tab === "importar-99food-tjk" && (
            <Importar99FoodTJKTab
              receitas={receitas} setReceitas={saveReceitas}
              despesas={despesas} setDespesas={saveDespesas}
              showToast={showToast}
            />
          )}

          {/* ── IMPORTAR EXTRATOS ── */}
          {tab === "importar-extratos" && (
            <ImportarExtratosTab
              receitas={receitas} setReceitas={saveReceitas}
              despesas={despesas} setDespesas={saveDespesas}
              transferencias={transferencias} setTransferencias={setTransferencias}
              bancos={bancos} catReceita={catReceita} catDespesa={catDespesa}
              showToast={showToast} onRegistrar={registrarImportacao} tiposDocto={tiposDocto} bancoCnpj={bancoCnpj}
            />
          )}

          {tab === "config" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 32 }}>
              <div style={{ background: "#1a1628", border: "1px solid #2d2640", borderRadius: 10, padding: "12px 16px" }}>
                <p style={{ margin: 0, fontSize: 13, color: "#c8b8e8", lineHeight: 1.6 }}>
                  ⚙️ Gerencie seus <strong style={{ color: "#c084fc" }}>planos de conta</strong> e <strong style={{ color: "#c084fc" }}>bancos</strong> aqui.
                  Clique em <strong style={{ color: "#4ade80" }}>▸</strong> para expandir. Use <strong style={{ color: "#c084fc" }}>✏️</strong> para renomear e <strong style={{ color: "#f87171" }}>🗑</strong> para excluir.
                </p>
              </div>
              <SaldosConfig saldos={saldos} onUpdate={setSaldos} bancos={bancos} />
              <SaldoAtualConfig saldos={saldos} bancos={bancos} receitas={receitas} despesas={despesas} transferencias={transferencias} />
              <ConfigSection title="Tipos de Receita" color="green" data={catReceita} onUpdate={setCatReceita} />
              <ConfigSection title="Tipos de Despesa" color="red" data={catDespesa} onUpdate={setCatDespesa} />
              <TiposDoctoConfig tiposDocto={tiposDocto} onUpdate={setTiposDocto} />
              <BancosConfig bancos={bancos} onUpdate={setBancos} bancoCnpj={bancoCnpj} onUpdateCnpj={setBancoCnpj}
                receitas={receitas} setReceitas={saveReceitas}
                despesas={despesas} setDespesas={saveDespesas}
                saldos={saldos} setSaldos={setSaldos}
                transferencias={transferencias} setTransferencias={setTransferencias}
                showToast={showToast} />
              <FornecedoresConfig fornecedores={fornecedores} onUpdate={setFornecedores} />

              {/* ── Zona de Perigo ── */}
              <div style={{ background:"#13101e", border:"1.5px solid #7f1d1d", borderRadius:12, padding:"16px 18px" }}>
                <div style={{ fontSize:13, fontWeight:800, color:"#f87171", marginBottom:6 }}>⚠️ Zona de Perigo</div>
                <div style={{ fontSize:12, color:"#8a7fa0", marginBottom:14, lineHeight:1.6 }}>
                  Apaga <strong style={{color:"#f0e8ff"}}>todos os dados</strong> do sistema — receitas, despesas, transferências, configurações e histórico de importações. 
                  Esta ação é <strong style={{color:"#f87171"}}>irreversível</strong>. Faça um backup antes.
                </div>
                {limparStatus === "idle" && (
                  <button onClick={() => setLimparStatus("confirmando")}
                    style={{ padding:"10px 20px", borderRadius:8, border:"1.5px solid #7f1d1d", background:"#1a0707", color:"#f87171", cursor:"pointer", fontWeight:700, fontSize:13 }}>
                    🗑 Apagar todos os dados
                  </button>
                )}
                {limparStatus === "confirmando" && (
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    <div style={{ background:"#2d0a0a", border:"1.5px solid #f87171", borderRadius:8, padding:"12px 14px", fontSize:13, color:"#fca5a5", fontWeight:600 }}>
                      ⚠️ Tem certeza? Isso vai apagar TUDO do banco de dados permanentemente.
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={limparTudo}
                        style={{ padding:"10px 20px", borderRadius:8, border:"none", background:"#dc2626", color:"#fff", cursor:"pointer", fontWeight:800, fontSize:13 }}>
                        Sim, apagar tudo
                      </button>
                      <button onClick={() => setLimparStatus("idle")}
                        style={{ padding:"10px 20px", borderRadius:8, border:"1.5px solid #2d2640", background:"none", color:"#8a7fa0", cursor:"pointer", fontSize:13 }}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
                {limparStatus === "limpando" && (
                  <div style={{ color:"#f87171", fontSize:13, fontWeight:700 }}>⏳ Apagando dados...</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM NAV — mobile only ── */}
      {isMobile && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 140,
          background: "linear-gradient(180deg,#0d0b15ee,#0d0b15)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid #2d2640",
          display: "flex", alignItems: "stretch",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}>
          {[
            { id:"dashboard", icon:"◈", label:"Dashboard" },
            { id:"receitas",  icon:"↑", label:"Receitas"  },
            { id:"despesas",  icon:"↓", label:"Despesas"  },
            { id:"config",    icon:"⚙", label:"Config"    },
            { id:"__menu__",  icon:"☰", label:"Menu"      },
          ].map(item => {
            const isActive = item.id === "__menu__"
              ? sidebarOpen
              : tab === item.id;
            return (
              <button key={item.id}
                onClick={() => {
                  if (item.id === "__menu__") { setSidebarOpen(o => !o); return; }
                  goTo(item.id); setSidebarOpen(false);
                }}
                style={{
                  flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", gap: 3, padding: "8px 2px 10px",
                  background: "none", border: "none", cursor: "pointer",
                  color: isActive ? "#c084fc" : "#4a3f60",
                  position: "relative",
                }}>
                {isActive && (
                  <div style={{ position:"absolute", top:0, left:"20%", right:"20%", height:2,
                    background:"linear-gradient(90deg,#c084fc,#e85d8a)", borderRadius:"0 0 4px 4px" }} />
                )}
                <span style={{ fontSize: 18, lineHeight: 1 }}>{item.icon}</span>
                <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 400, letterSpacing: "0.02em", lineHeight: 1 }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* MODALS */}
      {modal === "receita" && (
        <Modal title={editItem ? "✏️ Editar Receita" : "📥 Nova Receita"} onClose={() => { setModal(null); setEditItem(null); }}>
          <ReceitaForm onSave={saveReceita} onCancel={() => { setModal(null); setEditItem(null); }}
            initial={editItem ? {
              ...editItem,
              descontos: editItem.descontos?.length
                // 1. Se a receita já tem descontos salvos diretamente nela, usa esses
                ? editItem.descontos
                : (() => {
                    // 2. Busca por receita_id (vínculo direto — mais preciso)
                    const porId = despesas.filter(d =>
                      d.receita_id && Number(d.receita_id) === Number(editItem.id)
                    );
                    if (porId.length > 0) return porId.map(d => ({
                      id: d.id,
                      tipo: d.descricao?.replace("Desconto/Taxa — ", "") || d.conta || "Desconto",
                      plano: d.plano || "",
                      conta: d.conta || "",
                      valor: String(d.valor || ""),
                    }));
                    // 3. Fallback: mesma data + banco + descrição correspondente
                    // Pega só o desconto cujo índice (por id) corresponde ao índice desta receita
                    if (editItem.documento === "Link de Pagamento") {
                      const todasReceitasDia = receitas
                        .filter(r => r.documento === "Link de Pagamento"
                          && (r.data || r.recebimento) === (editItem.data || editItem.recebimento)
                          && r.banco === editItem.banco)
                        .sort((a,b) => a.id - b.id);
                      const meuIndice = todasReceitasDia.findIndex(r => r.id === editItem.id);
                      const todosDescontosDia = despesas
                        .filter(d => d.descricao?.startsWith("Desconto/Taxa — ")
                          && d.banco === editItem.banco
                          && (d.data || d.pagamento) === (editItem.data || editItem.recebimento))
                        .sort((a,b) => a.id - b.id);
                      const meuDesconto = meuIndice >= 0 && meuIndice < todosDescontosDia.length
                        ? [todosDescontosDia[meuIndice]]
                        : [];
                      return meuDesconto.map(d => ({
                        id: d.id,
                        tipo: d.descricao?.replace("Desconto/Taxa — ", "") || "Desconto",
                        plano: d.plano || "",
                        conta: d.conta || "",
                        valor: String(d.valor || ""),
                      }));
                    }
                    return [];
                  })()
            } : null}
            catReceita={catReceita} catDespesa={catDespesa} bancos={bancos} tiposDocto={tiposDocto} />
        </Modal>
      )}
      {modal === "despesa" && (
        <Modal title={editItem ? "✏️ Editar Despesa" : "📤 Nova Despesa"} onClose={() => { setModal(null); setEditItem(null); }}>
          <DespesaForm onSave={saveDespesa} onCancel={() => { setModal(null); setEditItem(null); }} initial={editItem} catDespesa={catDespesa} bancos={bancos} tiposDocto={tiposDocto} />
        </Modal>
      )}
      {modal === "transf" && (
        <Modal title="⇌ Nova Transferência" onClose={() => setModal(null)}>
          <TransfForm onSave={saveTransf} onCancel={() => setModal(null)} bancos={bancos} />
        </Modal>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: toast.type === "del" ? "#7f1d1d" : "#166534", color: "#fff", padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 200, boxShadow: "0 4px 20px rgba(0,0,0,0.5)", whiteSpace: "nowrap" }}>
          {toast.type === "del" ? "🗑 " : "✅ "}{toast.msg}
        </div>
      )}

      {/* ALTERAR SENHA MODAL */}
      {modalSenha && (
        <AlterarSenhaModal
          onSave={handleChangeSenha}
          onClose={() => setModalSenha(false)}
        />
      )}

      {/* BACKUP EXPORT MODAL */}
      {modalBackup?.tipo === "export" && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ background:"#13101e", border:"1.5px solid #2d2640", borderRadius:16, padding:24, width:"100%", maxWidth:600, display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontSize:16, fontWeight:800, color:"#c084fc" }}>📥 Backup — Copie o JSON abaixo</div>
              <button onClick={() => setModalBackup(null)} style={{ background:"none", border:"none", color:"#8a7fa0", cursor:"pointer", fontSize:20 }}>✕</button>
            </div>
            <p style={{ fontSize:12, color:"#8a7fa0", margin:0 }}>
              Selecione tudo (Ctrl+A), copie (Ctrl+C) e salve em um arquivo <strong>.json</strong> no seu computador.
            </p>
            <textarea
              readOnly
              value={modalBackup.json}
              style={{ background:"#0d0b15", border:"1px solid #2d2640", borderRadius:8, color:"#a0f0a0", fontFamily:"monospace", fontSize:11, padding:12, height:300, resize:"vertical", outline:"none" }}
              onFocus={e => e.target.select()}
            />
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              <button
                onClick={() => { navigator.clipboard.writeText(modalBackup.json).then(() => showToast("✅ Copiado!", "ok")); }}
                style={{ padding:"8px 20px", borderRadius:8, border:"none", background:"linear-gradient(135deg,#c084fc,#e85d8a)", color:"#fff", fontWeight:700, cursor:"pointer", fontSize:13 }}>
                📋 Copiar tudo
              </button>
              <button onClick={() => setModalBackup(null)}
                style={{ padding:"8px 16px", borderRadius:8, border:"1px solid #2d2640", background:"none", color:"#8a7fa0", cursor:"pointer", fontSize:13 }}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const _root=ReactDOM.createRoot(document.getElementById("root"));
_root.render(React.createElement(App));
