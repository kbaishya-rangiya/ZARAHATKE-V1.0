import { useCallback, useRef, useState } from "react";
import { UploadCloud, Loader2, CheckCircle2, XCircle, Save } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { API } from "@/lib/api";

const CATEGORY_OPTIONS = [
  "Sarees", "Kurtis", "Kurta Sets", "Lehengas",
  "Dupattas", "Co-ord Sets", "Wedding Collection", "Dresses",
];

// Each draft:
// { tempId, localFileName, uploadStatus: "uploading"|"done"|"error", uploadedUrl,
//   form: {name, price, category, section, tag}, saveStatus: "draft"|"saving"|"saved"|"error" }

let counter = 0;
const nextTempId = () => `draft-${Date.now()}-${++counter}`;

export default function BulkUploader({ token, onCreated }) {
  const [drafts, setDrafts] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const inputRef = useRef(null);
  const headers = { Authorization: `Bearer ${token}` };

  const uploadOne = useCallback(async (tempId, file) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await axios.post(`${API}/admin/upload`, fd, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });
      setDrafts((prev) =>
        prev.map((d) =>
          d.tempId === tempId
            ? { ...d, uploadStatus: "done", uploadedUrl: res.data.url }
            : d
        )
      );
    } catch (err) {
      setDrafts((prev) =>
        prev.map((d) =>
          d.tempId === tempId
            ? { ...d, uploadStatus: "error", uploadError: err?.response?.data?.detail || "Failed" }
            : d
        )
      );
    }
  }, [headers]);

  const acceptFiles = (files) => {
    const list = Array.from(files || []).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;
    const newDrafts = list.map((file) => ({
      tempId: nextTempId(),
      localFileName: file.name,
      uploadStatus: "uploading",
      uploadedUrl: "",
      form: {
        name: "",
        price: "",
        category: CATEGORY_OPTIONS[0],
        section: "new_arrivals",
        tag: "NEW",
      },
      saveStatus: "draft",
    }));
    setDrafts((prev) => [...prev, ...newDrafts]);
    newDrafts.forEach((d, i) => uploadOne(d.tempId, list[i]));
  };

  const handleFileInput = (e) => {
    acceptFiles(e.target.files);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    acceptFiles(e.dataTransfer.files);
  };

  const patchDraftForm = (tempId, patch) => {
    setDrafts((prev) =>
      prev.map((d) => (d.tempId === tempId ? { ...d, form: { ...d.form, ...patch } } : d))
    );
  };

  const removeDraft = (tempId) => {
    setDrafts((prev) => prev.filter((d) => d.tempId !== tempId));
  };

  const saveOne = async (tempId) => {
    const draft = drafts.find((d) => d.tempId === tempId);
    if (!draft) return false;
    if (draft.uploadStatus !== "done") {
      toast.error("Photo still uploading");
      return false;
    }
    if (!draft.form.name || !draft.form.price) {
      toast.error("Name and price required");
      return false;
    }
    setDrafts((prev) => prev.map((d) => (d.tempId === tempId ? { ...d, saveStatus: "saving" } : d)));
    try {
      await axios.post(
        `${API}/admin/products`,
        {
          name: draft.form.name,
          price: parseInt(draft.form.price, 10),
          image: draft.uploadedUrl,
          category: draft.form.category,
          section: draft.form.section,
          tag: draft.form.tag || null,
        },
        { headers }
      );
      setDrafts((prev) => prev.map((d) => (d.tempId === tempId ? { ...d, saveStatus: "saved" } : d)));
      return true;
    } catch (err) {
      setDrafts((prev) => prev.map((d) => (d.tempId === tempId ? { ...d, saveStatus: "error" } : d)));
      toast.error(err?.response?.data?.detail || `Could not save "${draft.form.name}"`);
      return false;
    }
  };

  const saveAll = async () => {
    const toSave = drafts.filter(
      (d) => d.uploadStatus === "done" && d.saveStatus !== "saved" && d.form.name && d.form.price
    );
    if (toSave.length === 0) {
      toast("Nothing ready to save — fill in name and price for each draft.");
      return;
    }
    setSavingAll(true);
    let ok = 0;
    for (const d of toSave) {
      const success = await saveOne(d.tempId);
      if (success) ok += 1;
    }
    setSavingAll(false);
    if (ok > 0) {
      toast.success(`${ok} product${ok === 1 ? "" : "s"} created`);
      onCreated && onCreated();
      // Auto-remove saved drafts after a short delay
      setTimeout(() => {
        setDrafts((prev) => prev.filter((d) => d.saveStatus !== "saved"));
      }, 1200);
    }
  };

  const totalReady = drafts.filter(
    (d) => d.uploadStatus === "done" && d.saveStatus !== "saved" && d.form.name && d.form.price
  ).length;

  return (
    <div data-testid="bulk-uploader">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed p-10 text-center cursor-pointer transition-colors ${
          dragActive ? "border-maroon-900 bg-cream-100" : "border-cream-200 bg-white hover:border-maroon-900"
        }`}
        data-testid="bulk-dropzone"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileInput}
          className="hidden"
          data-testid="bulk-file-input"
        />
        <UploadCloud size={36} className="mx-auto text-maroon-900" />
        <div className="mt-4 font-display text-2xl text-maroon-900">Drop photos here</div>
        <p className="text-sm text-stone-600 mt-1">
          Drag up to 10 images at once, or <span className="underline underline-offset-4">click to browse</span>
        </p>
        <p className="text-[11px] text-stone-400 mt-2">JPG / PNG / WEBP · up to 8 MB each</p>
      </div>

      {drafts.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[11px] tracking-[0.28em] uppercase text-gold-600">
              {drafts.length} draft{drafts.length === 1 ? "" : "s"} · {totalReady} ready to save
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDrafts([])}
                className="h-9 px-4 text-[11px] tracking-widest border border-cream-200 text-stone-700 hover:border-maroon-900 hover:text-maroon-900"
                data-testid="bulk-clear-btn"
              >
                CLEAR
              </button>
              <button
                type="button"
                onClick={saveAll}
                disabled={savingAll || totalReady === 0}
                className="h-9 px-4 text-[11px] tracking-widest font-semibold bg-maroon-900 text-cream-50 hover:bg-maroon-700 disabled:opacity-60 flex items-center gap-2"
                data-testid="bulk-save-all-btn"
              >
                <Save size={12} /> SAVE ALL ({totalReady})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drafts.map((d) => (
              <DraftCard
                key={d.tempId}
                draft={d}
                onChange={(patch) => patchDraftForm(d.tempId, patch)}
                onSave={() => saveOne(d.tempId)}
                onRemove={() => removeDraft(d.tempId)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DraftCard({ draft, onChange, onSave, onRemove }) {
  const previewSrc = draft.uploadedUrl
    ? `${process.env.REACT_APP_BACKEND_URL}${draft.uploadedUrl}`
    : "";

  const saved = draft.saveStatus === "saved";

  return (
    <div
      className={`border bg-white overflow-hidden transition-opacity ${saved ? "opacity-50" : ""}`}
      style={{ borderColor: saved ? "#16a34a" : "#E8E1D9" }}
      data-testid={`draft-${draft.tempId}`}
    >
      {/* Image + status */}
      <div className="relative aspect-[3/4] bg-cream-100">
        {previewSrc ? (
          <img src={previewSrc} alt={draft.form.name || "draft"} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center">
            {draft.uploadStatus === "uploading" && <Loader2 size={22} className="text-maroon-900 animate-spin" />}
            {draft.uploadStatus === "error" && <XCircle size={22} className="text-red-500" />}
          </div>
        )}
        {saved && (
          <div className="absolute inset-0 bg-green-600/20 grid place-items-center">
            <div className="bg-cream-50 rounded-full p-2">
              <CheckCircle2 size={22} className="text-green-600" />
            </div>
          </div>
        )}
        {!saved && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 w-7 h-7 bg-cream-50/95 grid place-items-center hover:bg-cream-50"
            aria-label="Remove draft"
            data-testid={`draft-remove-${draft.tempId}`}
          >
            <XCircle size={14} className="text-stone-700" />
          </button>
        )}
      </div>

      {/* Form */}
      <div className="p-3 space-y-2">
        <input
          value={draft.form.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Product name"
          disabled={saved}
          className="w-full h-9 px-2 border border-cream-200 text-[13px] outline-none focus:border-maroon-900"
          data-testid={`draft-name-${draft.tempId}`}
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={draft.form.price}
            onChange={(e) => onChange({ price: e.target.value })}
            placeholder="Price (₹)"
            disabled={saved}
            className="w-full h-9 px-2 border border-cream-200 text-[13px] outline-none focus:border-maroon-900"
            data-testid={`draft-price-${draft.tempId}`}
          />
          <select
            value={draft.form.section}
            onChange={(e) => onChange({ section: e.target.value })}
            disabled={saved}
            className="w-full h-9 px-1 border border-cream-200 text-[12px] outline-none focus:border-maroon-900 bg-white"
            data-testid={`draft-section-${draft.tempId}`}
          >
            <option value="new_arrivals">New Arrivals</option>
            <option value="best_sellers">Best Sellers</option>
          </select>
        </div>
        <select
          value={draft.form.category}
          onChange={(e) => onChange({ category: e.target.value })}
          disabled={saved}
          className="w-full h-9 px-2 border border-cream-200 text-[13px] outline-none focus:border-maroon-900 bg-white"
          data-testid={`draft-category-${draft.tempId}`}
        >
          {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {!saved && (
          <button
            type="button"
            onClick={onSave}
            disabled={draft.uploadStatus !== "done" || draft.saveStatus === "saving"}
            className="w-full h-9 bg-maroon-900 text-cream-50 text-[10px] tracking-widest font-semibold hover:bg-maroon-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-1.5"
            data-testid={`draft-save-${draft.tempId}`}
          >
            {draft.saveStatus === "saving" ? (
              <><Loader2 size={11} className="animate-spin" /> SAVING…</>
            ) : draft.saveStatus === "error" ? (
              "RETRY"
            ) : (
              <><Save size={11} /> SAVE</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
