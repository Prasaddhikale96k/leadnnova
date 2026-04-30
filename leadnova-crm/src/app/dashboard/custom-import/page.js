'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUpload, FiFile, FiCheck, FiX, FiDownload, FiChevronDown, FiMail, FiMessageSquare, FiSend, FiLoader, FiAlertTriangle } from 'react-icons/fi'
import OutreachModal from '@/components/outreach/OutreachModal'

export default function CustomImportPage() {
  const [uploadedData, setUploadedData] = useState([])
  const [columnMapping, setColumnMapping] = useState({})
  const [showMapping, setShowMapping] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState(new Set())
  const [showOutreachModal, setShowOutreachModal] = useState(false)

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error('CSV parsing errors:', results.errors)
          return
        }

        setUploadedData(results.data)
        // Auto-detect columns
        const detectedColumns = Object.keys(results.data[0] || {})
        const autoMapping = {}

        // Required mappings
        const nameColumn = detectedColumns.find(col =>
          col.toLowerCase().includes('name') && !col.toLowerCase().includes('business')
        )
        const businessColumn = detectedColumns.find(col =>
          col.toLowerCase().includes('business') ||
          col.toLowerCase().includes('company') ||
          col.toLowerCase().includes('organization')
        )

        if (nameColumn) autoMapping.name = nameColumn
        if (businessColumn) autoMapping.businessName = businessColumn

        // Optional mappings
        const emailColumn = detectedColumns.find(col => col.toLowerCase().includes('email'))
        const phoneColumn = detectedColumns.find(col =>
          col.toLowerCase().includes('phone') ||
          col.toLowerCase().includes('mobile') ||
          col.toLowerCase().includes('contact')
        )
        const cityColumn = detectedColumns.find(col => col.toLowerCase().includes('city'))
        const categoryColumn = detectedColumns.find(col =>
          col.toLowerCase().includes('category') ||
          col.toLowerCase().includes('industry') ||
          col.toLowerCase().includes('type')
        )

        if (emailColumn) autoMapping.email = emailColumn
        if (phoneColumn) autoMapping.phone = phoneColumn
        if (cityColumn) autoMapping.city = cityColumn
        if (categoryColumn) autoMapping.category = categoryColumn

        setColumnMapping(autoMapping)
        setShowMapping(true)
      }
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
      'text/plain': ['.csv']
    },
    multiple: false
  })

  const handleMappingChange = (field, column) => {
    setColumnMapping(prev => ({
      ...prev,
      [field]: column
    }))
  }

  const applyMapping = () => {
    // Transform data using mapping
    const mappedData = uploadedData.map((row, index) => ({
      id: `imported-${index}`,
      name: row[columnMapping.name] || '',
      businessName: row[columnMapping.businessName] || '',
      email: row[columnMapping.email] || '',
      phone: row[columnMapping.phone] || '',
      city: row[columnMapping.city] || '',
      category: row[columnMapping.category] || '',
      source: 'custom-import'
    }))

    setUploadedData(mappedData)
    setShowMapping(false)
  }

  const toggleSelectLead = (leadId) => {
    const newSet = new Set(selectedLeads)
    if (newSet.has(leadId)) {
      newSet.delete(leadId)
    } else {
      newSet.add(leadId)
    }
    setSelectedLeads(newSet)
  }

  const toggleSelectAll = () => {
    if (selectedLeads.size === uploadedData.length) {
      setSelectedLeads(new Set())
    } else {
      setSelectedLeads(new Set(uploadedData.map(lead => lead.id)))
    }
  }

  const handleOutreach = (type, config) => {
    const selectedData = uploadedData.filter(lead => selectedLeads.has(lead.id))
    console.log('Starting outreach:', type, 'for', selectedData.length, 'leads')

    // Here you would implement the actual outreach logic
    // For now, just close the modal
    setShowOutreachModal(false)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] relative">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">📤 Custom Import</h1>
                <p className="text-gray-600 mt-1">Upload your own lead lists and launch AI-powered outreach</p>
              </div>
              {uploadedData.length > 0 && (
                <button
                  onClick={() => setShowOutreachModal(true)}
                  disabled={selectedLeads.size === 0}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FiSend size={16} />
                  Generate Outreach ({selectedLeads.size})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {uploadedData.length === 0 ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <div
                {...getRootProps()}
                className={`w-full max-w-lg p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <div className="text-center">
                  <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Upload CSV to Begin
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Drop your CSV file here or click to browse
                  </p>
                  <p className="text-xs text-gray-400">
                    Supports: Name, Business Name, Email, Phone, City, Category
                  </p>
                </div>
              </div>

              {/* Sample CSV Download */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 mb-2">Need a template?</p>
                <a
                  href="/api/sample-csv"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg hover:bg-blue-50"
                >
                  <FiDownload size={14} />
                  Download Sample CSV
                </a>
              </div>
            </motion.div>
          ) : showMapping ? (
            <motion.div
              key="mapping"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Map Your Columns</h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={columnMapping.name || ''}
                        onChange={(e) => handleMappingChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select column...</option>
                        {Object.keys(uploadedData[0] || {}).map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Name <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={columnMapping.businessName || ''}
                        onChange={(e) => handleMappingChange('businessName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select column...</option>
                        {Object.keys(uploadedData[0] || {}).map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <select
                        value={columnMapping.email || ''}
                        onChange={(e) => handleMappingChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select column...</option>
                        {Object.keys(uploadedData[0] || {}).map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <select
                        value={columnMapping.phone || ''}
                        onChange={(e) => handleMappingChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select column...</option>
                        {Object.keys(uploadedData[0] || {}).map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <select
                        value={columnMapping.city || ''}
                        onChange={(e) => handleMappingChange('city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select column...</option>
                        {Object.keys(uploadedData[0] || {}).map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={columnMapping.category || ''}
                        onChange={(e) => handleMappingChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select column...</option>
                        {Object.keys(uploadedData[0] || {}).map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setUploadedData([])
                      setShowMapping(false)
                      setColumnMapping({})
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyMapping}
                    disabled={!columnMapping.name || !columnMapping.businessName}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply Mapping
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Leads</p>
                      <p className="text-2xl font-bold text-gray-900">{uploadedData.length}</p>
                    </div>
                    <FiFile className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">With Email</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {uploadedData.filter(lead => lead.email).length}
                      </p>
                    </div>
                    <FiMail className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">With Phone</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {uploadedData.filter(lead => lead.phone).length}
                      </p>
                    </div>
                    <FiMessageSquare className="h-8 w-8 text-purple-500" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Selected</p>
                      <p className="text-2xl font-bold text-gray-900">{selectedLeads.size}</p>
                    </div>
                    <FiCheck className="h-8 w-8 text-orange-500" />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={selectedLeads.size === uploadedData.length && uploadedData.length > 0}
                            onChange={toggleSelectAll}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Business
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          City
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {uploadedData.map((lead, index) => (
                        <tr key={lead.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedLeads.has(lead.id)}
                              onChange={() => toggleSelectLead(lead.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {lead.name || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.businessName || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-2">
                            {lead.email || '-'}
                            {lead.email && !lead.phone && (
                              <FiAlertTriangle className="h-4 w-4 text-yellow-500" title="No phone number available for WhatsApp" />
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-2">
                            {lead.phone || '-'}
                            {lead.phone && !lead.email && (
                              <FiAlertTriangle className="h-4 w-4 text-yellow-500" title="No email available for email outreach" />
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {lead.city || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {lead.category || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Outreach Modal */}
      <OutreachModal
        isOpen={showOutreachModal}
        onClose={() => setShowOutreachModal(false)}
        selectedLeads={uploadedData.filter(lead => selectedLeads.has(lead.id))}
        onOutreach={handleOutreach}
      />
    </div>
  )
}