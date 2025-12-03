import { MapPin, AlertTriangle, Phone, Clock } from 'lucide-react';

export function QuarantineInfo() {
    return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                    <h3 className="font-semibold text-red-900 dark:text-red-200">Paquete No Autorizado</h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        Este paquete ha sido retenido por no tener un destinatario registrado válido.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-2 pt-3 border-t border-red-200 dark:border-red-800/50">
                {/* Address */}
                <div className="flex gap-3">
                    <MapPin className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Dirección de Entrega</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 break-words">Universidad de Montemorelos</p>
                    </div>
                </div>

                {/* Contact */}
                <div className="flex gap-3">
                    <Phone className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Departamento de Correos</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 break-words">Contactar a administración</p>
                    </div>
                </div>

                {/* Hours */}
                <div className="flex gap-3">
                    <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
                    <div className="w-full min-w-0">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Horario de Atención</p>
                        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                                <span className="font-medium text-xs uppercase tracking-wide text-slate-500">Lun - Jue</span>
                                <span className="text-right">9:00am - 12:30pm<br />2:30pm - 6:00pm</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-t border-red-200/50 dark:border-red-800/30 pt-2">
                                <span className="font-medium text-xs uppercase tracking-wide text-slate-500">Viernes</span>
                                <span className="text-right">9:00am - 12:00pm<br />2:30pm - 4:00pm</span>
                            </div>
                            <div className="flex justify-between pt-1">
                                <span className="font-medium text-xs uppercase tracking-wide text-slate-400">Sáb - Dom</span>
                                <span className="text-slate-400 dark:text-slate-500">Cerrado</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
