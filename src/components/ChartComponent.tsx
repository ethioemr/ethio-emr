export default function ChartComponent() {
  return (
    <div className="h-64 bg-gray-50 rounded-lg flex items-end justify-center gap-2 p-4">
      <div className="flex-1 bg-blue-500 h-1/3 rounded-t"></div>
      <div className="flex-1 bg-emerald-500 h-2/3 rounded-t"></div>
      <div className="flex-1 bg-orange-500 h-1/2 rounded-t"></div>
    </div>
  );
}
