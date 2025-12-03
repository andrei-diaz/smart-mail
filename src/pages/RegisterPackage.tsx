import { useState, useRef } from 'react';
import { Camera, Check, RotateCcw, X, Plus, Search } from 'lucide-react';
import { MOCK_USERS, type User } from '../data/users';
import { CarrierLogo } from '../components/CarrierLogo';
import { QuarantineInfo } from '../components/QuarantineInfo';

interface PackageData {
    carrier: string;
    trackingNumber: string;
    recipient: string;
    packageCategory: string;
    packageSize: string;
    location: string;
    rackNumber: string;
    colorLabel: string;
    registeredBy: string;
    registeredDate: string;
    deliveryDate: string;
    status: 'Delivered' | 'Not-Delivered' | 'Dead';
}

function RegisterPackage() {
    const [formData, setFormData] = useState({
        carrier: '',
        trackingNumber: '',
        recipient: '',
        packageCategory: '',
        packageSize: '',
        location: '',
        rackNumber: '',
        colorLabel: '',
        registeredBy: '',
    });

    const [showSuccess, setShowSuccess] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    // Recipient Validation State
    const [suggestions, setSuggestions] = useState<User[]>([]);
    const [identifiedUser, setIdentifiedUser] = useState<User | null>(null);
    const [isUnknownRecipient, setIsUnknownRecipient] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);

    const carriers = ['Amazon', 'Mercado Libre', 'DHL', 'J&T', 'Estafeta', 'UPS', 'Correos de México', 'FedEx', 'Otro'];
    const packageCategories = ['Caja', 'Sobre', 'Paquete', 'Bolsa', 'Otro'];
    const packageSizes = ['Chico', 'Mediano', 'Grande'];
    const rackNumbers = ['1', '2', '3', '4', '5'];

    // Smart Location Logic
    const getAvailableLocations = (carrier: string, size: string) => {
        let locations: string[] = [];

        // Generate all base locations (A1-E4 for example)
        const rows = ['A', 'B', 'C', 'D', 'E'];
        const cols = ['1', '2', '3', '4'];

        rows.forEach(row => {
            cols.forEach(col => {
                locations.push(`${row}${col}`);
            });
        });

        // Filter by Carrier
        if (carrier === 'Amazon') {
            // Amazon only A1-C2
            const amazonAllowed = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
            locations = locations.filter(loc => amazonAllowed.includes(loc));
        }

        // Filter by Size
        if (size === 'Chico') {
            // Small only A1, A2 (High density)
            const smallAllowed = ['A1', 'A2'];
            locations = locations.filter(loc => smallAllowed.includes(loc));
        }

        return locations;
    };

    const availableLocations = getAvailableLocations(formData.carrier, formData.packageSize);

    const colorLabels = [
        { name: 'Rojo', value: 'red', color: 'bg-red-500' },
        { name: 'Azul', value: 'blue', color: 'bg-blue-500' },
        { name: 'Verde', value: 'green', color: 'bg-green-500' },
        { name: 'Amarillo', value: 'yellow', color: 'bg-yellow-400' },
        { name: 'Morado', value: 'purple', color: 'bg-purple-500' },
        { name: 'Naranja', value: 'orange', color: 'bg-orange-500' },
        { name: 'Rosa', value: 'pink', color: 'bg-pink-500' },
        { name: 'Cyan', value: 'cyan', color: 'bg-cyan-500' },
        { name: 'Índigo', value: 'indigo', color: 'bg-indigo-500' },
        { name: 'Lima', value: 'lime', color: 'bg-lime-500' },
        { name: 'Café', value: 'brown', color: 'bg-amber-700' },
        { name: 'Gris', value: 'gray', color: 'bg-gray-500' }
    ];

    const handleChange = (field: string, value: string) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            // Auto-select location if only one option available
            if (field === 'carrier' || field === 'packageSize') {
                const newLocations = getAvailableLocations(newData.carrier, newData.packageSize);
                if (newLocations.length === 1) {
                    newData.location = newLocations[0];
                } else if (!newLocations.includes(newData.location)) {
                    newData.location = ''; // Reset if current selection is invalid
                }
            }

            return newData;
        });

        if (field === 'recipient') {
            if (value.length > 0) {
                const matches = MOCK_USERS.filter(u =>
                    u.name.toLowerCase().includes(value.toLowerCase())
                );
                setSuggestions(matches);

                // Check for exact match
                const exactMatch = MOCK_USERS.find(u => u.name.toLowerCase() === value.toLowerCase());
                if (exactMatch) {
                    setIdentifiedUser(exactMatch);
                    setIsUnknownRecipient(false);
                    // Reset color if it was red due to unknown
                    if (formData.colorLabel === 'red') {
                        setFormData(prev => ({ ...prev, colorLabel: '' }));
                    }
                } else {
                    setIdentifiedUser(null);
                    // If no matches at all and length > 3, consider unknown
                    if (matches.length === 0 && value.length > 3) {
                        setIsUnknownRecipient(true);
                        setFormData(prev => ({ ...prev, colorLabel: 'red' }));
                    } else {
                        setIsUnknownRecipient(false);
                    }
                }
            } else {
                setSuggestions([]);
                setIdentifiedUser(null);
                setIsUnknownRecipient(false);
            }
        }
    };

    const selectRecipient = (user: User) => {
        setFormData(prev => ({ ...prev, recipient: user.name, colorLabel: '' }));
        setIdentifiedUser(user);
        setIsUnknownRecipient(false);
        setSuggestions([]);
    };

    const openCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });
            setStream(mediaStream);
            setShowCamera(true);

            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            }, 100);
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
        }
    };

    const capturePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0);
                const imageData = canvas.toDataURL('image/jpeg');
                setCapturedImage(imageData);
                closeCamera();
            }
        }
    };

    const closeCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setShowCamera(false);
    };

    const retakePhoto = () => {
        setCapturedImage(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newPackage: PackageData = {
            ...formData,
            registeredDate: new Date().toISOString(),
            deliveryDate: '',
            status: 'Not-Delivered'
        };

        const existingPackages = JSON.parse(localStorage.getItem('packages') || '[]');
        localStorage.setItem('packages', JSON.stringify([newPackage, ...existingPackages]));

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

        setFormData({
            carrier: '',
            trackingNumber: '',
            recipient: '',
            packageCategory: '',
            packageSize: '',
            location: '',
            rackNumber: '',
            colorLabel: '',
            registeredBy: '',
        });

        setIdentifiedUser(null);
        setIsUnknownRecipient(false);
        setSuggestions([]);
        setCapturedImage(null);
    };

    return (
        <div className="h-full flex bg-slate-50 dark:bg-slate-900">
            {/* Camera Modal */}
            {showCamera && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                    <div className="relative w-full max-w-4xl">
                        <button
                            onClick={closeCamera}
                            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition z-10"
                        >
                            <X className="h-6 w-6 text-white" />
                        </button>

                        <div className="bg-black rounded-lg overflow-hidden">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-auto"
                            />
                        </div>

                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={capturePhoto}
                                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition"
                            >
                                <Camera className="h-6 w-6" />
                                Capturar Foto
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Left: Form */}
            <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-slate-800">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Registrar Paquete</h1>
                        <p className="text-slate-600 dark:text-slate-400">Captura una foto de referencia o ingresa manualmente</p>
                    </div>

                    {showSuccess && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
                            <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <span className="text-green-800 dark:text-green-200 font-medium">Paquete registrado exitosamente</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Camera Section */}
                        <div className="bg-blue-50 dark:bg-blue-900/30 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold text-blue-900 dark:text-blue-200">Foto de Referencia (Opcional)</h3>
                            </div>

                            {capturedImage ? (
                                <div className="mb-4">
                                    <img
                                        src={capturedImage}
                                        alt="Package label"
                                        className="w-full h-48 object-cover rounded-lg border-2 border-blue-300 dark:border-blue-700"
                                    />
                                    <div className="mt-3 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={retakePhoto}
                                            className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition text-sm font-medium flex items-center justify-center gap-2"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                            Tomar Otra Foto
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                                    Toma una foto del paquete para tener una referencia visual
                                </p>
                            )}

                            <button
                                type="button"
                                onClick={openCamera}
                                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition text-sm font-medium flex items-center gap-2"
                            >
                                <Camera className="h-4 w-4" />
                                {capturedImage ? 'Tomar Otra Foto' : 'Abrir Cámara'}
                            </button>
                        </div>

                        {/* Form Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Paquetería *</label>
                                <select
                                    value={formData.carrier}
                                    onChange={(e) => handleChange('carrier', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    {carriers.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"># de Guía *</label>
                                <input
                                    type="text"
                                    value={formData.trackingNumber}
                                    onChange={(e) => handleChange('trackingNumber', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                                    placeholder="Ej: 1234567890"
                                    required
                                />
                            </div>

                            {/* Recipient Input */}
                            <div className="col-span-2 relative">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Destinatario *</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.recipient}
                                        onChange={(e) => handleChange('recipient', e.target.value)}
                                        className={`w-full px-4 py-2.5 pl-10 border rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${isUnknownRecipient
                                            ? 'border-red-300 focus:ring-red-500'
                                            : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500'
                                            }`}
                                        placeholder="Nombre del destinatario"
                                        required
                                        autoComplete="off"
                                    />
                                    <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                </div>

                                {/* Suggestions Dropdown */}
                                {suggestions.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                                        {suggestions.map(user => (
                                            <button
                                                key={user.id}
                                                type="button"
                                                onClick={() => selectRecipient(user)}
                                                className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between group"
                                            >
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.role}</p>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded-full border ${user.role === 'Student' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' :
                                                    user.role === 'Employee' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' :
                                                        'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800'
                                                    }`}>
                                                    {user.role === 'Student' ? 'Estudiante' :
                                                        user.role === 'Employee' ? 'Empleado' : 'Residente'}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Identified User Badge */}
                                {identifiedUser && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className={`h-2 w-2 rounded-full ${identifiedUser.role === 'Student' ? 'bg-blue-500' :
                                            identifiedUser.role === 'Employee' ? 'bg-purple-500' : 'bg-green-500'
                                            }`} />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {identifiedUser.role === 'Student' ? 'Estudiante Identificado' :
                                                identifiedUser.role === 'Employee' ? 'Empleado Identificado' : 'Residente Identificado'}
                                        </span>
                                    </div>
                                )}

                                {/* Unknown Recipient Warning */}
                                {isUnknownRecipient && (
                                    <div className="mt-3">
                                        <QuarantineInfo />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tipo *</label>
                                <select
                                    value={formData.packageCategory}
                                    onChange={(e) => handleChange('packageCategory', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    {packageCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tamaño *</label>
                                <select
                                    value={formData.packageSize}
                                    onChange={(e) => handleChange('packageSize', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    {packageSizes.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ubicación *</label>
                                <select
                                    value={formData.location}
                                    onChange={(e) => handleChange('location', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    required
                                    disabled={availableLocations.length === 0}
                                >
                                    <option value="">{availableLocations.length === 0 ? 'Selecciona paquetería/tamaño' : 'Seleccionar...'}</option>
                                    {availableLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Estante (Rack) *</label>
                                <select
                                    value={formData.rackNumber}
                                    onChange={(e) => handleChange('rackNumber', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    {rackNumbers.map(r => <option key={r} value={r}>Estante {r}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Registrado por *</label>
                                <input
                                    type="text"
                                    value={formData.registeredBy}
                                    onChange={(e) => handleChange('registeredBy', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                                    placeholder="Nombre del empleado"
                                    required
                                />
                            </div>
                        </div>

                        {/* Color Selector */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Etiqueta de Color (Opcional)</label>
                            <div className="grid grid-cols-6 gap-3">
                                {colorLabels.map(color => {
                                    const isRed = color.value === 'red';
                                    // Disable if unknown recipient (all locked) OR if known user (Red locked)
                                    const isDisabled = isUnknownRecipient || (identifiedUser && isRed);

                                    return (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => !isDisabled && handleChange('colorLabel', color.value)}
                                            disabled={!!isDisabled}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition ${formData.colorLabel === color.value
                                                ? 'border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-700'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <div className={`w-8 h-8 ${color.color} rounded-full flex-shrink-0`} />
                                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center leading-tight">{color.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition font-medium flex items-center justify-center gap-2"
                        >
                            <Plus className="h-5 w-5" />
                            Registrar Paquete
                        </button>
                    </form>
                </div>
            </div>

            {/* Right: Preview/Recent */}
            <div className="w-80 bg-slate-100 dark:bg-slate-800 border-l dark:border-slate-700 p-6 overflow-y-auto">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Vista Previa</h3>

                {capturedImage && (
                    <div className="mb-6 bg-white dark:bg-slate-700 rounded-lg p-3 border dark:border-slate-600">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Foto de Referencia</p>
                        <img
                            src={capturedImage}
                            alt="Package reference"
                            className="w-full h-32 object-cover rounded"
                        />
                    </div>
                )}

                {formData.recipient && (
                    <div className="bg-white dark:bg-slate-700 rounded-lg p-4 border dark:border-slate-600 mb-6 relative overflow-hidden isolate">
                        {/* Watermark Logo */}
                        {formData.carrier && (
                            <div className="absolute inset-0 opacity-[0.25] pointer-events-none z-0 flex items-center justify-end">
                                <CarrierLogo carrier={formData.carrier} className="h-full w-auto object-contain object-right" />
                            </div>
                        )}

                        <div className="flex items-start gap-3 relative z-10">
                            {formData.colorLabel && (
                                <div className={`w-3 h-3 ${colorLabels.find(c => c.value === formData.colorLabel)?.color} rounded-full mt-1 flex-shrink-0`} />
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    {formData.carrier && <CarrierLogo carrier={formData.carrier} className="h-5 w-5 rounded-full bg-white" />}
                                    <p className="font-semibold text-slate-900 dark:text-white truncate">{formData.recipient || 'Sin destinatario'}</p>
                                    {identifiedUser && (
                                        <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full border ${identifiedUser.role === 'Student' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' :
                                            identifiedUser.role === 'Employee' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' :
                                                'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                                            }`}>
                                            {identifiedUser.role === 'Student' ? 'Estudiante' :
                                                identifiedUser.role === 'Employee' ? 'Empleado' : 'Residente'}
                                        </span>
                                    )}
                                    {isUnknownRecipient && (
                                        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 font-bold tracking-wide">
                                            CUARENTENA
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                                    {formData.carrier && <span className="font-medium text-slate-700 dark:text-slate-300">{formData.carrier} • </span>}
                                    {formData.trackingNumber || 'Sin # guía'}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {formData.location && (
                                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded font-medium">
                                            {formData.location}
                                        </span>
                                    )}
                                    {formData.packageCategory && (
                                        <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded font-medium">
                                            {formData.packageCategory}
                                        </span>
                                    )}
                                    {formData.packageSize && (
                                        <span className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded font-medium">
                                            {formData.packageSize}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Últimos Registros</h3>
                <div className="space-y-2">
                    {JSON.parse(localStorage.getItem('packages') || '[]').slice(0, 5).map((pkg: any, i: number) => (
                        <div key={i} className="bg-white dark:bg-slate-700 rounded p-3 text-sm border dark:border-slate-600">
                            <p className="font-medium text-slate-900 dark:text-white truncate">{pkg.recipient}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{pkg.location}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default RegisterPackage;
