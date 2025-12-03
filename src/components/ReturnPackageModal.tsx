import { X, Mail, Send } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ReturnPackageModalProps {
    isOpen: boolean;
    onClose: () => void;
    packageData: {
        trackingNumber: string;
        recipient: string;
        carrier: string;
        registeredDate: string;
    } | null;
}

export function ReturnPackageModal({ isOpen, onClose, packageData }: ReturnPackageModalProps) {
    const [emailBody, setEmailBody] = useState('');
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (packageData) {
            const template = `Estimados ${packageData.carrier},

Por medio de la presente solicitamos la recolección del siguiente paquete que no pertenece a esta institución:

DETALLES DEL PAQUETE:
- No. de Guía: ${packageData.trackingNumber}
- Destinatario: ${packageData.recipient}
- Paquetería: ${packageData.carrier}
- Fecha de Registro: ${new Date(packageData.registeredDate).toLocaleDateString('es-MX')}

RAZÓN DE DEVOLUCIÓN:
El destinatario no forma parte de nuestra institución ni se encuentra en nuestros registros.

HORARIO DE RECOLECCIÓN:
Favor de pasar en el siguiente horario:
- Lunes a Jueves: 9:00am - 12:30pm / 2:30pm - 6:00pm
- Viernes: 9:00am - 12:00pm / 2:30pm - 4:00pm

Dirección: Universidad de Montemorelos (Departamento de Correos)

Quedamos a la espera de su pronta recolección.

Atentamente,
Departamento de Paquetería`;
            setEmailBody(template);
        }
    }, [packageData]);

    if (!isOpen || !packageData) return null;

    const handleSend = () => {
        setIsSending(true);
        // Simulate API call
        setTimeout(() => {
            setIsSending(false);
            onClose();
            // Optional: You could trigger a toast here if you had a toast system
            alert('Correo de devolución enviado exitosamente');
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">Automatizar Devolución</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Enviar notificación al destinatario</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Asunto
                        </label>
                        <input
                            type="text"
                            value={`AVISO DE DEVOLUCIÓN - Paquete ${packageData.trackingNumber}`}
                            readOnly
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Mensaje
                        </label>
                        <textarea
                            value={emailBody}
                            onChange={(e) => setEmailBody(e.target.value)}
                            rows={8}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={isSending}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSending ? (
                            <>Enviando...</>
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                Enviar Notificación
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
