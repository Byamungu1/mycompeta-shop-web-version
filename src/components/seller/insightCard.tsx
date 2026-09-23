
interface OrderData {
  date: string;
  status: string;
  total: string;
  unique_identifier: string;
}

export const InsightCard = ({
    icon, label, value, sub, accent, orderData, uniqueUi=false
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub: string;
    accent: string;
    uniqueUi?: boolean;
    orderData?: OrderData;
}) => (
   <div className="flex-1 bg-sand-200 rounded-sm p-3" style={{ gap: 8 }}>
      {/* Icon Wrapper */}
      <div className={`w-8 h-8 rounded-xl items-center justify-center ${accent}`}>
        {icon}
      </div>

      {/* Content Area */}
      <div style={{ gap: 2 }}>
        <p className="font-jakarta text-xs text-sand-700">{label}</p>
        <p className="font-jakarta-bold text-sm text-sand-900" numberOfLines={1}>
          {value}
        </p>

        {/* Conditional UI Rendering */}
        {uniqueUi && orderData ? (
          <div className="mt-1 pt-1.5 border-t flex flex-col border-sand-300" style={{ gap: 4 }}>
            {/* Order Identifier & Total */}
            <div className="flex-col justify-between items-start">
              <p className="font-jakarta-bold text-[10px] text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">
                {orderData.unique_identifier}
              </p>
              <p className="font-jakarta-bold text-xs text-sand-900">
                KES {parseFloat(orderData.total).toLocaleString()}
              </p>
            </div>

            {/* Order Date & Status Badge */}
            <div className="flex-row justify-between items-center">
              <p className="font-jakarta text-[10px] text-sand-600">
                {orderData.date.split(' ')[0]} {/* Splitting to show just the date */}
              </p>
            </div>
          </div>
        ) : (
          // Default fallback subtext UI
          <p className="font-jakarta text-xs text-sand-600">{sub}</p>
        )}
      </div>
    </div>
);