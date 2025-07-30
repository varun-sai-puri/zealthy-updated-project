import { useState, useEffect } from "react";

type ConfigItem = { pageNumber: number; component: string };
const allComponents = ["about", "address", "birthdate"] as const;

export default function Admin() {
  const [config, setConfig] = useState<Record<number, string[]>>({ 2: [], 3: [] });

  // 1️⃣ Load existing
  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((arr: ConfigItem[]) => {
        const map: Record<number, string[]> = { 2: [], 3: [] };
        arr.forEach(({ pageNumber, component }) => {
          map[pageNumber] ||= [];
          map[pageNumber].push(component.toLowerCase());
        });
        setConfig(map);
      });
  }, []);

  // 2️⃣ Toggle a checkbox
  const toggle = (page: 2 | 3, comp: string) => {
    setConfig((prev) => {
      const list = prev[page] || [];
      const next = list.includes(comp)
        ? list.filter((c) => c !== comp)
        : [...list, comp];
      return { ...prev, [page]: next };
    });
  };

  // 3️⃣ Save one page’s array
  const savePage = async (page: 2 | 3) => {
    await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageNumber: page,
        components: config[page],
      }),
    });
    alert(`Saved page ${page}: [${config[page].join(", ")}]`);
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: "auto" }}>
      <h1>Admin</h1>
      {[2, 3].map((page) => (
        <section key={page} style={{ marginBottom: 16 }}>
          <h2>Step {page}</h2>
          {allComponents.map((c) => (
            <label key={c} style={{ display: "block" }}>
              <input
                type="checkbox"
                checked={config[page]?.includes(c) || false}
                onChange={() => toggle(page as 2 | 3, c)}
              />{" "}
              {c}
            </label>
          ))}
          <button onClick={() => savePage(page as 2 | 3)}>
            Save Step {page}
          </button>
        </section>
      ))}
    </div>
  );
}
