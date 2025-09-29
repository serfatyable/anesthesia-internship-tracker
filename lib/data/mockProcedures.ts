/**
 * Mock procedure data for development and testing
 * This should be replaced with real API data in production
 */

export interface Procedure {
  id: string;
  name: string;
  completed: boolean;
  pending: boolean;
  textbookResource?: string;
}

export interface ProcedureCategory {
  id: string;
  name: string;
  procedures: Procedure[];
}

export const mockProcedures: ProcedureCategory[] = [
  {
    id: 'airway-management',
    name: 'Airway Management',
    procedures: [
      {
        id: 'mask-ventilation',
        name: 'Mask Ventilation',
        completed: true,
        pending: false,
        textbookResource:
          "Miller's Anesthesia, 10th Edition, Chapter 19, Mask Ventilation",
      },
    ],
  },
  {
    id: 'iv-access',
    name: 'IV Access',
    procedures: [
      {
        id: 'peripheral-iv',
        name: 'Peripheral IV Placement',
        completed: true,
        pending: false,
        textbookResource:
          "Miller's Anesthesia, 10th Edition, Chapter 20, Peripheral Venous Access",
      },
      {
        id: 'central-line',
        name: 'Central Line Placement',
        completed: true,
        pending: false,
        textbookResource:
          "Miller's Anesthesia, 10th Edition, Chapter 20, Central Venous Access",
      },
    ],
  },
  {
    id: 'induction',
    name: 'Induction & Maintenance',
    procedures: [
      {
        id: 'induction',
        name: 'General Anesthesia Induction',
        completed: true,
        pending: false,
        textbookResource:
          "Miller's Anesthesia, 10th Edition, Chapter 13, Induction of Anesthesia",
      },
      {
        id: 'emergence',
        name: 'Emergence from Anesthesia',
        completed: true,
        pending: false,
        textbookResource:
          "Miller's Anesthesia, 10th Edition, Chapter 13, Emergence from Anesthesia",
      },
      {
        id: 'maintenance',
        name: 'Maintenance of Anesthesia',
        completed: true,
        pending: false,
        textbookResource:
          "Miller's Anesthesia, 10th Edition, Chapter 13, Maintenance of Anesthesia",
      },
    ],
  },
  {
    id: 'monitoring',
    name: 'Monitoring',
    procedures: [
      {
        id: 'hemodynamic-monitoring',
        name: 'Hemodynamic Monitoring',
        completed: true,
        pending: false,
        textbookResource:
          "Miller's Anesthesia, 10th Edition, Chapter 20, Hemodynamic Monitoring",
      },
      {
        id: 'respiratory-monitoring',
        name: 'Respiratory Monitoring',
        completed: true,
        pending: false,
        textbookResource:
          "Miller's Anesthesia, 10th Edition, Chapter 20, Respiratory Monitoring",
      },
    ],
  },
  {
    id: 'respiratory',
    name: 'Respiratory Management',
    procedures: [
      {
        id: 'mask-ventilation',
        name: 'Mask Ventilation',
        completed: true,
        pending: false,
        textbookResource:
          "Miller's Anesthesia, 10th Edition, Chapter 19, Respiratory Effects of Inhaled Anesthetics",
      },
      {
        id: 'mechanical-ventilation',
        name: 'Mechanical Ventilation',
        completed: true,
        pending: false,
        textbookResource:
          "Miller's Anesthesia, 10th Edition, Chapter 19, Postoperative Pulmonary Complications",
      },
      {
        id: 'weaning',
        name: 'Weaning from Ventilator',
        completed: true,
        pending: false,
        textbookResource:
          "Miller's Anesthesia, 10th Edition, Chapter 19, Mechanical Ventilation",
      },
    ],
  },
  {
    id: 'cardiovascular',
    name: 'Cardiovascular Management',
    procedures: [
      {
        id: 'cardiovascular-effects',
        name: 'Cardiovascular Effects of Anesthetics',
        completed: true,
        pending: false,
        textbookResource:
          "Miller's Anesthesia, 10th Edition, Chapter 18, Cardiovascular Effects of Anesthetics",
      },
      {
        id: 'hemodynamic-instability',
        name: 'Hemodynamic Instability Management',
        completed: true,
        pending: false,
        textbookResource:
          "Miller's Anesthesia, 10th Edition, Chapter 18, Shock and Hemodynamic Instability",
      },
    ],
  },
  {
    id: 'pharmacology',
    name: 'Pharmacology',
    procedures: [
      {
        id: 'iv-anesthetics',
        name: 'Intravenous Anesthetics',
        completed: true,
        pending: false,
        textbookResource:
          "Miller's Anesthesia, 10th Edition, Chapter 11, Intravenous Anesthetics",
      },
      {
        id: 'neuromuscular-blocking',
        name: 'Neuromuscular Blocking Agents',
        completed: true,
        pending: false,
        textbookResource:
          "Miller's Anesthesia, 10th Edition, Chapter 12, Neuromuscular Blocking Agents",
      },
      {
        id: 'reversal-agents',
        name: 'Reversal Agents',
        completed: true,
        pending: false,
        textbookResource:
          "Miller's Anesthesia, 10th Edition, Chapter 12, Reversal of Neuromuscular Blockade",
      },
    ],
  },
  {
    id: 'emergencies',
    name: 'Emergency Management',
    procedures: [
      {
        id: 'malignant-hyperthermia',
        name: 'Malignant Hyperthermia',
        completed: true,
        pending: false,
        textbookResource:
          "Miller's Anesthesia, 10th Edition, Chapter 16, Malignant Hyperthermia",
      },
      {
        id: 'anaphylaxis',
        name: 'Anaphylaxis and Allergic Reactions',
        completed: true,
        pending: false,
        textbookResource:
          "Miller's Anesthesia, 10th Edition, Chapter 16, Anaphylaxis and Allergic Reactions",
      },
      {
        id: 'cardiac-arrest',
        name: 'Cardiac Arrest and Resuscitation',
        completed: true,
        pending: false,
        textbookResource:
          "Miller's Anesthesia, 10th Edition, Chapter 16, Cardiac Arrest and Resuscitation",
      },
    ],
  },
];
