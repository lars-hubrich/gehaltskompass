export const FIELD_DESCRIPTIONS_HUMAN: Record<string, string> = {
  month: "Monat (1-12)",
  year: "Jahr",
  brutto_tax: "Steuerbrutto",
  brutto_av: "Brutto AV",
  brutto_pv: "Brutto PV",
  brutto_rv: "Brutto RV",
  brutto_kv: "Brutto KV",
  deduction_tax_income: "Lohnsteuer",
  deduction_tax_church: "Kirchensteuer",
  deduction_tax_solidarity: "Soli",
  deduction_tax_other: "Sonstige Steuerabzüge",
  social_av: "AN-Anteil AV",
  social_pv: "AN-Anteil PV",
  social_rv: "AN-Anteil RV",
  social_kv: "AN-Anteil KV",
  payout_netto: "Nettoauszahlung",
  payout_transfer: "Übertrag Vormonat",
  payout_vwl: "VWL",
  payout_other: "Sonstige Auszahlungen",
  incomes: "Einkommensbestandteile",
};

export const FIELD_DESCRIPTIONS_AI: Record<string, string> = {
  month: "Abrechnungsmonat als Zahl von 1 (Januar) bis 12 (Dezember).",
  year: "Abrechnungsjahr als vierstellige Jahreszahl (z. B. 2025).",
  brutto_tax:
    "Gesamtbruttolohn, der für die Berechnung der Lohnsteuer herangezogen wird.",
  brutto_av:
    "Bruttolohn, der zur Berechnung der Beiträge zur Arbeitslosenversicherung relevant ist.",
  brutto_pv:
    "Bruttolohn, der zur Berechnung der Beiträge zur Pflegeversicherung relevant ist.",
  brutto_rv:
    "Bruttolohn, der zur Berechnung der Beiträge zur Rentenversicherung relevant ist.",
  brutto_kv:
    "Bruttolohn, der zur Berechnung der Beiträge zur Krankenversicherung relevant ist.",
  deduction_tax_income:
    "Abgezogene Lohnsteuer (Einkommensteuer auf Arbeitslohn).",
  deduction_tax_church:
    "Abgezogene Kirchensteuer (abhängig von Religionszugehörigkeit).",
  deduction_tax_solidarity: "Abgezogener Solidaritätszuschlag.",
  deduction_tax_other:
    "Sonstige steuerliche Abzüge, die nicht unter Lohn-, Kirchensteuer oder Solidaritätszuschlag fallen.",
  social_av:
    "Arbeitnehmeranteil zur Arbeitslosenversicherung (wird vom Bruttolohn abgezogen).",
  social_pv:
    "Arbeitnehmeranteil zur Pflegeversicherung (wird vom Bruttolohn abgezogen).",
  social_rv:
    "Arbeitnehmeranteil zur Rentenversicherung (wird vom Bruttolohn abgezogen).",
  social_kv:
    "Arbeitnehmeranteil zur Krankenversicherung (wird vom Bruttolohn abgezogen).",
  payout_netto:
    "Endgültiger Nettolohn, der nach allen Abzügen ausgezahlt wird.",
  payout_transfer: "Übertragener Auszahlungsbetrag aus einem vorherigen Monat.",
  payout_vwl:
    "Zusätzlich gezahlte vermögenswirksame Leistungen des Arbeitgebers.",
  payout_other:
    "Weitere Auszahlungen, die nicht zu den regulären Gehaltsbestandteilen zählen.",
  incomes:
    "Detaillierte Liste aller Einkommensbestandteile in Form von Objekten mit den Feldern: name (Bezeichnung), identifier (eindeutige Kennung) und value (Betrag).",
};
