import { useState, useRef } from 'react';
import { UploadCloud, FileText, Pill, X, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function AIScanner() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    // --- Drag and Drop Handlers ---
    const handleDragOver = (e) => e.preventDefault();
    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (selectedFile) => {
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
        setResult(null); // Clear old results
        setError(null);
    };

    const clearFile = () => {
        setFile(null);
        setPreview(null);
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // --- The AI API Call ---
    const analyzeImage = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('api/pharmacy/digitize/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Clean the AI text in case Gemini wrapped it in markdown ```json ... ```
            let aiText = response.data.extracted_text;
            if (aiText.includes('```json')) {
                aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
            }

            const parsedData = JSON.parse(aiText);
            setResult(parsedData);

        } catch (err) {
            console.error(err);
            setError("Failed to analyze image. Ensure your backend is running and API key is valid.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Dhanvantri    AI Analyzer</h2>
            <p className="text-slate-400 mb-6">Upload a prescription or medicine packaging to automatically extract pharmaceutical data.</p>

            {/* --- Drag & Drop Zone --- */}
            {!preview ? (
                <div 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-900/50 rounded-2xl p-12 text-center cursor-pointer transition-colors flex flex-col items-center justify-center"
                >
                    <UploadCloud className="w-16 h-16 text-slate-400 mb-4" />
                    <p className="text-slate-300 font-medium text-lg">Click or drag image here</p>
                    <p className="text-slate-500 text-sm mt-2">Supports JPG, PNG (Max 5MB)</p>
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                </div>
            ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center relative shadow-lg">
                    <button onClick={clearFile} className="absolute top-4 right-4 p-1 bg-slate-800 hover:bg-rose-500 rounded-full text-slate-300 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                    <img src={preview} alt="Upload Preview" className="max-h-64 rounded-lg object-contain mb-6 shadow-md" />
                    
                    <button 
                        onClick={analyzeImage} 
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-8 rounded-lg flex items-center shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50"
                    >
                        {loading ? <><Loader2 className="animate-spin mr-2" size={20} /> Analyzing Image...</> : 'Run Vision AI'}
                    </button>
                </div>
            )}

            {/* --- Error Message --- */}
            {error && (
                <div className="bg-rose-950/50 border border-rose-900 text-rose-400 p-4 rounded-lg text-center">
                    {error}
                </div>
            )}

            {/* --- Dynamic Results Output --- */}
            {result && (
                <div className="animate-fade-in-up mt-8">
                    {result.image_type === "Prescription" ? (
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
                            <div className="flex items-center text-emerald-400 mb-4 pb-4 border-b border-slate-700">
                                <FileText className="mr-3" size={28} />
                                <h3 className="text-xl font-bold">Prescription Digitized</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div><span className="text-slate-500 block text-sm">Patient Name</span><span className="text-slate-200 font-medium">{result.prescription_data?.patient_name || 'N/A'}</span></div>
                                <div><span className="text-slate-500 block text-sm">Date</span><span className="text-slate-200 font-medium">{result.prescription_data?.date || 'N/A'}</span></div>
                            </div>
                            <div>
                                <span className="text-slate-500 block text-sm mb-2">Medications Found</span>
                                <ul className="space-y-2">
                                    {result.prescription_data?.medications_found?.map((med, idx) => (
                                        <li key={idx} className="bg-slate-900 p-3 rounded border border-slate-700 text-slate-300 flex items-center">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>{med}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
                            <div className="flex items-center text-indigo-400 mb-4 pb-4 border-b border-slate-700">
                                <Pill className="mr-3" size={28} />
                                <h3 className="text-xl font-bold">Medicine Profile Extracted</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                                    <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Brand Name</span>
                                    <span className="text-slate-200 font-bold text-lg">{result.medicine_data?.brand_name || 'N/A'}</span>
                                </div>
                                <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                                    <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Category</span>
                                    <span className="text-slate-200 font-medium">{result.medicine_data?.category || 'N/A'}</span>
                                </div>
                                <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 md:col-span-2">
                                    <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Chemical Components</span>
                                    <span className="text-slate-300">{result.medicine_data?.chemical_components || 'N/A'}</span>
                                </div>
                                <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 md:col-span-2">
                                    <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Primary Use</span>
                                    <span className="text-slate-300">{result.medicine_data?.primary_use || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}