import { useState } from "react";
import toast from "react-hot-toast";

const INDIAN_CITIES = {
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane"],
  "Delhi": ["New Delhi", "Delhi", "Noida", "Gurgaon", "Faridabad"],
  "Karnataka": ["Bengaluru", "Mysore", "Hubli", "Mangalore", "Belgaum"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri", "Asansol"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Allahabad"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
  "Haryana": ["Faridabad", "Gurugram", "Panipat", "Ambala", "Hisar"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur"],
  "Kerala": ["Kochi", "Thiruvananthapuram", "Kozhikode", "Kollam", "Thrissur"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool"],
};

const PINCODE_DATA = {
  "400001": { city: "Mumbai", state: "Maharashtra" },
  "411001": { city: "Pune", state: "Maharashtra" },
  "110001": { city: "New Delhi", state: "Delhi" },
  "560001": { city: "Bengaluru", state: "Karnataka" },
  "600001": { city: "Chennai", state: "Tamil Nadu" },
  "700001": { city: "Kolkata", state: "West Bengal" },
  "500001": { city: "Hyderabad", state: "Telangana" },
  "380001": { city: "Ahmedabad", state: "Gujarat" },
  "302001": { city: "Jaipur", state: "Rajasthan" },
  "452001": { city: "Indore", state: "Madhya Pradesh" },
  "201301": { city: "Noida", state: "Uttar Pradesh" },
  "122001": { city: "Gurugram", state: "Haryana" },
};

const Dropdown = ({ items, onSelect }) => (
  <div
    className="absolute z-20 w-full mt-1 rounded-xl overflow-hidden"
    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-md)' }}
  >
    {items.map(item => (
      <div
        key={item}
        className="px-4 py-2.5 text-sm cursor-pointer transition-colors"
        style={{ color: 'var(--text-primary)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-raised)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        onClick={() => onSelect(item)}
      >
        {item}
      </div>
    ))}
  </div>
);

const Label = ({ children }) => (
  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>{children}</label>
);

export default function AddressAutocomplete({ address, setAddress }) {
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [stateSuggestions, setStateSuggestions] = useState([]);
  const [showCity, setShowCity] = useState(false);
  const [showState, setShowState] = useState(false);

  const handlePincodeChange = (pincode) => {
    setAddress({ ...address, pincode });
    if (PINCODE_DATA[pincode]) {
      setAddress(prev => ({ ...prev, city: PINCODE_DATA[pincode].city, state: PINCODE_DATA[pincode].state, pincode }));
      toast.success("Address auto-filled!");
    }
  };

  const handleCityChange = (city) => {
    setAddress({ ...address, city });
    const suggestions = [];
    Object.values(INDIAN_CITIES).forEach(cities =>
      cities.filter(c => c.toLowerCase().includes(city.toLowerCase())).forEach(c => !suggestions.includes(c) && suggestions.push(c))
    );
    setCitySuggestions(suggestions.slice(0, 5));
    setShowCity(suggestions.length > 0);
  };

  const handleStateChange = (state) => {
    setAddress({ ...address, state });
    const suggestions = Object.keys(INDIAN_CITIES).filter(s => s.toLowerCase().includes(state.toLowerCase()));
    setStateSuggestions(suggestions.slice(0, 5));
    setShowState(suggestions.length > 0);
  };

  const selectCity = (city) => {
    let foundState = "";
    for (const [state, cities] of Object.entries(INDIAN_CITIES)) {
      if (cities.includes(city)) { foundState = state; break; }
    }
    setAddress({ ...address, city, state: foundState || address.state });
    setShowCity(false);
  };

  return (
    <div className="space-y-3">
      <div>
        <Label>Street Address *</Label>
        <input type="text" value={address.street}
          onChange={e => setAddress({ ...address, street: e.target.value })}
          placeholder="House No, Street, Area, Landmark"
          className="input-base" />
      </div>

      <div>
        <Label>Pincode *</Label>
        <input type="text" value={address.pincode}
          onChange={e => handlePincodeChange(e.target.value)}
          placeholder="6-digit pincode" maxLength="6"
          className="input-base" />
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>💡 Pincode auto-fills city & state</p>
      </div>

      <div className="relative">
        <Label>City *</Label>
        <input type="text" value={address.city}
          onChange={e => handleCityChange(e.target.value)}
          placeholder="City"
          className="input-base"
          onFocus={() => address.city && setShowCity(true)}
          onBlur={() => setTimeout(() => setShowCity(false), 200)}
        />
        {showCity && citySuggestions.length > 0 && <Dropdown items={citySuggestions} onSelect={selectCity} />}
      </div>

      <div className="relative">
        <Label>State *</Label>
        <input type="text" value={address.state}
          onChange={e => handleStateChange(e.target.value)}
          placeholder="State"
          className="input-base"
          onFocus={() => address.state && setShowState(true)}
          onBlur={() => setTimeout(() => setShowState(false), 200)}
        />
        {showState && stateSuggestions.length > 0 && (
          <Dropdown items={stateSuggestions} onSelect={s => { setAddress({ ...address, state: s, city: "" }); setShowState(false); }} />
        )}
      </div>

      <div>
        <Label>Country</Label>
        <input type="text" value={address.country}
          onChange={e => setAddress({ ...address, country: e.target.value })}
          placeholder="Country"
          className="input-base" />
      </div>
    </div>
  );
}