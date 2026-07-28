import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Upload, Trash2, Plus, LogOut, Copy, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { API } from "@/lib/api";
import axios from "axios";

const LS_KEY = "zk_admin_token";

const CATEGORY_OPTIONS = [
  "Sarees", "Kurtis", "Kurta Sets", "Lehengas",
  "Dupattas", "Co-ord Sets", "Wedding Collection", "Dresses",
];

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(LS_KEY) || "");
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!token) return;
    axios
      .post(`${API}/admin/verify`, {}, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false));
  }, [token]);

  if (!authed) return <LoginGate onAuthed={(t) => { localStorage.setItem(LS_KEY, t); setToken(t); }} />;

  return (
    <AdminDashboard
      token={token}
      onLogout={() => {
        localStorage.removeItem(LS_KEY);
        setToken("");
        setAuthed(false);
      }}
    />
  );
}

function LoginGate({ onAuthed }) {
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API}/admin/verify`, {}, { headers: { Authorization: `Bearer ${input}` } });
      onAuthed(input);
      toast.success("Welcome, admin.");
    } catch (err) {
      toast.error("Invalid admin token");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-md mx-auto px-6 py-24" data-testid="admin-login">
      <div className="text-center mb-8">
        <ShieldCheck size={40} className="mx-auto text-maroon-900" />
        <h1 className="font-display text-3xl text-maroon-900 mt-4">Admin Access</h1>
        <p className="text-stone-500 text-sm mt-2">Enter your admin token to manage products.</p>
      </div>
      <form onSubmit={submit} className="border border-cream-200 bg-white p-6 space-y-4">
        <label className="block">
          <span className="text-[11px] tracking-[0.2em] uppercase text-stone-600 mb-1.5 block">Admin Token</span>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            required
            className="w-full h-11 px-3 bg-white border border-cream-200 text-sm outline-none focus:border-maroon-900"
            data-testid="admin-token-input"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-11 bg-maroon-900 text-cream-50 text-[11px] tracking-[0.28em] font-semibold hover:bg-maroon-700 transition-colors disabled:opacity-70"
          data-testid="admin-login-btn"
        >
          {submitting ? "SIGNING IN..." : "SIGN IN"}
        </button>
      </form>
    </section>
  );
}

function AdminDashboard({ token, onLogout }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState("db"); // "db" | "seed"
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: CATEGORY_OPTIONS[0],
    section: "new_arrivals",
    image: "",
    tag: "NEW",
    description: "",
  });
  const [previewUrl, setPreviewUrl] = useState("");
  const fileRef = useRef(null);

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/products`, { headers });
      setProducts(res.data.products || []);
    } catch (err) {
      toast.error("Could not load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await axios.post(`${API}/admin/upload`, fd, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });
      const url = res.data.url;
      setForm((f) => ({ ...f, image: url }));
      setPreviewUrl(url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.image) return toast.error("Please upload an image first");
    if (!form.name || !form.price) return toast.error("Name and price required");
    try {
      await axios.post(
        `${API}/admin/products`,
        {
          name: form.name,
          price: parseInt(form.price, 10),
          image: form.image,
          category: form.category,
          section: form.section,
          tag: form.tag || null,
          description: form.description || null,
        },
        { headers }
      );
      toast.success("Product created");
      setForm({ name: "", price: "", category: CATEGORY_OPTIONS[0], section: "new_arrivals", image: "", tag: "NEW", description: "" });
      setPreviewUrl("");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not create product");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await axios.delete(`${API}/admin/products/${id}`, { headers });
      toast.success("Product deleted");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not delete");
    }
  };

  const dbProducts = products.filter((p) => p.source === "db");
  const seedProducts = products.filter((p) => p.source === "seed");
  const shownProducts = tab === "db" ? dbProducts : seedProducts;

  return (
    <section className="max-w-[1400px] mx-auto px-6 py-10" data-testid="admin-dashboard">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-cream-200">
        <div>
          <div className="text-[11px] tracking-[0.28em] text-gold-600 uppercase">Admin</div>
          <h1 className="font-display text-3xl md:text-4xl text-maroon-900 mt-1">Product Manager</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="h-10 px-5 border border-maroon-900 text-maroon-900 text-[11px] tracking-widest font-semibold flex items-center leading-none hover:bg-maroon-900 hover:text-cream-50 transition-colors"
          >
            VIEW SITE
          </Link>
          <button
            onClick={onLogout}
            className="h-10 px-5 bg-maroon-900 text-cream-50 text-[11px] tracking-widest font-semibold flex items-center gap-2 hover:bg-maroon-700 transition-colors"
            data-testid="admin-logout-btn"
          >
            <LogOut size={13} /> LOG OUT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8">
        {/* New product form */}
        <div className="border border-cream-200 bg-white p-6" data-testid="admin-new-product-form">
          <h2 className="font-display text-xl text-maroon-900 mb-1">Add product</h2>
          <p className="text-xs text-stone-500 mb-6">Upload a photo and fill in the details.</p>

          {/* Image upload */}
          <div className="mb-5">
            <div className="text-[11px] tracking-[0.2em] uppercase text-stone-600 mb-2">Photo</div>
            {previewUrl ? (
              <div className="relative aspect-[3/4] bg-cream-100 mb-3 overflow-hidden border border-cream-200">
                <img src={`${process.env.REACT_APP_BACKEND_URL}${previewUrl}`} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setPreviewUrl(""); setForm((f) => ({ ...f, image: "" })); }}
                  className="absolute top-2 right-2 h-8 px-3 text-[10px] tracking-widest bg-cream-50 text-maroon-900 hover:bg-cream-100"
                >
                  REPLACE
                </button>
              </div>
            ) : (
              <label className="aspect-[3/4] bg-cream-100 border border-dashed border-cream-200 grid place-items-center cursor-pointer hover:border-maroon-900 transition-colors" data-testid="admin-upload-label">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleUpload}
                  className="hidden"
                  disabled={uploading}
                  data-testid="admin-upload-input"
                />
                <div className="text-center">
                  <Upload size={22} className="mx-auto text-stone-500" />
                  <div className="text-xs text-stone-600 mt-2 tracking-widest">
                    {uploading ? "UPLOADING..." : "TAP TO UPLOAD"}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-1">JPG / PNG / WEBP · up to 8 MB</div>
                </div>
              </label>
            )}
          </div>

          <form onSubmit={handleCreate} className="space-y-3">
            <FormField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} testId="admin-name" />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Price (₹)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} testId="admin-price" />
              <FormSelect label="Section" value={form.section} onChange={(v) => setForm({ ...form, section: v })} options={[{v:"new_arrivals",l:"New Arrivals"},{v:"best_sellers",l:"Best Sellers"}]} testId="admin-section" />
            </div>
            <FormSelect label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={CATEGORY_OPTIONS.map(c => ({v:c,l:c}))} testId="admin-category" />
            <FormSelect label="Tag" value={form.tag} onChange={(v) => setForm({ ...form, tag: v })} options={[{v:"",l:"None"},{v:"NEW",l:"NEW"},{v:"SALE",l:"SALE"}]} testId="admin-tag" />
            <label className="block">
              <span className="text-[11px] tracking-[0.2em] uppercase text-stone-600 mb-1.5 block">Description</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-white border border-cream-200 text-sm outline-none focus:border-maroon-900 resize-none"
                placeholder="Optional — a short description of the piece"
                data-testid="admin-description"
              />
            </label>
            <button
              type="submit"
              className="w-full h-11 bg-maroon-900 text-cream-50 text-[11px] tracking-[0.28em] font-semibold hover:bg-maroon-700 transition-colors mt-2 flex items-center justify-center gap-2"
              data-testid="admin-create-btn"
            >
              <Plus size={13} /> CREATE PRODUCT
            </button>
          </form>
        </div>

        {/* Product list */}
        <div>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setTab("db")}
              className={`h-9 px-4 text-[11px] tracking-widest font-semibold transition-colors ${
                tab === "db" ? "bg-maroon-900 text-cream-50" : "bg-white text-maroon-900 border border-cream-200"
              }`}
              data-testid="admin-tab-db"
            >
              MY PRODUCTS ({dbProducts.length})
            </button>
            <button
              onClick={() => setTab("seed")}
              className={`h-9 px-4 text-[11px] tracking-widest font-semibold transition-colors ${
                tab === "seed" ? "bg-maroon-900 text-cream-50" : "bg-white text-maroon-900 border border-cream-200"
              }`}
              data-testid="admin-tab-seed"
            >
              SEEDED ({seedProducts.length})
            </button>
          </div>

          {loading && <div className="text-center py-16 text-stone-500 text-sm">Loading…</div>}

          {!loading && shownProducts.length === 0 && (
            <div className="text-center py-16 border border-dashed border-cream-200 text-stone-500 text-sm">
              {tab === "db"
                ? "No products yet — add your first product using the form."
                : "No seeded products."}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {shownProducts.map((p) => (
              <ProductAdminCard key={p.id} product={p} editable={p.source === "db"} onDelete={() => handleDelete(p.id)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductAdminCard({ product, editable, onDelete }) {
  const [copied, setCopied] = useState(false);
  const backend = process.env.REACT_APP_BACKEND_URL || "";
  const src = product.image?.startsWith("/api/") ? `${backend}${product.image}` : product.image;

  const copyId = () => {
    navigator.clipboard.writeText(product.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="border border-cream-200 bg-white overflow-hidden" data-testid={`admin-product-${product.id}`}>
      <div className="aspect-[3/4] bg-cream-100">
        <img src={src} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-3">
        <div className="text-[12px] text-stone-800 leading-snug line-clamp-2 min-h-[32px]">{product.name}</div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-maroon-900 font-semibold text-sm">₹{product.price?.toLocaleString("en-IN")}</span>
          <span className="text-[10px] tracking-widest text-stone-500 uppercase">{product.category}</span>
        </div>
        <div className="flex items-center gap-1 mt-3">
          <button
            type="button"
            onClick={copyId}
            className="flex-1 h-8 text-[10px] tracking-widest bg-cream-100 hover:bg-cream-200 flex items-center justify-center gap-1"
            title="Copy product ID"
          >
            {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />} ID
          </button>
          {editable && (
            <button
              type="button"
              onClick={onDelete}
              className="flex-1 h-8 text-[10px] tracking-widest bg-maroon-900 text-cream-50 hover:bg-maroon-700 flex items-center justify-center gap-1"
              data-testid={`admin-delete-${product.id}`}
            >
              <Trash2 size={12} /> DELETE
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, type = "text", testId }) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.2em] uppercase text-stone-600 mb-1.5 block">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full h-10 px-3 bg-white border border-cream-200 text-sm outline-none focus:border-maroon-900"
        data-testid={testId}
      />
    </label>
  );
}

function FormSelect({ label, value, onChange, options, testId }) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.2em] uppercase text-stone-600 mb-1.5 block">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 bg-white border border-cream-200 text-sm outline-none focus:border-maroon-900"
        data-testid={testId}
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>{o.l}</option>
        ))}
      </select>
    </label>
  );
}
