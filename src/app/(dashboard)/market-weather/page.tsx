"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { MarketRate, WeatherReading } from "@/types";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

// Read-only view of the last successfully polled values, plus a manual
// override per item — so an editor isn't stuck with stale data if the free
// TCMB/Open-Meteo feed is ever down (or, for GAU/BIST100, was never covered
// by TCMB to begin with).
export default function MarketWeatherPage() {
  const [rates, setRates] = useState<MarketRate[]>([]);
  const [weather, setWeather] = useState<WeatherReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [newSymbol, setNewSymbol] = useState({ symbol: "", label: "", value: "" });
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [weatherOverride, setWeatherOverride] = useState("");

  function reload() {
    return Promise.all([api.marketData.list(), api.weather.get()]).then(([marketRates, weatherReading]) => {
      setRates(marketRates);
      setWeather(weatherReading);
    });
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  async function handleOverride(symbol: string, label: string) {
    const value = overrides[symbol];
    if (!value) {
      return;
    }
    await api.marketData.override(symbol, { label, value: Number(value) });
    setOverrides((prev) => ({ ...prev, [symbol]: "" }));
    await reload();
  }

  async function handleAddSymbol(event: React.FormEvent) {
    event.preventDefault();
    if (!newSymbol.symbol || !newSymbol.value) {
      return;
    }
    await api.marketData.override(newSymbol.symbol.toUpperCase(), {
      label: newSymbol.label || newSymbol.symbol,
      value: Number(newSymbol.value),
    });
    setNewSymbol({ symbol: "", label: "", value: "" });
    await reload();
  }

  async function handleWeatherOverride() {
    if (!weatherOverride) {
      return;
    }
    await api.weather.override({ tempC: Number(weatherOverride), city: weather?.city });
    setWeatherOverride("");
    await reload();
  }

  if (loading) {
    return <p className="text-black/60">Yükleniyor...</p>;
  }

  return (
    <main className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">Piyasa & Hava Durumu</h1>

      <section className="mb-8">
        <h2 className="mb-3 font-semibold">Döviz / Altın / Borsa</h2>
        <table className="mb-4 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left">
              <th className="py-2">Sembol</th>
              <th className="py-2">Etiket</th>
              <th className="py-2">Değer</th>
              <th className="py-2">Değişim</th>
              <th className="py-2">Güncellendi</th>
              <th className="py-2">Manuel Ayarla</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((rate) => (
              <tr key={rate.id} className="border-b border-black/5">
                <td className="py-2 font-semibold">{rate.symbol}</td>
                <td className="py-2">{rate.label}</td>
                <td className="py-2">{rate.value}</td>
                <td className="py-2 text-black/50">{rate.changePercent?.toFixed(2) ?? "—"}%</td>
                <td className="py-2 text-black/40">{new Date(rate.updatedAt).toLocaleString("tr-TR")}</td>
                <td className="py-2">
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      step="0.01"
                      value={overrides[rate.symbol] ?? ""}
                      onChange={(e) => setOverrides((prev) => ({ ...prev, [rate.symbol]: e.target.value }))}
                      className="w-24"
                    />
                    <Button type="button" variant="secondary" onClick={() => handleOverride(rate.symbol, rate.label)}>
                      Ayarla
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <form onSubmit={handleAddSymbol} className="flex items-end gap-2 rounded border border-black/10 bg-white p-3">
          <Field label="Sembol">
            <Input value={newSymbol.symbol} onChange={(e) => setNewSymbol({ ...newSymbol, symbol: e.target.value })} className="w-24" />
          </Field>
          <Field label="Etiket">
            <Input value={newSymbol.label} onChange={(e) => setNewSymbol({ ...newSymbol, label: e.target.value })} />
          </Field>
          <Field label="Değer">
            <Input type="number" step="0.01" value={newSymbol.value} onChange={(e) => setNewSymbol({ ...newSymbol, value: e.target.value })} className="w-28" />
          </Field>
          <Button type="submit">Ekle</Button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 font-semibold">Hava Durumu</h2>
        {weather ? (
          <div className="rounded border border-black/10 bg-white p-4">
            <p className="mb-2 text-sm">
              {weather.city}: <span className="font-bold">{weather.tempC}°C</span>{" "}
              <span className="text-black/40">({new Date(weather.updatedAt).toLocaleString("tr-TR")})</span>
            </p>
            <div className="flex gap-2">
              <Input type="number" step="0.1" placeholder="°C" value={weatherOverride} onChange={(e) => setWeatherOverride(e.target.value)} className="w-24" />
              <Button type="button" variant="secondary" onClick={handleWeatherOverride}>
                Manuel Ayarla
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-black/60">Hava durumu henüz alınamadı. Ayarlar&apos;dan şehir belirleyin.</p>
        )}
      </section>
    </main>
  );
}
