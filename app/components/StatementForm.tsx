"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Income {
  id?: number;
  name: string;
  identifier: string;
  value: number;
}

interface StatementData {
  month: number;
  year: number;
  incomes: Income[];
  brutto_tax: number;
  brutto_av: number;
  brutto_pv: number;
  brutto_rv: number;
  brutto_kv: number;
  deduction_tax_income: number;
  deduction_tax_church: number;
  deduction_tax_solidarity: number;
  deduction_tax_other: number;
  social_av: number;
  social_pv: number;
  social_rv: number;
  social_kv: number;
  payout_netto: number;
  payout_transfer: number;
  payout_vwl: number;
  payout_other: number;
  [key: string]: string | number | Income[];
}

interface StatementFormProps {
  statementId?: string;
}

export default function StatementForm({ statementId }: StatementFormProps) {
  const router = useRouter();

  const getInitialState = () => ({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    incomes: [
      { name: "Grundgehalt", identifier: "grundgehalt", value: 4500.0 },
      { name: "Leistungsprämie", identifier: "leistungspraemie", value: 350.5 },
    ],
    brutto_tax: 4850.5,
    brutto_av: 4850.5,
    brutto_pv: 4850.5,
    brutto_rv: 4850.5,
    brutto_kv: 4850.5,
    deduction_tax_income: 950.75,
    deduction_tax_church: 85.56,
    deduction_tax_solidarity: 0.0,
    deduction_tax_other: 0.0,
    social_av: 95.8,
    social_pv: 75.2,
    social_rv: 450.8,
    social_kv: 390.1,
    payout_netto: 2802.29,
    payout_transfer: 2802.29,
    payout_vwl: 40.0,
    payout_other: 0.0,
  });

  const [statementData, setStatementData] = useState<StatementData>({
    month: 0,
    year: 0,
    incomes: [],
    brutto_tax: 0,
    brutto_av: 0,
    brutto_pv: 0,
    brutto_rv: 0,
    brutto_kv: 0,
    deduction_tax_income: 0,
    deduction_tax_church: 0,
    deduction_tax_solidarity: 0,
    deduction_tax_other: 0,
    social_av: 0,
    social_pv: 0,
    social_rv: 0,
    social_kv: 0,
    payout_netto: 0,
    payout_transfer: 0,
    payout_vwl: 0,
    payout_other: 0,
  });

  useEffect(() => {
    if (statementId === "new") {
      setStatementData(getInitialState());
    } else if (statementId) {
      const fetchStatement = async () => {
        const res = await fetch(`/api/statement/${statementId}`);
        if (res.ok) {
          const data = await res.json();
          // Ensure incomes is always an array
          setStatementData({ ...data, incomes: data.incomes || [] });
        }
      };
      fetchStatement();
    }
  }, [statementId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsedValue =
      name === "month" || name === "year"
        ? parseInt(value, 10)
        : parseFloat(value);

    setStatementData({
      ...statementData,
      [name]: isNaN(parsedValue) ? 0 : parsedValue,
    });
  };

  const handleIncomeChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    const newIncomes = [...statementData.incomes];
    newIncomes[index] = {
      ...newIncomes[index],
      [name]: name === "value" ? parseFloat(value) || 0 : value,
    };
    setStatementData({ ...statementData, incomes: newIncomes });
  };

  const addIncome = () => {
    setStatementData({
      ...statementData,
      incomes: [
        ...statementData.incomes,
        { name: "", identifier: "", value: 0 },
      ],
    });
  };

  const removeIncome = (index: number) => {
    const newIncomes = statementData.incomes.filter((_, i) => i !== index);
    setStatementData({ ...statementData, incomes: newIncomes });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url =
      statementId === "new"
        ? "/api/statement"
        : `/api/statement/${statementId}`;
    const method = statementId === "new" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(statementData),
      credentials: "include", // Session-Cookies mitsenden
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!statementId || statementId === "new") return;

    const res = await fetch(`/api/statement/${statementId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    }
  };

  const renderInputField = (
    label: string,
    name: string,
    type: string = "number",
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
    value?: string | number,
    inputName?: string, // Use a specific name for the input element if provided
  ) => (
    <div className="mb-4">
      <label
        className="block text-gray-700 text-sm font-bold mb-2"
        htmlFor={name}
      >
        {label}
      </label>
      <input
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        id={name}
        name={inputName || name} // Use specific inputName or fall back to name
        type={type}
        value={value !== undefined ? value : statementData[name]}
        onChange={onChange || handleInputChange}
        step="0.01"
      />
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-4xl mb-8 bg-gradient-to-b from-white to-gray-50 p-10 rounded-2xl shadow-2xl border border-gray-200"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        <div>
          <h2 className="text-3xl font-extrabold mb-6 text-gray-800">
            Abrechnungszeitraum
          </h2>
          {renderInputField("Monat", "month")}
          {renderInputField("Jahr", "year")}
        </div>
        <div>
          <h2 className="text-3xl font-extrabold mb-6 text-gray-800">
            Einkommensarten
          </h2>
          {statementData.incomes.map((income, index) => (
            <div
              key={index}
              className="p-6 border rounded-lg mb-6 bg-gray-100 shadow-sm"
            >
              <div className="grid grid-cols-2 gap-6">
                {renderInputField(
                  `Bezeichnung`,
                  `incomes[${index}].name`,
                  "text",
                  (e) => handleIncomeChange(index, e),
                  income.name,
                  "name",
                )}
                {renderInputField(
                  `Kennung`,
                  `incomes[${index}].identifier`,
                  "text",
                  (e) => handleIncomeChange(index, e),
                  income.identifier,
                  "identifier",
                )}
              </div>
              {renderInputField(
                `Wert`,
                `incomes[${index}].value`,
                "number",
                (e) => handleIncomeChange(index, e),
                income.value,
                "value",
              )}
              <button
                type="button"
                onClick={() => removeIncome(index)}
                className="mt-4 text-red-600 hover:underline"
              >
                Entfernen
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addIncome}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            Einkommensart hinzufügen
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        <div>
          <h2 className="text-3xl font-extrabold mb-6 text-gray-800">Brutto</h2>
          {renderInputField("Steuer", "brutto_tax")}
          {renderInputField("AV", "brutto_av")}
          {renderInputField("PV", "brutto_pv")}
          {renderInputField("RV", "brutto_rv")}
          {renderInputField("KV", "brutto_kv")}
        </div>
        <div>
          <h2 className="text-3xl font-extrabold mb-6 text-gray-800">Abzüge</h2>
          {renderInputField("Einkommensteuer", "deduction_tax_income")}
          {renderInputField("Kirchensteuer", "deduction_tax_church")}
          {renderInputField("Solidaritätszuschlag", "deduction_tax_solidarity")}
          {renderInputField("Sonstige Abzüge", "deduction_tax_other")}
        </div>
        <div>
          <h2 className="text-3xl font-extrabold mb-6 text-gray-800">
            Sozialabgaben
          </h2>
          {renderInputField("Arbeitslosenversicherung", "social_av")}
          {renderInputField("Pflegeversicherung", "social_pv")}
          {renderInputField("Rentenversicherung", "social_rv")}
          {renderInputField("Krankenversicherung", "social_kv")}
        </div>
        <div>
          <h2 className="text-3xl font-extrabold mb-6 text-gray-800">
            Auszahlung
          </h2>
          {renderInputField("Nettoauszahlung", "payout_netto")}
          {renderInputField("Überweisung", "payout_transfer")}
          {renderInputField("VWL", "payout_vwl")}
          {renderInputField("Sonstige Auszahlungen", "payout_other")}
        </div>
      </div>
      <div className="mt-10 flex justify-end gap-4">
        <button
          type="button"
          onClick={handleDelete}
          className="px-6 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
        >
          Löschen
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
        >
          Speichern
        </button>
      </div>
    </form>
  );
}
