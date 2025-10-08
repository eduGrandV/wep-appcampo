
export const BarraProgresso = ({ percentual = 0, titulo }: { percentual?: number; titulo: string }) => {
    let cor = "bg-green-500";
    if (percentual >= 5) cor = "bg-red-500";
    else if (percentual >= 4) cor = "bg-yellow-400";
    return (
        <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-300">{titulo}</span>
                <span className="text-sm font-semibold text-white">{percentual.toFixed(2)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden border border-gray-700">
                <div className={`${cor} h-4 transition-all duration-500 rounded-full`} style={{ width: `${Math.min(percentual, 100)}%` }} />
            </div>
        </div>
    );
};
export const DisplayContagem = ({ contagem = 0, titulo }: { contagem?: number; titulo: string }) => (
    <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 text-center shadow-md">
        <p className="text-sm text-blue-300 mb-2">{titulo}</p>
        <p className="text-4xl font-extrabold text-white">{contagem}</p>
        <p className="text-xs text-gray-400 mt-1">registros com presença</p>
    </div>
);