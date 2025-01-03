import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface RelevancyChartProps {
  data: {
    modelName: string;
    responseHistory: {
      timestamp: string;
      relevancy: number;
    }[];
  }[];
}

export default function RelevancyChart({ data }: RelevancyChartProps) {
  const chartData = data.flatMap((model) =>
    model.responseHistory.map((history) => ({
      modelName: model.modelName,
      timestamp: format(new Date(history.timestamp), "MM/dd HH:mm"),
      relevancy: history.relevancy,
    }))
  );

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" angle={-45} textAnchor="end" height={60} />
        <YAxis domain={[0, 100]} />
        <Tooltip
          formatter={(value) => [
            typeof value === "number" ? `${value.toFixed(2)}%` : value,
            "Relevancy",
          ]}
        />
        <Legend />
        {data.map((model, index) => (
          <Line
            key={model.modelName}
            type="monotone"
            dataKey="relevancy"
            data={chartData.filter((d) => d.modelName === model.modelName)}
            name={model.modelName}
            stroke={`hsl(${index * 120}, 70%, 50%)`}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
