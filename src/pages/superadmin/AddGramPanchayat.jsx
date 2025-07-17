import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { superAdminAPI } from '../../services/api'
import { useToast } from '../../contexts/ToastContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import { ArrowLeft, Building2 } from 'lucide-react'

const AddGramPanchayat = () => {
  const [formData, setFormData] = useState({
    name: '',
    uniqueId: '',
    district: '',
    taluk: '',
    address: '',
    pincode: '',
    state: '',
    contactPerson: {
      name: '',
      mobile: ''
    }
  })
  const [loading, setLoading] = useState(false)
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ]

  const districts = {
    'Karnataka': ['Bangalore Urban', 'Bangalore Rural', 'Mysore', 'Mandya', 'Hassan'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli'],
    'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam']
  }

  const taluks = {
    'Bangalore Urban': ['Bangalore North', 'Bangalore South', 'Anekal'],
    'Mysore': ['Mysore', 'Hunsur', 'Nanjangud'],
    'Chennai': ['Chennai North', 'Chennai South', 'Tambaram']
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('contactPerson.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        contactPerson: {
          ...prev.contactPerson,
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await superAdminAPI.createGramPanchayat(formData)
      showSuccess('Gram Panchayat created successfully!')
      navigate('/super-admin/gram-panchayats')
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to create Gram Panchayat')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/super-admin/gram-panchayats')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Gram Panchayat</h1>
          <p className="text-gray-600 mt-1">Create a new Gram Panchayat in the system</p>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8"
      >
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-gray-900">Gram Panchayat Details</h2>
            <p className="text-gray-600">Fill in the information below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gram Panchayat Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter Gram Panchayat name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unique ID *
              </label>
              <input
                type="text"
                name="uniqueId"
                required
                value={formData.uniqueId}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter unique ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <select
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select State</option>
                {indianStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District *
              </label>
              <select
                name="district"
                required
                value={formData.district}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select District</option>
  <option value="Bagalkot">Bagalkot</option>
  <option value="Ballari">Ballari</option>
  <option value="Belagavi">Belagavi</option>
  <option value="Bengaluru Rural">Bengaluru Rural</option>
  <option value="Bengaluru Urban">Bengaluru Urban</option>
  <option value="Bidar">Bidar</option>
  <option value="Chamarajanagar">Chamarajanagar</option>
  <option value="Chikkaballapura">Chikkaballapura</option>
  <option value="Chikkamagaluru">Chikkamagaluru</option>
  <option value="Chitradurga">Chitradurga</option>
  <option value="Dakshina Kannada">Dakshina Kannada</option>
  <option value="Davanagere">Davanagere</option>
  <option value="Dharwad">Dharwad</option>
  <option value="Gadag">Gadag</option>
  <option value="Hassan">Hassan</option>
  <option value="Haveri">Haveri</option>
  <option value="Kalaburagi">Kalaburagi</option>
  <option value="Kodagu">Kodagu</option>
  <option value="Kolar">Kolar</option>
  <option value="Koppal">Koppal</option>
  <option value="Mandya">Mandya</option>
  <option value="Mysuru">Mysuru</option>
  <option value="Raichur">Raichur</option>
  <option value="Ramanagara">Ramanagara</option>
  <option value="Shivamogga">Shivamogga</option>
  <option value="Tumakuru">Tumakuru</option>
  <option value="Udupi">Udupi</option>
  <option value="Uttara Kannada">Uttara Kannada</option>
  <option value="Vijayapura">Vijayapura</option>
  <option value="Vijayanagara">Vijayanagara</option>
  <option value="Yadgir">Yadgir</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taluk *
              </label>
              <select
                name="taluk"
                required
                value={formData.taluk}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select Taluk</option>
  <optgroup label="Bagalkot District">
    <option value="Badami">Badami</option>
    <option value="Bagalkot">Bagalkot</option>
    <option value="Bilgi">Bilgi</option>
    <option value="Hungund">Hungund</option>
    <option value="Jamkhandi">Jamkhandi</option>
    <option value="Mudhol">Mudhol</option>
  </optgroup>
  <optgroup label="Ballari District">
    <option value="Ballari">Ballari</option>
    <option value="Hagaribommanahalli">Hagaribommanahalli</option>
    <option value="Hospet">Hospet</option>
    <option value="Kudligi">Kudligi</option>
    <option value="Sandur">Sandur</option>
    <option value="Siruguppa">Siruguppa</option>
  </optgroup>
  <optgroup label="Belagavi District">
    <option value="Athani">Athani</option>
    <option value="Bailhongal">Bailhongal</option>
    <option value="Belagavi">Belagavi</option>
    <option value="Chikodi">Chikodi</option>
    <option value="Gokak">Gokak</option>
    <option value="Hukkeri">Hukkeri</option>
    <option value="Khanapur">Khanapur</option>
    <option value="Ramdurg">Ramdurg</option>
    <option value="Raybag">Raybag</option>
    <option value="Saundatti">Saundatti</option>
  </optgroup>
  <optgroup label="Bengaluru Rural District">
    <option value="Devanahalli">Devanahalli</option>
    <option value="Dodda Ballapur">Dodda Ballapur</option>
    <option value="Hoskote">Hoskote</option>
    <option value="Nelamangala">Nelamangala</option>
  </optgroup>
  <optgroup label="Bengaluru Urban District">
    <option value="Anekal">Anekal</option>
    <option value="Bengaluru East">Bengaluru East</option>
    <option value="Bengaluru North">Bengaluru North</option>
    <option value="Bengaluru South">Bengaluru South</option>
    <option value="Yelahanka">Yelahanka</option>
  </optgroup>
  <optgroup label="Bidar District">
    <option value="Aurad">Aurad</option>
    <option value="Basavakalyan">Basavakalyan</option>
    <option value="Bidar">Bidar</option>
    <option value="Bhalki">Bhalki</option>
    <option value="Chitgoppa">Chitgoppa</option>
    <option value="Humnabad">Humnabad</option>
    <option value="Kamalnagar">Kamalnagar</option>
    <option value="Hulasur">Hulasur</option>
  </optgroup>
  <optgroup label="Chamarajanagar District">
    <option value="Chamarajanagar">Chamarajanagar</option>
    <option value="Gundlupet">Gundlupet</option>
    <option value="Kollegal">Kollegal</option>
    <option value="Yelandur">Yelandur</option>
  </optgroup>
  <optgroup label="Chikkaballapura District">
    <option value="Bagepalli">Bagepalli</option>
    <option value="Chikkaballapur">Chikkaballapur</option>
    <option value="Chintamani">Chintamani</option>
    <option value="Gauribidanur">Gauribidanur</option>
    <option value="Gudibanda">Gudibanda</option>
    <option value="Sidlaghatta">Sidlaghatta</option>
  </optgroup>
  <optgroup label="Chikkamagaluru District">
    <option value="Ajjampura">Ajjampura</option>
    <option value="Chikkamagaluru">Chikkamagaluru</option>
    <option value="Kadur">Kadur</option>
    <option value="Kalasa">Kalasa</option>
    <option value="Koppa">Koppa</option>
    <option value="Mudigere">Mudigere</option>
    <option value="Narasimharajapura">Narasimharajapura</option>
    <option value="Sringeri">Sringeri</option>
    <option value="Tarikere">Tarikere</option>
  </optgroup>
  <optgroup label="Chitradurga District">
    <option value="Challakere">Challakere</option>
    <option value="Chitradurga">Chitradurga</option>
    <option value="Hiriyur">Hiriyur</option>
    <option value="Holalkere">Holalkere</option>
    <option value="Hosadurga">Hosadurga</option>
    <option value="Molakalmuru">Molakalmuru</option>
  </optgroup>
  <optgroup label="Dakshina Kannada District">
    <option value="Bantwal">Bantwal</option>
    <option value="Belthangady">Belthangady</option>
    <option value="Kadaba">Kadaba</option>
    <option value="Mangaluru">Mangaluru</option>
    <option value="Puttur">Puttur</option>
    <option value="Sullia">Sullia</option>
  </optgroup>
  <optgroup label="Davanagere District">
    <option value="Channagiri">Channagiri</option>
    <option value="Davanagere">Davanagere</option>
    <option value="Harihar">Harihar</option>
    <option value="Honnali">Honnali</option>
    <option value="Jagalur">Jagalur</option>
    <option value="Nyamati">Nyamati</option>
  </optgroup>
  <optgroup label="Dharwad District">
    <option value="Dharwad">Dharwad</option>
    <option value="Hubli">Hubli</option>
    <option value="Kalghatgi">Kalghatgi</option>
    <option value="Kundgol">Kundgol</option>
    <option value="Navalgund">Navalgund</option>
  </optgroup>
  <optgroup label="Gadag District">
    <option value="Gadag-Betageri">Gadag-Betageri</option>
    <option value="Mundargi">Mundargi</option>
    <option value="Nargund">Nargund</option>
    <option value="Ron">Ron</option>
    <option value="Shirhatti">Shirhatti</option>
  </optgroup>
  <optgroup label="Hassan District">
    <option value="Alur">Alur</option>
    <option value="Arkalgud">Arkalgud</option>
    <option value="Arsikere">Arsikere</option>
    <option value="Belur">Belur</option>
    <option value="Channarayapatna">Channarayapatna</option>
    <option value="Hassan">Hassan</option>
    <option value="Holnarasipura">Holnarasipura</option>
    <option value="Sakaleshpur">Sakaleshpur</option>
  </optgroup>
  <optgroup label="Haveri District">
    <option value="Byadgi">Byadgi</option>
    <option value="Hangal">Hangal</option>
    <option value="Haveri">Haveri</option>
    <option value="Hirekerur">Hirekerur</option>
    <option value="Ranibennur">Ranibennur</option>
    <option value="Savanur">Savanur</option>
    <option value="Shiggaon">Shiggaon</option>
  </optgroup>
  <optgroup label="Kalaburagi District">
    <option value="Afzalpur">Afzalpur</option>
    <option value="Aland">Aland</option>
    <option value="Chincholi">Chincholi</option>
    <option value="Chitapur">Chitapur</option>
    <option value="Jevargi">Jevargi</option>
    <option value="Kalaburagi">Kalaburagi</option>
    <option value="Sedam">Sedam</option>
  </optgroup>
  <optgroup label="Kodagu District">
    <option value="Madikeri">Madikeri</option>
    <option value="Somvarpet">Somvarpet</option>
    <option value="Virajpet">Virajpet</option>
  </optgroup>
  <optgroup label="Kolar District">
    <option value="Bangarapet">Bangarapet</option>
    <option value="Kolar">Kolar</option>
    <option value="Malur">Malur</option>
    <option value="Mulbagal">Mulbagal</option>
    <option value="Srinivaspur">Srinivaspur</option>
  </optgroup>
  <optgroup label="Koppal District">
    <option value="Gangavathi">Gangavathi</option>
    <option value="Koppal">Koppal</option>
    <option value="Kushtagi">Kushtagi</option>
    <option value="Yelbarga">Yelbarga</option>
  </optgroup>
  <optgroup label="Mandya District">
    <option value="Krishnarajpet">Krishnarajpet</option>
    <option value="Maddur">Maddur</option>
    <option value="Malavalli">Malavalli</option>
    <option value="Mandya">Mandya</option>
    <option value="Nagamangala">Nagamangala</option>
    <option value="Pandavapura">Pandavapura</option>
    <option value="Srirangapatna">Srirangapatna</option>
  </optgroup>
  <optgroup label="Mysuru District">
    <option value="Heggadadevankote">Heggadadevankote</option>
    <option value="Hunsur">Hunsur</option>
    <option value="Krishnarajasagara">Krishnarajasagara</option>
    <option value="Mysuru">Mysuru</option>
    <option value="Nanjangud">Nanjangud</option>
    <option value="Periyapatna">Periyapatna</option>
    <option value="T.Narasipur">T.Narasipur</option>
  </optgroup>
  <optgroup label="Raichur District">
    <option value="Devadurga">Devadurga</option>
    <option value="Lingsugur">Lingsugur</option>
    <option value="Manvi">Manvi</option>
    <option value="Raichur">Raichur</option>
    <option value="Sindhanur">Sindhanur</option>
  </optgroup>
  <optgroup label="Ramanagara District">
    <option value="Channapatna">Channapatna</option>
    <option value="Kanakapura">Kanakapura</option>
    <option value="Magadi">Magadi</option>
    <option value="Ramanagara">Ramanagara</option>
  </optgroup>
  <optgroup label="Shivamogga District">
    <option value="Bhadravati">Bhadravati</option>
    <option value="Hosanagara">Hosanagara</option>
    <option value="Sagar">Sagar</option>
    <option value="Shikaripura">Shikaripura</option>
    <option value="Shivamogga">Shivamogga</option>
    <option value="Sorab">Sorab</option>
    <option value="Thirthahalli">Thirthahalli</option>
  </optgroup>
  <optgroup label="Tumakuru District">
    <option value="Chiknayakanhalli">Chiknayakanhalli</option>
    <option value="Gubbi">Gubbi</option>
    <option value="Koratagere">Koratagere</option>
    <option value="Kunigal">Kunigal</option>
    <option value="Madhugiri">Madhugiri</option>
    <option value="Pavagada">Pavagada</option>
    <option value="Sira">Sira</option>
    <option value="Tiptur">Tiptur</option>
    <option value="Tumakuru">Tumakuru</option>
    <option value="Turuvekere">Turuvekere</option>
  </optgroup>
  <optgroup label="Udupi District">
    <option value="Brahmavar">Brahmavar</option>
    <option value="Karkal">Karkal</option>
    <option value="Kundapura">Kundapura</option>
    <option value="Udupi">Udupi</option>
  </optgroup>
  <optgroup label="Uttara Kannada District">
    <option value="Ankola">Ankola</option>
    <option value="Bhatkal">Bhatkal</option>
    <option value="Dandeli">Dandeli</option>
    <option value="Haliyal">Haliyal</option>
    <option value="Honnavar">Honnavar</option>
    <option value="Joida">Joida</option>
    <option value="Karwar">Karwar</option>
    <option value="Kumta">Kumta</option>
    <option value="Mundgod">Mundgod</option>
    <option value="Siddapur">Siddapur</option>
    <option value="Sirsi">Sirsi</option>
    <option value="Yellapur">Yellapur</option>
  </optgroup>
  <optgroup label="Vijayapura District">
    <option value="Basavana Bagewadi">Basavana Bagewadi</option>
    <option value="Indi">Indi</option>
    <option value="Muddebihal">Muddebihal</option>
    <option value="Sindagi">Sindagi</option>
    <option value="Vijayapura">Vijayapura</option>
  </optgroup>
  <optgroup label="Vijayanagara District">
    <option value="Harpanahalli">Harpanahalli</option>
    <option value="Huvina Hadagali">Huvina Hadagali</option>
    <option value="Kottur">Kottur</option>
  </optgroup>
  <optgroup label="Yadgir District">
    <option value="Shahpur">Shahpur</option>
    <option value="Shorapur">Shorapur</option>
    <option value="Yadgir">Yadgir</option>
  </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode *
              </label>
              <input
                type="text"
                name="pincode"
                required
                value={formData.pincode}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter pincode"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complete Address *
            </label>
            <textarea
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="input-field"
              placeholder="Enter complete address"
            />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Person Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person Name *
                </label>
                <input
                  type="text"
                  name="contactPerson.name"
                  required
                  value={formData.contactPerson.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter contact person name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person Mobile *
                </label>
                <input
                  type="tel"
                  name="contactPerson.mobile"
                  required
                  value={formData.contactPerson.mobile}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter mobile number"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/super-admin/gram-panchayats')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center"
            >
              {loading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                'Create Gram Panchayat'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default AddGramPanchayat