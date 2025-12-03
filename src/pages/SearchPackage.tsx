import { useState, useEffect } from 'react';
import { Clock, CheckCircle, Calendar, Package as PackageIcon, ChevronRight, XCircle, Search, RotateCcw } from 'lucide-react';
import { CarrierLogo } from '../components/CarrierLogo';
import { SignatureModal } from '../components/SignatureModal';
import { QuarantineInfo } from '../components/QuarantineInfo';
import { ReturnPackageModal } from '../components/ReturnPackageModal';

interface PackageData {
    carrier: string;
    trackingNumber: string;
    recipient: string;
    packageCategory: string;
    packageSize: string;
    location: string;
    rackNumber?: string;
    colorLabel: string;
    registeredBy: string;
    registeredDate: string;
    deliveryDate: string;
    status: 'Delivered' | 'Not-Delivered' | 'Dead';
    signature?: string;
}

type FilterStatus = 'Not-Delivered' | 'Delivered' | 'Dead' | 'Todos';

export default function SearchPackage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [allPackages, setAllPackages] = useState<PackageData[]>([]);
    const [filteredPackages, setFilteredPackages] = useState<PackageData[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<PackageData | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterStatus>('Not-Delivered');
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);

    const colorMap: Record<string, string> = {
        red: 'bg-red-500',
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        yellow: 'bg-yellow-400',
        purple: 'bg-purple-500',
        orange: 'bg-orange-500',
        pink: 'bg-pink-500'
    };

    useEffect(() => {
        loadPackages();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [activeFilter, searchTerm, allPackages]);

    const isPackageDead = (pkg: PackageData): boolean => {
        if (pkg.status === 'Delivered') return false;
        const registeredDate = new Date(pkg.registeredDate);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - registeredDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff >= 30;
    };

    const loadPackages = () => {
        const savedPackages: PackageData[] = JSON.parse(localStorage.getItem('packages') || '[]');
        const updatedPackages = savedPackages.map(pkg => {
            if (pkg.status === 'Not-Delivered' && isPackageDead(pkg)) {
                return { ...pkg, status: 'Dead' as const };
            }
            return pkg;
        });

        if (JSON.stringify(updatedPackages) !== JSON.stringify(savedPackages)) {
            localStorage.setItem('packages', JSON.stringify(updatedPackages));
        }

        setAllPackages(updatedPackages);
    };

    const applyFilters = () => {
        let filtered = allPackages;

        if (activeFilter !== 'Todos') {
            filtered = filtered.filter(pkg => pkg.status === activeFilter);
        }

        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(pkg =>
                pkg.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pkg.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pkg.carrier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pkg.location.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredPackages(filtered);
    };

    const handleDelivery = () => {
        if (!selectedPackage) return;
        setShowSignatureModal(true);
    };

    const handleConfirmDelivery = (signature: string) => {
        if (!selectedPackage) return;

        const updatedPackages = allPackages.map(pkg => {
            if (pkg.trackingNumber === selectedPackage.trackingNumber) {
                return {
                    ...pkg,
                    status: 'Delivered' as const,
                    deliveryDate: new Date().toISOString(),
                    signature
                };
            }
            return pkg;
        });

        localStorage.setItem('packages', JSON.stringify(updatedPackages));
        loadPackages();
        setSelectedPackage(null);
        setShowSignatureModal(false);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            // Try parsing as ISO first
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toLocaleString('es-MX');
            }
            // Fallback for legacy format (if it's already a locale string)
            return dateString;
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="h-full flex bg-slate-50 dark:bg-slate-900">
            <SignatureModal
                isOpen={showSignatureModal}
                onClose={() => setShowSignatureModal(false)}
                onConfirm={handleConfirmDelivery}
            />

            <ReturnPackageModal
                isOpen={showReturnModal}
                onClose={() => setShowReturnModal(false)}
                packageData={selectedPackage}
            />

            {/* Left: Search & Results */}
            <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-slate-800">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Buscar Paquete</h1>
                        <p className="text-slate-600 dark:text-slate-400">Encuentra paquetes por destinatario o ubicación</p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por guía, nombre o ubicación..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                        {['Todos', 'Pendientes', 'Entregados', 'Archivo Muerto'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => {
                                    if (filter === 'Todos') setActiveFilter('Todos');
                                    else if (filter === 'Pendientes') setActiveFilter('Not-Delivered');
                                    else if (filter === 'Entregados') setActiveFilter('Delivered');
                                    else if (filter === 'Archivo Muerto') setActiveFilter('Dead');
                                }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${(activeFilter === 'Todos' && filter === 'Todos') ||
                                    (activeFilter === 'Not-Delivered' && filter === 'Pendientes') ||
                                    (activeFilter === 'Delivered' && filter === 'Entregados') ||
                                    (activeFilter === 'Dead' && filter === 'Archivo Muerto')
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-900/20'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-transparent hover:bg-slate-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        {filteredPackages.length} paquete{filteredPackages.length !== 1 ? 's' : ''} encontrado{filteredPackages.length !== 1 ? 's' : ''}
                    </p>

                    {/* Package List */}
                    <div className="space-y-3">
                        {filteredPackages.map((pkg, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedPackage(pkg)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition ${selectedPackage?.trackingNumber === pkg.trackingNumber
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-700/30'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-3 h-3 ${colorMap[pkg.colorLabel]} rounded-full flex-shrink-0`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <CarrierLogo carrier={pkg.carrier} className="h-5 w-5" />
                                            <p className="font-semibold text-slate-900 dark:text-white truncate text-lg">{pkg.recipient}</p>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                                            <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs font-medium">{pkg.location}</span>
                                            <span>•</span>
                                            <span>{pkg.carrier}</span>
                                            <span>•</span>
                                            <span>{pkg.trackingNumber}</span>
                                        </div>
                                    </div>
                                    <ChevronRight className={`h-5 w-5 flex-shrink-0 ${selectedPackage?.trackingNumber === pkg.trackingNumber
                                        ? 'text-blue-600'
                                        : 'text-slate-400'
                                        }`} />
                                </div>
                            </button>
                        ))}

                        {filteredPackages.length === 0 && (
                            <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                                <PackageIcon className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-500 dark:text-slate-400">No se encontraron paquetes</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right: Details Panel */}
            <div className="w-80 bg-slate-100 dark:bg-slate-800 border-l dark:border-slate-700 p-6 overflow-y-auto">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                    {selectedPackage ? 'Detalles del Paquete' : 'Vista Previa'}
                </h3>

                {selectedPackage ? (
                    <div className="space-y-4">
                        {/* Quarantine Info Panel */}
                        {(selectedPackage.status === 'Dead' || selectedPackage.colorLabel === 'red') && (
                            <div className="space-y-3">
                                <QuarantineInfo />
                                <button
                                    onClick={() => setShowReturnModal(true)}
                                    className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Automatizar Devolución
                                </button>
                            </div>
                        )}                   {/* Main Info Card (Matching Register Style) */}
                        <div className="bg-white dark:bg-slate-700 rounded-lg p-4 border dark:border-slate-600 relative overflow-hidden isolate shadow-sm">
                            {/* Status Indicator */}
                            <div className="absolute top-4 right-4 z-20">
                                {selectedPackage.status === 'Delivered' && (
                                    <div className="bg-green-100 dark:bg-green-900/50 p-1.5 rounded-full">
                                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                )}
                                {selectedPackage.status === 'Not-Delivered' && (
                                    <div className="bg-orange-100 dark:bg-orange-900/50 p-1.5 rounded-full">
                                        <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                )}
                                {selectedPackage.status === 'Dead' && (
                                    <div className="bg-red-100 dark:bg-red-900/50 p-1.5 rounded-full">
                                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    </div>
                                )}
                            </div>

                            {/* Watermark Logo */}
                            <div className="absolute inset-0 opacity-[0.25] pointer-events-none z-0 flex items-center justify-end">
                                <CarrierLogo carrier={selectedPackage.carrier} className="h-full w-auto object-contain object-right" />
                            </div>

                            <div className="flex items-start gap-3 relative z-10">
                                <div className={`w-3 h-3 ${colorMap[selectedPackage.colorLabel]} rounded-full mt-1 flex-shrink-0`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CarrierLogo carrier={selectedPackage.carrier} className="h-5 w-5 rounded-full bg-white" />
                                        <p className="font-semibold text-slate-900 dark:text-white truncate">{selectedPackage.recipient}</p>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{selectedPackage.carrier} • </span>
                                        {selectedPackage.trackingNumber}
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded font-medium">
                                            {selectedPackage.location}
                                        </span>
                                        {selectedPackage.rackNumber && (
                                            <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded font-medium">
                                                Rack {selectedPackage.rackNumber}
                                            </span>
                                        )}
                                        <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded font-medium">
                                            {selectedPackage.packageCategory}
                                        </span>
                                        <span className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded font-medium">
                                            {selectedPackage.packageSize}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dates & Actions */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border dark:border-slate-700 space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs">Registrado</p>
                                    <p className="font-medium text-slate-700 dark:text-slate-300">{formatDate(selectedPackage.registeredDate)}</p>
                                </div>
                            </div>
                            {selectedPackage.deliveryDate && (
                                <div className="flex items-center gap-3 text-sm">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <div>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs">Entregado</p>
                                        <p className="font-medium text-slate-700 dark:text-slate-300">{formatDate(selectedPackage.deliveryDate)}</p>
                                    </div>
                                </div>
                            )}

                            {selectedPackage.signature && (
                                <div className="pt-2 border-t dark:border-slate-700">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Firma de Recibido</p>
                                    <img
                                        src={selectedPackage.signature}
                                        alt="Firma"
                                        className="h-16 w-auto object-contain border border-slate-200 dark:border-slate-600 rounded bg-white"
                                    />
                                </div>
                            )}

                            <div className="pt-2 border-t dark:border-slate-700">
                                <p className="text-xs text-slate-400">Registrado por: <span className="text-slate-600 dark:text-slate-300">{selectedPackage.registeredBy}</span></p>
                            </div>
                        </div>

                        {/* Actions */}
                        {selectedPackage.status === 'Not-Delivered' && (
                            <button
                                onClick={handleDelivery}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                            >
                                <CheckCircle className="h-5 w-5" />
                                Marcar como Entregado
                            </button>
                        )}

                        {selectedPackage.status === 'Dead' && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-sm text-red-800 dark:text-red-200">
                                    <strong>Archivo Muerto:</strong> Este paquete lleva más de 30 días sin reclamar.
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <PackageIcon className="h-16 w-16 mb-4 opacity-20" />
                        <p>Selecciona un paquete para ver detalles</p>
                    </div>
                )}
            </div>
        </div>
    );
}


