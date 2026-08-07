const STORAGE_KEY = 'agora_simulations';

const SEED_DATA = [
  { id: 1, date: new Date().toISOString(), scenario: "Job Offer Negotiation", agents: "Candidate vs HR", outcome: "Reached", rounds: 7 },
  { id: 2, date: new Date().toISOString(), scenario: "Vendor Pricing Negotiation", agents: "Buyer vs Supplier", outcome: "Walk Away", rounds: 4 },
  { id: 3, date: new Date().toISOString(), scenario: "Project Budget Allocation", agents: "Marketing vs Engineering", outcome: "Reached", rounds: 8 },
  { id: 4, date: new Date().toISOString(), scenario: "Vendor Pricing Negotiation", agents: "Buyer vs Supplier", outcome: "Reached", rounds: 5 },
  { id: 5, date: new Date().toISOString(), scenario: "Job Offer Negotiation", agents: "Candidate vs HR", outcome: "Walk Away", rounds: 9 },
  { id: 6, date: new Date().toISOString(), scenario: "Project Budget Allocation", agents: "Marketing vs Engineering", outcome: "Reached", rounds: 6 },
  { id: 7, date: new Date().toISOString(), scenario: "Vendor Pricing Negotiation", agents: "Buyer vs Supplier", outcome: "Reached", rounds: 5 },
  { id: 8, date: new Date().toISOString(), scenario: "Job Offer Negotiation", agents: "Candidate vs HR", outcome: "Reached", rounds: 7 },
  { id: 9, date: new Date().toISOString(), scenario: "Project Budget Allocation", agents: "Marketing vs Engineering", outcome: "Walk Away", rounds: 5 },
  { id: 10, date: new Date().toISOString(), scenario: "Vendor Pricing Negotiation", agents: "Buyer vs Supplier", outcome: "Reached", rounds: 8 },
  { id: 11, date: new Date().toISOString(), scenario: "Job Offer Negotiation", agents: "Candidate vs HR", outcome: "Reached", rounds: 4 },
  { id: 12, date: new Date().toISOString(), scenario: "Project Budget Allocation", agents: "Marketing vs Engineering", outcome: "Walk Away", rounds: 6 },
];

export const getSimulations = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
        return SEED_DATA;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading from localStorage', error);
    return SEED_DATA;
  }
};

export const saveSimulation = (simulation) => {
  try {
    const current = getSimulations();
    // Add new simulation at the beginning
    const updated = [simulation, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error saving to localStorage', error);
  }
};

export const clearSimulations = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing localStorage', error);
  }
};
