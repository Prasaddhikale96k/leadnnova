'use client'

export const INDIAN_STATES = [
  { name: 'Andhra Pradesh', code: 'AP', capital: 'Amaravati', cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Nellore', 'Kurnool', 'Rajahmundry', 'Kadapa'] },
  { name: 'Arunachal Pradesh', code: 'AR', capital: 'Itanagar', cities: ['Itanagar', 'Naharlagun', 'Tawang', 'Ziro', 'Pasighat'] },
  { name: 'Assam', code: 'AS', capital: 'Dispur', cities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Tezpur', 'Bongaigaon'] },
  { name: 'Bihar', code: 'BR', capital: 'Patna', cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia', 'Bihar Sharif'] },
  { name: 'Chhattisgarh', code: 'CG', capital: 'Raipur', cities: ['Raipur', 'Bhilai', 'Bilaspur', 'Durg', 'Rajnandgaon'] },
  { name: 'Delhi', code: 'DL', capital: 'New Delhi', cities: ['New Delhi', 'Connaught Place', 'Dwarka', 'Rohini', 'Saket', 'Vasant Kunj', 'Lajpat Nagar', 'Karol Bagh'] },
  { name: 'Goa', code: 'GA', capital: 'Panaji', cities: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'] },
  { name: 'Gujarat', code: 'GJ', capital: 'Gandhinagar', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand', 'Morbi'] },
  { name: 'Haryana', code: 'HR', capital: 'Chandigarh', cities: ['Gurgaon', 'Faridabad', 'Ambala', 'Hisar', 'Panipat', 'Karnal', 'Rohtak', 'Sonipat'] },
  { name: 'Himachal Pradesh', code: 'HP', capital: 'Shimla', cities: ['Shimla', 'Mandi', 'Solan', 'Dharamshala', 'Kullu', 'Manali'] },
  { name: 'Jammu and Kashmir', code: 'JK', capital: 'Srinagar', cities: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur'] },
  { name: 'Jharkhand', code: 'JH', capital: 'Ranchi', cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh'] },
  { name: 'Karnataka', code: 'KA', capital: 'Bengaluru', cities: ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru', 'Belgaum', 'Dharwad', 'Tumkur', 'Bellary', 'Hassan'] },
  { name: 'Kerala', code: 'KL', capital: 'Thiruvananthapuram', cities: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Kannur'] },
  { name: 'Madhya Pradesh', code: 'MP', capital: 'Bhopal', cities: ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Rewa', 'Sagar'] },
  { name: 'Maharashtra', code: 'MH', capital: 'Mumbai', cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Thane', 'Solapur', 'Kolhapur', 'Navi Mumbai', 'Sangli', 'Amravati', 'Latur'] },
  { name: 'Manipur', code: 'MN', capital: 'Imphal', cities: ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur'] },
  { name: 'Meghalaya', code: 'ML', capital: 'Shillong', cities: ['Shillong', 'Tura', 'Jowai', 'Baghmara'] },
  { name: 'Mizoram', code: 'MZ', capital: 'Aizawl', cities: ['Aizawl', 'Lunglei', 'Champhai', 'Kolasib'] },
  { name: 'Nagaland', code: 'NL', capital: 'Kohima', cities: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang'] },
  { name: 'Odisha', code: 'OD', capital: 'Bhubaneswar', cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri'] },
  { name: 'Punjab', code: 'PB', capital: 'Chandigarh', cities: ['Amritsar', 'Ludhiana', 'Jalandhar', 'Chandigarh', 'Patiala', 'Bathinda', 'Hoshiarpur'] },
  { name: 'Rajasthan', code: 'RJ', capital: 'Jaipur', cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Alwar', 'Bhilwara', 'Pilani'] },
  { name: 'Sikkim', code: 'SK', capital: 'Gangtok', cities: ['Gangtok', 'Namchi', 'Gyalshing', 'Pakyong'] },
  { name: 'Tamil Nadu', code: 'TN', capital: 'Chennai', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli', 'Tiruppur', 'Vellore', 'Erode', 'Tirunelveli', 'Thoothukudi'] },
  { name: 'Telangana', code: 'TS', capital: 'Hyderabad', cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Secunderabad', 'Ramagundam'] },
  { name: 'Tripura', code: 'TR', capital: 'Agartala', cities: ['Agartala', 'Udaipur', 'Dharmanagar', 'Belonia'] },
  { name: 'Uttar Pradesh', code: 'UP', capital: 'Lucknow', cities: ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Noida', 'Ghaziabad', 'Allahabad', 'Meerut', 'Aligarh', 'Bareilly', 'Moradabad', 'Gorakhpur'] },
  { name: 'Uttarakhand', code: 'UK', capital: 'Dehradun', cities: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rishikesh', 'Kashipur'] },
  { name: 'West Bengal', code: 'WB', capital: 'Kolkata', cities: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Murshidabad', 'Bardhaman', 'Kharagpur', 'Malda'] },
]

export const POPULAR_NICHES = [
  { label: 'CA Firms', emoji: '📊' },
  { label: 'IT Companies', emoji: '💻' },
  { label: 'Restaurants', emoji: '🍽️' },
  { label: 'Hospitals', emoji: '🏥' },
  { label: 'Real Estate', emoji: '🏠' },
  { label: 'Hotels', emoji: '🏨' },
  { label: 'Lawyers', emoji: '⚖️' },
  { label: 'Digital Marketing', emoji: '📱' },
  { label: 'Coaching Centers', emoji: '📚' },
  { label: 'Pharmacies', emoji: '💊' },
  { label: 'Gyms', emoji: '💪' },
  { label: 'Event Planners', emoji: '🎉' },
  { label: 'Architects', emoji: '🏗️' },
  { label: 'Travel Agents', emoji: '✈️' },
  { label: 'Printing Services', emoji: '🖨️' },
  { label: 'Salons & Spas', emoji: '💅' },
  { label: 'Auto Showrooms', emoji: '🚗' },
  { label: 'Banks', emoji: '🏦' },
]

export const POPULAR_CITIES = [
  'Mumbai', 'New Delhi', 'Bangalore', 'Chennai', 
  'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad',
  'Jaipur', 'Surat', 'Lucknow', 'Kochi', 'Gurgaon', 'Noida'
]

export const getCitiesForState = (stateName) => {
  const state = INDIAN_STATES.find(s => s.name === stateName)
  return state ? state.cities : []
}

export const formatIndianPhone = (phone) => {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0,5)} ${cleaned.slice(5)}`
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+91 ${cleaned.slice(2,7)} ${cleaned.slice(7)}`
  }
  return phone
}