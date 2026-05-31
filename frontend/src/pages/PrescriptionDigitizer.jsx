import { useState } from 'react';
import { UploadCloud, FileText, CheckCircle } from 'lucide-react';

export default function PrescriptionDigitizer() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setExtractedText(""); // Reset text if new file is uploaded
    }
  };

  const handleDigitize = () => {
    if (!file) return;
    
    setIsProcessing(true);
    
    // Simulating an API call to your Django OCR backend
    setTimeout(() => {
      setExtractedText("Patient Name: John Doe\nDate: 2026-04-22\n\nRx:\n1. Azithromycin 250mg - Take 2 tablets on day 1, then 1 tablet daily for 4 days.\n2. Ibuprofen 400mg - Take 1 tablet every 6 hours as needed for pain.");
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Prescription OCR Digitizer</h2>
        <p className="text-gray-500">Upload a handwritten or printed prescription to extract medical data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center h-80">
          <UploadCloud size={48} className="text-blue-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Upload Prescription Image</h3>
          <p className="text-sm text-gray-500 mb-6">Supports JPG, PNG, or PDF</p>
          
          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            accept="image/*,.pdf"
            onChange={handleFileChange}
          />
          <label 
            htmlFor="file-upload" 
            className="cursor-pointer bg-blue-50 text-blue-700 font-semibold py-2 px-6 rounded-lg border border-blue-200 hover:bg-blue-100 transition"
          >
            Browse Files
          </label>

          {file && (
            <p className="mt-4 text-sm font-medium text-green-600 flex items-center">
              <CheckCircle size={16} className="mr-1" /> {file.name} selected
            </p>
          )}
        </div>

        {/* Results Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-80">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="text-gray-600" size={20} />
            <h3 className="text-lg font-medium text-gray-800">Extracted Text</h3>
          </div>
          
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-y-auto">
            {isProcessing ? (
              <div className="flex items-center justify-center h-full text-blue-600 font-medium animate-pulse">
                Analyzing document with AI...
              </div>
            ) : extractedText ? (
              <pre className="whitespace-pre-wrap font-sans text-gray-700">{extractedText}</pre>
            ) : (
              <p className="text-gray-400 text-center mt-16">Digitized text will appear here.</p>
            )}
          </div>

          <button 
            onClick={handleDigitize}
            disabled={!file || isProcessing}
            className={`mt-4 w-full py-3 rounded-lg font-bold text-white transition ${
              !file || isProcessing ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isProcessing ? 'Processing...' : 'Run OCR Scanner'}
          </button>
        </div>
      </div>
    </div>
  );
}