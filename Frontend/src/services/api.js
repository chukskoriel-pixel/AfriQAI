const API = "https://afriqai-backend-3bvz.onrender.com";

export const getBrief = async () => {
  const res = await fetch(`${API}/api/brief`);
  return res.json();
};

export const getSignals = async () => {
  const res = await fetch(`${API}/api/signals`);
  return res.json();
};

export const getIntelligence = async () => {
  const res = await fetch(`${API}/api/intelligence`);
  return res.json();
};