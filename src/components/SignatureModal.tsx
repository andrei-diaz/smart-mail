import { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { X, Eraser, Check } from 'lucide-react';

interface SignatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (signatureData: string) => void;
}

export function SignatureModal({ isOpen, onClose, onConfirm }: SignatureModalProps) {
    const sigCanvas = useRef<SignatureCanvas>(null);

    if (!isOpen) return null;

    const clear = () => {
        sigCanvas.current?.clear();
    };

    const confirm = () => {
        if (sigCanvas.current) {
            if (sigCanvas.current.isEmpty()) {
                alert('Por favor, firme antes de confirmar.');
                return;
            }
            const signatureData = sigCanvas.current.toDataURL('image/png');
            onConfirm(signatureData);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden border dark:border-slate-700">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Firma de Recibido
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Canvas Area */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50">
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg bg-white overflow-hidden">
                        <SignatureCanvas
                            ref={sigCanvas}
                            penColor="black"
                            canvasProps={{
                                className: 'w-full h-64 cursor-crosshair',
                            }}
                            backgroundColor="transparent"
                        />
                    </div>
                    <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">
                        Firme dentro del recuadro
                    </p>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t dark:border-slate-700 flex gap-3">
                    <button
                        onClick={clear}
                        className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition flex items-center justify-center gap-2"
                    >
                        <Eraser className="h-4 w-4" />
                        Limpiar
                    </button>
                    <button
                        onClick={confirm}
                        className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                        <Check className="h-4 w-4" />
                        Confirmar Entrega
                    </button>
                </div>
            </div>
        </div>
    );
}
