import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function Modal({ show, onClose, task, onComplete }) {
  if (!show || !task) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.35)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div onClick={(e) => e.stopPropagation()} className="modal-content">
        <h3>{task.text}</h3>
        <p>
          <strong>Açıklama:</strong> {task.description || "Yok"}
        </p>
        <p>
          <strong>Kategori:</strong> {task.category || "Belirtilmemiş"}
        </p>
        <p>
          <strong>Tarih:</strong> {new Date(task.date).toLocaleDateString()}
        </p>
        <p>
          <strong>Öncelik:</strong> {task.priority}
        </p>
        <div
          style={{
            marginTop: "25px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={() => {
              onComplete(task.id);
              onClose();
            }}
            style={{
              padding: "10px 20px",
              backgroundColor: "#33ccab",
              border: "none",
              borderRadius: "12px",
              color: "white",
              cursor: "pointer",
              fontWeight: 600,
            }}
            title="Görevi Tamamla"
          >
            ✔️ Tamamla
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              backgroundColor: "#e74c3c",
              border: "none",
              borderRadius: "12px",
              color: "white",
              cursor: "pointer",
              fontWeight: 600,
            }}
            title="Kapat"
          >
            ❌ Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  // BURADA TÜM STATE’LERİ BİRDEN TANIMLA
  const [gorevler, setGorevler] = useState(() => {
    const saved = localStorage.getItem("gorevler");
    return saved ? JSON.parse(saved) : [];
  });

  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [priority, setPriority] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter] = useState("all"); // all, done, notdone
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [planType, setPlanType] = useState("daily"); // daily, monthly, yearly

  const inputRef = useRef(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    localStorage.setItem("gorevler", JSON.stringify(gorevler));
  }, [gorevler]);

  // Kategorileri boş kontrolüyle oluştur
  const kategoriler = [
    ...new Set(
      gorevler
        .map((g) => (g.category ? g.category.trim() : ""))
        .filter((c) => c !== ""),
    ),
  ];

  const ekle = () => {
    if (text.trim() === "") {
      alert("Yapılacak işi giriniz!");
      return;
    }
    if (!date) {
      alert("Tarih seçiniz!");
      return;
    }
    if (!priority) {
      alert("Öncelik durumunu seçiniz!");
      return;
    }
    const yeniGorev = {
      id: Date.now(),
      text: text.trim(),
      description: description ? description.trim() : "",
      category: category ? category.trim() : "",
      date,
      priority,
      done: false,
    };
    setGorevler([...gorevler, yeniGorev]);
    setText("");
    setDescription("");
    setCategory("");
    setDate("");
    setPriority("");
    setShowSuggestions(false);
  };

  const sil = (id) => {
    const yeniListe = gorevler.filter((g) => g.id !== id);
    setGorevler(yeniListe);
  };

  const tamamla = (id) => {
    const yeniListe = gorevler.map((g) =>
      g.id === id ? { ...g, done: true } : g,
    );
    setGorevler(yeniListe);
  };

  const onTaskClick = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const priorityIcon = (seviyesi) => {
    switch (seviyesi) {
      case "high":
        return "🔥";
      case "medium":
        return "⏳";
      case "low":
        return "🌿";
      default:
        return "✅";
    }
  };

  // Tarih planına göre filtre
  const filtreliTarihGorevler = gorevler.filter((g) => {
    const gorevTarihi = new Date(g.date);
    const bugun = new Date();

    if (!gorevTarihi) return false;

    switch (planType) {
      case "daily":
        return (
          gorevTarihi.getFullYear() === bugun.getFullYear() &&
          gorevTarihi.getMonth() === bugun.getMonth() &&
          gorevTarihi.getDate() === bugun.getDate()
        );
      case "monthly":
        return (
          gorevTarihi.getFullYear() === bugun.getFullYear() &&
          gorevTarihi.getMonth() === bugun.getMonth()
        );
      case "yearly":
        return gorevTarihi.getFullYear() === bugun.getFullYear();
      default:
        return true;
    }
  });

  // Metin, durum ve kategori filtreleri
  const filtreliGorevler = filtreliTarihGorevler.filter((g) => {
    if (filter === "done" && !g.done) return false;
    if (filter === "notdone" && g.done) return false;
    if (categoryFilter !== "all" && g.category !== categoryFilter) return false;
    if (!g.text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Arama önerileri
  const suggestions = gorevler
    .filter(
      (g) =>
        g.text.toLowerCase().startsWith(text.toLowerCase()) && text.length > 0,
    )
    .slice(0, 5);

  const handleFocus = () => setShowSuggestions(true);
  const handleBlur = () => setTimeout(() => setShowSuggestions(false), 150);
  const onSuggestionClick = (text) => {
    setText(text);
    setShowSuggestions(false);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <>
      <h2 className="app-title">Yapılacaklar Listesi</h2>
      <div className="container">
        <div className="plan-tabs mb-4">
          <button
            className={`btn btn-sm me-2 ${
              planType === "daily" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setPlanType("daily")}
          >
            Günlük
          </button>
          <button
            className={`btn btn-sm me-2 ${
              planType === "monthly" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setPlanType("monthly")}
          >
            Aylık
          </button>
          <button
            className={`btn btn-sm ${
              planType === "yearly" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setPlanType("yearly")}
          >
            Yıllık
          </button>
        </div>

        <div className="form-section">
          <div style={{ position: "relative", flexGrow: 1 }}>
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Yapılacak işi yazınız..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              autoComplete="off"
              ref={inputRef}
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((s) => (
                  <li key={s.id} onMouseDown={() => onSuggestionClick(s.text)}>
                    {s.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <textarea
            className="form-control mb-3"
            placeholder="Açıklama (isteğe bağlı)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Kategori (isteğe bağlı)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <input
            type="date"
            className="form-control mb-3"
            placeholder="Tarih seçiniz..."
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <select
            className="form-select mb-3"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="" disabled>
              Öncelik Durumu Seçiniz
            </option>
            <option value="high">Acil</option>
            <option value="medium">Orta</option>
            <option value="low">Düşük</option>
          </select>
          <button className="btn btn-success w-100" onClick={ekle}>
            Ekle
          </button>
        </div>

        <div
          className="d-flex gap-4 align-items-start mb-3 flex-wrap"
          style={{ justifyContent: "space-between" }}
        >
          {/* Durum filtreleri */}
          <div>
            <button
              className={`btn btn-sm ${
                filter === "all" ? "btn-primary" : "btn-outline-primary"
              } me-1`}
              onClick={() => setFilter("all")}
            >
              Tümü
            </button>
            <button
              className={`btn btn-sm ${
                filter === "done" ? "btn-primary" : "btn-outline-primary"
              } me-1`}
              onClick={() => setFilter("done")}
            >
              Tamamlananlar
            </button>
            <button
              className={`btn btn-sm ${
                filter === "notdone" ? "btn-primary" : "btn-outline-primary"
              } me-1`}
              onClick={() => setFilter("notdone")}
            >
              Tamamlanmayanlar
            </button>
          </div>

          {/* Kategori filtreleri */}
          <div className="category-filter">
            <label className="fw-bold me-2">Kategori: </label>
            <label className="me-3">
              <input
                type="radio"
                name="kategori"
                value="all"
                checked={categoryFilter === "all"}
                onChange={() => setCategoryFilter("all")}
              />{" "}
              Tümü
            </label>
            {kategoriler.length === 0 && (
              <small style={{ color: "#888" }}>Kategori yok</small>
            )}
            {kategoriler.map((kat) => (
              <label key={kat} className="me-3">
                <input
                  type="radio"
                  name="kategori"
                  value={kat}
                  checked={categoryFilter === kat}
                  onChange={() => setCategoryFilter(kat)}
                />{" "}
                {kat}
              </label>
            ))}
          </div>

          {/* Arama */}
          <input
            type="text"
            placeholder="Görev ara..."
            className="form-control form-control-sm"
            style={{ maxWidth: "220px" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Görevler listesi */}
        <div className="row g-3">
          {filtreliGorevler.length === 0 && (
            <p className="text-center" style={{ color: "#36747d" }}>
              Görev bulunamadı.
            </p>
          )}
          {filtreliGorevler.map((g) => (
            <div key={g.id} className={`col-12 col-md-6 col-lg-4 d-flex`}>
              <div
                onClick={() => onTaskClick(g)}
                className={`card card-custom flex-fill ${
                  g.priority === "high"
                    ? "card-priority-high"
                    : g.priority === "medium"
                      ? "card-priority-medium"
                      : "card-priority-low"
                }`}
              >
                <div className="card-body">
                  <h5 className={`card-title ${g.done ? "done" : ""}`}>
                    <span className="task-icon">
                      {priorityIcon(g.priority)}
                    </span>
                    {g.text}
                  </h5>
                  <p className="card-text mb-1">
                    Kategori: {g.category || "Belirtilmemiş"}
                  </p>
                  <p className="card-text mb-1">
                    Tarih: {new Date(g.date).toLocaleDateString()}
                  </p>
                  <div className="task-footer">
                    <small
                      className={`fw-bold text-${
                        g.priority === "high"
                          ? "danger"
                          : g.priority === "medium"
                            ? "warning"
                            : "primary"
                      }`}
                    >
                      {g.priority === "high"
                        ? "Acil"
                        : g.priority === "medium"
                          ? "Orta"
                          : "Düşük"}
                    </small>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        sil(g.id);
                      }}
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detay Modal */}
        <Modal
          show={showModal}
          onClose={() => setShowModal(false)}
          task={selectedTask}
          onComplete={tamamla}
        />
      </div>
    </>
  );
}

export default App;
